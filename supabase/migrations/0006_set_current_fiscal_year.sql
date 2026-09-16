-- ============================================================
-- 0006: Atomic "set current fiscal year" swap
--
-- Problem: `budget_fiscal_years.is_current` is guarded by a partial
-- unique index (`one_current_year`, see 0001_init.sql) so at most one
-- row can ever have is_current = true. But flipping which year is
-- current is naturally a TWO-row update (old current -> false, new
-- current -> true). Done as two separate client calls, a dropped
-- connection between them can leave zero years marked current, or
-- (worse, if done new-then-old) briefly violate the unique index and
-- surface a raw constraint-violation error to the admin instead of
-- the intended "switch" action.
--
-- Fix: same pattern as 0003's save_campus_life_section — one plpgsql
-- function, one implicit transaction, ordered so the unique index is
-- never at risk of holding two true rows at once (unset everything
-- else first, then set the target).
--
-- SECURITY INVOKER (the default): runs as the calling user, so the
-- existing "Admin write" RLS policy on budget_fiscal_years is still
-- the thing deciding who may call this successfully. This function
-- grants no new access — it only makes the existing access atomic.
-- ============================================================

create or replace function set_current_fiscal_year(p_fiscal_year_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_fiscal_year_id is null then
    raise exception 'p_fiscal_year_id is required';
  end if;

  -- Unset any other current year first so the partial unique index
  -- is never asked to hold two true rows at the same time.
  update budget_fiscal_years
  set is_current = false
  where is_current = true
    and id <> p_fiscal_year_id;

  update budget_fiscal_years
  set is_current = true
  where id = p_fiscal_year_id;

  if not found then
    raise exception 'budget_fiscal_years row % not found (or not visible under RLS)', p_fiscal_year_id;
  end if;
end;
$$;

revoke all on function set_current_fiscal_year(uuid) from public;
grant execute on function set_current_fiscal_year(uuid) to authenticated;
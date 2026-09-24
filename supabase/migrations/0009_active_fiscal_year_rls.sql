-- ============================================================
-- 0009: Active fiscal-year invariant and child-table RLS
--
-- Verified schema relationships from 0001_init.sql:
--   budget_categories.fiscal_year_id -> budget_fiscal_years.id
--   budget_accomplishments.fiscal_year_id -> budget_fiscal_years.id
-- Existing child policies being replaced:
--   "Admin write, non-archived years only"
-- on both budget_categories and budget_accomplishments.
-- ============================================================

-- Surface existing data problems before the unique index is created.
-- This intentionally raises instead of choosing which active row to keep.
do $$
declare
  active_count integer;
begin
  select count(*) into active_count
  from budget_fiscal_years
  where status = 'active';

  if active_count > 1 then
    raise exception 'Data issue: % fiscal years already have status = active. Resolve this before applying 0009.', active_count;
  end if;
end;
$$;

-- Keep legacy draft/published rows readable while introducing active as
-- the only status permitted to receive child-table writes. New fiscal
-- years created by the RPC below are active immediately.
alter table budget_fiscal_years
drop constraint if exists budget_fiscal_years_status_check;

alter table budget_fiscal_years
add constraint budget_fiscal_years_status_check
check (status in ('draft', 'published', 'active', 'archived'));

create unique index if not exists one_active_fiscal_year
  on budget_fiscal_years (status)
  where status = 'active';

-- Replace the exact existing policies with active-year checks. The
-- foreign-key relationship is validated by fiscal_year_id referencing
-- budget_fiscal_years(id), and this subquery owns the status decision.
drop policy if exists "Admin write, non-archived years only" on budget_categories;
drop policy if exists "Admin write, non-archived years only" on budget_accomplishments;

create policy "Admin write, non-archived years only" on budget_categories
  for all to authenticated
  using (
    exists (select 1 from admin_users where user_id = auth.uid())
    and exists (
      select 1
      from budget_fiscal_years
      where budget_fiscal_years.id = budget_categories.fiscal_year_id
        and budget_fiscal_years.status = 'active'
    )
  )
  with check (
    exists (select 1 from admin_users where user_id = auth.uid())
    and exists (
      select 1
      from budget_fiscal_years
      where budget_fiscal_years.id = budget_categories.fiscal_year_id
        and budget_fiscal_years.status = 'active'
    )
  );

create policy "Admin write, non-archived years only" on budget_accomplishments
  for all to authenticated
  using (
    exists (select 1 from admin_users where user_id = auth.uid())
    and exists (
      select 1
      from budget_fiscal_years
      where budget_fiscal_years.id = budget_accomplishments.fiscal_year_id
        and budget_fiscal_years.status = 'active'
    )
  )
  with check (
    exists (select 1 from admin_users where user_id = auth.uid())
    and exists (
      select 1
      from budget_fiscal_years
      where budget_fiscal_years.id = budget_accomplishments.fiscal_year_id
        and budget_fiscal_years.status = 'active'
    )
  );

-- Activation is ordered old-active first, then target-active, so the
-- unique partial index is never violated. This is one transaction.
create or replace function public.set_current_fiscal_year(p_fiscal_year_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_fiscal_year_id is null then
    raise exception 'p_fiscal_year_id is required';
  end if;

  update budget_fiscal_years
  set status = 'archived', is_current = false
  where (status = 'active' or is_current = true)
    and id <> p_fiscal_year_id;

  update budget_fiscal_years
  set status = 'active', is_current = true
  where id = p_fiscal_year_id;

  if not found then
    raise exception 'budget_fiscal_years row % not found (or not visible under RLS)', p_fiscal_year_id;
  end if;
end;
$$;

revoke all on function public.set_current_fiscal_year(uuid) from public;
grant execute on function public.set_current_fiscal_year(uuid) to authenticated;

-- The create flow also establishes the invariant atomically: the new year
-- becomes active and the previous active/current year becomes archived.
create or replace function public.create_fiscal_year(p_year_label text)
returns budget_fiscal_years
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_year budget_fiscal_years;
begin
  if p_year_label is null or trim(p_year_label) = '' then
    raise exception 'year_label is required';
  end if;

  update budget_fiscal_years
  set status = 'archived', is_current = false
  where status = 'active' or is_current = true;

  insert into budget_fiscal_years (year_label, total_proposed_budget, status, is_current)
  values (trim(p_year_label), 0, 'active', true)
  returning * into new_year;

  return new_year;
end;
$$;

revoke all on function public.create_fiscal_year(text) from public;
grant execute on function public.create_fiscal_year(text) to authenticated;

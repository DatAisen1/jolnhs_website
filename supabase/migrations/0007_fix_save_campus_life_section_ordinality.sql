-- ============================================================
-- 0007: Fix save_campus_life_section — broken ->> on ordinality alias
--
-- Bug found by the P3.4 test (supabase/tests/atomic_save_rollback.test.sql):
-- `from jsonb_array_elements(p_stats) with ordinality as item` gives
-- the FROM item TWO columns (the jsonb value and the ordinality
-- bigint). Aliasing it as a single name with no column list ("as
-- item", not "as item(value, ord)") makes `item` refer to the whole
-- two-column ROW, not the jsonb value alone. So `item ->> 'label'`
-- was never selecting a JSON field — it was applying `->>` to a
-- `record`, which has no such operator:
--
--   ERROR: operator does not exist: record ->> unknown
--
-- Net effect: 0003's function raised on every call where p_stats or
-- p_highlights was non-empty — i.e. on every normal save. The one
-- thing it got right by accident: because the raise happens inside
-- the same function-body transaction as the update, delete, and
-- insert before it, that failure DID roll back cleanly. The atomicity
-- guarantee held; the feature just never worked. This is exactly the
-- gap zero test coverage leaves — "atomic" and "correct" are
-- different claims, and only one of them was ever manually checked.
--
-- Fix: give the ordinality alias explicit column names, so `item`
-- binds to just the jsonb element again.
-- ============================================================

create or replace function save_campus_life_section(
  p_section_id  uuid,
  p_eyebrow     text,
  p_name        text,
  p_tagline     text,
  p_description text,
  p_stats       jsonb,  -- [{ "label": string, "value": string }, ...]
  p_highlights  jsonb   -- [{ "title": string, "description": string }, ...]
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_section_id is null then
    raise exception 'p_section_id is required';
  end if;
  if jsonb_typeof(p_stats) is distinct from 'array' then
    raise exception 'p_stats must be a JSON array';
  end if;
  if jsonb_typeof(p_highlights) is distinct from 'array' then
    raise exception 'p_highlights must be a JSON array';
  end if;

  update campus_life_sections
  set
    eyebrow     = p_eyebrow,
    name        = p_name,
    tagline     = p_tagline,
    description = p_description,
    updated_at  = now()
  where id = p_section_id;

  if not found then
    raise exception 'campus_life_sections row % not found (or not visible under RLS)', p_section_id;
  end if;

  delete from campus_life_stats where section_id = p_section_id;

  insert into campus_life_stats (section_id, label, value, sort_order)
  select
    p_section_id,
    item ->> 'label',
    item ->> 'value',
    (ordinality - 1)::int
  -- Explicit column list (item, ordinality) is the fix — see header.
  from jsonb_array_elements(p_stats) with ordinality as t(item, ordinality);

  delete from campus_life_highlights where section_id = p_section_id;

  insert into campus_life_highlights (section_id, title, description, sort_order)
  select
    p_section_id,
    item ->> 'title',
    item ->> 'description',
    (ordinality - 1)::int
  from jsonb_array_elements(p_highlights) with ordinality as t(item, ordinality);
end;
$$;

-- Privileges are unaffected by create-or-replace, but re-asserting
-- them here costs nothing and keeps this migration fully self
-- contained if it's ever read in isolation.
revoke all on function save_campus_life_section(uuid, text, text, text, text, jsonb, jsonb) from public;
grant execute on function save_campus_life_section(uuid, text, text, text, text, jsonb, jsonb) to authenticated;
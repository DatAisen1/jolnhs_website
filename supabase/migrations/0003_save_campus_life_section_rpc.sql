-- ============================================================
-- 0003: Atomic save for a Campus Life section
--
-- Problem: the app previously did `delete stats -> insert stats ->
-- delete highlights -> insert highlights` as four separate network
-- calls from the client. If any call after the first delete failed
-- (network drop, RLS rejection, validation error), the section was
-- left with data permanently gone and nothing re-inserted.
--
-- Fix: move the whole operation into a single plpgsql function.
-- A function body is one implicit transaction — if any statement
-- raises, Postgres rolls back everything in the function, including
-- earlier deletes. The client now makes ONE rpc() call instead of
-- five separate ones, and it's all-or-nothing.
--
-- Runs as SECURITY INVOKER (the default) — NOT SECURITY DEFINER.
-- That matters: it means every statement inside still runs as the
-- calling user, so the existing "Admin write" RLS policies on
-- campus_life_sections / _stats / _highlights are still enforced
-- exactly as before. This function does not grant any new access —
-- it only makes the existing access atomic.
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
  -- Basic shape guards. RLS still governs *who* can call this;
  -- these just fail fast on obviously malformed input rather than
  -- letting a bad payload insert garbage rows.
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

  -- Replace-all for stats. Deliberately simple for a handful of
  -- rows edited by one admin at a time — see architecture notes in
  -- campusLife.ts. Now safe because it's inside one transaction.
  delete from campus_life_stats where section_id = p_section_id;

  insert into campus_life_stats (section_id, label, value, sort_order)
  select
    p_section_id,
    item ->> 'label',
    item ->> 'value',
    (ordinality - 1)::int
  from jsonb_array_elements(p_stats) with ordinality as item;

  -- Replace-all for highlights, same pattern.
  delete from campus_life_highlights where section_id = p_section_id;

  insert into campus_life_highlights (section_id, title, description, sort_order)
  select
    p_section_id,
    item ->> 'title',
    item ->> 'description',
    (ordinality - 1)::int
  from jsonb_array_elements(p_highlights) with ordinality as item;
end;
$$;

-- Lock the function down the same way every table already is:
-- only authenticated users may even attempt to call it. Whether the
-- call actually succeeds still depends on the RLS policies above
-- (i.e. being in admin_users) — this is a second, cheap gate on top.
revoke all on function save_campus_life_section(uuid, text, text, text, text, jsonb, jsonb) from public;
grant execute on function save_campus_life_section(uuid, text, text, text, text, jsonb, jsonb) to authenticated;
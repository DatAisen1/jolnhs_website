-- ============================================================
-- 0016: Images on "What We Do" highlights
--
-- Each campus_life_highlights row may now carry one gallery-bucket
-- photo (image_path, raw storage path — never a resolved URL). The
-- public pages resolve it to a URL at render time, same convention
-- as group covers and officer photos.
--
-- Two parts:
--   1. the column itself
--   2. save_campus_life_section rewritten so the atomic "delete +
--      re-insert highlights" save keeps the path — without this,
--      every section save would silently blank all highlight images.
--
-- Older clients that send highlights without "imagePath" keys still
-- work: `item ->> 'imagePath'` returns NULL for a missing key, and
-- the column is nullable.
-- ============================================================

alter table campus_life_highlights
  add column if not exists image_path text;

create or replace function save_campus_life_section(
  p_section_id  uuid,
  p_eyebrow     text,
  p_name        text,
  p_tagline     text,
  p_description text,
  p_stats       jsonb,  -- [{ "label": string, "value": string }, ...]
  p_highlights  jsonb   -- [{ "title": string, "description": string, "imagePath"?: string }, ...]
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
  from jsonb_array_elements(p_stats) with ordinality as t(item, ordinality);

  delete from campus_life_highlights where section_id = p_section_id;

  -- nullif() keeps the column NULL rather than storing '' when the
  -- admin row has no photo — a stray empty string would resolve to
  -- a broken image URL downstream.
  insert into campus_life_highlights (section_id, title, description, image_path, sort_order)
  select
    p_section_id,
    item ->> 'title',
    item ->> 'description',
    nullif(item ->> 'imagePath', ''),
    (ordinality - 1)::int
  from jsonb_array_elements(p_highlights) with ordinality as t(item, ordinality);
end;
$$;

revoke all on function save_campus_life_section(uuid, text, text, text, text, jsonb, jsonb) from public;
grant execute on function save_campus_life_section(uuid, text, text, text, text, jsonb, jsonb) to authenticated;

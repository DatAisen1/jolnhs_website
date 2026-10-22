-- ============================================================
-- 0015: Campus Life groups — organizations, sports, publications
--
-- Adds a Section -> Group -> Members/Photos layer on top of the
-- existing campus_life_sections rows:
--   organizations -> groups are student orgs (SSLG, clubs…)
--   athletes      -> groups are sports (Basketball, Volleyball…)
--   journalists   -> groups are publications/desks (paper, broadcast…)
--   pta           -> untouched, keeps using campus_life_officers
--
-- One generic structure covers all three sections; the per-section
-- wording ("organization" vs "sport" vs "publication") lives in the
-- frontend config, not the schema.
--
-- Requires 0013 (the `gallery` storage bucket) to have run first.
-- Paste this file into the Supabase SQL editor.
-- ============================================================

-- ------------------------------------------------------------
-- campus_life_groups — one organization / sport / publication.
-- cover_image_path lives in the `gallery` bucket under
-- `groups/<group_id>/…` (public-read / admin-write already, 0013).
-- ------------------------------------------------------------
create table campus_life_groups (
  id               uuid primary key default gen_random_uuid(),
  section_id       uuid not null references campus_life_sections(id) on delete cascade,
  slug             text not null,
  name             text not null,
  description      text,
  cover_image_path text,
  sort_order       int not null default 0,
  is_archived      boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (section_id, slug)
);

alter table campus_life_groups enable row level security;

create policy "Public read campus life groups"
on campus_life_groups for select
using (is_archived = false);

create policy "Admin manage campus life groups"
on campus_life_groups for all to authenticated
using (exists (select 1 from admin_users where user_id = auth.uid()))
with check (exists (select 1 from admin_users where user_id = auth.uid()));

create index idx_campus_life_groups_section
on campus_life_groups (section_id, sort_order);

-- ------------------------------------------------------------
-- campus_life_group_members — people assigned to one group.
--
-- `role` is the generic member kind; `position` is the free-text
-- label shown publicly ("President", "Point Guard", "Editor-in-Chief").
-- The frontend decides which roles each section offers.
--
-- Data Privacy: athletes are minors, so the public site shows
-- players as name + position only. That rule is enforced HERE,
-- not just in the UI — a player row can never carry a photo_path
-- even if someone bypasses the admin frontend.
-- ------------------------------------------------------------
create table campus_life_group_members (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references campus_life_groups(id) on delete cascade,
  name        text not null,
  role        text not null
              check (role in ('adviser','officer','coach','player','staff')),
  position    text,
  photo_path  text,                 -- staff-photos bucket, same as officers
  sort_order  int not null default 0,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (role <> 'player' or photo_path is null)
);

alter table campus_life_group_members enable row level security;

-- Public members are readable only while their parent group is not
-- archived (archiving a group must hide its roster too).
create policy "Public read group members"
on campus_life_group_members for select
using (
  is_archived = false
  and exists (
    select 1 from campus_life_groups g
    where g.id = group_id and g.is_archived = false
  )
);

create policy "Admin manage group members"
on campus_life_group_members for all to authenticated
using (exists (select 1 from admin_users where user_id = auth.uid()))
with check (exists (select 1 from admin_users where user_id = auth.uid()));

create index idx_group_members_group
on campus_life_group_members (group_id, sort_order);

-- ------------------------------------------------------------
-- campus_life_group_photos — per-group photo strip (team photo,
-- org activities, press-con shots). Files live in the `gallery`
-- bucket created in 0013 under `groups/<group_id>/…`.
-- ------------------------------------------------------------
create table campus_life_group_photos (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references campus_life_groups(id) on delete cascade,
  storage_path text not null,
  caption      text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

alter table campus_life_group_photos enable row level security;

create policy "Public read group photos"
on campus_life_group_photos for select
using (
  exists (
    select 1 from campus_life_groups g
    where g.id = group_id and g.is_archived = false
  )
);

create policy "Admin manage group photos"
on campus_life_group_photos for all to authenticated
using (exists (select 1 from admin_users where user_id = auth.uid()))
with check (exists (select 1 from admin_users where user_id = auth.uid()));

create index idx_group_photos_group
on campus_life_group_photos (group_id, sort_order);

-- ------------------------------------------------------------
-- Move the existing SSLG officers (entered before groups existed)
-- into a real "Supreme Secondary Learner Government" organization.
-- The source rows in campus_life_officers are ARCHIVED, not deleted
-- — the move can be undone by restoring them and removing the group.
-- Wrapped in a DO block so re-running the whole file is a no-op.
-- ------------------------------------------------------------
do $$
declare
  v_section_id uuid;
  v_group_id   uuid;
begin
  select id into v_section_id
  from campus_life_sections
  where slug = 'organizations';

  if v_section_id is null then
    return; -- section missing; nothing to migrate
  end if;

  insert into campus_life_groups (section_id, slug, name, description, sort_order)
  select
    v_section_id,
    'sslg',
    'Supreme Secondary Learner Government',
    'The elected student body that represents all JOLNHS learners — running school-wide initiatives and giving students a direct voice in campus decisions.',
    0
  where not exists (
    select 1 from campus_life_groups
    where section_id = v_section_id and slug = 'sslg'
  )
  returning id into v_group_id;

  -- Group already existed (re-run): reuse its id.
  if v_group_id is null then
    select id into v_group_id
    from campus_life_groups
    where section_id = v_section_id and slug = 'sslg';
  end if;

  insert into campus_life_group_members
    (group_id, name, role, position, photo_path, sort_order, is_archived)
  select
    v_group_id,
    o.name,
    case when o.position ilike '%adviser%' then 'adviser' else 'officer' end,
    o.position,
    o.photo_path,
    o.sort_order,
    false
  from campus_life_officers o
  where o.section_id = v_section_id
    and not exists (
      select 1 from campus_life_group_members m
      where m.group_id = v_group_id and m.name = o.name and m.position = o.position
    );

  update campus_life_officers
  set is_archived = true, updated_at = now()
  where section_id = v_section_id
    and is_archived = false;
end $$;

-- Refresh PostgREST's schema cache so the new tables are visible
-- to the app immediately instead of on the next restart.
notify pgrst, 'reload schema';

-- ============================================================
-- 0002: Campus Life officers (PTA, Organizations, Journalists)
-- Linked to a section, not a fixed category — this is what lets
-- Organizations reuse this same table later without a new one.
-- ============================================================

create table campus_life_officers (
  id           uuid primary key default gen_random_uuid(),
  section_id   uuid not null references campus_life_sections(id) on delete cascade,
  name         text not null,
  position     text not null,
  photo_path   text,
  sort_order   int not null default 0,
  is_archived  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table campus_life_officers enable row level security;

create policy "Public read" on campus_life_officers
  for select using (true);

create policy "Admin write" on campus_life_officers
  for all to authenticated
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

-- "Last updated" tracking, used by the dashboard's staleness notices.
-- Applies to sections; stats/highlights/officers changes should also
-- bump their parent section's updated_at via the app layer on save
-- (simpler and more explicit than a trigger for a single-admin site).
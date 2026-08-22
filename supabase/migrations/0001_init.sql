-- ============================================================
-- JOLNHS Admin — Initial schema
-- Run once in Supabase SQL Editor (or via `supabase db push`
-- once the CLI is set up). Idempotent-safe columns/constraints
-- only — re-running this script on an already-migrated DB will
-- error on the CREATE TABLE statements, which is intentional:
-- changes after this point belong in a new migration file
-- (0002_*.sql, etc.), never edits to this one.
-- ============================================================

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ------------------------------------------------------------
-- Admin identity — the ONE table that decides who can write.
-- Every RLS write policy below checks against this table, not
-- just "any authenticated user" (see architecture Q&A on why).
-- ------------------------------------------------------------
create table admin_users (
  user_id uuid primary key references auth.users(id)
);

-- ------------------------------------------------------------
-- Staff / Faculty
-- ------------------------------------------------------------
create table staff_members (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  position     text not null,
  category     text not null
                 check (category in ('administrators','jhs-faculty','shs-faculty','staff')),
  photo_path   text,                 -- storage path, e.g. "staff/<id>.webp" — see Phase 1
  sort_order   int not null default 0,
  is_archived  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Campus Life (4 fixed sections — Athletes, PTA, Organizations,
-- Journalists. "Gallery" intentionally excluded per approved scope.)
-- ------------------------------------------------------------
create table campus_life_sections (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique
                check (slug in ('athletes','pta','organizations','journalists')),
  eyebrow     text,
  name        text not null,
  tagline     text,
  description text,
  updated_at  timestamptz not null default now()
);

create table campus_life_stats (
  id         uuid primary key default gen_random_uuid(),
  section_id uuid not null references campus_life_sections(id) on delete cascade,
  label      text not null,
  value      text not null,
  sort_order int not null default 0
);

create table campus_life_highlights (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null references campus_life_sections(id) on delete cascade,
  title       text not null,
  description text not null,
  sort_order  int not null default 0
);

-- ------------------------------------------------------------
-- Budget — fiscal-year scoped so past years can never be
-- accidentally overwritten (see architecture Q&A #3).
-- ------------------------------------------------------------
create table budget_fiscal_years (
  id                     uuid primary key default gen_random_uuid(),
  year_label             text not null unique,          -- "SY 2026-2027"
  total_proposed_budget  numeric(12,2) not null check (total_proposed_budget >= 0),
  hero_heading           text,
  hero_description       text,
  intro_paragraphs       text[],
  disclaimer             text,
  status                 text not null default 'draft'
                           check (status in ('draft','published','archived')),
  is_current             boolean not null default false,
  last_updated           timestamptz not null default now()
);

create unique index one_current_year
  on budget_fiscal_years (is_current)
  where is_current = true;

create table budget_categories (
  id             uuid primary key default gen_random_uuid(),
  fiscal_year_id uuid not null references budget_fiscal_years(id) on delete restrict,
  slug           text not null,
  name           text not null,
  icon_key       text not null,       -- validated against a fixed enum in app code (Phase 2)
  amount         numeric(12,2) not null check (amount >= 0),
  color_class    text not null,
  description    text,
  sort_order     int not null default 0,
  unique (fiscal_year_id, slug)
);

create table budget_accomplishments (
  id             uuid primary key default gen_random_uuid(),
  fiscal_year_id uuid not null references budget_fiscal_years(id) on delete restrict,
  category_id    uuid not null references budget_categories(id) on delete restrict,
  title          text not null,
  amount         numeric(12,2) not null check (amount >= 0),
  status         text not null check (status in ('completed','in-progress','upcoming')),
  period         text,
  description    text,
  sort_order     int not null default 0
);

-- ============================================================
-- Row Level Security — enable on every table
-- ============================================================
alter table staff_members            enable row level security;
alter table campus_life_sections     enable row level security;
alter table campus_life_stats        enable row level security;
alter table campus_life_highlights   enable row level security;
alter table budget_fiscal_years      enable row level security;
alter table budget_categories        enable row level security;
alter table budget_accomplishments   enable row level security;

-- Public read on everything — the site itself has no login.
create policy "Public read" on staff_members            for select using (true);
create policy "Public read" on campus_life_sections      for select using (true);
create policy "Public read" on campus_life_stats         for select using (true);
create policy "Public read" on campus_life_highlights    for select using (true);
create policy "Public read" on budget_fiscal_years       for select using (true);
create policy "Public read" on budget_categories         for select using (true);
create policy "Public read" on budget_accomplishments    for select using (true);

-- Admin-only write — checks admin_users, not just "any logged-in user."
create policy "Admin write" on staff_members
  for all to authenticated
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "Admin write" on campus_life_sections
  for all to authenticated
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "Admin write" on campus_life_stats
  for all to authenticated
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "Admin write" on campus_life_highlights
  for all to authenticated
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "Admin write" on budget_fiscal_years
  for all to authenticated
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

-- Budget categories/accomplishments: admin write, EXCEPT when their
-- fiscal year is archived — this is the actual "can't overwrite past
-- years" guarantee, enforced by Postgres regardless of what the UI allows.
create policy "Admin write, non-archived years only" on budget_categories
  for all to authenticated
  using (
    exists (select 1 from admin_users where user_id = auth.uid())
    and (select status from budget_fiscal_years where id = fiscal_year_id) <> 'archived'
  )
  with check (
    exists (select 1 from admin_users where user_id = auth.uid())
    and (select status from budget_fiscal_years where id = fiscal_year_id) <> 'archived'
  );

create policy "Admin write, non-archived years only" on budget_accomplishments
  for all to authenticated
  using (
    exists (select 1 from admin_users where user_id = auth.uid())
    and (select status from budget_fiscal_years where id = fiscal_year_id) <> 'archived'
  )
  with check (
    exists (select 1 from admin_users where user_id = auth.uid())
    and (select status from budget_fiscal_years where id = fiscal_year_id) <> 'archived'
  );

-- ============================================================
-- Seed the 4 fixed Campus Life sections (rows only — content
-- gets filled in by the Phase-0 migration script, Step 3 below)
-- ============================================================
insert into campus_life_sections (slug, name) values
  ('athletes', 'Student Athletes'),
  ('pta', 'Parents–Teachers Association'),
  ('organizations', 'Student Organizations'),
  ('journalists', 'Campus Journalists');

-- ============================================================
-- Register the one admin — REPLACE the UID below before running
-- ============================================================
insert into admin_users (user_id) values ('b15c1609-85b1-43da-9277-f51756ac85d8');
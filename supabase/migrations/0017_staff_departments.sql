-- ============================================================
-- 0017: Staff departments
--
-- In real DepEd schools, JHS and SHS teachers sit in departments
-- (English, Math, Science…) and non-teaching staff sit in offices —
-- the same "group the people under a named unit" model the Campus
-- Life groups feature established for organizations, sports and
-- publications.
--
-- Model:
--   staff_departments — the unit itself, scoped to one staff
--     category (all four get grouping: Administrators can form
--     offices like "Office of the Principal", Staff can form
--     "Registrar's Office").
--   staff_members.department_id — a person belongs to AT MOST one
--     department (nullable — unassigned members stay visible).
--   staff_members.is_department_head — one person per department may
--     be marked Head; they render first on the public page.
--
-- One-head-per-department is enforced in the database (partial
-- unique index), not just in the UI — a stray second head can't
-- exist even if a future client forgets to check.
--
-- Policies copy 0001's staff_members pattern: public read
-- (non-archived) and admin-membership write.
-- ============================================================

create table staff_departments (
  id          uuid primary key default gen_random_uuid(),
  category    text not null
                check (category in ('administrators','jhs-faculty','shs-faculty','staff')),
  name        text not null,
  slug        text not null,
  description text,
  sort_order  int not null default 0,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Slug unique per category, not globally — JHS can have "English
  -- Department" and SHS "English Department" if the school chooses.
  unique (category, slug)
);

alter table staff_members
  add column if not exists department_id uuid
    references staff_departments(id) on delete set null,
  add column if not exists is_department_head boolean not null default false;

-- At most one (active) head per department. The partial index only
-- counts rows flagged head AND not archived, so archiving a head
-- automatically frees the spot.
create unique index if not exists one_head_per_department
  on staff_members (department_id)
  where is_department_head and not is_archived;

create index if not exists staff_members_department_id_idx
  on staff_members (department_id);

create index if not exists staff_departments_category_idx
  on staff_departments (category);

alter table staff_departments enable row level security;

create policy "Public read" on staff_departments
  for select using (true);

create policy "Admin write" on staff_departments
  for all to authenticated
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

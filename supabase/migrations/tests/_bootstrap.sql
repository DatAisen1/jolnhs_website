-- Minimal stand-in for the pieces Supabase's platform normally
-- provides (the `auth` schema, `auth.uid()`, and the `authenticated`/
-- `anon` roles PostgREST switches into per request) so the project's
-- REAL migration files can run against it completely unmodified.
-- Nothing here is project logic — it's test-environment plumbing.

create extension if not exists "pgcrypto";

create schema if not exists auth;

create table if not exists auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text
);

-- Supabase's real auth.uid() reads the JWT's `sub` claim out of a
-- Postgres GUC that PostgREST sets per-request. We reproduce exactly
-- that mechanism (not a fake) so `SET LOCAL request.jwt.claim.sub`
-- before a query is a faithful stand-in for "this request came from
-- an authenticated user with this id" — the same lever RLS testing
-- uses in a real Supabase project.
create or replace function auth.uid() returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
end
$$;

-- Let the connecting superuser SET ROLE into "authenticated" for the
-- duration of a test, the same way PostgREST's "authenticator" role
-- does per request. Note this session then actually loses RLS bypass —
-- BYPASSRLS is a property of the *current* role, not the original
-- login role — which is exactly what makes the RLS test meaningful.
grant authenticated to postgres;
grant anon to postgres;

grant usage on schema public to authenticated, anon;
-- Bootstrap runs BEFORE the real migrations create any tables, so a
-- one-shot `grant ... on all tables in schema public` here would
-- apply to zero tables. Default privileges apply to tables created
-- afterward by this same role (postgres, which owns everything the
-- migrations create) — Supabase's platform sets up the equivalent of
-- this automatically; a plain local Postgres doesn't.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;

-- One admin user, matching the fixed UID the real 0001_init.sql
-- seeds into admin_users — must exist before that insert runs
-- (admin_users.user_id has a FK to auth.users.id).
insert into auth.users (id, email) values
  ('b15c1609-85b1-43da-9277-f51756ac85d8', 'admin@test.local')
on conflict (id) do nothing;
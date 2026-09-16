-- ============================================================
-- P3.4 — Atomic save RPC: forced mid-transaction failure rolls back
--
-- What this proves, and why it can't be a Vitest test: the guarantee
-- in migrations/0003's comment ("a function body is one implicit
-- transaction — if any statement raises, Postgres rolls back
-- everything") is a property of Postgres itself, not of the client
-- code that calls it. A JS test can only observe "the rpc() call
-- rejected" — it has no way to check whether the database quietly
-- kept a partial write. Only a query against the database, after a
-- forced failure, can prove that.
--
-- Run against a disposable database:
--   createdb jolnhs_pgtap_test
--   psql -d jolnhs_pgtap_test -v ON_ERROR_STOP=1 -f supabase/tests/_bootstrap.sql
--   psql -d jolnhs_pgtap_test -v ON_ERROR_STOP=1 -f supabase/migrations/0001_init.sql
--   psql -d jolnhs_pgtap_test -v ON_ERROR_STOP=1 -f supabase/migrations/0003_save_campus_life_section_rpc.sql
--   psql -d jolnhs_pgtap_test -c "create extension if not exists pgtap;"
--   pg_prove -d jolnhs_pgtap_test supabase/tests/atomic_save_rollback.test.sql
-- (or: psql -d jolnhs_pgtap_test -f supabase/tests/atomic_save_rollback.test.sql)
--
-- Wrapped in BEGIN/ROLLBACK so running it leaves the database exactly
-- as it found it — repeatable against the same seeded DB, not just
-- runnable once.
-- ============================================================

begin;
select plan(9);

-- Authenticate as the seeded admin for the rest of this transaction —
-- mirrors what PostgREST does per request, so the RLS "Admin write"
-- policies are actually evaluated rather than bypassed. Without this,
-- a passing test would prove nothing about the real request path.
set local role authenticated;
set local "request.jwt.claim.sub" = 'b15c1609-85b1-43da-9277-f51756ac85d8';

-- ------------------------------------------------------------
-- Fixture: known baseline state for the 'athletes' section.
-- ------------------------------------------------------------
select set_config(
  'test.section_id',
  (select id::text from campus_life_sections where slug = 'athletes'),
  true
);

update campus_life_sections
set eyebrow = 'Before', name = 'Athletes (before)', tagline = 'baseline'
where id = current_setting('test.section_id')::uuid;

delete from campus_life_stats where section_id = current_setting('test.section_id')::uuid;
insert into campus_life_stats (section_id, label, value, sort_order) values
  (current_setting('test.section_id')::uuid, 'Teams', '12', 0);

delete from campus_life_highlights where section_id = current_setting('test.section_id')::uuid;
insert into campus_life_highlights (section_id, title, description, sort_order) values
  (current_setting('test.section_id')::uuid, 'Baseline highlight', 'unchanged', 0);

-- ------------------------------------------------------------
-- Part 1 — happy path: a fully valid call commits every part.
-- Confirms the "everything lands together" side of atomicity, not
-- just the rollback side.
-- ------------------------------------------------------------
select lives_ok(
  $$ select save_campus_life_section(
       current_setting('test.section_id')::uuid,
       'After', 'Athletes (after)', 'new tagline', 'new description',
       '[{"label": "Teams", "value": "14"}]'::jsonb,
       '[{"title": "New highlight", "description": "landed"}]'::jsonb
     ) $$,
  'valid call succeeds'
);

select is(
  (select name from campus_life_sections where id = current_setting('test.section_id')::uuid),
  'Athletes (after)',
  'happy path: section fields committed'
);
select is(
  (select value from campus_life_stats where section_id = current_setting('test.section_id')::uuid),
  '14',
  'happy path: stats replaced'
);
select is(
  (select title from campus_life_highlights where section_id = current_setting('test.section_id')::uuid),
  'New highlight',
  'happy path: highlights replaced'
);

-- ------------------------------------------------------------
-- Part 2 — forced mid-transaction failure: the highlights insert is
-- the LAST statement in the function body. By the time it runs, the
-- function has already: updated the section row, deleted the old
-- stats, and inserted new stats. A highlight item with no "title" key
-- makes `item ->> 'title'` evaluate to NULL, which violates
-- campus_life_highlights.title's NOT NULL constraint and raises —
-- after everything before it in the function already "succeeded".
-- This is the actual regression the RPC exists to prevent (see
-- 0003's migration comment): the pre-RPC version did these as four
-- separate client round trips, so a failure here used to leave stats
-- deleted with nothing re-inserted.
-- ------------------------------------------------------------
select throws_ok(
  $$ select save_campus_life_section(
       current_setting('test.section_id')::uuid,
       'Should not persist', 'Should not persist', 'x', 'x',
       '[{"label": "Teams", "value": "999"}]'::jsonb,
       '[{"description": "no title key -> NULL -> NOT NULL violation"}]'::jsonb
     ) $$,
  '23502', -- not_null_violation
  null,
  'forced failure: malformed highlight raises not_null_violation'
);

-- If the function's transaction semantics were broken (e.g. someone
-- "optimized" it back into separate autonomous statements), these
-- three would show the failed call's values instead of the Part 1
-- "after" baseline, because the update/delete/insert that ran before
-- the raising statement would have stuck.
select is(
  (select name from campus_life_sections where id = current_setting('test.section_id')::uuid),
  'Athletes (after)',
  'rollback: section update from the failed call did not persist'
);
select is(
  (select value from campus_life_stats where section_id = current_setting('test.section_id')::uuid),
  '14',
  'rollback: stats delete+insert from the failed call did not persist'
);
select is(
  (select title from campus_life_highlights where section_id = current_setting('test.section_id')::uuid),
  'New highlight',
  'rollback: highlights untouched — still Part 1''s committed value'
);
select is(
  (select count(*)::int from campus_life_highlights where section_id = current_setting('test.section_id')::uuid),
  1,
  'rollback: no stray/partial highlight row was left behind'
);

select * from finish();
rollback;
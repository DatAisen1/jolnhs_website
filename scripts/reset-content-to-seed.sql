-- ============================================================
-- reset-content-to-seed.sql
--
-- DESTRUCTIVE ONE-OFF — returns all CMS content to the exact state
-- the app had right after migrations 0001-0012 ran:
--   * all admin-entered rows deleted
--   * the 4 seeded campus_life_sections kept, editable fields cleared
--   * site_settings restored to migration 0010's seed values
--   * login rate-limit history cleared
--
-- Run MANUALLY: Supabase dashboard -> SQL Editor -> paste -> Run.
-- Never move this file into supabase/migrations/ — it must not run
-- on fresh setups. Take a backup first if the data might matter
-- (Dashboard -> Database -> Backups, or a quick CSV export).
-- ============================================================

begin;

-- CMS content the admin panel writes — wiped entirely.
delete from campus_life_officers;
delete from campus_life_stats;
delete from campus_life_highlights;
delete from staff_members;

-- Child rows first: budget_categories and budget_accomplishments use
-- `on delete restrict`, so the fiscal year can't be deleted while
-- children still reference it.
delete from budget_accomplishments;
delete from budget_categories;
delete from budget_fiscal_years;

-- The 4 section rows are seeded (athletes, pta, organizations,
-- journalists): keep slug + name, reset editable fields to seed state.
update campus_life_sections
set eyebrow = null,
    tagline = null,
    description = null;

-- Settings were seeded by migration 0010 — restore those exact values.
-- The upsert also repairs any keys accidentally deleted or added.
insert into site_settings (key, value, category) values
  ('site_name', 'Julia Ortiz Luis National High School', 'identity'),
  ('site_tagline', 'We Soar With Pride. Soar High, JOLIANS!', 'identity'),
  ('address', 'Sagaba, Santo Domingo, Nueva Ecija, Philippines', 'contact'),
  ('email', 'julia.ortiz1945@gmail.com', 'contact'),
  ('facebook_handle', 'jolnhs300814official', 'contact'),
  ('facebook_url', 'https://www.facebook.com/jolnhs300814official', 'contact'),
  ('maps_url', 'https://www.google.com/maps/search/?api=1&query=Julia+Ortiz+Luis+National+High+School', 'contact'),
  ('school_type', 'Public Secondary School', 'information'),
  ('department', 'Department of Education (DepEd)', 'information'),
  ('programs_offered', 'STE, SP-ICT, SNED, Regular, SHS', 'information'),
  ('mission_statement', 'Julia Ortiz Luis National High School is a public secondary school committed to providing quality, inclusive, and community-centered education. From our Special Science and ICT programs to our Special Needs Education initiatives, every learner at JOLNHS is known, supported, and given the tools to grow — academically, socially, and as a person of good character.', 'information'),
  ('office_hours', 'Monday–Friday: 7:00 AM – 5:00 PM, Saturday: Closed, Sunday: Closed, Holidays: Closed', 'information')
on conflict (key) do update
  set value = excluded.value,
      category = excluded.category;

-- Rate-limit history accumulated during manual login testing.
delete from login_attempts;

commit;

-- Verify afterwards (should show: content tables empty, 4 sections,
-- 12 settings, tagline back to "We Soar With Pride..."):
--   select 'staff' t, count(*) from staff_members
--   union all select 'officers', count(*) from campus_life_officers
--   union all select 'stats', count(*) from campus_life_stats
--   union all select 'highlights', count(*) from campus_life_highlights
--   union all select 'years', count(*) from budget_fiscal_years
--   union all select 'categories', count(*) from budget_categories
--   union all select 'accomplishments', count(*) from budget_accomplishments
--   union all select 'sections', count(*) from campus_life_sections
--   union all select 'settings', count(*) from site_settings;

-- Supabase Connection Verification Script
-- Run this in the Supabase SQL Editor
-- This script is READ-ONLY and will not modify any data

-- Check that all expected tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'admin_users',
    'staff_members',
    'campus_life_sections',
    'campus_life_stats',
    'campus_life_highlights',
    'budget_fiscal_years',
    'budget_categories',
    'budget_accomplishments',
    'campus_life_officers',
    'login_attempts',
    'site_settings'
  )
ORDER BY table_name;

-- Check that all expected functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'save_campus_life_section',
    'check_login_lock',
    'record_login_attempt',
    'set_current_fiscal_year',
    'create_fiscal_year'
  )
ORDER BY routine_name;

-- Check admin_users count
SELECT count(*) as admin_users_count FROM admin_users;

-- Check site_settings count (should be 12 per F9)
SELECT count(*) as site_settings_count FROM site_settings;

-- Check campus_life_sections slugs (should be 4 per F8)
SELECT slug FROM campus_life_sections ORDER BY slug;

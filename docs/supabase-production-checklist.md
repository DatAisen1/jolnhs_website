# Supabase Production Configuration Checklist

Use this checklist when preparing the Supabase project for production deployment.

## Authentication Settings

- [ ] **Email confirmation**: Enabled (require users to verify email addresses)
- [ ] **Password strength**: Configured (minimum 8 characters recommended)
- [ ] **Session duration**: Set appropriately for admin workflow (e.g., 1 week)
- [ ] **JWT expiry**: Verify JWT tokens expire appropriately (default is 1 hour)
- [ ] **Email provider**: Configured (SMTP or third-party service)

## Row Level Security (RLS)

Review all policies ensure they match the intended access model:

### Public Tables (read-only for all users)
- [ ] `staff_members` — Public read policy allows anonymous access
- [ ] `campus_life_sections` — Public read policy allows anonymous access
- [ ] `campus_life_stats` — Public read policy allows anonymous access
- [ ] `campus_life_highlights` — Public read policy allows anonymous access
- [ ] `campus_life_officers` — Public read policy allows anonymous access
- [ ] `budget_fiscal_years` — Public read policy allows anonymous access
- [ ] `budget_categories` — Public read policy allows anonymous access
- [ ] `budget_accomplishments` — Public read policy allows anonymous access
- [ ] `site_settings` — Public read policy allows anonymous access

### Admin-Only Tables
- [ ] `admin_users` — RLS enabled with "Admins can read own row" policy
- [ ] `login_attempts` — RLS enabled, no public access

### Write Policies
Verify that admin write policies check `admin_users` membership:
- [ ] All "Admin write" policies use `exists (select 1 from admin_users where user_id = auth.uid())`
- [ ] Budget category/accomplishment policies prevent writes to archived fiscal years
- [ ] No policies grant anonymous or authenticated write access to admin tables

## Storage Configuration

- [ ] `staff-photos` bucket exists with proper RLS policies
- [ ] `budget-files` bucket exists with proper RLS policies (if needed)
- [ ] Public read access enabled for appropriate buckets
- [ ] Admin write access restricted to users in `admin_users`
- [ ] CORS settings configured for your domain

## Database Functions

- [ ] `check_login_lock` function exists and is callable by anon/authenticated
- [ ] `record_login_attempt` function exists with identity verification (migration 0011)
- [ ] `save_campus_life_section` function exists with proper grants
- [ ] `set_current_fiscal_year` function exists with proper grants
- [ ] `create_fiscal_year` function exists with proper grants

## Admin Users

- [ ] At least one admin user exists in `admin_users` table
- [ ] Admin user account exists in Supabase Auth (Authentication → Users)
- [ ] Admin can log in at `/admin/login`
- [ ] Test admin access to all admin pages (Dashboard, Staff, Campus Life, Budget, Settings)

## Redirect URLs

Configure allowed redirect URLs for email confirmation and password reset:
- [ ] Add production domain to "Site URL" (e.g., `https://yourschool.edu.ph`)
- [ ] Add `/admin/reset-password` to "Redirect URLs"
- [ ] Add `/admin/login` to "Redirect URLs"

## Security Best Practices

- [ ] All secrets stored in `.env` (gitignored)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` never exposed in client code
- [ ] Rate limiting enabled for login attempts (migration 0005 + 0011)
- [ ] Database backups configured
- [ ] Point-in-time recovery enabled (if available on plan)

## Data Integrity

- [ ] At least one active fiscal year exists in `budget_fiscal_years`
- [ ] All 4 campus life sections exist (athletes, journalists, organizations, pta)
- [ ] Site settings populated with school information (address, email, office hours, etc.)
- [ ] Test staff member exists to verify public display

## Monitoring

- [ ] Set up database alerts for errors
- [ ] Monitor API usage (Supabase dashboard → API → Usage)
- [ ] Check storage usage
- [ ] Review auth logs periodically

## Documentation

- [ ] All migrations applied and tested
- [ ] README.md is up to date with setup instructions
- [ ] Environment variables documented
- [ ] Admin credentials stored securely (password manager recommended)

---

## Post-Deployment Verification

After deploying to production:

1. [ ] Test public site loads at production URL
2. [ ] Test `/admin/login` works with admin credentials
3. [ ] Create a test edit in admin panel → verify it appears on public site
4. [ ] Test all public routes (/, /about, /academics, /campus-life, /budget, /contact)
5. [ ] Test 404 page for invalid URLs
6. [ ] Test login rate limiting (5 failed attempts → locked)
7. [ ] Test admin sign out → verify can't access admin pages
8. [ ] Test on mobile devices
9. [ ] Check browser console for errors
10. [ ] Verify HTTPS is working and certificate is valid

---

**Note:** This checklist assumes you've already run all migrations in order (0001-0012) and have a working local development environment.
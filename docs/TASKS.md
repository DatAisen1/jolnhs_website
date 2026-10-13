# JOLNHS Website Development Tasks

## How to Use This File

**Status:** `[ ]` not started · `[~]` in progress · `[x]` completed · `[!]` blocked

**Rules:**
- Never mark complete without verification
- Don't work ahead of the current phase
- Keep this aligned with docs/PROJECT_PLAN.md
- Update after meaningful work

---

## PHASE 0 — Baseline

### [x] Verify baseline environment
**What needs doing:** Confirm dependency install, lint, tests, production build, TypeScript errors all pass.

**Area:** Project setup

**Verification:** Run `npm install`, `npm run lint`, `npm run test`, `npm run build` — all must pass without errors.

---

### [x] Verify Supabase connection
**What needs doing:** Confirm `.env` points to a real Supabase project and connection works.

**Area:** Infrastructure

**Verification:** Admin login at `/admin/login` succeeds with real credentials.

---

### [x] Verify all public routes work
**What needs doing:** Confirm every public route in App.tsx renders correctly, including invalid URL check.

**Area:** Public site routing

**Routes to verify:**
- `/` — HomePage
- `/about` — AboutOverviewPage
- `/about/overview` — AboutOverviewPage
- `/about/faculty-staff` — FacultyStaffPage
- `/academics` — AcademicsPage
- `/academics/:slug` — ProgramDetailPage
- `/campus-life` — CampusLifePage
- `/campus-life/:slug` — CampusLifeSectionPage (including `/campus-life/gallery`)
- `/budget` — BudgetPage
- Invalid URL — should show browser default 404 (no catch-all route exists yet)

**Verification:** Manual click-through of each route, plus test invalid URL.

---

### [x] Verify all admin routes work
**What needs doing:** Confirm every admin route in App.tsx renders correctly.

**Area:** Admin routing

**Routes to verify:**
- `/admin` — DashboardPage
- `/admin/campus-life` — CampusLifeManagePage
- `/admin/staff` — StaffManagePage
- `/admin/budget` — BudgetManagePage
- `/admin/settings` — SettingsPage

**Verification:** Manual click-through after login.

---

### [x] Classify outstanding issues
**What needs doing:** Review Must Fix / Should Fix / Can Wait list from PROJECT_PLAN.md and confirm classification based on inspection.

**Area:** Issue prioritization

**Verification:** Document confirmed classification for each issue.

---

## PHASE 1 — Data Architecture

### [x] Faculty & Staff: Connect to Supabase
**What needs doing:** Replace static `src/data/facultyStaff.ts` imports in FacultyStaffPage with Supabase-backed hook/query. Use existing `staff_members` table and `useStaffMembers` hook.

**Area:** `src/pages/FacultyStaffPage.tsx`, `src/lib/data/staff.ts`

**Verification:** Add/edit staff in Admin → confirm Supabase row → confirm it appears on public Faculty & Staff page.

---

### [x] Campus Life: Connect to Supabase
**What needs doing:** Replace static `src/data/campusLife.ts` imports in CampusLifePage/CampusLifeSectionPage with Supabase-backed hook/query. Use existing `campus_life_*` tables and hooks.

**Area:** `src/pages/CampusLifePage.tsx`, `src/pages/CampusLifeSectionPage.tsx`, `src/lib/data/campusLife.ts`

**Verification:** Add/edit section or officer in Admin → confirm Supabase row → confirm it appears on public Campus Life page.

**Note:** Gallery (`/campus-life/gallery`) is already working with real data from static file — preserve this functionality during migration.

---

### [x] Site Settings: Connect to public site
**What needs doing:** Wire public site (header/footer/contact areas) to read from `site_settings` table instead of static files (`schoolContact.ts`, `officeHours.ts`). Settings table exists (0010_site_settings.sql).

**Area:** Public site components that display contact/office-hours info

**Verification:** Edit settings in Admin SettingsPage → confirm changes appear on public site.

---

### [x] Budget: Connect to Supabase (data pipe only)
**What needs doing:** Replace static `src/data/budget.ts` imports in BudgetPage with Supabase-backed hook/query. Use existing `budget_*` tables and hooks.

**Area:** `src/pages/BudgetPage.tsx`, `src/lib/data/budget.ts`

**Verification:** Add/edit fiscal year/category/accomplishment in Admin → confirm Supabase row → confirm it appears on public Budget page.

**IMPORTANT:** Public budget page must NOT display real-looking figures until school verifies them. Keep placeholder disclaimer until school sign-off obtained.

---

### [ ] Budget: Obtain real figures from school
**What needs doing:** Get confirmed budget figures from school administration for current fiscal year.

**Area:** Budget data verification

**Verification:** School administrator signs off on figures as accurate.

---

### [ ] Budget: Publish real figures
**What needs doing:** Update BudgetPage to display real figures after school sign-off, remove placeholder disclaimer.

**Area:** `src/pages/BudgetPage.tsx`

**Verification:** Public budget page shows real figures with no disclaimer.

---

## PHASE 2 — Security & Authentication

### [x] Fix login rate-limiter bypass
**What needs doing:** Fix `record_login_attempt` RPC in 0005_login_rate_limiting.sql to verify caller's authenticated identity matches `p_email` before allowing lockout clear on `p_success=true`.

**Current vulnerability:** Anonymous caller can invoke with arbitrary `p_email` and `p_success=true`, successfully clearing that email's lockout state with zero verification of caller identity.

**Area:** `supabase/migrations/0005_login_rate_limiting.sql`

**Verification:** 
- Failed attempts lock out correctly
- Successful login clears correctly
- Unauthenticated caller cannot clear another account's lockout state

---

### [x] Remove hardcoded admin UUID
**What needs doing:** Remove hardcoded admin UUID insert from 0001_init.sql. Desired end state: fresh Supabase project, run migrations, provision admin separately.

**Area:** `supabase/migrations/0001_init.sql`

**Verification:** New migration created or existing migration updated to remove hardcoded UUID.

---

### [x] Align admin_users RLS with migrations
**Verification:** a fresh project built from migrations has RLS on admin_users, a self-row SELECT policy, and no write privileges for anon/authenticated.

---

### [x] Add admin_users check to ProtectedRoute
**What needs doing:** Update `ProtectedRoute` to check `admin_users` membership, not just session presence. RLS already prevents unauthorized writes, so this is UX/exposure issue, not data-integrity.

**Area:** `src/components/admin/ProtectedRoute.tsx`

**Verification:** Authenticated non-admin user is redirected to access denied page when accessing `/admin/*` routes.

---

### [~] Harden admin session lifecycle
**What needs doing:** Keep the admin login scoped to the current browser tab (sessionStorage instead of localStorage), wipe stale long-lived tokens, sign out after 30 minutes of inactivity with a 1-minute warning, and hide admin pages from search engines via `noindex`. No public login button — `/admin/login` is shared privately.

**Area:** `src/lib/supabase.ts`, `src/lib/idleSession.ts`, `src/hooks/useIdleSignOut.ts`, `src/hooks/useNoIndex.ts`, `src/components/admin/AdminLayout.tsx`, `src/pages/admin/LoginPage.tsx`, `src/context/AuthContext.tsx`

**Verification:**
- Closing the tab/browser or opening a new tab requires signing in again; refresh keeps the session
- 30 minutes idle signs out and the login page explains why
- `noindex` meta present on admin pages, absent on public pages
- Manual end-to-end check against live Supabase still required

---

## PHASE 3 — Visitor-Facing Pages

### [x] Implement Contact page
**What needs doing:** Replace `/contact` stub with functional contact page using verified school information.

**Area:** `src/pages/ContactPage.tsx` (needs to be created)

**Verification:** Contact page displays school address, email, phone, social links (mark unknowns as "requires school-provided information").

---

### [x] Implement Enrollment page
**What needs doing:** Replace `/enroll` stub with functional enrollment page if it's in primary navigation.

**Area:** `src/pages/EnrollmentPage.tsx` (needs to be created)

**Verification:** Enrollment page displays enrollment requirements and process (mark unknowns as "requires school-provided information").

**Status note:** Enrollment page is not applicable by owner decision C: "The school has NO enrollment function, so remove the /enroll stub route and let /enroll fall through to the global 404 page added in P3.3." The route fallthrough is covered by the P3.2 route test.

---

### [x] Add global 404 route
**What needs doing:** Add catch-all route to App.tsx for invalid URLs with clear message, link home, link to major sections.

**Area:** `src/App.tsx`

**Verification:** Invalid URL shows friendly 404 page with navigation options.

---

## PHASE 4 — Content & Data Verification

### [ ] Verify school information accuracy
**What needs doing:** Confirm all school information displayed on site is factually correct.

**Area:** All pages with school info

**Verification:** School administrator confirms accuracy of address, phone, email, social links, programs, etc.

---

### [ ] Verify faculty/staff data accuracy
**What needs doing:** Confirm all faculty/staff names, positions, categories are correct.

**Area:** Faculty & Staff page

**Verification:** School administrator confirms accuracy.

---

### [ ] Verify campus life data accuracy
**What needs doing:** Confirm all campus life sections, stats, highlights are correct.

**Area:** Campus Life pages

**Verification:** School administrator confirms accuracy.

---

### [ ] Verify budget data accuracy
**What needs doing:** Confirm all budget figures are accurate (after school sign-off).

**Area:** Budget page

**Verification:** School administrator confirms accuracy.

---

### [ ] Verify enrollment information accuracy
**What needs doing:** Confirm enrollment requirements and process are correct.

**Area:** Enrollment page

**Verification:** School administrator confirms accuracy.

---

## PHASE 5 — Production Hardening

### [x] Pin Node version
**What needs doing:** Add `engines` field to package.json pinning Node version. Only pin what can be verified as actually compatible.

**Area:** `package.json`

**Verification:** Node version specified in `engines` field, application runs successfully on that version.

---

### [x] Document environment variables
**What needs doing:** Ensure README.md documents all required environment variable names and purposes (not values).

**Area:** `README.md`

**Verification:** All environment variables listed with name and purpose.

---

### [x] Supabase production config checklist
**What needs doing:** Complete Supabase production configuration checklist.

**Area:** Supabase project settings

**Verification:**
- Auth settings configured
- RLS policies reviewed and correct
- Storage policies reviewed and correct
- Admin users provisioned
- Redirect URLs configured

---

## PHASE 6 — Testing

### [ ] Run automated tests
**What needs doing:** Ensure all automated tests pass.

**Area:** Test suite

**Verification:** `npm run test` passes (15 tests, 3 test files).

---

### [ ] Manual page-by-page testing
**What needs doing:** Manual pass through all pages on desktop, tablet, mobile.

**Area:** All public and admin pages

**Verification:** All pages render correctly and functionally on all device sizes.

---

### [ ] CMS integration test: Faculty & Staff
**What needs doing:** Test Admin → Supabase → Public flow for Faculty & Staff.

**Area:** Staff admin + public Faculty & Staff page

**Verification:** Add/edit/archive staff in Admin → confirm Supabase row → confirm change appears on public page.

---

### [ ] CMS integration test: Campus Life
**What needs doing:** Test Admin → Supabase → Public flow for Campus Life.

**Area:** Campus Life admin + public Campus Life pages

**Verification:** Add/edit section/officer in Admin → confirm Supabase row → confirm change appears on public page.

---

### [ ] CMS integration test: Settings
**What needs doing:** Test Admin → Supabase → Public flow for Settings.

**Area:** Settings admin + public site (header/footer/contact)

**Verification:** Edit settings in Admin → confirm Supabase row → confirm change appears on public site.

---

### [ ] CMS integration test: Budget
**What needs doing:** Test Admin → Supabase → Public flow for Budget (after school sign-off).

**Area:** Budget admin + public Budget page

**Verification:** Add/edit fiscal year/category/accomplishment in Admin → confirm Supabase row → confirm change appears on public page.

---

## PHASE 7 — Deployment

### [ ] Git readiness
**What needs doing:** Ensure repository is ready for deployment (clean working tree, appropriate branch).

**Area:** Git repository

**Verification:** `git status` shows clean working tree, correct branch checked out.

---

### [ ] Production build
**What needs doing:** Generate production build.

**Area:** Build process

**Verification:** `npm run build` completes successfully, output in `dist/` directory.

---

### [ ] Hosting configuration
**What needs doing:** Configure hosting platform (document only what repo establishes).

**Area:** Deployment infrastructure

**Verification:** Hosting configuration documented in PROJECT_PLAN.md (repo does not currently establish a specific platform).

---

## PHASE 8 — Live Smoke Test

### [ ] Public site smoke test
**What needs doing:** Post-deployment test of all public pages.

**Area:** All public routes

**Verification:** All public pages load and function correctly on live site.

---

### [ ] Admin panel smoke test
**What needs doing:** Post-deployment test of all admin pages.

**Area:** All admin routes

**Verification:** All admin pages load and function correctly on live site.

---

### [ ] CMS integration tests against live site
**What needs doing:** Run CMS integration tests (Admin → Supabase → Public) against live site.

**Area:** Staff, Campus Life, Settings, Budget

**Verification:** All CMS integration tests pass against live deployment.

---

## Deferred / Post-Launch

- [ ] Full Playwright E2E framework
- [ ] Advanced performance optimization
- [ ] Complex staging infrastructure
- [ ] Large SEO campaign
- [ ] Analytics
- [ ] Advanced monitoring

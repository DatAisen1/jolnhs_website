# JOLNHS Website — Development Plan

**Document Type:** Development & Deployment Plan  
**Project:** Julia Ortiz Luis National High School Website  
**Last Updated:** September 29, 2026

---

## Objective

Make the admin panel, Supabase, and public website use the same source of truth, fix real security/deployment blockers, then test and deploy.

The critical architectural milestone: **Admin changes → Supabase → Public website**. An admin panel that works in isolation is NOT completion.

---

## Current Architectural Problem

```
Admin Panel → Supabase          (works)
Static TS/JSON data → Public Website   (the actual current state)
```

**Sections using static data (confirmed via inspection):**
- Faculty & Staff (`/about/faculty-staff`) — imports from `src/data/facultyStaff.ts`
- Campus Life (`/campus-life` and `/campus-life/:slug`) — imports from `src/data/campusLife.ts`
- Budget (`/budget`) — imports from `src/data/budget.ts` (explicitly marked as placeholder/illustrative)

**Note:** Campus Life gallery (`/campus-life/gallery`) is working with real data from `src/data/campusLife.ts` — this is NOT broken.

---

## Target Architecture

```
                 ┌──────────────┐
                 │   Supabase   │
                 └──────┬───────┘
                        │
               ┌────────┴────────┐
               ↓                 ↓
         Admin Panel       Public Website
```

---

## Current Status

### Admin Panel (Completed Work from Archived Plan)

The archived `JOLNHS_Admin_Development_Plan.md` tracked admin panel recovery and development through September 2026. The following P0-P3 work was completed:

**Foundation & Data Architecture:**
- Supabase migrations 0001-0010 applied (core schema, campus life, staff photos, rate limiting, fiscal year RLS, budget management fields, site settings)
- Admin user provisioning via `admin_users` table with RLS
- Staff & Faculty module: full CRUD with 4 categories (Administrators, JHS Faculty, SHS Faculty, Staff), archive/restore, CSV export
- Campus Life module: full CRUD for sections, officers, stats, highlights; archive/restore; CSV export
- Budget module: full CRUD across fiscal years, categories, and accomplishments; RLS fixes for fiscal-year immutability; archive/restore; CSV export
- Settings module: site-level configuration (identity, contact, information)

**Safety & Security:**
- Error visibility for reads and writes (Supabase errors surfaced via `getErrorMessage()`)
- Destructive-action confirmations via shared `ConfirmButton` component
- Server-side login rate limiting via `record_login_attempt` RPC (0005_login_rate_limiting.sql)
- Dependency security: `react-router-dom` upgraded to v7.18.3 (CVE fix), Vite upgraded to v8.3.0 (CVE fix)

**Shared Components:**
- `ListItemCard` — reusable tri-state card (normal/editing/confirming-delete) used across all admin modules
- `SectionTabs` — reusable tab component for Staff & Faculty and Campus Life
- `AdminButton`, `AdminCard`, `AdminPageHeader`, `AdminEmptyState`, `AdminStates`, `InlineNotice` — shared UI components

**Testing:**
- Vitest + Testing Library configured
- Test files: `ProtectedRoute.test.tsx`, `fiscalYear.test.ts`, `ListItemCard.test.tsx` (15 tests passing)

**Removed Scope:**
- P2 features (Homepage CMS, Announcements, Gallery admin, Downloads) permanently dropped from admin panel
- Public-facing Campus Gallery (`/campus-life/gallery`) preserved and functional

### Public Site Status

**Functional Routes:**
- `/` — HomePage
- `/about` — AboutOverviewPage
- `/about/overview` — AboutOverviewPage
- `/about/faculty-staff` — FacultyStaffPage (with category filtering)
- `/academics` — AcademicsPage
- `/academics/:slug` — ProgramDetailPage
- `/campus-life` — CampusLifePage
- `/campus-life/:slug` — CampusLifeSectionPage (includes `/campus-life/gallery`)
- `/budget` — BudgetPage

**Stub Routes (Coming Soon):**
- `/enroll` — StubPage ("Enrollment — coming soon")
- `/contact` — StubPage ("Contact Us — coming soon")
- `/about/*` — StubPage ("About JOLNHS — coming soon")

**Data Source:**
- All functional public pages currently import from static files in `src/data/`
- Budget page explicitly marked as placeholder/illustrative with disclaimer banner
- `site_settings` table exists (0010_site_settings.sql) and admin SettingsPage can edit it, but public pages still read from static files (`schoolContact.ts`, `officeHours.ts`)

### Outstanding Issues

**Must Fix:**
1. Data-source inconsistency — admin/Supabase vs static-file public pages (Staff, Campus Life, Budget)
2. Login rate-limiter bypass — `record_login_attempt` RPC allows anonymous caller to pass arbitrary `p_email` with `p_success=true` and clear that email's lockout state with zero verification of caller identity
3. Hardcoded admin UUID in 0001_init.sql
4. Incomplete visitor-facing pages (`/contact`, `/enroll` as stubs)
5. No global catch-all 404 route

**Should Fix:**
1. Admin authorization UX — `ProtectedRoute` checks only session presence, not `admin_users` membership (RLS already prevents unauthorized writes, so this is UX/exposure, not data-integrity)
2. 404 page — missing global catch-all route
3. Node version pinning — no `engines` field in package.json
4. Thin test coverage — only 3 test files exist

**Can Wait:**
1. Full Playwright E2E suite
2. Advanced performance work
3. Separate staging environment
4. Large SEO project

---

## PHASES

### PHASE 0 — Baseline

**Verify:** dependency install, lint, tests, production build, TS errors, Supabase connection, admin login, all public routes (including invalid URL check), all admin routes.

**Classify every open issue as Must Fix / Should Fix / Can Wait.**

**Must Fix:**
- Data-source inconsistency (admin/Supabase vs static-file public pages)
- Login rate-limiter bypass (anonymous caller with arbitrary email can clear lockout)
- Hardcoded admin UUID
- Broken/incomplete visitor-facing pages (`/contact`, `/enroll`)
- Production build problems
- Placeholder public information presented as real

**Should Fix:**
- Admin authorization UX (session-only check vs admin_users check — RLS already prevents unauthorized writes, so this is UX/exposure, not data-integrity)
- 404 page
- Node version pinning
- Thin test coverage

**Can Wait:**
- Full Playwright E2E suite
- Advanced performance work
- Separate staging environment
- Large SEO project

---

### PHASE 1 — Data Architecture (Highest Priority)

**1.1 Faculty & Staff**
- Target: Supabase → hook/query → FacultyStaffPage
- Verification test: add/edit staff in Admin → confirm Supabase row → confirm it appears on the public page

**1.2 Campus Life**
- Target: Supabase → hook/query → CampusLifePage
- Verification test: same pattern as Faculty & Staff
- Note: Gallery is a working section with real data (`/campus-life/gallery`), not a broken route

**1.3 Site Settings**
- Connect contact/office-hours/address/phone/email/social links from Supabase to the public site (header/footer/contact areas)
- `site_settings` table exists (0010_site_settings.sql) — need to wire public pages to read from it instead of static files

**1.4 Budget**
- Connect the data pipe first, but the public budget page must NOT display real-looking figures until the school has verified them
- Order: verify Supabase connection → verify admin CRUD → wire public page to Supabase → obtain real figures from the school → get school sign-off → publish
- Wiring up the pipe and being cleared to publish real numbers are two separate gates — document them as such

---

### PHASE 2 — Security & Authentication

**2.1 Login rate limiter**
- Document the actual current behavior verified: `record_login_attempt` RPC in 0005_login_rate_limiting.sql grants execute to `anon, authenticated`, has `security definer`, and when `p_success=true` executes `delete from login_attempts where email = v_email` with no check that the caller's authenticated identity matches `p_email`
- This allows an anonymous caller to invoke with arbitrary `p_email` and `p_success=true`, successfully clearing that email's lockout state with zero verification of caller identity
- Required tests: failed attempts lock out correctly; successful login clears correctly; an unauthenticated caller cannot clear another account's lockout state
- Do not prescribe a specific fix implementation unless the codebase already suggests the natural one

**2.2 Hardcoded admin UUID**
- Document desired end state: fresh Supabase project, run migrations, provision admin separately, no baked-in UUID assumption
- Current: 0001_init.sql line 200 has `insert into admin_users (user_id) values ('b15c1609-85b1-43da-9277-f51756ac85d8');`

**2.3 Admin authorization UX**
- Document desired behavior: logged out → login; admin → dashboard; authenticated non-admin → access denied
- Explicitly note this is lower severity than 2.1 since RLS already blocks unauthorized writes regardless of UI state

---

### PHASE 3 — Visitor-Facing Pages

**3.1 Contact**
- Replace stub with verified school info (do not invent any of it; mark unknowns as "requires school-provided information")

**3.2 Enrollment**
- Same rule; if `/enroll` is in primary navigation, treat this as pre-launch priority

**3.3 Global 404**
- Clear message, link home, link to major sections

---

### PHASE 4 — Content & Data Verification

Checklist by area (school info, faculty/staff, campus life, budget, enrollment) — note explicitly: technically-working data can still be factually wrong data; this phase is about correctness, not code.

---

### PHASE 5 — Production Hardening

**Node version**
- Only pin what you can verify is actually compatible — do not invent a version

**Environment variables**
- Names/purpose only, never values (see README.md for names)

**Supabase production config checklist**
- Auth settings
- RLS policies
- Storage policies
- Admin users
- Redirect URLs

---

### PHASE 6 — Testing

**Automated**
- Only the npm scripts verified to exist in Step 1:
  - `npm run test` — Vitest
  - `npm run test:watch` — Vitest watch mode
  - `npm run test:ui` — Vitest UI
  - `npm run test:db` — Database tests

**Manual**
- Page-by-page desktop/tablet/mobile pass

**Critical CMS integration tests (the project's most important functional tests)**
- Admin change → Supabase → Public website reflects it
- For: Faculty & Staff, Campus Life, Settings, and Budget once verified data exists
- Definition of done requires these to actually pass, not just build/test scripts to pass

---

### PHASE 7 — Deployment

- Git readiness
- Production build
- Hosting config
- Document only what the repo actually establishes; do not invent a hosting platform or deployment target that isn't evidenced in the repo

---

### PHASE 8 — Live Smoke Test

Post-deployment public + admin checklist, plus the same Admin → Supabase → Public critical test run against the live site.

---

## Definition of Done

The website is considered **Production-Ready** when:

```text
[ ] All PHASE 0 items verified and classified
[ ] Public pages (Staff, Campus Life, Budget) read from Supabase, not static files
[ ] Site Settings connected to public site (contact/office-hours from Supabase)
[ ] Budget public page wired to Supabase but not showing real figures without school sign-off
[ ] Login rate limiter fixes the anonymous-caller bypass vulnerability
[ ] Hardcoded admin UUID removed from migrations
[ ] /contact and /enroll are functional (not stubs)
[ ] Global 404 route exists
[ ] Admin authorization UX checks admin_users membership
[ ] Node version pinned in package.json
[ ] All content data verified as factually correct
[ ] Supabase production config checklist complete
[ ] Critical CMS integration tests pass (Admin → Supabase → Public)
[ ] Deployment config documented and verified
[ ] Live smoke test passed
```

---

## Deployment Path

Document only what the repo actually establishes. No hosting platform or deployment target is evidenced in the current repository structure.

---

## Post-Deployment Work

Items to address after the site is live:
- Analytics
- Advanced monitoring
- Performance optimization beyond basics
- Full E2E test suite (Playwright)
- SEO campaigns

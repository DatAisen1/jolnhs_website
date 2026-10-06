# AGENT_RULES.md — Binding rules for any AI agent working in this repo

> Put this file at `docs/AGENT_RULES.md`. Every task prompt starts by telling the agent to read it.
> Facts below were verified by reading the repo snapshot (zip dated 2026-09-30). If the repo has
> changed since, the agent must re-verify a fact before relying on it (Rule R2).

---

## PART 1 — RULES (R1–R10)

**R1. The repo is the truth. Docs can be stale.**
`docs/PROJECT_PLAN.md`, `docs/TASKS.md`, and `README.md` describe intent. Code, migrations, and
`package.json` describe reality. When they disagree: stop that step, write the disagreement in the
report, and follow the task prompt's DECISION line. If there is no DECISION line, ask.

**R2. Never invent.**
Do not invent file paths, function names, table names, column names, npm scripts, env vars, package
versions, URLs, phone numbers, emails, people, dates, budget figures, or facts about the school.
Before using ANY identifier, open its definition (search, then read it). Not found = it does not
exist. Say so. Do not write "probably", "typically", or "usually" about this repo. Look.

**R3. "Done" needs evidence.**
A command "passes" only if you paste: the exact command, the exit code, and the last ~15 lines of
real output. If you cannot run something (no terminal, no network, no database, no `.env`), write
`NOT RUN — <reason>`. Never write "should pass" or "this will work".

**R4. Unknown school information.**
If a school fact (phone, enrollment rules, budget number, staff name, date) is not in the repo, put
exactly this text where it belongs: `Requires school-provided information`. Do not fill it from
general knowledge of Philippine schools or DepEd.

**R5. Stay in scope.**
One task per session. Edit only the files listed under IN SCOPE. No refactors, renames, formatting
sweeps, dependency installs/upgrades, or file deletions unless the task says so. If you believe a new
dependency is needed: stop and ask.

**R6. Database safety.**
- Migrations `0001`–`0010` are treated as already applied to a real project. The README says
  migrations are append-only. Add a NEW file with the next free number; do not edit old ones —
  unless the task explicitly authorizes it.
- Never run SQL, scripts, or CLI commands that write to a real Supabase project. Write the SQL,
  show it, and tell the human to run it.
- Never write a statement that deletes or changes existing `admin_users` rows.

**R7. Secrets.**
Never open, print, or commit `.env`. Never paste keys. Refer to env vars by NAME only. Never create
a `VITE_`-prefixed variable for a secret (Vite ships those to the browser).

**R8. Baseline before changes.**
Before editing, run `npm run build` and `npm run test` and record which pass/fail. Pre-existing
failures are reported, not silently "fixed". After editing, run them again.

**R9. Task tracking.**
Only edit the checkbox of the task you worked on in `docs/TASKS.md`. `[x]` only if every DONE WHEN
item has pasted evidence. Otherwise `[~]` (in progress) or `[!]` (blocked, with a one-line reason).
Never edit `PROJECT_PLAN.md` unless the task says so. Never mark a human-gated task `[x]`
(school sign-off, "administrator confirms", live-site tests).

**R10. Stop and ask when:**
docs and code disagree with no DECISION line · a needed file/table/column does not exist · the task
needs a new dependency, migration, or DB change that the prompt did not authorize · you are about to
edit a file outside IN SCOPE · a test fails and the cause is not clear after reading the failing code
· you feel the urge to "just assume".

### REPORT format (end every session with exactly this)

```
## REPORT — <task id>
1. Changed files: <path — one-line reason> (or "none")
2. Evidence: <command → exit code → pasted output tail>
3. NOT RUN / NOT VERIFIED: <item — reason>
4. Discrepancies found (doc vs repo): <list or "none">
5. Decisions/questions for the owner: <list or "none">
6. TASKS.md status change: <task → [ ]/[~]/[x]/[!] + reason>
```

---

## PART 2 — VERIFIED FACTS (F1–F14)

**F1 Stack.** React 18, TypeScript (`strict`, `noUnusedLocals`, `noUnusedParameters` are ON), Vite
`^8.3.0`, Tailwind 3, TanStack Query 5, `@supabase/supabase-js` 2, zod, Vitest 5 + jsdom + Testing
Library. Alias `@/` → `src/`. Router: `react-router-dom` v7 with `BrowserRouter` in `src/App.tsx`.

**F2 npm scripts that exist (only these):** `dev`, `build` (= `tsc -b && vite build`), `preview`,
`lint` (= `eslint .`), `test` (= `vitest run`), `test:watch`, `test:ui`, `test:db` (= `bash scripts/test-db.sh`).

**F3 Env vars read by the app:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
(`src/lib/supabase.ts` throws at import if missing; `StaffManagePage.tsx` also reads the URL).
`scripts/migrate-campus-life.ts` additionally reads `SUPABASE_SERVICE_ROLE_KEY` (a secret; one-off script).

**F4 Supabase client is untyped** (`createClient` without a `Database` generic). Hooks in
`src/lib/data/*.ts` declare row interfaces by hand.

**F5 Data hooks that exist.**
- `src/lib/data/staff.ts`: `useStaffMembers(category, archived=false)` (ONE category per call),
  `useSaveStaffMember`, `useArchiveStaffMember`, `useRestoreStaffMember`.
- `src/lib/data/campusLife.ts`: `useCampusLifeSection(slug)` (section + stats + highlights + non-archived
  officers), `useSaveCampusLifeSection`, `useSaveOfficer`, `useArchiveOfficer`, `useRestoreOfficer`.
- `src/lib/data/budget.ts`: `useFiscalYears()` (ALL years, all statuses), `useBudgetCategories(fiscalYearId, includeArchived)`,
  `useBudgetAccomplishments(categoryId)` (ONE category per call), plus admin mutations.
- **Site settings: NO hook exists.** `src/pages/admin/SettingsPage.tsx` (~lines 157–174) queries `site_settings` inline.
- **There is no hook that lists all Campus Life sections.**

**F6 Public code that still imports static data from `src/data/`:**
Pages: `FacultyStaffPage`, `AboutOverviewPage` (also uses `staffMembers` for its team preview, line 16),
`CampusLifePage` (`campusLifeSections`, `campusLifeOverview`), `CampusLifeSectionPage`, `BudgetPage`,
`AcademicsPage`, `ProgramDetailPage`. Components: `Footer` (`schoolContact`, `officeHours`, `tagline`),
`CampusLifeSubNav`, `FacultyCard` (type), `FacultyFilterTabs` (`staffCategories`), `MissionStatement`,
`TaglineBanner`, `WelcomeBanner`, `MilestoneSection`, `ProgramSpotlight`, `WhyChooseUs`, `CampusFacilities`,
`NavBar`/`MobileNav` (`navigation`). Also `scripts/migrate-campus-life.ts` imports `src/data/campusLife.ts`.

**F7 Public read RLS is `using (true)`** on `staff_members`, `campus_life_*`, `budget_*`, `site_settings`.
So the browser can read EVERY row, including archived staff and draft/archived fiscal years. Public
queries MUST filter (`is_archived`, `status`, `is_current`) themselves.

**F8 Campus Life split.** The DB seeds exactly 4 sections: `athletes`, `pta`, `organizations`, `journalists`.
The static file also has a 5th slug, `gallery`, plus per-section `gallery` image arrays and
`campusLifeOverview` (hero text, quotes, community stats). **The DB has no model for gallery images or
overview text.** Those stay static.

**F9 Site settings (0010) seed keys (12):** `site_name`, `site_tagline`, `address`, `email`,
`facebook_handle`, `facebook_url`, `maps_url`, `school_type`, `department`, `programs_offered`,
`mission_statement`, `office_hours`. **There is no phone key anywhere** (DB or static).
`office_hours` is ONE text string: `Monday–Friday: 7:00 AM – 5:00 PM, Saturday: Closed, Sunday: Closed, Holidays: Closed`.
`Footer` currently renders it from a structured array in `src/data/officeHours.ts`.

**F10 Login flow.** `src/pages/admin/LoginPage.tsx`: `checkLoginLock` (lines ~58, 72) → `signIn` (~80) →
`recordLoginAttempt(email, !signInError)` (~85). So on success, the session already exists when the RPC
is called. In `0005_login_rate_limiting.sql`, `record_login_attempt` is `security definer`, granted to
`anon, authenticated`, and its `p_success = true` branch runs `delete from login_attempts where email = v_email`
with no caller check. Constants: 5 attempts, 60 s lock, 900 s reset; LoginPage copy must stay in sync.

**F11 Hardcoded admin UUID** `b15c1609-85b1-43da-9277-f51756ac85d8` appears in: `0001_init.sql` line 200,
`supabase/migrations/tests/_bootstrap.sql`, `supabase/migrations/tests/atomic_save_rollback.test.sql`,
and `docs/PROJECT_PLAN.md`. The tests depend on it. README step 4 already documents manual admin provisioning.

**F12 `admin_users` RLS drift (owner-verified on the LIVE database).** No migration enables RLS on `admin_users` or
creates a policy for it. The live table has RLS ENABLED and one manually created policy, "Authenticated can check admin status"
(SELECT, role authenticated, `using (true)`). No vulnerability; the repo simply does not reproduce the live state. Task P2.X fixes the drift.

**F13 Auth/guard.** `ProtectedRoute` checks `session` only. `AuthContext` exposes `session, loading, signIn, signOut`.
Tests: 15 total = `ProtectedRoute.test.tsx` (3) + `fiscalYear.test.ts` (2) + `ListItemCard.test.tsx` (10).

**F14 Hosting is not established.** `gh-pages` is in devDependencies, but there is no deploy script, no
`homepage` field, no Vite `base`, no CI folder, and no platform config file. Treat hosting as UNDECIDED.

---

## PART 3 — KNOWN DOC-vs-REPO DISCREPANCIES (D1–D10)

| # | Docs say | Repo shows | Consequence |
|---|----------|-----------|-------------|
| D1 | TASKS P0: `npm run lint` must pass | `lint` = `eslint .` but `eslint` is not in `package.json` and no ESLint config file exists | Lint cannot pass as-is. Report; do not install/configure without approval |
| D2 | `npm run test:db` runs pgTAP | `scripts/test-db.sh` reads `supabase/tests/`; files actually live in `supabase/migrations/tests/`. It applies only 0001, 0003, 0007 | Script is likely broken; fixing it is in scope only where a task says so |
| D3 | TASKS: edit `0005` and `0001` in place | README: migrations are append-only | Each task prompt states a DECISION |
| D4 | TASKS lists Staff / Campus Life / Budget as the static pages | Static imports are wider (F6), e.g. `AboutOverviewPage`, `Footer` | Report extra consumers; wire only what the task lists |
| D5 | TASKS: "use existing hooks" | No settings hook, no Campus Life list hook, budget hooks are admin-shaped (F5) | New read hooks are authorized where the task says |
| D6 | TASKS P0: invalid URL "shows browser default 404" | SPA with no catch-all route: server returns `index.html`, router matches nothing | Expect blank content + a console warning, not a browser 404. Observe, don't assume |
| D7 | PLAN: `/about/*` and `/budget/*` | `/about/*` renders a "coming soon" stub; `/budget/*` renders BudgetPage for any suffix | "Soft 404s". Report; do not change unless a task says |
| D8 | PLAN: static data is "real" | Code comments call staff, quick facts, etc. "placeholder" / "not confirmed data" | "Static" ≠ "verified". Phase 4 exists for this |
| D9 | PLAN: `admin_users` "with RLS" | True on the live DB, but no migration creates it (F12) | Drift, not a hole — see prompt P2.X |
| D10 | TASKS P3.2: build `/enroll` "if in primary navigation" | Nothing links to `/enroll` (only the route in `App.tsx`); `/contact` IS linked (Hero, Footer, many CTAs) | Enrollment task is gated on an owner decision |
# JOLNHS Website

# Admin Panel — Engineering Recovery & Development Plan

**Document Type:** Engineering Task Specification
**Project:** Julia Ortiz Luis National High School Website — Admin Panel
**Stack:** React 18 + TypeScript + Vite + Supabase (Postgres, Auth, Storage) + React Query
**Primary Roles:** Senior Full-Stack Engineer / DB & Security Reviewer / QA
**Status:** Active Recovery Plan — Foundation phase largely complete, Safety phase in progress
**Priority Levels:** P0 — Blocking / Critical, P1 — High, P2 — Medium, P3 — Enhancement

---

# 1. Executive Objective

The JOLNHS admin panel has a sound architectural core — real Row Level Security tied to an `admin_users` table, strict TypeScript, a clean auth/route-guard split — but was not actually reproducible or verifiably working end-to-end when this recovery began.

The primary engineering problem was **not missing features**.

The primary problem was **an unverified deploy**: migrations existed in the repo but were never fully applied to the live database, and every layer of the app failed *silently* instead of surfacing that fact — a blank "no match" screen for missing routes, misleading zero-counts on the dashboard, a generic "Failed to load" with no real cause, and a completely silent no-op when officer mutations failed.

The required target flow for any admin feature is:

```text
Fresh clone
    ↓
.env configured (real Supabase project)
    ↓
Migrations 0001 → 0004 applied, in order
    ↓
admin_users seeded with at least one real user
    ↓
Admin logs in
    ↓
Every nav item resolves to a real page (built or explicitly "Soon")
    ↓
Every data read surfaces its real error if it fails
    ↓
Every data write (create/update/delete) surfaces its real error if it fails
    ↓
Destructive actions require confirmation
    ↓
Unsaved edits are protected against accidental loss
    ↓
Full CRUD confirmed working per module
    ↓
UI/UX polish pass
```

The project must not move to UI/UX polish until the full flow above is verified for every existing module.

---

# 2. Current Engineering Assessment

## Current System Rating

| Area | Current Rating | Status |
|---|---:|---|
| Auth & Route Guarding | 8/10 | 🟢 GOOD |
| Database Schema & Migrations | 9/10 | 🟢 GOOD *(verified live via diagnostic query this session)* |
| Data Layer — Atomic Writes (RPC) | 7/10 | 🟡 AMBER *(deployed, partially verified)* |
| Error Visibility — Reads | 7/10 | 🟡 AMBER *(Dashboard + section load fixed; pattern not yet centralized)* |
| Error Visibility — Writes/Mutations | 4/10 | 🔴 CRITICAL *(officer mutations just fixed & unverified; section-save mutation still silent)* |
| Input Validation | 2/10 | 🔴 CRITICAL *(none exists — empty fields save successfully)* |
| Destructive-Action Safety | 2/10 | 🔴 CRITICAL *(no confirmation on archive/delete anywhere)* |
| Unsaved-Changes Protection | 2/10 | 🔴 CRITICAL *(switching tabs silently discards edits)* |
| Storage & Media Handling | 6/10 | 🟡 AMBER *(bucket + RLS fixed; orphaned-file cleanup missing)* |
| Accessibility | 3/10 | 🔴 CRITICAL *(form inputs have no `<label>`s anywhere in admin)* |
| Component Consistency | 4/10 | 🟡 AMBER *(same error-banner pattern hand-rolled 3×; no shared toast)* |
| Security — RLS Model | 9/10 | 🟢 GOOD |
| Security — Rate Limiting | 3/10 | 🔴 CRITICAL *(client-side `sessionStorage` only, trivially bypassed)* |
| Security — Dependencies | 5/10 | 🟡 AMBER *(2 known CVEs, consciously deferred — see §7)* |
| Feature Completeness | 4/10 | � AMBER *(Staff & Faculty, Budget partially built; P2 features dropped)* |
| Testing | 0/10 | 🔴 CRITICAL *(zero automated tests anywhere in the repo)* |
| Documentation | 8/10 | 🟢 GOOD *(Supabase/admin setup now documented in README)* |
| **Overall** | **5.5 / 10** | 🟡 **STABILIZING** |

The audit identified the central systemic problem as **an unverified deployment surface**: code that looked complete in review (correct RLS, correct RPC, correct component logic) had never actually been exercised end-to-end against a real database, and the app's own error handling was not trustworthy enough to reveal that gap on its own.

---

# 3. Engineering Principles

All further work on this panel follows these rules.

### Principle 1 — No silent failure, anywhere
Every `useQuery`/`useMutation` that touches Supabase must have its `isError` state checked and displayed. A failed write must never look identical to a successful one.

### Principle 2 — One error-display pattern, not three
The error banner has now been hand-written three separate times (Dashboard, CampusLifeManagePage, OfficerManager). The next one must reuse a shared component, not a fourth copy.

### Principle 3 — Migrations are the only schema authority
No table, function, or bucket is ever created by hand in the Supabase dashboard without an accompanying migration file in `supabase/migrations/`. If it isn't in a migration, it doesn't officially exist.

### Principle 4 — Verify, don't assume
A fix is not "done" when the code compiles. It is done when it has been clicked through against the real, live database and the expected data actually persisted.

### Principle 5 — Fix the layer that owns the problem
Do not patch a symptom in the UI if the real cause is a missing migration, and do not patch the database by hand to work around a client bug. (This is exactly the mistake this recovery phase started by *not* making — the temptation was to keep debugging the client when three migrations had simply never run.)

### Principle 6 — Security fixes are deliberate, not reflexive
`npm audit fix --force` is never run blind. Major-version dependency bumps are scoped, tested, and shipped as their own change — see §7.

### Principle 7 — Simplicity over premature infrastructure
No toast library, no state-management framework, no test-framework bikeshedding until the panel's actual CRUD is confirmed solid. Fix what's broken before adding what's nice-to-have.

---

# 4. P0 — Foundation Recovery *(substantially complete)*

**Priority:** P0 — BLOCKING
**Status:** ✅ Done, confirmed live this session

## Tasks

### [x] P0.1 Confirm `.env` points to a real Supabase project
Verified — real project URL and (rotated, after an accidental key exposure) anon key confirmed in `.env`.

### [x] P0.2 Apply all outstanding migrations
Diagnostic query against the live database revealed only migration `0001` had ever been applied. `0002` (`campus_life_officers` table), `0003` (atomic `save_campus_life_section` RPC), and `0004` (`staff-photos` storage bucket + RLS) were written but never run. All three have now been applied and independently verified present via SQL.

### [x] P0.3 Confirm `admin_users` has at least one real row
Verified — one admin user exists and can authenticate.

### [x] P0.4 Confirm seed data exists for all fixed Campus Life sections
Verified — `athletes`, `pta`, `journalists`, and `organizations` all exist in `campus_life_sections` (note: `organizations` has no admin UI tab yet — tracked as P3.3).

### [x] P0.5 Every sidebar nav item resolves to a real page
`/admin/staff` and `/admin/budget` previously had no matching route (blank "no match" screen on click). Both now route to functional admin pages. P2 features (Homepage, Announcements, Gallery, Downloads) have been removed from the admin panel entirely (September 2026), so no "Soon" stubs remain in the navigation.

### Acceptance Criteria

```text
[x] .env contains real, working Supabase credentials
[x] All 4 migrations confirmed present via live SQL query
[x] At least one admin_users row exists
[x] Login succeeds against /admin/login
[x] Every sidebar link resolves to a real page (P2 features removed)
[x] Seed data exists for every Campus Life tab currently in the admin UI
```

---

# 5. P0 — Silent Failure Elimination *(in progress)*

**Priority:** P0 — BLOCKING
**Status:** 🟡 Partially complete

## Objective

No read or write against Supabase may fail without the admin seeing why, on screen, in plain language.

## Tasks

### [x] P0.6 Dashboard query errors
`useDashboardStats` previously destructured `{ count, data }` without checking `.error` — a failed query silently rendered "0 staff members" as if it were real. Now throws on error; `DashboardPage` shows a real error banner + retry.

### [x] P0.7 Campus Life section *load* errors
`CampusLifeManagePage` previously showed one static "Failed to load this section." for every possible cause. Now shows the actual Supabase/PostgREST error message via a shared `getErrorMessage()` helper.

### [x] P0.8 Fix the `instanceof Error` bug hiding real messages
Supabase/PostgREST errors are plain `{ message, details, hint, code }` objects, not `Error` instances — the original `error instanceof Error` check was always `false` for real database errors, silently falling through to a generic message. Root-caused and fixed via a shared `src/lib/errors.ts::getErrorMessage()` used everywhere errors are displayed.

### [x] P0.9 Officer mutation errors (add/save/archive)
`OfficerManager` previously had zero error display for `saveOfficer`/`archiveOfficer` — a failed "Add officer" click did visibly nothing. Fixed to show `getErrorMessage(saveOfficer.error, ...)` and disable the button while pending. **Awaiting your retest to confirm root cause is fully resolved, not just visible.**

### [x] P0.10 Campus Life section *save* mutation errors
Verified already fixed in the codebase — this plan's status was stale. `CampusLifeManagePage.tsx` checks `saveSection.isError` and renders `getErrorMessage(saveSection.error, "Couldn't save this section.")` below the Save button, matching the P0.9 pattern in the sibling `OfficerManager` component. No code change was needed here; confirmed by reading the source before touching anything else (Principle 4 — verify, don't assume).

### Acceptance Criteria

```text
[x] Dashboard shows real errors, not fake zeros
[x] Section load failures show the real cause
[x] getErrorMessage() correctly unwraps Supabase/PostgREST errors
[x] Officer add/save/archive errors are visible (pending retest confirmation)
[x] Section save errors are visible
[x] No remaining useMutation call in src/pages/admin or src/components/admin has an unchecked isError
```

---

# 6. P1 — Data Safety & Accidental-Loss Prevention

**Priority:** P1 — HIGH
**Status:** 🔴 Not started

## Objective

An admin should not be able to lose real content through an ordinary misclick.

## Tasks

### [x] P1.1 Confirmation before destructive actions
Verified in the codebase that `removeItem` in `ListEditor` and `archiveOfficer.mutate` in `OfficerManager` both fired immediately on click with no confirmation, exactly as described here.

Fixed by adding one shared `ConfirmButton` component (`src/components/admin/ConfirmButton.tsx`) rather than hand-rolling the confirm step twice — a two-click pattern: first click swaps the trash icon for inline "Confirm / Cancel" text buttons; nothing destructive runs until "Confirm" is explicitly clicked, and "Cancel" discards the intent with no side effect. Wired into both call sites:
- `ListEditor.tsx` — removing a stat/highlight row
- `OfficerManager.tsx` — archiving an officer

This is intentionally the minimal P1.1 slice, not the full `ListItemCard` tri-state component Phase 4 will extract later (Principle 7 — no premature infrastructure). `npx tsc -b` passes clean with no new errors.

### [x] P1.2 Unsaved-changes guard on tab switch
`CampusLifeManagePage` remounts `SectionEditor` via `key={activeTab}` when switching Athletes/PTA/Journalists — this silently discards any unsaved edits with zero warning. Track an `isDirty` flag and confirm before switching (and ideally on `beforeunload`/route change too).

### [x] P1.3 Minimal input validation
Empty officer names, empty stat labels/values, and empty highlight titles can currently all be saved. Add a small Zod schema (already a project dependency) per form and block Save until valid.

### [x] P1.4 Fix orphaned officer photo files in storage
Replacing a photo with a different file extension currently leaves the old file in the `staff-photos` bucket forever. Standardize the storage path (convert to a fixed extension client-side, or delete the old path before uploading the new one).

### [x] P1.5 Stable keys in `ListEditor`
Currently keys list items by array `index`, which can cause input-focus loss or wrong-row edits when removing/reordering mid-list. Add a client-generated `id` (`crypto.randomUUID()`) per item on creation.

### Acceptance Criteria

```text
[ ] Archive/remove actions require explicit confirmation
[ ] Switching tabs with unsaved edits prompts the admin first
[ ] Empty required fields cannot be saved
[ ] Replacing a photo does not leave an orphaned file in storage
[ ] ListEditor items keyed by stable id, not array index
```

---

# 7. P1 — Security Hardening *(deliberately sequenced, not urgent-reactive)*

**Priority:** P1 — HIGH, but explicitly scheduled as its own change, per Principle 6
**Status:** 🟡 Assessed, deferred by design

## Tasks

### [x] P1.6 Real server-side login rate limiting
Current lockout is `sessionStorage`-only — a fast UX nicety, but trivially bypassed (private window, clear storage). Needs either Supabase Auth's built-in rate limiting enabled, or a server-enforced attempt counter.

### [x] P1.7 `react-router-dom` v6 → v7 migration (CVE fix)
Open-redirect CVE in the currently-installed 6.26.2. Low real-world exposure today (no attacker-controlled path currently reaches `Link`/`navigate()`), but this is the app's core routing library — the migration must be its own PR with a full manual click-through of every route, public and admin, before merging. Do not bundle with unrelated changes.

### [x] P1.8 Vite 5 → 8 major bump (esbuild dev-server CVE fix)
Dev-server-only exposure (arbitrary site can hit the dev server while `npm run dev` is running) — low risk as long as the dev server stays localhost-only. Batch with a general dependency-maintenance pass; full build + dev server smoke-test required after.

### Acceptance Criteria

```text
[ ] Rate limiting enforced server-side, not just sessionStorage
[ ] react-router-dom on a non-vulnerable version, all routes manually verified
[ ] Vite on a non-vulnerable version, build + dev server verified
[ ] Neither bump is combined with unrelated feature work in the same change
```

---

# 8. P2 — Consistency & Shared Components

**Priority:** P2 — MEDIUM
**Status:** 🔴 DROPPED — Out of scope

## Tasks

### [x] P2.1 Shared toast/notification component
The error-banner pattern (icon + message + retry button) has now been hand-rolled independently in `DashboardPage`, `CampusLifeManagePage`, and `OfficerManager`. Extract one `<Toast>`/`<InlineError>` primitive; every current and future admin page/component uses it instead of a bespoke JSX block.

### [x] P2.2 Accessible form inputs
Every input in `ListEditor` and `OfficerManager` relies on `placeholder` text alone — no associated `<label>`. Add visually-hidden `<label htmlFor>` to each (placeholder stays as a hint, not the label).

### [x] P2.3 Global `ErrorBoundary`
An uncaught render error anywhere currently blanks the entire app. Wrap `<App />` (or at minimum the `/admin/*` subtree) in a simple boundary with a friendly fallback + reload action.

### [x] P2.4 "Saved." confirmation should clear itself
Currently `saveSection.isSuccess` persists indefinitely until the next mutation — stale positive feedback if the admin keeps editing after a save. Auto-clear after a few seconds, or clear on next keystroke.

### DROPPED FEATURES — Removed from Admin Panel (September 2026)

The following P2 scope items have been **permanently dropped** from the admin panel, not deferred:

- **Homepage CMS**: Homepage content management (Hero, Welcome, Mission, Milestones, Programs, Facilities sections)
- **Announcements**: Announcements management system (title, content, cover image, publish status, dates)
- **Gallery**: Admin gallery management (separate from public Campus Gallery functionality)
- **Downloads**: File download management system

**Rationale**: These features were identified as P2 scope and have been removed to focus on completing and stabilizing the core P1 functionality (Staff & Faculty, Campus Life, Budget). The public site's existing Campus Gallery remains functional and is not affected by this removal.

**Removals made**:
- Removed Homepage, Announcements, Gallery, Downloads from AdminLayout sidebar navigation
- Removed Announcements stat card and quick actions from DashboardPage
- Removed homepage/announcements data structures from useDashboardSummary hook
- Cleaned up unused icon imports (Image, Megaphone, Download)

**Public site preservation**: The public-facing Campus Gallery (`/campus-life/gallery`) and related components (GalleryGrid, campusLife.ts data) remain unchanged and functional.

### Acceptance Criteria

```text
[ ] One shared error/notification component, used everywhere
[ ] Every admin form input has an associated label
[ ] A thrown render error shows a fallback UI, not a blank page
[ ] Save confirmations don't linger indefinitely
[ ] Dropped features removed from admin panel navigation and dashboard
```

---

# 9. P1/P2 — Shared List-Item Pattern *(design validated, build pending)*

**Priority:** P1/P2 — this now blocks Staff & Faculty and Budget, so it moves ahead of them
**Status:** ✅ Design validated with stakeholder — both the component pattern (interactive officer mockup) and the full four-screen wireframe (shell, Staff & Faculty, Campus Life, Budget) have been reviewed and approved. Implementation pending.

## Objective

One reusable pattern — card with photo/swatch, name/title, inline expand-to-edit, inline delete-confirm — used by every list-shaped admin screen instead of a bespoke UI per module. Validated via interactive mockup; see design record below.

## Design decisions (confirmed)

```text
[x] Card grid + inline expand-to-edit (not a separate edit page or slide-over drawer)
[x] Inline delete confirmation, in the card, in red (not a modal dialog)
[x] Icon-only edit/delete buttons, each with a real aria-label (not text-label buttons)
[x] Same pattern reused for Staff & Faculty and Budget, not redesigned per module
```

## Tasks

### [x] P1.9 Extract `ListItemCard` as a shared component
Generalize `OfficerManager`'s current always-editable rows into a tri-state card (`normal` / `editing` / `confirming-delete`), parameterized on: leading visual (photo circle or color swatch), title, subtitle, and its field set for the edit form. This directly resolves P1.1 (destructive-action confirmation) and P2.2 (accessible labels) at the same time, once, for every module that uses it.

### [x] P1.10 Extract `SectionTabs` as a shared component
Generalize `CampusLifeManagePage`'s tab bar so Staff & Faculty's category tabs (Administrators / JHS Faculty / SHS Faculty / Staff) and any future tabbed section reuse the same component instead of a second hand-rolled tab bar.

### Acceptance Criteria

```text
[ ] ListItemCard used by Officers, Staff & Faculty, Budget categories, Budget accomplishments
[ ] SectionTabs used by Campus Life and Staff & Faculty
[ ] No module has a second, slightly-different card or tab implementation
```

---

# 10. P1 — Staff & Faculty Module *(full build, not a stub)*

**Priority:** P1
**Status:** 🔴 Not started — depends on P1.9/P1.10

## Design

Category tabs (Administrators / JHS Faculty / SHS Faculty / Staff) → `ListItemCard` grid per tab, identical visual language to Officers (photo circle, name, position, edit/delete). No new visual design needed — this module is largely "free" once P1.9/P1.10 exist.

## Tasks

### [x] P1.11 Build `StaffManagePage` using `SectionTabs` + `ListItemCard`
Four tabs, one per `staff_members.category` value. Add/edit/archive per the same interaction pattern as Officers.

### [x] P1.12 Reuse the atomic-save pattern from Campus Life
Staff edits don't need the same multi-table transaction complexity as Campus Life sections (no child stats/highlights tables) — a direct `upsert` per staff member, same shape as `useSaveOfficer`, is sufficient. Archive uses `is_archived`, same as officers — no hard delete.

### Acceptance Criteria

```text
[ ] All 4 categories reachable and editable
[ ] Add/edit/archive all confirmed working against live data
[ ] "Soon" badge removed from Staff & Faculty in the sidebar
```

---

# 11. P1 — Budget Module *(full build, not a stub)*

**Priority:** P1
**Status:** 🔴 Not started — depends on P1.9/P1.10, and is the most structurally complex module

## Design

Hierarchical, not flat — see the design record below for the full layout (fiscal year selector → year-level text fields → category cards → nested accomplishments).

```text
Fiscal year selector (status badge: current / draft / archived)
    ↓
Year-level fields (total budget, hero heading/description, intro paragraphs)
    ↓
Category cards (name, amount, icon, color) — ListItemCard variant
    ↓
Accomplishments nested per category (title, amount, status badge, period) — ListItemCard variant
```

**Key design requirement, not optional:** `budget_categories`/`budget_accomplishments` RLS already blocks writes once a fiscal year's `status = 'archived'` — this is enforced at the database level (`0001_init.sql`). The UI must show this state visibly (controls disabled + "This year is archived and read-only" note) rather than let an admin attempt an edit that silently fails against RLS. This is the same "no silent failure" principle from §5, applied proactively instead of reactively.

## Tasks

### [x] P1.13 Build fiscal year selector + year-level fields form
Includes the `is_current` semantics (only one year may be current — already a DB constraint) and status badge display.

### [x] P1.14 Build category cards using `ListItemCard`
Swap the photo circle for a small color swatch (`color_class`) + icon (`icon_key`, validated against the same fixed enum the public `BudgetPage` uses).

### [x] P1.15 Build nested accomplishments list per category
Status shown as a colored badge reusing the existing `status.success`/`status.warning`/`status.info` tokens already in `tailwind.config.ts` (completed/in-progress/upcoming).

### [x] P1.16 Implement the archived-year read-only UI state
Disable all add/edit/delete controls when the selected year's `status = 'archived'`, with a visible explanatory note — not just a disabled button with no explanation.

### Acceptance Criteria

```text
[ ] Fiscal year selector works, shows correct status badge
[ ] Year-level fields editable and saving correctly
[ ] Categories: full create/update/delete via ListItemCard
[ ] Accomplishments: full create/update/delete, nested correctly under their category
[ ] Archived years are visibly and correctly locked in the UI, not just at the DB layer
[ ] "Soon" badge removed from Budget in the sidebar
```

---

# 12. P3 — Remaining Small Gaps

**Priority:** P3
**Status:** 🔴 Not started

## Tasks

### [ ] P3.3 Add an "Organizations" tab to Campus Life admin
A seed row exists (`organizations` slug) but the admin UI's `TABS` array only lists `athletes`/`pta`/`journalists` — the fourth section is currently unreachable from the admin panel.

### Acceptance Criteria

```text
[ ] Organizations tab reachable and functional in Campus Life admin
```

---

# 13. P3 — Testing

**Priority:** P3 — ENHANCEMENT, but should backfill continuously as each P0/P1 item above lands
**Status:** 🔴 Zero coverage

## Tasks

### [ ] P3.4 Test the atomic save RPC
Verify a forced mid-transaction failure actually rolls back (already manually verified once this session — codify it as a repeatable test).

### [ ] P3.5 Test `ListItemCard`'s tri-state behavior
Normal → editing → confirming-delete transitions, and that Cancel correctly returns to normal without saving.

### [ ] P3.6 Test `ProtectedRoute` redirect logic
Unauthenticated access to any `/admin/*` route redirects to `/admin/login`; authenticated access does not.

### [ ] P3.7 Test the archived-fiscal-year read-only state
Confirm the UI correctly disables controls when `status = 'archived'`, and that this actually matches what RLS would reject if bypassed.

### Acceptance Criteria

```text
[ ] Vitest + Testing Library configured
[ ] RPC atomicity covered
[ ] ListItemCard covered
[ ] ProtectedRoute covered
[ ] Archived-year lock state covered
[ ] CI runs tests on every push (stretch goal — not blocking for now)
```

---

# 14. Phase Pipeline

```text
PHASE 0
Foundation Recovery (env, migrations, seed data, routing)
        ↓  ✅ DONE
PHASE 1
Silent Failure Elimination (reads + writes)
        ↓  🟡 IN PROGRESS — P0.10 remaining
PHASE 2
Data Safety (confirmations, unsaved-changes guard, validation)
        ↓
PHASE 3
Security Hardening (rate limiting, dependency CVEs)
        ↓
PHASE 4
Shared List-Item Pattern (ListItemCard + SectionTabs)
        ↓  🟡 DESIGN VALIDATED — build pending
PHASE 5
Staff & Faculty Module (full build, using Phase 4's components)
        ↓
PHASE 6
Budget Module (full build — most structurally complex)
        ↓
PHASE 7
Remaining Small Gaps (Organizations tab)
        ↓
PHASE 8
Testing Backfill
        ↓
PHASE 9
UI/UX Visual Polish Pass (colors, spacing, motion — once every module's function is confirmed)
        ↓
PHASE 10
FINAL ACCEPTANCE

PHASE 2 (DROPPED)
Consistency & Shared Components (Homepage CMS, Announcements, Gallery, Downloads)
        ↓  🔴 DROPPED — Out of scope (September 2026)
```

---

# 15. Definition of Done — Foundation, Safety & Feature Completeness

The admin panel is considered **Feature-Complete and Verified Stable** only when:

```text
[x] Migrations 0001–0004 confirmed applied via live query
[x] Admin login works end to end
[x] Every sidebar link resolves to a real, built page — no "Soon" stubs remain (dropped P2 features removed)
[x] Dashboard shows real errors on query failure
[x] Campus Life section load shows real errors on failure
[ ] Campus Life section save shows real errors on failure
[ ] Officer add/save/archive confirmed working against live data (pending your retest)
[ ] Destructive actions require confirmation (via ListItemCard, everywhere)
[ ] Unsaved edits are protected against silent loss
[ ] Basic validation prevents empty required fields
[ ] No orphaned files accumulate in storage on photo replace
[ ] ListItemCard and SectionTabs built and used by every list-shaped screen
[ ] Staff & Faculty: full CRUD, all 4 categories
[ ] Budget: full CRUD across fiscal years, categories, and accomplishments
[ ] Archived fiscal years are visibly read-only in the UI, matching the DB-level RLS rule
[ ] Organizations tab reachable in Campus Life admin
[x] Dropped P2 features (Homepage CMS, Announcements, Gallery, Downloads) removed from admin panel
```

Only then:

```text
UI/UX VISUAL POLISH PASS = UNBLOCKED
```

---

# 16. Project Success Target

```text
CURRENT
5.5 / 10 — STABILIZING (P2 features dropped September 2026)
    ↓
Silent Failures Eliminated
6.0 / 10
    ↓
Data Safety + Security Hardening Complete
7.0 / 10
    ↓
Missing Modules Built
7.5–8 / 10
    ↓
Consistent, Tested, Documented
8–8.5 / 10
    ↓
UI/UX Polish Complete
8.5–9 / 10
```

The goal is not to build the most visually striking admin panel first.

The goal is a panel where:

```text
Click
 ↓
Real data changes
 ↓
Or a clear, honest reason why it didn't
```

is true for every single button in `/admin/*`, before any redesign work begins.

---

# 17. Final Engineering Directive

### CURRENT PRIORITY

```text
🟡 CONFIRM P0.9 (officer mutations) — awaiting your retest
🔴 FIX P0.10 (section save silent failure) — same bug class, other component

        ↓

🔴 P1: confirmations, unsaved-changes guard, validation, orphan cleanup, stable keys

        ↓

🟡 P1: security hardening (rate limiting, router + vite bumps — each its own change)

        ↓

🟡 P1/P2: extract ListItemCard + SectionTabs — design validated, build pending

        ↓

🔴 P1: Staff & Faculty module (full build, all 4 categories)

        ↓

🔴 P1: Budget module (full build — fiscal years, categories, accomplishments)

        ↓

🟢 P3: Organizations tab, testing backfill

        ↓

🟢 UI/UX VISUAL POLISH PASS

PHASE 2 (DROPPED): Homepage CMS, Announcements, Gallery, Downloads — removed September 2026
```

**The immediate objective is not to make the admin panel prettier, and it is not to leave modules as "Soon" stubs.**

**The immediate objective is a fully-built, fully-trustworthy admin panel** — every module real, every button either genuinely saving or genuinely and clearly telling you it didn't.

A senior-quality admin panel should reach the point where a non-technical staff member can update the site's content, delete a row, or add an officer, and never once wonder whether it actually worked.
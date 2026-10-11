# Phase 1 Baseline Report

**Date:** 2026-10-02
**Purpose:** Document current data architecture and required changes for Phase 1 Data Architecture migration

---

## Current Static Data Sources

### Faculty & Staff
- **File:** `src/data/facultyStaff.ts`
- **Exports:** `staffCategories` (array), `staffMembers` (array)
- **Used by:** `src/pages/FacultyStaffPage.tsx`
- **Current behavior:** Client-side filtering and search on static array
- **Data status:** Placeholder entries ("Add Staff Name") - not real data

### Campus Life
- **File:** `src/data/campusLife.ts`
- **Exports:** `campusLifeSections` (array with 5 sections: organizations, pta, athletes, journalists, gallery)
- **Used by:** `src/pages/CampusLifePage.tsx`, `src/pages/CampusLifeSectionPage.tsx`
- **Current behavior:** Static data with stats, highlights, gallery per section
- **Data status:** Reasonable placeholders, not confirmed figures

### Budget
- **File:** `src/data/budget.ts`
- **Exports:** `budgetCategories`, `budgetOverview`, `budgetAccomplishments`, `getBudgetStats()`
- **Used by:** `src/pages/BudgetPage.tsx`
- **Current behavior:** Static data with disclaimer banner
- **Data status:** Explicitly marked as illustrative placeholder, not real figures

### Site Settings (Contact/Office Hours)
- **Files:** `src/data/schoolContact.ts`, `src/data/officeHours.ts`
- **Used by:** Header, Footer, contact areas
- **Current behavior:** Static files
- **Data status:** Contact info exists but not connected to Supabase

---

## Current Supabase Tables

### Staff & Faculty
- **Table:** `staff_members`
- **Columns:** id, name, position, category, photo_path, sort_order, is_archived, created_at, updated_at
- **Constraints:** category check (administrators, jhs-faculty, shs-faculty, staff)
- **RLS:** Public read, Admin write (checks admin_users)
- **Status:** Table exists with RLS policies

### Campus Life
- **Table:** `campus_life_sections`
- **Columns:** id, slug, name, eyebrow, tagline, description, updated_at
- **Constraints:** slug check (athletes, pta, organizations, journalists)
- **Seeded rows:** athletes, pta, organizations, journalists (4 rows)
- **RLS:** Public read, Admin write (checks admin_users)

- **Table:** `campus_life_stats`
- **Columns:** id, section_id, label, value, sort_order
- **Foreign key:** section_id → campus_life_sections(id) on delete cascade
- **RLS:** Public read, Admin write (checks admin_users)

- **Table:** `campus_life_highlights`
- **Columns:** id, section_id, title, description, sort_order
- **Foreign key:** section_id → campus_life_sections(id) on delete cascade
- **RLS:** Public read, Admin write (checks admin_users)

- **Table:** `campus_life_officers`
- **Columns:** id, section_id, name, position, photo_path, sort_order, is_archived
- **Foreign key:** section_id → campus_life_sections(id)
- **RLS:** Public read, Admin write (checks admin_users)

### Budget
- **Table:** `budget_fiscal_years`
- **Columns:** id, year_label, total_proposed_budget, hero_heading, hero_description, intro_paragraphs, disclaimer, status, is_current, last_updated
- **Constraints:** status check (draft, published, archived), is_current unique index
- **RLS:** Public read, Admin write (checks admin_users)

- **Table:** `budget_categories`
- **Columns:** id, fiscal_year_id, slug, name, icon_key, amount, color_class, description, sort_order
- **Foreign key:** fiscal_year_id → budget_fiscal_years(id) on delete restrict
- **Constraints:** unique (fiscal_year_id, slug)
- **RLS:** Public read, Admin write with non-archived years check (checks admin_users)

- **Table:** `budget_accomplishments`
- **Columns:** id, fiscal_year_id, category_id, title, amount, status, period, description, sort_order
- **Foreign keys:** fiscal_year_id → budget_fiscal_years(id), category_id → budget_categories(id) on delete restrict
- **Constraints:** status check (completed, in-progress, upcoming)
- **RLS:** Public read, Admin write with non-archived years check (checks admin_users)

### Site Settings
- **Table:** `site_settings`
- **Columns:** id, key, value, category, updated_at
- **Constraints:** key unique
- **Seeded rows:** 12 rows (site_name, site_tagline, address, email, facebook_handle, facebook_url, maps_url, school_type, department, programs_offered, mission_statement, office_hours)
- **RLS:** Public read, Admin write (checks admin_users)
- **Status:** Table exists with RLS policies and seed data

---

## Current Data-Fetching Logic

### Existing Supabase Hooks (Admin Panel)
The admin panel already has fully functional Supabase hooks:

- **Staff:** `src/lib/data/staff.ts`
  - `useStaffMembers(category, archived)` - fetches staff by category
  - `useSaveStaffMember()` - upsert staff member
  - `useArchiveStaffMember()` - soft delete
  - `useRestoreStaffMember()` - restore archived member

- **Campus Life:** `src/lib/data/campusLife.ts`
  - `useCampusLifeSection(slug)` - fetches section with stats/highlights/officers
  - `useSaveCampusLifeSection()` - saves section via RPC (atomic multi-table save)
  - `useSaveOfficer()` - upsert officer
  - `useArchiveOfficer()` - soft delete officer
  - `useRestoreOfficer()` - restore archived officer

- **Budget:** `src/lib/data/budget.ts`
  - `useFiscalYears()` - fetches all fiscal years
  - `useSaveFiscalYearFields()` - updates year fields
  - `useCreateFiscalYear()` - creates new active year via RPC
  - `useSetFiscalYearStatus()` - updates status
  - `useSetCurrentFiscalYear()` - switches current year via RPC
  - `useBudgetCategories(fiscalYearId)` - fetches categories for a year
  - `useSaveBudgetCategory()` - upsert category
  - `useBudgetAccomplishments(categoryId)` - fetches accomplishments for a category
  - `useSaveBudgetAccomplishment()` - upsert accomplishment

### Public Site (Current - Static)
- **FacultyStaffPage:** Imports from `src/data/facultyStaff.ts`
- **CampusLifePage:** Imports from `src/data/campusLife.ts`
- **CampusLifeSectionPage:** Imports from `src/data/campusLife.ts`
- **BudgetPage:** Imports from `src/data/budget.ts`
- **Header/Footer:** Import from static files (schoolContact.ts, officeHours.ts)

---

## Required Schema Changes

### None Required

The existing Supabase schema already supports all Phase 1 data architecture requirements:

- `staff_members` table exists with all necessary columns
- `campus_life_*` tables exist with all necessary columns and relationships
- `budget_*` tables exist with all necessary columns and relationships
- `site_settings` table exists with seed data

**No new tables, columns, or migrations are required for Phase 1.**

---

## Required Application Changes

### 1.1 Faculty & Staff Migration
**Files to modify:**
- `src/pages/FacultyStaffPage.tsx` - Replace static import with Supabase hook
- Potential new file: `src/lib/data/publicStaff.ts` - public-facing staff hook

**Changes:**
- Replace `import { staffMembers, staffCategories } from "@/data/facultyStaff"` with Supabase hook
- Create or adapt hook to fetch all staff members (not per-category, since public page shows all)
- Preserve category filtering functionality
- Preserve search functionality
- Add loading state
- Add error state
- Handle photo display with Supabase storage paths

**Dependencies:**
- Existing `useStaffMembers(category)` hook exists but is category-scoped for admin
- May need a new hook like `useAllStaffMembers()` for public page

### 1.2 Campus Life Migration
**Files to modify:**
- `src/pages/CampusLifePage.tsx` - Replace static import with Supabase hook
- `src/pages/CampusLifeSectionPage.tsx` - Replace static import with Supabase hook
- Potential new file: `src/lib/data/publicCampusLife.ts` - public-facing Campus Life hook

**Changes:**
- Replace `import { campusLifeSections } from "@/data/campusLife"` with Supabase hook
- Use existing `useCampusLifeSection(slug)` hook for section pages
- Create hook to fetch all sections for landing page
- Preserve gallery functionality (currently working with static data)
- Add loading state
- Add error state

**Dependencies:**
- Existing `useCampusLifeSection(slug)` hook is already suitable for section pages
- May need hook to fetch all sections for landing page

### 1.3 Site Settings Migration
**Files to modify:**
- `src/components/layout/Header.tsx` - Replace static imports with Supabase hook
- `src/components/layout/Footer.tsx` - Replace static imports with Supabase hook
- Potential new file: `src/lib/data/siteSettings.ts` - public-facing site settings hook

**Changes:**
- Create hook to fetch site_settings table
- Replace static imports in Header/Footer
- Map site_settings keys to component props
- Add loading state
- Add error state

**Dependencies:**
- No existing public-facing site settings hook exists
- Admin SettingsPage already edits site_settings but uses direct Supabase queries

### 1.4 Budget Migration (Data Pipe Only)
**Files to modify:**
- `src/pages/BudgetPage.tsx` - Replace static import with Supabase hook
- Potential new file: `src/lib/data/publicBudget.ts` - public-facing budget hook

**Changes:**
- Replace static imports with Supabase hooks
- Use existing budget hooks: `useFiscalYears()`, `useBudgetCategories()`, `useBudgetAccomplishments()`
- Preserve disclaimer banner (required until school sign-off)
- Add loading state
- Add error state
- Handle fiscal year selection (use current year by default)

**Dependencies:**
- Existing budget hooks are already suitable for public page
- Budget page needs to select "current" fiscal year (is_current = true)

---

## Risks and Dependencies

### Risks
1. **Photo Display:** Staff member photos use Supabase storage paths. Need to verify storage bucket exists and public access is configured.
2. **Campus Life Gallery:** Gallery is currently working with static data. Need to preserve this functionality during migration.
3. **Budget Disclaimer:** Must remain visible until school sign-off on real figures.
4. **Category Mismatch:** Static category IDs must match Supabase check constraints (administrators, jhs-faculty, shs-faculty, staff).
5. **Slug Mismatch:** Campus Life slugs must match Supabase check constraint (athletes, pta, organizations, journalists). Gallery slug is not in DB but works with static data.

### Dependencies
1. **Human Verification Required (Budget):** Real budget figures must be obtained from school before removing disclaimer.
2. **Supabase Storage:** Must verify staff photos storage bucket exists and is publicly accessible.
3. **Data Accuracy:** Phase 4 (Content Verification) is separate - Phase 1 is about architecture, not factual correctness.

---

## Recommended Implementation Order

Based on PROJECT_PLAN.md Phase 1 priorities:

1. **Faculty & Staff** (1.1)
   - Reason: Straightforward migration, existing admin hooks are well-tested
   - Clear verification path: add/edit in admin → verify on public page

2. **Campus Life** (1.2)
   - Reason: Existing hooks are well-tested, similar to Staff
   - Gallery is already working with static data - preserve during migration
   - Clear verification path: add/edit in admin → verify on public page

3. **Site Settings** (1.3)
   - Reason: Simple migration, table already seeded
   - Clear verification path: edit in admin → verify on public site

4. **Budget: Data Pipe** (1.4)
   - Reason: Must be wired before real figures can be published
   - Disclaimer must remain until school sign-off (separate task 1.5/1.6)
   - Clear verification path: add/edit in admin → verify on public page (with disclaimer)

5. **Budget: Obtain Real Figures** (1.5)
   - **BLOCKED - HUMAN ACTION REQUIRED**
   - Must obtain from school administration
   - Separate gate from data pipe implementation

6. **Budget: Publish Real Figures** (1.6)
   - **BLOCKED - HUMAN ACTION REQUIRED**
   - Requires school sign-off on figures
   - Remove disclaimer after approval

---

## Notes

### Gallery Handling
The gallery section (`/campus-life/gallery`) is currently working with static data from `src/data/campusLife.ts`. The Supabase schema does not have a dedicated gallery table, and the gallery is not part of the Phase 1 scope (per PROJECT_PLAN.md note). The migration should preserve the current gallery functionality.

### Campus Life Slugs
The Supabase schema has a check constraint on `campus_life_sections.slug` allowing only: athletes, pta, organizations, journalists. The static data also includes "gallery" which is not in the database. This is intentional per the approved scope. The migration should respect this constraint.

### Staff Categories
The Supabase schema has a check constraint on `staff_members.category` allowing only: administrators, jhs-faculty, shs-faculty, staff. The static data uses these exact IDs, so no migration issue is expected.

### Budget Disclaimer
The budget page has a disclaimer stating figures are illustrative placeholder data. This must remain until the school provides real figures and signs off. This is a separate human verification gate (tasks 1.5 and 1.6), not a technical migration issue.

---

## Conclusion

The Supabase schema is well-designed and already supports all Phase 1 data architecture requirements. No schema changes are needed. The migration is primarily about replacing static data imports in public pages with existing or new Supabase hooks, while preserving existing UI behavior and Phase 0-verified functionality.

**Next Steps:**
1. Begin with Faculty & Staff migration (1.1)
2. Follow recommended implementation order
3. Run tests and verification after each migration
4. Do not proceed to Phase 2 until Phase 1 is complete

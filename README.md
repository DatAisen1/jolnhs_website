# Julia Ortiz Luis National High School — Website

React 18 + TypeScript + Vite + Tailwind CSS + Supabase implementation of the JOLNHS website with admin panel.

## Overview

The JOLNHS website serves as the public-facing information portal for Julia Ortiz Luis National High School, featuring:
- Homepage with school overview and mission
- About section with faculty & staff directory
- Academics section with program details
- Campus Life section with student organizations, athletics, PTA, and campus gallery
- Budget transparency page with proposed budget and accomplishments
- Admin panel for managing content (Staff & Faculty, Campus Life, Budget, Settings)

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite 8.3.0
- **Styling:** Tailwind CSS 3.4.13
- **Routing:** React Router DOM 7.18.3
- **State Management:** TanStack React Query 5.59.0
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Validation:** Zod 3.23.8
- **Animations:** Framer Motion 11.11.9
- **Testing:** Vitest 5.0.1, Testing Library
- **Icons:** Lucide React

## Current Status

**Admin Panel:** Functional with full CRUD for Staff & Faculty, Campus Life, Budget, and Settings. Archive/restore and CSV export features implemented. Server-side login rate limiting (with caller-identity check) and RLS for fiscal-year immutability in place.

**Public Site:** All major content domains read from Supabase — Faculty & Staff, Campus Life, Budget, and site settings. Admin changes propagate to the public site automatically via React Query invalidation.

**Architecture:** Admin Panel → Supabase → Public Website. Implemented for all content domains. The only exception is the Campus Gallery (`/campus-life/gallery`), which intentionally remains static (no gallery table in the approved schema).

For detailed development status, tasks, and deployment plan, see [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) and [docs/TASKS.md](docs/TASKS.md).

## Project Structure

```
src/
├── components/
│   ├── ui/          # Button, Card, Container, SectionHeading, ImagePlaceholder
│   ├── layout/       # Header, NavBar, NavDropdown, MobileNav, Footer
│   ├── admin/        # Admin-specific components (AdminLayout, AdminButton, etc.)
│   ├── faculty/      # Faculty & Staff components
│   ├── campusLife/   # Campus Life components
│   └── budget/       # Budget components
├── data/             # Static content data (to be replaced with Supabase)
├── hooks/             # Custom React hooks
├── lib/              # Utilities, validation, Supabase client
├── pages/            # Page components (public and admin)
├── types/             # TypeScript interfaces
└── App.tsx           # Router + layout shell
supabase/
└── migrations/        # Database migrations
docs/
├── PROJECT_PLAN.md    # Development and deployment plan
├── TASKS.md          # Actionable task tracker
└── archive/          # Archived documentation
```

## Development Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your Supabase project's values (Project Settings → API in the Supabase dashboard):

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

**Required for the public site:**
- `VITE_SUPABASE_URL` — Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous/public API key

**Optional for server-side scripts (not required for the site itself):**
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key. **Never commit this or expose it in client code.** Only needed if you add server-side scripts or migrations that require elevated privileges. Keep it in `.env` which is gitignored.

The anon key is safe to expose in the client bundle — it has no special privileges. All write access is enforced server-side by Postgres Row Level Security (RLS).

### 3. Run the migrations

In order, via the Supabase SQL Editor (or `supabase db push` if you have the CLI linked to your project):

```bash
supabase/migrations/0001_init.sql                        # core schema + RLS
supabase/migrations/0002_campus_life_officers.sql         # officers table
supabase/migrations/0003_save_campus_life_section_rpc.sql # atomic save fn
supabase/migrations/0004_staff_photos_bucket.sql           # storage bucket + RLS
supabase/migrations/0005_login_rate_limiting.sql          # rate limiting
supabase/migrations/0006_set_current_fiscal_year.sql      # fiscal year RPC
supabase/migrations/0007_fix_save_campus_life_section_ordinality.sql
supabase/migrations/0008_budget_management_fields.sql      # budget admin fields
supabase/migrations/0009_active_fiscal_year_rls.sql       # fiscal year RLS
supabase/migrations/0010_site_settings.sql                # site settings
supabase/migrations/0011_login_rate_limit_identity_check.sql # login rate-limit identity check
supabase/migrations/0012_admin_users_rls.sql             # admin_users RLS alignment
```

Migrations are append-only: never edit a file once it's been run against any environment — add a new `000N_*.sql` file instead.

### 4. Create your admin user

Admin access is gated by membership in the `admin_users` table, not just by having a Supabase Auth account.

1. In the Supabase dashboard: **Authentication → Users → Add user**, create yourself an email/password account.
2. Copy that user's UUID.
3. Run:
   ```sql
   insert into admin_users (user_id) values ('paste-the-uuid-here');
   ```
4. Log in at `/admin/login` with that email/password.

There is deliberately no login link on the public site — share `/admin/login` directly with admins (bookmark or email). Admin pages also carry a `noindex` meta tag so search engines don't surface them.

**Session policy:** a login lasts only for the current browser tab — refreshing keeps you signed in, but closing the tab/browser or opening a new tab requires signing in again. After 30 minutes of inactivity you're signed out automatically (with a 1-minute warning and a "Stay signed in" button). The real security boundary remains Supabase Auth + `admin_users` + RLS, not the hidden URL.

To revoke access later, `delete from admin_users where user_id = '...'` — their Auth account can keep existing, they just lose write access.

### 5. Start development server

```bash
npm run dev      # http://localhost:5173
```

## Available Scripts

```bash
npm run dev         # Start Vite dev server
npm run build       # TypeScript build + Vite production build
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run test        # Run Vitest tests
npm run test:watch  # Run Vitest in watch mode
npm run test:ui     # Run Vitest UI
npm run test:db     # Run database tests
```

## Public Routes

- `/` — HomePage
- `/about` — AboutOverviewPage
- `/about/overview` — AboutOverviewPage
- `/about/faculty-staff` — FacultyStaffPage (with category filtering)
- `/academics` — AcademicsPage
- `/academics/:slug` — ProgramDetailPage
- `/campus-life` — CampusLifePage
- `/campus-life/:slug` — CampusLifeSectionPage (includes `/campus-life/gallery`)
- `/budget` — BudgetPage
- `/contact` — ContactPage
- `*` — NotFoundPage (global 404; `/enroll` intentionally falls through to 404 — the school has no enrollment function)

## Admin Routes

- `/admin` — Dashboard
- `/admin/login` — Login page
- `/admin/reset-password` — Password reset (for Supabase email link)
- `/admin/campus-life` — Campus Life management
- `/admin/staff` — Staff & Faculty management
- `/admin/budget` — Budget management
- `/admin/settings` — Site settings

## Design Tokens

All colors, type scale, spacing, and radii live in `tailwind.config.ts` — never hardcode a hex value or px size in a component; extend the token system instead.

| Token | Value |
|---|---|
| Primary | `#1C3E7C` |
| Secondary | `#FFFFFF` |
| Background | `#F9FBFD` |
| Border | `#E1E7F0` |
| Text primary | `#0B1730` |
| Text secondary | `#4A5B7C` |
| Font | Inter (body), Playfair Display (headings) |

## Accessibility

- Skip-to-content link, visible on keyboard focus
- Semantic landmarks (`header`, `nav`, `main`, `footer`) and correct heading order
- All dropdowns keyboard-operable with `aria-expanded` / `aria-haspopup`
- Visible focus rings site-wide (`:focus-visible`)
- `prefers-reduced-motion` respected for all animation
- Color contrast checked against WCAG AA at every text/background pairing

## Documentation

- **[docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md)** — Development and deployment plan, current status, phases, and architecture
- **[docs/TASKS.md](docs/TASKS.md)** — Actionable task tracker with verification criteria
- **[docs/archive/JOLNHS_Admin_Development_Plan.md](docs/archive/JOLNHS_Admin_Development_Plan.md)** — Archived admin panel development plan (historical reference)

## Testing

The project uses Vitest and Testing Library for automated testing. Current test coverage:

- `src/components/admin/ProtectedRoute.test.tsx` — Route protection tests
- `src/lib/access/fiscalYear.test.ts` — Fiscal year access logic tests
- `src/pages/admin/ListItemCard.test.tsx` — ListItemCard component tests

Run tests with `npm run test`. For watch mode, use `npm run test:watch`. For the Vitest UI, use `npm run test:ui`.

## Important Notes

### Node Version

Requires Node.js >= 22.18.0 and npm >= 10.0.0 (see `engines` in `package.json`). Test-only dependencies use jsdom 26, which supports Node >= 18.

### Data Architecture

The admin panel writes to Supabase and all public content pages read from Supabase. Static files in `src/data/` now only carry UI metadata (icons, themes, gallery images) that is not stored in the database.

### Budget Data

The Budget page reads from Supabase but real figures are still pending school verification. Do not display real-looking figures until the school provides sign-off.

### Campus Gallery

The Campus Gallery (`/campus-life/gallery`) intentionally uses static data from `src/data/campusLife.ts` — there is no gallery table in the approved schema. Preserve this during any future migration.

### Security

- Row Level Security (RLS) enforces write access at the database level
- Server-side login rate limiting via `record_login_attempt` RPC with caller-identity check (migration 0011)
- `admin_users` table protected by RLS with self-row read policy (migration 0012)
- Admin access requires membership in `admin_users` table, enforced in ProtectedRoute
- Sessions are tab-scoped (sessionStorage) with a 30-minute idle sign-out; admin pages are `noindex`ed and no public link to `/admin/login` exists
- Residual risk (documented, not fixed): an anonymous caller can submit *failed* attempts for another email to trigger a 60s lockout — a server/edge layer or CAPTCHA would be needed to close this

### Dependency Audit Status

`npm audit` reports 9 remaining vulnerabilities (2 moderate, 7 high), all in **build-time devDependencies** (tailwindcss v3 chain: braces, chokidar, micromatch, fast-glob, postcss-selector-parser; gh-pages chain: globby). None ship in the production bundle. The only fix offered is `npm audit fix --force`, which upgrades to Tailwind CSS v4 — a breaking change requiring a config and utility-class migration. Deferred until a dedicated Tailwind v4 upgrade task.

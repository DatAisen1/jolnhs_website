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

**Admin Panel:** Functional with full CRUD for Staff & Faculty, Campus Life, Budget, and Settings. Archive/restore and CSV export features implemented. Server-side login rate limiting and RLS for fiscal-year immutability in place.

**Public Site:** Currently using static data files for content (Staff, Campus Life, Budget). Admin panel writes to Supabase, but public pages read from static files — this data-source inconsistency is the highest-priority issue to resolve.

**Architecture:** The target architecture is Admin Panel → Supabase → Public Website. This is partially implemented (admin works with Supabase), but public pages need to be connected to Supabase data.

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
- `/enroll` — Enrollment (stub — coming soon)
- `/contact` — Contact (stub — coming soon)

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

### Data Source Inconsistency

The admin panel writes to Supabase, but public pages currently read from static files in `src/data/`. This is the highest-priority issue to resolve. See docs/PROJECT_PLAN.md Phase 1 for the plan to connect public pages to Supabase.

### Budget Data

The Budget page currently displays placeholder/illustrative figures marked with a disclaimer. Real figures should not be displayed until the school verifies them and provides sign-off.

### Campus Gallery

The Campus Gallery (`/campus-life/gallery`) is a working section with real data from `src/data/campusLife.ts`. This is NOT broken and should be preserved during the data architecture migration.

### Security

- Row Level Security (RLS) enforces write access at the database level
- Server-side login rate limiting is implemented via `record_login_attempt` RPC
- Admin access requires membership in `admin_users` table
- Known issue: `record_login_attempt` allows anonymous caller to clear lockout for arbitrary email (see docs/PROJECT_PLAN.md Phase 2.1)

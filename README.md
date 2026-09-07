# Julia Ortiz Luis National High School — Website (Homepage)

React 18 + TypeScript + Vite + Tailwind CSS implementation of the JOLNHS homepage.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

## Admin panel & Supabase setup

The public site has no login, but `/admin/*` is a small authenticated panel
(currently: Campus Life content) backed by Supabase (Postgres + Auth +
Storage). None of this is required to run the public site locally — skip
this section if you're only working on homepage/marketing pages.

### 1. Environment variables

Copy `.env.example` to `.env` and fill in your Supabase project's values
(Project Settings → API in the Supabase dashboard):

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

The anon key is safe to expose in the client bundle — it has no special
privileges. All write access is enforced server-side by Postgres Row Level
Security (RLS), not by keeping this key secret.

### 2. Run the migrations

In order, via the Supabase SQL Editor (or `supabase db push` if you have
the CLI linked to your project):

```
supabase/migrations/0001_init.sql                        # core schema + RLS
supabase/migrations/0002_campus_life_officers.sql         # officers table
supabase/migrations/0003_save_campus_life_section_rpc.sql # atomic save fn
supabase/migrations/0004_staff_photos_bucket.sql           # storage bucket + RLS
```

Migrations are append-only: never edit a file once it's been run against
any environment — add a new `000N_*.sql` file instead.

### 3. Create your admin user

Admin access is gated by membership in the `admin_users` table, **not**
just by having a Supabase Auth account — anyone can sign up, but only
rows in this table can write data (see the RLS policies in
`0001_init.sql`).

1. In the Supabase dashboard: **Authentication → Users → Add user**, create
   yourself an email/password account.
2. Copy that user's UUID.
3. Run:
   ```sql
   insert into admin_users (user_id) values ('paste-the-uuid-here');
   ```
4. Log in at `/admin/login` with that email/password.

To revoke access later, `delete from admin_users where user_id = '...'` —
their Auth account can keep existing, they just lose write access.

### 4. Storage bucket

`0004_staff_photos_bucket.sql` creates the `staff-photos` bucket
(public read, 2 MB limit, JPEG/PNG/WEBP only, admin-only write) used for
officer photos in Campus Life. If you ever need to recreate it by hand
instead of via migration, match those same settings and RLS policies —
otherwise photo uploads will fail RLS checks even for a valid admin.

## Project structure

```
src/
├── components/
│   ├── ui/          # Button, Card, Container, SectionHeading, ImagePlaceholder
│   ├── layout/       # Header, NavBar, NavDropdown, MobileNav, Footer
│   └── sections/     # One component per homepage section
├── data/             # Content, separated from components
├── hooks/             # useScrollHeader, useCountUp
├── pages/            # HomePage composes sections
├── types/             # Shared TS interfaces
└── App.tsx           # Router + layout shell
```

## Design tokens

All colors, type scale, spacing, and radii live in `tailwind.config.ts` —
never hardcode a hex value or px size in a component; extend the token
system instead.

| Token | Value |
|---|---|
| Primary | `#1E3A8A` |
| Secondary | `#3B82F6` |
| Background | `#F8FAFC` |
| Border | `#E2E8F0` |
| Text primary / secondary | `#0F172A` / `#475569` |
| Font | Inter |
| Section spacing | 120px desktop / 64px mobile |
| Card radius | 16px |

## Placeholder system

No external images are used anywhere. Every image slot renders through
`<ImagePlaceholder label recommendedSize alt />`, so swapping in real
photography later means changing props, not markup.

## Accessibility

- Skip-to-content link, visible on keyboard focus
- Semantic landmarks (`header`, `nav`, `main`, `footer`) and correct heading order
- All dropdowns keyboard-operable with `aria-expanded` / `aria-haspopup`
- Visible focus rings site-wide (`:focus-visible`)
- `prefers-reduced-motion` respected for all animation
- Color contrast checked against WCAG AA at every text/background pairing

## Next steps (out of scope for this deliverable)

- Build out `/about`, `/academics`, `/campus-life`, `/budget` routes (currently stubbed)
- Replace `ImagePlaceholder` instances with real photography + alt text
- Wire `LatestNews` / `UpcomingEvents` to a CMS or API instead of static data files
- Add unit tests (Vitest + Testing Library) for interactive components (`NavDropdown`, `MobileNav`, `useCountUp`)
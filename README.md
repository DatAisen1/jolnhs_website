# Julia Ortiz Luis National High School — Website (Homepage)

React 18 + TypeScript + Vite + Tailwind CSS implementation of the JOLNHS homepage.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

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

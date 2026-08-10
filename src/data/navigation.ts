import type { NavItem } from "@/types";

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About JOLNHS",
    href: "/about",
    dropdown: [
      { label: "Overview", href: "/about/overview" },
      { label: "Administrators", href: "/about/faculty-staff?category=administrators" },
      { label: "JHS Faculty", href: "/about/faculty-staff?category=jhs-faculty" },
      { label: "SHS Faculty", href: "/about/faculty-staff?category=shs-faculty" },
      { label: "Staff", href: "/about/faculty-staff?category=staff" },
    ],
  },
  {
    label: "Academics",
    href: "/academics",
    dropdown: [
      { label: "Overview", href: "/academics" },
      { label: "STE", href: "/academics/ste" },
      { label: "SP-ICT", href: "/academics/sp-ict" },
      { label: "SNED", href: "/academics/sned" },
      { label: "Regular Program", href: "/academics/regular" },
      { label: "Senior High School", href: "/academics/shs" },
    ],
  },
  {
    label: "Campus Life",
    href: "/campus-life",
    dropdown: [
      { label: "Overview", href: "/campus-life" },
      { label: "Organizations", href: "/campus-life/organizations" },
      { label: "PTA", href: "/campus-life/pta" },
      { label: "Athletes", href: "/campus-life/athletes" },
      { label: "Campus Journalists", href: "/campus-life/journalists" },
      { label: "Campus Gallery", href: "/campus-life/gallery" },
    ],
  },
  // No `dropdown` here on purpose: Proposed Budget, Budget Allocation, and
  // Accomplishments used to be three separate routes (each with its own
  // dropdown link below). They're now three sections of ONE page
  // (/budget), reached via BudgetSectionNav's in-page anchors instead —
  // see src/components/budget/BudgetSectionNav.tsx. Omitting `dropdown`
  // makes NavDropdown/MobileNav render this as a plain link automatically.
  { label: "Budget Transparency", href: "/budget" },
];
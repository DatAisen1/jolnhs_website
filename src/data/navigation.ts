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
      { label: "Organizations", href: "/campus-life/organizations" },
      { label: "PTA", href: "/campus-life/pta" },
      { label: "Athletes", href: "/campus-life/athletes" },
      { label: "Campus Journalists", href: "/campus-life/journalists" },
      { label: "Campus Gallery", href: "/campus-life/gallery" },
    ],
  },
  {
    label: "Budget Transparency",
    href: "/budget",
    dropdown: [
      { label: "Proposed Budget", href: "/budget/proposed" },
      { label: "Budget Allocation", href: "/budget/allocation" },
      { label: "Accomplishments", href: "/budget/accomplishments" },
    ],
  },
];
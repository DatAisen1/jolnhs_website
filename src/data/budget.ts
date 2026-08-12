import {
  BookOpen,
  Wrench,
  Laptop,
  Users,
  Zap,
  Trophy,
  HeartPulse,
  Briefcase,
  Wallet,
  LayoutGrid,
  CheckCircle2,
  CalendarClock,
} from "lucide-react";
import { formatCompactPHP } from "@/lib/currency";
import type { BudgetAccomplishment, BudgetCategory, BudgetOverview, BudgetStat } from "@/types";

/**
 * IMPORTANT — placeholder data:
 * Every figure below is illustrative, not an official DepEd/school
 * record. It exists so the page's layout, data flow, and components can
 * be built and reviewed now, before finance/admin supplies confirmed
 * numbers. Swapping in real figures later only means editing the values
 * in this file — no component or page code changes needed.
 */

export const budgetCategories: BudgetCategory[] = [
  {
    id: "instructional-materials",
    name: "Instructional Materials & Supplies",
    icon: BookOpen,
    amount: 1_150_000,
    percentage: 23.7,
    colorClass: "bg-primary",
    description:
      "Textbooks, workbooks, laboratory consumables, and classroom supplies for both Junior and Senior High School.",
  },
  {
    id: "facilities-maintenance",
    name: "Facilities Maintenance & Repair",
    icon: Wrench,
    amount: 980_000,
    percentage: 20.2,
    colorClass: "bg-primary-600",
    description:
      "Upkeep of classrooms, comfort rooms, covered walkways, and other campus structures across the school year.",
  },
  {
    id: "ict-learning-tech",
    name: "ICT & Learning Technology",
    icon: Laptop,
    amount: 720_000,
    percentage: 14.8,
    colorClass: "bg-primary-400",
    description:
      "Computer laboratory upgrades, network infrastructure, and digital learning tools for students and faculty.",
  },
  {
    id: "utilities",
    name: "Utilities",
    icon: Zap,
    amount: 610_000,
    percentage: 12.6,
    colorClass: "bg-primary-700",
    description: "Electricity, water, and internet connectivity for the entire campus.",
  },
  {
    id: "student-programs",
    name: "Student Programs & Activities",
    icon: Users,
    amount: 540_000,
    percentage: 11.1,
    colorClass: "bg-primary-300",
    description:
      "Leadership training, club activities, academic competitions, and Supreme Student Government initiatives.",
  },
  {
    id: "sports-pe",
    name: "Sports & Physical Education",
    icon: Trophy,
    amount: 320_000,
    percentage: 6.6,
    colorClass: "bg-primary-800",
    description: "Sports fest logistics, PE equipment, and varsity team support.",
  },
  {
    id: "health-nutrition",
    name: "Health & Nutrition Program",
    icon: HeartPulse,
    amount: 280_000,
    percentage: 5.8,
    colorClass: "bg-primary-900",
    description: "School clinic supplies and the student feeding program for the school year.",
  },
  {
    id: "admin-operations",
    name: "Administrative & Office Operations",
    icon: Briefcase,
    amount: 250_000,
    percentage: 5.2,
    colorClass: "bg-primary-200",
    description: "Office supplies, records management, and general administrative costs.",
  },
];

export const budgetOverview: BudgetOverview = {
  fiscalYear: "SY 2026–2027",
  totalProposedBudget: budgetCategories.reduce((sum, c) => sum + c.amount, 0),
  lastUpdated: "August 2026",
  heroHeading: "Budget Transparency",
  heroDescription:
    "A clear, public look at how JOLNHS proposes, allocates, and spends its annual operating budget — so every peso is traceable back to a classroom, a program, or a student.",
  introEyebrow: "OPEN GOVERNANCE",
  introHeading: "Where the school's money goes, in plain view.",
  introParagraphs: [
    "This page brings together the school's proposed annual budget, how that budget is allocated across categories, and the concrete projects it has funded — in one place, without needing to dig through separate documents.",
    "Figures update each school year as the budget moves from proposal to final allotment. The three sections below can be read independently: start with whichever answers the question you actually have.",
  ],
  disclaimer:
    "Figures on this page are illustrative placeholder data for development purposes and do not represent confirmed DepEd or school financial records. They will be replaced with verified figures once finance and administration finalize the annual budget.",
  ctaHeading: "Have a question about the budget?",
  ctaBlurb:
    "Transparency works both ways — reach out to the school administration for clarifications, or to request the full itemized budget document.",
  ctaLabel: "Contact the Administration",
  ctaHref: "/contact",
};

export const budgetAccomplishments: BudgetAccomplishment[] = [
  {
    id: "computer-lab-upgrade",
    title: "New Computer Laboratory Workstations",
    categoryId: "ict-learning-tech",
    amount: 650_000,
    status: "completed",
    period: "March 2026",
    description:
      "20 new desktop workstations installed in the main computer laboratory, replacing units that had exceeded their service life.",
  },
  {
    id: "cr-renovation",
    title: "Comfort Room Renovation — Main Building",
    categoryId: "facilities-maintenance",
    amount: 420_000,
    status: "completed",
    period: "January 2026",
    description:
      "Full renovation of student and faculty comfort rooms, including plumbing repairs, new fixtures, and accessibility improvements.",
  },
  {
    id: "science-lab-equipment",
    title: "Science Laboratory Equipment Upgrade",
    categoryId: "instructional-materials",
    amount: 380_000,
    status: "completed",
    period: "February 2026",
    description:
      "New microscopes, glassware, and safety equipment for Junior High School science laboratories.",
  },
  {
    id: "wifi-expansion",
    title: "School-Wide Wi-Fi Expansion",
    categoryId: "ict-learning-tech",
    amount: 180_000,
    status: "in-progress",
    period: "Ongoing",
    description:
      "Extending reliable internet coverage from the computer laboratory to classrooms and the library.",
  },
  {
    id: "sports-fest-2026",
    title: "Sports Fest 2026 Equipment & Venue",
    categoryId: "sports-pe",
    amount: 150_000,
    status: "completed",
    period: "February 2026",
    description: "Equipment, venue preparation, and logistics for the annual intramurals.",
  },
  {
    id: "feeding-program",
    title: "Nutrition Feeding Program",
    categoryId: "health-nutrition",
    amount: 280_000,
    status: "in-progress",
    period: "SY 2025–2026",
    description:
      "Daily supplemental feeding for identified undernourished students, run in coordination with the school clinic.",
  },
  {
    id: "library-restock",
    title: "Library Book & Reading Materials Restocking",
    categoryId: "instructional-materials",
    amount: 220_000,
    status: "completed",
    period: "November 2025",
    description: "New fiction, reference, and curriculum-aligned titles added to the school library.",
  },
  {
    id: "walkway-repair",
    title: "Covered Walkway Repair",
    categoryId: "facilities-maintenance",
    amount: 190_000,
    status: "completed",
    period: "October 2025",
    description: "Structural repair and repainting of the covered walkway connecting the main academic buildings.",
  },
  {
    id: "leadership-summit",
    title: "SSG Leadership Summit & Student Activities",
    categoryId: "student-programs",
    amount: 120_000,
    status: "completed",
    period: "September 2025",
    description: "Officer training and a year-long calendar of student-led events for the Supreme Student Government.",
  },
  {
    id: "solar-lighting",
    title: "Solar-Assisted Corridor Lighting",
    categoryId: "utilities",
    amount: 160_000,
    status: "upcoming",
    period: "Target: October 2026",
    description: "Pilot installation of solar-assisted lighting along main corridors to reduce electricity costs.",
  },
];

/**
 * getBudgetStats
 *
 * Builds the four stat-band numbers from the actual data arrays rather
 * than from hand-typed strings — see BudgetOverview's doc comment for
 * why. Call once at the top of BudgetPage; the result is cheap to
 * compute (array length + one reduce) so there's no need to memoize it.
 */
export function getBudgetStats(
  overview: BudgetOverview,
  categories: BudgetCategory[],
  accomplishments: BudgetAccomplishment[]
): BudgetStat[] {
  return [
    { label: "Total Proposed Budget", value: formatCompactPHP(overview.totalProposedBudget), icon: Wallet },
    { label: "Budget Categories", value: String(categories.length), icon: LayoutGrid },
    { label: "Funded Accomplishments", value: String(accomplishments.length), icon: CheckCircle2 },
    { label: "yearyaeres Year", value: overview.fiscalYear, icon: CalendarClock },
  ];
}
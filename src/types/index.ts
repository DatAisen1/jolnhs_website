// Central domain types. Components and data files both import from here
// so shape changes only need to happen in one place.

import type { LucideIcon } from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  dropdown?: NavLink[];
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  imageSize: string;
  imagePosition: "left" | "right";
  theme: "light" | "dark";
}

export interface ProgramHighlight {
  title: string;
  description: string;
}

export interface ProgramFact {
  label: string;
  value: string;
}

export interface ProgramStrand {
  name: string;
  description: string;
}

/**
 * AcademicProgram
 *
 * `slug` must match the trailing path segment used in the Academics
 * dropdown (see data/navigation.ts, e.g. "/academics/ste" -> slug "ste")
 * so the landing page's "Learn More" links, AcademicsSubNav, and the
 * dynamic /academics/:slug detail page can never drift out of sync with
 * each other.
 *
 * `visual` is a discriminated union rather than an optional image field:
 * a JHS track (STE, SP-ICT, SNED, Regular) isn't a physical place the way
 * a Facility is, so it gets an icon instead of a photo placeholder — see
 * ImagePlaceholder's own doc comment on when NOT to use it. Senior High
 * School gets a real photo slot since it corresponds to an actual campus
 * building/cohort, same as a Facility.
 *
 * `strands` is optional and SHS-only — the four JHS tracks are each a
 * single program, but Senior High School itself splits into strands
 * (STEM, ABM, HUMSS, TVL). ProgramDetailPage only renders that section
 * when a program actually has strands, instead of every program needing
 * an empty array.
 */
export interface AcademicProgram {
  id: string;
  slug: string;
  eyebrow: string;
  name: string;
  fullName: string;
  description: string;
  imagePosition: "left" | "right";
  theme: "light" | "dark";
  visual:
    | { kind: "icon"; icon: LucideIcon }
    | { kind: "photo"; imageSize: string };
  quickFacts: ProgramFact[];
  highlights: ProgramHighlight[];
  admissionRequirements: string[];
  strands?: ProgramStrand[];
}

export interface CampusLifeStat {
  label: string;
  value: string;
}

export interface CampusLifeHighlight {
  title: string;
  description: string;
}

export interface CampusLifeGalleryItem {
  label: string;
  imageSize: string;
}

export interface CampusLifeSection {
  id: string;
  slug: string;
  icon: LucideIcon;
  eyebrow: string;
  name: string;
  tagline: string;
  description: string;
  theme: "light" | "dark";
  stats: CampusLifeStat[];
  highlights: CampusLifeHighlight[];
  gallery: CampusLifeGalleryItem[];
  ctaLabel: string;
  ctaHref: string;
}

// ---------------------------------------------------------------------------
// Budget Transparency
// ---------------------------------------------------------------------------
//
// The page has three parts — Proposed Budget, Budget Allocation, and
// Accomplishments — all driven from ONE `budgetCategories` list plus one
// `budgetAccomplishments` list, rather than three separate hardcoded
// content blocks. That way a category's amount/percentage can never drift
// out of sync between the table (Proposed Budget) and the bar chart
// (Budget Allocation) — they render the same array two different ways.

/** Funding/implementation state of a single accomplishment line item. */
export type BudgetItemStatus = "completed" | "in-progress" | "upcoming";

/** One big number in the top-of-page stats band (e.g. "8 Budget Categories"). */
export interface BudgetStat {
  label: string;
  value: string;
  icon: LucideIcon;
}

/**
 * BudgetCategory
 *
 * One line item in the school's proposed annual budget (e.g. "ICT &
 * Learning Technology"). `percentage` is stored rather than computed at
 * render time so every consumer (table row, bar width, tooltip) reads the
 * exact same number without re-deriving it from `amount` in three places.
 */
export interface BudgetCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  amount: number; // PHP, whole pesos
  percentage: number; // 0–100, share of totalProposedBudget
  colorClass: string; // Tailwind bg-* class used for the allocation bar fill
  description: string;
}

/**
 * BudgetAccomplishment
 *
 * A specific project or program the budget funded (or will fund).
 * `categoryId` links back to `BudgetCategory.id` so each accomplishment
 * can show which budget line it draws from, instead of duplicating a
 * free-text category name that could drift from the category list.
 */
export interface BudgetAccomplishment {
  id: string;
  title: string;
  categoryId: string;
  amount: number;
  status: BudgetItemStatus;
  period: string; // e.g. "March 2026" or "SY 2025–2026"
  description: string;
}

/**
 * Page-level copy and headline figures for the Budget Transparency page.
 *
 * Deliberately excludes a `stats` array: the four stat-band numbers
 * (total budget, category count, accomplishment count, fiscal year) are
 * each derivable from `budgetCategories`/`budgetAccomplishments`, so
 * BudgetPage computes them at render time instead of this file carrying
 * hand-typed strings that could silently drift from the underlying data.
 */
export interface BudgetOverview {
  fiscalYear: string;
  totalProposedBudget: number;
  lastUpdated: string;
  heroHeading: string;
  heroDescription: string;
  introEyebrow: string;
  introHeading: string;
  introParagraphs: string[];
  disclaimer: string;
  ctaHeading: string;
  ctaBlurb: string;
  ctaLabel: string;
  ctaHref: string;
}
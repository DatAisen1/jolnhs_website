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
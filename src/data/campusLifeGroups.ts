import type { LucideIcon } from "lucide-react";
import { Users, Trophy, Newspaper } from "lucide-react";

/**
 * Campus Life group vocabularies — the schema is one generic
 * Group -> Members/Photos shape; THIS file is what makes
 * "organizations" feel like organizations and "athletes" feel like
 * sports. Both the admin manager and the public section page read
 * labels and role rules from here so the two can never drift.
 *
 * Not present: PTA (keeps its flat officer list per project scope)
 * and gallery (not a Supabase-backed section).
 */

export type GroupMemberRole = "adviser" | "officer" | "coach" | "player" | "staff";

export interface GroupSectionConfig {
  /** campus_life_sections.slug this config belongs to */
  slug: "organizations" | "athletes" | "journalists";
  /** Singular noun — "Add Sport", "Archive this Organization" */
  groupNoun: string;
  /** Public band heading — "Our Organizations" */
  bandHeading: string;
  bandEyebrow: string;
  /** Empty-state copy when no groups exist yet */
  emptyTitle: string;
  emptyBody: string;
  icon: LucideIcon;
  /** Role picker: role key -> how the admin labels + describes it.
   *  `allowsPhoto` is also the privacy rule — players are minors and
   *  get no individual photo (mirrored by a DB CHECK, see 0015). */
  roles: Record<
    GroupMemberRole,
    { label: string; addLabel: string; allowsPhoto: boolean; positionHint: string }
  >;
  /** Order roles render in publicly (leaders first). */
  roleOrder: GroupMemberRole[];
}

export const groupSectionConfigs: Record<string, GroupSectionConfig> = {
  organizations: {
    slug: "organizations",
    groupNoun: "Organization",
    bandHeading: "Our Organizations",
    bandEyebrow: "GET INVOLVED",
    emptyTitle: "No organizations listed yet",
    emptyBody: "Student organizations will appear here as they're added.",
    icon: Users,
    roles: {
      adviser: { label: "Adviser", addLabel: "Add Adviser", allowsPhoto: true, positionHint: "e.g. Club Adviser" },
      officer: { label: "Officer", addLabel: "Add Officer", allowsPhoto: true, positionHint: "e.g. President" },
      coach: { label: "Coach", addLabel: "Add Coach", allowsPhoto: true, positionHint: "" },
      player: { label: "Player", addLabel: "Add Player", allowsPhoto: false, positionHint: "" },
      staff: { label: "Staff", addLabel: "Add Staff", allowsPhoto: true, positionHint: "" },
    },
    roleOrder: ["adviser", "officer"],
  },
  athletes: {
    slug: "athletes",
    groupNoun: "Sport",
    bandHeading: "Sports Teams",
    bandEyebrow: "VARSITY PROGRAM",
    emptyTitle: "No sports teams listed yet",
    emptyBody: "Varsity teams will appear here as they're added.",
    icon: Trophy,
    roles: {
      adviser: { label: "Adviser", addLabel: "Add Adviser", allowsPhoto: true, positionHint: "" },
      officer: { label: "Officer", addLabel: "Add Officer", allowsPhoto: true, positionHint: "" },
      coach: { label: "Coach", addLabel: "Add Coach", allowsPhoto: true, positionHint: "e.g. Head Coach" },
      player: { label: "Player", addLabel: "Add Player", allowsPhoto: false, positionHint: "e.g. Point Guard" },
      staff: { label: "Staff", addLabel: "Add Staff", allowsPhoto: true, positionHint: "" },
    },
    roleOrder: ["coach", "player"],
  },
  journalists: {
    slug: "journalists",
    groupNoun: "Publication",
    bandHeading: "Our Publications",
    bandEyebrow: "CAMPUS PRESS",
    emptyTitle: "No publications listed yet",
    emptyBody: "Campus publications and desks will appear here as they're added.",
    icon: Newspaper,
    roles: {
      adviser: { label: "Adviser", addLabel: "Add Adviser", allowsPhoto: true, positionHint: "e.g. Publication Adviser" },
      officer: { label: "Officer", addLabel: "Add Officer", allowsPhoto: true, positionHint: "" },
      coach: { label: "Coach", addLabel: "Add Coach", allowsPhoto: true, positionHint: "" },
      player: { label: "Player", addLabel: "Add Player", allowsPhoto: false, positionHint: "" },
      staff: { label: "Staff", addLabel: "Add Staff", allowsPhoto: true, positionHint: "e.g. Editor-in-Chief" },
    },
    roleOrder: ["adviser", "staff"],
  },
};

/** Section slugs that use the grouped manager (everything except PTA/gallery). */
export const GROUPED_SECTION_SLUGS = Object.keys(groupSectionConfigs);

/** DB role keys -> plural public grouping label inside an expanded group. */
export const ROLE_GROUP_LABELS: Record<GroupMemberRole, string> = {
  adviser: "Adviser",
  officer: "Officers",
  coach: "Coaches",
  player: "Players",
  staff: "Staff",
};

/** Turns a group name into a URL-safe slug for #deep-links and the
 *  (section_id, slug) unique key. "Basketball (Boys)" -> "basketball-boys". */
export function groupSlugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

import { BookOpen, Wrench, Laptop, Users, Zap, Trophy, HeartPulse, Briefcase, type LucideIcon } from "lucide-react";

/**
 * Fixed icon enum for `budget_categories.icon_key` (P1.14).
 *
 * Deliberately the same 8 icons the public `BudgetPage`'s placeholder
 * data (`src/data/budget.ts`) already uses for its 8 categories — the
 * DB column is validated against this exact set in app code (there's
 * no Postgres enum type for it, same tradeoff `staff_members.category`
 * makes with a `check` constraint instead of a real enum), so an admin
 * can never save an icon_key the public site has no icon for.
 */
export const BUDGET_ICON_OPTIONS: ReadonlyArray<{ key: string; label: string; icon: LucideIcon }> = [
  { key: "BookOpen", label: "Instructional Materials", icon: BookOpen },
  { key: "Wrench", label: "Facilities & Maintenance", icon: Wrench },
  { key: "Laptop", label: "ICT & Technology", icon: Laptop },
  { key: "Users", label: "Student Programs", icon: Users },
  { key: "Zap", label: "Utilities", icon: Zap },
  { key: "Trophy", label: "Sports & PE", icon: Trophy },
  { key: "HeartPulse", label: "Health & Nutrition", icon: HeartPulse },
  { key: "Briefcase", label: "Administrative & Operations", icon: Briefcase },
];

export const BUDGET_ICON_KEYS = BUDGET_ICON_OPTIONS.map((o) => o.key) as [string, ...string[]];

/** Falls back to Briefcase for any icon_key that predates this enum or
 *  was written directly to the DB outside the app (defensive only —
 *  the app itself never writes anything else). */
export function getBudgetIcon(key: string): LucideIcon {
  return BUDGET_ICON_OPTIONS.find((o) => o.key === key)?.icon ?? Briefcase;
}
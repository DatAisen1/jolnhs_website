/**
 * staffRank — orders school personnel by DepEd position hierarchy
 * instead of alphabetically. The hierarchy follows the standard
 * Philippine civil-service pay scale for schools, most senior first:
 *
 *   School Principal (IV > III > II > I)
 *   Assistant Principal
 *   Head Teacher (VI > V > IV > III > II > I)
 *   Master Teacher (IV > III > II > I)
 *   Teacher (III > II > I)
 *   Special-needs / guidance / registrar / nurse and similar
 *   Admin officers and assistants (higher grade first)
 *   Security, utility, other non-teaching roles
 *   Anything unrecognized (after everything, by name)
 *
 * A department head outranks everyone in their department — the flag
 * is checked in the comparator, not folded into the rank itself.
 */
const RANK_RULES: ReadonlyArray<readonly [number, RegExp]> = [
  // "Assistant" must match before plain "principal" — same ordering
  // trap as president vs vice president in positionRank.ts.
  [20, /^assistant\s+(school\s+)?principal\b|^asst\.?\s+principal\b/],
  [10, /^(school\s+)?principal\b|^school\s+head\b/],
  [30, /^head\s+teacher\b/],
  [40, /^master\s+teacher\b/],
  [50, /^teacher\b/],
  [55, /^(special\s+(education|needs)\s+teacher|guidance\s+(counselor|teacher)|sped\s+teacher)\b/],
  [60, /^(administrative|admin)\s+officer\b/],
  [65, /^(administrative|admin)\s+assistant\b|^school\s+registrar\b|^registrar\b|^nurse\b|^librarian\b|^guidance\s+(counselor|coordinator)|^accountant\b|^cashier\b|^bookkeeper\b|^budget\s+officer|^records\s+officer|^supply\s+officer|^ict\s+coordinator|^coordinator\b/],
  [80, /^(security|watchman|utility|janitor|custodian|driver|aide|helper|cook|canteen)\b/],
];

const ROMAN: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6 };

function normalize(position: string | null | undefined): string {
  return (position ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** "TEACHER III,PhD" -> { tier: 50, grade: 3 }. Grade matters inside
 *  a tier: Principal IV outranks Principal I, Teacher III outranks I. */
function parseRank(position: string | null | undefined): { tier: number; grade: number } {
  const text = normalize(position);
  if (!text) return { tier: 100, grade: 0 };
  for (const [tier, rule] of RANK_RULES) {
    if (rule.test(text)) {
      const gradeMatch = /\b(vi|v|iv|iii|ii|i)\b/.exec(text);
      return { tier, grade: gradeMatch ? ROMAN[gradeMatch[1]] ?? 0 : 0 };
    }
  }
  return { tier: 90, grade: 0 };
}

/** Exported for tests and for a possible "rank" badge later. */
export function staffPositionRank(position: string | null | undefined): number {
  return parseRank(position).tier;
}

/**
 * Comparator for staff lists: department head first, then DepEd
 * hierarchy (higher grade inside a tier wins — Principal IV > I),
 * then name for a stable deterministic order.
 */
export function compareStaffByRank<
  T extends { name: string; position: string | null; is_department_head?: boolean },
>(a: T, b: T): number {
  if (!!a.is_department_head !== !!b.is_department_head) {
    return a.is_department_head ? -1 : 1;
  }
  const ra = parseRank(a.position);
  const rb = parseRank(b.position);
  if (ra.tier !== rb.tier) return ra.tier - rb.tier;
  // Higher grade first within a tier — compare explicitly rather than
  // subtracting so equal/missing grades never produce NaN.
  if (ra.grade !== rb.grade) return rb.grade - ra.grade;
  return a.name.localeCompare(b.name);
}

/**
 * positionRank — orders roster members by POSITION hierarchy instead
 * of alphabetically (an officer list sorted A-Z buries the President
 * between the Auditor and the Secretary, which no one expects).
 *
 * The ranks below follow the standard Filipino student-organization
 * hierarchy (first rank wins on its first matching rule). Positions
 * we don't recognize land at 70 — after the board, before plain
 * "Member". An explicit `sort_order` value always beats rank.
 */
const RANK_RULES: ReadonlyArray<readonly [number, RegExp]> = [
  // Leadership first — advisers, coaches, moderators always lead.
  [0, /\b(adviser|moderator|mentor|coach)\b/i],
  // Vice ranks below President, so it must MATCH before "president".
  [20, /\b(vice\s?(president|chair|captain)|v\.?p\.?\b|deputy)\b/i],
  [10, /\b(president|head|chair(person|man|woman)?)\b/i],
  [30, /\bsecretary\b/i],
  // "Assistant Secretary" etc. sit right after their principal.
  [35, /\b(assistant|asst\.?|associate)\b/i],
  [40, /\btreasurer\b/i],
  [45, /\bauditor\b/i],
  // PIO = Public Information Officer, PO = Peace Officer ("SSLG P.O."
  // et al) — the abbreviation family the PRO rule used to miss.
  [55, /\b(p\.?r\.?o\.?|p\.?i\.?o\.?|p\.?o\.?|public\s?(relations|information)|information\s?officer|peace\s?officer|protocol)\b/i],
  [60, /\b(spokesperson|media|press|journalist)\b/i],
  [65, /\b(representative|delegate)\b/i],
  [75, /\b(co[\s-]?captain)\b/i],
  [80, /\bcaptain\b/i],
  [90, /\b(member|player)\b/i],
];

export function positionRank(position: string | null | undefined): number {
  const text = (position ?? "").trim();
  if (!text) return 100;
  for (const [rank, rule] of RANK_RULES) {
    if (rule.test(text)) return rank;
  }
  return 70;
}

/** "Grade 7 Representative" -> 7 — lets the comparator order same-rank
 *  grade representatives 7 -> 12 instead of alphabetically. */
function gradeNumber(position: string | null | undefined): number {
  const match = /grade\s*(\d{1,2})\b/i.exec(position ?? "");
  return match ? parseInt(match[1], 10) : Infinity;
}

/**
 * Comparator for roster items: explicit sort_order wins, then
 * position hierarchy, then grade progression for grade-level roles,
 * then name as the final deterministic tiebreak.
 */
export function compareMembersByPosition<T extends { sort_order: number; position: string | null; name: string }>(
  a: T,
  b: T,
): number {
  if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
  const rankDiff = positionRank(a.position) - positionRank(b.position);
  if (rankDiff !== 0) return rankDiff;
  // Compare graded roles numerically — but Infinity - Infinity is
  // NaN (a no-grade pair), and returning NaN from a comparator sorts
  // anarchy. Guard with strict inequality instead.
  const gradeA = gradeNumber(a.position);
  const gradeB = gradeNumber(b.position);
  if (gradeA !== gradeB) return gradeA - gradeB;
  return a.name.localeCompare(b.name);
}

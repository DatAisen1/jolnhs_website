/**
 * formatPHP
 *
 * WHAT: Formats a whole-peso number as "₱1,150,000" (no decimals — school
 *       budget line items are never fractional centavos in practice).
 * WHY:  Every budget figure (stats band, table, bar chart, accomplishment
 *       cards) must render with the exact same grouping and currency
 *       symbol. Without one shared helper, it's easy for one spot to
 *       show "PHP 1150000" and another "₱1,150,000.00" — small
 *       inconsistencies that undermine trust on a transparency page
 *       specifically about money.
 * WHEN: Anywhere a BudgetCategory.amount or BudgetAccomplishment.amount
 *       is displayed.
 * WHEN NOT: Percentages — those are already precomputed on the data and
 *           just need a trailing "%", not this helper.
 */
export function formatPHP(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * formatCompactPHP
 *
 * A shorter form ("₱4.85M") for tight spaces like the hero stat band,
 * where the full grouped figure would wrap awkwardly on mobile. Full
 * figures (via formatPHP) are still used everywhere precision matters,
 * e.g. table rows and accomplishment cards.
 */
export function formatCompactPHP(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(amount);
}
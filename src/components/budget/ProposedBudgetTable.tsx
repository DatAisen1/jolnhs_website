import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { formatPHP } from "@/lib/currency";
import type { BudgetCategory } from "@/types";

/**
 * ProposedBudgetTable
 *
 * WHAT: The itemized list of every proposed budget category, amount, and
 *       its share of the total — a real `<table>` on wider screens, and
 *       a stacked card list on mobile (an 8-row, 3-column table doesn't
 *       fit a narrow viewport without horizontal scrolling, which is a
 *       worse reading experience than restacking the same data).
 * WHY:  This is the page's "ledger" — the literal answer to "what is the
 *       school proposing to spend, and on what." A table (not a chart)
 *       is the right shape here because the exact peso figures matter
 *       more than the visual comparison — that comparison is what
 *       BudgetAllocationChart is for, right below.
 * WHEN: The Proposed Budget section only.
 * WHEN NOT: Don't reuse this for Accomplishments — those have a status
 *           and a date, which read better as cards (AccomplishmentCard)
 *           than table columns.
 */
export function ProposedBudgetTable({ categories, total }: { categories: BudgetCategory[]; total: number }) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";

  return (
    <motion.div variants={staggerContainer} initial={initial} whileInView="show" viewport={viewportOnce}>
      {/* Desktop / tablet: real table, so screen readers get proper
          row/column semantics via <th scope="col"|"row">. */}
      <table className="hidden w-full border-collapse overflow-hidden rounded-card border border-border text-left sm:table">
        <caption className="sr-only">Proposed budget by category, with amount and share of total</caption>
        <thead className="bg-primary-50">
          <tr>
            <th scope="col" className="px-6 py-4 text-small font-semibold uppercase tracking-wide text-primary">
              Category
            </th>
            <th scope="col" className="px-6 py-4 text-small font-semibold uppercase tracking-wide text-primary">
              Proposed Amount
            </th>
            <th scope="col" className="px-6 py-4 text-small font-semibold uppercase tracking-wide text-primary">
              Share of Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-white">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.tr
                key={category.id}
                variants={fadeUp}
                className={`transition-colors hover:bg-primary-50/60 ${index % 2 === 1 ? "bg-background/60" : ""}`}
              >
                <th scope="row" className="flex items-center gap-3 px-6 py-4 text-body font-medium text-text-primary">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50">
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" strokeWidth={1.75} />
                  </span>
                  {category.name}
                </th>
                <td className="px-6 py-4 text-body text-text-primary">{formatPHP(category.amount)}</td>
                <td className="px-6 py-4 text-body text-text-secondary">{category.percentage.toFixed(1)}%</td>
              </motion.tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-primary bg-primary-50">
            <th scope="row" className="px-6 py-4 text-body font-bold text-primary">
              Total Proposed Budget
            </th>
            <td className="px-6 py-4 text-body font-bold text-primary">{formatPHP(total)}</td>
            <td className="px-6 py-4 text-body font-bold text-primary">100%</td>
          </tr>
        </tfoot>
      </table>

      {/* Mobile: one card per category, same data, no table chrome. */}
      <ul className="flex flex-col gap-4 sm:hidden">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <motion.li
              key={category.id}
              variants={fadeUp}
              className="rounded-card border border-border bg-white p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50">
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" strokeWidth={1.75} />
                </span>
                <span className="text-body font-medium text-text-primary">{category.name}</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-subtitle text-primary">{formatPHP(category.amount)}</span>
                <span className="text-small text-text-secondary">{category.percentage.toFixed(1)}%</span>
              </div>
            </motion.li>
          );
        })}
        <li className="flex items-baseline justify-between rounded-card bg-primary-50 p-5">
          <span className="text-body font-bold text-primary">Total Proposed Budget</span>
          <span className="text-subtitle font-bold text-primary">{formatPHP(total)}</span>
        </li>
      </ul>
    </motion.div>
  );
}
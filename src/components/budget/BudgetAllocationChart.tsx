import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { formatPHP } from "@/lib/currency";
import type { BudgetCategory } from "@/types";

/**
 * BudgetAllocationChart
 *
 * WHAT: A horizontal 100%-width bar per category, sized to that
 *       category's percentage share, so the biggest and smallest budget
 *       lines are visually obvious at a glance.
 * WHY:  ProposedBudgetTable already lists every exact figure — this
 *       section answers a different question ("what does the school
 *       spend the MOST on, relatively?") that a table of numbers makes
 *       a reader do mental math for. A visual bar answers it instantly.
 *       Built with plain divs + Tailwind width percentages instead of
 *       pulling in a charting library (recharts, chart.js, ...) — eight
 *       static horizontal bars don't need a charting engine's
 *       axes/tooltips/responsive-container machinery, and skipping the
 *       dependency keeps the page's JS bundle smaller.
 * WHEN: The Budget Allocation section only.
 * WHEN NOT: If this later needs interactivity (hover tooltips, drill-
 *           down, multi-year comparison), that's the signal to
 *           introduce a real charting library instead of hand-rolling
 *           it further in CSS.
 */
export function BudgetAllocationChart({ categories }: { categories: BudgetCategory[] }) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";

  // Bars are sized relative to the largest category, not literally to
  // 0–100%, so the largest bar always reaches a readable full width
  // instead of topping out at ~24% (this category set's actual max share).
  const maxPercentage = Math.max(...categories.map((c) => c.percentage));

  return (
    <motion.ul
      variants={staggerContainer}
      initial={initial}
      whileInView="show"
      viewport={viewportOnce}
      className="flex flex-col gap-5"
    >
      {categories.map((category) => {
        const Icon = category.icon;
        const relativeWidth = (category.percentage / maxPercentage) * 100;

        return (
          <motion.li key={category.id} variants={fadeUp}>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="flex items-center gap-2 text-body font-medium text-text-primary">
                <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" strokeWidth={1.75} />
                {category.name}
              </span>
              <span className="text-small text-text-secondary">
                {formatPHP(category.amount)} · {category.percentage.toFixed(1)}%
              </span>
            </div>

            {/* Track + fill. role="img" + aria-label gives screen readers
                the same info conveyed visually, since the fill width
                itself carries no semantic markup on its own. */}
            <div
              role="img"
              aria-label={`${category.name}: ${category.percentage.toFixed(1)} percent of total budget`}
              className="h-3 w-full overflow-hidden rounded-full bg-primary-50"
            >
              <motion.div
                className={`h-full rounded-full ${category.colorClass}`}
                initial={shouldReduceMotion ? { width: `${relativeWidth}%` } : { width: 0 }}
                whileInView={{ width: `${relativeWidth}%` }}
                viewport={viewportOnce}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
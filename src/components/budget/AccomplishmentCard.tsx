import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { formatPHP } from "@/lib/currency";
import type { BudgetAccomplishment, BudgetCategory, BudgetItemStatus } from "@/types";

const statusStyles: Record<BudgetItemStatus, { label: string; className: string }> = {
  completed: { label: "Completed", className: "bg-status-success-bg text-status-success-text" },
  "in-progress": { label: "In Progress", className: "bg-status-warning-bg text-status-warning-text" },
  upcoming: { label: "Upcoming", className: "bg-status-info-bg text-status-info-text" },
};

/**
 * AccomplishmentCard
 *
 * WHAT: One card per funded project — title, status badge, source
 *       category, amount spent, period, and a short description.
 * WHY:  This is the section that turns "the budget" from an abstract
 *       ledger into concrete outcomes ("₱650,000 → 20 new computer lab
 *       workstations, completed March 2026"). Cards (not another table)
 *       because each item needs a status badge and a longer description
 *       — a table would either truncate the description or force
 *       horizontal scrolling.
 *
 *       The top accent strip reuses the parent category's existing
 *       `colorClass` (already defined for the allocation bar chart) —
 *       no new data, just a second use of it — so a card visually ties
 *       back to its category at a glance before you even read the label.
 * WHEN: The Accomplishments section only.
 */
export function AccomplishmentCard({
  accomplishment,
  category,
}: {
  accomplishment: BudgetAccomplishment;
  category: BudgetCategory | undefined;
}) {
  const status = statusStyles[accomplishment.status];
  const CategoryIcon = category?.icon;

  return (
    <motion.li
      variants={fadeUp}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div aria-hidden="true" className={`h-1.5 w-full ${category?.colorClass ?? "bg-primary"}`} />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-subtitle text-text-primary">{accomplishment.title}</h3>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-small font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        {category && (
          <span className="mt-2 flex items-center gap-1.5 text-small font-medium text-primary">
            {CategoryIcon && <CategoryIcon className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.75} />}
            {category.name}
          </span>
        )}

        <p className="mt-3 flex-1 text-body text-text-secondary">{accomplishment.description}</p>

        <dl className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div>
            <dt className="text-small text-text-secondary">Amount</dt>
            <dd className="text-body font-semibold text-text-primary">{formatPHP(accomplishment.amount)}</dd>
          </div>
          <div className="text-right">
            <dt className="text-small text-text-secondary">Period</dt>
            <dd className="text-body font-semibold text-text-primary">{accomplishment.period}</dd>
          </div>
        </dl>
      </div>
    </motion.li>
  );
}
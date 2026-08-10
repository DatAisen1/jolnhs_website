import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { formatPHP } from "@/lib/currency";
import type { BudgetAccomplishment, BudgetCategory, BudgetItemStatus } from "@/types";

const statusStyles: Record<BudgetItemStatus, { label: string; className: string }> = {
  completed: { label: "Completed", className: "bg-green-100 text-green-800" },
  "in-progress": { label: "In Progress", className: "bg-amber-100 text-amber-800" },
  upcoming: { label: "Upcoming", className: "bg-primary-50 text-primary" },
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
      className="flex flex-col rounded-card border border-border bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
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
    </motion.li>
  );
}
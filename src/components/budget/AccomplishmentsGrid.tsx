import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, viewportOnce } from "@/lib/motion";
import { AccomplishmentCard } from "./AccomplishmentCard";
import type { BudgetAccomplishment, BudgetCategory } from "@/types";

/**
 * AccomplishmentsGrid
 *
 * WHAT: Lays out every BudgetAccomplishment as a card in a responsive
 *       grid, resolving each one's `categoryId` to the full
 *       BudgetCategory (for its icon + name) once, here, instead of
 *       every AccomplishmentCard re-searching the categories array.
 * WHY:  Keeps the O(n) category lookup in one place. With 8 categories
 *       and ~10 accomplishments this is trivially cheap either way, but
 *       centralizing it means AccomplishmentCard can stay a simple
 *       presentational component that just receives what it needs.
 */
export function AccomplishmentsGrid({
  accomplishments,
  categories,
}: {
  accomplishments: BudgetAccomplishment[];
  categories: BudgetCategory[];
}) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return (
    <motion.ul
      variants={staggerContainer}
      initial={initial}
      whileInView="show"
      viewport={viewportOnce}
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {accomplishments.map((item) => (
        <AccomplishmentCard key={item.id} accomplishment={item} category={categoryById.get(item.categoryId)} />
      ))}
    </motion.ul>
  );
}
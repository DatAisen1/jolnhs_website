import { Quote } from "lucide-react";
import { motion } from "framer-motion";
import { scaleIn } from "@/lib/motion";
import type { CampusLifeQuote } from "@/data/campusLifeOverview";

/**
 * QuoteCard
 *
 * WHAT: A single first-person testimonial — quote, name, role.
 * WHY:  Stats prove scale; a quote proves what being part of it actually
 *       feels like. Pairing CommunityStats' numbers with a couple of
 *       real (or representative) student voices keeps the landing page
 *       from reading like a spec sheet.
 * WHEN: Only the Campus Life landing page for now, in a 2-up grid. Not
 *       used on detail pages — those already have highlights + gallery
 *       doing the "show, don't tell" work.
 *
 * No `initial`/`whileInView` of its own — inherits the stagger trigger
 * from the parent's staggerContainer, same pattern as CampusLifeCard.
 */
export function QuoteCard({ quote }: { quote: CampusLifeQuote }) {
  return (
    <motion.figure
      variants={scaleIn}
      className="flex flex-col rounded-card border border-border bg-white p-8"
    >
      <Quote className="h-8 w-8 text-primary-200" aria-hidden="true" strokeWidth={1.5} />
      <blockquote className="mt-4 text-body italic text-text-secondary">
        “{quote.quote}”
      </blockquote>
      <figcaption className="mt-6 border-t border-border pt-4">
        <p className="font-semibold text-text-primary">{quote.name}</p>
        <p className="text-small text-text-secondary">{quote.role}</p>
      </figcaption>
    </motion.figure>
  );
}
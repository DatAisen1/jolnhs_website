import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import type { CampusLifeStat } from "@/types";

/**
 * CommunityStats
 *
 * WHAT: A full-width dark band of big numbers (e.g. "18+ Active
 *       Organizations").
 * WHY:  Numbers are the fastest way to communicate scale and credibility
 *       — a visitor deciding whether this campus community is "big
 *       enough to matter" reads four numbers in two seconds instead of
 *       three paragraphs. It also gives the landing page a strong dark
 *       visual break between the intro copy and the section cards,
 *       instead of white-section-after-white-section.
 * WHEN: The Campus Life landing page, directly after the intro. Could
 *       also open a section detail page if a future page wants the same
 *       "numbers up front" treatment — accepts any CampusLifeStat[], not
 *       hardcoded to the landing page's own data.
 */
export function CommunityStats({ stats }: { stats: CampusLifeStat[] }) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";

  return (
    <section className="bg-primary-700 py-section-sm md:py-section">
      <Container>
        <motion.div
          variants={staggerContainer}
          initial={initial}
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp} className="flex flex-col gap-2">
              <span className="text-heading text-white">{stat.value}</span>
              <span className="text-small font-medium uppercase tracking-widest text-secondary-light">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import type { BudgetStat } from "@/types";

/**
 * BudgetStatsBand
 *
 * WHAT: A full-width dark band of the four headline budget numbers
 *       (total proposed budget, category count, accomplishment count,
 *       fiscal year).
 * WHY:  Mirrors CommunityStats' role on the Campus Life page — give the
 *       single most important numbers up front, in two seconds, before
 *       asking the visitor to read the detailed table/chart below.
 * WHEN: Directly below the intro copy on the Budget Transparency page.
 */
export function BudgetStatsBand({ stats }: { stats: BudgetStat[] }) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";

  return (
    <section className="bg-primary-700 py-section-sm md:py-section">
      <Container>
        <motion.dl
          variants={staggerContainer}
          initial={initial}
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} variants={fadeUp} className="flex flex-col items-center gap-2">
                <Icon className="h-6 w-6 text-secondary-300" aria-hidden="true" strokeWidth={1.75} />
                <dd className="text-heading text-white">{stat.value}</dd>
                <dt className="text-small font-medium uppercase tracking-widest text-secondary-light">
                  {stat.label}
                </dt>
              </motion.div>
            );
          })}
        </motion.dl>
      </Container>
    </section>
  );
}
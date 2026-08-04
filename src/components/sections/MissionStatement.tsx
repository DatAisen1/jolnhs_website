import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { mission } from "@/data/mission";
import { fadeUp, viewportOnce } from "@/lib/motion";

/**
 * MissionStatement
 *
 * WHAT: A quiet, centered identity block — no button, no link, nothing
 *       transactional. Just a statement of what the school is.
 * WHY:  This site is informational (parents, students, community members
 *       browsing), not a transactional enrollment funnel. A CTA button
 *       here ("Enroll Now") implies a function the site doesn't actually
 *       perform, which misleads visitors and undersells what this section
 *       should really do: answer "what is JOLNHS?" in one clear paragraph.
 * WHEN NOT: If this site later grows a real enrollment flow (a form, a
 *           portal), a CTA belongs THERE — not bolted onto a section whose
 *           job is just introducing the school.
 */
export function MissionStatement() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="border-y border-border bg-white py-section-sm md:py-section" aria-labelledby="mission-heading">
      <Container className="text-center">
        <motion.div
          variants={fadeUp}
          initial={shouldReduceMotion ? "show" : "hidden"}
          whileInView="show"
          viewport={viewportOnce}
          className="mx-auto max-w-2xl"
        >
          <p className="mb-3 text-small font-semibold uppercase tracking-widest text-primary">
            {mission.eyebrow}
          </p>
          <h2 id="mission-heading" className="text-section text-text-primary">
            {mission.heading}
          </h2>
          <p className="mt-5 text-body text-text-secondary">{mission.paragraph}</p>
        </motion.div>
      </Container>
    </section>
  );
}

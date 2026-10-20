import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { mission } from "@/data/mission";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { usePageContent } from "@/lib/data/pageContent";

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
  // The mission_statement settings key has been admin-editable since the
  // settings page shipped — the public side just never read it. Now it
  // does, with the static copy as the offline fallback.
  const paragraph = usePageContent("mission_statement", mission.paragraph);

  return (
    <section className="border-y border-border bg-surface py-section-sm md:py-section" aria-labelledby="mission-heading">
      <Container className="text-center">
        <motion.div
          variants={fadeUp}
          initial={shouldReduceMotion ? "show" : "hidden"}
          whileInView="show"
          viewport={viewportOnce}
          className="mx-auto max-w-2xl"
        >
          <p className="mb-3 text-small font-semibold uppercase tracking-[0.18em] text-primary">
            {mission.eyebrow}
          </p>
          <h2 id="mission-heading" className="text-section text-text-primary">
            {mission.heading}
          </h2>
          <p className="mt-5 text-body text-text-secondary">{paragraph}</p>
        </motion.div>
      </Container>
    </section>
  );
}
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SchoolBadge } from "@/components/ui/SchoolBadge";
import { milestone } from "@/data/milestone";
import { fadeUp, viewportOnce } from "@/lib/motion";

/**
 * Centered milestone block: heading, two ceremonial badges side by side,
 * a supporting paragraph, and an outlined "See More" pill. Uses
 * SchoolBadge (not a gray placeholder box) for the two emblems, since a
 * badge/seal is a designed graphic, not a photo waiting on real content —
 * treating it as a gray box would look unfinished rather than placeholder.
 */
export function MilestoneSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-white py-section-sm md:py-section" aria-labelledby="milestone-heading">
      <Container className="text-center">
        <motion.div
          variants={fadeUp}
          initial={shouldReduceMotion ? "show" : "hidden"}
          whileInView="show"
          viewport={viewportOnce}
        >
          <h2 id="milestone-heading" className="mx-auto max-w-3xl text-section text-text-primary">
            {milestone.heading}
          </h2>

          <div className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-10">
            <SchoolBadge label="JO" ariaLabel="JOLNHS official crest" size={112} src="/images/logo-jolnhs.png" />
            <SchoolBadge label="Est." ariaLabel="DepEd seal" tone="primary-600" size={112} src="/images/logo-deped.png" />
          </div>

          <p className="mx-auto mt-10 max-w-3xl text-body text-text-secondary">
            {milestone.paragraph}
          </p>

          <Button
            variant="outline"
            href="/about"
            className="mt-8 !border-primary !text-primary hover:!bg-primary hover:!text-white"
          >
            {milestone.buttonLabel}
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}

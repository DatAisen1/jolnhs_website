import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useParallax } from "@/hooks/useParallax";
import { whyChoose } from "@/data/whyChoose";
import { fadeUp, viewportOnce } from "@/lib/motion";

/**
 * Full-bleed navy block with a faint background photo showing through
 * a gradient scrim (darker behind the text for legibility, lighter toward
 * the right so more of the photo reads through) — left-aligned heading +
 * paragraph + outlined button. The backdrop photo drifts on scroll
 * (parallax), same technique as the hero, so the effect reads as a
 * deliberate site-wide pattern rather than a one-off.
 */
export function WhyChooseUs() {
  const { ref: parallaxRef, y } = useParallax(40);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-primary py-section-sm md:py-section" aria-labelledby="why-heading">
      <div ref={parallaxRef} className="absolute inset-0 overflow-hidden opacity-60">
        <motion.div style={{ y }} className="absolute inset-x-0 -top-[15%] h-[130%]">
          <img
            src="/facilities/side.png"
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </motion.div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/45" />

      <Container className="relative">
        <motion.div
          variants={fadeUp}
          initial={shouldReduceMotion ? "show" : "hidden"}
          whileInView="show"
          viewport={viewportOnce}
          className="max-w-xl"
        >
          <h2 id="why-heading" className="text-heading text-white">
            {whyChoose.heading}
          </h2>
          <p className="mt-5 text-body text-blue-50">{whyChoose.paragraph}</p>
          <Button
            variant="outline"
            href="/about"
            className="mt-8"
          >
            {whyChoose.buttonLabel}
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}

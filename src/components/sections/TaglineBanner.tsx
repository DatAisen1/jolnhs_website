import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { tagline } from "@/data/tagline";
import { fadeUp, viewportOnce } from "@/lib/motion";

/**
 * A single-purpose "pause moment" banner: one large centered line of
 * copy (Playfair Display, inherited from the global h1–h4 base style),
 * one button. No card, no image — pure typographic pacing, matching the
 * reference's "CIC: A Century of Excellence" block.
 *
 * Gradient (Apple-style pass): was a bright DIAGONAL gradient
 * (`from-primary via-primary-600 to-primary-400`, bottom-right corner
 * noticeably lighter) — diagonal, high-contrast gradients read as a
 * decorative accent, not a considered "keynote" moment. Apple's own dark
 * marketing sections are deep and vertical instead: darkest at the top,
 * settling to the brand color at the bottom, so the whole block reads as
 * one confident surface rather than a gradient swatch behind the text.
 * Motion also switched from an ad hoc scale-pop + `easeOut` to the same
 * `fadeUp` + shared easing curve every other section on the page uses,
 * so this doesn't feel like a different component library snuck in.
 */
export function TaglineBanner() {
  return (
    <section
      className="bg-gradient-to-b from-primary-900 via-primary to-primary-700 py-20 text-center sm:py-28"
      aria-labelledby="tagline-heading"
    >
      <Container>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <h2
            id="tagline-heading"
            className="mx-auto max-w-3xl text-4xl italic leading-tight tracking-tight text-white sm:text-5xl"
          >
            {tagline.heading}
          </h2>
          <Button variant="outline" href="/about" className="mt-8">
            {tagline.buttonLabel}
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { tagline } from "@/data/tagline";

/**
 * A single-purpose "pause moment" banner: diagonal blue gradient, one
 * large centered line of copy (Playfair Display, inherited from the
 * global h1–h4 base style), one button. No card, no image — pure
 * typographic pacing, matching the reference's "CIC: A Century of
 * Excellence" block. The gradient (navy -> bright blue) is the site's
 * one deliberate gradient moment — kept to this section only so it reads
 * as a signature accent, not a decoration repeated everywhere.
 */
export function TaglineBanner() {
  return (
    <section
      className="bg-gradient-to-br from-primary via-primary-600 to-blue-500 py-16 text-center sm:py-20"
      aria-labelledby="tagline-heading"
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2
            id="tagline-heading"
            className="mx-auto max-w-3xl text-4xl italic leading-tight text-white sm:text-5xl"
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

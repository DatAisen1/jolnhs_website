import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { welcome } from "@/data/welcome";
import { fadeUp, viewportOnce } from "@/lib/motion";

/**
 * White, image-paired block — deliberately NOT another flat navy section.
 * By this point in the scroll the page has already shown two solid navy
 * blocks in a row (Why Choose Us, Tagline); a third would flatten the
 * hierarchy the same way the original reference site did. Giving this
 * one a photo and a white background resets the eye before the facility
 * rows begin.
 */
export function WelcomeBanner() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-white py-section-sm md:py-section" aria-labelledby="welcome-heading">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <motion.div
          variants={fadeUp}
          initial={shouldReduceMotion ? "show" : "hidden"}
          whileInView="show"
          viewport={viewportOnce}
        >
          <p className="mb-3 text-small font-semibold uppercase tracking-widest text-primary">
            Community
          </p>
          <h2 id="welcome-heading" className="text-heading text-text-primary">
            {welcome.heading}
          </h2>
          <p className="mt-5 max-w-md text-body text-text-secondary">
            {welcome.paragraph}
          </p>
          <Button variant="primary" href="/about" className="mt-6">
            {welcome.buttonLabel}
          </Button>
        </motion.div>

        <div className="overflow-hidden rounded-3xl bg-slate-100">
          <img
            src="/facilities/welcomehome.png"
            alt="Students and faculty at a JOLNHS school event"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </Container>
    </section>
  );
}

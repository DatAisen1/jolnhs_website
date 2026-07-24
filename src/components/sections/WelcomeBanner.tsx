import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { welcome } from "@/data/welcome";

/**
 * White, image-paired block — deliberately NOT another flat navy section.
 * By this point in the scroll the page has already shown two solid navy
 * blocks in a row (Why Choose Us, Tagline); a third would flatten the
 * hierarchy the same way the original reference site did. Giving this
 * one a photo and a white background resets the eye before the facility
 * rows begin.
 */
export function WelcomeBanner() {
  return (
    <section className="bg-white py-section-sm md:py-section" aria-labelledby="welcome-heading">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
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

        <ImagePlaceholder
          alt="Students and faculty at a JOLNHS school event"
          label="Insert Community Photo Here"
          recommendedSize="1000 x 800"
        />
      </Container>
    </section>
  );
}

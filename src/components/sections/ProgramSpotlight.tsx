import { motion, useReducedMotion } from "framer-motion";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { spotlights } from "@/data/spotlight";
import { fadeUp, viewportOnce } from "@/lib/motion";

/**
 * One full-bleed split block per featured program: light image panel
 * alternating left/right against a solid blue text panel. Directly
 * mirrors the reference's "Bachelor of Science in Tourism Management"
 * section — same 50/50 split, same eyebrow-over-heading-over-paragraph
 * rhythm — repeated once per entry in `spotlights`, alternating which
 * side the image sits on (`imagePosition`) via a CSS order utility so
 * two (or more) stacked blocks don't read as one repeating pattern.
 *
 * The text panel now reveals with the same `fadeUp` used everywhere
 * else on the homepage — this was previously the only section that
 * rendered instantly with no entrance animation, which broke the
 * otherwise-consistent scroll rhythm the rest of the page has.
 *
 * Renders a Fragment of sections rather than one section wrapping a
 * .map() — each program is its own landmark with its own heading id,
 * which matters for screen-reader users navigating by heading/region.
 */
export function ProgramSpotlight() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {spotlights.map((item, index) => {
        const headingId = `spotlight-heading-${index}`;
        return (
          <section key={item.title} aria-labelledby={headingId} className="grid grid-cols-1 lg:grid-cols-2">
            <ImagePlaceholder
              alt={`Photo representing ${item.title}`}
              label={item.title}
              recommendedSize={item.imageSize}
              className={`min-h-[320px] rounded-none border-none ${
                item.imagePosition === "right" ? "lg:order-2" : ""
              }`}
            />

            <motion.div
              variants={fadeUp}
              initial={shouldReduceMotion ? "show" : "hidden"}
              whileInView="show"
              viewport={viewportOnce}
              className="flex flex-col justify-center bg-primary px-8 py-20 sm:px-14 lg:py-24"
            >
              <p className="mb-3 text-small font-semibold uppercase tracking-[0.18em] text-secondary-light">
                {item.eyebrow}
              </p>
              <h2 id={headingId} className="text-heading text-white">
                {item.title}
              </h2>
              <p className="mt-5 max-w-md text-body text-secondary-50">{item.description}</p>
            </motion.div>
          </section>
        );
      })}
    </>
  );
}
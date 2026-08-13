import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { spotlights } from "@/data/spotlight";

/**
 * One full-bleed split block per featured program: light image panel
 * alternating left/right against a solid blue text panel. Directly
 * mirrors the reference's "Bachelor of Science in Tourism Management"
 * section — same 50/50 split, same eyebrow-over-heading-over-paragraph
 * rhythm — repeated once per entry in `spotlights`, alternating which
 * side the image sits on (`imagePosition`) via a CSS order utility so
 * two (or more) stacked blocks don't read as one repeating pattern.
 *
 * Renders a Fragment of sections rather than one section wrapping a
 * .map() — each program is its own landmark with its own heading id,
 * which matters for screen-reader users navigating by heading/region.
 */
export function ProgramSpotlight() {
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

            <div className="flex flex-col justify-center bg-primary px-8 py-16 sm:px-14">
              <p className="mb-3 text-small font-semibold uppercase tracking-widest text-secondary-light">
                {item.eyebrow}
              </p>
              <h2 id={headingId} className="text-heading text-white">
                {item.title}
              </h2>
              <p className="mt-5 max-w-md text-body text-secondary-50">{item.description}</p>
            </div>
          </section>
        );
      })}
    </>
  );
}
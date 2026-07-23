import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { spotlight } from "@/data/spotlight";

/**
 * Full-bleed split block: light image panel on the left, solid maroon
 * text panel on the right. Directly mirrors the reference's "Bachelor of
 * Science in Tourism Management" section — same 50/50 split, same
 * eyebrow-over-heading-over-paragraph rhythm.
 */
export function ProgramSpotlight() {
  return (
    <section aria-labelledby="spotlight-heading" className="grid grid-cols-1 lg:grid-cols-2">
      <ImagePlaceholder
        alt={`Photo representing ${spotlight.title}`}
        label={spotlight.title}
        recommendedSize={spotlight.imageSize}
        className="min-h-[320px] rounded-none border-none"
      />

      <div className="flex flex-col justify-center bg-primary px-8 py-16 sm:px-14">
        <p className="mb-3 text-small font-semibold uppercase tracking-widest text-secondary-light">
          {spotlight.eyebrow}
        </p>
        <h2 id="spotlight-heading" className="text-heading text-white">
          {spotlight.title}
        </h2>
        <p className="mt-5 max-w-md text-body text-blue-50">
          {spotlight.description}
        </p>
      </div>
    </section>
  );
}

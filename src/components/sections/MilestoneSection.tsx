import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Button } from "@/components/ui/Button";
import { milestone } from "@/data/milestone";

/**
 * Centered milestone block: heading, two ceremonial badge placeholders
 * side by side, a supporting paragraph, and an outlined "See More" pill —
 * mirrors the reference's centennial kick-off section structure exactly,
 * just re-themed with placeholder JOLNHS content.
 */
export function MilestoneSection() {
  return (
    <section className="bg-white py-section-sm md:py-section" aria-labelledby="milestone-heading">
      <Container className="text-center">
        <h2 id="milestone-heading" className="mx-auto max-w-3xl text-section text-text-primary">
          {milestone.heading}
        </h2>

        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-6">
          <ImagePlaceholder
            alt="JOLNHS official crest"
            label="School Crest"
            recommendedSize="400 x 400"
            className="mx-auto aspect-square min-h-0 w-40 sm:w-52"
          />
          <ImagePlaceholder
            alt="Foundation anniversary emblem"
            label="Anniversary Emblem"
            recommendedSize="400 x 400"
            className="mx-auto aspect-square min-h-0 w-40 sm:w-52"
          />
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-body text-text-secondary">
          {milestone.paragraph}
        </p>

        <Button variant="outline" href="/about" className="mt-8 !border-primary !text-primary hover:!bg-primary hover:!text-white">
          {milestone.buttonLabel}
        </Button>
      </Container>
    </section>
  );
}

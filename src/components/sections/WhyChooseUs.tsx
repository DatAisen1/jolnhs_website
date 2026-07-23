import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { whyChoose } from "@/data/whyChoose";

/**
 * Full-bleed navy block with a faint background photo showing through
 * a dark overlay, left-aligned heading + paragraph + outlined button —
 * matches the reference's "WHY CHOOSE CIC?" section exactly.
 */
export function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-primary py-section-sm md:py-section" aria-labelledby="why-heading">
      <div className="absolute inset-0 opacity-20">
        <ImagePlaceholder
          alt="Students on campus"
          label="Background Photo"
          recommendedSize="1920 x 800"
          className="h-full rounded-none border-none bg-transparent text-transparent"
        />
      </div>
      <div className="absolute inset-0 bg-primary/70" />

      <Container className="relative">
        <div className="max-w-xl">
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
        </div>
      </Container>
    </section>
  );
}

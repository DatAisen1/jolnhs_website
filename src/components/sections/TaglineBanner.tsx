import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { tagline } from "@/data/tagline";

/**
 * A single-purpose "pause moment" banner: bold color block, one large
 * centered line of copy, one button. No card, no image — pure typographic
 * pacing, matching the reference's "CIC: A Century of Excellence" block.
 */
export function TaglineBanner() {
  return (
    <section className="bg-primary-600 py-16 text-center sm:py-20" aria-labelledby="tagline-heading">
      <Container>
        <h2
          id="tagline-heading"
          className="mx-auto max-w-3xl font-serif text-4xl italic leading-tight text-white sm:text-5xl"
        >
          {tagline.heading}
        </h2>
        <Button variant="outline" href="/about" className="mt-8">
          {tagline.buttonLabel}
        </Button>
      </Container>
    </section>
  );
}

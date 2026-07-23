import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export function PrincipalsMessage() {
  return (
    <section className="bg-background py-section-sm md:py-section" aria-labelledby="principal-heading">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[320px_1fr]">
        <ImagePlaceholder
          alt="Photo of the School Principal"
          label="Insert Principal's Photo Here"
          recommendedSize="600 x 800"
        />

        <div>
          <p className="mb-3 text-small font-semibold uppercase tracking-widest text-secondary">
            From the Principal
          </p>
          <h2 id="principal-heading" className="text-section text-text-primary">
            A Message to the JOLNHS Community
          </h2>
          <blockquote className="mt-6 border-l-4 border-secondary pl-6 text-body italic text-text-secondary">
            "Every learner who walks through our gates carries a future worth
            investing in. Our commitment as a school is simple: to provide an
            environment where students feel safe, supported, and genuinely
            challenged to grow — academically, socially, and as individuals of
            good character. Together with our faculty, staff, and families, we
            continue building a school we can all be proud of."
          </blockquote>

          <div className="mt-6">
            <ImagePlaceholder
              alt="Principal's signature"
              label="Insert Signature Here"
              recommendedSize="240 x 80"
              className="min-h-[80px] w-60"
            />
            <p className="mt-3 text-body font-semibold text-text-primary">
              Dr. Juan Dela Cruz
            </p>
            <p className="text-small text-text-secondary">School Principal</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

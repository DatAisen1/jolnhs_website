import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export function AboutSection() {
  return (
    <section className="bg-white py-section-sm md:py-section" aria-labelledby="about-heading">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <ImagePlaceholder
          alt="Photo of the JOLNHS school building and grounds"
          label="Insert School Building Photo Here"
          recommendedSize="1000 x 800"
        />

        <div>
          <p className="mb-3 text-small font-semibold uppercase tracking-widest text-secondary">
            About Us
          </p>
          <h2 id="about-heading" className="text-section text-text-primary">
            About Julia Ortiz Luis National High School
          </h2>
          <p className="mt-6 text-body text-text-secondary">
            JOLNHS has served generations of learners as a public secondary
            school committed to academic excellence, character formation, and
            community partnership. From our Special Science and ICT programs
            to our inclusive education initiatives, every program is built
            around one goal: preparing students for what comes after
            graduation, whether that's college, a career, or entrepreneurship.
          </p>
          <p className="mt-4 text-body text-text-secondary">
            Guided by dedicated administrators, faculty, and staff, we continue
            to grow as a school where every learner is known, supported, and
            challenged to do their best work.
          </p>
          <Button variant="ghost" href="/about" className="mt-6 !px-0">
            Read More About JOLNHS →
          </Button>
        </div>
      </Container>
    </section>
  );
}

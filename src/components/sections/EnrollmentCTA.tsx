import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function EnrollmentCTA() {
  return (
    <section className="bg-secondary py-10" aria-labelledby="enroll-heading">
      <Container className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
        <div>
          <h2 id="enroll-heading" className="text-subtitle text-primary">
            Proceed to the Next Level
          </h2>
          <p className="mt-1 text-body text-primary/80">
            Ready to be part of JOLNHS? Contact us for additional details or apply today.
          </p>
        </div>
        <Button variant="primary" href="/enroll" className="shrink-0">
          Enroll Now
        </Button>
      </Container>
    </section>
  );
}

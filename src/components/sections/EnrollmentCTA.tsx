import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function EnrollmentCTA() {
  return (
    <section className="bg-secondary py-16" aria-labelledby="enroll-heading">
      <Container className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
        <div>
          <h2 id="enroll-heading" className="text-heading text-white">
            Ready to Join JOLNHS?
          </h2>
          <p className="mt-2 text-body text-blue-50">
            Enrollment for School Year 2026–2027 is now open. Secure your slot today.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="primary" href="/enroll" className="bg-white !text-secondary hover:bg-blue-50">
            Enroll Now
          </Button>
          <Button variant="outline" href="/contact">
            Contact Us
          </Button>
        </div>
      </Container>
    </section>
  );
}

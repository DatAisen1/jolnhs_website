import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { welcome } from "@/data/welcome";

/**
 * Two-column navy banner: bold heading on the left, supporting
 * paragraph + button on the right. Mirrors the reference's
 * "WELCOME HOME CICIANS!" section layout.
 */
export function WelcomeBanner() {
  return (
    <section className="bg-primary py-section-sm md:py-section" aria-labelledby="welcome-heading">
      <Container className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <h2 id="welcome-heading" className="text-heading text-white">
          {welcome.heading}
        </h2>
        <div>
          <p className="text-body text-blue-50">{welcome.paragraph}</p>
          <Button variant="outline" href="/about" className="mt-6">
            {welcome.buttonLabel}
          </Button>
        </div>
      </Container>
    </section>
  );
}

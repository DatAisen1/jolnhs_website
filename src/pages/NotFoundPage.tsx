import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { usePageTitle } from "@/hooks/usePageTitle";
import { navigation } from "@/data/navigation";

export function NotFoundPage() {
  usePageTitle("Page Not Found");

  return (
    <section className="flex min-h-[60vh] items-center py-16">
      <Container className="text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
          Error 404
        </p>
        <h1 className="text-title font-bold text-text-primary">
          We can&apos;t find that page.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-body text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="mt-8">
          <Button href="/">Return home</Button>
        </div>
        <nav aria-label="Explore major sections" className="mt-10">
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </section>
  );
}
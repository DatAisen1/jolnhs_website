import { useScrollHeader } from "@/hooks/useScrollHeader";
import { NavBar } from "./NavBar";
import { MobileNav } from "./MobileNav";
import { Container } from "@/components/ui/Container";

/**
 * Sticky header: transparent over the hero, white with a shadow after the
 * user scrolls past it. Logo-left / nav-center / partner-seal-right, per spec.
 */
export function Header() {
  const isScrolled = useScrollHeader();

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        isScrolled
          ? "bg-white/95 shadow-sm backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      <Container className="flex h-20 items-center justify-between">
        {/* LEFT: school identity */}
        <a href="/" className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold ${
              isScrolled
                ? "border-primary text-primary"
                : "border-white text-white"
            }`}
            aria-hidden="true"
          >
            JO
          </div>
          <span
            className={`hidden text-small font-semibold leading-tight sm:block ${
              isScrolled ? "text-text-primary" : "text-white"
            }`}
          >
            Julia Ortiz Luis
            <br />
            National High School
          </span>
        </a>

        {/* CENTER: primary navigation */}
        <NavBar isHeaderSolid={isScrolled} />

        {/* RIGHT: DepEd affiliation seal + mobile trigger */}
        <div className="flex items-center gap-4">
          <div
            className={`hidden h-12 w-12 items-center justify-center rounded-full border-2 text-small font-bold sm:flex ${
              isScrolled
                ? "border-secondary text-secondary"
                : "border-white text-white"
            }`}
            role="img"
            aria-label="Department of Education seal placeholder"
          >
            DepEd
          </div>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}

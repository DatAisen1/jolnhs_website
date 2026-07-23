import { TopUtilityBar } from "./TopUtilityBar";
import { NavBar } from "./NavBar";
import { MobileNav } from "./MobileNav";
import { Container } from "@/components/ui/Container";

/**
 * Header: a thin dark utility bar, then a solid white navigation bar with
 * the school crest on the left and the DepEd seal on the right — always
 * solid (not transparent-over-hero), matching the reference layout.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 shadow-sm">
      <TopUtilityBar />

      <div className="border-b border-border bg-secondary">
        <Container className="flex h-20 items-center justify-between">
          {/* LEFT: school identity */}
          <a href="/" className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-white font-bold text-primary"
              aria-hidden="true"
            >
              JO
            </div>
            <span className="hidden text-small font-semibold leading-tight text-primary sm:block">
              Julia Ortiz Luis
              <br />
              National High School
            </span>
          </a>

          {/* CENTER: primary navigation */}
          <NavBar />

          {/* RIGHT: DepEd affiliation seal + mobile trigger */}
          <div className="flex items-center gap-4">
            <div
              className="hidden h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-white text-small font-bold text-primary sm:flex"
              role="img"
              aria-label="Department of Education seal placeholder"
            >
              DepEd
            </div>
            <MobileNav />
          </div>
        </Container>
      </div>
    </header>
  );
}

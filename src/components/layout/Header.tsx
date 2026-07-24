import { NavBar } from "./NavBar";
import { MobileNav } from "./MobileNav";
import { Container } from "@/components/ui/Container";
import { SchoolBadge } from "@/components/ui/SchoolBadge";

/**
 * Header: a single solid white navigation bar with the school crest on
 * the left and the DepEd seal on the right — always solid (not
 * transparent-over-hero).
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 shadow-sm">
      <div className="border-b border-border bg-secondary">
        <Container className="flex h-20 items-center justify-between">
          {/* LEFT: school identity */}
          <a href="/" className="flex items-center gap-3">
            <SchoolBadge label="JO" ariaLabel="JOLNHS crest" size={48} src="/images/logo-jolnhs.png" />
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
            <div className="hidden sm:block">
              <SchoolBadge
                label="DepEd"
                ariaLabel="Department of Education seal"
                tone="primary-600"
                size={48}
                src="/images/logo-deped.png"
              />
            </div>
            <MobileNav />
          </div>
        </Container>
      </div>
    </header>
  );
}

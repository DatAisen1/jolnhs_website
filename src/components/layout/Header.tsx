import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "./NavBar";
import { MobileNav } from "./MobileNav";
import { Container } from "@/components/ui/Container";
import { SchoolBadge } from "@/components/ui/SchoolBadge";

/**
 * Header: a flat, edge-to-edge translucent strip — the pattern Apple's
 * own nav uses (apple.com/apple.com/*): fixed to the very top, no side
 * margins, no rounded card, no drop shadow. Depth comes only from the
 * blur/saturation of what's scrolling underneath and a single hairline
 * border, not from a shadow — a shadow implies the bar is a card
 * floating ABOVE the page; Apple's bar reads as part of the page itself,
 * just on its own translucent layer.
 *
 * Previous version floated as a rounded, drop-shadowed pill with side
 * margins (`mx-4`, `rounded-full`, a heavy `shadow-[...]`) — closer to a
 * Vercel/Linear "floating dock" pattern than Apple's own site chrome.
 * Kept: sticky positioning, frosted glass, crest left / DepEd seal
 * right. Changed: height 80px -> 64px, corners -> none, shadow -> none,
 * hover-grow -> removed (Apple's bar doesn't react to hover at all).
 */
export function Header() {
  // Deepen the frosted glass once the page has scrolled — the bar gains
  // a touch more presence over moving content without a drop shadow
  // (a shadow would read as a floating card; see the design note above).
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[1000] border-b backdrop-blur-xl backdrop-saturate-[180%] transition-[background-color,border-color] duration-300 ease-apple ${
        scrolled ? "border-black/10 bg-white/90" : "border-black/[0.06] bg-white/70"
      }`}
    >
      <Container className="flex h-16 items-center justify-between md:h-[68px]">
        {/* LEFT: school identity */}
        <Link to="/" className="flex items-center gap-2.5">
          <SchoolBadge label="JO" ariaLabel="JOLNHS crest" size={38} src="/images/logo-jolnhs.png" />
          <span className="hidden text-[13px] font-semibold leading-tight tracking-tight text-primary sm:block">
            Julia Ortiz Luis
            <br />
            National High School
          </span>
        </Link>

        {/* CENTER: primary navigation */}
        <NavBar />

        {/* RIGHT: DepEd affiliation seal + mobile trigger */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <SchoolBadge
              label="DepEd"
              ariaLabel="Department of Education seal"
              tone="primary-600"
              size={38}
              src="/images/logo-deped.png"
            />
          </div>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { navigation } from "@/data/navigation";
import { NavDropdown } from "./NavDropdown";

/**
 * NavBar — Flat Segmented Navigation
 *
 * WHAT: Desktop-only nav (hidden below `lg`, MobileNav takes over there):
 *       links sit directly on the header's glass bar (no enclosing
 *       track/background of their own — Apple's own nav is flat links on
 *       the bar, not a grouped control floating inside it), with a soft
 *       neutral highlight that slides between them on hover, settling
 *       back onto the current page when the pointer leaves.
 * WHY:  Communicates "here's exactly which section is live" the way a
 *       segmented control does, without the extra visual weight of a
 *       second background layer stacked on top of the header's own glass
 *       — one translucent surface (the header), not two nested ones.
 *
 * Previously wrapped in its own rounded track (`bg-primary-900/[0.04]`)
 * with a shadowed white pill underneath the highlighted item — closer to
 * a macOS System Settings sidebar control than a website nav bar. Kept
 * the sliding-highlight MECHANIC (still the clearest way to show which
 * section is current); removed the second background layer and the
 * pill's shadow so it reads as one quiet surface, not a card-on-a-card.
 *
 * The hover/active state lives HERE, not inside each NavDropdown,
 * because only one pill can exist at a time — it has to be coordinated
 * by a common parent so moving from one segment to the next is a single
 * shared-layout animation (via Framer Motion's `layoutId`) instead of
 * two independent ones that don't know about each other.
 */
export function NavBar() {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const location = useLocation();

  const activeLabel =
    navigation.find((item) =>
      item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href)
    )?.label ?? null;

  // Hover always wins while the pointer is over the track; once it
  // leaves (onMouseLeave below, at the track level, not per-segment),
  // the pill settles back onto whichever section the visitor is
  // actually on — never onto nothing, so the track never goes "blank."
  const highlightedLabel = hoveredLabel ?? activeLabel;

  return (
    <nav
      aria-label="Primary navigation"
      onMouseLeave={() => setHoveredLabel(null)}
      className="hidden items-center gap-0.5 lg:flex"
    >
      {navigation.map((item) => (
        <NavDropdown
          key={item.label}
          item={item}
          isHighlighted={highlightedLabel === item.label}
          onHoverStart={() => setHoveredLabel(item.label)}
        />
      ))}
    </nav>
  );
}
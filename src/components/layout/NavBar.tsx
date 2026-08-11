import { useState } from "react";
import { useLocation } from "react-router-dom";
import { navigation } from "@/data/navigation";
import { NavDropdown } from "./NavDropdown";

/**
 * NavBar — Floating Segmented Navigation ("pill nav")
 *
 * WHAT: Desktop-only nav (hidden below `lg`, MobileNav takes over there)
 *       rendered as a rounded "track" of segments, with a single white
 *       pill that slides between segments to show which one is
 *       highlighted — hovering a segment moves the pill there; moving
 *       the mouse off the whole track lets it settle back on whichever
 *       segment matches the current page.
 * WHY:  This is the pattern used by Vercel, Arc, and macOS's own System
 *       Settings sidebar — a segmented control communicates both
 *       "these are the top-level choices" and "here's exactly which one
 *       is live" in one visual, more legibly than a flat row of text
 *       links with an underline.
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
      className="hidden items-center gap-0.5 rounded-full bg-primary-900/[0.04] p-1.5 lg:flex"
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

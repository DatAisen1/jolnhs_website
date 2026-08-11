import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import type { NavItem } from "@/types";

interface NavDropdownProps {
  item: NavItem;
  /** True when THIS segment should show the sliding pill behind it —
   *  decided by the parent NavBar (hover wins, current page is the
   *  fallback), not by this component's own local state. */
  isHighlighted: boolean;
  /** Tells NavBar "the pointer is over my segment," so it can move the
   *  shared pill here. Wiring lives in NavBar; this component just
   *  reports the event. */
  onHoverStart: () => void;
}

// Shared spring used by the sliding pill everywhere it's rendered — one
// constant, not a copy-pasted transition object per branch, so tuning
// the feel later means editing one value.
const pillTransition = { type: "spring", stiffness: 500, damping: 35 } as const;

export function NavDropdown({ item, isHighlighted, onHoverStart }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // A top-level item is "active" if the current path IS its href, or
  // sits underneath it (e.g. "/campus-life/pta" activates the "Campus
  // Life" trigger even though its own href is just "/campus-life") —
  // except for "/", which must match exactly or every route would light
  // up the Home link.
  const isActive =
    item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);

  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On the pill (hovered/active), text goes full-strength ink navy; off
  // the pill, it's dimmed to 70% so the highlighted segment reads as
  // clearly "selected" against its neighbors — the segmented-control
  // convention this whole pattern is borrowed from.
  const textColor = isHighlighted ? "text-primary" : "text-primary/70 hover:text-primary";

  const openMenu = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
    setIsOpen(true);
    onHoverStart();
  };

  const closeMenu = () => {
    closeTimeout.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current);
      }
    };
  }, []);

  if (!item.dropdown) {
    return (
      <a
        href={item.href}
        onMouseEnter={onHoverStart}
        aria-current={isActive ? "page" : undefined}
        className="relative block rounded-full px-4 py-2"
      >
        {/* The sliding pill: only ever mounted for whichever segment is
            currently highlighted. Because every segment across the whole
            NavBar shares the SAME layoutId ("nav-pill"), Framer Motion
            treats a re-mount at a different segment as the same element
            moving — that's what produces the slide, not a fade. */}
        {isHighlighted && (
          <motion.span
            layoutId="nav-pill"
            transition={pillTransition}
            className="absolute inset-0 rounded-full bg-white shadow-[0_2px_10px_rgba(15,33,72,0.12)]"
          />
        )}
        <span className={`relative z-10 text-body font-semibold transition-colors ${textColor}`}>
          {item.label}
        </span>
      </a>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex items-center rounded-full"
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          closeMenu();
        }
      }}
    >
      {isHighlighted && (
        <motion.span
          layoutId="nav-pill"
          transition={pillTransition}
          className="absolute inset-0 rounded-full bg-white shadow-[0_2px_10px_rgba(15,33,72,0.12)]"
        />
      )}

      {/* Label navigates to the section's own landing page (e.g.
          "Academics" -> /academics) — it's a real link, not just a
          dropdown trigger. Hovering the whole group still opens the
          submenu preview via onMouseEnter above. */}
      <a
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={`relative z-10 rounded-full py-2 pl-4 pr-1 text-body font-semibold transition-colors ${textColor}`}
      >
        {item.label}
      </a>

      {/* Chevron is its OWN button, separate from the label link, so
          keyboard/touch users can open the submenu without navigating
          away, and aria-expanded stays on the element that actually
          controls the panel. */}
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Toggle ${item.label} submenu`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setIsOpen(false);
          }
        }}
        className={`relative z-10 flex items-center rounded-full py-2 pl-1 pr-3 transition-colors ${textColor}`}
      >
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Invisible hover bridge */}
      <div
        className={`absolute left-0 top-full h-3 w-full z-[1099] ${
          isOpen ? "block" : "hidden"
        }`}
        aria-hidden="true"
      />

      {/* Dropdown */}
      <div
        className={`absolute left-0 top-full mt-3 z-[1100] min-w-[220px] overflow-hidden rounded-2xl border border-white/15 bg-white/15 backdrop-blur-[24px] backdrop-saturate-[180%] py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-200 ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0"
        }`}
      >
        {item.dropdown.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="block px-4 py-2 text-body text-text-primary transition-colors hover:bg-primary-50 hover:text-primary"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

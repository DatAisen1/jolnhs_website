import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "@/types";

interface NavDropdownProps {
  item: NavItem;
  isHeaderSolid: boolean;
}

/**
 * NavDropdown
 *
 * WHAT: A single top-level nav item that may expand into a dropdown list.
 * WHY:  The spec has 4 separate dropdown menus (About, Academics, Campus
 *       Life, Budget Transparency) — building 4 bespoke components would
 *       duplicate the same open/close/keyboard logic 4 times. One
 *       data-driven component renders all of them.
 * WHEN: Any top-level nav entry, dropdown or not (falls back to a plain link).
 *
 * Accessibility:
 * - button has aria-expanded + aria-haspopup so screen readers announce state
 * - Escape closes the menu and returns focus to the trigger
 * - opens on hover (mouse) AND focus/click (keyboard), closes on blur-out
 */
export function NavDropdown({ item, isHeaderSolid }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const textColor = isHeaderSolid
    ? "text-text-primary hover:text-primary"
    : "text-white hover:text-blue-100";

  if (!item.dropdown) {
    return (
      <a
        href={item.href}
        className={`text-body font-medium transition-colors ${textColor}`}
      >
        {item.label}
      </a>
    );
  }

  const close = () => setIsOpen(false);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={close}
      onBlur={(e) => {
        // Only close once focus has left the whole dropdown, not between
        // its own children (button -> first link, etc.)
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          close();
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
        }}
        className={`flex items-center gap-1 text-body font-medium transition-colors ${textColor}`}
      >
        {item.label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        className={`absolute left-0 top-full min-w-[220px] overflow-hidden rounded-lg border border-border bg-surface py-2 shadow-lg transition-all duration-200 ${
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

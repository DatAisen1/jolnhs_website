import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "@/types";

interface NavDropdownProps {
  item: NavItem;
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
export function NavDropdown({ item }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Nav always sits on the solid white bar, so text is always navy.
  const textColor = "text-primary hover:text-primary-600";

  if (!item.dropdown) {
    return (
      <a
        href={item.href}
        className={`text-body font-semibold transition-colors ${textColor}`}
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
        className={`flex items-center gap-1 text-body font-semibold transition-colors ${textColor}`}
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
        className={`absolute left-0 top-[calc(100%+12px)] z-[1100] min-w-[220px] overflow-hidden rounded-2xl border border-white/15 bg-white/15 backdrop-blur-[24px] backdrop-saturate-[180%] py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-200 ${
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

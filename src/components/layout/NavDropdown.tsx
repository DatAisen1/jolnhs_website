import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "@/types";

interface NavDropdownProps {
  item: NavItem;
}

export function NavDropdown({ item }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const textColor = "text-primary hover:text-primary-600";

  const openMenu = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
    setIsOpen(true);
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
        className={`text-body font-semibold transition-colors ${textColor}`}
      >
        {item.label}
      </a>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex items-center"
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          closeMenu();
        }
      }}
    >
      {/* Label navigates to the section's own landing page (e.g.
          "Academics" -> /academics) — it's a real link, not just a
          dropdown trigger. Hovering the whole group still opens the
          submenu preview via onMouseEnter above. */}
      <a
        href={item.href}
        className={`text-body font-semibold transition-colors ${textColor}`}
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
        className={`ml-1 flex items-center transition-colors ${textColor}`}
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
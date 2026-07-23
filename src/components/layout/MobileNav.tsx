import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { navigation } from "@/data/navigation";

/**
 * MobileNav
 *
 * WHAT: Hamburger trigger + slide-in panel listing all nav items, with
 *       dropdowns rendered as inline expandable accordions (a dropdown
 *       flyout doesn't make sense on touch screens with no hover state).
 * WHY:  Below `lg`, horizontal space can't fit 5 nav items + 2 dropdowns.
 * WHEN NOT: Never render both NavBar and MobileNav visible at once — Tailwind
 *           breakpoints (hidden lg:flex / lg:hidden) enforce that split.
 */
export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        className="rounded-md p-2 text-primary"
      >
        <Menu className="h-7 w-7" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-50 bg-white"
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <span className="text-subtitle text-primary">Menu</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="rounded-md p-2 text-text-primary"
            >
              <X className="h-7 w-7" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile primary navigation" className="px-6 py-4">
            <ul className="flex flex-col gap-1">
              {navigation.map((item) => (
                <li key={item.label} className="border-b border-border py-2">
                  {item.dropdown ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={openSection === item.label}
                        onClick={() =>
                          setOpenSection((prev) =>
                            prev === item.label ? null : item.label
                          )
                        }
                        className="flex w-full items-center justify-between py-2 text-body font-semibold text-text-primary"
                      >
                        {item.label}
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            openSection === item.label ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      {openSection === item.label && (
                        <ul className="ml-4 flex flex-col gap-1 pb-2">
                          {item.dropdown.map((link) => (
                            <li key={link.href}>
                              <a
                                href={link.href}
                                className="block py-2 text-body text-text-secondary"
                              >
                                {link.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <a
                      href={item.href}
                      className="block py-2 text-body font-semibold text-text-primary"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

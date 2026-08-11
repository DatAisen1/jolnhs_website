import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
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
 *
 * The panel is SOLID white (`bg-white`), not translucent — an earlier
 * version used the header's frosted-glass treatment (`bg-white/15
 * backdrop-blur`) here too, but at full-screen size that left menu text
 * sitting at ~15% opacity over whatever photo or colored section was
 * scrolled behind it. A small floating header pill can afford to be
 * see-through; a full-screen menu the visitor is meant to read cannot.
 * The dimmed backdrop behind the panel is what carries the "glass" mood
 * instead.
 */
export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // Lock background scroll while the panel is open — without this, the
  // page behind a full-screen overlay keeps scrolling underneath it,
  // which feels broken on touch devices (the classic "body scroll leak").
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const isItemActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        className="rounded-md p-2 text-primary transition-colors hover:bg-primary-50"
      >
        <Menu className="h-7 w-7" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 bg-primary-900/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            {/* Panel: stopPropagation so clicking inside doesn't close
                via the scrim's onClick above. Slides in from the right —
                a directional entrance reads as "a drawer opened," not
                "content popped in," matching how the hamburger icon sits
                on the right of the header. */}
            <motion.div
              initial={shouldReduceMotion ? { x: 0 } : { x: "100%" }}
              animate={{ x: 0 }}
              exit={shouldReduceMotion ? { x: 0 } : { x: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex h-full w-full max-w-sm flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <span className="text-subtitle text-primary">Menu</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  className="rounded-md p-2 text-text-primary transition-colors hover:bg-primary-50"
                >
                  <X className="h-7 w-7" aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Mobile primary navigation" className="flex-1 overflow-y-auto px-6 py-4">
                <ul className="flex flex-col gap-1">
                  {navigation.map((item) => {
                    const isActive = isItemActive(item.href);
                    return (
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
                              className={`flex w-full items-center justify-between rounded-full px-3 py-2 text-body font-semibold transition-colors ${
                                isActive ? "bg-primary-50 text-primary" : "text-text-primary"
                              }`}
                            >
                              <span>{item.label}</span>
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
                                      onClick={() => setIsOpen(false)}
                                      className="block rounded-full px-3 py-2 text-body text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary"
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
                            aria-current={isActive ? "page" : undefined}
                            onClick={() => setIsOpen(false)}
                            className={`block rounded-full px-3 py-2 text-body font-semibold transition-colors ${
                              isActive ? "bg-primary-50 text-primary" : "text-text-primary"
                            }`}
                          >
                            {item.label}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
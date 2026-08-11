import { useEffect, useState } from "react";

/**
 * useActiveSection
 *
 * WHAT: Watches a fixed, small set of section ids and returns whichever
 *       one currently occupies the "active" band near the top of the
 *       viewport (returns `null` before the first section is reached,
 *       e.g. while still reading the hero/intro).
 * WHY:  BudgetSectionNav has three anchor links and no way to show which
 *       one the visitor has actually scrolled to — without this, the
 *       nav is a one-time jump list, not a wayfinding aid. An
 *       IntersectionObserver is the right tool here (no scroll-event
 *       polling, no layout thrashing) — and with only 2-3 targets on
 *       one page, it stays cheap.
 * WHEN: Any page with a small, known set of in-page sections and a
 *       matching anchor nav (currently just BudgetPage).
 * WHEN NOT: Long-form content with many (10+) headings — that's a
 *           different, heavier problem (e.g. a table-of-contents
 *           component that generates ids dynamically), not this hook.
 *
 * `rootMargin`'s top offset accounts for the sticky header (~96px) plus
 * the sticky section nav itself, so a section is marked "active" right
 * as it clears both fixed bars, not when it's already half-scrolled-past.
 */
export function useActiveSection(sectionIds: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Multiple sections can be "intersecting" at once near a fast
        // scroll; pick the one closest to the top of the tracked band
        // so the highlighted link matches what's actually under the nav.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-160px 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}
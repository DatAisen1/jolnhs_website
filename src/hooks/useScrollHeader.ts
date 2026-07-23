import { useEffect, useState } from "react";

/**
 * useScrollHeader
 *
 * WHAT: Tracks whether the page has been scrolled past a threshold.
 * WHY:  The header must be transparent over the hero image and switch to a
 *       solid white background once the user scrolls past it, so nav text
 *       stays readable against any hero content.
 * WHEN: Any layout with a transparent-over-hero sticky header.
 * WHEN NOT: Pages without a full-bleed hero (dashboards, forms) — a plain
 *           solid header is simpler and should not use this hook.
 *
 * Uses a passive scroll listener (cheap) rather than an IntersectionObserver
 * here because we only care about a single numeric threshold, not element
 * visibility — IO would be overkill for this specific case.
 */
export function useScrollHeader(threshold = 64) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > threshold);
    handleScroll(); // set correct state on mount (e.g. if page loads mid-scroll)
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isScrolled;
}

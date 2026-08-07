import { useEffect } from "react";

const SITE_NAME = "Julia Ortiz Luis National High School";

/**
 * usePageTitle
 *
 * WHAT: Sets `document.title` for the current route.
 * WHY:  `index.html` only defines one static title for the whole SPA, so
 *       every route (Home, About, Faculty & Staff, ...) showed the same
 *       browser tab title — bad for SEO, bookmarking, and multi-tab
 *       browsing. Each page calls this once with its own label.
 * WHEN: Call at the top of every page component. Omit `title` (or call
 *       with no arguments) on the homepage to show just the site name.
 *
 * `description`, if passed, overwrites the single site-wide
 * `<meta name="description">` in index.html for as long as the route is
 * mounted, so each page can control its own search-result / social-share
 * snippet instead of every route showing the homepage's copy. Optional —
 * pages that don't pass one simply leave the existing meta tag alone.
 */
export function usePageTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  }, [title]);

  useEffect(() => {
    if (!description) return;
    const meta = document.querySelector('meta[name="description"]');
    const previous = meta?.getAttribute("content") ?? null;
    meta?.setAttribute("content", description);
    return () => {
      if (previous !== null) meta?.setAttribute("content", previous);
    };
  }, [description]);
}
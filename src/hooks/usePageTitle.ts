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
 */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}

import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  href?: string; // omit on the last/current item
}

/**
 * Breadcrumbs
 *
 * WHAT: A "Home / Section / Current Page" trail.
 * WHY:  Helps orient a visitor who landed deep in the site (e.g. from a
 *       search engine or a shared link) about where they are in the
 *       overall structure, and gives a one-click way back up a level.
 * WHEN: Any sub-page more than one level deep (About/*, Academics/*, etc).
 * WHEN NOT: The homepage itself — there's no "trail" to show at the root.
 *
 * The current page (last item) renders as plain text with
 * `aria-current="page"`, not a link — you can't navigate to where you
 * already are.
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="bg-primary-700">
      <div className="mx-auto flex max-w-content items-center gap-2 px-6 py-3 text-small text-secondary-100 md:px-10">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={item.label} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-secondary-300" aria-hidden="true" />}
              {isLast || !item.href ? (
                <span aria-current={isLast ? "page" : undefined} className="font-medium text-white">
                  {item.label}
                </span>
              ) : (
                <Link to={item.href} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </nav>
  );
}
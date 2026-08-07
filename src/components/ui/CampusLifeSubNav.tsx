import { Link } from "react-router-dom";
import { campusLifeSections } from "@/data/campusLife";

const links = [
  { label: "Overview", href: "/campus-life" },
  ...campusLifeSections.map((section) => ({
    label: section.name,
    href: `/campus-life/${section.slug}`,
  })),
];

/**
 * CampusLifeSubNav
 *
 * WHAT: A small in-page nav bar linking between the Campus Life landing
 *       page and each of its five sub-pages, with the current page
 *       visually marked.
 * WHY:  Same reasoning as AcademicsSubNav — without this, moving between
 *       Organizations, PTA, Athletes, Campus Journalists, and Campus
 *       Gallery means scrolling back up and reopening the header
 *       dropdown. Built from `campusLifeSections` (not a hardcoded list)
 *       so adding a new sub-page to the data automatically adds it here.
 * WHEN: The Campus Life landing page and any /campus-life/* sub-page.
 */
export function CampusLifeSubNav({ current }: { current: string }) {
  return (
    <nav aria-label="Campus Life sections" className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-content gap-1 overflow-x-auto px-6 md:px-10 max-md:[mask-image:linear-gradient(to_right,black_92%,transparent)]">
        {links.map((link) => {
          const isActive = link.href === current;
          return (
            <Link
              key={link.href}
              to={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-small font-medium transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
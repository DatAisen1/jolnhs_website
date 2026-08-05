import { Link } from "react-router-dom";
import { academicPrograms } from "@/data/academics";

const links = [
  { label: "Overview", href: "/academics" },
  ...academicPrograms.map((program) => ({
    label: program.name,
    href: `/academics/${program.slug}`,
  })),
];

/**
 * AcademicsSubNav
 *
 * WHAT: A small in-page nav bar linking between the Academics landing
 *       page and each of its five track pages, with the current page
 *       visually marked.
 * WHY:  Same reasoning as AboutSubNav — without this, moving between
 *       tracks means scrolling back up and reopening the header dropdown.
 *       Built from `academicPrograms` (not a hardcoded list) so adding a
 *       new track to the data automatically adds it here too.
 * WHEN: The Academics landing page and any /academics/* track page.
 */
export function AcademicsSubNav({ current }: { current: string }) {
  return (
    <nav aria-label="Academic program sections" className="border-b border-border bg-white">
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
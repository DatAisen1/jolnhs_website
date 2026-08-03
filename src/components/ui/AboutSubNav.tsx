const links = [
  { label: "Overview", href: "/about/overview" },
  { label: "Faculty & Staff", href: "/about/faculty-staff" },
];

/**
 * AboutSubNav
 *
 * WHAT: A small in-page nav bar linking between the About JOLNHS
 *       sub-pages, with the current page visually marked.
 * WHY:  Without this, the only way to move between Overview and Faculty
 *       & Staff is the header dropdown — which means scrolling back up
 *       and re-opening a menu just to see the other half of the same
 *       section. This keeps the whole "About JOLNHS" area feeling like
 *       one place, not two unrelated URLs that happen to share a prefix.
 * WHEN: Any page under /about/*. Extend `links` here as more About
 *       sub-pages are built (this list is the single source of truth,
 *       not duplicated per page).
 */
export function AboutSubNav({ current }: { current: string }) {
  return (
    <nav aria-label="About JOLNHS sections" className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-content gap-1 overflow-x-auto px-6 md:px-10">
        {links.map((link) => {
          const isActive = link.href === current;
          return (
            <a
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-small font-medium transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-primary"
              }`}
            >
              {link.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
const sections = [
  { label: "Proposed Budget", href: "#proposed-budget" },
  { label: "Budget Allocation", href: "#budget-allocation" },
  { label: "Accomplishments", href: "#accomplishments" },
];

/**
 * BudgetSectionNav
 *
 * WHAT: A slim sticky-under-header bar with three anchor links, one per
 *       section of the Budget Transparency page.
 * WHY:  The header dropdown for Budget Transparency was removed (the
 *       three sub-pages it pointed to — Proposed Budget, Budget
 *       Allocation, Accomplishments — no longer exist as separate
 *       routes; they're sections of one page now). Without this bar, a
 *       visitor who wants to jump straight to "Accomplishments" has to
 *       scroll past everything else. Plain `<a href="#...">` anchors
 *       are used (not JS-driven scrollspy/active-state tracking) —
 *       there are only three short sections, so the extra
 *       IntersectionObserver complexity wouldn't earn its keep.
 * WHEN: Directly below the hero on the Budget Transparency page only.
 * WHEN NOT: Any page with fewer than ~3 distinct scroll targets, or one
 *           long enough that "which section am I in" genuinely needs
 *           active-state tracking (CampusLifeSubNav/AcademicsSubNav
 *           solve that differently, by linking to separate routes).
 *
 * Deliberately NOT `position: sticky` — the Header is already sticky at
 * `top-4`, and stacking a second sticky bar under it means fighting its
 * z-index/offset math for a marginal gain on a 3-item nav. Every other
 * sub-nav in this codebase (CampusLifeSubNav, AcademicsSubNav) is static
 * for the same reason; this one stays consistent with that pattern.
 */
export function BudgetSectionNav() {
  return (
    <nav aria-label="Budget page sections" className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-content gap-1 overflow-x-auto px-6 md:px-10">
        {sections.map((section) => (
          <a
            key={section.href}
            href={section.href}
            className="whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-small font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
          >
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
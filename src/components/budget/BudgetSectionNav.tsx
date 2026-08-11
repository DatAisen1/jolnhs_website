import { useActiveSection } from "@/hooks/useActiveSection";

const sections = [
  { id: "proposed-budget", label: "Proposed Budget" },
  { id: "budget-allocation", label: "Budget Allocation" },
  { id: "accomplishments", label: "Accomplishments" },
];

/**
 * BudgetSectionNav
 *
 * WHAT: A slim anchor bar linking to the three sections of the Budget
 *       Transparency page, with the currently-visible section
 *       highlighted as you scroll.
 * WHY:  Proposed Budget, Budget Allocation, and Accomplishments used to
 *       be three separate routes reachable via the header dropdown.
 *       They're now sections of one page — this bar replaces that
 *       dropdown as the way to jump between them, and the active state
 *       (via useActiveSection) tells the visitor which one they're
 *       currently reading, the same job a dropdown's own "current page"
 *       highlight would have done.
 * WHEN: Directly below the hero/breadcrumbs on the Budget Transparency
 *       page only.
 *
 * Sticky at `top-24` (96px) — that's the Header's own height (h-20) plus
 * its `top-4` offset, so this bar docks directly under the floating
 * header pill instead of fighting it for the same vertical space. Sits
 * at `z-40`, below the header's `z-[1000]`, so the header always wins
 * if anything ever overlaps during the scroll transition.
 */
export function BudgetSectionNav() {
  const activeId = useActiveSection(sections.map((s) => s.id));

  return (
    <nav
      aria-label="Budget page sections"
      className="sticky top-24 z-40 border-b border-border bg-white/90 shadow-sm backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-content gap-1 overflow-x-auto px-6 md:px-10">
        {sections.map((section) => {
          const isActive = activeId === section.id;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={isActive ? "true" : undefined}
              className={`relative whitespace-nowrap px-4 py-3 text-small font-semibold transition-colors ${
                isActive ? "text-primary" : "text-text-secondary hover:text-primary"
              }`}
            >
              {section.label}
              {/* Underline is a separate absolutely-positioned span (not
                  a border) so it can animate width/opacity independently
                  without shifting the text's own layout box. */}
              <span
                aria-hidden="true"
                className={`absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-primary transition-opacity ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
            </a>
          );
        })}
      </div>
    </nav>
  );
}
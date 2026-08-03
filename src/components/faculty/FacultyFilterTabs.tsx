import { staffCategories } from "@/data/facultyStaff";

interface FacultyFilterTabsProps {
  active: string;
  onChange: (categoryId: string) => void;
}

/**
 * FacultyFilterTabs
 *
 * WHAT: A row of toggle buttons for filtering the staff grid by category.
 * WHY / A11Y NOTE: This uses `role="group"` + `aria-pressed` per button,
 *       NOT the ARIA `tablist`/`tab` pattern. Tabs are for switching
 *       between separate content panels; these buttons instead re-filter
 *       ONE grid in place — that's a toggle-button-group, and using the
 *       tablist pattern here would imply keyboard behavior (arrow-key
 *       navigation between panels) that doesn't actually apply.
 */
export function FacultyFilterTabs({ active, onChange }: FacultyFilterTabsProps) {
  return (
    <div
      role="group"
      aria-label="Filter staff by category"
      className="flex flex-wrap justify-center gap-2"
    >
      {staffCategories.map((category) => {
        const isActive = active === category.id;
        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(category.id)}
            className={`rounded-full px-4 py-2 text-small font-medium transition-colors ${
              isActive
                ? "bg-primary text-white"
                : "border border-border bg-white text-text-secondary hover:border-primary hover:text-primary"
            }`}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
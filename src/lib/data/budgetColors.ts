/**
 * Fixed color enum for `budget_categories.color_class` (P1.14).
 *
 * Same 8 `bg-primary-*` Tailwind classes the public BudgetPage's
 * placeholder data already uses for its allocation-chart bar fills
 * (see `src/data/budget.ts`), so an admin-chosen color is guaranteed
 * to already exist as a real class in the compiled stylesheet — never
 * an arbitrary hex value Tailwind's JIT hasn't generated a class for.
 *
 * `hex` is only for rendering the picker/swatch preview *inside the
 * admin panel* (ListItemCard's swatch needs a real CSS color for its
 * inline `style`, not a class name) — the public site keeps using
 * `colorClass` directly as a Tailwind class, unchanged.
 */
export const BUDGET_COLOR_OPTIONS: ReadonlyArray<{ value: string; label: string; hex: string }> = [
  { value: "bg-primary", label: "Primary Blue", hex: "#1C3E7C" },
  { value: "bg-primary-600", label: "Sapphire", hex: "#2955A3" },
  { value: "bg-primary-400", label: "Sky Blue", hex: "#4C7DC8" },
  { value: "bg-primary-700", label: "Deep Navy", hex: "#0F2148" },
  { value: "bg-primary-300", label: "Light Blue", hex: "#7FA6DD" },
  { value: "bg-primary-800", label: "Midnight", hex: "#0A1730" },
  { value: "bg-primary-900", label: "Near Ink", hex: "#050D1C" },
  { value: "bg-primary-200", label: "Pale Blue", hex: "#AFC8EC" },
];

export const BUDGET_COLOR_CLASSES = BUDGET_COLOR_OPTIONS.map((o) => o.value) as [string, ...string[]];

export function getBudgetColorHex(colorClass: string): string {
  return BUDGET_COLOR_OPTIONS.find((o) => o.value === colorClass)?.hex ?? BUDGET_COLOR_OPTIONS[0].hex;
}
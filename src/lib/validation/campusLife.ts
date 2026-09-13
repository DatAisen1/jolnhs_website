import { z } from "zod";

// One small schema per record shape, reused by both the inline field-level
// checks (ListEditor rows, officer name on blur) and the Save-button gate in
// CampusLifeManagePage — so "what counts as valid" is defined once instead
// of re-implemented as ad-hoc `!value.trim()` checks at each call site.

export const statSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  value: z.string().trim().min(1, "Value is required"),
});

export const highlightSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  // Description is intentionally unconstrained — only empty *titles* were
  // reported as saveable-but-invalid; don't invent a new rule for a field
  // nobody asked to validate.
  description: z.string(),
});

export const officerNameSchema = z.string().trim().min(1, "Name is required");

/** Runs a per-row Zod object schema across a list and returns an
 *  index-aligned array of {field: message} maps — the shape ListEditor's
 *  `errors` prop expects. Kept generic so both Stats and Highlights (and
 *  any future ListEditor-backed list) share one implementation instead of
 *  each screen hand-rolling its own Zod-issue-to-error-map plumbing. */
export function rowErrors<T extends Record<string, string>>(
  schema: z.ZodType<T>,
  items: T[]
): Array<Partial<Record<keyof T, string>>> {
  return items.map((item) => {
    const result = schema.safeParse(item);
    if (result.success) return {};
    const errors: Partial<Record<keyof T, string>> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof T;
      if (!(key in errors)) errors[key] = issue.message;
    }
    return errors;
  });
}
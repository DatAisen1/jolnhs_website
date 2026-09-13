import { Plus } from "lucide-react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

interface ListEditorProps<T extends { id: string }> {
  items: T[];
  onChange: (items: T[]) => void;
  fields: Array<{ key: keyof T; placeholder: string; type?: "input" | "textarea" }>;
  /** No `id` required here — ListEditor mints one itself in `addItem`,
   *  so callers never have to invent a throwaway id just to satisfy T. */
  emptyItem: Omit<T, "id">;
  addLabel: string;
  /** Optional per-row, per-field error messages (index-aligned with `items`).
   *  ListEditor stays agnostic to *how* errors are computed (Zod, or
   *  anything else) — it only knows how to render them. */
  errors?: Array<Partial<Record<keyof T, string>>>;
}

/** Generic add/edit/remove list editor. Works for both Stats
 *  ({label, value}) and Highlights ({title, description}) by taking the
 *  field definitions as props, instead of building two near-identical
 *  components — the pattern ("a short list of records the admin edits
 *  inline") is the same regardless of the shape. */
export function ListEditor<T extends { id: string }>({
  items,
  onChange,
  fields,
  emptyItem,
  addLabel,
  errors,
}: ListEditorProps<T>) {
  function updateItem(index: number, key: keyof T, value: string) {
    const next = [...items];
    // Cast needed: only `id` is declared in T's constraint, so TS can't
    // verify a `string` is assignable to an arbitrary `T[key]` slot from
    // the generic alone. Every field ListEditor is ever configured with
    // (label/value, title/description) is string-valued — that's an
    // invariant of how this component gets used, not something a fully
    // generic T can express on its own.
    next[index] = { ...next[index], [key]: value } as T;
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, { ...emptyItem, id: crypto.randomUUID() } as T]);
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-2 rounded-lg border border-border bg-background p-3">
          <div className="flex-1 space-y-2">
            {fields.map((field) => {
              const fieldError = errors?.[index]?.[field.key];
              const value = (item[field.key] as string | undefined) ?? "";
              const inputClassName = `w-full rounded-md border bg-white px-3 py-1.5 text-small text-text-primary focus:outline-none focus:ring-2 ${
                fieldError ? "border-status-error focus:ring-status-error" : "border-border focus:ring-primary"
              }`;
              return (
                <div key={String(field.key)}>
                  {field.type === "textarea" ? (
                    <textarea
                      value={value}
                      onChange={(e) => updateItem(index, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={2}
                      className={inputClassName}
                    />
                  ) : (
                    <input
                      value={value}
                      onChange={(e) => updateItem(index, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={inputClassName}
                    />
                  )}
                  {fieldError && <p className="mt-1 text-small text-status-error-text">{fieldError}</p>}
                </div>
              );
            })}
          </div>
          <ConfirmButton label="Remove item" onConfirm={() => removeItem(index)} />
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1.5 text-small font-medium text-primary hover:text-primary-700"
      >
        <Plus size={15} />
        {addLabel}
      </button>

      {items.length === 0 && (
        <p className="text-small text-text-secondary">Nothing here yet — add one above.</p>
      )}
    </div>
  );
}
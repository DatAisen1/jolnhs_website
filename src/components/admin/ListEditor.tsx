import { ImagePlus, Plus, X } from "lucide-react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

interface ListEditorProps<T extends { id: string }> {
  items: T[];
  onChange: (items: T[]) => void;
  fields: Array<{
    key: keyof T;
    /** Accessible label text — always rendered as a visually-hidden
     *  `<label>`, never left for `placeholder` to stand in for (P2.2:
     *  placeholder is a hint, not a substitute for a real label). */
    label: string;
    placeholder: string;
    type?: "input" | "textarea";
  }>;
  /** No `id` required here — ListEditor mints one itself in `addItem`,
   *  so callers never have to invent a throwaway id just to satisfy T. */
  emptyItem: Omit<T, "id">;
  addLabel: string;
  /** Optional per-row, per-field error messages (index-aligned with `items`).
   *  ListEditor stays agnostic to *how* errors are computed (Zod, or
   *  anything else) — it only knows how to render them. */
  errors?: Array<Partial<Record<keyof T, string>>>;
  /** Optional per-row image slot. ListEditor doesn't know where images
   *  live — the caller supplies the thumbnail src and handles the file.
   *  Kept generic (not part of `fields`) because a file input is a
   *  different beast from the text fields this component exists for. */
  imageField?: {
    label: string;
    /** item → thumbnail src; undefined renders an empty pick tile. */
    previewFor: (item: T) => string | undefined;
    onPick: (index: number, file: File) => void;
    onClear?: (index: number) => void;
    /** item → true while that row's upload is in flight (disables input). */
    isUploading?: (item: T) => boolean;
  };
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
  imageField,
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
          {imageField && (
            <div className="flex w-20 shrink-0 flex-col items-center gap-1.5 self-start">
              {imageField.previewFor(item) ? (
                <div className="relative">
                  <img
                    src={imageField.previewFor(item)}
                    alt=""
                    className="h-20 w-20 rounded-md border border-border object-cover"
                  />
                  {imageField.onClear && (
                    <button
                      type="button"
                      onClick={() => imageField.onClear?.(index)}
                      aria-label={`Remove ${imageField.label} for item ${index + 1}`}
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-surface p-0.5 text-text-secondary shadow-sm ring-1 ring-border transition-colors hover:text-status-error-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ) : (
                <label
                  htmlFor={`${item.id}-image`}
                  className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-surface text-text-secondary transition-colors hover:border-primary hover:text-primary has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-primary"
                >
                  <ImagePlus size={18} />
                  <span className="px-1 text-center text-[10px] leading-tight">{imageField.label}</span>
                </label>
              )}
              <input
                id={`${item.id}-image`}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={imageField.isUploading?.(item)}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) imageField.onPick(index, file);
                  e.target.value = "";
                }}
                className="sr-only"
              />
              {imageField.previewFor(item) && (
                <label htmlFor={`${item.id}-image`} className="cursor-pointer text-[10px] text-text-secondary hover:text-primary">
                  {imageField.isUploading?.(item) ? "Uploading…" : "Replace"}
                </label>
              )}
            </div>
          )}
          <div className="flex-1 space-y-2">
            {fields.map((field) => {
              const fieldError = errors?.[index]?.[field.key];
              const value = (item[field.key] as string | undefined) ?? "";
              const inputId = `${item.id}-${String(field.key)}`;
              const inputClassName = `w-full rounded-md border bg-surface px-3 py-1.5 text-small text-text-primary focus:outline-none focus:ring-2 ${
                fieldError ? "border-status-error focus:ring-status-error" : "border-border focus:ring-primary"
              }`;
              return (
                <div key={String(field.key)}>
                  <label htmlFor={inputId} className="sr-only">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      id={inputId}
                      value={value}
                      onChange={(e) => updateItem(index, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={2}
                      className={inputClassName}
                    />
                  ) : (
                    <input
                      id={inputId}
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
          <ConfirmButton
            label="Remove item"
            confirmMessage="Remove this item? It will be removed when you save the section."
            onConfirm={() => removeItem(index)}
          />
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
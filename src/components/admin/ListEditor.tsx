import { Plus, Trash2 } from "lucide-react";

interface ListEditorProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  fields: Array<{ key: keyof T; placeholder: string; type?: "input" | "textarea" }>;
  emptyItem: T;
  addLabel: string;
}

/** Generic add/edit/remove list editor. Works for both Stats
 *  ({label, value}) and Highlights ({title, description}) by taking the
 *  field definitions as props, instead of building two near-identical
 *  components — the pattern ("a short list of records the admin edits
 *  inline") is the same regardless of the shape. */
export function ListEditor<T extends Record<string, string>>({
  items,
  onChange,
  fields,
  emptyItem,
  addLabel,
}: ListEditorProps<T>) {
  function updateItem(index: number, key: keyof T, value: string) {
    const next = [...items];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, emptyItem]);
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 rounded-lg border border-border bg-background p-3">
          <div className="flex-1 space-y-2">
            {fields.map((field) => (
              <div key={String(field.key)}>
                {field.type === "textarea" ? (
                  <textarea
                    value={item[field.key] ?? ""}
                    onChange={(e) => updateItem(index, field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={2}
                    className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <input
                    value={item[field.key] ?? ""}
                    onChange={(e) => updateItem(index, field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => removeItem(index)}
            aria-label="Remove item"
            className="self-start text-text-secondary hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
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
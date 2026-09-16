import { useState } from "react";
import { Pencil, Trash2, User } from "lucide-react";

export type ListItemCardLeadingVisual =
  | {
      kind: "photo";
      photoUrl?: string | null;
      /** Accessible description of the photo itself, e.g. "Photo for Jane Doe". */
      alt: string;
      /** Shows a small inline spinner overlay while a previously-selected file is uploading. */
      uploading?: boolean;
      /** Omit to make the circle non-interactive (e.g. read-only contexts). */
      onSelectPhoto?: (file: File) => void;
      accept?: string;
    }
  | {
      kind: "swatch";
      color: string;
    };

export interface ListItemCardField {
  /** Matches a key in the values map passed to `onSave`. */
  key: string;
  /** Accessible label — always rendered as a visually-hidden `<label>` (P2.2). */
  label: string;
  placeholder?: string;
  type?: "input" | "textarea";
  initialValue: string;
}

export interface ListItemCardSaveResult {
  /** Per-field validation messages, keyed by `ListItemCardField.key`,
   *  shown under their fields. */
  fieldErrors?: Record<string, string>;
}

export interface ListItemCardProps {
  title: string;
  subtitle?: string;
  leadingVisual: ListItemCardLeadingVisual;
  /** Field set for the edit form. Empty/omitted if this card is
   *  view-and-delete only (no editable text fields). */
  fields?: ListItemCardField[];
  /** Called with the buffered field values on Save. Returning any result
   *  object (even `{}`) keeps the card in `editing` — the caller either
   *  found a validation problem (populate `fieldErrors`) or the save
   *  itself failed and is already surfaced elsewhere (return `{}` so the
   *  admin's in-progress edit isn't discarded). Returning nothing/undefined
   *  means the save succeeded and closes the card back to `normal`. */
  onSave?: (values: Record<string, string>) => Promise<ListItemCardSaveResult | void> | ListItemCardSaveResult | void;
  onDelete: () => void;
  /** aria-label for the delete trigger, e.g. "Delete Jane Doe". */
  deleteLabel: string;
  /** aria-label for the edit trigger, e.g. "Edit Jane Doe". */
  editLabel?: string;
  /** Message shown in the confirming-delete state. Defaults to a generic warning. */
  deleteConfirmMessage?: string;
  deleteDisabled?: boolean;
}

type Mode = "normal" | "editing" | "confirming-delete";

function LeadingVisual({ visual }: { visual: ListItemCardLeadingVisual }) {
  if (visual.kind === "swatch") {
    return (
      <span
        className="h-14 w-14 shrink-0 rounded-full ring-1 ring-border"
        style={{ backgroundColor: visual.color }}
        aria-hidden="true"
      />
    );
  }

  const circle = (
    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-border">
      {visual.photoUrl ? (
        <img src={visual.photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <User size={22} className="text-text-secondary" aria-hidden="true" />
      )}
      {visual.uploading && (
        <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-[10px] text-text-secondary">
          …
        </span>
      )}
    </span>
  );

  if (!visual.onSelectPhoto) return circle;

  // Photo upload stays independent of the card's normal/editing/
  // confirming-delete state machine — swapping a photo isn't a text-field
  // edit that needs a Save/Cancel round trip, it uploads immediately
  // (matches the pre-existing OfficerManager behavior).
  return (
    <label className="cursor-pointer">
      <span className="sr-only">{visual.alt}</span>
      {circle}
      <input
        type="file"
        accept={visual.accept ?? "image/jpeg,image/png,image/webp"}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) visual.onSelectPhoto?.(file);
        }}
      />
    </label>
  );
}

/**
 * Shared tri-state list-item card (P1.9): `normal` (view) → `editing`
 * (inline expand-to-edit form) → `confirming-delete` (inline red
 * confirm/cancel). One component instead of a bespoke row per module —
 * built generic enough for Officers, Staff & Faculty, and Budget
 * categories/accomplishments to all use the same pattern (see the
 * "Shared List-Item Pattern" section of the admin development plan).
 *
 * This resolves P1.1 (destructive-action confirmation) and P2.2
 * (accessible field labels) for every consumer at once, rather than
 * each module re-solving them independently.
 */
export function ListItemCard({
  title,
  subtitle,
  leadingVisual,
  fields = [],
  onSave,
  onDelete,
  deleteLabel,
  editLabel,
  deleteConfirmMessage,
  deleteDisabled,
}: ListItemCardProps) {
  const [mode, setMode] = useState<Mode>("normal");
  const [values, setValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  function openEdit() {
    setValues(Object.fromEntries(fields.map((f) => [f.key, f.initialValue])));
    setFieldErrors({});
    setMode("editing");
  }

  async function handleSave() {
    if (!onSave) {
      setMode("normal");
      return;
    }
    setIsSaving(true);
    const result = await onSave(values);
    setIsSaving(false);
    if (result) {
      setFieldErrors(result.fieldErrors ?? {});
      return; // stay in editing — either a field is invalid, or the save failed
    }
    setMode("normal");
  }

  function handleConfirmDelete() {
    onDelete();
    setMode("normal"); // optimistic — the row disappears once the parent's list updates
  }

  const iconButtonClass =
    "rounded p-1 text-text-secondary hover:text-text-primary hover:bg-black/5 disabled:opacity-50 disabled:hover:bg-transparent";

  if (mode === "confirming-delete") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-status-error bg-status-error-bg p-3">
        <LeadingVisual visual={leadingVisual} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-small font-medium text-text-primary">{title}</p>
          <p className="text-small text-status-error-text">
            {deleteConfirmMessage ?? `Delete ${title}? This can't be undone.`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 self-start">
          <button
            type="button"
            onClick={handleConfirmDelete}
className="rounded-md bg-status-error px-2 py-1 text-small font-medium text-white hover:bg-status-error-text"          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => setMode("normal")}
            className="rounded-md border border-border px-2 py-1 text-small text-text-secondary hover:bg-background"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (mode === "editing") {
    return (
      <div className="flex gap-3 rounded-lg border border-primary bg-background p-3">
        <LeadingVisual visual={leadingVisual} />
        <div className="min-w-0 flex-1 space-y-2">
          {fields.map((field) => {
            const inputId = `${title}-${field.key}`.replace(/\s+/g, "-");
            const error = fieldErrors[field.key];
            const value = values[field.key] ?? "";
            const inputClassName = `w-full rounded-md border bg-white px-2.5 py-1.5 text-small text-text-primary focus:outline-none focus:ring-2 ${
              error ? "border-status-error focus:ring-status-error" : "border-border focus:ring-primary"
            }`;
            return (
              <div key={field.key}>
                <label htmlFor={inputId} className="sr-only">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={inputId}
                    value={value}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={2}
                    className={inputClassName}
                  />
                ) : (
                  <input
                    id={inputId}
                    value={value}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    aria-invalid={Boolean(error)}
                    className={inputClassName}
                  />
                )}
                {error && <p className="text-small text-status-error-text">{error}</p>}
              </div>
            );
          })}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="rounded-md bg-primary px-2.5 py-1 text-small font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setMode("normal")}
              disabled={isSaving}
              className="rounded-md border border-border px-2.5 py-1 text-small text-text-secondary hover:bg-background disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
      <LeadingVisual visual={leadingVisual} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-small font-medium text-text-primary">{title}</p>
        {subtitle && <p className="truncate text-small text-text-secondary">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1 self-start">
        {fields.length > 0 && (
          <button type="button" onClick={openEdit} aria-label={editLabel ?? `Edit ${title}`} className={iconButtonClass}>
            <Pencil size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setMode("confirming-delete")}
          aria-label={deleteLabel}
          disabled={deleteDisabled}
          className={iconButtonClass}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
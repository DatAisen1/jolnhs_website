import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";

interface ConfirmButtonProps {
  /** Runs only after the second (confirm) click — never on the first. */
  onConfirm: () => void;
  /** aria-label for the initial trigger icon, e.g. "Archive Jane Doe" or "Remove item". */
  label: string;
  disabled?: boolean;
  confirmMessage?: string;
}

/**
 * Two-step trigger for destructive actions: the first click reveals an
 * inline "Confirm / Cancel" prompt in place of the trash icon; nothing
 * destructive runs until Confirm is explicitly clicked, and Cancel (or
 * clicking Confirm's sibling escape hatch) discards the intent with no
 * side effect.
 *
 * This exists as one shared component specifically so "are you sure"
 * isn't hand-rolled per call site — see Principle 2 (one pattern, not
 * three) in the recovery plan. It's intentionally *not* the full
 * ListItemCard tri-state component (normal → editing → confirming) that
 * Phase 4 will extract later; this is the minimal P1.1 slice: just the
 * confirm step, reusable by any icon-trigger delete/archive action today.
 */
export function ConfirmButton({ onConfirm, label, disabled, confirmMessage = "Remove this item? This action cannot be undone." }: ConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex shrink-0 items-center gap-1.5 self-start">
        <div className="min-w-0 flex-1 text-small text-status-error-text">{confirmMessage}</div>
        <AdminButton
          type="button"
          variant="danger"
          onClick={() => {
            setConfirming(false);
            onConfirm();
          }}
          className="min-h-8 px-2 py-1"
        >
          Confirm
        </AdminButton>
        <AdminButton
          type="button"
          variant="secondary"
          onClick={() => setConfirming(false)}
          className="min-h-8 px-2 py-1"
        >
          Cancel
        </AdminButton>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={label}
      disabled={disabled}
      className="self-start rounded-md p-1 text-text-secondary hover:bg-background hover:text-status-error-text disabled:opacity-50"
      title={label}
    >
      <Trash2 size={16} />
    </button>
  );
}
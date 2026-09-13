import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, type LucideIcon } from "lucide-react";

type Variant = "error" | "success" | "warning" | "info";

interface InlineNoticeProps {
  variant: Variant;
  /** Main text. A ReactNode so callers can drop in inline formatting
   *  (e.g. quoting a slug) without reaching for dangerouslySetInnerHTML. */
  message: ReactNode;
  /** Optional bold lead-in line above `message`, for the "couldn't load
   *  X" + reason pattern. Omit for a single-line notice. */
  title?: string;
  /** When provided, renders a Retry button that calls this. */
  onRetry?: () => void;
  /** Swaps the retry button's label to "Retrying…" and disables it. */
  retrying?: boolean;
  className?: string;
}

const VARIANT_ICON: Record<Variant, LucideIcon> = {
  error: AlertTriangle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

// Every color here is one of the four semantic status tokens already
// defined in tailwind.config.ts (status.error/warning/success/info),
// each with a DEFAULT (border), `-bg`, and `-text` variant — never a
// one-off hex value, so re-theming a status color stays a single edit
// in the config instead of a grep across every call site.
const VARIANT_CLASSES: Record<Variant, string> = {
  error: "border-status-error bg-status-error-bg text-status-error-text",
  warning: "border-status-warning bg-status-warning-bg text-status-warning-text",
  success: "border-status-success bg-status-success-bg text-status-success-text",
  info: "border-status-info bg-status-info-bg text-status-info-text",
};

/**
 * One shared primitive for every inline error/success/warning/info
 * banner in the admin — icon + message, with an optional Retry action.
 * Replaces the near-identical bespoke JSX previously hand-rolled in
 * DashboardPage, CampusLifeManagePage, and OfficerManager (P2.1).
 *
 * `error`/`warning` announce via `role="alert"` (assertive — the admin
 * needs to know now); `success`/`info` use `role="status"` (polite —
 * confirmation, not an interruption).
 */
export function InlineNotice({
  variant,
  message,
  title,
  onRetry,
  retrying,
  className = "",
}: InlineNoticeProps) {
  const Icon = VARIANT_ICON[variant];
  const role = variant === "error" || variant === "warning" ? "alert" : "status";

  return (
    <div
      role={role}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
      <div className="flex-1">
        {title && <p className="text-small font-medium">{title}</p>}
        <p className={title ? "mt-0.5 text-small opacity-80" : "text-small font-medium"}>{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="shrink-0 rounded-md border border-current px-3 py-1.5 text-small font-medium hover:bg-black/5 disabled:opacity-50"
        >
          {retrying ? "Retrying…" : "Retry"}
        </button>
      )}
    </div>
  );
}
import { AlertCircle, Loader2 } from "lucide-react";

interface PageStatusProps {
  variant: "loading" | "error";
  message: string;
  /** Rendered under the message — typically a retry button or back link. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * PageStatus
 *
 * One styled loading/error block for every public page instead of each
 * page emitting a bare <p> — the difference between "designed empty
 * state" and "the page glitched". `role="status"`/`role="alert"` give
 * screen readers the announcement for free.
 */
export function PageStatus({ variant, message, action, className = "" }: PageStatusProps) {
  const isError = variant === "error";
  const Icon = isError ? AlertCircle : Loader2;

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex flex-col items-center justify-center gap-3 py-16 text-center ${className}`}
    >
      <Icon
        className={`h-8 w-8 ${isError ? "text-status-error" : "animate-spin text-text-secondary"}`}
        aria-hidden="true"
      />
      <p className={`text-body ${isError ? "text-status-error-text" : "text-text-secondary"}`}>
        {message}
      </p>
      {action}
    </div>
  );
}

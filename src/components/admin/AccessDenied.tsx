import { Link } from "react-router-dom";

export function AccessDenied({
  onRetry,
  onSignOut,
}: {
  onRetry?: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg rounded-lg border border-status-error bg-status-error-bg p-6 text-status-error-text shadow-sm">
        <p className="text-small font-semibold uppercase tracking-[0.12em] text-status-error-text/80">Access denied</p>
        <h1 className="mt-3 text-2xl font-bold text-status-error-text">You do not have admin access.</h1>
        <p className="mt-3 text-small text-status-error-text/80">
          This account is not listed in the admin_users table. Please sign out or ask an administrator to grant access.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-md border border-current px-4 py-2 text-small font-medium hover:bg-black/5"
          >
            Sign out
          </button>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md border border-current px-4 py-2 text-small font-medium hover:bg-black/5"
            >
              Retry
            </button>
          )}
          <Link to="/" className="rounded-md border border-current px-4 py-2 text-small font-medium hover:bg-black/5">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

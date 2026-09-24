import { LoaderCircle } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { InlineNotice } from "@/components/ui/InlineNotice";

export function AdminPageSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading page">
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded bg-background" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-background" />
      </div>
      <AdminCardSkeleton />
    </div>
  );
}

export function AdminCardSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-white p-5" aria-hidden="true">
      <div className="h-5 w-40 animate-pulse rounded bg-background" />
      <div className="h-10 w-full animate-pulse rounded bg-background" />
      <div className="h-10 w-full animate-pulse rounded bg-background" />
    </div>
  );
}

export function AdminListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading list">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-lg border border-border bg-white p-4" aria-hidden="true">
          <div className="h-10 w-10 animate-pulse rounded-full bg-background" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 max-w-full animate-pulse rounded bg-background" />
            <div className="h-3 w-24 max-w-full animate-pulse rounded bg-background" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminErrorState({
  error,
  message = "We couldn't load this information.",
  onRetry,
  retrying = false,
}: {
  error?: unknown;
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <InlineNotice
      variant="error"
      title="Something went wrong"
      message={error ? getErrorMessage(error, message) : message}
      onRetry={onRetry}
      retrying={retrying}
    />
  );
}

export function AdminLoadingIndicator({ label = "Loading" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-small text-text-secondary" role="status">
      <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
      {label}
    </span>
  );
}

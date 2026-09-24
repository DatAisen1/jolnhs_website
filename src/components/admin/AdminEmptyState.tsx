import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AdminEmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export function AdminEmptyState({ title, description, icon: Icon, action }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-5 py-10 text-center">
      {Icon && (
        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon size={20} aria-hidden="true" />
        </span>
      )}
      <h2 className="text-small font-semibold text-text-primary">{title}</h2>
      <p className="mt-1 max-w-md text-small text-text-secondary">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  actions?: ReactNode;
}

export function AdminPageHeader({ title, description, action, actions }: AdminPageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-heading text-subtitle text-text-primary">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-small text-text-secondary">{description}</p>}
      </div>
      {(action || actions) && <div className="flex flex-wrap items-center gap-2">{actions}{action}</div>}
    </header>
  );
}

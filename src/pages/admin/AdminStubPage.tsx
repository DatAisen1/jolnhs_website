import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface AdminStubPageProps {
  title: string;
  icon: LucideIcon;
}

export function AdminStubPage({ title, icon: Icon }: AdminStubPageProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <Icon size={32} className="text-text-secondary" aria-hidden="true" />
      <h1 className="font-heading text-subtitle text-text-primary">{title}</h1>
      <p className="max-w-sm text-small text-text-secondary">
        This section hasn't been built yet. Check back soon, or head back to the dashboard.
      </p>
      <Link to="/admin" className="mt-1 text-small font-medium text-primary hover:text-primary-700">
        ← Back to Dashboard
      </Link>
    </div>
  );
}

import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Circle,
  FileText,
  Megaphone,
  Plus,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminErrorState, AdminPageSkeleton } from "@/components/admin/AdminStates";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";

function formatAge(updatedAt: string | null): string {
  if (!updatedAt) return "No update recorded";
  const ageInDays = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (ageInDays <= 0) return "Updated today";
  if (ageInDays === 1) return "Updated 1 day ago";
  return `Updated ${ageInDays} days ago`;
}

function statusLabel(updatedAt: string | null, available: boolean): string {
  if (!available) return "Not available yet";
  if (!updatedAt) return "Needs review";
  const ageInDays = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  return ageInDays > 180 ? "Needs review" : ageInDays <= 7 ? "Up to date" : formatAge(updatedAt);
}

function StatCard({
  icon: Icon,
  label,
  value,
  context,
  to,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  context: string;
  to: string;
}) {
  return (
    <AdminCard className="flex min-h-36 flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon size={19} aria-hidden="true" />
        </span>
        <Link to={to} className="rounded-md p-1 text-text-secondary hover:bg-background hover:text-primary" aria-label={`Manage ${label}`}>
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
      <div>
        <p className="mt-4 text-small text-text-secondary">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-text-primary">{value}</p>
        <p className="mt-1 text-small text-text-secondary">{context}</p>
      </div>
    </AdminCard>
  );
}

function QuickAction({ label, to, disabled = false }: { label: string; to?: string; disabled?: boolean }) {
  if (disabled || !to) {
    return (
      <AdminButton type="button" variant="secondary" disabled title="This feature is not available yet">
        <Plus size={15} aria-hidden="true" />
        {label}
      </AdminButton>
    );
  }

  return (
    <Link
      to={to}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-white px-3.5 py-2 text-small font-semibold text-text-primary transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <Plus size={15} aria-hidden="true" />
      {label}
    </Link>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardSummary();

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader title="Dashboard" description="Here's what's happening with the JOLNHS website." />

      {isLoading && <AdminPageSkeleton />}

      {isError && (
        <AdminErrorState
          error={error}
          message="We couldn't load the dashboard summary."
          onRetry={() => void refetch()}
          retrying={isFetching}
        />
      )}

      {!isLoading && !isError && data && (
        <div className="space-y-6">
          <section aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="mb-3 text-small font-semibold uppercase tracking-wide text-text-secondary">
              Overview
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={Users}
                label="Staff & Faculty"
                value={String(data.staff.activeCount)}
                context={`${data.staff.archivedCount} archived · ${formatAge(data.staff.updatedAt)}`}
                to="/admin/staff"
              />
              <StatCard
                icon={Building2}
                label="Campus Life"
                value={String(data.campusLife.sectionCount)}
                context={`Managed sections · ${formatAge(data.campusLife.updatedAt)}`}
                to="/admin/campus-life"
              />
              <StatCard
                icon={Wallet}
                label="Budget"
                value={data.budget.currentYear?.year_label ?? "No fiscal year"}
                context={data.budget.currentYear ? `${data.budget.categoryCount} categories · ${data.budget.currentYear.status}` : "Create a fiscal year to begin"}
                to="/admin/budget"
              />
              <StatCard
                icon={Megaphone}
                label="Announcements"
                value="Not available"
                context="Announcements content source is not implemented"
                to="/admin"
              />
            </div>
          </section>

          <AdminCard as="section" aria-labelledby="quick-actions-heading">
            <div className="mb-3">
              <h2 id="quick-actions-heading" className="text-small font-semibold text-text-primary">Quick actions</h2>
              <p className="mt-1 text-small text-text-secondary">Jump to the existing admin areas that can be managed today.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <QuickAction label="Add staff" to="/admin/staff" />
              <QuickAction label="Manage officers" to="/admin/campus-life" />
              <QuickAction label="Update budget" to="/admin/budget" />
              <QuickAction label="Add announcement" disabled />
              <QuickAction label="Upload photo" disabled />
            </div>
          </AdminCard>

          <AdminCard as="section" aria-labelledby="content-status-heading">
            <div className="mb-3">
              <h2 id="content-status-heading" className="text-small font-semibold text-text-primary">Website Content</h2>
              <p className="mt-1 text-small text-text-secondary">Content freshness from the sources currently available to the admin panel.</p>
            </div>
            <div className="divide-y divide-border">
              {data.content.map((item) => {
                const status = statusLabel(item.updatedAt, item.available);
                const needsReview = status === "Needs review";
                return (
                  <div key={item.key} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      {needsReview ? <Circle size={10} className="fill-status-warning text-status-warning" aria-hidden="true" /> : item.available ? <CheckCircle2 size={15} className="text-status-success" aria-hidden="true" /> : <Circle size={10} className="fill-text-secondary text-text-secondary" aria-hidden="true" />}
                      <span className="text-small font-medium text-text-primary">{item.label}</span>
                    </div>
                    <span className={`text-small ${needsReview ? "text-status-warning-text" : "text-text-secondary"}`}>{status}</span>
                  </div>
                );
              })}
            </div>
          </AdminCard>

          <AdminCard as="section" aria-labelledby="activity-heading">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 size={17} className="text-primary" aria-hidden="true" />
              <h2 id="activity-heading" className="text-small font-semibold text-text-primary">Recent Activity</h2>
            </div>
            <AdminEmptyState
              icon={FileText}
              title="Activity history will appear here once available."
              description="The project does not have an activity or audit table yet."
            />
          </AdminCard>
        </div>
      )}
    </div>
  );
}

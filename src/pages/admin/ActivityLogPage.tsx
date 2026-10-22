import { useState } from "react";
import { History } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminErrorState, AdminListSkeleton } from "@/components/admin/AdminStates";
import { useActivityLog, type ActivityEntry } from "@/lib/data/activityLog";

const ACTION_STYLES: Record<ActivityEntry["action"], { label: string; className: string }> = {
  create: { label: "Created", className: "bg-status-success-bg text-status-success-text" },
  update: { label: "Updated", className: "bg-primary/10 text-primary" },
  publish: { label: "Published", className: "bg-status-success-bg text-status-success-text" },
  unpublish: { label: "Unpublished", className: "bg-black/5 text-text-secondary" },
  archive: { label: "Archived", className: "bg-status-warning-bg text-status-warning-text" },
  restore: { label: "Restored", className: "bg-primary/10 text-primary" },
  delete: { label: "Deleted", className: "bg-status-error-bg text-status-error-text" },
};

const ENTITY_LABELS: Record<string, string> = {
  announcement: "Announcement",
  staff_member: "Staff member",
  campus_life: "Campus Life",
  campus_life_officer: "Campus Life officer",
  campus_life_group: "Campus Life group",
  campus_life_member: "Group member",
  campus_life_group_photo: "Group photo",
  budget_category: "Budget",
  document: "Document",
  gallery_photo: "Gallery",
  contact_message: "Message",
  admin_user: "Admin user",
  site_setting: "Setting",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

export function ActivityLogPage() {
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const { data: entries, isLoading, isError, error, refetch } = useActivityLog();

  const entityTypes = Array.from(new Set(entries?.map((e) => e.entity_type) ?? [])).sort();
  const filtered = entityFilter === "all" ? entries : entries?.filter((e) => e.entity_type === entityFilter);

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Activity Log"
        description="A record of every change made in the admin panel — who did what, and when."
        action={
          entityTypes.length > 0 ? (
            <label className="flex items-center gap-2 text-small text-text-secondary">
              <span>Filter</span>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-small text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="all">All changes</option>
                {entityTypes.map((t) => (
                  <option key={t} value={t}>{ENTITY_LABELS[t] ?? t}</option>
                ))}
              </select>
            </label>
          ) : undefined
        }
      />

      {isLoading && <AdminListSkeleton rows={6} />}
      {isError && <AdminErrorState error={error} onRetry={() => refetch()} />}

      {filtered && filtered.length === 0 && (
        <AdminEmptyState
          icon={History}
          title="No activity yet"
          description="Changes made in the admin panel — publishing announcements, editing staff, updating the budget — will appear here."
        />
      )}

      {filtered && filtered.length > 0 && (
        <AdminCard className="divide-y divide-border p-0">
          {filtered.map((entry) => {
            const style = ACTION_STYLES[entry.action] ?? ACTION_STYLES.update;
            return (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-3 sm:px-5">
                <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${style.className}`}>
                  {style.label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-small text-text-primary">{entry.summary}</p>
                  <p className="mt-0.5 text-[12px] text-text-secondary">
                    {entry.user_email} · {ENTITY_LABELS[entry.entity_type] ?? entry.entity_type}
                  </p>
                </div>
                <time
                  dateTime={entry.created_at}
                  title={new Date(entry.created_at).toLocaleString("en-PH")}
                  className="shrink-0 text-[12px] text-text-secondary"
                >
                  {relativeTime(entry.created_at)}
                </time>
              </div>
            );
          })}
        </AdminCard>
      )}
    </div>
  );
}

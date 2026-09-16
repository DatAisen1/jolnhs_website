import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users, Building2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/errors";
import { InlineNotice } from "@/components/ui/InlineNotice";

/** IMPORTANT: supabase-js does NOT throw on a failed query — a bad
 *  table name, an RLS rejection, a dropped connection, etc. all come
 *  back as `{ data: null, error }` from a resolved promise, not a
 *  rejected one. We throw explicitly so a real failure becomes a real
 *  `isError` state the UI can react to. */
function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [staffResult, sectionsResult] = await Promise.all([
        supabase.from("staff_members").select("*", { count: "exact", head: true }).eq("is_archived", false),
        supabase.from("campus_life_sections").select("slug, updated_at"),
      ]);

      if (staffResult.error) throw staffResult.error;
      if (sectionsResult.error) throw sectionsResult.error;

      const sections = sectionsResult.data;
      const oldestUpdate =
        sections.length > 0
          ? sections.reduce((oldest, s) => (new Date(s.updated_at) < new Date(oldest.updated_at) ? s : oldest))
          : undefined;

      return {
        staffCount: staffResult.count ?? 0,
        sectionCount: sections.length,
        oldestUpdate,
      };
    },
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-lg border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-small text-text-secondary">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold text-text-primary">{value}</p>
      </div>
      <ArrowRight
        size={16}
        aria-hidden="true"
        className="shrink-0 text-text-secondary opacity-0 transition-opacity group-hover:opacity-100"
      />
    </Link>
  );
}

function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-white p-4 shadow-sm" aria-hidden="true">
      <span className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-background" />
      <div className="min-w-0 flex-1 space-y-2">
        <span className="block h-3 w-24 animate-pulse rounded bg-background" />
        <span className="block h-6 w-12 animate-pulse rounded bg-background" />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardStats();

  const staleDays = data?.oldestUpdate
    ? Math.floor((Date.now() - new Date(data.oldestUpdate.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div>
      <h1 className="mb-6 font-heading text-subtitle text-text-primary">Dashboard</h1>

      {isLoading && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3" role="status" aria-label="Loading dashboard">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      )}

      {isError && (
        <InlineNotice
          variant="error"
          title="Couldn't load dashboard stats"
          message={getErrorMessage(error, "Something went wrong talking to the database.")}
          onRetry={() => void refetch()}
          retrying={isFetching}
          className="mb-6"
        />
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={Users} label="Staff members" value={data.staffCount} to="/admin/staff" />
            <StatCard icon={Building2} label="Campus life sections" value={data.sectionCount} to="/admin/campus-life" />
          </div>

          {staleDays > 180 && data.oldestUpdate && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-status-warning bg-status-warning-bg px-4 py-3">
              <p className="text-small text-status-warning-text">
                "{data.oldestUpdate.slug}" hasn't been updated in {staleDays} days.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
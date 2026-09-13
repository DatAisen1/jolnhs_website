import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/errors";
import { InlineNotice } from "@/components/ui/InlineNotice";
/** IMPORTANT: supabase-js does NOT throw on a failed query â€” a bad
 *  table name, an RLS rejection, a dropped connection, etc. all come
 *  back as `{ data: null, error }` from a resolved promise, not a
 *  rejected one. If we don't check `.error` here ourselves, React
 *  Query never sees a failure: `isLoading` just goes false with
 *  `data: { staffCount: 0, ... }`, and the dashboard confidently shows
 *  "0 staff members" as if that were real, rather than "couldn't load
 *  this." We throw explicitly so a real failure becomes a real
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

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardStats();

  const staleDays = data?.oldestUpdate
    ? Math.floor((Date.now() - new Date(data.oldestUpdate.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div>
      <h1 className="mb-6 font-heading text-subtitle text-text-primary">Dashboard</h1>

      {isLoading && (
        <p className="mb-6 text-small text-text-secondary" role="status">
          Loading dashboardâ€¦
        </p>
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
            <div className="rounded-lg border border-border bg-white p-4">
              <p className="text-small text-text-secondary">Staff members</p>
              <p className="mt-1 text-2xl font-semibold text-text-primary">{data.staffCount}</p>
            </div>
            <div className="rounded-lg border border-border bg-white p-4">
              <p className="text-small text-text-secondary">Campus life sections</p>
              <p className="mt-1 text-2xl font-semibold text-text-primary">{data.sectionCount}</p>
            </div>
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

      <div className="flex gap-3">
        <Link to="/admin/campus-life" className="text-small font-medium text-primary hover:text-primary-700">
          Manage Campus Life â†’
        </Link>
      </div>
    </div>
  );
}
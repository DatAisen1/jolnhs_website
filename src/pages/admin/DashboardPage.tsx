import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [{ count: staffCount }, { data: sections }] = await Promise.all([
        supabase.from("staff_members").select("*", { count: "exact", head: true }).eq("is_archived", false),
        supabase.from("campus_life_sections").select("slug, updated_at"),
      ]);

      const oldestUpdate = sections?.reduce(
        (oldest, s) => (new Date(s.updated_at) < new Date(oldest.updated_at) ? s : oldest),
        sections[0]
      );

      return { staffCount: staffCount ?? 0, sectionCount: sections?.length ?? 0, oldestUpdate };
    },
  });
}

export function DashboardPage() {
  const { data, isLoading } = useDashboardStats();

  const staleDays = data?.oldestUpdate
    ? Math.floor((Date.now() - new Date(data.oldestUpdate.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div>
      <h1 className="mb-6 font-heading text-subtitle text-text-primary">Dashboard</h1>

      {!isLoading && data && (
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
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-status-warning-border bg-status-warning-bg px-4 py-3">
              <p className="text-small text-status-warning-text">
                "{data.oldestUpdate.slug}" hasn't been updated in {staleDays} days.
              </p>
            </div>
          )}
        </>
      )}

      <div className="flex gap-3">
        <Link to="/admin/campus-life" className="text-small font-medium text-primary hover:text-primary-700">
          Manage Campus Life →
        </Link>
      </div>
    </div>
  );
}
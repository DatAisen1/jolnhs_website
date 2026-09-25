import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { FiscalYear } from "@/lib/data/budget";

interface UpdatedRecord {
  updatedAt: string | null;
}

export interface DashboardSummary {
  staff: {
    activeCount: number;
    archivedCount: number;
    updatedAt: string | null;
  };
  campusLife: {
    sectionCount: number;
    updatedAt: string | null;
  };
  budget: {
    currentYear: FiscalYear | null;
    categoryCount: number;
    updatedAt: string | null;
  };
  content: Array<{
    key: "staff" | "campus-life" | "budget";
    label: string;
    updatedAt: string | null;
    available: boolean;
  }>;
}

function latestUpdatedAt(records: UpdatedRecord[]): string | null {
  return records.reduce<string | null>((latest, record) => {
    if (!record.updatedAt) return latest;
    if (!latest || new Date(record.updatedAt).getTime() > new Date(latest).getTime()) return record.updatedAt;
    return latest;
  }, null);
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async (): Promise<DashboardSummary> => {
      const [activeStaffResult, archivedStaffResult, sectionsResult, fiscalYearsResult] = await Promise.all([
        supabase.from("staff_members").select("updated_at", { count: "exact" }).eq("is_archived", false),
        supabase.from("staff_members").select("updated_at", { count: "exact" }).eq("is_archived", true),
        supabase.from("campus_life_sections").select("updated_at"),
        supabase.from("budget_fiscal_years").select("*").order("year_label", { ascending: false }),
      ]);

      if (activeStaffResult.error) throw activeStaffResult.error;
      if (archivedStaffResult.error) throw archivedStaffResult.error;
      if (sectionsResult.error) throw sectionsResult.error;
      if (fiscalYearsResult.error) throw fiscalYearsResult.error;

      const sections = sectionsResult.data ?? [];
      const fiscalYears = (fiscalYearsResult.data ?? []) as FiscalYear[];
      const currentYear = fiscalYears.find((year) => year.is_current) ?? null;
      const categoryResult = currentYear
        ? await supabase.from("budget_categories").select("id").eq("fiscal_year_id", currentYear.id)
        : { data: [], error: null };

      if (categoryResult.error) throw categoryResult.error;

      const staffUpdatedAt = latestUpdatedAt([
        ...(activeStaffResult.data ?? []).map((record) => ({ updatedAt: record.updated_at })),
        ...(archivedStaffResult.data ?? []).map((record) => ({ updatedAt: record.updated_at })),
      ]);
      const campusLifeUpdatedAt = latestUpdatedAt(
        sections.map((record) => ({ updatedAt: record.updated_at })),
      );
      const budgetUpdatedAt = latestUpdatedAt([
        ...fiscalYears.map((year) => ({ updatedAt: year.last_updated })),
      ]);

      return {
        staff: {
          activeCount: activeStaffResult.count ?? 0,
          archivedCount: archivedStaffResult.count ?? 0,
          updatedAt: staffUpdatedAt,
        },
        campusLife: {
          sectionCount: sections.length,
          updatedAt: campusLifeUpdatedAt,
        },
        budget: {
          currentYear,
          categoryCount: categoryResult.data?.length ?? 0,
          updatedAt: budgetUpdatedAt,
        },
        content: [
          { key: "staff", label: "Staff & Faculty", updatedAt: staffUpdatedAt, available: true },
          { key: "campus-life", label: "Campus Life", updatedAt: campusLifeUpdatedAt, available: true },
          { key: "budget", label: "Budget", updatedAt: budgetUpdatedAt, available: true },
        ],
      };
    },
  });
}

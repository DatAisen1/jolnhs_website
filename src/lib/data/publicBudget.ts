import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface BudgetFiscalYear {
  id: string;
  year_label: string;
  total_proposed_budget: number;
  hero_heading: string | null;
  hero_description: string | null;
  intro_paragraphs: string[] | null;
  disclaimer: string | null;
  status: string;
  is_current: boolean;
  last_updated: string;
}

export interface BudgetCategory {
  id: string;
  fiscal_year_id: string;
  name: string;
  icon_key: string;
  amount: number;
  /** Derived client-side from amount / sum of category amounts — not a DB column. */
  percentage: number;
  color_class: string;
  description: string | null;
  sort_order: number;
}

export interface BudgetAccomplishment {
  id: string;
  fiscal_year_id: string;
  category_id: string;
  title: string;
  amount: number;
  status: "completed" | "in-progress" | "upcoming";
  period: string | null;
  description: string | null;
  sort_order: number;
}

export interface PublicBudgetData {
  fiscalYear: BudgetFiscalYear;
  categories: BudgetCategory[];
  accomplishments: BudgetAccomplishment[];
}

/**
 * Fetches budget data for the public Budget Transparency page: the
 * current fiscal year (`is_current = true`, the same flag the admin
 * panel's "Set as current" / "Create fiscal year" actions set) with its
 * non-archived categories and its accomplishments.
 *
 * Resolves to `null` when no fiscal year is marked current yet, so the
 * page can show its "not configured" state instead of an error.
 */
export function usePublicBudget() {
  return useQuery({
    queryKey: ["public-budget"],
    queryFn: async (): Promise<PublicBudgetData | null> => {
      const { data: fiscalYear, error: fiscalYearError } = await supabase
        .from("budget_fiscal_years")
        .select("*")
        .eq("is_current", true)
        .maybeSingle();

      if (fiscalYearError) throw fiscalYearError;
      if (!fiscalYear) return null;

      const [categoriesResult, accomplishmentsResult] = await Promise.all([
        supabase
          .from("budget_categories")
          .select("*")
          .eq("fiscal_year_id", fiscalYear.id)
          .eq("is_archived", false)
          .order("sort_order")
          .order("name"),
        supabase
          .from("budget_accomplishments")
          .select("*")
          .eq("fiscal_year_id", fiscalYear.id)
          .order("sort_order"),
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (accomplishmentsResult.error) throw accomplishmentsResult.error;

      const rawCategories = categoriesResult.data ?? [];
      const categoryTotal = rawCategories.reduce((sum, c) => sum + Number(c.amount), 0);
      const categories: BudgetCategory[] = rawCategories.map((c) => ({
        ...c,
        amount: Number(c.amount),
        percentage: categoryTotal > 0 ? Math.round((Number(c.amount) / categoryTotal) * 1000) / 10 : 0,
      }));

      // Accomplishments under an archived category would otherwise point
      // at a category the public page no longer lists.
      const visibleCategoryIds = new Set(categories.map((c) => c.id));
      const accomplishments: BudgetAccomplishment[] = (accomplishmentsResult.data ?? [])
        .filter((a) => visibleCategoryIds.has(a.category_id))
        .map((a) => ({ ...a, amount: Number(a.amount) }));

      return {
        fiscalYear: { ...fiscalYear, total_proposed_budget: Number(fiscalYear.total_proposed_budget) },
        categories,
        accomplishments,
      };
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface BudgetFiscalYear {
  id: string;
  year: string;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetCategory {
  id: string;
  fiscal_year_id: string;
  name: string;
  amount: number;
  percentage: number;
  color_class: string;
  description: string;
  sort_order: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetAccomplishment {
  id: string;
  fiscal_year_id: string;
  category_id: string;
  title: string;
  amount: number;
  status: "completed" | "in-progress" | "upcoming";
  period: string;
  description: string;
  sort_order: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicBudgetData {
  fiscalYear: BudgetFiscalYear;
  categories: BudgetCategory[];
  accomplishments: BudgetAccomplishment[];
}

/**
 * Fetches budget data for the public Budget Transparency page.
 * Returns the active fiscal year with its categories and accomplishments.
 */
export function usePublicBudget() {
  return useQuery({
    queryKey: ["public-budget"],
    queryFn: async (): Promise<PublicBudgetData> => {
      // Get the active fiscal year
      const { data: fiscalYear, error: fiscalYearError } = await supabase
        .from("budget_fiscal_years")
        .select("*")
        .eq("is_active", true)
        .single();
      
      if (fiscalYearError) throw fiscalYearError;
      if (!fiscalYear) {
        throw new Error("No active fiscal year found");
      }

      // Get categories for this fiscal year
      const { data: categories, error: categoriesError } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("fiscal_year_id", fiscalYear.id)
        .eq("is_archived", false)
        .order("sort_order");
      
      if (categoriesError) throw categoriesError;

      // Get accomplishments for this fiscal year
      const { data: accomplishments, error: accomplishmentsError } = await supabase
        .from("budget_accomplishments")
        .select("*")
        .eq("fiscal_year_id", fiscalYear.id)
        .eq("is_archived", false)
        .order("sort_order");
      
      if (accomplishmentsError) throw accomplishmentsError;

      return {
        fiscalYear,
        categories: categories ?? [],
        accomplishments: accomplishments ?? [],
      };
    },
  });
}

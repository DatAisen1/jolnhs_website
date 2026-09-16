import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/** Mirrors `budget_fiscal_years.status`'s check constraint in
 *  supabase/migrations/0001_init.sql — keep these two in sync. */
export type FiscalYearStatus = "draft" | "published" | "archived";

/** Mirrors `budget_accomplishments.status`'s check constraint. */
export type BudgetItemStatus = "completed" | "in-progress" | "upcoming";

export interface FiscalYear {
  id: string;
  year_label: string;
  total_proposed_budget: number;
  hero_heading: string | null;
  hero_description: string | null;
  intro_paragraphs: string[] | null;
  disclaimer: string | null;
  status: FiscalYearStatus;
  is_current: boolean;
  last_updated: string;
}

export interface BudgetCategoryRow {
  id: string;
  fiscal_year_id: string;
  slug: string;
  name: string;
  icon_key: string;
  amount: number;
  color_class: string;
  description: string | null;
  sort_order: number;
}

export interface BudgetAccomplishmentRow {
  id: string;
  fiscal_year_id: string;
  category_id: string;
  title: string;
  amount: number;
  status: BudgetItemStatus;
  period: string | null;
  description: string | null;
  sort_order: number;
}

/** `name` -> a URL/DB-safe slug, unique per fiscal year (matches the
 *  `unique (fiscal_year_id, slug)` constraint on budget_categories).
 *  Not guaranteed collision-free across renames within the same
 *  year — a collision surfaces as a real Postgres unique-violation
 *  error via getErrorMessage() rather than being silently resolved,
 *  per Principle 5 (fix the layer that owns the problem; here, that's
 *  the admin picking a distinct name, not the client guessing a
 *  disambiguated slug on their behalf). */
function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return slug || "category";
}

// ------------------------------------------------------------
// Fiscal years
// ------------------------------------------------------------

/** All fiscal years, most recent label first — the fiscal-year
 *  selector's full list (P1.13). Small, fixed-cardinality table (a
 *  handful of years ever), so no pagination/filtering needed. */
export function useFiscalYears() {
  return useQuery({
    queryKey: ["budget-fiscal-years"],
    queryFn: async (): Promise<FiscalYear[]> => {
      const { data, error } = await supabase
        .from("budget_fiscal_years")
        .select("*")
        .order("year_label", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Direct update of the year-level text/number fields (P1.13).
 *  Deliberately NOT routed through an RPC the way `is_current` is —
 *  this touches exactly one row's plain columns with no cross-row
 *  invariant to protect, unlike the partial-unique-index swap
 *  `useSetCurrentFiscalYear` guards. Same reasoning as
 *  `useSaveStaffMember` skipping an RPC. */
export function useSaveFiscalYearFields() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (year: {
      id: string;
      yearLabel: string;
      totalProposedBudget: number;
      heroHeading: string;
      heroDescription: string;
      introParagraphs: string[];
      disclaimer: string;
    }) => {
      const { error } = await supabase
        .from("budget_fiscal_years")
        .update({
          year_label: year.yearLabel,
          total_proposed_budget: year.totalProposedBudget,
          hero_heading: year.heroHeading,
          hero_description: year.heroDescription,
          intro_paragraphs: year.introParagraphs,
          disclaimer: year.disclaimer,
          last_updated: new Date().toISOString(),
        })
        .eq("id", year.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget-fiscal-years"] }),
  });
}

/** Creates a new fiscal year in `draft` status, never current by
 *  default — an admin explicitly promotes a year via
 *  `useSetCurrentFiscalYear` once it's ready, matching the "past years
 *  can never be accidentally overwritten" architecture goal in
 *  0001_init.sql's comments. */
export function useCreateFiscalYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (yearLabel: string): Promise<FiscalYear> => {
      const { data, error } = await supabase
        .from("budget_fiscal_years")
        .insert({ year_label: yearLabel, total_proposed_budget: 0, status: "draft", is_current: false })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget-fiscal-years"] }),
  });
}

/** Draft <-> published <-> archived is a single column on a single
 *  row — already atomic as a plain update, no RPC needed (unlike
 *  `is_current`, which has a cross-row invariant to protect). */
export function useSetFiscalYearStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: FiscalYearStatus }) => {
      const { error } = await supabase.from("budget_fiscal_years").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget-fiscal-years"] }),
  });
}

/** Routed through the `set_current_fiscal_year` RPC (0006) rather than
 *  a plain client-side update, because switching which year is current
 *  is a two-row change (old current -> false, new -> true) guarded by
 *  a partial unique index — see that migration's comment for why this
 *  needs to be atomic instead of two separate `update()` calls. */
export function useSetCurrentFiscalYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fiscalYearId: string) => {
      const { error } = await supabase.rpc("set_current_fiscal_year", { p_fiscal_year_id: fiscalYearId });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget-fiscal-years"] }),
  });
}

// ------------------------------------------------------------
// Categories
// ------------------------------------------------------------

/** Categories for ONE fiscal year, in display order (P1.14) — scoped
 *  the same way `useStaffMembers` scopes to one category, so switching
 *  the fiscal year selector only loads that year's categories. */
export function useBudgetCategories(fiscalYearId: string | undefined) {
  return useQuery({
    queryKey: ["budget-categories", fiscalYearId],
    queryFn: async (): Promise<BudgetCategoryRow[]> => {
      const { data, error } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("fiscal_year_id", fiscalYearId as string)
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(fiscalYearId),
  });
}

/** Direct upsert per category (same P1.12 reasoning as staff members —
 *  one row, one table, nothing for a multi-table RPC to protect).
 *  RLS itself (0001_init.sql's "Admin write, non-archived years only"
 *  policy) is what actually blocks writes once the fiscal year is
 *  archived; the admin UI's read-only state (P1.16) exists so that
 *  rejection is never the *first* thing an admin discovers. */
export function useSaveBudgetCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: {
      id?: string;
      fiscalYearId: string;
      name: string;
      iconKey: string;
      amount: number;
      colorClass: string;
      description: string;
    }) => {
      const { error } = await supabase.from("budget_categories").upsert({
        id: category.id,
        fiscal_year_id: category.fiscalYearId,
        slug: slugify(category.name),
        name: category.name,
        icon_key: category.iconKey,
        amount: category.amount,
        color_class: category.colorClass,
        description: category.description,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget-categories"] }),
  });
}

/** Hard delete, not archive — unlike staff/officers, `budget_categories`
 *  has no `is_archived` column (0001_init.sql). A category still
 *  referenced by an accomplishment (`category_id ... on delete
 *  restrict`) will fail with a real foreign-key error surfaced via
 *  getErrorMessage(), per Principle 1 — the fix in that case is
 *  deleting/reassigning its accomplishments first, not a silent
 *  cascade the admin never asked for. */
export function useDeleteBudgetCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase.from("budget_categories").delete().eq("id", categoryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-categories"] });
      queryClient.invalidateQueries({ queryKey: ["budget-accomplishments"] });
    },
  });
}

// ------------------------------------------------------------
// Accomplishments (nested per category)
// ------------------------------------------------------------

/** Accomplishments for ONE category, in display order (P1.15). */
export function useBudgetAccomplishments(categoryId: string | undefined) {
  return useQuery({
    queryKey: ["budget-accomplishments", categoryId],
    queryFn: async (): Promise<BudgetAccomplishmentRow[]> => {
      const { data, error } = await supabase
        .from("budget_accomplishments")
        .select("*")
        .eq("category_id", categoryId as string)
        .order("sort_order")
        .order("title");
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(categoryId),
  });
}

export function useSaveBudgetAccomplishment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (accomplishment: {
      id?: string;
      fiscalYearId: string;
      categoryId: string;
      title: string;
      amount: number;
      status: BudgetItemStatus;
      period: string;
      description: string;
    }) => {
      const { error } = await supabase.from("budget_accomplishments").upsert({
        id: accomplishment.id,
        fiscal_year_id: accomplishment.fiscalYearId,
        category_id: accomplishment.categoryId,
        title: accomplishment.title,
        amount: accomplishment.amount,
        status: accomplishment.status,
        period: accomplishment.period,
        description: accomplishment.description,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget-accomplishments"] }),
  });
}

/** Hard delete — same reasoning as `useDeleteBudgetCategory`; no
 *  `is_archived` column exists on this table either. */
export function useDeleteBudgetAccomplishment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (accomplishmentId: string) => {
      const { error } = await supabase.from("budget_accomplishments").delete().eq("id", accomplishmentId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget-accomplishments"] }),
  });
}
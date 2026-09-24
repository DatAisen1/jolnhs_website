import { useState } from "react";
import { Archive, Plus } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminErrorState, AdminListSkeleton } from "@/components/admin/AdminStates";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { AccomplishmentList } from "@/components/admin/AccomplishmentList";
import { useBudgetCategories, useSaveBudgetCategory, useArchiveBudgetCategory, type BudgetCategoryRow } from "@/lib/data/budget";
import { BUDGET_COLOR_OPTIONS, getBudgetColorHex } from "@/lib/data/budgetColors";
import { BUDGET_ICON_OPTIONS, getBudgetIcon } from "@/lib/data/budgetIcons";
import { budgetCategorySchema } from "@/lib/validation/budgetCategorySchema";
import { formatPHP } from "@/lib/currency";
import { getErrorMessage } from "@/lib/errors";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";

function CategoryForm({ fiscalYearId, category, onClose }: { fiscalYearId: string; category?: BudgetCategoryRow; onClose: () => void }) {
  const saveCategory = useSaveBudgetCategory();
  const [name, setName] = useState(category?.name ?? "");
  const [allocation, setAllocation] = useState(category ? String(category.amount) : "");
  const [iconKey, setIconKey] = useState(category?.icon_key ?? BUDGET_ICON_OPTIONS[0].key);
  const [colorClass, setColorClass] = useState(category?.color_class ?? BUDGET_COLOR_OPTIONS[0].value);
  const [description, setDescription] = useState(category?.description ?? "");
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useUnsavedChangesWarning(dirty);

  function close() {
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    onClose();
  }

  async function submit() {
    const result = budgetCategorySchema.safeParse({ name, allocation, iconKey, colorClass, description });
    if (!result.success) { setError(result.error.issues[0]?.message ?? "Fix the category fields before saving."); return; }
    setError(null);
    try {
      await saveCategory.mutateAsync({ id: category?.id, fiscalYearId, name: result.data.name, amount: result.data.allocation, iconKey: result.data.iconKey, colorClass: result.data.colorClass, description: result.data.description });
      onClose();
    } catch { setError("We couldn't save this category. Please try again."); }
  }

  return <AdminCard className="bg-background"><div className="mb-3"><h3 className="text-small font-semibold text-text-primary">{category ? "Edit category" : "Add budget category"}</h3></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-small font-medium text-text-primary">Name *<input value={name} onChange={(event) => { setName(event.target.value); setDirty(true); }} className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-primary" /></label><label className="text-small font-medium text-text-primary">Allocation *<input inputMode="decimal" value={allocation} onChange={(event) => { setAllocation(event.target.value); setDirty(true); }} className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-primary" /></label><label className="text-small font-medium text-text-primary">Icon<select value={iconKey} onChange={(event) => { setIconKey(event.target.value); setDirty(true); }} className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 font-normal"><option value="">Choose an icon</option>{BUDGET_ICON_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}</select></label><label className="text-small font-medium text-text-primary">Color<select value={colorClass} onChange={(event) => { setColorClass(event.target.value); setDirty(true); }} className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 font-normal">{BUDGET_COLOR_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="text-small font-medium text-text-primary sm:col-span-2">Description<textarea value={description} onChange={(event) => { setDescription(event.target.value); setDirty(true); }} rows={2} className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-primary" /></label></div>{error && <p className="mt-3 text-small text-status-error-text">{error}</p>}<div className="mt-4 flex gap-2"><AdminButton type="button" onClick={() => void submit()} loading={saveCategory.isPending}>{category ? "Save changes" : "Add category"}</AdminButton><AdminButton type="button" variant="secondary" onClick={close}>Cancel</AdminButton></div></AdminCard>;
}

export function BudgetCategoryList({ fiscalYearId, totalBudget, readOnly }: { fiscalYearId: string; totalBudget: number; readOnly: boolean }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useBudgetCategories(fiscalYearId, true);
  const archiveCategory = useArchiveBudgetCategory();
  const [formCategory, setFormCategory] = useState<BudgetCategoryRow | null | undefined>(undefined);

  if (isLoading) return <AdminListSkeleton rows={3} />;
  if (isError || !data) return <AdminErrorState error={error} message="We couldn't load budget categories." onRetry={() => void refetch()} retrying={isFetching} />;

  const activeTotal = data.filter((category) => !category.is_archived).reduce((sum, category) => sum + category.amount, 0);
  const exceedsTotal = activeTotal > totalBudget;

  return <section className="space-y-4" aria-labelledby="budget-categories-heading"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="budget-categories-heading" className="text-small font-semibold text-text-primary">Budget categories</h2><p className="mt-1 text-small text-text-secondary">Active allocation: {formatPHP(activeTotal)} of {formatPHP(totalBudget)}.</p></div>{!readOnly && <AdminButton type="button" onClick={() => setFormCategory(null)}><Plus size={15} aria-hidden="true" />Add Category</AdminButton>}</div>{exceedsTotal && <p className="rounded-md border border-status-warning bg-status-warning-bg px-3 py-2 text-small text-status-warning-text">Allocations exceed the total budget. This is a warning only; review before publishing.</p>}{data.length === 0 && <AdminEmptyState title="No budget categories yet" description="Add a category to begin building this fiscal year's public budget." action={!readOnly ? <AdminButton type="button" onClick={() => setFormCategory(null)}><Plus size={15} aria-hidden="true" />Add Category</AdminButton> : undefined} />}{data.map((category) => { const Icon = getBudgetIcon(category.icon_key); const archived = Boolean(category.is_archived); return <AdminCard key={category.id} className={archived ? "opacity-75" : ""}><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: getBudgetColorHex(category.color_class) }}><Icon size={20} className="text-white" aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium text-text-primary">{category.name}</h3><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${archived ? "bg-background text-text-secondary" : "bg-status-success-bg text-status-success-text"}`}>{archived ? "Inactive" : "Active"}</span></div><p className="mt-1 break-words text-small text-text-secondary">{formatPHP(category.amount)}</p></div>{!readOnly && !archived && <div className="flex shrink-0 gap-2"><AdminButton type="button" variant="secondary" onClick={() => setFormCategory(category)}>Edit</AdminButton><AdminButton type="button" variant="danger" onClick={() => { if (window.confirm(`Archive ${category.name}? This will remove this category from the public website. Its record will be preserved.`)) archiveCategory.mutate(category.id); }}><Archive size={15} aria-hidden="true" />Archive</AdminButton></div>}</div>{formCategory?.id === category.id && <div className="mt-4"><CategoryForm fiscalYearId={fiscalYearId} category={category} onClose={() => setFormCategory(undefined)} /></div>}<div className="mt-4 border-t border-border pt-4"><AccomplishmentList fiscalYearId={fiscalYearId} categoryId={category.id} readOnly={readOnly || archived} /></div></AdminCard>; })}{formCategory === null && <CategoryForm fiscalYearId={fiscalYearId} onClose={() => setFormCategory(undefined)} />}{archiveCategory.isError && <InlineNotice variant="error" message={getErrorMessage(archiveCategory.error, "Couldn't archive this category.")} />}</section>;
}

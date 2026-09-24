import { useBudgetCategories } from "@/lib/data/budget";
import { formatPHP } from "@/lib/currency";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminErrorState, AdminListSkeleton } from "@/components/admin/AdminStates";

export function BudgetOverviewCards({ fiscalYearId, totalBudget }: { fiscalYearId: string; totalBudget: number }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useBudgetCategories(fiscalYearId);

  if (isLoading) return <AdminListSkeleton rows={1} />;
  if (isError || !data) return <AdminErrorState error={error} message="We couldn't load the budget overview." onRetry={() => void refetch()} retrying={isFetching} />;

  const allocated = data.reduce((sum, category) => sum + category.amount, 0);
  const remaining = totalBudget - allocated;

  return (
    <section aria-labelledby="budget-overview-heading" className="space-y-3">
      <div>
        <h2 id="budget-overview-heading" className="text-small font-semibold text-text-primary">Budget overview</h2>
        <p className="mt-1 text-small text-text-secondary">Computed from active category allocations.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminCard><p className="text-small text-text-secondary">Total Budget</p><p className="mt-2 break-words text-xl font-semibold text-text-primary">{formatPHP(totalBudget)}</p></AdminCard>
        <AdminCard><p className="text-small text-text-secondary">Allocated</p><p className="mt-2 break-words text-xl font-semibold text-text-primary">{formatPHP(allocated)}</p></AdminCard>
        <AdminCard><p className="text-small text-text-secondary">Remaining</p><p className={`mt-2 break-words text-xl font-semibold ${remaining < 0 ? "text-status-warning-text" : "text-text-primary"}`}>{formatPHP(remaining)}</p></AdminCard>
      </div>
      {remaining < 0 && <p className="rounded-md border border-status-warning bg-status-warning-bg px-3 py-2 text-small text-status-warning-text">Category allocations exceed the total budget. Review the allocations before publishing.</p>}
    </section>
  );
}

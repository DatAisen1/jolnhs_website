import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  useCreateFiscalYear,
  useFiscalYears,
  useSaveFiscalYearFields,
  useSetCurrentFiscalYear,
  useSetFiscalYearStatus,
  type FiscalYear,
  type FiscalYearStatus,
} from "@/lib/data/budget";
import { getErrorMessage } from "@/lib/errors";
import { isFiscalYearReadOnly } from "@/lib/access/fiscalYear";
import { amountSchema, yearLabelSchema } from "@/lib/validation/budget";
import { BudgetCategoryList } from "@/components/admin/BudgetCategoryList";
import { BudgetOverviewCards } from "@/components/admin/BudgetOverviewCards";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminErrorState, AdminListSkeleton } from "@/components/admin/AdminStates";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { useFiscalYear } from "@/hooks/useFiscalYear";

const STATUS_BADGE: Record<FiscalYearStatus, { label: string; variant: "success" | "warning" | "info" }> = {
  draft: { label: "Draft", variant: "info" },
  published: { label: "Published", variant: "success" },
  active: { label: "Active", variant: "success" },
  archived: { label: "Archived", variant: "warning" },
};

const STATUS_ORDER: FiscalYearStatus[] = ["draft", "published", "active", "archived"];


/**
 * Year-level fields form + categories/accomplishments for ONE fiscal
 * year (P1.13). Split out from BudgetManagePage the same way
 * CampusLifeManagePage's SectionEditor is split from the page shell —
 * so switching fiscal years (via `key={fiscalYear.id}` below) always
 * starts from a clean, freshly-synced form instead of carrying over
 * the previous year's in-progress edits.
 */
function FiscalYearEditor({
  fiscalYear,
  onDirtyChange,
}: {
  fiscalYear: FiscalYear;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const saveFields = useSaveFiscalYearFields();
  const setStatus = useSetFiscalYearStatus();
  const setCurrent = useSetCurrentFiscalYear();

  const [yearLabel, setYearLabel] = useState(fiscalYear.year_label);
  const [totalBudget, setTotalBudget] = useState(String(fiscalYear.total_proposed_budget));
  const [heroHeading, setHeroHeading] = useState(fiscalYear.hero_heading ?? "");
  const [heroDescription, setHeroDescription] = useState(fiscalYear.hero_description ?? "");
  const [introParagraphs, setIntroParagraphs] = useState((fiscalYear.intro_paragraphs ?? []).join("\n\n"));
  const [disclaimer, setDisclaimer] = useState(fiscalYear.disclaimer ?? "");
  const [isDirty, setIsDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Published non-current years are read-only in the UI. The current RLS
  // policy only blocks writes for status = 'archived'; a DB policy is still
  // needed to enforce this broader fiscal-year immutability rule server-side.
  const isArchived = isFiscalYearReadOnly(fiscalYear.status) || (!fiscalYear.is_current && fiscalYear.status === "published");
  const childDataReadOnly = fiscalYear.status !== "active";

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 4000);
    return () => clearTimeout(timer);
  }, [justSaved]);

  useEffect(() => {
    if (isDirty) setJustSaved(false);
  }, [isDirty]);

  useUnsavedChangesWarning(isDirty);

  function markDirty() {
    if (isArchived) return; // read-only — nothing to mark dirty
    setIsDirty(true);
  }

  function handleSave() {
    const labelResult = yearLabelSchema.safeParse(yearLabel);
    const amountResult = amountSchema.safeParse(totalBudget.trim());

    if (!labelResult.success || !amountResult.success) {
      setFieldErrors({
        ...(labelResult.success ? {} : { yearLabel: labelResult.error.issues[0]?.message ?? "Required" }),
        ...(amountResult.success ? {} : { totalBudget: amountResult.error.issues[0]?.message ?? "Enter a valid amount" }),
      });
      return;
    }

    setFieldErrors({});

    saveFields.mutate(
      {
        id: fiscalYear.id,
        yearLabel: labelResult.data,
        totalProposedBudget: Number(totalBudget.trim()),
        heroHeading,
        heroDescription,
        introParagraphs: introParagraphs
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean),
        disclaimer,
      },
      {
        onSuccess: () => {
          setIsDirty(false);
          setJustSaved(true);
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-small text-text-secondary">
          Last updated {new Date(fiscalYear.last_updated).toLocaleDateString()}
        </p>
        <div className="flex items-center gap-2">
          <FiscalYearBadge fiscalYear={fiscalYear} />
          {fiscalYear.is_current && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
              Current year
            </span>
          )}
        </div>
      </div>

      {isArchived && (
        <InlineNotice
          variant="warning"
          title="This fiscal year is read-only"
            message="Past fiscal years are read-only. Create or switch to the active year to make changes."
        />
      )}

      <section className="space-y-3">
        <h2 className="text-small font-semibold text-text-primary">Fiscal year details</h2>
        <div>
          <label htmlFor="fy-label" className="mb-1 block text-small font-medium text-text-secondary">
            Year label
          </label>
          <input
            id="fy-label"
            value={yearLabel}
            disabled={isArchived}
            onChange={(e) => {
              setYearLabel(e.target.value);
              markDirty();
            }}
            placeholder="e.g. SY 2026-2027"
            aria-invalid={Boolean(fieldErrors.yearLabel)}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-background disabled:text-text-secondary"
          />
          {fieldErrors.yearLabel && <p className="mt-1 text-small text-status-error-text">{fieldErrors.yearLabel}</p>}
        </div>
        <div>
          <label htmlFor="fy-total" className="mb-1 block text-small font-medium text-text-secondary">
            Total proposed budget (₱)
          </label>
          <input
            id="fy-total"
            value={totalBudget}
            disabled={isArchived}
            inputMode="decimal"
            onChange={(e) => {
              setTotalBudget(e.target.value);
              markDirty();
            }}
            placeholder="0"
            aria-invalid={Boolean(fieldErrors.totalBudget)}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-background disabled:text-text-secondary"
          />
          {fieldErrors.totalBudget && (
            <p className="mt-1 text-small text-status-error-text">{fieldErrors.totalBudget}</p>
          )}
        </div>
        <div>
          <label htmlFor="fy-hero-heading" className="mb-1 block text-small font-medium text-text-secondary">
            Hero heading
          </label>
          <input
            id="fy-hero-heading"
            value={heroHeading}
            disabled={isArchived}
            onChange={(e) => {
              setHeroHeading(e.target.value);
              markDirty();
            }}
            placeholder="Budget Transparency"
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-background disabled:text-text-secondary"
          />
        </div>
        <div>
          <label htmlFor="fy-hero-description" className="mb-1 block text-small font-medium text-text-secondary">
            Hero description
          </label>
          <textarea
            id="fy-hero-description"
            value={heroDescription}
            disabled={isArchived}
            onChange={(e) => {
              setHeroDescription(e.target.value);
              markDirty();
            }}
            rows={2}
            placeholder="A clear, public look at how the school proposes and spends its budget…"
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-background disabled:text-text-secondary"
          />
        </div>
        <div>
          <label htmlFor="fy-intro" className="mb-1 block text-small font-medium text-text-secondary">
            Intro paragraphs (separate paragraphs with a blank line)
          </label>
          <textarea
            id="fy-intro"
            value={introParagraphs}
            disabled={isArchived}
            onChange={(e) => {
              setIntroParagraphs(e.target.value);
              markDirty();
            }}
            rows={4}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-background disabled:text-text-secondary"
          />
        </div>
        <div>
          <label htmlFor="fy-disclaimer" className="mb-1 block text-small font-medium text-text-secondary">
            Disclaimer
          </label>
          <textarea
            id="fy-disclaimer"
            value={disclaimer}
            disabled={isArchived}
            onChange={(e) => {
              setDisclaimer(e.target.value);
              markDirty();
            }}
            rows={2}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-background disabled:text-text-secondary"
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        {!isArchived && (
          <>
            <AdminButton onClick={handleSave} loading={saveFields.isPending}>
              {saveFields.isPending ? "Saving…" : "Save changes"}
            </AdminButton>

            {!fiscalYear.is_current && (
              <button
                type="button"
                onClick={() => setCurrent.mutate(fiscalYear.id)}
                disabled={setCurrent.isPending}
                className="rounded-md border border-border px-3 py-2 text-small font-medium text-text-secondary hover:bg-background disabled:opacity-50"
              >
                {setCurrent.isPending ? "Setting…" : "Set as current year"}
              </button>
            )}
          </>
        )}

        {/* Status itself is NOT locked by the archived-year rule below —
            that rule (0001_init.sql's RLS policy) only ever applied to
            budget_categories/budget_accomplishments, never to
            budget_fiscal_years. Keeping this control live even while
            archived is the deliberate escape hatch: an admin who
            archives a year by mistake can always change it back
            without needing direct database access. */}
        {!isArchived && (
          <>
            <label htmlFor="fy-status" className="sr-only">Status</label>
            <select
              id="fy-status"
              value={fiscalYear.status}
              onChange={(e) => setStatus.mutate({ id: fiscalYear.id, status: e.target.value as FiscalYearStatus })}
              disabled={setStatus.isPending}
              className="rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {STATUS_ORDER.map((status) => <option key={status} value={status}>{STATUS_BADGE[status].label}</option>)}
            </select>
          </>
        )}

        {justSaved && !saveFields.isError && <InlineNotice variant="success" message="Saved." />}
      </div>

      {saveFields.isError && (
        <InlineNotice variant="error" message={getErrorMessage(saveFields.error, "Couldn't save this fiscal year.")} />
      )}
      {setCurrent.isError && (
        <InlineNotice
          variant="error"
          message={getErrorMessage(setCurrent.error, "Couldn't set this as the current year.")}
        />
      )}
      {setStatus.isError && (
        <InlineNotice variant="error" message={getErrorMessage(setStatus.error, "Couldn't update the status.")} />
      )}

      <section>
        <h2 className="mb-2 text-small font-semibold text-text-primary">Budget categories</h2>
        <BudgetOverviewCards fiscalYearId={fiscalYear.id} totalBudget={fiscalYear.total_proposed_budget} />
        <BudgetCategoryList fiscalYearId={fiscalYear.id} totalBudget={fiscalYear.total_proposed_budget} readOnly={childDataReadOnly} />
      </section>
    </div>
  );
}

export function BudgetManagePage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useFiscalYears();
  const createYear = useCreateFiscalYear();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [newYearLabel, setNewYearLabel] = useState("");
  const [newYearError, setNewYearError] = useState("");
  const [showNewYearForm, setShowNewYearForm] = useState(false);
  const selectedYearQuery = useFiscalYear(selectedId);

  // Default to the current year (or the first one) once the list loads,
  // without clobbering a selection the admin already made.
  useEffect(() => {
    if (selectedId || !data || data.length === 0) return;
    const current = data.find((y) => y.is_current);
    setSelectedId((current ?? data[0]).id);
  }, [data, selectedId]);

  if (isLoading) return <AdminListSkeleton rows={3} />;

  if (isError || !data) {
    return (
      <AdminErrorState
        error={error}
        message="We couldn't load the fiscal years."
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  const selectedYear = selectedYearQuery.data ?? (selectedId ? data.find((year) => year.id === selectedId) ?? null : null);

  function handleSelectYear(nextId: string) {
    if (nextId === selectedId) return;
    if (isDirty && !window.confirm("You have unsaved changes. Switch fiscal years and discard them?")) {
      return;
    }
    setIsDirty(false);
    setSelectedId(nextId);
  }

  function handleCreateYear() {
    const result = yearLabelSchema.safeParse(newYearLabel);
    if (!result.success) {
      setNewYearError(result.error.issues[0]?.message ?? "Fiscal year label is required");
      return;
    }
    setNewYearError("");
    createYear.mutate(result.data, {
      onSuccess: (year) => {
        setNewYearLabel("");
        setShowNewYearForm(false);
        setSelectedId(year.id);
      },
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="Budget"
        description="Manage fiscal years, budget categories, and public accomplishment records."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label htmlFor="fiscal-year-select" className="text-small font-medium text-text-secondary">
          Fiscal year
        </label>
        <select
          id="fiscal-year-select"
          value={selectedId ?? ""}
          onChange={(e) => handleSelectYear(e.target.value)}
          className="rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {data.length === 0 && <option value="">No fiscal years yet</option>}
          {data.map((year) => (
            <option key={year.id} value={year.id}>
              {year.year_label}
              {year.is_current ? " (current)" : ""} — {STATUS_BADGE[year.status].label}
            </option>
          ))}
        </select>

        {!showNewYearForm ? (
          <button
            type="button"
            onClick={() => setShowNewYearForm(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-small font-medium text-text-secondary hover:bg-background"
          >
            <Plus size={14} /> New fiscal year
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <label htmlFor="new-fy-label" className="sr-only">
              New fiscal year label
            </label>
            <input
              id="new-fy-label"
              value={newYearLabel}
              onChange={(e) => {
                setNewYearLabel(e.target.value);
                setNewYearError("");
              }}
              placeholder="e.g. SY 2027-2028"
              className="w-44 rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {newYearError && <p className="basis-full text-small text-status-error-text">{newYearError}</p>}
            <AdminButton
              type="button"
              onClick={handleCreateYear}
              loading={createYear.isPending}
              disabled={!newYearLabel.trim()}
            >
              {createYear.isPending ? "Creating…" : "Create"}
            </AdminButton>
            <button
              type="button"
              onClick={() => {
                setShowNewYearForm(false);
                setNewYearLabel("");
              }}
              className="text-small text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {createYear.isError && (
        <InlineNotice
          variant="error"
          message={getErrorMessage(createYear.error, "Couldn't create this fiscal year.")}
          className="mb-4"
        />
      )}

      {selectedYear ? (
        <FiscalYearEditor key={selectedYear.id} fiscalYear={selectedYear} onDirtyChange={setIsDirty} />
      ) : (
        <AdminEmptyState
          title="No fiscal years yet"
          description="Create a fiscal year to start building the public Budget page."
          action={<AdminButton type="button" onClick={() => setShowNewYearForm(true)}><Plus size={15} aria-hidden="true" />New Fiscal Year</AdminButton>}
        />
      )}
    </div>
  );
}

function FiscalYearBadge({ fiscalYear }: { fiscalYear: FiscalYear }) {
  const readOnly = fiscalYear.status !== "active";
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${readOnly ? "bg-status-warning-bg text-status-warning-text" : "bg-status-success-bg text-status-success-text"}`}>
      {readOnly ? "● Archived · Read-only" : "● Active"}
    </span>
  );
}
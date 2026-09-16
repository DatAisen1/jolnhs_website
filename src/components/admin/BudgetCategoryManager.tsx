import { useState } from "react";
import { Plus } from "lucide-react";
import { ListItemCard } from "@/pages/admin/ListItemCard";
import {
  useBudgetAccomplishments,
  useBudgetCategories,
  useDeleteBudgetAccomplishment,
  useDeleteBudgetCategory,
  useSaveBudgetAccomplishment,
  useSaveBudgetCategory,
  type BudgetAccomplishmentRow,
  type BudgetCategoryRow,
  type BudgetItemStatus,
} from "@/lib/data/budget";
import { getErrorMessage } from "@/lib/errors";
import { formatPHP } from "@/lib/currency";
import { getBudgetIcon, BUDGET_ICON_OPTIONS } from "@/lib/data/budgetIcons";
import { BUDGET_COLOR_OPTIONS, getBudgetColorHex } from "@/lib/data/budgetColors";
import {
  accomplishmentTitleSchema,
  accomplishmentStatusSchema,
  amountSchema,
  categoryNameSchema,
} from "@/lib/validation/budget";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { Button } from "@/components/ui/Button";

const STATUS_OPTIONS: ReadonlyArray<{ value: BudgetItemStatus; label: string }> = [
  { value: "completed", label: "Completed" },
  { value: "in-progress", label: "In progress" },
  { value: "upcoming", label: "Upcoming" },
];

const STATUS_BADGE_VARIANT: Record<BudgetItemStatus, "success" | "warning" | "info"> = {
  completed: "success",
  "in-progress": "warning",
  upcoming: "info",
};

function AccomplishmentList({
  fiscalYearId,
  categoryId,
  readOnly,
}: {
  fiscalYearId: string;
  categoryId: string;
  readOnly: boolean;
}) {
  const { data, isLoading, isError, error, refetch, isFetching } = useBudgetAccomplishments(categoryId);
  const saveAccomplishment = useSaveBudgetAccomplishment();
  const deleteAccomplishment = useDeleteBudgetAccomplishment();

  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newPeriod, setNewPeriod] = useState("");
  const [newTitleError, setNewTitleError] = useState("");
  const [newAmountError, setNewAmountError] = useState("");

  if (isLoading) return <p className="text-small text-text-secondary">Loading accomplishments…</p>;

  if (isError || !data) {
    return (
      <InlineNotice
        variant="error"
        title="Couldn't load accomplishments"
        message={getErrorMessage(error, "Something went wrong talking to the database.")}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  function validateTitle(value: string) {
    const result = accomplishmentTitleSchema.safeParse(value);
    return result.success ? "" : result.error.issues[0]?.message ?? "Title is required";
  }

  function validateAmount(value: string) {
    const result = amountSchema.safeParse(value);
    return result.success ? "" : result.error.issues[0]?.message ?? "Enter a valid amount";
  }

  async function handleSaveAccomplishment(values: Record<string, string>) {
    const title = values.title?.trim() ?? "";
    const amountInput = values.amount?.trim() ?? "";
    const statusResult = accomplishmentStatusSchema.safeParse(values.status);
    const fieldErrors: Record<string, string> = {};

    const titleError = validateTitle(title);
    if (titleError) fieldErrors.title = titleError;

    const amountError = validateAmount(amountInput);
    if (amountError) fieldErrors.amount = amountError;

    if (!statusResult.success) fieldErrors.status = "Choose a status";

    if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

    saveAccomplishment.mutate({
      id: values.id,
      fiscalYearId,
      categoryId,
      title,
      amount: Number(amountInput),
      status: statusResult.data as BudgetItemStatus,
      period: values.period?.trim() ?? "",
      description: values.description?.trim() ?? "",
    });

    return {};
  }

  function handleAddAccomplishment() {
    const trimmedTitle = newTitle.trim();
    const titleError = validateTitle(trimmedTitle);
    const amountError = validateAmount(newAmount.trim());

    setNewTitleError(titleError);
    setNewAmountError(amountError);
    if (titleError || amountError) return;

    saveAccomplishment.mutate(
      {
        fiscalYearId,
        categoryId,
        title: trimmedTitle,
        amount: Number(newAmount.trim()),
        status: "upcoming",
        period: newPeriod.trim(),
        description: "",
      },
      {
        onSuccess: () => {
          setNewTitle("");
          setNewAmount("");
          setNewPeriod("");
        },
      }
    );
  }

  return (
    <div className="space-y-3">
      {data.length === 0 && (
        <p className="text-small text-text-secondary">No accomplishments logged for this category yet.</p>
      )}

      <div className="space-y-2">
        {data.map((accomplishment: BudgetAccomplishmentRow) => (
          <ListItemCard
            key={accomplishment.id}
            title={accomplishment.title}
            subtitle={`${formatPHP(accomplishment.amount)}${accomplishment.period ? ` · ${accomplishment.period}` : ""}`}
            badge={{
              label: STATUS_OPTIONS.find((s) => s.value === accomplishment.status)?.label ?? accomplishment.status,
              variant: STATUS_BADGE_VARIANT[accomplishment.status],
            }}
            leadingVisual={{ kind: "swatch", color: "#E1E7F0" }}
            fields={[
              { key: "id", label: "Accomplishment ID", placeholder: "", initialValue: accomplishment.id },
              { key: "title", label: "Title", placeholder: "Project title", initialValue: accomplishment.title },
              {
                key: "amount",
                label: "Amount",
                placeholder: "0",
                initialValue: String(accomplishment.amount),
              },
              {
                key: "status",
                label: "Status",
                type: "select",
                initialValue: accomplishment.status,
                options: STATUS_OPTIONS,
              },
              { key: "period", label: "Period", placeholder: "e.g. March 2026", initialValue: accomplishment.period ?? "" },
              {
                key: "description",
                label: "Description",
                placeholder: "Description",
                type: "textarea",
                initialValue: accomplishment.description ?? "",
              },
            ]}
            onSave={handleSaveAccomplishment}
            onDelete={() => deleteAccomplishment.mutate(accomplishment.id)}
            deleteLabel={`Delete ${accomplishment.title}`}
            editLabel={`Edit ${accomplishment.title}`}
            deleteConfirmMessage={`Delete ${accomplishment.title}? This can't be undone.`}
            deleteDisabled={readOnly}
            editDisabled={readOnly}
          />
        ))}
      </div>

      {deleteAccomplishment.isError && (
        <InlineNotice
          variant="error"
          message={getErrorMessage(deleteAccomplishment.error, "Couldn't delete this accomplishment.")}
        />
      )}

      {!readOnly && (
        <div className="rounded-lg border border-dashed border-border bg-white p-3">
          <div className="space-y-2">
            <div>
              <label htmlFor={`new-accomplishment-title-${categoryId}`} className="sr-only">
                Accomplishment title
              </label>
              <input
                id={`new-accomplishment-title-${categoryId}`}
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (newTitleError) setNewTitleError("");
                }}
                placeholder="Accomplishment title"
                aria-invalid={Boolean(newTitleError)}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {newTitleError && <p className="mt-1 text-small text-status-error-text">{newTitleError}</p>}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor={`new-accomplishment-amount-${categoryId}`} className="sr-only">
                  Amount
                </label>
                <input
                  id={`new-accomplishment-amount-${categoryId}`}
                  value={newAmount}
                  onChange={(e) => {
                    setNewAmount(e.target.value);
                    if (newAmountError) setNewAmountError("");
                  }}
                  placeholder="Amount"
                  inputMode="decimal"
                  aria-invalid={Boolean(newAmountError)}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {newAmountError && <p className="mt-1 text-small text-status-error-text">{newAmountError}</p>}
              </div>
              <div className="flex-1">
                <label htmlFor={`new-accomplishment-period-${categoryId}`} className="sr-only">
                  Period
                </label>
                <input
                  id={`new-accomplishment-period-${categoryId}`}
                  value={newPeriod}
                  onChange={(e) => setNewPeriod(e.target.value)}
                  placeholder="Period (optional)"
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={handleAddAccomplishment}
                disabled={saveAccomplishment.isPending}
                className="px-3 py-1.5 text-small"
              >
                {saveAccomplishment.isPending ? "Saving…" : "Add accomplishment"}
              </Button>
              {saveAccomplishment.isError && (
                <InlineNotice
                  variant="error"
                  message={getErrorMessage(saveAccomplishment.error, "Couldn't save this accomplishment.")}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface BudgetCategoryManagerProps {
  fiscalYearId: string;
  /** Disables all add/edit/delete controls for categories AND their
   *  nested accomplishments (P1.16 — the archived-year read-only state). */
  readOnly: boolean;
}

/**
 * Category cards (P1.14) with each category's accomplishments nested
 * directly beneath it (P1.15) — mirrors OfficerManager/StaffMemberManager's
 * "list of ListItemCards + an Add form" shape, but one level deeper: each
 * category card is followed by its own AccomplishmentList instead of the
 * list ending there.
 */
export function BudgetCategoryManager({ fiscalYearId, readOnly }: BudgetCategoryManagerProps) {
  const { data, isLoading, isError, error, refetch, isFetching } = useBudgetCategories(fiscalYearId);
  const saveCategory = useSaveBudgetCategory();
  const deleteCategory = useDeleteBudgetCategory();

  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newIconKey, setNewIconKey] = useState(BUDGET_ICON_OPTIONS[0].key);
  const [newColorClass, setNewColorClass] = useState(BUDGET_COLOR_OPTIONS[0].value);
  const [newNameError, setNewNameError] = useState("");
  const [newAmountError, setNewAmountError] = useState("");

  if (isLoading) return <p className="text-small text-text-secondary">Loading categories…</p>;

  if (isError || !data) {
    return (
      <InlineNotice
        variant="error"
        title="Couldn't load budget categories"
        message={getErrorMessage(error, "Something went wrong talking to the database.")}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  function validateName(value: string) {
    const result = categoryNameSchema.safeParse(value);
    return result.success ? "" : result.error.issues[0]?.message ?? "Name is required";
  }

  function validateAmount(value: string) {
    const result = amountSchema.safeParse(value);
    return result.success ? "" : result.error.issues[0]?.message ?? "Enter a valid amount";
  }

  async function handleSaveCategory(category: BudgetCategoryRow, values: Record<string, string>) {
    const name = values.name?.trim() ?? "";
    const amountInput = values.amount?.trim() ?? "";
    const fieldErrors: Record<string, string> = {};

    const nameError = validateName(name);
    if (nameError) fieldErrors.name = nameError;

    const amountError = validateAmount(amountInput);
    if (amountError) fieldErrors.amount = amountError;

    if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

    saveCategory.mutate({
      id: category.id,
      fiscalYearId,
      name,
      iconKey: values.icon_key ?? category.icon_key,
      amount: Number(amountInput),
      colorClass: values.color_class ?? category.color_class,
      description: values.description?.trim() ?? "",
    });

    return {};
  }

  function handleAddCategory() {
    const trimmedName = newName.trim();
    const nameError = validateName(trimmedName);
    const amountError = validateAmount(newAmount.trim());

    setNewNameError(nameError);
    setNewAmountError(amountError);
    if (nameError || amountError) return;

    saveCategory.mutate(
      {
        fiscalYearId,
        name: trimmedName,
        iconKey: newIconKey,
        amount: Number(newAmount.trim()),
        colorClass: newColorClass,
        description: "",
      },
      {
        onSuccess: () => {
          setNewName("");
          setNewAmount("");
        },
      }
    );
  }

  return (
    <div className="space-y-4">
      {data.length === 0 && (
        <p className="text-small text-text-secondary">No budget categories yet — add the first one below.</p>
      )}

      <div className="space-y-4">
        {data.map((category) => (
          <div key={category.id} className="rounded-lg border border-border bg-white p-3">
            <ListItemCard
              title={category.name}
              subtitle={formatPHP(category.amount)}
              leadingVisual={{
                kind: "swatch",
                color: getBudgetColorHex(category.color_class),
                icon: getBudgetIcon(category.icon_key),
                iconLabel: `${category.name} icon`,
              }}
              fields={[
                { key: "id", label: "Category ID", placeholder: "", initialValue: category.id },
                { key: "name", label: "Name", placeholder: "Category name", initialValue: category.name },
                { key: "amount", label: "Amount", placeholder: "0", initialValue: String(category.amount) },
                {
                  key: "icon_key",
                  label: "Icon",
                  type: "select",
                  initialValue: category.icon_key,
                  options: BUDGET_ICON_OPTIONS.map((o) => ({ value: o.key, label: o.label })),
                },
                {
                  key: "color_class",
                  label: "Color",
                  type: "select",
                  initialValue: category.color_class,
                  options: BUDGET_COLOR_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
                },
                {
                  key: "description",
                  label: "Description",
                  placeholder: "Description",
                  type: "textarea",
                  initialValue: category.description ?? "",
                },
              ]}
              onSave={(values) => handleSaveCategory(category, values)}
              onDelete={() => deleteCategory.mutate(category.id)}
              deleteLabel={`Delete ${category.name}`}
              editLabel={`Edit ${category.name}`}
              deleteConfirmMessage={`Delete ${category.name}? Any accomplishments still linked to it must be removed first, and this can't be undone.`}
              deleteDisabled={readOnly}
              editDisabled={readOnly}
            />

            <div className="mt-3 border-l-2 border-border pl-4">
              <h4 className="mb-2 text-small font-semibold text-text-primary">Accomplishments</h4>
              <AccomplishmentList fiscalYearId={fiscalYearId} categoryId={category.id} readOnly={readOnly} />
            </div>
          </div>
        ))}
      </div>

      {deleteCategory.isError && (
        <InlineNotice
          variant="error"
          message={getErrorMessage(deleteCategory.error, "Couldn't delete this category.")}
        />
      )}

      {!readOnly && (
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Plus size={16} />
            </span>
            <h3 className="text-small font-semibold text-text-primary">Add budget category</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="new-category-name" className="sr-only">
                Category name
              </label>
              <input
                id="new-category-name"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (newNameError) setNewNameError("");
                }}
                placeholder="Category name"
                aria-invalid={Boolean(newNameError)}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {newNameError && <p className="mt-1 text-small text-status-error-text">{newNameError}</p>}
            </div>
            <div>
              <label htmlFor="new-category-amount" className="sr-only">
                Amount
              </label>
              <input
                id="new-category-amount"
                value={newAmount}
                onChange={(e) => {
                  setNewAmount(e.target.value);
                  if (newAmountError) setNewAmountError("");
                }}
                placeholder="Amount"
                inputMode="decimal"
                aria-invalid={Boolean(newAmountError)}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {newAmountError && <p className="mt-1 text-small text-status-error-text">{newAmountError}</p>}
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="new-category-icon" className="sr-only">
                  Icon
                </label>
                <select
                  id="new-category-icon"
                  value={newIconKey}
                  onChange={(e) => setNewIconKey(e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {BUDGET_ICON_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="new-category-color" className="sr-only">
                  Color
                </label>
                <select
                  id="new-category-color"
                  value={newColorClass}
                  onChange={(e) => setNewColorClass(e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {BUDGET_COLOR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={handleAddCategory}
                disabled={saveCategory.isPending}
                className="px-4 py-2 text-small"
              >
                {saveCategory.isPending ? "Saving…" : "Add category"}
              </Button>
              {saveCategory.isError && (
                <InlineNotice
                  variant="error"
                  message={getErrorMessage(saveCategory.error, "Couldn't save this category.")}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from "react";
import { Plus } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminErrorState, AdminListSkeleton } from "@/components/admin/AdminStates";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { ListItemCard } from "@/pages/admin/ListItemCard";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import {
  useBudgetAccomplishments,
  useDeleteBudgetAccomplishment,
  useSaveBudgetAccomplishment,
  type BudgetItemStatus,
} from "@/lib/data/budget";
import { formatPHP } from "@/lib/currency";
import { accomplishmentSchema } from "@/lib/validation/accomplishmentSchema";
import { getErrorMessage } from "@/lib/errors";
import { supabase } from "@/lib/supabase";

const STATUS_OPTIONS: ReadonlyArray<{ value: BudgetItemStatus; label: string }> = [
  { value: "completed", label: "Completed" },
  { value: "in-progress", label: "In progress" },
  { value: "upcoming", label: "Upcoming" },
];

async function uploadFile(file: File, fiscalYearId: string, categoryId: string) {
  const path = `budget/${fiscalYearId}/${categoryId}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from("budget-files").upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return path;
}

export function AccomplishmentList({ fiscalYearId, categoryId, readOnly }: { fiscalYearId: string; categoryId: string; readOnly: boolean }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useBudgetAccomplishments(categoryId);
  const saveAccomplishment = useSaveBudgetAccomplishment();
  const deleteAccomplishment = useDeleteBudgetAccomplishment();
  const [formOpen, setFormOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [photo, setPhoto] = useState<File | undefined>();
  const [documentFile, setDocumentFile] = useState<File | undefined>();
  const [formError, setFormError] = useState<string | null>(null);

  useUnsavedChangesWarning(formOpen && dirty);
  if (isLoading) return <AdminListSkeleton rows={2} />;
  if (isError || !data) return <AdminErrorState error={error} message="We couldn't load accomplishments." onRetry={() => void refetch()} retrying={isFetching} />;
  const accomplishments = data;

  function closeForm() {
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    setFormOpen(false);
    setDirty(false);
  }

  async function handleAdd() {
    const result = accomplishmentSchema.safeParse({ title, description, date, amount, photo, document: documentFile });
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? "Fix the fields before saving.");
      return;
    }
    setFormError(null);
    try {
      const photoPath = result.data.photo ? await uploadFile(result.data.photo, fiscalYearId, categoryId) : null;
      const documentPath = result.data.document ? await uploadFile(result.data.document, fiscalYearId, categoryId) : null;
      await saveAccomplishment.mutateAsync({
        fiscalYearId,
        categoryId,
        title: result.data.title,
        amount: result.data.amount,
        status: "upcoming",
        period: "",
        description: result.data.description,
        accomplishmentDate: result.data.date,
        photoPath,
        documentPath,
      });
      setTitle(""); setDescription(""); setDate(""); setAmount(""); setPhoto(undefined); setDocumentFile(undefined); setDirty(false); setFormOpen(false);
    } catch {
      setFormError("We couldn't save this accomplishment. Please try again.");
    }
  }

  async function handleEdit(values: Record<string, string>) {
    const existingDate = accomplishments.find((item) => item.id === values.id)?.accomplishment_date ?? new Date().toISOString().slice(0, 10);
    const result = accomplishmentSchema.safeParse({ title: values.title?.trim() ?? "", description: values.description?.trim() ?? "", date: existingDate, amount: values.amount?.trim() ?? "" });
    if (!result.success) return { fieldErrors: { title: result.error.issues[0]?.message ?? "Fix this field" } };
    await saveAccomplishment.mutateAsync({ id: values.id, fiscalYearId, categoryId, title: result.data.title, amount: result.data.amount, status: (values.status as BudgetItemStatus) ?? "upcoming", period: values.period?.trim() ?? "", description: result.data.description, accomplishmentDate: result.data.date });
    return undefined;
  }

  return (
    <div className="space-y-3">
      {accomplishments.length === 0 && (
        <AdminEmptyState title="No accomplishments yet" description="Add an accomplishment to document this category's progress." action={!readOnly ? <AdminButton type="button" onClick={() => setFormOpen(true)}><Plus size={15} aria-hidden="true" />Add Accomplishment</AdminButton> : undefined} />
      )}
      {accomplishments.length > 0 && (
        <div className="space-y-2">
          {accomplishments.map((item) => (
            <ListItemCard
              key={item.id}
              title={item.title}
              subtitle={`${formatPHP(item.amount)}${item.accomplishment_date ? ` · ${item.accomplishment_date}` : ""}`}
              leadingVisual={{ kind: "swatch", color: "#E1E7F0" }}
              fields={[{ key: "id", label: "Accomplishment ID", initialValue: item.id }, { key: "title", label: "Title", placeholder: "Project title", initialValue: item.title }, { key: "amount", label: "Amount", placeholder: "0", initialValue: String(item.amount) }, { key: "status", label: "Status", type: "select", initialValue: item.status, options: STATUS_OPTIONS }, { key: "period", label: "Period", placeholder: "e.g. March 2026", initialValue: item.period ?? "" }, { key: "description", label: "Description", placeholder: "Description", type: "textarea", initialValue: item.description ?? "" }]}
              onSave={handleEdit}
              onDelete={() => deleteAccomplishment.mutate(item.id)}
              deleteLabel={`Delete ${item.title}`}
              deleteConfirmMessage="Delete permanently? This action cannot be undone."
              editDisabled={readOnly}
              showDelete={!readOnly}
            />
          ))}
        </div>
      )}
      {accomplishments.length > 0 && !readOnly && <AdminButton type="button" variant="secondary" onClick={() => setFormOpen(true)}><Plus size={15} aria-hidden="true" />Add Accomplishment</AdminButton>}
      {deleteAccomplishment.isError && <InlineNotice variant="error" message={getErrorMessage(deleteAccomplishment.error, "Couldn't delete this accomplishment.")} />}
      {formOpen && !readOnly && (
        <AdminCard className="bg-background">
          <h4 className="text-small font-semibold text-text-primary">Add Accomplishment</h4>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-small font-medium text-text-primary">Title *<input value={title} onChange={(event) => { setTitle(event.target.value); setDirty(true); }} className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 font-normal" /></label>
            <label className="text-small font-medium text-text-primary">Date *<input type="date" value={date} onChange={(event) => { setDate(event.target.value); setDirty(true); }} className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 font-normal" /></label>
            <label className="text-small font-medium text-text-primary">Amount *<input inputMode="decimal" value={amount} onChange={(event) => { setAmount(event.target.value); setDirty(true); }} className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 font-normal" /></label>
            <label className="text-small font-medium text-text-primary">Photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { setPhoto(event.target.files?.[0]); setDirty(true); }} className="mt-1 block w-full text-small font-normal" /></label>
            <label className="text-small font-medium text-text-primary sm:col-span-2">Description<textarea value={description} onChange={(event) => { setDescription(event.target.value); setDirty(true); }} rows={3} className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 font-normal" /></label>
            <label className="text-small font-medium text-text-primary sm:col-span-2">Document<input type="file" accept="application/pdf" onChange={(event) => { setDocumentFile(event.target.files?.[0]); setDirty(true); }} className="mt-1 block w-full text-small font-normal" /></label>
          </div>
          {formError && <p className="mt-3 text-small text-status-error-text">{formError}</p>}
          <div className="mt-4 flex gap-2"><AdminButton type="button" onClick={() => void handleAdd()} loading={saveAccomplishment.isPending}>Save Accomplishment</AdminButton><AdminButton type="button" variant="secondary" onClick={closeForm}>Cancel</AdminButton></div>
        </AdminCard>
      )}
    </div>
  );
}

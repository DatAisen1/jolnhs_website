import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { ListItemCard } from "@/pages/admin/ListItemCard";
import { useOfficerForm } from "@/hooks/useOfficerForm";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { useArchiveOfficer, useSaveOfficer, type CampusLifeOfficer } from "@/lib/data/campusLife";
import { supabase } from "@/lib/supabase";
import { officerSchema } from "@/lib/validation/officerSchema";
import { getErrorMessage } from "@/lib/errors";

function buildPublicPhotoUrl(photoPath: string | null | undefined) {
  if (!photoPath) return undefined;
  const { data: publicData } = supabase.storage.from("staff-photos").getPublicUrl(photoPath);
  return publicData.publicUrl || undefined;
}

function OfficerFormModal({ sectionId, onClose }: { sectionId: string; onClose: () => void }) {
  const [dirty, setDirty] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useOfficerForm(sectionId, undefined, onClose);
  useUnsavedChangesWarning(dirty);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") requestClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  });

  function requestClose() {
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    onClose();
  }

  async function handleSubmit() {
    setSubmitError(null);
    try {
      await form.submit();
    } catch {
      setSubmitError("We couldn't save this officer. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) requestClose();
    }}>
      <section className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="officer-modal-title">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 id="officer-modal-title" className="font-heading text-subtitle text-text-primary">Add Officer</h2>
            <p className="mt-1 text-small text-text-secondary">Add a name, position, and optional photo.</p>
          </div>
          <button type="button" onClick={requestClose} className="rounded-md p-2 text-text-secondary hover:bg-background" aria-label="Close officer form"><X size={18} aria-hidden="true" /></button>
        </header>
        <form onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
          <div className="space-y-4 p-5">
            <div>
              <label htmlFor="officer-name" className="mb-1 block text-small font-medium text-text-primary">Name *</label>
              <input id="officer-name" value={form.values.name} onChange={(event) => { setDirty(true); form.updateValue("name", event.target.value); }} aria-invalid={Boolean(form.errors.name)} className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary" />
              {form.errors.name && <p className="mt-1 text-small text-status-error-text">{form.errors.name}</p>}
            </div>
            <div>
              <label htmlFor="officer-position" className="mb-1 block text-small font-medium text-text-primary">Position *</label>
              <input id="officer-position" value={form.values.position} onChange={(event) => { setDirty(true); form.updateValue("position", event.target.value); }} aria-invalid={Boolean(form.errors.position)} className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary" />
              {form.errors.position && <p className="mt-1 text-small text-status-error-text">{form.errors.position}</p>}
            </div>
            <div>
              <label htmlFor="officer-photo" className="mb-1 block text-small font-medium text-text-primary">Photo</label>
              <input id="officer-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { setDirty(true); form.updateValue("photo", event.target.files?.[0]); }} className="block w-full text-small text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-semibold file:text-primary" />
              {form.errors.photo && <p className="mt-1 text-small text-status-error-text">{form.errors.photo}</p>}
            </div>
            {submitError && <InlineNotice variant="error" message={submitError} />}
          </div>
          <footer className="flex justify-end gap-2 border-t border-border p-5">
            <AdminButton type="button" variant="secondary" onClick={requestClose}>Cancel</AdminButton>
            <AdminButton type="submit" loading={form.isPending}>Add Officer</AdminButton>
          </footer>
        </form>
      </section>
    </div>
  );
}

export function OfficerManager({ sectionId, officers }: { sectionId: string; officers: CampusLifeOfficer[] }) {
  const saveOfficer = useSaveOfficer();
  const archiveOfficer = useArchiveOfficer();
  const [modalOpen, setModalOpen] = useState(false);

  async function handleSaveOfficer(values: Record<string, string>) {
    const result = officerSchema.safeParse({ name: values.name?.trim() ?? "", position: values.position?.trim() ?? "" });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? "name";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { fieldErrors };
    }
    await saveOfficer.mutateAsync({ id: values.id, sectionId, name: result.data.name, position: result.data.position });
    return undefined;
  }

  return (
    <div className="space-y-4">
      {officers.length === 0 && (
        <AdminEmptyState
          title="No officers yet"
          description="Add an officer to begin managing this section."
          action={<AdminButton type="button" onClick={() => setModalOpen(true)}><Plus size={15} aria-hidden="true" />Add Officer</AdminButton>}
        />
      )}
      <div className="space-y-3">
        {officers.map((officer) => (
          <ListItemCard
            key={officer.id}
            title={officer.name}
            subtitle={officer.position}
            leadingVisual={{ kind: "photo", photoUrl: buildPublicPhotoUrl(officer.photo_path), alt: `Photo for ${officer.name}` }}
            fields={[
              { key: "id", label: "Officer ID", placeholder: "", initialValue: officer.id },
              { key: "name", label: "Name", placeholder: "Jane Doe", initialValue: officer.name },
              { key: "position", label: "Position", placeholder: "President", initialValue: officer.position },
            ]}
            onSave={handleSaveOfficer}
            onDelete={() => archiveOfficer.mutate(officer.id)}
            deleteLabel={`Archive ${officer.name}`}
            deleteConfirmMessage={`Archive ${officer.name}? This will remove this officer from the public website. Their record will be preserved.`}
            editLabel={`Edit ${officer.name}`}
          />
        ))}
      </div>
      {officers.length > 0 && <AdminButton type="button" variant="secondary" onClick={() => setModalOpen(true)}><Plus size={15} aria-hidden="true" />Add Officer</AdminButton>}
      {saveOfficer.isError && <InlineNotice variant="error" message={getErrorMessage(saveOfficer.error, "Couldn't save this officer.")} />}
      {archiveOfficer.isError && <InlineNotice variant="error" message={getErrorMessage(archiveOfficer.error, "Couldn't archive this officer.")} />}
      {modalOpen && <OfficerFormModal sectionId={sectionId} onClose={() => setModalOpen(false)} />}
    </div>
  );
}

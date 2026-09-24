import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { useStaffForm } from "@/hooks/useStaffForm";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import type { StaffCategory, StaffMember } from "@/lib/data/staff";

const CATEGORY_OPTIONS: ReadonlyArray<{ value: StaffCategory; label: string }> = [
  { value: "administrators", label: "Administrators" },
  { value: "jhs-faculty", label: "JHS Faculty" },
  { value: "shs-faculty", label: "SHS Faculty" },
  { value: "staff", label: "Staff" },
];

export function StaffFormDrawer({
  member,
  defaultCategory,
  onClose,
}: {
  member?: StaffMember;
  defaultCategory: StaffCategory;
  onClose: () => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const form = useStaffForm(member, onClose);
  useUnsavedChangesWarning(dirty);

  useEffect(() => {
    if (member || form.values.category !== "administrators") return;
    form.updateValue("category", defaultCategory);
  }, [defaultCategory, form, member]);

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
      setSubmitError("We couldn't save this staff member. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/40" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) requestClose();
    }}>
      <section
        className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-drawer-title"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 id="staff-drawer-title" className="font-heading text-subtitle text-text-primary">
              {member ? "Edit staff member" : "Add staff member"}
            </h2>
            <p className="mt-1 text-small text-text-secondary">Required fields are marked with *.</p>
          </div>
          <button type="button" onClick={requestClose} className="rounded-md p-2 text-text-secondary hover:bg-background" aria-label="Close staff form">
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <form className="flex flex-1 flex-col" onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
          <div className="flex-1 space-y-4 p-5">
            <div>
              <label htmlFor="staff-name" className="mb-1 block text-small font-medium text-text-primary">Full name *</label>
              <input id="staff-name" value={form.values.name} onChange={(event) => { setDirty(true); form.updateValue("name", event.target.value); }} aria-invalid={Boolean(form.errors.name)} className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary" />
              {form.errors.name && <p className="mt-1 text-small text-status-error-text">{form.errors.name}</p>}
            </div>

            <div>
              <label htmlFor="staff-position" className="mb-1 block text-small font-medium text-text-primary">Position *</label>
              <input id="staff-position" value={form.values.position} onChange={(event) => { setDirty(true); form.updateValue("position", event.target.value); }} aria-invalid={Boolean(form.errors.position)} className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary" />
              {form.errors.position && <p className="mt-1 text-small text-status-error-text">{form.errors.position}</p>}
            </div>

            <div>
              <label htmlFor="staff-category" className="mb-1 block text-small font-medium text-text-primary">Category *</label>
              <select id="staff-category" value={form.values.category} onChange={(event) => { setDirty(true); form.updateValue("category", event.target.value as StaffCategory); }} className="w-full rounded-md border border-border bg-white px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary">
                {CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="staff-department" className="mb-1 block text-small font-medium text-text-primary">Department</label>
              <input id="staff-department" value={form.values.department} disabled placeholder="Not available yet" className="w-full rounded-md border border-border bg-background px-3 py-2 text-small text-text-secondary" />
              <p className="mt-1 text-small text-text-secondary">Department storage is not available in the current staff table.</p>
            </div>

            <div>
              <label htmlFor="staff-photo" className="mb-1 block text-small font-medium text-text-primary">Photo</label>
              <input id="staff-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { setDirty(true); form.updateValue("photo", event.target.files?.[0]); }} className="block w-full text-small text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-semibold file:text-primary" />
              {form.errors.photo && <p className="mt-1 text-small text-status-error-text">{form.errors.photo}</p>}
            </div>

            {submitError && <InlineNotice variant="error" message={submitError} />}
          </div>
          <footer className="flex flex-wrap justify-end gap-2 border-t border-border p-5">
            <AdminButton type="button" variant="secondary" onClick={requestClose}>Cancel</AdminButton>
            <AdminButton type="submit" loading={form.isPending}>{member ? "Save changes" : "Add staff"}</AdminButton>
          </footer>
        </form>
      </section>
    </div>
  );
}

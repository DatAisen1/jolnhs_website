import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Archive, Download, FileText, FileUp, Plus, X } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminErrorState, AdminListSkeleton } from "@/components/admin/AdminStates";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { SectionTabs } from "@/pages/admin/SectionTabs";
import { getErrorMessage } from "@/lib/errors";
import {
  DOCUMENT_CATEGORY_LABELS,
  documentFileUrl,
  uploadDocumentFile,
  useAdminDocuments,
  useSaveDocument,
  useSetDocumentArchived,
  type DocumentCategory,
  type SchoolDocument,
} from "@/lib/data/documents";

const CATEGORIES: DocumentCategory[] = ["enrollment", "forms", "handbook", "other"];

const fieldClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-small text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-1 block text-small font-medium text-text-primary";

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsManagePage() {
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("enrollment");
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: docs, isLoading, isError, error, refetch } = useAdminDocuments(showArchived);
  const save = useSaveDocument();
  const setArchived = useSetDocumentArchived();

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!title.trim()) return setFormError("A title is required.");
    if (!file) return setFormError("Choose a file to upload.");
    setSaving(true);
    try {
      const path = await uploadDocumentFile(file);
      await save.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        category,
        filePath: path,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
      setFormOpen(false);
      setTitle("");
      setDescription("");
      setCategory("enrollment");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not publish the document."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Documents"
        description="Publish downloadable files — enrollment forms, handbooks, request forms — to the public Downloads page."
        action={
          <AdminButton onClick={() => setFormOpen((v) => !v)}>
            {formOpen ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            {formOpen ? "Close" : "Publish a document"}
          </AdminButton>
        }
      />

      {formOpen && (
        <AdminCard className="mb-6">
          <h2 className="mb-4 text-subtitle font-semibold text-text-primary">New document</h2>
          {formError && (
            <p className="mb-4 rounded-md border border-status-error bg-status-error-bg px-4 py-3 text-small text-status-error-text">
              {formError}
            </p>
          )}
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="doc-title" className={labelClass}>Title</label>
              <input
                id="doc-title"
                className={fieldClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Enrollment Form (SF-10 Request)"
              />
            </div>
            <div>
              <label htmlFor="doc-category" className={labelClass}>Category</label>
              <select
                id="doc-category"
                className={fieldClass}
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{DOCUMENT_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="doc-file" className={labelClass}>File (PDF, Word, or image — max 20 MB)</label>
              <div className="flex items-center gap-3">
                <AdminButton type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  <FileUp size={15} aria-hidden="true" /> {file ? "Change file" : "Choose file"}
                </AdminButton>
                {file && <span className="truncate text-small text-text-secondary">{file.name}</span>}
                <input
                  ref={fileInputRef}
                  id="doc-file"
                  type="file"
                  accept=".pdf,.doc,.docx,image/jpeg,image/png"
                  className="sr-only"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="doc-desc" className={labelClass}>Description (optional)</label>
              <input
                id="doc-desc"
                className={fieldClass}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="One line explaining what this document is for"
              />
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <AdminButton type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</AdminButton>
              <AdminButton type="submit" loading={saving}>Publish</AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      <SectionTabs
        tabs={[
          { slug: "active", label: "Published" },
          { slug: "archived", label: "Archived" },
        ]}
        activeTab={showArchived ? "archived" : "active"}
        onTabChange={(slug) => setShowArchived(slug === "archived")}
      />

      {isLoading && <AdminListSkeleton rows={4} />}
      {isError && <AdminErrorState error={error} onRetry={() => refetch()} />}

      {docs && docs.length === 0 && (
        <AdminEmptyState
          icon={showArchived ? Archive : FileText}
          title={showArchived ? "Nothing archived" : "No documents yet"}
          description={
            showArchived
              ? "Archived documents will appear here."
              : "Publish a document and it becomes downloadable on the public /downloads page."
          }
        />
      )}

      {docs && docs.length > 0 && (
        <ul className="space-y-3">
          {docs.map((doc: SchoolDocument) => (
            <li key={doc.id}>
              <AdminCard className="flex items-center gap-4 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileText size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-small font-semibold text-text-primary">{doc.title}</h3>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {DOCUMENT_CATEGORY_LABELS[doc.category]}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-text-secondary">
                    {doc.file_name}{doc.file_size ? ` · ${formatSize(doc.file_size)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={documentFileUrl(doc.file_path) ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Download ${doc.title}`}
                    className="rounded p-1.5 text-text-secondary hover:bg-black/5 hover:text-text-primary"
                  >
                    <Download size={16} />
                  </a>
                  <ConfirmButton
                    label={showArchived ? `Restore ${doc.title}` : `Archive ${doc.title}`}
                    confirmMessage={showArchived ? "Restore this document?" : "Archive this document? It disappears from the Downloads page."}
                    onConfirm={() => setArchived.mutate({ id: doc.id, archived: !showArchived, title: doc.title })}
                  />
                </div>
              </AdminCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

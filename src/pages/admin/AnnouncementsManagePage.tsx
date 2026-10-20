import { useRef, useState } from "react";
import { Archive, Megaphone, Pin, PinOff, Plus, Save, X } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminErrorState, AdminListSkeleton } from "@/components/admin/AdminStates";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { SectionTabs } from "@/pages/admin/SectionTabs";
import { getErrorMessage } from "@/lib/errors";
import {
  CATEGORY_LABELS,
  coverImageUrl,
  uploadAnnouncementCover,
  useAdminAnnouncements,
  useSaveAnnouncement,
  useSetAnnouncementArchived,
  type Announcement,
  type AnnouncementCategory,
} from "@/lib/data/announcements";

const CATEGORIES: AnnouncementCategory[] = ["announcement", "news", "event", "advisory"];

interface FormState {
  title: string;
  category: AnnouncementCategory;
  excerpt: string;
  body: string;
  titleFil: string;
  excerptFil: string;
  bodyFil: string;
  isPinned: boolean;
  isPublished: boolean;
}

const EMPTY_FORM: FormState = {
  title: "",
  category: "announcement",
  excerpt: "",
  body: "",
  titleFil: "",
  excerptFil: "",
  bodyFil: "",
  isPinned: false,
  isPublished: false,
};

const fieldClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-small text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-1 block text-small font-medium text-text-primary";

export function AnnouncementsManagePage() {
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [existingCover, setExistingCover] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: items, isLoading, isError, error, refetch } = useAdminAnnouncements(showArchived);
  const save = useSaveAnnouncement();
  const setArchived = useSetAnnouncementArchived();

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setCoverFile(null);
    setExistingCover(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(item: Announcement) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      excerpt: item.excerpt ?? "",
      body: item.body,
      titleFil: item.title_fil ?? "",
      excerptFil: item.excerpt_fil ?? "",
      bodyFil: item.body_fil ?? "",
      isPinned: item.is_pinned,
      isPublished: item.is_published,
    });
    setCoverFile(null);
    setExistingCover(item.cover_image_path);
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSave() {
    setFormError(null);
    if (!form.title.trim()) return setFormError("A title is required.");
    if (!form.body.trim()) return setFormError("Body text is required.");
    try {
      const coverPath = coverFile ? await uploadAnnouncementCover(coverFile) : existingCover;
      await save.mutateAsync({
        id: editingId ?? undefined,
        title: form.title.trim(),
        category: form.category,
        excerpt: form.excerpt.trim(),
        body: form.body.trim(),
        coverImagePath: coverPath,
        isPinned: form.isPinned,
        isPublished: form.isPublished,
        titleFil: form.titleFil.trim(),
        excerptFil: form.excerptFil.trim(),
        bodyFil: form.bodyFil.trim(),
      });
      setFormOpen(false);
    } catch (e) {
      setFormError(getErrorMessage(e, "Could not save the announcement."));
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        title="Announcements"
        description="Publish news, advisories, and events to the public site. Pinned items stay on top."
        action={
          <AdminButton onClick={openCreate}>
            <Plus size={16} aria-hidden="true" /> New announcement
          </AdminButton>
        }
      />

      <div className="mb-5">
        <SectionTabs
          tabs={[
            { slug: "active", label: "Published & Drafts" },
            { slug: "archived", label: "Archived" },
          ]}
          activeTab={showArchived ? "archived" : "active"}
          onTabChange={(slug) => setShowArchived(slug === "archived")}
        />
      </div>

      {formOpen && (
        <AdminCard className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-subtitle font-semibold text-text-primary">
              {editingId ? "Edit announcement" : "New announcement"}
            </h2>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              aria-label="Close form"
              className="rounded p-1 text-text-secondary hover:bg-black/5 hover:text-text-primary"
            >
              <X size={18} />
            </button>
          </div>

          {formError && (
            <p className="mb-4 rounded-md border border-status-error bg-status-error-bg px-4 py-3 text-small text-status-error-text">
              {formError}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="ann-title" className={labelClass}>Title</label>
              <input
                id="ann-title"
                className={fieldClass}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="ann-category" className={labelClass}>Category</label>
              <select
                id="ann-category"
                className={fieldClass}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as AnnouncementCategory })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ann-cover" className={labelClass}>Cover image (optional)</label>
              <div className="flex items-center gap-3">
                <AdminButton type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  {existingCover || coverFile ? "Change image" : "Upload image"}
                </AdminButton>
                {(existingCover || coverFile) && (
                  <img
                    src={coverFile ? URL.createObjectURL(coverFile) : coverImageUrl(existingCover) ?? ""}
                    alt=""
                    className="h-10 w-16 rounded object-cover"
                  />
                )}
                <input
                  ref={fileInputRef}
                  id="ann-cover"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ann-excerpt" className={labelClass}>Excerpt (card preview text)</label>
              <input
                id="ann-excerpt"
                className={fieldClass}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                maxLength={240}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ann-body" className={labelClass}>Body</label>
              <textarea
                id="ann-body"
                className={`${fieldClass} min-h-[140px] resize-y`}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
          </div>

          <details className="mt-4 rounded-md border border-border bg-background px-4 py-3">
            <summary className="cursor-pointer text-small font-medium text-text-primary">
              Filipino translation (optional)
            </summary>
            <div className="mt-3 grid gap-4">
              <div>
                <label htmlFor="ann-title-fil" className={labelClass}>Title (Filipino)</label>
                <input
                  id="ann-title-fil"
                  className={fieldClass}
                  value={form.titleFil}
                  onChange={(e) => setForm({ ...form, titleFil: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="ann-excerpt-fil" className={labelClass}>Excerpt (Filipino)</label>
                <input
                  id="ann-excerpt-fil"
                  className={fieldClass}
                  value={form.excerptFil}
                  onChange={(e) => setForm({ ...form, excerptFil: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="ann-body-fil" className={labelClass}>Body (Filipino)</label>
                <textarea
                  id="ann-body-fil"
                  className={`${fieldClass} min-h-[120px] resize-y`}
                  value={form.bodyFil}
                  onChange={(e) => setForm({ ...form, bodyFil: e.target.value })}
                />
              </div>
            </div>
          </details>

          <div className="mt-4 flex flex-wrap items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-small text-text-primary">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              Published — visible on the public site
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-small text-text-primary">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              Pinned — stays at the top of the feed
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <AdminButton type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="button" onClick={handleSave} loading={save.isPending}>
              <Save size={16} aria-hidden="true" /> Save
            </AdminButton>
          </div>
        </AdminCard>
      )}

      {isLoading && <AdminListSkeleton rows={4} />}
      {isError && <AdminErrorState error={error} onRetry={() => refetch()} />}

      {items && items.length === 0 && !showArchived && (
        <AdminEmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="Create your first announcement to keep the school community informed. Published items appear on /news and the homepage."
          action={<AdminButton onClick={openCreate}><Plus size={16} /> New announcement</AdminButton>}
        />
      )}
      {items && items.length === 0 && showArchived && (
        <AdminEmptyState icon={Archive} title="Nothing archived" description="Archived announcements will appear here." />
      )}

      {items && items.length > 0 && (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <AdminCard className="flex flex-wrap items-center gap-4 p-4">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded bg-background">
                  {item.cover_image_path ? (
                    <img src={coverImageUrl(item.cover_image_path) ?? ""} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-text-secondary">
                      <Megaphone size={18} aria-hidden="true" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-small font-semibold text-text-primary">{item.title}</h3>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {CATEGORY_LABELS[item.category]}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        item.is_published
                          ? "bg-status-success-bg text-status-success-text"
                          : "bg-black/5 text-text-secondary"
                      }`}
                    >
                      {item.is_published ? "Published" : "Draft"}
                    </span>
                    {item.is_pinned && <Pin size={13} className="text-primary" aria-label="Pinned" />}
                    {item.body_fil && (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-text-secondary">FIL</span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-small text-text-secondary">
                    {item.excerpt || item.body}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <AdminButton type="button" variant="secondary" onClick={() => openEdit(item)} className="min-h-9 px-3 py-1.5">
                    Edit
                  </AdminButton>
                  <button
                    type="button"
                    onClick={() =>
                      save.mutate({
                        id: item.id,
                        title: item.title,
                        category: item.category,
                        excerpt: item.excerpt ?? "",
                        body: item.body,
                        coverImagePath: item.cover_image_path,
                        isPinned: !item.is_pinned,
                        isPublished: item.is_published,
                      })
                    }
                    aria-label={item.is_pinned ? `Unpin ${item.title}` : `Pin ${item.title}`}
                    className="rounded p-1.5 text-text-secondary hover:bg-black/5 hover:text-text-primary"
                  >
                    {item.is_pinned ? <PinOff size={16} /> : <Pin size={16} />}
                  </button>
                  <ConfirmButton
                    label={showArchived ? `Restore ${item.title}` : `Archive ${item.title}`}
                    confirmMessage={showArchived ? "Restore this announcement?" : "Archive this announcement? It will disappear from the public site."}
                    onConfirm={() => setArchived.mutate({ id: item.id, archived: !showArchived, title: item.title })}
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


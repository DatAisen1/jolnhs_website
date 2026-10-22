import { useEffect, useRef, useState } from "react";
import { Plus, X, ChevronDown, RotateCcw, ImagePlus, Trash2 } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminErrorState, AdminListSkeleton } from "@/components/admin/AdminStates";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { ListItemCard } from "@/pages/admin/ListItemCard";
import {
  useCampusLifeGroups,
  useSaveGroup,
  useArchiveGroup,
  useRestoreGroup,
  useSaveMember,
  useArchiveMember,
  useRestoreMember,
  useSaveGroupPhoto,
  useDeleteGroupPhoto,
  uploadGroupCover,
  uploadMemberPhoto,
  uploadGroupPhoto,
  type CampusLifeGroup,
  type CampusLifeGroupMember,
} from "@/lib/data/campusLifeGroups";
import {
  groupSlugify,
  ROLE_GROUP_LABELS,
  type GroupSectionConfig,
  type GroupMemberRole,
} from "@/data/campusLifeGroups";
import { groupSchema, memberSchema } from "@/lib/validation/campusLifeGroups";
import { getErrorMessage } from "@/lib/errors";

const MAX_GROUP_PHOTOS = 12;

/* ------------------------------ modals ------------------------------ */

function GroupFormModal({
  config,
  sectionId,
  group,
  onClose,
}: {
  config: GroupSectionConfig;
  sectionId: string;
  group?: CampusLifeGroup;
  onClose: () => void;
}) {
  const saveGroup = useSaveGroup();
  const [name, setName] = useState(group?.name ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = groupSchema.safeParse({ name, description, cover: coverFile ?? undefined });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "name";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitError(null);
    setSaving(true);
    try {
      // New groups: save first to mint an id, then attach the cover so the
      // storage path can live under groups/<id>/.
      const slug = group?.slug ?? groupSlugify(parsed.data.name);
      const groupId = await saveGroup.mutateAsync({
        id: group?.id,
        sectionId,
        slug,
        name: parsed.data.name,
        description: parsed.data.description,
        coverImagePath: group?.cover_image_path ?? null,
      });
      if (coverFile && groupId) {
        const coverPath = await uploadGroupCover(coverFile, groupId);
        await saveGroup.mutateAsync({
          id: groupId,
          sectionId,
          slug,
          name: parsed.data.name,
          description: parsed.data.description,
          coverImagePath: coverPath,
        });
      }
      onClose();
    } catch (err) {
      // A duplicate slug (unique per section) retries once with a suffix —
      // "Basketball" added twice shouldn't force the admin to rename it.
      if ((err as { code?: string })?.code === "23505" && !group) {
        try {
          await saveGroup.mutateAsync({
            sectionId,
            slug: `${groupSlugify(parsed.data.name)}-${crypto.randomUUID().slice(0, 4)}`,
            name: parsed.data.name,
            description: parsed.data.description,
          });
          onClose();
          return;
        } catch (retryErr) {
          setSubmitError(getErrorMessage(retryErr, `Couldn't save this ${config.groupNoun.toLowerCase()}.`));
          return;
        }
      }
      setSubmitError(getErrorMessage(err, `Couldn't save this ${config.groupNoun.toLowerCase()}.`));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-modal-title"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 id="group-modal-title" className="font-heading text-subtitle text-text-primary">
              {group ? `Edit ${config.groupNoun}` : `Add ${config.groupNoun}`}
            </h2>
            <p className="mt-1 text-small text-text-secondary">Name, description, and an optional cover image.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-text-secondary hover:bg-background"
            aria-label="Close form"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="space-y-4 p-5">
            <div>
              <label htmlFor="group-name" className="mb-1 block text-small font-medium text-text-primary">
                Name *
              </label>
              <input
                id="group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(errors.name)}
                className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.name && <p className="mt-1 text-small text-status-error-text">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="group-description" className="mb-1 block text-small font-medium text-text-primary">
                Description
              </label>
              <textarea
                id="group-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                aria-invalid={Boolean(errors.description)}
                className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.description && <p className="mt-1 text-small text-status-error-text">{errors.description}</p>}
            </div>
            <div>
              <label htmlFor="group-cover" className="mb-1 block text-small font-medium text-text-primary">
                Cover image
              </label>
              <input
                id="group-cover"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                className="block w-full text-small text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-semibold file:text-primary"
              />
              {group?.cover_image_url && !coverFile && (
                <img src={group.cover_image_url} alt="" className="mt-2 h-20 w-32 rounded-md object-cover" />
              )}
              {errors.cover && <p className="mt-1 text-small text-status-error-text">{errors.cover}</p>}
            </div>
            {submitError && <InlineNotice variant="error" message={submitError} />}
          </div>
          <footer className="flex justify-end gap-2 border-t border-border p-5">
            <AdminButton type="button" variant="secondary" onClick={onClose}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" loading={saving || saveGroup.isPending}>
              {group ? "Save Changes" : `Add ${config.groupNoun}`}
            </AdminButton>
          </footer>
        </form>
      </section>
    </div>
  );
}

function MemberFormModal({
  config,
  groupId,
  role,
  onClose,
}: {
  config: GroupSectionConfig;
  groupId: string;
  role: GroupMemberRole;
  onClose: () => void;
}) {
  const saveMember = useSaveMember();
  const roleConfig = config.roles[role];
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = memberSchema.safeParse({ name, position, photo: photoFile ?? undefined });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "name";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitError(null);
    setSaving(true);
    try {
      let photoPath: string | null = null;
      if (photoFile && roleConfig.allowsPhoto) {
        // The row doesn't exist yet — mint an id-shaped filename for the
        // storage path, the same way useOfficerForm does.
        photoPath = await uploadMemberPhoto(photoFile, crypto.randomUUID());
      }
      await saveMember.mutateAsync({
        groupId,
        name: parsed.data.name,
        role,
        position: parsed.data.position,
        photoPath,
      });
      onClose();
    } catch (err) {
      setSubmitError(getErrorMessage(err, `Couldn't save this ${roleConfig.label.toLowerCase()}.`));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-modal-title"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 id="member-modal-title" className="font-heading text-subtitle text-text-primary">
              {roleConfig.addLabel}
            </h2>
            <p className="mt-1 text-small text-text-secondary">
              {roleConfig.allowsPhoto ? "Name, position, and an optional photo." : "Name and position — players are listed without individual photos."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-text-secondary hover:bg-background"
            aria-label="Close form"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="space-y-4 p-5">
            <div>
              <label htmlFor="member-name" className="mb-1 block text-small font-medium text-text-primary">
                Name *
              </label>
              <input
                id="member-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(errors.name)}
                className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.name && <p className="mt-1 text-small text-status-error-text">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="member-position" className="mb-1 block text-small font-medium text-text-primary">
                Position
              </label>
              <input
                id="member-position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder={roleConfig.positionHint || undefined}
                aria-invalid={Boolean(errors.position)}
                className="w-full rounded-md border border-border px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.position && <p className="mt-1 text-small text-status-error-text">{errors.position}</p>}
            </div>
            {roleConfig.allowsPhoto && (
              <div>
                <label htmlFor="member-photo" className="mb-1 block text-small font-medium text-text-primary">
                  Photo
                </label>
                <input
                  id="member-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-small text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-semibold file:text-primary"
                />
                {errors.photo && <p className="mt-1 text-small text-status-error-text">{errors.photo}</p>}
              </div>
            )}
            {submitError && <InlineNotice variant="error" message={submitError} />}
          </div>
          <footer className="flex justify-end gap-2 border-t border-border p-5">
            <AdminButton type="button" variant="secondary" onClick={onClose}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" loading={saving || saveMember.isPending}>
              {roleConfig.addLabel}
            </AdminButton>
          </footer>
        </form>
      </section>
    </div>
  );
}

/* ------------------------------ member row ------------------------------ */

function MemberRow({
  member,
  config,
  onAddPhotoError,
}: {
  member: CampusLifeGroupMember;
  config: GroupSectionConfig;
  onAddPhotoError: (message: string) => void;
}) {
  const saveMember = useSaveMember();
  const archiveMember = useArchiveMember();
  const restoreMember = useRestoreMember();
  const [uploading, setUploading] = useState(false);
  const allowsPhoto = config.roles[member.role]?.allowsPhoto ?? false;

  async function handleSave(values: Record<string, string>) {
    const parsed = memberSchema.safeParse({ name: values.name?.trim() ?? "", position: values.position?.trim() ?? "" });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "name";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { fieldErrors };
    }
    await saveMember.mutateAsync({
      id: member.id,
      groupId: member.group_id,
      name: parsed.data.name,
      role: member.role,
      position: parsed.data.position,
      photoPath: member.photo_path,
    });
    return undefined;
  }

  async function handleSelectPhoto(file: File) {
    setUploading(true);
    try {
      // uploadMemberPhoto stores under members/<id>.<ext> — the returned
      // storage path is what the row keeps (the URL is derived at read).
      const path = await uploadMemberPhoto(file, member.id);
      await saveMember.mutateAsync({
        id: member.id,
        groupId: member.group_id,
        name: member.name,
        role: member.role,
        position: member.position ?? undefined,
        photoPath: path,
      });
    } catch (err) {
      onAddPhotoError(getErrorMessage(err, "Couldn't upload that photo."));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex min-w-0 items-start gap-2">
      <div className="min-w-0 flex-1">
        <ListItemCard
          title={member.name}
          subtitle={member.position || config.roles[member.role]?.label}
          badge={member.is_archived ? { label: "Archived", variant: "warning" } : undefined}
          leadingVisual={{
            kind: "photo",
            photoUrl: member.photo_url,
            alt: `Photo for ${member.name}`,
            uploading,
            ...(allowsPhoto ? { onSelectPhoto: (file: File) => void handleSelectPhoto(file) } : {}),
          }}
          fields={[
            { key: "name", label: "Name", placeholder: "Jane Doe", initialValue: member.name },
            { key: "position", label: "Position", placeholder: config.roles[member.role]?.positionHint || "Position", initialValue: member.position ?? "" },
          ]}
          onSave={handleSave}
          onDelete={() => archiveMember.mutate(member.id)}
          deleteLabel={`Archive ${member.name}`}
          deleteConfirmMessage={`Archive ${member.name}? They'll be hidden from the public site but kept on record.`}
          showDelete={!member.is_archived}
          editLabel={`Edit ${member.name}`}
        />
      </div>
      {member.is_archived && (
        <AdminButton
          type="button"
          variant="secondary"
          onClick={() => restoreMember.mutate(member.id)}
          aria-label={`Restore ${member.name}`}
          className="shrink-0 px-3"
        >
          <RotateCcw size={15} aria-hidden="true" />
          <span className="hidden sm:inline">Restore</span>
        </AdminButton>
      )}
    </div>
  );
}

/* ------------------------------ photo strip ------------------------------ */

function GroupPhotoStrip({ group }: { group: CampusLifeGroup }) {
  const savePhoto = useSaveGroupPhoto();
  const deletePhoto = useDeleteGroupPhoto();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = MAX_GROUP_PHOTOS - group.photos.length;
    const batch = Array.from(files).slice(0, room);
    setError(null);
    setUploading(true);
    try {
      for (const file of batch) {
        const path = await uploadGroupPhoto(file, group.id);
        await savePhoto.mutateAsync({ groupId: group.id, storagePath: path, sortOrder: group.photos.length });
      }
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't upload one or more photos."));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-small font-semibold text-text-primary">Photos</h4>
        <AdminButton
          type="button"
          variant="secondary"
          onClick={() => fileInput.current?.click()}
          disabled={uploading || group.photos.length >= MAX_GROUP_PHOTOS}
        >
          <ImagePlus size={15} aria-hidden="true" />
          {uploading ? "Uploading…" : "Add Photos"}
        </AdminButton>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
          aria-label="Upload group photos"
        />
      </div>
      {group.photos.length === 0 ? (
        <p className="text-small text-text-secondary">No photos yet — add team or activity shots (up to {MAX_GROUP_PHOTOS}).</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {group.photos.map((photo) => (
            <figure key={photo.id} className="group relative">
              <img src={photo.url} alt={photo.caption ?? ""} loading="lazy" className="aspect-square w-full rounded-md border border-border object-cover" />
              <input
                defaultValue={photo.caption ?? ""}
                placeholder="Caption"
                aria-label={`Caption for photo`}
                onBlur={(e) => {
                  if (e.target.value !== (photo.caption ?? "")) {
                    savePhoto.mutate({ id: photo.id, groupId: group.id, storagePath: photo.storage_path, caption: e.target.value, sortOrder: photo.sort_order });
                  }
                }}
                className="mt-1 w-full rounded border border-border px-1.5 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => deletePhoto.mutate({ id: photo.id, storagePath: photo.storage_path })}
                aria-label="Delete photo"
                className="absolute right-1 top-1 rounded bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 size={13} aria-hidden="true" />
              </button>
            </figure>
          ))}
        </div>
      )}
      {error && <InlineNotice variant="error" message={error} className="mt-2" />}
    </div>
  );
}

/* ------------------------------ group card ------------------------------ */

function GroupCard({
  config,
  group,
  expanded,
  onToggle,
  onEdit,
}: {
  config: GroupSectionConfig;
  group: CampusLifeGroup;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const archiveGroup = useArchiveGroup();
  const restoreGroup = useRestoreGroup();
  const [memberModal, setMemberModal] = useState<GroupMemberRole | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const Icon = config.icon;

  const activeMembers = group.members.filter((m) => !m.is_archived);

  return (
    <div className={`rounded-lg border ${group.is_archived ? "border-dashed border-border bg-background/50" : "border-border bg-surface"}`}>
      <div className="flex items-center gap-3 p-3">
        {group.cover_image_url ? (
          <img src={group.cover_image_url} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover ring-1 ring-border" />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 ring-1 ring-border">
            <Icon size={20} className="text-primary" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-small font-semibold text-text-primary">
            {group.name}
            {group.is_archived && <span className="ml-2 rounded-full bg-status-warning-bg px-2 py-0.5 text-[11px] font-medium text-status-warning-text">Archived</span>}
          </p>
          <p className="text-small text-text-secondary">
            {activeMembers.length} member{activeMembers.length === 1 ? "" : "s"} · {group.photos.length} photo{group.photos.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!group.is_archived && (
            <AdminButton type="button" variant="secondary" onClick={onEdit} className="px-3">
              Edit
            </AdminButton>
          )}
          {group.is_archived ? (
            <AdminButton type="button" variant="secondary" onClick={() => restoreGroup.mutate(group.id)} className="px-3">
              <RotateCcw size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Restore</span>
            </AdminButton>
          ) : (
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => {
                if (window.confirm(`Archive ${group.name}? It and its members will be hidden from the public site.`)) {
                  archiveGroup.mutate(group.id);
                }
              }}
              className="px-3"
            >
              Archive
            </AdminButton>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={expanded ? `Collapse ${group.name}` : `Expand ${group.name}`}
            className="rounded-md p-2 text-text-secondary hover:bg-background"
          >
            <ChevronDown size={18} aria-hidden="true" className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-5 border-t border-border p-4">
          {group.description && <p className="text-small text-text-secondary">{group.description}</p>}

          {config.roleOrder.map((role) => {
            const roleMembers = group.members.filter((m) => m.role === role);
            return (
              <div key={role}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="text-small font-semibold text-text-primary">
                    {ROLE_GROUP_LABELS[role]}
                    <span className="ml-1.5 font-normal text-text-secondary">({roleMembers.filter((m) => !m.is_archived).length})</span>
                  </h4>
                  <AdminButton type="button" variant="secondary" onClick={() => setMemberModal(role)} className="px-3">
                    <Plus size={14} aria-hidden="true" />
                    {config.roles[role].addLabel}
                  </AdminButton>
                </div>
                {roleMembers.length === 0 ? (
                  <p className="text-small text-text-secondary">None added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {roleMembers.map((member) => (
                      <MemberRow key={member.id} member={member} config={config} onAddPhotoError={setPhotoError} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {photoError && <InlineNotice variant="error" message={photoError} />}

          <GroupPhotoStrip group={group} />
        </div>
      )}

      {memberModal && <MemberFormModal config={config} groupId={group.id} role={memberModal} onClose={() => setMemberModal(null)} />}
    </div>
  );
}

/* ------------------------------ manager ------------------------------ */

export function CampusLifeGroupManager({ config, sectionId }: { config: GroupSectionConfig; sectionId: string }) {
  const { data: groups, isLoading, isError, error, refetch, isFetching } = useCampusLifeGroups(config.slug, { admin: true });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [groupModal, setGroupModal] = useState<{ group?: CampusLifeGroup } | null>(null);

  if (isLoading) return <AdminListSkeleton rows={3} />;
  if (isError || !groups) {
    return <AdminErrorState error={error} message="We couldn't load this section's groups." onRetry={() => void refetch()} retrying={isFetching} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-small text-text-secondary">
          {groups.length === 0
            ? `No ${config.groupNoun.toLowerCase()}s yet.`
            : `${groups.length} ${config.groupNoun.toLowerCase()}${groups.length === 1 ? "" : "s"}`}
        </p>
        <AdminButton type="button" onClick={() => setGroupModal({})}>
          <Plus size={15} aria-hidden="true" />
          Add {config.groupNoun}
        </AdminButton>
      </div>

      {groups.length === 0 && (
        <AdminEmptyState
          icon={config.icon}
          title={config.emptyTitle}
          description={`Create the first ${config.groupNoun.toLowerCase()}, then add its members and photos.`}
          action={
            <AdminButton type="button" onClick={() => setGroupModal({})}>
              <Plus size={15} aria-hidden="true" />
              Add {config.groupNoun}
            </AdminButton>
          }
        />
      )}

      <div className="space-y-3">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            config={config}
            group={group}
            expanded={expandedId === group.id}
            onToggle={() => setExpandedId((prev) => (prev === group.id ? null : group.id))}
            onEdit={() => setGroupModal({ group })}
          />
        ))}
      </div>

      {groupModal && (
        <GroupFormModal
          config={config}
          sectionId={sectionId}
          group={groupModal.group}
          onClose={() => setGroupModal(null)}
        />
      )}
    </div>
  );
}

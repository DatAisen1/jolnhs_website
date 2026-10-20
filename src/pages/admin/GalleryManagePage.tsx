import { useRef, useState } from "react";
import { ImagePlus, Images, Save } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminErrorState, AdminListSkeleton } from "@/components/admin/AdminStates";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { SectionTabs } from "@/pages/admin/SectionTabs";
import { getErrorMessage } from "@/lib/errors";
import {
  galleryPhotoUrl,
  uploadGalleryPhoto,
  useAdminGalleryPhotos,
  useDeleteGalleryPhoto,
  useSaveGalleryPhoto,
  type GalleryPhoto,
} from "@/lib/data/gallery";
import { campusLifeSections } from "@/data/campusLife";

const fieldClass =
  "w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-small text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function PhotoCard({ photo }: { photo: GalleryPhoto }) {
  const save = useSaveGalleryPhoto();
  const remove = useDeleteGalleryPhoto();
  const [caption, setCaption] = useState(photo.caption ?? "");
  const [error, setError] = useState<string | null>(null);
  const dirty = caption !== (photo.caption ?? "");

  async function handleSave() {
    setError(null);
    try {
      await save.mutateAsync({
        id: photo.id,
        sectionSlug: photo.section_slug,
        title: photo.title ?? undefined,
        caption,
        storagePath: photo.storage_path,
        sortOrder: photo.sort_order,
      });
    } catch (e) {
      setError(getErrorMessage(e, "Could not save caption."));
    }
  }

  return (
    <AdminCard className="overflow-hidden p-0">
      <div className="aspect-[4/3] w-full overflow-hidden bg-background">
        <img
          src={galleryPhotoUrl(photo.storage_path) ?? ""}
          alt={photo.caption ?? "Gallery photo"}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-2 p-3">
        {error && <p className="text-[12px] text-status-error-text">{error}</p>}
        <label className="sr-only" htmlFor={`cap-${photo.id}`}>Caption</label>
        <input
          id={`cap-${photo.id}`}
          className={fieldClass}
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <div className="flex items-center justify-between gap-2">
          <ConfirmButton
            label={`Delete photo${photo.caption ? ` "${photo.caption}"` : ""}`}
            confirmMessage="Delete this photo?"
            onConfirm={() => remove.mutate({ id: photo.id, storagePath: photo.storage_path })}
          />
          {dirty && (
            <AdminButton type="button" className="min-h-8 px-2.5 py-1" onClick={handleSave} loading={save.isPending}>
              <Save size={14} aria-hidden="true" /> Save
            </AdminButton>
          )}
        </div>
      </div>
    </AdminCard>
  );
}

export function GalleryManagePage() {
  const [section, setSection] = useState<string>(campusLifeSections[0]?.slug ?? "general");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: photos, isLoading, isError, error, refetch } = useAdminGalleryPhotos(section);
  const save = useSaveGalleryPhoto();

  async function handleFiles(files: FileList) {
    setUploadError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const path = await uploadGalleryPhoto(file);
        await save.mutateAsync({ sectionSlug: section, storagePath: path });
      }
    } catch (e) {
      setUploadError(getErrorMessage(e, "Upload failed. Try a smaller JPEG/PNG/WebP image."));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        title="Gallery"
        description="Upload event photos for each Campus Life section. Photos appear on that section's public page."
        action={
          <AdminButton onClick={() => fileInputRef.current?.click()} loading={uploading}>
            <ImagePlus size={16} aria-hidden="true" /> Upload photos
          </AdminButton>
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        aria-label="Upload gallery photos"
      />

      <SectionTabs
        tabs={[...campusLifeSections.map((s) => ({ slug: s.slug, label: s.name })), { slug: "general", label: "General" }]}
        activeTab={section}
        onTabChange={setSection}
      />

      {uploadError && (
        <p className="mb-4 rounded-md border border-status-error bg-status-error-bg px-4 py-3 text-small text-status-error-text">
          {uploadError}
        </p>
      )}

      {isLoading && <AdminListSkeleton rows={2} />}
      {isError && <AdminErrorState error={error} onRetry={() => refetch()} />}

      {photos && photos.length === 0 && (
        <AdminEmptyState
          icon={Images}
          title="No photos in this section"
          description="Upload photos to fill this section's gallery on the public site. JPG, PNG or WebP up to 5 MB each."
          action={
            <AdminButton onClick={() => fileInputRef.current?.click()}>
              <ImagePlus size={16} aria-hidden="true" /> Upload photos
            </AdminButton>
          }
        />
      )}

      {photos && photos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => <PhotoCard key={p.id} photo={p} />)}
        </div>
      )}
    </div>
  );
}

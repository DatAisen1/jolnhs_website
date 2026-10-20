import { GalleryGrid } from "@/components/campusLife/GalleryGrid";
import { galleryPhotoUrl, useGalleryPhotos } from "@/lib/data/gallery";
import type { CampusLifeGalleryItem } from "@/types";

/**
 * SectionPhotoGallery — the admin-uploaded gallery for a campus-life
 * section. Maps `gallery_photos` rows (migration 0013) into the same
 * CampusLifeGalleryItem shape GalleryGrid already renders; an empty
 * result falls through to GalleryGrid's own "coming soon" state, so
 * nothing changes on pages that have no uploaded photos yet.
 */
export function SectionPhotoGallery({ slug, columns }: { slug: string; columns?: 2 | 3 | 4 }) {
  const { data: photos } = useGalleryPhotos(slug);

  const items: CampusLifeGalleryItem[] = (photos ?? [])
    .map((p) => ({
      src: galleryPhotoUrl(p.storage_path) ?? undefined,
      label: p.caption || p.title || "Campus life photo",
      imageSize: "800×600",
    }))
    .filter((item): item is CampusLifeGalleryItem & { src: string } => !!item.src);

  return <GalleryGrid items={items} columns={columns} />;
}

import { GalleryGrid } from "@/components/campusLife/GalleryGrid";
import { MasonryGallery } from "@/components/campusLife/MasonryGallery";
import { galleryPhotoUrl, useGalleryPhotos } from "@/lib/data/gallery";
import type { CampusLifeGalleryItem } from "@/types";

/**
 * SectionPhotoGallery — the admin-uploaded gallery for a campus-life
 * section. Maps `gallery_photos` rows (migration 0013) into the same
 * CampusLifeGalleryItem shape GalleryGrid already renders; an empty
 * result falls through to GalleryGrid's own "coming soon" state, so
 * nothing changes on pages that have no uploaded photos yet.
 *
 * `layout="masonry"` switches to the Pinterest-style wall (natural
 * aspect ratios, columns instead of rows) — used by the Gallery
 * section page where the wall IS the content, while other sections
 * keep the uniform 4:3 grid as a supporting band.
 */
export function SectionPhotoGallery({
  slug,
  columns,
  layout = "grid",
}: {
  slug: string;
  columns?: 2 | 3 | 4;
  layout?: "grid" | "masonry";
}) {
  const { data: photos } = useGalleryPhotos(slug);

  const withSrc = (photos ?? [])
    .map((p) => ({
      src: galleryPhotoUrl(p.storage_path) ?? undefined,
      label: p.caption || p.title || "Campus life photo",
      caption: p.caption || p.title || undefined,
      imageSize: "800×600",
    }))
    .filter((item): item is typeof item & { src: string } => !!item.src);

  if (layout === "masonry") {
    return <MasonryGallery items={withSrc.map((i) => ({ src: i.src, alt: i.label, caption: i.caption }))} />;
  }

  const items: CampusLifeGalleryItem[] = withSrc;
  return <GalleryGrid items={items} columns={columns} />;
}

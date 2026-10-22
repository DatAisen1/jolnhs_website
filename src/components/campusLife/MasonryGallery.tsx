import { motion, useReducedMotion } from "framer-motion";
import { GalleryComingSoon } from "./GalleryComingSoon";
import { scaleIn, staggerContainer, viewportOnce } from "@/lib/motion";

export interface MasonryItem {
  src: string;
  alt: string;
  /** Optional caption shown under the pin — omitted when not provided. */
  caption?: string;
}

/**
 * MasonryGallery — the Pinterest-style photo wall for the "Gallery"
 * campus-life section.
 *
 * Every pin is full column-width with height left to the photo's own
 * aspect ratio: portrait shots drop tall, landscapes stay wide, squares
 * sit in between — the varied sizes come free from the images
 * themselves, so admins just upload photos and never configure tiles.
 *
 * CSS `columns-*` does the layout with zero JS. `break-inside-avoid`
 * keeps a pin from splitting across a column break. Items flow down
 * column-by-column (same ordering Pinterest uses); sort_order still
 * controls the sequence within each column.
 */
export function MasonryGallery({ items }: { items: MasonryItem[] }) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";

  if (items.length === 0) return <GalleryComingSoon />;

  return (
    <motion.div
      variants={staggerContainer}
      initial={initial}
      whileInView="show"
      viewport={viewportOnce}
      className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4"
    >
      {items.map((item) => (
        <motion.figure
          key={item.src}
          variants={scaleIn}
          className="mb-5 break-inside-avoid overflow-hidden rounded-card border border-border bg-surface"
        >
          <img src={item.src} alt={item.alt} loading="lazy" className="w-full" />
          {item.caption && (
            <figcaption className="px-3.5 py-2.5 text-small text-text-secondary">
              {item.caption}
            </figcaption>
          )}
        </motion.figure>
      ))}
    </motion.div>
  );
}

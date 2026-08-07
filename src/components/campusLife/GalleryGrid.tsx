import { motion, useReducedMotion } from "framer-motion";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { scaleIn, staggerContainer, viewportOnce } from "@/lib/motion";
import type { CampusLifeGalleryItem } from "@/types";

/**
 * GalleryGrid
 *
 * WHAT: A responsive grid of photo tiles (via ImagePlaceholder — see
 *       that component's own doc comment on the zero-external-images
 *       rule).
 * WHY:  One reusable grid instead of hand-rolling the column/gap classes
 *       on both the Campus Life landing page (a 4-photo teaser) and
 *       every section detail page (a fuller gallery) — same "define
 *       once, reuse everywhere" reasoning as every other shared
 *       component in this codebase.
 * WHEN: Any place a set of CampusLifeGalleryItem should render as a
 *       photo wall. `columns` is optional — omit it and the grid picks
 *       its own density from item count (>4 items -> 3 cols, else 2);
 *       pass an explicit value to override (e.g. 4 for a compact
 *       landing-page teaser).
 */
export function GalleryGrid({
  items,
  columns,
}: {
  items: CampusLifeGalleryItem[];
  columns?: 2 | 3 | 4;
}) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";

  // No explicit density passed in — pick it from item count so every call
  // site doesn't have to re-derive the same "more items = more columns"
  // rule (e.g. section detail pages with a big vs. small gallery).
  const resolvedColumns = columns ?? (items.length > 4 ? 3 : 2);

  const colsClass =
    resolvedColumns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : resolvedColumns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2";

  return (
    <motion.div
      variants={staggerContainer}
      initial={initial}
      whileInView="show"
      viewport={viewportOnce}
      className={`grid grid-cols-1 gap-6 ${colsClass}`}
    >
      {items.map((item) => (
        <motion.div key={item.label} variants={scaleIn}>
          <ImagePlaceholder
            alt={item.label}
            label={item.label}
            recommendedSize={item.imageSize}
            className="aspect-[4/3] min-h-0"
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { scaleIn, fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import type { ProgramPhoto } from "@/types";

interface ProgramPhotoGalleryProps {
  programName: string;
  photos: ProgramPhoto[];
}

/**
 * ProgramPhotoGallery
 *
 * A strip of program-life photos on /academics/:slug, under "What You'll
 * Learn". Slots render in order; a slot without a `src` shows a dashed
 * ImagePlaceholder in dev only (so the owner can see where each photo
 * goes), and is hidden entirely in production — if every slot is empty,
 * the whole section collapses away instead of publishing placeholder UI.
 */
export function ProgramPhotoGallery({ programName, photos }: ProgramPhotoGalleryProps) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";
  const showPlaceholders = import.meta.env.DEV;

  const visible = showPlaceholders ? photos : photos.filter((photo) => photo.src);
  if (visible.length === 0) return null;

  return (
    <section aria-label={`${programName} photos`} className="bg-surface py-section-sm md:py-section">
      <Container>
        <motion.h2
          variants={fadeUp}
          initial={initial}
          whileInView="show"
          viewport={viewportOnce}
          className="text-section text-text-primary"
        >
          Life in {programName}
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          initial={initial}
          whileInView="show"
          viewport={viewportOnce}
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((photo) => (
            <motion.figure key={photo.alt} variants={scaleIn}>
              <div className="group aspect-[4/3] overflow-hidden rounded-card">
                <ImagePlaceholder
                  alt={photo.alt}
                  label={`Insert ${programName} Photo`}
                  recommendedSize="800 x 600"
                  src={photo.src}
                  className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              {photo.caption && (photo.src || showPlaceholders) && (
                <figcaption className="mt-3 text-center text-small text-text-secondary">
                  {photo.caption}
                </figcaption>
              )}
            </motion.figure>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

import { ImageIcon } from "lucide-react";

interface ImagePlaceholderProps {
  label: string;
  recommendedSize: string;
  className?: string;
  /** Alt text the real <img> uses once `src` is supplied — required so
   *  accessibility is never an afterthought when the photo lands. */
  alt: string;
  /** When set, renders the real photo instead of the placeholder box.
   *  Every "insert photo here" slot on the site routes through this one
   *  prop — the swap to real imagery is a data change, not a redesign. */
  src?: string;
}

/**
 * ImagePlaceholder
 *
 * WHAT: Renders a gray placeholder box in place of any real image —
 *       or the image itself once `src` is provided.
 * WHY:  The brief required zero external images at first. Every "image"
 *       in the design routes through this ONE component instead of
 *       scattering ad-hoc gray <div>s across every section — so swapping
 *       in a real asset is a one-line prop change per slot.
 * WHEN: Any spot in the design that will eventually hold a photo.
 * WHEN NOT: Icons or decorative graphics that aren't "insert a photo
 *           here" placeholders — use lucide-react icons directly.
 */
export function ImagePlaceholder({
  label,
  recommendedSize,
  className = "",
  alt,
  src,
}: ImagePlaceholderProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex min-h-[240px] w-full flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-border bg-background text-center ${className}`}
    >
      <ImageIcon className="h-10 w-10 text-text-secondary/60 motion-safe:animate-pulse" aria-hidden="true" />
      <p className="text-small font-medium text-text-secondary">{label}</p>
      <p className="text-small text-text-secondary/60">
        Recommended size: {recommendedSize}
      </p>
    </div>
  );
}

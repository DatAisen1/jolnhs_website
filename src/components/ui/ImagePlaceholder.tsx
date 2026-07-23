import { ImageIcon } from "lucide-react";

interface ImagePlaceholderProps {
  label: string;
  recommendedSize: string;
  className?: string;
  /** Alt text that a real <img> would eventually use — kept here so
   *  swapping in the real asset later is a one-line change. */
  alt: string;
}

/**
 * ImagePlaceholder
 *
 * WHAT: Renders a gray placeholder box in place of any real image.
 * WHY:  The brief requires zero external images. Every "image" in the
 *       design routes through this ONE component instead of scattering
 *       ad-hoc gray <div>s across every section — when real assets are
 *       ready, only this component (or its call sites' props) changes.
 * WHEN: Any spot in the design that will eventually hold a photo.
 * WHEN NOT: Icons or decorative graphics that aren't "insert a photo here"
 *           placeholders — use lucide-react icons directly for those.
 *
 * The `alt` prop is required (not optional) so accessibility is never an
 * afterthought once a real <img> replaces this component.
 */
export function ImagePlaceholder({
  label,
  recommendedSize,
  className = "",
  alt,
}: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex min-h-[240px] w-full flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-slate-300 bg-slate-100 text-center ${className}`}
    >
      <ImageIcon className="h-10 w-10 text-slate-400" aria-hidden="true" />
      <p className="text-small font-medium text-slate-500">{label}</p>
      <p className="text-small text-slate-400">
        Recommended size: {recommendedSize}
      </p>
    </div>
  );
}

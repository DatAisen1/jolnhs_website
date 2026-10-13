import type { ReactNode } from "react";

interface SkeletonGridProps {
  /** How many placeholder cards to render. */
  count?: number;
  /** Aspect class for the image block — "aspect-[4/5]" for portraits,
   * "aspect-[16/9]" for photos, or "" for text-only cards. */
  imageAspect?: string;
  /** Grid classes — should mirror the real content grid so the layout
   * doesn't shift when data arrives. */
  gridClassName?: string;
  /** Extra body lines inside each card (title line is always drawn). */
  bodyLines?: ReactNode;
}

/**
 * SkeletonGrid — pulse-loading placeholders shaped like the real cards.
 *
 * A bare spinner (PageStatus loading) makes the page feel "stalled";
 * skeletons that match the real grid tell the visitor WHERE content
 * will land, so perceived wait drops even at identical load times —
 * the pattern Facebook/LinkedIn/YouTube all use. Mirrors each page's
 * own grid classes so nothing shifts when real data swaps in.
 */
export function SkeletonGrid({
  count = 6,
  imageAspect = "aspect-[4/5]",
  gridClassName = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  bodyLines,
}: SkeletonGridProps) {
  return (
    <div role="status" aria-label="Loading content" className={`grid gap-6 ${gridClassName}`}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-card border border-border bg-white"
          aria-hidden="true"
        >
          {imageAspect && <div className={`${imageAspect} w-full bg-primary-100/70`} />}
          <div className="space-y-2.5 p-5">
            <div className="h-4 w-2/3 rounded-full bg-primary-100/70" />
            <div className="h-3 w-1/2 rounded-full bg-primary-100/60" />
            {bodyLines ?? <div className="h-3 w-5/6 rounded-full bg-primary-100/50" />}
          </div>
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

interface SkeletonRowsProps {
  count?: number;
}

/**
 * SkeletonRows — the list/table sibling of SkeletonGrid. Full-width
 * pulsing bars for data that renders as rows (budget categories,
 * allocation shares, accomplishment items) rather than a card grid.
 */
export function SkeletonRows({ count = 4 }: SkeletonRowsProps) {
  return (
    <div role="status" aria-label="Loading content" className="flex flex-col gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4">
          <div className="h-10 w-10 shrink-0 rounded-full bg-primary-100/70" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded-full bg-primary-100/70" />
            <div className="h-3 w-2/3 rounded-full bg-primary-100/50" />
          </div>
          <div className="h-4 w-16 shrink-0 rounded-full bg-primary-100/60" aria-hidden="true" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

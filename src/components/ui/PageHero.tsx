import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { SchoolBadge } from "@/components/ui/SchoolBadge";
import { heroChild, heroReveal } from "@/lib/motion";

interface PageHeroPhoto {
  /** Alt text the real photo uses. */
  alt: string;
  /** Placeholder label shown until a real photo is supplied. */
  label: string;
  recommendedSize: string;
  /** Real photo URL — renders instead of the placeholder when set. */
  src?: string;
}

interface PageHeroProps {
  /** Small uppercase label above the heading (e.g. section breadcrumb name). */
  eyebrow?: string;
  title: string;
  description?: string;
  /**
   * Photo variant: renders the standard image placeholder behind the
   * overlay until a real asset replaces it. Mutually exclusive with
   * `watermarkIcon`.
   */
  photo?: PageHeroPhoto;
  /**
   * Icon variant: a large, faint watermark icon top-right instead of a
   * photo — for concepts with no physical subject to photograph
   * (curriculum tracks, Campus Life sections).
   */
  watermarkIcon?: LucideIcon;
  /**
   * `flat` (default): a uniform primary/60 scrim.
   * `gradient`: a top-to-bottom depth gradient — use when a hero needs a
   * little extra separation between headline and imagery (Budget).
   */
  overlayVariant?: "flat" | "gradient";
  /**
   * Optional school crest rendered centered above the title — the
   * seal-above-heading treatment used on identity pages (About).
   */
  logoSrc?: string;
}

/**
 * PageHero
 *
 * The single navy hero band used at the top of every interior page.
 * Previously each page hand-rolled the same
 * `min-h-[320px] bg-primary-700 + placeholder + scrim + centered white
 * type` block — seven near-identical copies that could drift apart.
 * One component keeps every interior page's first impression identical
 * and makes a future design tweak a one-line change.
 *
 * Not for the homepage — HeroBanner is its own full-bleed video hero.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  photo,
  watermarkIcon: WatermarkIcon,
  overlayVariant = "flat",
  logoSrc,
}: PageHeroProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-primary-700 py-16 sm:min-h-[400px]">
      {photo ? (
        <>
          <ImagePlaceholder
            alt={photo.alt}
            label={photo.label}
            recommendedSize={photo.recommendedSize}
            src={photo.src}
            className="absolute inset-0 h-full rounded-none border-none bg-primary-700 text-secondary-100"
          />
          {overlayVariant === "gradient" ? (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-900/75 via-primary/60 to-primary-700/70" />
          ) : (
            <div className="pointer-events-none absolute inset-0 bg-primary/60" />
          )}
        </>
      ) : WatermarkIcon ? (
        /* Slow ambient drift on the watermark — enough to feel alive
           next to the entrance stagger, quiet enough not to compete
           with the headline. Frozen under prefers-reduced-motion. */
        <motion.div
          className="pointer-events-none absolute -right-8 -top-8"
          animate={shouldReduceMotion ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <WatermarkIcon
            className="h-64 w-64 text-white/10 sm:h-80 sm:w-80"
            aria-hidden="true"
            strokeWidth={1}
          />
        </motion.div>
      ) : null}

      {/* Same eyebrow→title→description stagger as the homepage hero —
          interior pages compose the same way instead of appearing as one
          static block. */}
      <motion.div
        variants={heroReveal}
        initial={shouldReduceMotion ? "show" : "hidden"}
        animate="show"
        className="relative px-6 text-center text-white"
      >
        {logoSrc ? (
          <motion.div variants={heroChild} className="mb-5 flex justify-center">
            <div className="rounded-full bg-white/10 p-1.5 ring-1 ring-white/25">
              <SchoolBadge
                label="JO"
                ariaLabel="JOLNHS school seal"
                size={72}
                src={logoSrc}
              />
            </div>
          </motion.div>
        ) : null}
        {eyebrow ? (
          <motion.p
            variants={heroChild}
            className="mb-3 text-small font-semibold uppercase tracking-[0.18em] text-secondary-light"
          >
            {eyebrow}
          </motion.p>
        ) : null}
        <motion.h1 variants={heroChild} className="text-heading sm:text-hero">
          {title}
        </motion.h1>
        {description ? (
          <motion.p variants={heroChild} className="mx-auto mt-4 max-w-2xl text-body text-secondary-100">
            {description}
          </motion.p>
        ) : null}
      </motion.div>
    </section>
  );
}

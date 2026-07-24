import { useRef, type RefObject } from "react";
import { useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";

interface UseParallaxResult {
  ref: RefObject<HTMLDivElement>;
  y: MotionValue<number>;
}

/**
 * useParallax
 *
 * WHAT: Returns a scroll-linked `y` motion value that drifts a background
 *       image at a different rate than the page scroll, plus the ref that
 *       defines the scroll range it tracks.
 * WHY:  A background image that moves slightly slower/faster than the
 *       foreground content reads as depth rather than a flat photo —
 *       classic parallax, done with GPU-accelerated transforms (not
 *       scroll-jank-prone `background-position` tricks).
 * WHEN: Full-bleed BACKGROUND photography meant to set atmosphere (hero,
 *       a section's dimmed backdrop image).
 * WHEN NOT: Content photography that IS the point (a facility photo, a
 *       program photo) — moving those independently of their caption
 *       text looks like a bug, not a feature, since image and label need
 *       to stay visually paired.
 *
 * Respects prefers-reduced-motion: when the user has that OS setting on,
 * the transform range collapses to [0, 0] — same image, zero motion —
 * rather than skipping the hook (which would change the DOM structure
 * conditionally, a React anti-pattern).
 */
export function useParallax(distance = 80): UseParallaxResult {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const range = prefersReducedMotion ? [0, 0] : [-distance, distance];
  const y = useTransform(scrollYProgress, [0, 1], range);

  return { ref, y };
}

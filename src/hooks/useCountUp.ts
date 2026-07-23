import { useEffect, useRef, useState } from "react";

/**
 * useCountUp
 *
 * WHAT: Animates a number from 0 to a target value.
 * WHY:  Static numbers in a stats section are easy to skim past; a brief
 *       count-up draws attention to key figures (students, teachers, etc.)
 *       without being a distracting, endless animation.
 * WHEN: Small, standalone statistics displayed once (hero stats, counters).
 * WHEN NOT: Frequently-updating values (live dashboards) — re-triggering
 *           this animation on every update would be distracting, not helpful.
 *
 * Only starts counting once the element scrolls into view (IntersectionObserver),
 * and only runs once — it does not re-animate on every scroll past the section.
 */
export function useCountUp(target: number, durationMs = 1500) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();

          const step = (now: number) => {
            const progress = Math.min((now - startTime) / durationMs, 1);
            // ease-out for a natural deceleration near the target
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };

          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target, durationMs]);

  return { value, ref };
}

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { appleEase } from "@/lib/motion";

interface AnimatedNumberProps {
  /** Display string like "18+", "₱1,250,000", or "95%". */
  value: string;
  className?: string;
}

// Splits a display string into prefix / digits / suffix so the numeric
// part can count up while units ("+", "%", "₱") stay fixed.
const VALUE_PATTERN = /^([^\d]*)([\d,]+(?:\.\d+)?)([\s\S]*)$/;

function looksLikeYear(numStr: string, prefix: string, suffix: string): boolean {
  // A bare 4-digit number with no unit marker (%, +, currency) reads as
  // a year ("SY 2024–2025") — counting 0→2024 looks gimmicky, not
  // informative, so those render statically.
  return /^\d{4}$/.test(numStr) && !/[%+]/.test(suffix) && !/[$₱€£]/.test(prefix);
}

/**
 * AnimatedNumber
 *
 * Counts a stat's numeric portion from 0 up to its real value the first
 * time it scrolls into view (CommunityStats, BudgetStatsBand). Strings
 * that aren't simple numbers — or look like years — render unchanged.
 * Honors prefers-reduced-motion by showing the final value immediately.
 */
export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();

  const match = value.match(VALUE_PATTERN);
  const [, prefix = "", numStr = "", suffix = ""] = match ?? [];
  const target = match ? parseFloat(numStr.replace(/,/g, "")) : NaN;
  const shouldAnimate =
    Boolean(match) && !looksLikeYear(numStr, prefix, suffix) && !reduceMotion;

  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (v) => {
    const formatted = Number.isInteger(target)
      ? Math.round(v).toLocaleString("en-US")
      : v.toFixed(1);
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    if (!shouldAnimate) {
      motionValue.set(target);
      return;
    }
    // Stay at 0 until the number scrolls into view — setting the final
    // value here would display it immediately with no count-up at all.
    if (!inView) return;
    const controls = animate(motionValue, target, {
      duration: 1.4,
      ease: appleEase,
    });
    return () => controls.stop();
  }, [inView, shouldAnimate, target, motionValue]);

  if (!shouldAnimate) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  return (
    <motion.span ref={ref} className={className} aria-label={value}>
      {display}
    </motion.span>
  );
}

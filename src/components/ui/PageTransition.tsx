import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { appleEase } from "@/lib/motion";
import { SchoolBadge } from "@/components/ui/SchoolBadge";

/**
 * PageTransition — a branded curtain reveal on every route change.
 *
 * WHAT: Wraps <Outlet/>. Keyed on `pathname`, so each navigation mounts:
 *   1. A full-screen navy curtain, briefly covering everything, that
 *      slides up and off — the school seal sits centered while it lifts.
 *   2. The new page underneath, which fades + rises into the gap the
 *      curtain leaves. Both ride the same expo-out curve as every other
 *      reveal on the site.
 * WHY:  The pure fade+rise was so quick it was easy to miss; a short
 *       curtain makes navigation read as a deliberate page transition
 *       without needing AnimatePresence + a frozen <Outlet> snapshot —
 *       the old page swaps instantly under the curtain (invisible),
 *       and only the new page animates. It also masks the first paint
 *       of heavier pages while their images decode.
 * WHEN NOT: Same-pathname hash jumps (the Budget section nav) don't
 *       change `pathname`, so no remount — correctly no curtain there.
 *       prefers-reduced-motion skips the curtain and shows content
 *       instantly.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {/* The curtain MUST be a sibling of the animated content wrapper:
          the wrapper's transform would otherwise re-anchor
          position:fixed to itself, stretching the curtain across the
          whole document instead of the viewport. A beat under ~700ms
          total, so fast navigators never feel held back — the curtain
          is a reveal flourish, not a loading gate. */}
      {!shouldReduceMotion && (
        <motion.div
          key={pathname}
          aria-hidden="true"
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          transition={{ duration: 0.55, ease: appleEase, delay: 0.06 }}
          className="pointer-events-none fixed inset-0 z-[2000] flex items-center justify-center bg-gradient-to-b from-primary-700 via-primary-700 to-primary-800"
        >
          {/* Brand-gradient sliver at the trailing edge — the curtain
              leaves with the same 3px brand detail the footer starts with. */}
          <SchoolBadge
            label="JO"
            ariaLabel="JOLNHS crest"
            size={72}
            src="/images/logo-jolnhs.png"
          />
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-primary-400 via-secondary-300 to-primary-400" />
        </motion.div>
      )}
      <motion.div
        key={pathname + "-content"}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: appleEase, delay: shouldReduceMotion ? 0 : 0.18 }}
      >
        {children}
      </motion.div>
    </>
  );
}

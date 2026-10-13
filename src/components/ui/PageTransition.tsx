import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { appleEase } from "@/lib/motion";

/**
 * PageTransition — one entrance animation for every route change.
 *
 * WHAT: Wraps <Outlet/>. Keyed on `pathname`, so each navigation mounts
 *       a fresh div that fades + rises into view on the same expo-out
 *       curve every other reveal on the site uses.
 * WHY:  Now that all internal nav goes through <Link> (client-side route
 *       swaps), pages appeared with a hard cut — the one moment the app
 *       still felt like a page reload. A quick entrance makes the swap
 *       read as a deliberate transition. Entrance-only by design: exit
 *       animations would need a frozen <Outlet> snapshot (AnimatePresence
 *       + useOutlet), doubling render complexity for ~200ms of benefit.
 * WHEN NOT: Same-pathname hash jumps (the Budget section nav) don't
 *       change `pathname`, so no remount — correctly no flash there.
 *       prefers-reduced-motion skips the transform entirely.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: appleEase }}
    >
      {children}
    </motion.div>
  );
}

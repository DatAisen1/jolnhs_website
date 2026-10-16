import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { appleEase } from "@/lib/motion";
import { academicPrograms } from "@/data/academics";
import { campusLifeSections } from "@/data/campusLife";
import { Container } from "@/components/ui/Container";

/** Big display name the curtain shows for each destination — deriving it
 *  from route data (program names, section names) keeps it in sync when
 *  programs or campus-life sections are renamed. */
function routeLabel(pathname: string): string {
  const canonical = pathname === "/" ? "/" : `/${pathname.replace(/\/+$/, "").slice(1)}`;

  const staticLabels: Record<string, string> = {
    "/": "Welcome",
    "/about": "About JOLNHS",
    "/about/overview": "About JOLNHS",
    "/about/faculty-staff": "Faculty & Staff",
    "/academics": "Academic Programs",
    "/campus-life": "Campus Life",
    "/budget": "Budget",
    "/contact": "Contact Us",
    "/privacy-policy": "Data Privacy",
    "/cookie-policy": "Cookie Policy",
  };
  if (staticLabels[canonical]) return staticLabels[canonical];
  if (canonical.startsWith("/admin")) return "Admin Panel";

  const programMatch = canonical.match(/^\/academics\/([a-z0-9-]+)$/);
  if (programMatch) {
    const program = academicPrograms.find((p) => p.slug === programMatch[1]);
    if (program) return program.name;
  }

  const sectionMatch = canonical.match(/^\/campus-life\/([a-z0-9-]+)$/);
  if (sectionMatch) {
    const section = campusLifeSections.find((s) => s.slug === sectionMatch[1]);
    if (section) return section.name;
  }

  return "Welcome";
}

/**
 * PageTransition — a typographic curtain reveal on every route change,
 * in the style of virugroup.com: a solid brand panel covers the screen,
 * announces the destination in huge display type with a quiet
 * "(Loading)" micro-detail, then sweeps upward off-screen while the new
 * page fades and rises into the gap.
 *
 * WHAT: Wraps <Outlet/>. Keyed on `pathname`, so each navigation mounts
 *   1. A full-screen navy curtain: destination name bottom-left in
 *      Playfair, "(Loading)" top-left, brand sliver trailing the edge.
 *   2. The curtain lifts away (~0.6s, apple ease) after a readable beat,
 *      revealing the page beneath with its own fade+rise.
 * WHY:  A plain fade was easy to miss; the typographic panel makes
 *       navigation feel like turning a section divider in a book. No
 *       AnimatePresence / frozen <Outlet> — the old route swaps under
 *       the already-covering panel, only the new page animates.
 * LAYOUT: The curtain MUST be a sibling of the animated content wrapper
 *       — a transformed ancestor would re-anchor position:fixed to
 *       itself, stretching the overlay across the whole document.
 * A11Y: pointer-events-none + aria-hidden; same-pathname hash jumps
 *       (Budget section nav) don't remount; reduced-motion skips the
 *       curtain entirely.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {!shouldReduceMotion && (
        <motion.div
          key={pathname}
          aria-hidden="true"
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          transition={{ duration: 0.6, ease: appleEase, delay: 0.7 }}
          className="pointer-events-none fixed inset-0 z-[2000] flex flex-col justify-between overflow-hidden bg-primary-800"
        >
          {/* The word rides the curtain with its own slight extra travel,
              so it feels set INTO the panel rather than stickered on it. */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: "-16%" }}
            transition={{ duration: 0.6, ease: appleEase, delay: 0.7 }}
            className="flex h-full flex-col justify-between py-8"
          >
            <Container className="w-full">
              <p className="text-small font-medium uppercase tracking-[0.18em] text-white/45">
                (Loading)
              </p>
            </Container>

            <Container className="w-full">
              <p className="mb-3 text-small font-semibold uppercase tracking-[0.22em] text-secondary-light">
                Julia Ortiz Luis National High School
              </p>
              <h2 className="font-heading text-[52px] leading-[1.02] tracking-tight text-white sm:text-[72px] lg:text-[84px]">
                {routeLabel(pathname)}
              </h2>
            </Container>
          </motion.div>

          {/* Brand-gradient sliver trailing the curtain's edge — the same
              3px detail the footer band starts with. */}
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-primary-400 via-secondary-300 to-primary-400" />
        </motion.div>
      )}
      <motion.div
        key={pathname + "-content"}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: appleEase, delay: shouldReduceMotion ? 0 : 0.85 }}
      >
        {children}
      </motion.div>
    </>
  );
}

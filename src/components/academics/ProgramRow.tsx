import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { fadeUp, viewportOnce } from "@/lib/motion";
import type { AcademicProgram } from "@/types";

/**
 * VisualPanel
 *
 * Renders either a photo placeholder (SHS — a real campus cohort) or a
 * large centered icon on a tinted panel (the four JHS tracks — a
 * curriculum, not a physical place; see ImagePlaceholder's own doc
 * comment on when NOT to use it). The icon panel's shade is the inverse
 * of the row's own light/dark theme, so it reads as a distinct block
 * next to the text column rather than blending into it.
 */
function VisualPanel({ program }: { program: AcademicProgram }) {
  if (program.visual.kind === "photo") {
    return (
      <ImagePlaceholder
        alt={`Photo of ${program.name} students`}
        label={`${program.name} Students`}
        recommendedSize={program.visual.imageSize}
        className="min-h-[280px] rounded-none border-none"
      />
    );
  }

  const Icon = program.visual.icon;
  const isDark = program.theme === "dark";

  return (
    <div
      className={`flex min-h-[280px] items-center justify-center ${
        isDark ? "bg-primary-700" : "bg-primary-50"
      }`}
    >
      <Icon
        className={isDark ? "h-24 w-24 text-secondary-light" : "h-24 w-24 text-primary"}
        aria-hidden="true"
        strokeWidth={1.5}
      />
    </div>
  );
}

/**
 * ProgramRow
 *
 * One reusable full-bleed row for the Academics landing page: visual
 * panel + text column, alternating left/right and light/dark per
 * program — same rhythm as CampusFacilities' FacilityRow, generalized to
 * accept an icon OR a photo instead of always assuming a photo exists.
 */
export function ProgramRow({ program }: { program: AcademicProgram }) {
  const imageFirst = program.imagePosition === "left";
  const isDark = program.theme === "dark";
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={fadeUp}
      initial={shouldReduceMotion ? "show" : "hidden"}
      whileInView="show"
      viewport={viewportOnce}
      className={`grid grid-cols-1 lg:grid-cols-2 ${isDark ? "bg-primary" : "bg-white"}`}
    >
      <div className={imageFirst ? "lg:order-1" : "lg:order-2"}>
        <VisualPanel program={program} />
      </div>
      <div
        className={`flex flex-col justify-center px-8 py-12 sm:px-14 ${
          imageFirst ? "lg:order-2" : "lg:order-1"
        }`}
      >
        <p
          className={`mb-3 text-small font-semibold uppercase tracking-widest ${
            isDark ? "text-secondary-light" : "text-primary"
          }`}
        >
          {program.eyebrow}
        </p>
        <h3 className={`text-subtitle ${isDark ? "text-white" : "text-text-primary"}`}>
          {program.name}
        </h3>
        <p className={`mt-1 text-small font-medium ${isDark ? "text-blue-100" : "text-text-secondary"}`}>
          {program.fullName}
        </p>
        <p className={`mt-4 max-w-md text-body ${isDark ? "text-blue-50" : "text-text-secondary"}`}>
          {program.description}
        </p>
        <Button
          href={`/academics/${program.slug}`}
          variant={isDark ? "outline" : "primary"}
          className="mt-6 self-start"
        >
          Learn More
        </Button>
      </div>
    </motion.div>
  );
}
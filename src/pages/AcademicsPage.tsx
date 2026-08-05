import { motion, useReducedMotion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AcademicsSubNav } from "@/components/ui/AcademicsSubNav";
import { ProgramRow } from "@/components/academics/ProgramRow";
import { academicPrograms } from "@/data/academics";
import { academicsOverview } from "@/data/academicsOverview";
import { fadeUp, viewportOnce } from "@/lib/motion";

/**
 * AcademicsPage
 *
 * Landing page for the Academics section: a hero, then one full-bleed
 * row per track (STE, SP-ICT, SNED, Regular Program, Senior High School)
 * pulled straight from `academicPrograms` — the same list that drives
 * both the header dropdown's slugs and AcademicsSubNav, so this page,
 * the menu, and the sub-nav can never drift out of sync with each other.
 *
 * Deliberately skips an Overview/Quick-Facts intro strip (unlike
 * AboutOverviewPage) — the ask here was to go straight from the hero
 * into the programs themselves.
 */
export function AcademicsPage() {
  usePageTitle("Academics");
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";

  return (
    <>
      <section className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-primary-700 py-16 sm:min-h-[400px]">
        <ImagePlaceholder
          alt="JOLNHS students in a classroom"
          label="Insert Academics Hero Photo Here"
          recommendedSize="1920 x 900"
          className="absolute inset-0 h-full rounded-none border-none bg-primary-700 text-secondary-100"
        />
        <div className="pointer-events-none absolute inset-0 bg-primary/60" />
        <div className="relative px-6 text-center text-white">
          <h1 className="text-heading sm:text-hero">{academicsOverview.heroHeading}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-body text-secondary-100">
            {academicsOverview.heroDescription}
          </p>
        </div>
      </section>

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Academics", href: "/academics" },
          { label: "Overview" },
        ]}
      />
      <AcademicsSubNav current="/academics" />

      <section aria-label="Academic Programs">
        <div className="flex flex-col">
          {academicPrograms.map((program) => (
            <ProgramRow key={program.id} program={program} />
          ))}
        </div>
      </section>

      <section className="bg-background py-section-sm md:py-section">
        <Container className="text-center">
          <motion.div
            variants={fadeUp}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="mx-auto max-w-2xl"
          >
            <h2 className="text-section text-text-primary">{academicsOverview.ctaHeading}</h2>
            <p className="mt-5 text-body text-text-secondary">{academicsOverview.ctaBlurb}</p>
            <Button variant="primary" href={academicsOverview.ctaHref} className="mt-8">
              {academicsOverview.ctaLabel}
            </Button>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
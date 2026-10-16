import { motion, useReducedMotion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
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
      <PageHero
        title={academicsOverview.heroHeading}
        description={academicsOverview.heroDescription}
        photo={{
          alt: "JOLNHS students in a classroom",
          label: "Insert Academics Hero Photo Here",
          recommendedSize: "1920 x 900",
        }}
      />

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
            <Button variant="primary" href={academicsOverview.ctaHref} arrow className="mt-8">
              {academicsOverview.ctaLabel}
            </Button>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
import { useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AcademicsSubNav } from "@/components/ui/AcademicsSubNav";
import { academicPrograms } from "@/data/academics";
import { academicsOverview } from "@/data/academicsOverview";
import { fadeUp, scaleIn, staggerContainer, viewportOnce } from "@/lib/motion";
import type { AcademicProgram } from "@/types";

/**
 * ProgramHero
 *
 * Photo programs (SHS) get the same full-bleed photo band as the
 * Academics landing hero. Icon programs (STE, SP-ICT, SNED, Regular)
 * get a solid panel with a large, faint watermark icon instead — there's
 * no physical place to photograph for a curriculum track, so a fabricated
 * "photo" placeholder would be misleading rather than just unfinished.
 */
function ProgramHero({ program }: { program: AcademicProgram }) {
  return (
    <section className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-primary-700 py-16 sm:min-h-[400px]">
      {program.visual.kind === "photo" ? (
        <>
          <ImagePlaceholder
            alt={`Photo of ${program.name} students`}
            label={`Insert ${program.name} Hero Photo Here`}
            recommendedSize={program.visual.imageSize}
            className="absolute inset-0 h-full rounded-none border-none bg-primary-700 text-blue-100"
          />
          <div className="pointer-events-none absolute inset-0 bg-primary/60" />
        </>
      ) : (
        <program.visual.icon
          className="pointer-events-none absolute -right-8 -top-8 h-64 w-64 text-white/10 sm:h-80 sm:w-80"
          aria-hidden="true"
          strokeWidth={1}
        />
      )}

      <div className="relative px-6 text-center text-white">
        <p className="mb-3 text-small font-semibold uppercase tracking-widest text-secondary-light">
          {program.eyebrow}
        </p>
        <h1 className="text-heading sm:text-hero">{program.name}</h1>
        <p className="mx-auto mt-2 max-w-2xl text-body text-blue-100">{program.fullName}</p>
      </div>
    </section>
  );
}

export function ProgramDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const program = academicPrograms.find((p) => p.slug === slug);
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";

  // Guards a slug that isn't in academicPrograms (typo'd URL, old bookmark,
  // etc.) with a real in-brand empty state instead of a router 404 or a
  // blank page — same "point back to a known-good page" pattern used by
  // FacultyStaffPage's empty search-results state.
  if (!program) {
    return (
      <Container className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-section-sm text-center">
        <h1 className="text-section text-text-primary">Program Not Found</h1>
        <p className="max-w-md text-body text-text-secondary">
          We couldn't find an academic program at this address. It may have moved — try the
          Academics overview instead.
        </p>
        <Button variant="primary" href="/academics" className="mt-2">
          Back to Academics
        </Button>
      </Container>
    );
  }

  return (
    <>
      <ProgramHero program={program} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Academics", href: "/academics" },
          { label: program.name },
        ]}
      />
      <AcademicsSubNav current={`/academics/${program.slug}`} />

      {/* Overview + Quick Facts, same grid rhythm as AboutOverviewPage's
          intro section */}
      <section className="bg-white py-section-sm md:py-section">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
          <motion.div variants={fadeUp} initial={initial} whileInView="show" viewport={viewportOnce}>
            <p className="mb-3 text-small font-semibold uppercase tracking-widest text-primary">
              Program Overview
            </p>
            <h2 className="text-section text-text-primary">About {program.name}</h2>
            <p className="mt-6 max-w-prose text-body text-text-secondary">{program.description}</p>
          </motion.div>

          <motion.aside
            variants={scaleIn}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="sticky top-28 h-fit self-start rounded-card border border-border bg-background p-6"
          >
            <p className="text-small font-semibold uppercase tracking-widest text-primary">
              Quick Facts
            </p>
            <dl className="mt-4 flex flex-col gap-4">
              {program.quickFacts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-small text-text-secondary">{fact.label}</dt>
                  <dd className="mt-0.5 font-medium text-text-primary">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </motion.aside>
        </Container>
      </section>

      {/* What You'll Learn — staggered highlight cards */}
      <section className="bg-background py-section-sm md:py-section">
        <Container>
          <motion.h2
            variants={fadeUp}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="text-section text-text-primary"
          >
            What You'll Learn
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {program.highlights.map((highlight) => (
              <motion.div
                key={highlight.title}
                variants={scaleIn}
                className="rounded-card border border-border bg-white p-6"
              >
                <h3 className="text-subtitle text-text-primary">{highlight.title}</h3>
                <p className="mt-3 text-body text-text-secondary">{highlight.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Strands — SHS only */}
      {program.strands && (
        <section className="bg-white py-section-sm md:py-section">
          <Container>
            <motion.h2
              variants={fadeUp}
              initial={initial}
              whileInView="show"
              viewport={viewportOnce}
              className="text-section text-text-primary"
            >
              Available Strands
            </motion.h2>

            <motion.div
              variants={staggerContainer}
              initial={initial}
              whileInView="show"
              viewport={viewportOnce}
              className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2"
            >
              {program.strands.map((strand) => (
                <motion.div
                  key={strand.name}
                  variants={scaleIn}
                  className="rounded-card bg-primary p-6"
                >
                  <h3 className="text-subtitle text-white">{strand.name}</h3>
                  <p className="mt-3 text-body text-blue-50">{strand.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </Container>
        </section>
      )}

      {/* Admission Requirements */}
      <section className="bg-background py-section-sm md:py-section">
        <Container>
          <motion.div
            variants={fadeUp}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="mx-auto max-w-2xl"
          >
            <h2 className="text-section text-text-primary">Admission Requirements</h2>
            <ul className="mt-8 flex flex-col gap-4">
              {program.admissionRequirements.map((requirement) => (
                <li key={requirement} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-body text-text-secondary">{requirement}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </Container>
      </section>

      {/* Closing CTA — same rhythm as the Academics landing page's CTA */}
      <section className="bg-primary py-section-sm md:py-section">
        <Container className="text-center">
          <motion.div
            variants={fadeUp}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="mx-auto max-w-2xl"
          >
            <h2 className="text-section text-white">Interested in {program.name}?</h2>
            <p className="mt-5 text-body text-blue-50">{academicsOverview.ctaBlurb}</p>
            <Button variant="outline" href={academicsOverview.ctaHref} className="mt-8">
              {academicsOverview.ctaLabel}
            </Button>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
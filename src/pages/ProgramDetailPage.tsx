import { useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AcademicsSubNav } from "@/components/ui/AcademicsSubNav";
import { ProgramPhotoGallery } from "@/components/academics/ProgramPhotoGallery";
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
    <PageHero
      eyebrow={program.eyebrow}
      title={program.name}
      description={program.fullName}
      {...(program.visual.kind === "photo"
        ? {
            photo: {
              alt: `Photo of ${program.name} students`,
              label: `Insert ${program.name} Hero Photo Here`,
              recommendedSize: program.visual.imageSize,
              src: program.visual.src,
            },
          }
        : { watermarkIcon: program.visual.icon })}
    />
  );
}

/**
 * OverviewVisual
 *
 * The large photo beside "About {program}" — prefers the dedicated
 * overview photo, falls back to the program's own visual photo (SHS's
 * cohort shot), and shows the program's icon panel when no photo has
 * been supplied yet so no empty placeholder ever ships to visitors.
 */
function OverviewVisual({ program }: { program: AcademicProgram }) {
  const photoSrc =
    program.photos?.overview?.src ??
    (program.visual.kind === "photo" ? program.visual.src : undefined);

  if (photoSrc) {
    return (
      <img
        src={photoSrc}
        alt={program.photos?.overview?.alt ?? `Photo of ${program.name} students`}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  const Icon = program.visual.kind === "icon" ? program.visual.icon : null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-primary-50">
      {Icon && <Icon className="h-24 w-24 text-primary" aria-hidden="true" strokeWidth={1.5} />}
    </div>
  );
}

export function ProgramDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const program = academicPrograms.find((p) => p.slug === slug);
  usePageTitle(program ? program.name : "Program Not Found");
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

      {/* Overview: text + quick-fact tiles on the left, the program's
          overview photo on the right (falls back to the program's icon
          panel when no photo has been supplied yet). */}
      <section className="bg-white py-section-sm md:py-section">
        <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <motion.div variants={fadeUp} initial={initial} whileInView="show" viewport={viewportOnce}>
            <p className="mb-3 text-small font-semibold uppercase tracking-[0.18em] text-primary">
              Program Overview
            </p>
            <h2 className="text-section text-text-primary">About {program.name}</h2>
            <p className="mt-6 max-w-prose text-body text-text-secondary">{program.description}</p>

            <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {program.quickFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-card border border-border bg-background p-4"
                >
                  <dt className="text-small text-text-secondary">{fact.label}</dt>
                  <dd className="mt-1 font-medium text-text-primary">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            variants={scaleIn}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="relative aspect-[4/3] overflow-hidden rounded-card border border-border"
          >
            <OverviewVisual program={program} />
          </motion.div>
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

      {/* Photo strip — renders slots in order; empty slots are dev-only
          placeholders, and the section disappears in production until at
          least one photo exists. */}
      {program.photos?.gallery && program.photos.gallery.length > 0 && (
        <ProgramPhotoGallery programName={program.name} photos={program.photos.gallery} />
      )}

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
                  <p className="mt-3 text-body text-secondary-50">{strand.description}</p>
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
            <p className="mt-5 text-body text-secondary-50">{academicsOverview.ctaBlurb}</p>
            <Button variant="outline" href={academicsOverview.ctaHref} className="mt-8">
              {academicsOverview.ctaLabel}
            </Button>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
import { useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CampusLifeSubNav } from "@/components/ui/CampusLifeSubNav";
import { GalleryGrid } from "@/components/campusLife/GalleryGrid";
import { campusLifeSections } from "@/data/campusLife";
import { fadeUp, scaleIn, staggerContainer, viewportOnce } from "@/lib/motion";
import type { CampusLifeSection } from "@/types";

/**
 * SectionHero
 *
 * A large icon watermark on a solid panel, not a photo band. Same
 * reasoning as ProgramDetailPage's icon-track hero: "Student
 * Organizations" or "Campus Journalists" aren't a single physical place
 * to photograph the way a school building is — a fabricated "photo"
 * placeholder here would imply a specific shot exists when it doesn't.
 * The section's own gallery (further down the page) is where real
 * photos belong.
 */
function SectionHero({ section }: { section: CampusLifeSection }) {
  const Icon = section.icon;
  return (
    <section className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-primary-700 py-16 sm:min-h-[400px]">
      <Icon
        className="pointer-events-none absolute -right-8 -top-8 h-64 w-64 text-white/10 sm:h-80 sm:w-80"
        aria-hidden="true"
        strokeWidth={1}
      />
      <div className="relative px-6 text-center text-white">
        <p className="mb-3 text-small font-semibold uppercase tracking-widest text-secondary-light">
          {section.eyebrow}
        </p>
        <h1 className="text-heading sm:text-hero">{section.name}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-body text-secondary-100">{section.tagline}</p>
      </div>
    </section>
  );
}

export function CampusLifeSectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const section = campusLifeSections.find((s) => s.slug === slug);
  usePageTitle(section ? section.name : "Section Not Found", section?.tagline);
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";

  // Guards a slug that isn't in campusLifeSections (typo'd URL, old
  // bookmark, etc.) with a real in-brand empty state instead of a router
  // 404 or a blank page — same pattern ProgramDetailPage uses for an
  // unknown academic program slug.
  if (!section) {
    return (
      <Container className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-section-sm text-center">
        <h1 className="text-section text-text-primary">Section Not Found</h1>
        <p className="max-w-md text-body text-text-secondary">
          We couldn't find a Campus Life section at this address. It may have moved — try the
          Campus Life overview instead.
        </p>
        <Button variant="primary" href="/campus-life" className="mt-2">
          Back to Campus Life
        </Button>
      </Container>
    );
  }

  return (
    <>
      <SectionHero section={section} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Campus Life", href: "/campus-life" },
          { label: section.name },
        ]}
      />
      <CampusLifeSubNav current={`/campus-life/${section.slug}`} />

      {/* Overview + stats sidebar — same grid rhythm as ProgramDetailPage
          and AboutOverviewPage's own intro section. */}
      <section className="bg-white py-section-sm md:py-section">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
          <motion.div variants={fadeUp} initial={initial} whileInView="show" viewport={viewportOnce}>
            <p className="mb-3 text-small font-semibold uppercase tracking-widest text-primary">
              Overview
            </p>
            <h2 className="text-section text-text-primary">About {section.name}</h2>
            <p className="mt-6 max-w-prose text-body text-text-secondary">{section.description}</p>
          </motion.div>

          <motion.aside
            variants={scaleIn}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="h-fit self-start rounded-card border border-border bg-background p-6 lg:sticky lg:top-28"
          >
            <p className="text-small font-semibold uppercase tracking-widest text-primary">
              By the Numbers
            </p>
            <dl className="mt-4 flex flex-col gap-4">
              {section.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-small text-text-secondary">{stat.label}</dt>
                  <dd className="mt-0.5 text-subtitle font-bold text-text-primary">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </motion.aside>
        </Container>
      </section>

      {/* What this section actually does — staggered highlight cards,
          same treatment as ProgramDetailPage's "What You'll Learn". */}
      <section className="bg-background py-section-sm md:py-section">
        <Container>
          <motion.h2
            variants={fadeUp}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="text-section text-text-primary"
          >
            What We Do
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {section.highlights.map((highlight) => (
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

      {/* Photo gallery */}
      <section className="bg-white py-section-sm md:py-section">
        <Container>
          <motion.h2
            variants={fadeUp}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="text-section text-text-primary"
          >
            Gallery
          </motion.h2>
          <div className="mt-10">
            <GalleryGrid items={section.gallery} />
          </div>
        </Container>
      </section>

      {/* Closing CTA — section-specific label/href instead of the shared
          Academics-style CTA, since "Join a Team" and "Get Involved as a
          Parent" need genuinely different calls to action per section. */}
      <section className="bg-primary py-section-sm md:py-section">
        <Container className="text-center">
          <motion.div
            variants={fadeUp}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="mx-auto max-w-2xl"
          >
            <h2 className="text-section text-white">Interested in {section.name}?</h2>
            <p className="mt-5 text-body text-secondary-50">
              Reach out through our contact page and we'll connect you with the right adviser or
              coordinator.
            </p>
            <Button variant="outline" href={section.ctaHref} className="mt-8">
              {section.ctaLabel}
            </Button>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
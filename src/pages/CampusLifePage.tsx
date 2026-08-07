import { motion, useReducedMotion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CampusLifeSubNav } from "@/components/ui/CampusLifeSubNav";
import { CampusLifeCard } from "@/components/campusLife/CampusLifeCard";
import { CommunityStats } from "@/components/campusLife/CommunityStats";
import { QuoteCard } from "@/components/campusLife/QuoteCard";
import { campusLifeSections } from "@/data/campusLife";
import { campusLifeOverview } from "@/data/campusLifeOverview";
import { fadeUp, fadeIn, staggerContainer, viewportOnce } from "@/lib/motion";

/**
 * CampusLifePage
 *
 * Landing page for the Campus Life section (/campus-life). Structure
 * deliberately follows the same rhythm as AcademicsPage and
 * AboutOverviewPage (hero -> breadcrumbs -> sub-nav -> content ->
 * closing CTA) so the site feels like one product, not five different
 * templates glued together — while the content itself (stats band,
 * quotes, photo teaser) is unique to what Campus Life needs to
 * communicate: scale and atmosphere, not curriculum facts.
 */
export function CampusLifePage() {
  usePageTitle("Campus Life");
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";

  return (
    <>
      <section className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-primary-700 py-16 sm:min-h-[420px]">
        <ImagePlaceholder
          alt="JOLNHS students at a campus event"
          label="Insert Campus Life Hero Photo Here"
          recommendedSize="1920 x 900"
          className="absolute inset-0 h-full rounded-none border-none bg-primary-700 text-secondary-100"
        />
        <div className="pointer-events-none absolute inset-0 bg-primary/60" />
        <div className="relative px-6 text-center text-white">
          <h1 className="text-heading sm:text-hero">{campusLifeOverview.heroHeading}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-body text-secondary-100">
            {campusLifeOverview.heroDescription}
          </p>
        </div>
      </section>

      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Campus Life" }]} />
      <CampusLifeSubNav current="/campus-life" />

      {/* Intro copy — centered and text-only, unlike AboutOverviewPage's
          text+sidebar split, because there's no "quick facts" list that
          belongs here; CommunityStats right below does that job as a
          full-width band instead of a cramped sidebar. */}
      <section className="bg-white py-section-sm md:py-section">
        <Container className="mx-auto max-w-3xl text-center">
          <motion.div variants={fadeUp} initial={initial} whileInView="show" viewport={viewportOnce}>
            <p className="mb-3 text-small font-semibold uppercase tracking-widest text-primary">
              {campusLifeOverview.introEyebrow}
            </p>
            <h2 className="text-section text-text-primary">{campusLifeOverview.introHeading}</h2>
            <div className="mt-6 flex flex-col gap-4">
              {campusLifeOverview.introParagraphs.map((paragraph, i) => (
                <p key={i} className="text-body text-text-secondary">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      <CommunityStats stats={campusLifeOverview.communityStats} />

      {/* Section directory — the page's real destination. Every card
          routes to its own /campus-life/:slug detail page. */}
      <section className="bg-background py-section-sm md:py-section">
        <Container>
          <motion.h2
            variants={fadeUp}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="text-section text-text-primary"
          >
            Explore Campus Life
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {campusLifeSections.map((section) => (
              <CampusLifeCard key={section.id} section={section} />
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Tagline over full-width photo — same "pause moment" band used
          by AboutOverviewPage and TaglineBanner. */}
      <motion.section
        variants={fadeIn}
        initial={initial}
        whileInView="show"
        viewport={viewportOnce}
        className="relative flex h-[280px] items-center justify-center overflow-hidden"
      >
        <ImagePlaceholder
          alt="JOLNHS students celebrating together on campus"
          label="Insert Campus Community Photo Here"
          recommendedSize="1920 x 700"
          className="absolute inset-0 h-full rounded-none border-none"
        />
        <div className="absolute inset-0 bg-primary/70" />
        <h2 className="relative max-w-2xl px-6 text-center text-3xl font-bold text-white sm:text-4xl">
          {campusLifeOverview.taglineHeading}
        </h2>
      </motion.section>

      {/* In their own words — 2-up testimonials */}
      <section className="bg-white py-section-sm md:py-section">
        <Container>
          <motion.h2
            variants={fadeUp}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="text-section text-text-primary"
          >
            In Their Own Words
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            {campusLifeOverview.quotes.map((quote) => (
              <QuoteCard key={quote.name} quote={quote} />
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Closing CTA — same rhythm as AcademicsPage's own CTA */}
      <section className="bg-primary py-section-sm md:py-section">
        <Container className="text-center">
          <motion.div
            variants={fadeUp}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="mx-auto max-w-2xl"
          >
            <h2 className="text-section text-white">{campusLifeOverview.ctaHeading}</h2>
            <p className="mt-5 text-body text-secondary-50">{campusLifeOverview.ctaBlurb}</p>
            <Button variant="outline" href={campusLifeOverview.ctaHref} className="mt-8">
              {campusLifeOverview.ctaLabel}
            </Button>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
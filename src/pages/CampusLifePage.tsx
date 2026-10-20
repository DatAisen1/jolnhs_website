import { motion, useReducedMotion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHero } from "@/components/ui/PageHero";
import { PageStatus } from "@/components/ui/PageStatus";
import { SkeletonGrid } from "@/components/ui/SkeletonGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CampusLifeSubNav } from "@/components/ui/CampusLifeSubNav";
import { CampusLifeCard } from "@/components/campusLife/CampusLifeCard";
import { CommunityStats } from "@/components/campusLife/CommunityStats";
import { GalleryGrid } from "@/components/campusLife/GalleryGrid";
import { PrivacyNotice } from "@/components/privacy/PrivacyNotice";
import { QuoteCard } from "@/components/campusLife/QuoteCard";
import { campusLifeOverview } from "@/data/campusLifeOverview";
import { useAllCampusLifeSections } from "@/lib/data/publicCampusLife";
import { galleryPhotoUrl, useGalleryTeaser } from "@/lib/data/gallery";
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
 *
 * Data is now fetched from Supabase via useAllCampusLifeSections() hook.
 * UI properties (icon, theme, gallery, CTA) are combined from static data.
 */
export function CampusLifePage() {
  usePageTitle(
    "Campus Life",
    "Explore student organizations, athletics, the PTA, and campus journalism at Julia Ortiz Luis National High School."
  );
  const { data: campusLifeSections = [], isLoading, error } = useAllCampusLifeSections();
  const { data: teaserPhotos } = useGalleryTeaser();
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";

  // One admin-uploaded photo per section where one exists; sections
  // without uploads fall back to the static "coming soon" slot so the
  // grid keeps its shape.
  const teaserItems = campusLifeSections.map((section) => {
    const photo = teaserPhotos?.[section.slug];
    const src = photo ? galleryPhotoUrl(photo.storage_path) ?? undefined : undefined;
    return (
      src
        ? { src, label: photo?.caption || `${section.name} photo`, imageSize: "800×600" }
        : section.gallery[0]
    );
  });

  return (
    <>
      <PageHero
        title={campusLifeOverview.heroHeading}
        description={campusLifeOverview.heroDescription}
        photo={{
          alt: "JOLNHS students at a campus event",
          label: "Insert Campus Life Hero Photo Here",
          recommendedSize: "1920 x 900",
        }}
      />

      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Campus Life" }]} />
      <CampusLifeSubNav current="/campus-life" />

      {/* Intro copy — centered and text-only, unlike AboutOverviewPage's
          text+sidebar split, because there's no "quick facts" list that
          belongs here; CommunityStats right below does that job as a
          full-width band instead of a cramped sidebar. */}
      <section className="bg-surface py-section-sm md:py-section">
        <Container className="mx-auto max-w-3xl text-center">
          <motion.div variants={fadeUp} initial={initial} whileInView="show" viewport={viewportOnce}>
            <p className="mb-3 text-small font-semibold uppercase tracking-[0.18em] text-primary">
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
          {isLoading ? (
            <SkeletonGrid
              count={4}
              imageAspect=""
              gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            />
          ) : error ? (
            <PageStatus variant="error" message="Failed to load campus life sections. Please try again later." />
          ) : (
            <>
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
            </>
          )}
        </Container>
      </section>

      {/* Photo teaser — one shot pulled from each section's own gallery,
          so "campus life" feels shown, not just described, before the
          visitor ever clicks into a sub-page. Reuses GalleryGrid at its
          4-column density, same component the section detail pages use
          for their own (larger) galleries. */}
      <section className="bg-surface py-section-sm md:py-section">
        <Container>
          <motion.h2
            variants={fadeUp}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="text-section text-text-primary"
          >
            Campus Life in Pictures
          </motion.h2>
          <div className="mt-10">
            <GalleryGrid items={teaserItems} columns={4} />
          </div>

          <PrivacyNotice className="mt-10" />
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
          src={campusLifeOverview.communityBandSrc}
          className="absolute inset-0 h-full rounded-none border-none"
        />
        <div className="absolute inset-0 bg-primary/70" />
        <h2 className="relative max-w-2xl px-6 text-center text-3xl font-bold text-white sm:text-4xl">
          {campusLifeOverview.taglineHeading}
        </h2>
      </motion.section>

      {/* In their own words — 2-up testimonials */}
      <section className="bg-surface py-section-sm md:py-section">
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
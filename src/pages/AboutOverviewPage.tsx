import { motion, useReducedMotion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AboutSubNav } from "@/components/ui/AboutSubNav";
import { FacultyCard } from "@/components/faculty/FacultyCard";
import { staffMembers } from "@/data/facultyStaff";
import { aboutOverview } from "@/data/aboutOverview";
import { quickFacts } from "@/data/quickFacts";
import { fadeUp, fadeIn, scaleIn, staggerContainer, viewportOnce } from "@/lib/motion";

// Preview 3 administrators here rather than duplicating staff content —
// the full roster (and every other category) lives on FacultyStaffPage.
const teamPreview = staffMembers.filter((m) => m.category === "administrators").slice(0, 3);

// Grid columns follow how many preview cards actually exist, so a
// partially-filled roster (e.g. 2 admins entered so far) doesn't leave a
// visibly empty column next to real cards — it just shows 2 balanced
// columns until a 3rd admin is added to the data.
const teamGridColsClass =
  teamPreview.length >= 3
    ? "grid-cols-2 sm:grid-cols-3"
    : teamPreview.length === 2
      ? "grid-cols-2"
      : "grid-cols-1";

export function AboutOverviewPage() {
  usePageTitle("About JOLNHS");

  // Drives every scroll-in animation below. When the user has OS-level
  // "reduce motion" on, every motion element starts in its "show" state
  // instead of "hidden" — content just appears, no fly-in/scale/fade.
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";

  return (
    <>
      {/* Photo hero band.
          min-h- (not a fixed h-) on purpose: the heading + supporting
          description is variable-length copy. A fixed height clips long
          content behind `overflow-hidden` on narrow viewports; min-height
          lets the band grow with its content instead. */}
      <section className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-primary-700 py-16 sm:min-h-[400px]">
        <ImagePlaceholder
          alt="JOLNHS campus and students"
          label="Insert Overview Hero Photo Here"
          recommendedSize="1920 x 900"
          className="absolute inset-0 h-full rounded-none border-none bg-primary-700 text-blue-100"
        />
        <div className="pointer-events-none absolute inset-0 bg-primary/60" />
        <div className="relative px-6 text-center text-white">
          <h1 className="text-heading sm:text-hero">{aboutOverview.heroHeading}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-body text-blue-100">
            {aboutOverview.heroDescription}
          </p>
        </div>
      </section>

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "About JOLNHS", href: "/about/overview" },
          { label: "Overview" },
        ]}
      />
      <AboutSubNav current="/about/overview" />

      {/* Intro / philosophy, with a Quick Facts sidebar for scannability */}
      <section className="bg-white py-section-sm md:py-section">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
          <motion.div variants={fadeUp} initial={initial} whileInView="show" viewport={viewportOnce}>
            <p className="mb-3 text-small font-semibold uppercase tracking-widest text-primary">
              {aboutOverview.introEyebrow}
            </p>
            <h2 className="text-section text-text-primary">{aboutOverview.introHeading}</h2>
            <div className="mt-6 flex max-w-prose flex-col gap-4">
              {aboutOverview.introParagraphs.map((paragraph, i) => (
                <p key={i} className="text-body text-text-secondary">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 border-l-4 border-secondary pl-6">
              <p className="text-body italic text-text-secondary">{aboutOverview.welcomeMessage}</p>
              <p className="mt-3 font-semibold text-text-primary">{aboutOverview.principalName}</p>
              <p className="text-small text-text-secondary">{aboutOverview.principalTitle}</p>
            </div>
          </motion.div>

          {/* sticky top-28: clears the floating pill Header (top-4 + h-20
              ≈ 96px) with a comfortable gap. self-start stops the grid's
              default `align-items: stretch` from fighting `h-fit`. */}
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
              {quickFacts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-small text-text-secondary">{fact.label}</dt>
                  <dd className="mt-0.5 font-medium text-text-primary">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </motion.aside>
        </Container>
      </section>

      {/* Tagline over full-width photo.
          text-3xl sm:text-4xl is intentionally unchanged — it matches the
          same raw-scale convention HeroBanner and TaglineBanner use for
          full-bleed photo/video "pause moment" headings, as distinct from
          the text-section token used for in-page content headings above.
          Swapping it for text-section would make THIS page inconsistent
          with those sibling components instead of more consistent. */}
      <motion.section
        variants={fadeIn}
        initial={initial}
        whileInView="show"
        viewport={viewportOnce}
        className="relative flex h-[280px] items-center justify-center overflow-hidden"
      >
        <ImagePlaceholder
          alt="JOLNHS faculty and staff group photo"
          label="Insert Faculty Group Photo Here"
          recommendedSize="1920 x 700"
          className="absolute inset-0 h-full rounded-none border-none"
        />
        <div className="absolute inset-0 bg-primary/70" />
        <h2 className="relative max-w-2xl px-6 text-center text-3xl font-bold text-white sm:text-4xl">
          {aboutOverview.taglineHeading}
        </h2>
      </motion.section>

      {/* Meet Our Team preview -> links to full Faculty & Staff page */}
      <section className="bg-background py-section-sm md:py-section">
        <Container>
          <motion.div
            variants={fadeUp}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-start"
          >
            <h2 className="text-section text-text-primary">{aboutOverview.teamSectionHeading}</h2>
            <div className="max-w-sm">
              <p className="text-body text-text-secondary">{aboutOverview.teamSectionBlurb}</p>
              <Button variant="primary" href="/about/faculty-staff" className="mt-4">
                {aboutOverview.teamSectionCta}
              </Button>
            </div>
          </motion.div>

          {/* Staggered grid: children declare `variants={scaleIn}` with no
              initial/whileInView of their own, so they inherit the
              hidden/show trigger from this container and animate in one
              after another (staggerChildren: 0.08s) instead of all at once. */}
          <motion.div
            variants={staggerContainer}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className={`mt-10 grid gap-6 ${teamGridColsClass}`}
          >
            {teamPreview.map((member) => (
              <motion.div key={member.id} variants={scaleIn}>
                <FacultyCard member={member} />
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>
    </>
  );
}   
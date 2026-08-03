import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AboutSubNav } from "@/components/ui/AboutSubNav";
import { FacultyCard } from "@/components/faculty/FacultyCard";
import { staffMembers } from "@/data/facultyStaff";
import { aboutOverview } from "@/data/aboutOverview";
import { quickFacts } from "@/data/quickFacts";

// Preview 3 administrators here rather than duplicating staff content —
// the full roster (and every other category) lives on FacultyStaffPage.
const teamPreview = staffMembers.filter((m) => m.category === "administrators").slice(0, 3);

export function AboutOverviewPage() {
  return (
    <>
      {/* Photo hero band */}
      <section className="relative flex h-[320px] items-center justify-center overflow-hidden bg-primary-700 sm:h-[400px]">
        <ImagePlaceholder
          alt="JOLNHS campus and students"
          label="Insert Overview Hero Photo Here"
          recommendedSize="1920 x 900"
          className="absolute inset-0 h-full rounded-none border-none bg-primary-700 text-blue-100"
        />
        <div className="pointer-events-none absolute inset-0 bg-primary/60" />
        <h1 className="relative text-heading text-white sm:text-hero">{aboutOverview.heroHeading}</h1>
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
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="mb-3 text-small font-semibold uppercase tracking-widest text-primary">
              {aboutOverview.introEyebrow}
            </p>
            <h2 className="text-section text-text-primary">{aboutOverview.introHeading}</h2>
            <div className="mt-6 flex flex-col gap-4">
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

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="h-fit rounded-card border border-border bg-background p-6"
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

      {/* Tagline over full-width photo */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"
          >
            <h2 className="text-section text-text-primary">{aboutOverview.teamSectionHeading}</h2>
            <div className="max-w-sm">
              <p className="text-body text-text-secondary">{aboutOverview.teamSectionBlurb}</p>
              <Button variant="primary" href="/about/faculty-staff" className="mt-4">
                {aboutOverview.teamSectionCta}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3"
          >
            {teamPreview.map((member) => (
              <FacultyCard key={member.id} member={member} />
            ))}
          </motion.div>
        </Container>
      </section>
    </>
  );
}
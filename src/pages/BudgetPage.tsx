import { AlertCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BudgetSectionNav } from "@/components/budget/BudgetSectionNav";
import { BudgetStatsBand } from "@/components/budget/BudgetStatsBand";
import { ProposedBudgetTable } from "@/components/budget/ProposedBudgetTable";
import { BudgetAllocationChart } from "@/components/budget/BudgetAllocationChart";
import { AccomplishmentsGrid } from "@/components/budget/AccomplishmentsGrid";
import { budgetOverview, budgetCategories, budgetAccomplishments, getBudgetStats } from "@/data/budget";
import { fadeUp, viewportOnce } from "@/lib/motion";

/**
 * BudgetPage (/budget)
 *
 * Landing page for Budget Transparency. Inspired by Naga City's People's
 * Budget Portal (hero -> headline stats -> proposed budget -> allocation
 * breakdown -> funded accomplishments) but not a copy of it: this is a
 * single school's operating budget, not a city's, so the page is one
 * scrollable page with an anchor sub-nav instead of a multi-tab portal
 * with a dropdown selector, and drops anything that only makes sense at
 * city scale (multi-year budget cycle timeline, city-wide "Finish
 * Lines," cookie-consent banner, etc.).
 *
 * Structure mirrors CampusLifePage/AcademicsPage's own rhythm (hero ->
 * breadcrumbs -> sub-nav -> content -> closing CTA) so this page reads
 * as part of the same site, not a bolted-on template.
 */
export function BudgetPage() {
  usePageTitle(
    "Budget Transparency",
    "See JOLNHS's proposed annual budget, how it's allocated across categories, and the projects it has funded."
  );
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";
  const stats = getBudgetStats(budgetOverview, budgetCategories, budgetAccomplishments);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-primary-700 py-16 sm:min-h-[420px]">
        <ImagePlaceholder
          alt="JOLNHS campus building, representing the school's public budget"
          label="Insert Budget Transparency Hero Photo Here"
          recommendedSize="1920 x 900"
          className="absolute inset-0 h-full rounded-none border-none bg-primary-700 text-secondary-100"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-900/75 via-primary/60 to-primary-700/70" />
        <div className="relative px-6 text-center text-white">
          <h1 className="text-heading sm:text-hero">{budgetOverview.heroHeading}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-body text-secondary-100">{budgetOverview.heroDescription}</p>
        </div>
      </section>

      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Budget Transparency" }]} />
      <BudgetSectionNav />

      {/* Intro copy */}
      <section className="bg-white py-section-sm md:py-section">
        <Container className="mx-auto max-w-3xl text-center">
          <motion.div variants={fadeUp} initial={initial} whileInView="show" viewport={viewportOnce}>
            <p className="mb-3 text-small font-semibold uppercase tracking-widest text-primary">
              {budgetOverview.introEyebrow}
            </p>
            <h2 className="text-section text-text-primary">{budgetOverview.introHeading}</h2>
            <div className="mt-6 flex flex-col gap-4">
              {budgetOverview.introParagraphs.map((paragraph, i) => (
                <p key={i} className="text-body text-text-secondary">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Placeholder-data disclaimer — required whenever displayed
              figures aren't yet confirmed records; keeps the page
              honest about what it's showing while it's under development. */}
          <motion.div
            variants={fadeUp}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="mt-8 flex items-start gap-3 rounded-card border border-status-warning bg-status-warning-bg p-4 text-left"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-status-warning" aria-hidden="true" />
            <p className="text-small text-status-warning-text">{budgetOverview.disclaimer}</p>
          </motion.div>
        </Container>
      </section>

      <BudgetStatsBand stats={stats} />

      {/* Section 1: Proposed Budget */}
      <section id="proposed-budget" className="scroll-mt-36 bg-background py-section-sm md:py-section">
        <Container>
          <motion.div variants={fadeUp} initial={initial} whileInView="show" viewport={viewportOnce}>
            <p className="mb-3 text-small font-semibold uppercase tracking-widest text-primary">
              {budgetOverview.fiscalYear}
            </p>
            <h2 className="text-section text-text-primary">Proposed Budget</h2>
            <p className="mt-4 max-w-2xl text-body text-text-secondary">
              The itemized breakdown of what the school proposes to spend this fiscal year, by category. These
              figures move from "proposed" to "final" as the budget cycle progresses.
            </p>
          </motion.div>

          <div className="mt-10">
            <ProposedBudgetTable categories={budgetCategories} total={budgetOverview.totalProposedBudget} />
          </div>

          <p className="mt-4 text-small text-text-secondary">Last updated: {budgetOverview.lastUpdated}</p>
        </Container>
      </section>

      {/* Section 2: Budget Allocation */}
      <section id="budget-allocation" className="scroll-mt-36 bg-white py-section-sm md:py-section">
        <Container>
          <motion.div variants={fadeUp} initial={initial} whileInView="show" viewport={viewportOnce}>
            <p className="mb-3 text-small font-semibold uppercase tracking-widest text-primary">AT A GLANCE</p>
            <h2 className="text-section text-text-primary">Budget Allocation</h2>
            <p className="mt-4 max-w-2xl text-body text-text-secondary">
              The same categories above, visualized by relative share — so it's immediately clear where the
              largest portion of the budget is going.
            </p>
          </motion.div>

          <div className="mt-10 max-w-3xl">
            <BudgetAllocationChart categories={budgetCategories} />
          </div>
        </Container>
      </section>

      {/* Section 3: Accomplishments */}
      <section id="accomplishments" className="scroll-mt-36 bg-background py-section-sm md:py-section">
        <Container>
          <motion.div variants={fadeUp} initial={initial} whileInView="show" viewport={viewportOnce}>
            <p className="mb-3 text-small font-semibold uppercase tracking-widest text-primary">RESULTS</p>
            <h2 className="text-section text-text-primary">Accomplishments</h2>
            <p className="mt-4 max-w-2xl text-body text-text-secondary">
              Specific projects and programs the budget has funded, in progress, or is planning to fund next.
            </p>
          </motion.div>

          <div className="mt-10">
            <AccomplishmentsGrid accomplishments={budgetAccomplishments} categories={budgetCategories} />
          </div>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="bg-primary py-section-sm md:py-section">
        <Container className="text-center">
          <motion.div variants={fadeUp} initial={initial} whileInView="show" viewport={viewportOnce} className="mx-auto max-w-2xl">
            <h2 className="text-section text-white">{budgetOverview.ctaHeading}</h2>
            <p className="mt-5 text-body text-secondary-50">{budgetOverview.ctaBlurb}</p>
            <Button variant="outline" href={budgetOverview.ctaHref} className="mt-8">
              {budgetOverview.ctaLabel}
            </Button>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
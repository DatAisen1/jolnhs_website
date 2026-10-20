import { AlertCircle, Landmark } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { PageStatus } from "@/components/ui/PageStatus";
import { SkeletonRows } from "@/components/ui/SkeletonGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BudgetSectionNav } from "@/components/budget/BudgetSectionNav";
import { BudgetStatsBand } from "@/components/budget/BudgetStatsBand";
import { ProposedBudgetTable } from "@/components/budget/ProposedBudgetTable";
import { BudgetAllocationChart } from "@/components/budget/BudgetAllocationChart";
import { AccomplishmentsGrid } from "@/components/budget/AccomplishmentsGrid";
import { budgetOverview, getBudgetStats } from "@/data/budget";
import { usePublicBudget } from "@/lib/data/publicBudget";
import { getBudgetIcon } from "@/lib/data/budgetIcons";
import type { BudgetCategory, BudgetAccomplishment, BudgetOverview } from "@/types";
import { fadeUp, viewportOnce } from "@/lib/motion";

const lastUpdatedFormatter = new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric" });

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
 *
 * Data is now fetched from Supabase. UI properties (icons, color classes)
 * are mapped from static data since these are presentation-only values.
 */
export function BudgetPage() {
  usePageTitle(
    "Budget Transparency",
    "See JOLNHS's proposed annual budget, how it's allocated across categories, and the projects it has funded."
  );
  const { data: budgetData, isLoading, error } = usePublicBudget();
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";

  const uiCategories: BudgetCategory[] = (budgetData?.categories ?? []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: getBudgetIcon(cat.icon_key),
    amount: cat.amount,
    percentage: cat.percentage,
    colorClass: cat.color_class || "bg-primary",
    description: cat.description ?? "",
  }));

  const uiAccomplishments: BudgetAccomplishment[] = (budgetData?.accomplishments ?? []).map((acc) => ({
    id: acc.id,
    title: acc.title,
    categoryId: acc.category_id,
    amount: acc.amount,
    status: acc.status,
    period: acc.period ?? "",
    description: acc.description ?? "",
  }));

  // Page copy: values the admin saved on the current fiscal year win;
  // static copy in src/data/budget.ts fills anything left blank. The
  // disclaimer always shows — if the admin hasn't written one, the
  // default "illustrative placeholder data" notice is used.
  const fy = budgetData?.fiscalYear;
  const overview: BudgetOverview = {
    ...budgetOverview,
    fiscalYear: fy?.year_label ?? budgetOverview.fiscalYear,
    totalProposedBudget: fy?.total_proposed_budget ?? 0,
    lastUpdated: fy?.last_updated
      ? lastUpdatedFormatter.format(new Date(fy.last_updated))
      : budgetOverview.lastUpdated,
    heroHeading: fy?.hero_heading || budgetOverview.heroHeading,
    heroDescription: fy?.hero_description || budgetOverview.heroDescription,
    introParagraphs: fy?.intro_paragraphs?.length ? fy.intro_paragraphs : budgetOverview.introParagraphs,
    disclaimer: fy?.disclaimer || budgetOverview.disclaimer,
  };

  const stats = getBudgetStats(overview, uiCategories, uiAccomplishments);

  // "Not published yet" is a normal state — the site ships before the
  // first fiscal year is marked current — so it gets one calm, designed
  // empty panel, not three red error alerts. The anchor section nav is
  // hidden too: its three links would point at sections with nothing in
  // them. The data sections (and their nav) appear once a current
  // fiscal year exists.
  const isDataReady = !isLoading && !error && Boolean(budgetData);

  return (
    <>
      {/* Hero */}
      <PageHero
        title={overview.heroHeading}
        description={overview.heroDescription}
        overlayVariant="gradient"
        photo={{
          alt: "JOLNHS campus building, representing the school's public budget",
          label: "Insert Budget Transparency Hero Photo Here",
          recommendedSize: "1920 x 900",
        }}
      />

      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Budget Transparency" }]} />
      {isDataReady ? <BudgetSectionNav /> : null}

      {/* Intro copy */}
      <section className="bg-white py-section-sm md:py-section">
        <Container className="mx-auto max-w-3xl text-center">
          <motion.div variants={fadeUp} initial={initial} whileInView="show" viewport={viewportOnce}>
            <p className="mb-3 text-small font-semibold uppercase tracking-[0.18em] text-primary">
              {overview.introEyebrow}
            </p>
            <h2 className="text-section text-text-primary">{overview.introHeading}</h2>
            <div className="mt-6 flex flex-col gap-4">
              {overview.introParagraphs.map((paragraph, i) => (
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
            <p className="text-small text-status-warning-text">{overview.disclaimer}</p>
          </motion.div>
        </Container>
      </section>

      {isDataReady ? (
        <>
      <BudgetStatsBand stats={stats} />

      {/* Section 1: Proposed Budget */}
      <section id="proposed-budget" className="scroll-mt-36 bg-background py-section-sm md:py-section">
        <Container>
          <motion.div variants={fadeUp} initial={initial} whileInView="show" viewport={viewportOnce}>
            <p className="mb-3 text-small font-semibold uppercase tracking-[0.18em] text-primary">
              {overview.fiscalYear}
            </p>
            <h2 className="text-section text-text-primary">Proposed Budget</h2>
            <p className="mt-4 max-w-2xl text-body text-text-secondary">
              The itemized breakdown of what the school proposes to spend this fiscal year, by category. These
              figures move from "proposed" to "final" as the budget cycle progresses.
            </p>
          </motion.div>

          <div className="mt-10">
            <ProposedBudgetTable categories={uiCategories} total={overview.totalProposedBudget} />
          </div>

          <p className="mt-4 text-small text-text-secondary">Last updated: {overview.lastUpdated}</p>
        </Container>
      </section>

      {/* Section 2: Budget Allocation */}
      <section id="budget-allocation" className="scroll-mt-36 bg-white py-section-sm md:py-section">
        <Container>
          <motion.div variants={fadeUp} initial={initial} whileInView="show" viewport={viewportOnce}>
            <p className="mb-3 text-small font-semibold uppercase tracking-[0.18em] text-primary">AT A GLANCE</p>
            <h2 className="text-section text-text-primary">Budget Allocation</h2>
            <p className="mt-4 max-w-2xl text-body text-text-secondary">
              The same categories above, visualized by relative share — so it's immediately clear where the
              largest portion of the budget is going.
            </p>
          </motion.div>

          <div className="mt-10 max-w-3xl">
            <BudgetAllocationChart categories={uiCategories} />
          </div>
        </Container>
      </section>

      {/* Section 3: Accomplishments */}
      <section id="accomplishments" className="scroll-mt-36 bg-background py-section-sm md:py-section">
        <Container>
          <motion.div variants={fadeUp} initial={initial} whileInView="show" viewport={viewportOnce}>
            <p className="mb-3 text-small font-semibold uppercase tracking-[0.18em] text-primary">RESULTS</p>
            <h2 className="text-section text-text-primary">Accomplishments</h2>
            <p className="mt-4 max-w-2xl text-body text-text-secondary">
              Specific projects and programs the budget has funded, in progress, or is planning to fund next.
            </p>
          </motion.div>

          <div className="mt-10">
            <AccomplishmentsGrid accomplishments={uiAccomplishments} categories={uiCategories} />
          </div>
        </Container>
      </section>
        </>
      ) : (
        /* One status block for the whole not-ready page: skeleton while
           loading, a red alert only for genuine fetch failures, and a
           designed "coming soon" panel while no fiscal year is current. */
        <section className="bg-background py-section-sm md:py-section">
          <Container>
            {isLoading ? (
              <SkeletonRows count={4} />
            ) : error ? (
              <PageStatus variant="error" message="We couldn't load the budget information. Please try again later." />
            ) : (
              <motion.div
                variants={fadeUp}
                initial={initial}
                whileInView="show"
                viewport={viewportOnce}
                className="mx-auto max-w-xl rounded-card border border-border bg-white p-10 text-center shadow-sm"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
                  <Landmark className="h-8 w-8 text-primary" aria-hidden="true" strokeWidth={1.5} />
                </div>
                <h2 className="text-subtitle text-text-primary">Budget figures coming soon</h2>
                <p className="mt-4 text-body text-text-secondary">
                  The school is finalizing its annual budget. Once it's approved and published by the
                  administration, the proposed figures, allocation breakdown, and funded projects will
                  appear here — this page updates automatically, no announcement needed.
                </p>
              </motion.div>
            )}
          </Container>
        </section>
      )}

      {/* Closing CTA */}
      <section className="bg-primary py-section-sm md:py-section">
        <Container className="text-center">
          <motion.div variants={fadeUp} initial={initial} whileInView="show" viewport={viewportOnce} className="mx-auto max-w-2xl">
            <h2 className="text-section text-white">{overview.ctaHeading}</h2>
            <p className="mt-5 text-body text-secondary-50">{overview.ctaBlurb}</p>
            <Button variant="outline" href={overview.ctaHref} className="mt-8">
              {overview.ctaLabel}
            </Button>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
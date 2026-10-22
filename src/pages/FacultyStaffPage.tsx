import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { PageStatus } from "@/components/ui/PageStatus";
import { SkeletonGrid } from "@/components/ui/SkeletonGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AboutSubNav } from "@/components/ui/AboutSubNav";
import { FacultyCard } from "@/components/faculty/FacultyCard";
import { PrivacyNotice } from "@/components/privacy/PrivacyNotice";
import { FacultyFilterTabs } from "@/components/faculty/FacultyFilterTabs";
import { staffCategories } from "@/data/facultyStaff";
import { useAllStaffMembers } from "@/lib/data/publicStaff";
import { scaleIn, staggerContainer } from "@/lib/motion";

const VALID_CATEGORY_IDS = new Set(staffCategories.map((c) => c.id));

// Cards use fixed fractional widths (2 / 3 / 4 per row like the skeleton
// grid) inside a centered flex-wrap row instead of a count-dependent grid —
// a single matching member stays card-sized and centered rather than
// stretching a one-column grid to full container width.
const MEMBER_CARD_WIDTH =
  "w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)]";

/**
 * FacultyStaffPage
 *
 * Serves Administrators / JHS Faculty / SHS Faculty / Staff from ONE page
 * instead of four near-duplicate ones — see the nav dropdown, where each
 * of those four links here with a different `?category=` value. The page
 * reads that value on load to pre-select the matching filter tab, then
 * search/filtering happens entirely client-side.
 *
 * Category and search query are also written back to the URL (`category`,
 * `q`) as the person interacts, so a filtered/searched view can be
 * bookmarked, shared, or restored with the browser back button.
 *
 * Data is now fetched from Supabase via useAllStaffMembers() hook.
 */
export function FacultyStaffPage() {
  usePageTitle("Faculty & Staff");

  const { data: staffMembers = [], isLoading, error } = useAllStaffMembers();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCategory = searchParams.get("category");
  const initialCategory =
    requestedCategory && VALID_CATEGORY_IDS.has(requestedCategory) ? requestedCategory : "all";

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const shouldReduceMotion = useReducedMotion();

  // If the person navigates here again from a different nav link (e.g.
  // "JHS Faculty" after already being on this page filtered to
  // "Administrators"), sync the tab to the new URL param.
  useEffect(() => {
    if (requestedCategory && VALID_CATEGORY_IDS.has(requestedCategory)) {
      setActiveCategory(requestedCategory);
    }
  }, [requestedCategory]);

  function handleCategoryChange(categoryId: string) {
    setActiveCategory(categoryId);
    const next = new URLSearchParams(searchParams);
    if (categoryId === "all") {
      next.delete("category");
    } else {
      next.set("category", categoryId);
    }
    setSearchParams(next, { replace: true });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    const next = new URLSearchParams(searchParams);
    if (value.trim().length === 0) {
      next.delete("q");
    } else {
      next.set("q", value);
    }
    setSearchParams(next, { replace: true });
  }

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return staffMembers.filter((member) => {
      const matchesCategory = activeCategory === "all" || member.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        member.name.toLowerCase().includes(normalizedQuery) ||
        member.position.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query, staffMembers]);

  return (
    <>
      <PageHero
        eyebrow="About JOLNHS"
        title="Faculty & Staff"
        description="Meet the administrators, teachers, and staff members who make JOLNHS run."
        origami="owl"
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "About JOLNHS", href: "/about/overview" },
          { label: "Faculty & Staff" },
        ]}
      />
      <AboutSubNav current="/about/faculty-staff" />

      <section className="bg-surface py-section-sm md:py-section">
        <Container>
          {isLoading ? (
            <SkeletonGrid count={8} gridClassName="mt-10 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" />
          ) : error ? (
            <PageStatus variant="error" message="Failed to load faculty & staff. Please try again later." />
          ) : (
            <>
              <div className="mx-auto mb-8 max-w-md">
                <label className="relative block">
                  <span className="sr-only">Search faculty and staff</span>
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder="Search by name or position..."
                    className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-10 text-body text-text-primary placeholder:text-text-secondary outline-none focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  />
                  {query.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleQueryChange("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-border/60 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </label>
              </div>

              <FacultyFilterTabs active={activeCategory} onChange={handleCategoryChange} />

              {/* Screen-reader-only status message: sighted users see the grid
                  update instantly, but that visual change is otherwise silent
                  for anyone using a screen reader (WCAG 4.1.3 Status Messages). */}
              <p aria-live="polite" className="sr-only">
                {filteredMembers.length} staff member
                {filteredMembers.length === 1 ? "" : "s"} found
              </p>

              <PrivacyNotice className="mt-8" />

              {filteredMembers.length > 0 ? (
                <motion.div
                  key={activeCategory}
                  variants={staggerContainer}
                  initial={shouldReduceMotion ? "show" : "hidden"}
                  animate="show"
                  className="mt-10 flex flex-wrap justify-center gap-6"
                >
                  {filteredMembers.map((member) => (
                    <motion.div key={member.id} variants={scaleIn} className={MEMBER_CARD_WIDTH}>
                      <FacultyCard member={member} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <p className="mt-16 text-center text-body text-text-secondary">
                  {query.trim().length > 0
                    ? `No staff members match "${query}". Try a different search or category.`
                    : "No staff members in this category yet."}
                </p>
              )}
            </>
          )}
        </Container>
      </section>
    </>
  );
}
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AboutSubNav } from "@/components/ui/AboutSubNav";
import { FacultyCard } from "@/components/faculty/FacultyCard";
import { FacultyFilterTabs } from "@/components/faculty/FacultyFilterTabs";
import { staffMembers, staffCategories } from "@/data/facultyStaff";

const VALID_CATEGORY_IDS = new Set(staffCategories.map((c) => c.id));

/**
 * FacultyStaffPage
 *
 * Serves Administrators / JHS Faculty / SHS Faculty / Staff from ONE page
 * instead of four near-duplicate ones — see the nav dropdown, where each
 * of those four links here with a different `?category=` value. The page
 * reads that value on load to pre-select the matching filter tab, then
 * search/filtering happens entirely client-side (no backend — this is a
 * static site).
 */
export function FacultyStaffPage() {
  const [searchParams] = useSearchParams();
  const requestedCategory = searchParams.get("category");
  const initialCategory =
    requestedCategory && VALID_CATEGORY_IDS.has(requestedCategory) ? requestedCategory : "all";

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");

  // If the person navigates here again from a different nav link (e.g.
  // "JHS Faculty" after already being on this page filtered to
  // "Administrators"), sync the tab to the new URL param.
  useEffect(() => {
    if (requestedCategory && VALID_CATEGORY_IDS.has(requestedCategory)) {
      setActiveCategory(requestedCategory);
    }
  }, [requestedCategory]);

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
  }, [activeCategory, query]);

  return (
    <>
      <section className="relative overflow-hidden bg-primary py-16 text-center sm:py-20">
        <ImagePlaceholder
          alt="JOLNHS faculty in a staff meeting"
          label="Insert Faculty & Staff Header Photo Here"
          recommendedSize="1920 x 600"
          className="absolute inset-0 h-full rounded-none border-none bg-primary text-blue-100"
        />
        <div className="pointer-events-none absolute inset-0 bg-primary/75" />
        <Container className="relative">
          <p className="mb-3 text-small font-semibold uppercase tracking-widest text-secondary-light">
            About JOLNHS
          </p>
          <h1 className="text-heading text-white">Faculty &amp; Staff</h1>
          <p className="mx-auto mt-4 max-w-xl text-body text-blue-50">
            Meet the administrators, teachers, and staff members who make
            JOLNHS run.
          </p>
        </Container>
      </section>

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "About JOLNHS", href: "/about/overview" },
          { label: "Faculty & Staff" },
        ]}
      />
      <AboutSubNav current="/about/faculty-staff" />

      <section className="bg-white py-section-sm md:py-section">
        <Container>
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
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or position..."
                className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-4 text-body text-text-primary placeholder:text-text-secondary focus-visible:border-primary"
              />
            </label>
          </div>

          <FacultyFilterTabs active={activeCategory} onChange={setActiveCategory} />

          {filteredMembers.length > 0 ? (
            <motion.div
              key={activeCategory + query}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4"
            >
              {filteredMembers.map((member) => (
                <FacultyCard key={member.id} member={member} />
              ))}
            </motion.div>
          ) : (
            <p className="mt-16 text-center text-body text-text-secondary">
              {query.trim().length > 0
                ? `No staff members match "${query}". Try a different search or category.`
                : "No staff members in this category yet."}
            </p>
          )}
        </Container>
      </section>
    </>
  );
}
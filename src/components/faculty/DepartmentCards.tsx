import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Building2, ChevronDown, Users } from "lucide-react";
import { FacultyCard } from "@/components/faculty/FacultyCard";
import { compareStaffByRank } from "@/lib/staffRank";
import { scaleIn, staggerContainer, viewportOnce } from "@/lib/motion";
import type { StaffMember } from "@/lib/data/publicStaff";
import type { StaffDepartment } from "@/lib/data/staffDepartments";

/**
 * DepartmentCards — the expandable department view of a Faculty &
 * Staff category tab (JHS learning areas, SHS strands, offices).
 *
 * One card per department: name, head's name, member count. Clicking
 * expands a detail panel under the grid with the department's people —
 * head first with a "Department Head" tag, everyone else in DepEd
 * rank order. Members with no department (or whose department was
 * archived) collect in a final "Other" card.
 *
 * Same interaction contract as CampusLifeGroups: one open at a time,
 * `#dept-<slug>` deep-links, chevron/aria-expanded, reduced-motion
 * respected.
 */

interface CardItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  members: StaffMember[];
  isOther?: boolean;
}

function buildCards(departments: StaffDepartment[], members: StaffMember[]): CardItem[] {
  const activeIds = new Set(departments.map((d) => d.id));
  const cards: CardItem[] = departments.map((dept) => ({
    id: dept.id,
    slug: `dept-${dept.slug}`,
    name: dept.name,
    description: dept.description,
    members: members
      .filter((m) => m.department_id === dept.id)
      .sort(compareStaffByRank),
  }));

  // Anyone without a department — or pointing at an archived one —
  // lands in "Other" so a person never silently vanishes.
  const unassigned = members.filter((m) => !m.department_id || !activeIds.has(m.department_id));
  if (unassigned.length > 0) {
    cards.push({
      id: "other",
      slug: "dept-other",
      name: "Other",
      description: "Members who are not assigned to a department yet.",
      members: [...unassigned].sort(compareStaffByRank),
      isOther: true,
    });
  }
  return cards;
}

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function DepartmentDetail({ card }: { card: CardItem }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden"
      id={card.slug}
    >
      <div className="mt-4 rounded-card border border-border bg-surface p-6 md:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <p className="text-small font-semibold uppercase tracking-[0.18em] text-primary">
              {card.isOther ? "Unassigned" : "Department"}
            </p>
            <h3 className="mt-2 text-subtitle text-text-primary">{card.name}</h3>
            {card.description && <p className="mt-4 text-body text-text-secondary">{card.description}</p>}
            <p className="mt-4 inline-flex items-center gap-1.5 text-small font-medium text-text-secondary">
              <Users size={15} aria-hidden="true" />
              {card.members.length} member{card.members.length === 1 ? "" : "s"}
            </p>
          </div>

          <div>
            {card.members.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-4 sm:grid-cols-3"
              >
                {card.members.map((member) => (
                  <motion.div key={member.id} variants={scaleIn}>
                    <FacultyCard member={member} isHead={!!member.is_department_head} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="text-small text-text-secondary">
                No one is assigned to this {card.isOther ? "group" : "department"} yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function DepartmentCards({
  departments,
  members,
}: {
  departments: StaffDepartment[];
  members: StaffMember[];
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";

  const cards = useMemo(() => buildCards(departments, members), [departments, members]);

  useEffect(() => {
    const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (hash && cards.some((c) => c.slug === hash)) setOpenSlug(hash);
  }, [location.hash, cards]);

  const openCard = cards.find((c) => c.slug === openSlug) ?? null;

  function toggle(slug: string) {
    const next = openSlug === slug ? null : slug;
    setOpenSlug(next);
    history.replaceState(null, "", next ? `#${next}` : location.pathname + location.search);
  }

  return (
    <div className="mt-10">
      <motion.div
        variants={staggerContainer}
        initial={initial}
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {cards.map((card) => {
          const isOpen = openSlug === card.slug;
          const head = card.members.find((m) => m.is_department_head);
          return (
            <motion.button
              key={card.id}
              type="button"
              variants={scaleIn}
              onClick={() => toggle(card.slug)}
              aria-expanded={isOpen}
              aria-controls={card.slug}
              className="group overflow-hidden rounded-card border border-border bg-background text-left transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="flex items-start gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
                  <Building2 size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-semibold text-text-primary">{card.name}</span>
                  <span className="mt-0.5 block text-small text-text-secondary">
                    {card.members.length} member{card.members.length === 1 ? "" : "s"}
                  </span>
                  {head && (
                    <span className="mt-1.5 flex items-center gap-1.5 text-small text-primary">
                      {head.photo_path ? (
                        <img src={head.photo_path} alt="" aria-hidden="true" className="h-5 w-5 rounded-full object-cover" />
                      ) : (
                        <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold">
                          {initials(head.name)}
                        </span>
                      )}
                      <span className="truncate">Head: {head.name}</span>
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={18}
                  aria-hidden="true"
                  className={`mt-1 shrink-0 text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {openCard && <DepartmentDetail key={openCard.id} card={openCard} />}
      </AnimatePresence>
    </div>
  );
}

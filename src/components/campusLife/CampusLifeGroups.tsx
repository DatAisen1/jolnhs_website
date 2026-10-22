import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useCampusLifeGroups, type CampusLifeGroup, type CampusLifeGroupMember } from "@/lib/data/campusLifeGroups";
import { groupSectionConfigs, type GroupSectionConfig } from "@/data/campusLifeGroups";
import { fadeUp, scaleIn, staggerContainer, viewportOnce } from "@/lib/motion";

/**
 * CampusLifeGroups — public rendering of the Section -> Group ->
 * Members/Photos layer (migration 0015).
 *
 * A grid of group cards; clicking one expands a full-width detail
 * panel beneath the grid (accordion-below-grid, like a drawer). One
 * group open at a time. `#group-slug` deep-links open the matching
 * group on load, so /campus-life/athletes#basketball is shareable.
 *
 * Privacy: members whose role disallows a photo (players — minors)
 * render as a compact name + position list, never as photo cards.
 */

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MemberPhotoCard({ member }: { member: CampusLifeGroupMember }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-border bg-surface p-5 text-center">
      {member.photo_url ? (
        <img
          src={member.photo_url}
          alt={`${member.name}${member.position ? `, ${member.position}` : ""}`}
          loading="lazy"
          className="h-20 w-20 rounded-full border-2 border-primary/15 object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/15 bg-primary/10 font-heading text-lg text-primary"
        >
          {initials(member.name)}
        </span>
      )}
      <p className="mt-3 text-small font-semibold text-text-primary">{member.name}</p>
      {member.position && <p className="mt-0.5 text-small text-text-secondary">{member.position}</p>}
    </div>
  );
}

function GroupDetail({ group, config }: { group: CampusLifeGroup; config: GroupSectionConfig }) {
  const Icon = config.icon;
  const shouldReduceMotion = useReducedMotion();

  // Leaders get photo cards; roles without photo permission (players)
  // go to the compact roster list — name + position only.
  const photoMembers = group.members.filter((m) => config.roles[m.role]?.allowsPhoto);
  const rosterMembers = group.members.filter((m) => !config.roles[m.role]?.allowsPhoto);

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden"
      id={`group-${group.slug}`}
    >
      <div className="mt-4 rounded-card border border-border bg-background p-6 md:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          {/* Left: identity */}
          <div>
            <p className="text-small font-semibold uppercase tracking-[0.18em] text-primary">
              {config.groupNoun}
            </p>
            <h3 className="mt-2 text-subtitle text-text-primary">{group.name}</h3>
            {group.description ? (
              <p className="mt-4 text-body text-text-secondary">{group.description}</p>
            ) : (
              <p className="mt-4 text-body text-text-secondary">Details for this {config.groupNoun.toLowerCase()} are being finalized.</p>
            )}
            {group.members.length > 0 && (
              <p className="mt-4 inline-flex items-center gap-1.5 text-small font-medium text-text-secondary">
                <Users size={15} aria-hidden="true" />
                {group.members.length} member{group.members.length === 1 ? "" : "s"}
              </p>
            )}
          </div>

          {/* Right: people + photos */}
          <div className="space-y-8">
            {photoMembers.length > 0 && (
              <div>
                <h4 className="mb-4 text-small font-semibold uppercase tracking-[0.14em] text-text-secondary">
                  {config.slug === "athletes" ? "Coaching Staff" : "Leadership"}
                </h4>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {photoMembers.map((member) => (
                    <MemberPhotoCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            )}

            {rosterMembers.length > 0 && (
              <div>
                <h4 className="mb-4 text-small font-semibold uppercase tracking-[0.14em] text-text-secondary">
                  {config.slug === "athletes" ? "Team Roster" : "Members"}
                </h4>
                <ul className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                  {rosterMembers.map((member) => (
                    <li key={member.id} className="flex items-baseline justify-between gap-3 border-b border-border/60 py-2 text-small">
                      <span className="font-medium text-text-primary">{member.name}</span>
                      {member.position && <span className="shrink-0 text-text-secondary">{member.position}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {group.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {group.photos.map((photo) => (
                  <figure key={photo.id}>
                    <img
                      src={photo.url}
                      alt={photo.caption ?? `${group.name} photo`}
                      loading="lazy"
                      className="aspect-[4/3] w-full rounded-md border border-border object-cover"
                    />
                    {photo.caption && (
                      <figcaption className="mt-1.5 text-small text-text-secondary">{photo.caption}</figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}

            {group.members.length === 0 && group.photos.length === 0 && (
              <p className="flex items-center gap-2 text-small text-text-secondary">
                <Icon size={16} aria-hidden="true" />
                Members and photos will be added soon.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CampusLifeGroups({
  sectionSlug,
  fallback = null,
}: {
  sectionSlug: string;
  /** Rendered when the groups query can't return data at all — e.g.
   *  migration 0015 not yet applied. Lets the caller keep the legacy
   *  officers band visible until groups exist. */
  fallback?: React.ReactNode;
}) {
  const config = groupSectionConfigs[sectionSlug];
  const { data: groups, isLoading, isError } = useCampusLifeGroups(sectionSlug);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? "show" : "hidden";

  // Deep-link: #<group-slug> opens that group on load and when the
  // hash changes (e.g. a shared link pasted into the address bar).
  useEffect(() => {
    const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (hash && groups?.some((g) => g.slug === hash)) setOpenSlug(hash);
  }, [location.hash, groups]);

  if (!config) return null;
  // While loading, render nothing — a flash of the fallback then the
  // groups would look like a glitch. On error (table not migrated),
  // the caller's fallback keeps the page honest.
  if (isLoading) return null;
  if (isError || !groups) return <>{fallback}</>;

  const openGroup = groups?.find((g) => g.slug === openSlug) ?? null;

  function toggle(slug: string) {
    const next = openSlug === slug ? null : slug;
    setOpenSlug(next);
    // Keep the URL in sync so the open group is shareable — replaceState
    // avoids a scroll jump and doesn't spam the history stack.
    history.replaceState(null, "", next ? `#${next}` : location.pathname);
  }

  return (
    <section className="bg-surface py-section-sm md:py-section" aria-labelledby="campus-life-groups-heading">
      <Container>
        <motion.div
          variants={fadeUp}
          initial={initial}
          whileInView="show"
          viewport={viewportOnce}
          className="text-center"
        >
          <p className="text-small font-semibold uppercase tracking-[0.18em] text-primary">{config.bandEyebrow}</p>
          <h2 id="campus-life-groups-heading" className="mt-3 text-section text-text-primary">
            {config.bandHeading}
          </h2>
        </motion.div>

        {groups && groups.length === 0 && (
          <div className="mx-auto mt-10 max-w-md rounded-card border border-dashed border-border bg-background px-6 py-10 text-center">
            <config.icon size={28} className="mx-auto text-primary" aria-hidden="true" />
            <p className="mt-3 text-body font-semibold text-text-primary">{config.emptyTitle}</p>
            <p className="mt-1 text-small text-text-secondary">{config.emptyBody}</p>
          </div>
        )}

        {groups && groups.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial={initial}
            whileInView="show"
            viewport={viewportOnce}
            className="mt-10"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => {
                const isOpen = openSlug === group.slug;
                return (
                  <motion.button
                    key={group.id}
                    type="button"
                    variants={scaleIn}
                    onClick={() => toggle(group.slug)}
                    aria-expanded={isOpen}
                    aria-controls={`group-${group.slug}`}
                    className="group overflow-hidden rounded-card border border-border bg-background text-left transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    {group.cover_image_url ? (
                      <img
                        src={group.cover_image_url}
                        alt=""
                        loading="lazy"
                        className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <span className="flex aspect-[16/9] w-full items-center justify-center bg-primary/10">
                        <config.icon size={40} className="text-primary/40" aria-hidden="true" />
                      </span>
                    )}
                    <span className="flex items-center justify-between gap-3 p-5">
                      <span>
                        <span className="block text-body font-semibold text-text-primary">{group.name}</span>
                        <span className="mt-1 block text-small text-text-secondary">
                          {group.members.length} member{group.members.length === 1 ? "" : "s"}
                        </span>
                      </span>
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className={`shrink-0 text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {openGroup && <GroupDetail key={openGroup.id} group={openGroup} config={config} />}
            </AnimatePresence>
          </motion.div>
        )}
      </Container>
    </section>
  );
}

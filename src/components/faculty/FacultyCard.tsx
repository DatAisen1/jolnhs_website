import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { StaffMember } from "@/data/facultyStaff";

/**
 * FacultyCard
 *
 * WHAT: Photo → name → position, exactly as specified — nothing else.
 * WHY:  A staff directory card doesn't need a bio link, a department
 *       badge, or social icons to do its job; every extra element is
 *       something a visitor has to visually filter out to find the name
 *       they're scanning for.
 * WHEN NOT: If this project later adds individual staff bio pages, THAT's
 *           the moment to add a "Read more" link here — not before there's
 *           actually something to link to.
 */
export function FacultyCard({ member }: { member: StaffMember }) {
  return (
    <article className="group overflow-hidden rounded-card border border-border bg-white transition-shadow duration-200 hover:shadow-md">
      <div className="aspect-[4/5] w-full overflow-hidden">
        {member.photo ? (
          <img
            src={member.photo}
            alt={member.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder
            alt={`Photo of ${member.name}`}
            label="Add Photo"
            recommendedSize="600 x 750"
            className="h-full rounded-none border-none"
          />
        )}
      </div>
      <div className="p-4 text-center">
        <p className="text-body font-semibold text-primary">{member.name}</p>
        <p className="mt-1 text-small text-text-secondary">{member.position}</p>
      </div>
    </article>
  );
}
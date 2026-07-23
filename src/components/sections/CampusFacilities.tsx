import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { facilities } from "@/data/facilities";
import type { Facility } from "@/types";

/**
 * One reusable full-bleed row: image touches the section edge, text sits
 * in a padded column, background alternates light/dark per facility.
 * Mirrors the reference's white-bg / navy-bg alternating facility blocks.
 */
function FacilityRow({ facility }: { facility: Facility }) {
  const imageFirst = facility.imagePosition === "left";
  const isDark = facility.theme === "dark";

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 ${
        isDark ? "bg-primary" : "bg-white"
      }`}
    >
      <div className={imageFirst ? "lg:order-1" : "lg:order-2"}>
        <ImagePlaceholder
          alt={`Photo of the ${facility.name}`}
          label={facility.name}
          recommendedSize={facility.imageSize}
          className="min-h-[280px] rounded-none border-none"
        />
      </div>
      <div
        className={`flex flex-col justify-center px-8 py-12 sm:px-14 ${
          imageFirst ? "lg:order-2" : "lg:order-1"
        }`}
      >
        <h3 className={`text-subtitle ${isDark ? "text-white" : "text-text-primary"}`}>
          {facility.name}
        </h3>
        <p className={`mt-4 max-w-md text-body ${isDark ? "text-blue-50" : "text-text-secondary"}`}>
          {facility.description}
        </p>
      </div>
    </div>
  );
}

export function CampusFacilities() {
  return (
    <section aria-label="Campus Facilities">
      <Container className="!max-w-none !px-0">
        <div className="flex flex-col">
          {facilities.map((facility) => (
            <FacilityRow key={facility.id} facility={facility} />
          ))}
        </div>
      </Container>
    </section>
  );
}

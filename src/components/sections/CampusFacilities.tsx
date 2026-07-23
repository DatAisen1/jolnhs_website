import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { facilities } from "@/data/facilities";
import type { Facility } from "@/types";

/** One reusable row instead of hand-writing 4 near-identical layouts. */
function FacilityRow({ facility }: { facility: Facility }) {
  const imageFirst = facility.imagePosition === "left";

  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
      <div className={imageFirst ? "lg:order-1" : "lg:order-2"}>
        <ImagePlaceholder
          alt={`Photo of the ${facility.name}`}
          label={facility.name}
          recommendedSize={facility.imageSize}
        />
      </div>
      <div className={imageFirst ? "lg:order-2" : "lg:order-1"}>
        <h3 className="text-subtitle text-text-primary">{facility.name}</h3>
        <p className="mt-4 text-body text-text-secondary">
          {facility.description}
        </p>
      </div>
    </div>
  );
}

export function CampusFacilities() {
  return (
    <section className="bg-white py-section-sm md:py-section" aria-labelledby="facilities-heading">
      <Container>
        <SectionHeading
          eyebrow="Campus"
          title="Campus Facilities"
          subtitle="Spaces built to support every program, from science research to varsity training."
        />

        <div className="mt-14 flex flex-col gap-16">
          {facilities.map((facility) => (
            <FacilityRow key={facility.id} facility={facility} />
          ))}
        </div>
      </Container>
    </section>
  );
}

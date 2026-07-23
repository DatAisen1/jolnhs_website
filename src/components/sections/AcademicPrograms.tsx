import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { programs } from "@/data/programs";

export function AcademicPrograms() {
  return (
    <section className="py-section-sm md:py-section" aria-labelledby="programs-heading">
      <Container>
        <SectionHeading
          eyebrow="Academics"
          title="Academic Programs"
          subtitle="Four distinct pathways designed around how our learners think, create, and grow."
        />

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((program) => (
            <Card as="article" key={program.id} className="flex flex-col p-0 overflow-hidden">
              <ImagePlaceholder
                alt={`Photo representing the ${program.name} program`}
                label={program.acronym}
                recommendedSize={program.imageSize}
                className="min-h-[160px] rounded-none border-x-0 border-t-0"
              />
              <div className="p-card">
                <h3 className="text-subtitle text-text-primary">
                  {program.acronym}
                </h3>
                <p className="mt-1 text-small font-medium text-secondary">
                  {program.name}
                </p>
                <p className="mt-3 text-body text-text-secondary">
                  {program.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

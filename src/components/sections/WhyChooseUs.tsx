import { GraduationCap, Users, HeartHandshake } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { features } from "@/data/stats";
import type { FeatureCard } from "@/types";

const icons: Record<FeatureCard["icon"], typeof GraduationCap> = {
  quality: GraduationCap,
  inclusive: Users,
  community: HeartHandshake,
};

/**
 * Rendered on the primary blue background (unlike the reference, which used
 * a busy background photo here) — a flat, confident color block reads more
 * premium and keeps text contrast reliably at AA without an overlay.
 */
export function WhyChooseUs() {
  return (
    <section className="bg-primary py-section-sm md:py-section" aria-labelledby="why-heading">
      <Container>
        <SectionHeading
          eyebrow="Why JOLNHS"
          title="Why Choose JOLNHS?"
          subtitle="A learning community built on quality instruction, genuine inclusion, and shared purpose."
          align="center"
          light
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {features.map((feature) => {
            const Icon = icons[feature.icon];
            return (
              <Card
                key={feature.id}
                as="article"
                className="border-white/10 bg-white/5 text-center backdrop-blur-sm"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary/20">
                  <Icon className="h-7 w-7 text-secondary" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-subtitle text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-body text-blue-100">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

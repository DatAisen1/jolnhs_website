import { Container } from "@/components/ui/Container";
import { useCountUp } from "@/hooks/useCountUp";
import { stats } from "@/data/stats";
import type { StatItem } from "@/types";

function Counter({ stat }: { stat: StatItem }) {
  const { value, ref } = useCountUp(stat.value);
  return (
    <div ref={ref} className="text-center">
      <p className="text-heading text-primary">
        {value.toLocaleString()}
        {stat.suffix}
      </p>
      <p className="mt-2 text-body text-text-secondary">{stat.label}</p>
    </div>
  );
}

export function SchoolStatistics() {
  return (
    <section className="bg-background py-section-sm md:py-section" aria-labelledby="stats-heading">
      <Container>
        <h2 id="stats-heading" className="sr-only">
          School Statistics
        </h2>
        <div className="grid grid-cols-2 gap-8 rounded-card border border-border bg-white p-card sm:grid-cols-4">
          {stats.map((stat) => (
            <Counter key={stat.id} stat={stat} />
          ))}
        </div>
      </Container>
    </section>
  );
}

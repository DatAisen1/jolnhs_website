import type { StatItem, FeatureCard } from "@/types";

export const stats: StatItem[] = [
  { id: "students", label: "Students", value: 3200, suffix: "+" },
  { id: "teachers", label: "Teachers", value: 145, suffix: "+" },
  { id: "programs", label: "Academic Programs", value: 5 },
  { id: "graduation", label: "Graduation Rate", value: 98, suffix: "%" },
];

export const features: FeatureCard[] = [
  {
    id: "quality",
    icon: "quality",
    title: "Quality Education",
    description:
      "A research-driven curriculum delivered by qualified, dedicated educators committed to student success.",
  },
  {
    id: "inclusive",
    icon: "inclusive",
    title: "Inclusive Learning",
    description:
      "Programs and support systems designed so every learner, including those with special needs, can thrive.",
  },
  {
    id: "community",
    icon: "community",
    title: "Community Excellence",
    description:
      "A strong partnership between students, faculty, families, and the local community drives shared achievement.",
  },
];

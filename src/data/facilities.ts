import type { Facility } from "@/types";

// Alternating light/dark theme mirrors the reference's white-bg / navy-bg
// row pattern (Stella Maris Hall on white, Mac Laboratory on navy, etc.)
export const facilities: Facility[] = [
  {
    id: "library",
    name: "JOLNHS Library",
    description:
      "A quiet, well-organized space with a growing print and digital collection, dedicated reading areas, and research assistance for students and faculty.",
    imageSize: "1200 x 800",
    imagePosition: "right",
    theme: "light",
  },
  {
    id: "ict-lab",
    name: "ICT Laboratory",
    description:
      "Modern workstations with reliable connectivity supporting the SP-ICT program, computer literacy classes, and digital skills training.",
    imageSize: "1200 x 800",
    imagePosition: "right",
    theme: "dark",
  },
  {
    id: "science-lab",
    name: "Science Laboratory",
    description:
      "Fully equipped for chemistry, physics, and biology experiments, giving STE students a safe, hands-on environment to apply what they learn.",
    imageSize: "1200 x 800",
    imagePosition: "left",
    theme: "light",
  },
  {
    id: "gymnasium",
    name: "Gymnasium",
    description:
      "A multi-purpose covered court used for physical education, intramurals, assemblies, and school-wide events throughout the year.",
    imageSize: "1200 x 800",
    imagePosition: "right",
    theme: "dark",
  },
];

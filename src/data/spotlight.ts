// Content for the "spotlight" split blocks right under the hero (mirrors
// the reference's "Bachelor of Science in Tourism Management" split
// section) — one entry per featured program. Add, remove, or reorder
// entries here; no component code changes needed. `imagePosition`
// alternates which side the image sits on so stacked entries don't read
// as one repeating image-heavy pattern.

export interface ProgramSpotlightItem {
  eyebrow: string;
  title: string;
  description: string;
  imageSize: string;
  imagePosition: "left" | "right";
}

export const spotlights: ProgramSpotlightItem[] = [
  {
    eyebrow: "Featured Program",
    title: "Special Program in ICT",
    description:
      "Julia Ortiz Luis National High School offers the Special Program in ICT (SP-ICT) under its academic department, developing programming, digital media, and systems thinking skills for the next generation of technology-driven graduates.",
    imageSize: "800 x 800",
    imagePosition: "left",
  },
  {
    eyebrow: "Featured Program",
    title: "Science, Technology, and Engineering (STE)",
    description:
      "Julia Ortiz Luis National High School offers the Special Program in Science, Technology, and Engineering (STE) under its academic department, strengthening laboratory research, advanced mathematics, and scientific inquiry skills for the next generation of STEM-driven graduates.",
    imageSize: "800 x 800",
    imagePosition: "right",
  },
];
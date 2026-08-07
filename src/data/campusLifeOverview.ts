// Content for the Campus Life landing page. Edit freely — no component
// code changes needed for text updates. Mirrors academicsOverview.ts /
// aboutOverview.ts's role for their own sections.

export interface CampusLifeQuote {
  quote: string;
  name: string;
  role: string;
}

export const campusLifeOverview = {
  heroHeading: "Campus Life at JOLNHS",
  heroDescription:
    "Academics is only part of the JOLNHS experience. Step outside the classroom and you'll find a campus built on organizations, sports, journalism, and a parent community that shows up — a place where every student can find where they belong.",

  introEyebrow: "BEYOND THE CLASSROOM",
  introHeading: "A Community Built Together",
  introParagraphs: [
    "At Julia Ortiz Luis National High School, campus life is where students figure out who they are outside a report card. Whether it's running for student government, training for a regional meet, or writing for the school paper, every organization on this campus exists because students asked for it and adults showed up to make it real.",
    "None of it happens in isolation. Parents volunteer their time through the PTA, faculty advisers coach clubs on top of their teaching load, and student leaders mentor the grade levels behind them. It's this overlap — students, teachers, and families all pulling in the same direction — that makes JOLNHS feel like a community, not just a school.",
  ],

  communityStats: [
    { label: "Active Organizations", value: "18+" },
    { label: "Student Athletes", value: "180+" },
    { label: "PTA Homeroom Chapters", value: "32" },
    { label: "Campus Events per Year", value: "60+" },
  ],

  quotes: [
    {
      quote:
        "Joining the SSG taught me more about handling responsibility than any single subject could. I learned to plan an event from scratch and actually see it through.",
      name: "Student Council Officer",
      role: "Grade 11, Supreme Student Government",
    },
    {
      quote:
        "Being a campus journalist made me pay attention to everything happening around school. I never thought I'd end up loving deadlines.",
      name: "Staff Writer",
      role: "Grade 10, Campus Journalists",
    },
  ] satisfies CampusLifeQuote[],

  taglineHeading: "Every Day Here Is a Chance to Belong.",

  ctaHeading: "Ready to Get Involved?",
  ctaBlurb:
    "Whichever door you walk through first — a club, a team, the newsroom, or the PTA — there's a place for you here. Reach out and we'll point you to the right one.",
  ctaLabel: "Get in Touch",
  ctaHref: "/contact",
};
import { Users, HeartHandshake, Trophy, Newspaper, Camera } from "lucide-react";
import type { CampusLifeSection } from "@/types";

// Content for every Campus Life sub-page. Edit freely — no component code
// changes needed for text updates. These are reasonable placeholders, not
// confirmed figures; swap in real numbers and copy as they become available.
//
// `slug` drives three things at once: the header dropdown link
// (data/navigation.ts), the card on the Campus Life landing page, and the
// route this same data renders at (/campus-life/:slug) — see
// CampusLifeSection's doc comment in types/index.ts for why.
export const campusLifeSections: CampusLifeSection[] = [
  {
    id: "organizations",
    slug: "organizations",
    icon: Users,
    eyebrow: "STUDENT LIFE",
    name: "Student Organizations",
    tagline: "Find your people, find your purpose.",
    description:
      "From the Supreme Student Government to subject-based and special-interest clubs, JOLNHS organizations give every student a place to lead, create, and grow outside the classroom. Whichever club a student joins, the goal is the same: turn a shared interest into real skill, and real skill into confidence.",
    theme: "dark",
    stats: [
      { label: "Active Organizations", value: "18+" },
      { label: "Student Members", value: "1,200+" },
      { label: "Events per Year", value: "40+" },
    ],
    highlights: [
      {
        title: "Supreme Student Government",
        description:
          "The elected student body that represents the whole student population, runs school-wide initiatives, and gives students a direct voice in campus decisions.",
      },
      {
        title: "Subject-Based Clubs",
        description:
          "Science, Math, English, and Filipino clubs that turn classroom subjects into competitions, workshops, and peer-led study sessions.",
      },
      {
        title: "Special Interest Clubs",
        description:
          "Arts, music, robotics, environment, and volunteer clubs built around what students are genuinely curious about, not just what's required.",
      },
      {
        title: "Leadership Training",
        description:
          "Officer bootcamps and mentorship from faculty advisers that prepare student leaders to plan, budget, and run their own events.",
      },
    ],
    gallery: [
      { label: "SSG Induction Ceremony", imageSize: "800 x 600" },
      { label: "Club Fair Day", imageSize: "800 x 600" },
      { label: "Leadership Summit", imageSize: "800 x 600" },
      { label: "Officer Elections", imageSize: "800 x 600" },
    ],
    ctaLabel: "Join a Student Organization",
    ctaHref: "/contact",
  },
  {
    id: "pta",
    slug: "pta",
    icon: HeartHandshake,
    eyebrow: "PARTNERSHIP",
    name: "Parents–Teachers Association",
    tagline: "A partnership built on a shared commitment to every learner.",
    description:
      "The JOLNHS PTA connects every homeroom to the school administration, turning parent involvement into real support — from classroom resources to campus improvement projects. It's the bridge that makes sure no family feels like an outsider to their child's education.",
    theme: "light",
    stats: [
      { label: "Homeroom Chapters", value: "32" },
      { label: "Active Parent Volunteers", value: "250+" },
      { label: "Years of Partnership", value: "15+" },
    ],
    highlights: [
      {
        title: "General Assembly",
        description:
          "A school-wide meeting held each quarter where parents hear directly from administrators and raise concerns as a collective voice.",
      },
      {
        title: "Homeroom PTA Chapters",
        description:
          "Every section has its own parent chapter that meets with the adviser to support that specific classroom's needs.",
      },
      {
        title: "School Support Programs",
        description:
          "Parent-funded initiatives for classroom repairs, learning materials, and student welfare projects identified each school year.",
      },
      {
        title: "Parent Volunteer Corps",
        description:
          "Parents who help run enrollment days, campus clean-ups, and school events throughout the year.",
      },
    ],
    gallery: [
      { label: "PTA General Assembly", imageSize: "800 x 600" },
      { label: "Campus Improvement Day", imageSize: "800 x 600" },
      { label: "Homeroom Chapter Meeting", imageSize: "800 x 600" },
    ],
    ctaLabel: "Get Involved as a Parent",
    ctaHref: "/contact",
  },
  {
    id: "athletes",
    slug: "athletes",
    icon: Trophy,
    eyebrow: "SPORTS & WELLNESS",
    name: "Student Athletes",
    tagline: "Discipline on the court. Character for life.",
    description:
      "JOLNHS varsity teams train year-round across a full slate of sports, competing at the district and regional level while keeping academics the top priority. Beyond the medals, the athletics program builds the discipline, teamwork, and resilience that carry over long after the final whistle.",
    theme: "light",
    stats: [
      { label: "Varsity Teams", value: "12" },
      { label: "Student Athletes", value: "180+" },
      { label: "Regional Medals (Last SY)", value: "27" },
    ],
    highlights: [
      {
        title: "Varsity Program",
        description:
          "Basketball, volleyball, track and field, badminton, and more — each team coached by faculty with a sport-specific training plan.",
      },
      {
        title: "Intramurals",
        description:
          "A school-wide sports festival open to every student, not just varsity athletes, held each year to build campus-wide school spirit.",
      },
      {
        title: "Strength & Conditioning",
        description:
          "Structured off-season training that keeps athletes competition-ready and reduces injury risk during the school year.",
      },
      {
        title: "Path to Palarong Pambansa",
        description:
          "A clear pipeline from district meets to regional competition for athletes who want to represent JOLNHS at the national level.",
      },
    ],
    gallery: [
      { label: "Regional Meet Team Photo", imageSize: "800 x 600" },
      { label: "Intramurals Opening", imageSize: "800 x 600" },
      { label: "Volleyball Championship", imageSize: "800 x 600" },
      { label: "Track and Field Training", imageSize: "800 x 600" },
    ],
    ctaLabel: "Try Out for a Team",
    ctaHref: "/contact",
  },
  {
    id: "journalists",
    slug: "journalists",
    icon: Newspaper,
    eyebrow: "VOICE OF JOLNHS",
    name: "Campus Journalists",
    tagline: "Every story starts in this newsroom.",
    description:
      "The JOLNHS campus paper is written, edited, photographed, and laid out entirely by students, covering everything from academic milestones to student life. Campus journalism here isn't a once-a-year requirement — it's a working newsroom that trains writers, editors, and photographers for regional press conferences.",
    theme: "light",
    stats: [
      { label: "Publications per Year", value: "4" },
      { label: "Writers & Editors", value: "35" },
      { label: "Regional Press Con Awards", value: "9" },
    ],
    highlights: [
      {
        title: "The School Paper",
        description:
          "A quarterly publication covering news, features, editorials, and sports — the official record of the JOLNHS school year.",
      },
      {
        title: "Campus Journalism Training",
        description:
          "Writing workshops led by the paper's faculty adviser that prepare students for district and regional press conferences.",
      },
      {
        title: "Photojournalism",
        description:
          "Student photographers who document every major campus event, building the visual archive for the paper and the Campus Gallery.",
      },
      {
        title: "Broadcast & Video",
        description:
          "A growing video desk producing short campus recaps and announcements for the school's social media channels.",
      },
    ],
    gallery: [
      { label: "Newsroom Layout Session", imageSize: "800 x 600" },
      { label: "Press Conference Delegation", imageSize: "800 x 600" },
      { label: "Interview in Progress", imageSize: "800 x 600" },
    ],
    ctaLabel: "Join the Newsroom",
    ctaHref: "/contact",
  },
  {
    id: "gallery",
    slug: "gallery",
    icon: Camera,
    eyebrow: "MOMENTS",
    name: "Campus Gallery",
    tagline: "A living scrapbook of everyday JOLNHS.",
    description:
      "From flag ceremonies to championship wins, the Campus Gallery is where every corner of JOLNHS life gets documented — academics, sports, culture, and the small everyday moments in between. Most of it is shot by our own campus journalists and student volunteers.",
    theme: "light",
    stats: [
      { label: "Photos Archived", value: "1,000+" },
      { label: "Events Covered", value: "60+" },
      { label: "School Years Documented", value: "5" },
    ],
    highlights: [
      {
        title: "Academic Events",
        description: "Recognition days, science fairs, and quarterly assemblies captured in full.",
      },
      {
        title: "Sports & Competitions",
        description: "Game-day action shots and medal-ceremony moments from every varsity season.",
      },
      {
        title: "Culture & Arts",
        description: "Foundation week performances, art exhibits, and cultural showcases throughout the year.",
      },
      {
        title: "Community Outreach",
        description: "Clean-up drives, feeding programs, and off-campus service projects.",
      },
    ],
    gallery: [
      { label: "Foundation Week Highlights", imageSize: "800 x 600" },
      { label: "Recognition Day", imageSize: "800 x 600" },
      { label: "Science Fair", imageSize: "800 x 600" },
      { label: "Community Outreach Day", imageSize: "800 x 600" },
      { label: "Championship Celebration", imageSize: "800 x 600" },
      { label: "Cultural Showcase", imageSize: "800 x 600" },
    ],
    ctaLabel: "Submit Your Photos",
    ctaHref: "/contact",
  },
];
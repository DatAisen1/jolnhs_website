import { FlaskConical, Cpu, HeartHandshake, BookOpen } from "lucide-react";
import type { AcademicProgram } from "@/types";

// Order here is the display order on the Academics landing page. Each
// `slug` matches the trailing segment of its dropdown href in
// data/navigation.ts (e.g. "/academics/ste" -> "ste") — that's the single
// place drift between the header menu, AcademicsSubNav, and the
// /academics/:slug detail page would show up, so keep them in sync if
// either changes. Every field here is content, not layout — edit freely,
// no component code changes needed for text updates.
export const academicPrograms: AcademicProgram[] = [
  {
    id: "ste",
    slug: "ste",
    eyebrow: "Junior High School Track",
    name: "STE",
    fullName: "Science, Technology, and Engineering",
    description:
      "An enriched curriculum for learners with a strong aptitude in science and mathematics — extra laboratory work, research projects, and advanced coursework in our Science Laboratory that builds a foundation for STEM pathways beyond high school.",
    imagePosition: "right",
    theme: "light",
    visual: { kind: "icon", icon: FlaskConical },
    quickFacts: [
      { label: "Grade Levels", value: "Grade 7 – 10" },
      { label: "Class Size", value: "~35 learners per section" },
      { label: "Curriculum Standard", value: "DepEd K-12 + Enriched Science" },
    ],
    highlights: [
      {
        title: "Hands-On Laboratory Work",
        description:
          "Regular access to our Science Laboratory for chemistry, physics, and biology experiments beyond the standard curriculum.",
      },
      {
        title: "Research Projects",
        description:
          "Students complete guided research investigations each year, building skills they'll use in STEM fields beyond high school.",
      },
      {
        title: "Advanced Coursework",
        description:
          "An accelerated pace in science and mathematics subjects compared to the Regular Program.",
      },
    ],
    admissionRequirements: [
      "Passing score on the STE qualifying examination",
      "Grade 6 average of at least 85% (or equivalent for transferees)",
      "Completed Form 138 (report card) and good moral character certificate",
      "Interview with the STE coordinator",
    ],
  },
  {
    id: "sp-ict",
    slug: "sp-ict",
    eyebrow: "Junior High School Track",
    name: "SP-ICT",
    fullName: "Special Program in Information and Communications Technology",
    description:
      "Practical computer literacy and digital skills — from basic programming to computer hardware servicing and multimedia — taught in our dedicated ICT Laboratory, preparing students for both further study and entry-level tech work.",
    imagePosition: "left",
    theme: "dark",
    visual: { kind: "icon", icon: Cpu },
    quickFacts: [
      { label: "Grade Levels", value: "Grade 7 – 10" },
      { label: "Lab Access", value: "Dedicated ICT Laboratory" },
      { label: "Curriculum Standard", value: "DepEd K-12 + ICT Specialization" },
    ],
    highlights: [
      {
        title: "Computer Literacy Foundations",
        description:
          "From operating systems and productivity software to introductory programming concepts.",
      },
      {
        title: "Hardware Servicing",
        description:
          "Practical training in computer assembly, troubleshooting, and basic hardware maintenance.",
      },
      {
        title: "Multimedia Skills",
        description: "Exposure to graphic design, video editing, and other digital media tools.",
      },
    ],
    admissionRequirements: [
      "Passing score on the SP-ICT qualifying examination",
      "Grade 6 average of at least 83% (or equivalent for transferees)",
      "Completed Form 138 (report card) and good moral character certificate",
      "Basic computer literacy assessment",
    ],
  },
  {
    id: "sned",
    slug: "sned",
    eyebrow: "Junior High School Track",
    name: "SNED",
    fullName: "Special Needs Education",
    description:
      "Individualized learning plans, specially trained teachers, and an inclusive classroom environment where learners with diverse needs are supported to reach their full potential, at their own pace.",
    imagePosition: "right",
    theme: "light",
    visual: { kind: "icon", icon: HeartHandshake },
    quickFacts: [
      { label: "Grade Levels", value: "Grade 7 – 10" },
      { label: "Class Size", value: "Small-group, individualized instruction" },
      { label: "Curriculum Standard", value: "DepEd K-12 + Individualized Education Plans" },
    ],
    highlights: [
      {
        title: "Individualized Learning Plans",
        description: "Each learner's program is tailored to their specific needs, strengths, and pace.",
      },
      {
        title: "Specially Trained Teachers",
        description: "SNED faculty receive ongoing training in inclusive and special education strategies.",
      },
      {
        title: "Inclusive Support Environment",
        description: "A classroom culture built around patience, encouragement, and every learner's dignity.",
      },
    ],
    admissionRequirements: [
      "Psycho-educational or medical assessment/diagnosis (if available)",
      "Completed Form 138 and any prior Individualized Education Plan (IEP) documents",
      "Intake interview with the SNED coordinator and parent/guardian",
      "Open enrollment — no qualifying exam required",
    ],
  },
  {
    id: "regular",
    slug: "regular",
    eyebrow: "Junior High School Track",
    name: "Regular Program",
    fullName: "Junior High School — Regular Program",
    description:
      "The standard DepEd Junior High School curriculum, giving every learner a solid academic foundation across all core subjects — supported by our full range of co-curricular activities and student services.",
    imagePosition: "left",
    theme: "dark",
    visual: { kind: "icon", icon: BookOpen },
    quickFacts: [
      { label: "Grade Levels", value: "Grade 7 – 10" },
      { label: "Class Size", value: "~40 – 45 learners per section" },
      { label: "Curriculum Standard", value: "DepEd K-12 Core Curriculum" },
    ],
    highlights: [
      {
        title: "Full Core Curriculum",
        description:
          "All DepEd-mandated subjects: Filipino, English, Mathematics, Science, Araling Panlipunan, and more.",
      },
      {
        title: "Co-Curricular Activities",
        description: "Access to school clubs, intramurals, and student organizations alongside academics.",
      },
      {
        title: "Foundation for Any Track",
        description: "A well-rounded base that keeps every pathway — SHS academic or tech-voc — open.",
      },
    ],
    admissionRequirements: [
      "Completed Form 138 (report card) from Grade 6",
      "PSA birth certificate (original and photocopy)",
      "Good moral character certificate from previous school",
      "Open enrollment during the official DepEd enrollment period",
    ],
  },
  {
    id: "shs",
    slug: "shs",
    eyebrow: "Grades 11 – 12",
    name: "Senior High School",
    fullName: "Senior High School",
    description:
      "Academic and technical-vocational tracks aligned with the K-12 curriculum, giving Grade 11 and 12 learners a focused path toward college, employment, or entrepreneurship after graduation.",
    imagePosition: "right",
    theme: "light",
    visual: { kind: "photo", imageSize: "1200 x 800" },
    quickFacts: [
      { label: "Grade Levels", value: "Grade 11 – 12" },
      { label: "Curriculum Standard", value: "DepEd K-12 Senior High School Program" },
      { label: "Tracks Offered", value: "Academic & Technical-Vocational" },
    ],
    highlights: [
      {
        title: "Career-Aligned Strands",
        description: "Choose a strand that matches your goals — college prep, technical skills, or entrepreneurship.",
      },
      {
        title: "Work Immersion",
        description: "Grade 12 learners complete a hands-on work immersion component connected to their strand.",
      },
      {
        title: "College & Career Readiness",
        description: "Strand-specific electives and culminating projects that prepare learners for what comes after Grade 12.",
      },
    ],
    admissionRequirements: [
      "Junior High School (Grade 10) completion certificate",
      "Completed Form 138 with Grade 10 final grades",
      "PSA birth certificate (original and photocopy)",
      "Strand preference form submitted during enrollment",
    ],
    strands: [
      {
        name: "STEM",
        description:
          "Science, Technology, Engineering, and Mathematics — for learners headed toward engineering, medicine, or the physical sciences.",
      },
      {
        name: "ABM",
        description:
          "Accountancy, Business, and Management — for learners interested in business, finance, or entrepreneurship.",
      },
      {
        name: "HUMSS",
        description:
          "Humanities and Social Sciences — for learners drawn to law, education, communication, or the social sciences.",
      },
      {
        name: "TVL",
        description:
          "Technical-Vocational-Livelihood — hands-on training in a trade or skill for direct employment after Grade 12.",
      },
    ],
  },
];
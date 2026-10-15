// Content for the Data Privacy Notice page (/privacy-policy).
// Edit freely — no component code changes needed for text updates.
// Mirrors the pattern in aboutOverview.ts / campusLifeOverview.ts.
//
// IMPORTANT: this is a working template aligned to the Data Privacy
// Act of 2012 (RA 10173). The school's Data Protection Officer or the
// Schools Division Office should review it before it is treated as the
// school's official notice.

export interface PrivacySection {
  heading: string;
  /** Paragraphs render in order; items (when present) render as a list. */
  paragraphs: string[];
  items?: string[];
}

export const privacyPolicy = {
  pageTitle: "Data Privacy Notice",
  eyebrow: "Your privacy",
  description:
    "How Julia Ortiz Luis National High School collects, uses, and protects personal information on this website, in line with the Data Privacy Act of 2012.",
  lastUpdated: "October 2025",

  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        "Julia Ortiz Luis National High School (JOLNHS) is a public secondary school under the Department of Education (DepEd), located in Sagaba, Santo Domingo, Nueva Ecija. For this website, the school acts as the Personal Information Controller responsible for the personal data published here.",
      ],
    },
    {
      heading: "What personal data appears on this website",
      paragraphs: [
        "This website is primarily informational. It does not run sign-ups, forms that submit personal data, analytics, or advertising. The personal data that appears publicly is:",
      ],
      items: [
        "Faculty and staff — names, positions, departments, and (where provided) profile photos.",
        "Student leaders — names, positions, and photos of elected organization officers.",
        "Event and campus photos — group and activity photos that may include students, staff, and parents.",
        "Administrator accounts — names and email addresses of authorized school staff who manage site content (visible only inside the admin panel, never publicly).",
      ],
    },
    {
      heading: "Why we publish it (legal basis)",
      paragraphs: [
        "Staff and officer listings are published for transparency and to help learners, parents, and the community identify and reach the right people — a legitimate function of a public school under DepEd.",
        "Photographs of students, staff, and school events are published to inform the community about school life. Photos of minors are published only with the consent of their parents or guardians, obtained through the school's enrollment and activity consent processes. Individuals pictured in group photos may ask to have a specific photo removed (see 'Your rights' below).",
      ],
    },
    {
      heading: "Data about minors",
      paragraphs: [
        "Most learners at JOLNHS are minors. We take extra care with their data: student photos are used only for legitimate school information purposes, images are chosen to be appropriate and dignified, and individual students are not profiled or singled out in ways that identify personal circumstances beyond their role in a school activity or organization.",
      ],
    },
    {
      heading: "How your data is stored and secured",
      paragraphs: [
        "Website content is stored in a hosted database (Supabase) with access controls that limit editing to authorized school personnel only. The public can read published content; only authenticated administrators can change it. Administrator sessions are kept in browser session storage, expire after a period of inactivity, and end when the browser tab is closed.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        "Published information stays on the website while it remains accurate and relevant — for example, a staff member's listing is removed when they leave the school, and outdated event photos may be rotated out. Requests for removal are processed as described below.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "Under the Data Privacy Act of 2012 (RA 10173), you have the right to be informed; to access; to object; to correct inaccurate data; to erasure or blocking; to data portability; and to file a complaint. In practice for this website, the most common requests are:",
      ],
      items: [
        "Correct a name, title, or listing that is wrong or out of date.",
        "Remove a photo or listing that shows you or your child.",
        "Ask what personal data about you the site holds.",
      ],
    },
    {
      heading: "Contact our Data Protection Officer",
      paragraphs: [
        "For any privacy question, correction, or removal request, contact the school's Data Protection Officer at the email address below — the same official address listed on our Contact page — or visit the Registrar's office during office hours. We aim to acknowledge requests within five (5) school days.",
      ],
    },
    {
      heading: "Complaints",
      paragraphs: [
        "If you are not satisfied with how your request is handled, you have the right to lodge a complaint with the National Privacy Commission (NPC) through their website at privacy.gov.ph.",
      ],
    },
    {
      heading: "Changes to this notice",
      paragraphs: [
        "We may update this notice when the website or its data practices change. The 'last updated' date at the top of this page always reflects the current version.",
      ],
    },
  ] satisfies PrivacySection[],
};

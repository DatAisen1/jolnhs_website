// Content for the thin dark utility bar above the main header
// (mirrors "SERVICES / APPLY / VISIT / Search" left side and
// "GOOGLE CLASSROOM / STUDENT PORTAL / FACULTY PORTAL" right side).

export interface UtilityLink {
  label: string;
  href: string;
}

export const utilityLinksLeft: UtilityLink[] = [
  { label: "Services", href: "/services" },
  { label: "Apply", href: "/apply" },
  { label: "Visit", href: "/visit" },
];

export const utilityLinksRight: UtilityLink[] = [
  { label: "Google Classroom", href: "https://classroom.google.com" },
  { label: "Student Portal", href: "/student-portal" },
  { label: "Faculty Portal", href: "/faculty-portal" },
];

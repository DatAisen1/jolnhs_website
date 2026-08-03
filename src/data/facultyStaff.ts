export interface StaffCategory {
  id: string;
  label: string;
}

// Drives both the filter tabs and each staff member's `category` field.
// "all" is handled specially in FacultyStaffPage (shows everyone) — it's
// not a real category any staff member belongs to.
export const staffCategories: StaffCategory[] = [
  { id: "all", label: "All Staff" },
  { id: "administrators", label: "Administrators" },
  { id: "jhs-faculty", label: "JHS Faculty" },
  { id: "shs-faculty", label: "SHS Faculty" },
  { id: "staff", label: "Staff" },
];

export interface StaffMember {
  id: string;
  name: string;
  position: string;
  category: string; // must match a staffCategories id above (not "all")
  /** Real photo path (e.g. "/images/staff/last-first.jpg"). Omit to show
   *  the placeholder photo box — same progressive-enhancement pattern as
   *  SchoolBadge's `src` prop. */
  photo?: string;
}

// PLACEHOLDER ENTRIES — replace with real staff. Names below are
// intentionally generic ("Add Staff Name") so they're never mistaken for
// real people. Add/remove/edit entries here; no component code changes
// needed.
export const staffMembers: StaffMember[] = [
  { id: "admin-1", name: "Add Staff Name", position: "Principal", category: "administrators" },
  { id: "admin-2", name: "Add Staff Name", position: "Assistant Principal", category: "administrators" },
  { id: "jhs-1", name: "Add Staff Name", position: "JHS Faculty — Science", category: "jhs-faculty" },
  { id: "jhs-2", name: "Add Staff Name", position: "JHS Faculty — Mathematics", category: "jhs-faculty" },
  { id: "jhs-3", name: "Add Staff Name", position: "JHS Faculty — English", category: "jhs-faculty" },
  { id: "shs-1", name: "Add Staff Name", position: "SHS Faculty — STEM Strand", category: "shs-faculty" },
  { id: "shs-2", name: "Add Staff Name", position: "SHS Faculty — ICT Strand", category: "shs-faculty" },
  { id: "staff-1", name: "Add Staff Name", position: "Registrar", category: "staff" },
  { id: "staff-2", name: "Add Staff Name", position: "Guidance Counselor", category: "staff" },
  { id: "staff-3", name: "Add Staff Name", position: "Librarian", category: "staff" },
];
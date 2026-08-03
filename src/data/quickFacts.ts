export interface QuickFact {
  label: string;
  value: string;
}

// Sidebar facts on the Overview page. Edit values as real information
// becomes available — these are reasonable placeholders, not confirmed data.
export const quickFacts: QuickFact[] = [
  { label: "Type", value: "Public Secondary School" },
  { label: "Department", value: "Department of Education (DepEd)" },
  { label: "Location", value: "Sagaba, Santo Domingo, Nueva Ecija" },
  { label: "Programs Offered", value: "STE, SP-ICT, SNED, Regular, SHS" },
];
import { z } from "zod";

// Same "one small schema, reused everywhere" approach as
// lib/validation/campusLife.ts's officerNameSchema — defined once here,
// used by both StaffMemberManager's "Add staff member" form and its
// per-row edit form in ListItemCard, instead of two ad-hoc
// `!value.trim()` checks that could quietly drift apart.

export const staffNameSchema = z.string().trim().min(1, "Name is required");

export const staffPositionSchema = z.string().trim().min(1, "Position is required");
import { z } from "zod";

// Identity settings
export const identitySettingsSchema = z.object({
  site_name: z.string().trim().min(1, "Site name is required").max(200, "Site name must be 200 characters or fewer"),
  site_tagline: z.string().trim().min(1, "Tagline is required").max(200, "Tagline must be 200 characters or fewer"),
});

// Contact settings
export const contactSettingsSchema = z.object({
  address: z.string().trim().min(1, "Address is required").max(300, "Address must be 300 characters or fewer"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email address").max(120, "Email must be 120 characters or fewer"),
  facebook_handle: z.string().trim().max(100, "Facebook handle must be 100 characters or fewer").optional(),
  facebook_url: z.string().trim().max(500, "URL must be 500 characters or fewer").optional(),
  maps_url: z.string().trim().max(500, "URL must be 500 characters or fewer").optional(),
});

// Information settings
export const informationSettingsSchema = z.object({
  school_type: z.string().trim().min(1, "School type is required").max(100, "School type must be 100 characters or fewer"),
  department: z.string().trim().min(1, "Department is required").max(200, "Department must be 200 characters or fewer"),
  programs_offered: z.string().trim().min(1, "Programs offered is required").max(300, "Programs offered must be 300 characters or fewer"),
  mission_statement: z.string().trim().min(1, "Mission statement is required").max(2000, "Mission statement must be 2000 characters or fewer"),
  office_hours: z.string().trim().min(1, "Office hours is required").max(300, "Office hours must be 300 characters or fewer"),
});

// Combined settings schema for form validation
export const settingsSchema = z.object({
  ...identitySettingsSchema.shape,
  ...contactSettingsSchema.shape,
  ...informationSettingsSchema.shape,
});

export type IdentitySettingsFormValues = z.infer<typeof identitySettingsSchema>;
export type ContactSettingsFormValues = z.infer<typeof contactSettingsSchema>;
export type InformationSettingsFormValues = z.infer<typeof informationSettingsSchema>;
export type SettingsFormValues = z.infer<typeof settingsSchema>;

import { z } from "zod";

export const staffCategorySchema = z.enum(["administrators", "jhs-faculty", "shs-faculty", "staff"]);

export const staffSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(120, "Name must be 120 characters or fewer"),
  position: z.string().trim().min(1, "Position is required").max(120, "Position must be 120 characters or fewer"),
  category: staffCategorySchema,
  // TODO: Persist department after the staff_members table gains a department column.
  department: z.string().trim().max(120, "Department must be 120 characters or fewer"),
  photo: z
    .instanceof(File)
    .refine((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Use a JPEG, PNG, or WebP image")
    .refine((file) => file.size <= 2 * 1024 * 1024, "Image must be 2 MB or smaller")
    .optional(),
});

export type StaffFormValues = z.infer<typeof staffSchema>;

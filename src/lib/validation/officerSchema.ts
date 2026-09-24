import { z } from "zod";

export const officerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name must be 120 characters or fewer"),
  position: z.string().trim().min(1, "Position is required").max(120, "Position must be 120 characters or fewer"),
  photo: z
    .instanceof(File)
    .refine((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Use a JPEG, PNG, or WebP image")
    .refine((file) => file.size <= 2 * 1024 * 1024, "Image must be 2 MB or smaller")
    .optional(),
});

export type OfficerFormValues = z.infer<typeof officerSchema>;

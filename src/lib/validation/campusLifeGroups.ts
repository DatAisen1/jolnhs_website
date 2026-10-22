import { z } from "zod";

const imageFile = z
  .instanceof(File)
  .refine((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Use a JPEG, PNG, or WebP image")
  .refine((file) => file.size <= 5 * 1024 * 1024, "Image must be 5 MB or smaller");

export const groupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name must be 120 characters or fewer"),
  description: z.string().trim().max(2000, "Description must be 2000 characters or fewer").optional(),
  cover: imageFile.optional(),
});

export const memberSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name must be 120 characters or fewer"),
  position: z.string().trim().max(120, "Position must be 120 characters or fewer").optional(),
  photo: imageFile.refine((file) => file.size <= 2 * 1024 * 1024, "Image must be 2 MB or smaller").optional(),
});

export const groupPhotoSchema = z.object({
  photo: imageFile,
  caption: z.string().trim().max(200, "Caption must be 200 characters or fewer").optional(),
});

export type GroupFormValues = z.infer<typeof groupSchema>;
export type MemberFormValues = z.infer<typeof memberSchema>;

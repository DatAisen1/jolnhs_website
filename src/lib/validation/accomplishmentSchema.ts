import { z } from "zod";

const optionalFile = z
  .instanceof(File)
  .refine((file) => ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type), "Use an image or PDF file")
  .refine((file) => file.size <= 5 * 1024 * 1024, "File must be 5 MB or smaller")
  .optional();

export const accomplishmentSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160, "Title must be 160 characters or fewer"),
  description: z.string().trim().max(1000, "Description must be 1,000 characters or fewer"),
  date: z.string().min(1, "Date is required").refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date"),
  amount: z.coerce.number({ invalid_type_error: "Enter a valid amount" }).positive("Amount must be greater than zero"),
  photo: optionalFile,
  document: optionalFile,
});

export type AccomplishmentFormValues = z.infer<typeof accomplishmentSchema>;

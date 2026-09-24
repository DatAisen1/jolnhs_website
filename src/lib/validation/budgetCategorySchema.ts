import { z } from "zod";
import { BUDGET_COLOR_CLASSES } from "@/lib/data/budgetColors";
import { BUDGET_ICON_KEYS } from "@/lib/data/budgetIcons";

export const budgetCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(120, "Category name must be 120 characters or fewer"),
  allocation: z.coerce.number({ invalid_type_error: "Enter a valid allocation" }).positive("Allocation must be greater than zero"),
  iconKey: z.enum(BUDGET_ICON_KEYS, { errorMap: () => ({ message: "Choose an icon" }) }),
  colorClass: z.enum(BUDGET_COLOR_CLASSES, { errorMap: () => ({ message: "Choose a color" }) }),
  description: z.string().trim().max(500, "Description must be 500 characters or fewer"),
});

export type BudgetCategoryFormValues = z.infer<typeof budgetCategorySchema>;

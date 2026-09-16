import { z } from "zod";
import { BUDGET_ICON_KEYS } from "@/lib/data/budgetIcons";
import { BUDGET_COLOR_CLASSES } from "@/lib/data/budgetColors";

// Same "one small schema, reused everywhere" approach as
// lib/validation/staff.ts / campusLife.ts — defined once here, used by
// both the year-level fields form and each ListItemCard field's inline
// validation, instead of ad-hoc checks that could drift apart (P1.3).

export const yearLabelSchema = z.string().trim().min(1, "Fiscal year label is required");

/** Accepts a plain digit string (what a text input naturally holds)
 *  and coerces to a non-negative number — mirrors the `numeric(12,2)
 *  check (amount >= 0)` constraints already in 0001_init.sql, so an
 *  invalid amount is caught client-side instead of round-tripping to
 *  Postgres just to bounce off a check constraint. */
export const amountSchema = z.coerce
  .number({ invalid_type_error: "Enter a valid amount" })
  .min(0, "Amount must be zero or greater");

export const categoryNameSchema = z.string().trim().min(1, "Name is required");

export const categoryIconKeySchema = z.enum(BUDGET_ICON_KEYS, {
  errorMap: () => ({ message: "Choose an icon" }),
});

export const categoryColorClassSchema = z.enum(BUDGET_COLOR_CLASSES, {
  errorMap: () => ({ message: "Choose a color" }),
});

export const accomplishmentTitleSchema = z.string().trim().min(1, "Title is required");

export const accomplishmentStatusSchema = z.enum(["completed", "in-progress", "upcoming"], {
  errorMap: () => ({ message: "Choose a status" }),
});
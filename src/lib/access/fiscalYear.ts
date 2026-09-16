import type { FiscalYearStatus } from "@/lib/data/budget";

/**
 * Whether the admin UI should treat a fiscal year as read-only.
 *
 * This MUST stay logically equivalent to the Postgres RLS predicate in
 * supabase/migrations/0001_init.sql ("Admin write, non-archived years
 * only" policies on budget_categories / budget_accomplishments):
 *
 *   status <> 'archived'
 *
 * The UI disabling controls is a UX convenience — an admin shouldn't
 * have to submit a form to discover the write will be rejected. RLS is
 * the real enforcement; it runs regardless of what this function
 * returns. See src/lib/access/fiscalYear.test.ts for the test that
 * pins this equivalence against the migration file itself, so the two
 * can't silently drift apart.
 */
export function isFiscalYearReadOnly(status: FiscalYearStatus): boolean {
  return status === "archived";
}
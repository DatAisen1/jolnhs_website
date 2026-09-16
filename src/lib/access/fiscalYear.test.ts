import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isFiscalYearReadOnly } from "./fiscalYear";
import type { FiscalYearStatus } from "@/lib/data/budget";

// Vitest runs with cwd at the project root (where vite.config.ts
// lives), so this is stable regardless of which file imports it —
// unlike import.meta.url, which Vitest's transform doesn't guarantee
// resolves to a real file:// URL.
const MIGRATION_PATH = join(process.cwd(), "supabase/migrations/0001_init.sql");

const ALL_STATUSES: FiscalYearStatus[] = ["draft", "published", "archived"];

describe("isFiscalYearReadOnly — archived-year read-only state (P3.7)", () => {
  it("is read-only for 'archived' and writable for every other status", () => {
    for (const status of ALL_STATUSES) {
      expect(isFiscalYearReadOnly(status)).toBe(status === "archived");
    }
  });

  // This is the important one for P3.7's acceptance criterion — "confirm
  // this actually matches what RLS would reject if bypassed" isn't
  // satisfiable by testing the TypeScript function alone, since a typo
  // in either the UI check or the SQL policy would make both files
  // "internally consistent" while disagreeing with each other. So this
  // test reads the real migration SQL off disk and asserts the RLS
  // policy still encodes the same predicate the UI function does. If
  // someone changes the migration's `<> 'archived'` condition (e.g. to
  // also lock 'published' years) without updating isFiscalYearReadOnly,
  // or vice versa, this test — not a manual re-check — is what catches it.
  it("matches the RLS predicate in supabase/migrations/0001_init.sql", () => {
    const migrationSql = readFileSync(MIGRATION_PATH, "utf-8");

    // Scope to the budget_categories write policy specifically, not
    // the whole file, so an unrelated `<> 'archived'` elsewhere
    // couldn't accidentally satisfy this check.
    const policyMatch = migrationSql.match(
      /create policy "Admin write, non-archived years only" on budget_categories[\s\S]*?;/
    );
    expect(policyMatch, "budget_categories archived-year RLS policy not found in migration").not.toBeNull();

    const policyBody = policyMatch![0];
    expect(policyBody).toContain("<> 'archived'");

    // The predicate is `status <> 'archived'` — i.e. writes are
    // ALLOWED (not read-only) for every status except 'archived'.
    // That's the exact logical negation of isFiscalYearReadOnly.
    for (const status of ALL_STATUSES) {
      const rlsAllowsWrite = status !== "archived"; // mirrors `<> 'archived'`
      expect(isFiscalYearReadOnly(status)).toBe(!rlsAllowsWrite);
    }
  });
});
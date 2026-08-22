/**
 * One-time migration: reads the existing static campusLife.ts data and
 * upserts it into Supabase. Safe to re-run — upsert on `slug` means
 * running this twice updates existing rows instead of duplicating them.
 *
 * Run with: npx tsx scripts/migrate-campus-life.ts
 * Requires SUPABASE_SERVICE_ROLE_KEY in your environment (never commit
 * this key — it bypasses RLS, which is exactly why the migration script
 * needs it, but nothing else should ever use it).
 */
import { createClient } from "@supabase/supabase-js";
import { campusLifeSections } from "../src/data/campusLife";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment before running this script."
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function migrate() {
  let sectionCount = 0;
  let statCount = 0;
  let highlightCount = 0;

  for (const section of campusLifeSections) {
    // The 4 fixed sections already exist as empty rows from the Phase 0
    // seed (0001_init.sql) — Gallery does not, since it wasn't part of
    // that original seed, so this upsert creates it too.
    const { data: sectionRow, error: sectionError } = await supabase
      .from("campus_life_sections")
      .upsert(
        {
          slug: section.slug,
          eyebrow: section.eyebrow,
          name: section.name,
          tagline: section.tagline,
          description: section.description,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (sectionError || !sectionRow) {
      console.error(`Failed to upsert section "${section.slug}":`, sectionError);
      continue;
    }
    sectionCount++;
    const sectionId = sectionRow.id;

    // Replace-all strategy for stats/highlights: delete existing rows for
    // this section, then insert fresh ones. Simpler and safer for a
    // one-time migration than trying to diff/match individual rows —
    // there's no risk of duplicates even if you re-run this script.
    await supabase.from("campus_life_stats").delete().eq("section_id", sectionId);
    await supabase.from("campus_life_highlights").delete().eq("section_id", sectionId);

    if (section.stats.length > 0) {
      const { error } = await supabase.from("campus_life_stats").insert(
        section.stats.map((stat, i) => ({
          section_id: sectionId,
          label: stat.label,
          value: stat.value,
          sort_order: i,
        }))
      );
      if (error) console.error(`Stats insert failed for "${section.slug}":`, error);
      else statCount += section.stats.length;
    }

    if (section.highlights.length > 0) {
      const { error } = await supabase.from("campus_life_highlights").insert(
        section.highlights.map((h, i) => ({
          section_id: sectionId,
          title: h.title,
          description: h.description,
          sort_order: i,
        }))
      );
      if (error) console.error(`Highlights insert failed for "${section.slug}":`, error);
      else highlightCount += section.highlights.length;
    }

    console.log(`✓ ${section.slug}: ${section.stats.length} stats, ${section.highlights.length} highlights`);
  }

  console.log(`\nDone. ${sectionCount}/${campusLifeSections.length} sections, ${statCount} stats, ${highlightCount} highlights.`);
  console.log("Verify counts against src/data/campusLife.ts before trusting this migration.");
}

migrate();
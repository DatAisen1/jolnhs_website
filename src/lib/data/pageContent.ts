import { useSiteSettings, getSettingValue } from "@/lib/data/siteSettings";

/**
 * Page content keys — editable copy stored as site_settings rows
 * (category 'content'). Public components read them through
 * usePageContent(), which returns the DB value when present and the
 * baked-in default otherwise — so the site always renders even when
 * Supabase is unreachable or a key hasn't been created yet.
 */
export const PAGE_CONTENT_KEYS = [
  "home_hero_title",
  "home_hero_subtitle",
  "home_welcome_title",
  "home_welcome_body",
  "about_intro",
  // Pre-existing settings key (seeded in 0010) — the homepage mission
  // paragraph now actually reads it instead of duplicating the field.
  "mission_statement",
] as const;

export type PageContentKey = (typeof PAGE_CONTENT_KEYS)[number];

export function usePageContent(key: PageContentKey, fallback: string): string {
  const { data: settings } = useSiteSettings();
  if (!settings) return fallback;
  return getSettingValue(settings, key) ?? fallback;
}

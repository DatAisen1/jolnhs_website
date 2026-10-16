import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { staffPhotoUrl } from "@/lib/storageUrl";
import { campusLifeSections as staticCampusLifeSections } from "@/data/campusLife";
import { Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CampusLifeStat {
  id: string;
  label: string;
  value: string;
  sort_order: number;
}

export interface CampusLifeHighlight {
  id: string;
  title: string;
  description: string;
  sort_order: number;
}

export interface CampusLifeOfficer {
  id: string;
  name: string;
  position: string;
  photo_path: string | null;
  sort_order: number;
  is_archived: boolean;
}

export interface CampusLifeSection {
  id: string;
  slug: string;
  eyebrow: string | null;
  name: string;
  tagline: string | null;
  description: string | null;
  updated_at: string;
}

export interface CampusLifeSectionDetail {
  id: string;
  slug: string;
  eyebrow: string | null;
  name: string;
  tagline: string | null;
  description: string | null;
  updated_at: string;
  stats: CampusLifeStat[];
  highlights: CampusLifeHighlight[];
  officers: CampusLifeOfficer[];
}

/**
 * Extended Campus Life section type for public pages that includes
 * UI properties (icon, theme, gallery, CTA) from static data.
 * These properties are not stored in Supabase but are needed for rendering.
 */
export interface PublicCampusLifeSection extends CampusLifeSection {
  icon: LucideIcon;
  theme: "light" | "dark";
  gallery: Array<{ label: string; imageSize: string }>;
  ctaLabel: string;
  ctaHref: string;
}

/**
 * Maps Supabase section data with static data to get UI properties.
 * This is needed because Supabase only stores basic text fields,
 * while the UI needs icons, themes, and other display properties.
 */
function mapSectionWithUIProperties(section: CampusLifeSection): PublicCampusLifeSection {
  const staticSection = staticCampusLifeSections.find((s) => s.slug === section.slug);
  if (!staticSection) {
    // Fallback for sections not in static data (shouldn't happen with current schema)
    return {
      ...section,
      icon: Users,
      theme: "light",
      gallery: [],
      ctaLabel: "Learn More",
      ctaHref: "/contact",
    };
  }
  return {
    ...section,
    icon: staticSection.icon,
    theme: staticSection.theme,
    gallery: staticSection.gallery,
    ctaLabel: staticSection.ctaLabel,
    ctaHref: staticSection.ctaHref,
  };
}

/**
 * Fetches all Campus Life sections for the landing page.
 * Combines Supabase data with static UI properties (icon, theme, gallery, CTA).
 * Includes the gallery section from static data since it's not in Supabase.
 */
export function useAllCampusLifeSections() {
  return useQuery({
    queryKey: ["campus-life-sections-list"],
    queryFn: async (): Promise<PublicCampusLifeSection[]> => {
      const { data, error } = await supabase
        .from("campus_life_sections")
        .select("*")
        .order("name");
      if (error) throw error;

      // Map Supabase sections with UI properties from static data
      const mappedSections = (data ?? []).map(mapSectionWithUIProperties);

      // Add gallery section from static data (not in Supabase)
      const gallerySection = staticCampusLifeSections.find((s) => s.slug === "gallery");
      if (gallerySection) {
        mappedSections.push({
          id: gallerySection.id,
          slug: gallerySection.slug,
          eyebrow: gallerySection.eyebrow,
          name: gallerySection.name,
          tagline: gallerySection.tagline,
          description: gallerySection.description,
          updated_at: new Date().toISOString(),
          icon: gallerySection.icon,
          theme: gallerySection.theme,
          gallery: gallerySection.gallery,
          ctaLabel: gallerySection.ctaLabel,
          ctaHref: gallerySection.ctaHref,
        });
      }

      return mappedSections;
    },
  });
}

/**
 * Fetches one section plus its stats/highlights/officers in one call.
 * This is used by CampusLifeSectionPage for individual section pages.
 * Uses the same query key as the admin panel so saves in admin invalidate this query.
 */
export function useCampusLifeSectionDetail(slug: string) {
  return useQuery({
    queryKey: ["campus-life-section", slug],
    queryFn: async (): Promise<CampusLifeSectionDetail> => {
      // Gallery section uses static data (not in Supabase)
      if (slug === "gallery") {
        const gallerySection = staticCampusLifeSections.find((s) => s.slug === "gallery");
        if (!gallerySection) {
          throw new Error("Gallery section not found");
        }
        return {
          id: gallerySection.id,
          slug: gallerySection.slug,
          eyebrow: gallerySection.eyebrow,
          name: gallerySection.name,
          tagline: gallerySection.tagline,
          description: gallerySection.description,
          updated_at: new Date().toISOString(),
          stats: [],
          highlights: [],
          officers: [],
        };
      }

      const { data: section, error: sectionError } = await supabase
        .from("campus_life_sections")
        .select("*")
        .eq("slug", slug)
        .single();
      if (sectionError) throw sectionError;

      const [{ data: stats, error: statsError }, { data: highlights, error: highlightsError }, { data: officers, error: officersError }] =
        await Promise.all([
          supabase
            .from("campus_life_stats")
            .select("*")
            .eq("section_id", section.id)
            .order("sort_order"),
          supabase
            .from("campus_life_highlights")
            .select("*")
            .eq("section_id", section.id)
            .order("sort_order"),
          supabase
            .from("campus_life_officers")
            .select("*")
            .eq("section_id", section.id)
            .eq("is_archived", false)
            .order("sort_order"),
        ]);

      if (statsError) throw statsError;
      if (highlightsError) throw highlightsError;
      if (officersError) throw officersError;

      // Storage paths become public URLs at this boundary, same as
      // publicStaff — so a future officer card can put photo_path
      // straight into <img src> without repeating the storage-path bug.
      return {
        ...section,
        stats: stats ?? [],
        highlights: highlights ?? [],
        officers: (officers ?? []).map((o) => ({
          ...o,
          photo_path: staffPhotoUrl(o.photo_path),
        })),
      };
    },
  });
}

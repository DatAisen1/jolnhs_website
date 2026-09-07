import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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

/** Fetches one section plus its stats/highlights/officers in one call,
 *  rather than three separate round trips — a single admin form needs
 *  all of it together anyway. */
export function useCampusLifeSection(slug: string) {
  return useQuery({
    queryKey: ["campus-life-section", slug],
    queryFn: async (): Promise<CampusLifeSectionDetail> => {
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

      return { ...section, stats: stats ?? [], highlights: highlights ?? [], officers: officers ?? [] };
    },
  });
}

/** Saves the section's own text fields (name, tagline, description) plus
 *  a full replace of its stats and highlights lists.
 *
 *  This is a SINGLE call to the `save_campus_life_section` Postgres
 *  function (see supabase/migrations/0003_save_campus_life_section_rpc.sql)
 *  instead of five separate delete/update/insert round trips. That
 *  matters for correctness, not just tidiness: the old version could
 *  successfully delete a section's stats and then fail on the insert
 *  (network drop, validation error, etc.), leaving the section
 *  permanently missing data. The RPC runs as one Postgres transaction —
 *  if any part fails, the whole save rolls back and the section is left
 *  exactly as it was before the click. */
export function useSaveCampusLifeSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      sectionId: string;
      slug: string;
      eyebrow: string;
      name: string;
      tagline: string;
      description: string;
      stats: Array<{ label: string; value: string }>;
      highlights: Array<{ title: string; description: string }>;
    }) => {
      const { error } = await supabase.rpc("save_campus_life_section", {
        p_section_id: input.sectionId,
        p_eyebrow: input.eyebrow,
        p_name: input.name,
        p_tagline: input.tagline,
        p_description: input.description,
        p_stats: input.stats,
        p_highlights: input.highlights,
      });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["campus-life-section", variables.slug] });
    },
  });
}

export function useSaveOfficer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (officer: {
      id?: string;
      sectionId: string;
      name: string;
      position: string;
      photoPath?: string | null;
    }) => {
      const { error } = await supabase.from("campus_life_officers").upsert({
        id: officer.id,
        section_id: officer.sectionId,
        name: officer.name,
        position: officer.position,
        photo_path: officer.photoPath ?? null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campus-life-section"] }),
  });
}

/** Archive, not delete — consistent with the soft-delete decision made
 *  for staff. A mis-clicked "remove officer" shouldn't be unrecoverable. */
export function useArchiveOfficer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (officerId: string) => {
      const { error } = await supabase
        .from("campus_life_officers")
        .update({ is_archived: true })
        .eq("id", officerId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campus-life-section"] }),
  });
}
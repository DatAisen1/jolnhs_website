import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/** Mirrors the `staff_members.category` check constraint in
 *  supabase/migrations/0001_init.sql — keep these two in sync. */
export type StaffCategory = "administrators" | "jhs-faculty" | "shs-faculty" | "staff";

export interface StaffMember {
  id: string;
  name: string;
  position: string;
  category: StaffCategory;
  photo_path: string | null;
  sort_order: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

/** Fetches the active (non-archived) members of ONE category, ordered for
 *  display. Scoped per category — like `useCampusLifeSection` scoping to
 *  one section — so switching the Staff & Faculty tab only loads the rows
 *  that tab needs, instead of every staff member up front. */
export function useStaffMembers(category: StaffCategory, archived = false) {
  return useQuery({
    queryKey: ["staff-members", category, archived],
    queryFn: async (): Promise<StaffMember[]> => {
      const { data, error } = await supabase
        .from("staff_members")
        .select("*")
        .eq("category", category)
        .eq("is_archived", archived)
        .order("created_at", { ascending: false })
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

/**
 * Direct `upsert` per staff member (P1.12). Deliberately NOT routed
 * through a `save_*` Postgres RPC the way `useSaveCampusLifeSection` is:
 * that RPC exists because a Campus Life save touches THREE tables
 * (section + stats + highlights) and needs all-or-nothing atomicity
 * across them. A staff edit touches exactly one row in one table —
 * there's nothing for a multi-table transaction to protect here, so
 * adding one would just be unused ceremony. Same shape as
 * `useSaveOfficer` in `campusLife.ts`.
 */
export function useSaveStaffMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (member: {
      id?: string;
      name: string;
      position: string;
      category: StaffCategory;
      photoPath?: string | null;
    }) => {
      const { error } = await supabase.from("staff_members").upsert({
        id: member.id,
        name: member.name,
        position: member.position,
        category: member.category,
        photo_path: member.photoPath ?? null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    // Broad ["staff-members"] key invalidates every category's query, not
    // just the one just edited — cheap (four small queries) and avoids
    // subtle bugs if a future edit ever moves a member between categories.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-members"] }),
  });
}

/** Archive, not delete — same soft-delete decision as officers, so a
 *  mis-clicked "remove" is always recoverable from the database directly. */
export function useArchiveStaffMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("staff_members")
        .update({ is_archived: true })
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-members"] }),
  });
}

/** Restore — reverses archive by setting is_archived back to false. */
export function useRestoreStaffMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("staff_members")
        .update({ is_archived: false })
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-members"] }),
  });
}
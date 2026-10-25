import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

/** Mirrors the `staff_members.category` check constraint in
 *  supabase/migrations/0001_init.sql — keep these two in sync. */
export type StaffCategory = "administrators" | "jhs-faculty" | "shs-faculty" | "staff";

export interface StaffMember {
  id: string;
  name: string;
  position: string;
  category: StaffCategory;
  /** Department this person belongs to (migration 0017). Optional —
   *  members with NULL render in the "Other" group publicly. */
  department_id?: string | null;
  /** At most one active member per department may be head — enforced
   *  by the one_head_per_department index. */
  is_department_head?: boolean;
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
      departmentId?: string | null;
      isDepartmentHead?: boolean;
      photoPath?: string | null;
    }) => {
      // Only one head per department (0017's unique index). Clear the
      // seat BEFORE upserting the new head — reversing the order would
      // make the upsert violate the index whenever a head already sits
      // there. If the upsert itself then fails, the dept is briefly
      // headless; the admin just re-ticks the checkbox.
      if (member.isDepartmentHead && member.departmentId) {
        let clear = supabase
          .from("staff_members")
          .update({ is_department_head: false })
          .eq("department_id", member.departmentId)
          .eq("is_department_head", true);
        // Keep our own flag — a member re-saving as head shouldn't be
        // cleared by their own write. New members have no id to exclude.
        if (member.id) clear = clear.neq("id", member.id);
        const { error: clearError } = await clear;
        if (clearError) throw clearError;
      }

      const payload: Record<string, unknown> = {
        id: member.id,
        name: member.name,
        position: member.position,
        category: member.category,
        photo_path: member.photoPath ?? null,
        updated_at: new Date().toISOString(),
      };
      // Department columns are included only when the caller sent them —
      // a save made before migration 0017 lands keeps working untouched.
      if (member.departmentId !== undefined) payload.department_id = member.departmentId;
      if (member.isDepartmentHead !== undefined) payload.is_department_head = member.isDepartmentHead;

      const { error } = await supabase.from("staff_members").upsert(payload);
      if (error) throw error;
      logActivity(
        member.id ? "update" : "create",
        "staff_member",
        member.id ?? null,
        `${member.id ? "Updated" : "Added"} staff member ${member.name}`,
        { category: member.category },
      );
    },
    // Broad ["staff-members"] key invalidates every category's query, not
    // just the one just edited — cheap (four small queries) and avoids
    // subtle bugs if a future edit ever moves a member between categories.
    // Also invalidate the public-facing query so the public site updates immediately.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      queryClient.invalidateQueries({ queryKey: ["all-staff-members"] });
    },
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
      logActivity("archive", "staff_member", memberId, "Archived a staff member");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      queryClient.invalidateQueries({ queryKey: ["all-staff-members"] });
    },
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
      logActivity("restore", "staff_member", memberId, "Restored a staff member");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      queryClient.invalidateQueries({ queryKey: ["all-staff-members"] });
    },
  });
}
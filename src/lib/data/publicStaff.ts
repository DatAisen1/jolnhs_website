import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { staffPhotoUrl } from "@/lib/storageUrl";

export type StaffCategory = "administrators" | "jhs-faculty" | "shs-faculty" | "staff";

export interface StaffMember {
  id: string;
  name: string;
  position: string;
  category: StaffCategory;
  department_id?: string | null;
  is_department_head?: boolean;
  /** Despite the column name, consumers get a ready-to-render public
   *  URL here — the storage path is converted at this boundary via
   *  staffPhotoUrl, so components can put it straight into <img src>. */
  photo_path: string | null;
  sort_order: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches all active (non-archived) staff members across all categories,
 * ordered for public display. Used by the public Faculty & Staff page
 * which shows all staff with client-side category filtering (unlike the admin
 * panel which loads one category at a time via `useStaffMembers`).
 */
export function useAllStaffMembers() {
  return useQuery({
    queryKey: ["all-staff-members"],
    queryFn: async (): Promise<StaffMember[]> => {
      const { data, error } = await supabase
        .from("staff_members")
        .select("*")
        .eq("is_archived", false)
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return (data ?? []).map((member) => ({
        ...member,
        photo_path: staffPhotoUrl(member.photo_path),
      }));
    },
  });
}

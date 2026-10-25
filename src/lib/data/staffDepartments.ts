import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import type { StaffCategory } from "@/lib/data/staff";

/**
 * Departments — the named units that group staff members in real
 * schools (English Department, Office of the Registrar…), scoped to
 * one staff category each. Mirrors the Campus Life groups model but
 * deliberately simpler: a member belongs to at most one department,
 * and at most one member per department can be its head (enforced by
 * the one_head_per_department index in migration 0017).
 */
export interface StaffDepartment {
  id: string;
  category: StaffCategory;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ------------------------------ admin ------------------------------ */

export function useStaffDepartments(category: StaffCategory, archived = false) {
  return useQuery({
    queryKey: ["staff-departments", "admin", category, archived],
    queryFn: async (): Promise<StaffDepartment[]> => {
      const { data, error } = await supabase
        .from("staff_departments")
        .select("*")
        .eq("category", category)
        .eq("is_archived", archived)
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveStaffDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      category: StaffCategory;
      name: string;
      description?: string;
      sortOrder?: number;
    }) => {
      const { data, error } = await supabase
        .from("staff_departments")
        .upsert({
          id: input.id,
          category: input.category,
          name: input.name,
          slug: slugify(input.name),
          description: input.description?.trim() || null,
          sort_order: input.sortOrder ?? 0,
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (error) throw error;
      logActivity(
        input.id ? "update" : "create",
        "staff_department",
        input.id ?? data?.id ?? null,
        `${input.id ? "Updated" : "Added"} department "${input.name}"`,
        { category: input.category },
      );
      return data?.id as string | undefined;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff-departments", "admin", variables.category] });
      queryClient.invalidateQueries({ queryKey: ["staff-departments", "public"] });
    },
  });
}

export function useArchiveStaffDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; name: string }) => {
      const { error } = await supabase
        .from("staff_departments")
        .update({ is_archived: true })
        .eq("id", input.id);
      if (error) throw error;
      logActivity("archive", "staff_department", input.id, `Archived department "${input.name}"`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-departments"] });
    },
  });
}

export function useRestoreStaffDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; name: string }) => {
      const { error } = await supabase
        .from("staff_departments")
        .update({ is_archived: false })
        .eq("id", input.id);
      if (error) throw error;
      logActivity("restore", "staff_department", input.id, `Restored department "${input.name}"`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-departments"] });
    },
  });
}

/* ------------------------------ public ------------------------------ */

/**
 * Active departments for the public page. Pass a category to scope,
 * or omit to get every active department (the "All Staff" tab needs
 * names across all four categories for its card subtitles).
 */
export function usePublicStaffDepartments(category?: StaffCategory) {
  return useQuery({
    queryKey: ["staff-departments", "public", category ?? "all"],
    queryFn: async (): Promise<StaffDepartment[]> => {
      let query = supabase
        .from("staff_departments")
        .select("*")
        .eq("is_archived", false)
        .order("sort_order")
        .order("name");
      if (category) query = query.eq("category", category);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

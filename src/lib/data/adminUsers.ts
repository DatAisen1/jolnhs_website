import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

export interface AdminUser {
  user_id: string;
  email: string;
  created_at: string;
}

/**
 * All three hooks go through SECURITY DEFINER RPCs (migration 0014):
 * admin_users rows aren't listable by clients, and auth.users is
 * unreachable from the browser — the RPCs do the lookup server-side
 * after re-checking the caller's own admin membership.
 */
export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<AdminUser[]> => {
      const { data, error } = await supabase.rpc("list_admin_users");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddAdminByEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.rpc("add_admin_by_email", {
        p_email: email,
      });
      if (error) throw new Error(error.message);
      logActivity("create", "admin_user", data as string, `Granted admin access to ${email}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

export function useRemoveAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, email }: { userId: string; email: string }) => {
      const { error } = await supabase.rpc("remove_admin", { p_user_id: userId });
      if (error) throw new Error(error.message);
      logActivity("delete", "admin_user", userId, `Revoked admin access for ${email}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

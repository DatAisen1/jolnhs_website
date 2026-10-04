import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

/**
 * Checks whether the currently authenticated user is an admin.
 * Returns true if the user's ID exists in the admin_users table.
 */
export function useAdminAccess(session: Session | null) {
  return useQuery({
    queryKey: ["admin-access", session?.user?.id],
    queryFn: async (): Promise<boolean> => {
      if (!session?.user?.id) return false;
      
      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!session?.user?.id,
  });
}

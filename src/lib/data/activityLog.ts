import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ActivityEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: "create" | "update" | "delete" | "archive" | "restore" | "publish" | "unpublish";
  entity_type: string;
  entity_id: string | null;
  summary: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

/** Recent-first audit feed. `limit` is a plain row cap — the page is a
 *  running log, not a paginated history explorer (filtering beyond
 *  "latest N" is a future need, not a current one). */
export function useActivityLog(limit = 100) {
  return useQuery({
    queryKey: ["activity-log", limit],
    queryFn: async (): Promise<ActivityEntry[]> => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

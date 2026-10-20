import { supabase } from "@/lib/supabase";

export type ActivityAction =
  | "create"
  | "update"
  | "delete"
  | "archive"
  | "restore"
  | "publish"
  | "unpublish";

/**
 * logActivity — writes one row to the activity_log audit trail via the
 * log_activity() RPC (migration 0014). The RPC stamps auth.uid()/email
 * server-side, so a caller can describe WHAT changed but not WHO did it.
 *
 * Deliberately fire-and-forget: called inside mutation onSuccess handlers.
 * An audit write must never break the action it describes — failures are
 * logged to the console and swallowed.
 */
export function logActivity(
  action: ActivityAction,
  entityType: string,
  entityId: string | null | undefined,
  summary: string,
  details?: Record<string, unknown>,
): void {
  void supabase
    .rpc("log_activity", {
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId ?? null,
      p_summary: summary,
      p_details: details ?? null,
    })
    .then(({ error }) => {
      if (error) console.warn("activity log write failed:", error.message);
    });
}

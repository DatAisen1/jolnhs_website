import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

/* ------------------------------ public ------------------------------ */

/** Anyone may insert — the table is write-only for the public (no
 *  select policy), so submitted messages can't leak back out. */
export async function sendContactMessage(input: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<void> {
  const { error } = await supabase.from("contact_messages").insert({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    subject: input.subject,
    message: input.message,
  });
  if (error) throw error;
}

/* ------------------------------ admin ------------------------------ */

export function useContactMessages(archived = false) {
  return useQuery({
    queryKey: ["contact-messages", archived],
    queryFn: async (): Promise<ContactMessage[]> => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .eq("is_archived", archived)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSetMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: read })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contact-messages"] }),
  });
}

export function useSetMessageArchived() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_archived: archived })
        .eq("id", id);
      if (error) throw error;
      logActivity(
        archived ? "archive" : "restore",
        "contact_message",
        id,
        `${archived ? "Archived" : "Restored"} a contact message`,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contact-messages"] }),
  });
}

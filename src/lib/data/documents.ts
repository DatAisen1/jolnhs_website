import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { storageFileUrl } from "@/lib/storageUrl";
import { logActivity } from "@/lib/activity";

export type DocumentCategory = "enrollment" | "forms" | "handbook" | "other";

export interface SchoolDocument {
  id: string;
  title: string;
  description: string | null;
  category: DocumentCategory;
  file_path: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  is_published: boolean;
  sort_order: number;
  is_archived: boolean;
  created_at: string;
}

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  enrollment: "Enrollment",
  forms: "Forms & Requests",
  handbook: "Handbooks & Manuals",
  other: "Other Documents",
};

export function documentFileUrl(path: string | null | undefined): string | null {
  return storageFileUrl("documents", path);
}

/* ------------------------------ public ------------------------------ */

export function usePublicDocuments() {
  return useQuery({
    queryKey: ["documents", "public"],
    queryFn: async (): Promise<SchoolDocument[]> => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("category")
        .order("sort_order")
        .order("title");
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ------------------------------ admin ------------------------------ */

export function useAdminDocuments(archived = false) {
  return useQuery({
    queryKey: ["documents", "admin", archived],
    queryFn: async (): Promise<SchoolDocument[]> => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("is_archived", archived)
        .order("category")
        .order("sort_order")
        .order("title");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export async function uploadDocumentFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("documents").upload(path, file);
  if (error) throw error;
  return path;
}

export function useSaveDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      title: string;
      description?: string;
      category: DocumentCategory;
      filePath: string;
      fileName: string;
      fileType?: string;
      fileSize?: number;
      isPublished?: boolean;
      sortOrder?: number;
    }) => {
      const { error } = await supabase.from("documents").upsert({
        id: input.id,
        title: input.title,
        description: input.description || null,
        category: input.category,
        file_path: input.filePath,
        file_name: input.fileName,
        file_type: input.fileType || null,
        file_size: input.fileSize ?? null,
        is_published: input.isPublished ?? true,
        sort_order: input.sortOrder ?? 0,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      logActivity(
        input.id ? "update" : "create",
        "document",
        input.id ?? null,
        `${input.id ? "Updated" : "Published"} document "${input.title}"`,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export function useSetDocumentArchived() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, archived, title }: { id: string; archived: boolean; title: string }) => {
      const { error } = await supabase
        .from("documents")
        .update({ is_archived: archived, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      logActivity(
        archived ? "archive" : "restore",
        "document",
        id,
        `${archived ? "Archived" : "Restored"} document "${title}"`,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });
}

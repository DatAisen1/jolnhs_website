import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { storageFileUrl } from "@/lib/storageUrl";
import { logActivity } from "@/lib/activity";

export type AnnouncementCategory = "announcement" | "news" | "event" | "advisory";

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  category: AnnouncementCategory;
  cover_image_path: string | null;
  is_pinned: boolean;
  is_published: boolean;
  published_at: string | null;
  title_fil: string | null;
  excerpt_fil: string | null;
  body_fil: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export function coverImageUrl(path: string | null | undefined): string | null {
  return storageFileUrl("news-covers", path);
}

export const CATEGORY_LABELS: Record<AnnouncementCategory, string> = {
  announcement: "Announcement",
  news: "News",
  event: "Event",
  advisory: "Advisory",
};

/** Turn a title into a URL-safe slug, kept deterministic so the same
 *  title always produces the same slug (uniqueness handled by the
 *  unique constraint — we append a timestamp on conflict). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "post";
}

/* ------------------------------ public ------------------------------ */

export function usePublishedAnnouncements(limit?: number) {
  return useQuery({
    queryKey: ["announcements", "public", limit ?? "all"],
    queryFn: async (): Promise<Announcement[]> => {
      let q = supabase
        .from("announcements")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false })
        .order("created_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAnnouncementBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["announcements", "public", "slug", slug],
    enabled: !!slug,
    queryFn: async (): Promise<Announcement | null> => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/* ------------------------------ admin ------------------------------ */

export function useAdminAnnouncements(archived = false) {
  return useQuery({
    queryKey: ["announcements", "admin", archived],
    queryFn: async (): Promise<Announcement[]> => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_archived", archived)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export interface AnnouncementInput {
  id?: string;
  title: string;
  excerpt?: string;
  body: string;
  category: AnnouncementCategory;
  coverImagePath?: string | null;
  isPinned: boolean;
  isPublished: boolean;
  publishedAt?: string | null;
  titleFil?: string;
  excerptFil?: string;
  bodyFil?: string;
}

export function useSaveAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AnnouncementInput) => {
      const row = {
        id: input.id,
        title: input.title,
        slug: slugify(input.title),
        excerpt: input.excerpt || null,
        body: input.body,
        category: input.category,
        cover_image_path: input.coverImagePath ?? null,
        is_pinned: input.isPinned,
        is_published: input.isPublished,
        published_at: input.isPublished
          ? input.publishedAt ?? new Date().toISOString()
          : null,
        title_fil: input.titleFil || null,
        excerpt_fil: input.excerptFil || null,
        body_fil: input.bodyFil || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("announcements").upsert(row);
      if (error) {
        // Unique-slug collision: retry once with a timestamp suffix.
        if (error.code === "23505") {
          row.slug = `${row.slug}-${Date.now().toString(36)}`;
          const { error: retryError } = await supabase.from("announcements").upsert(row);
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }
      logActivity(
        input.id ? "update" : "create",
        "announcement",
        input.id ?? null,
        `${input.id ? "Updated" : "Created"} announcement "${input.title}"`,
        { category: input.category, published: input.isPublished },
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useSetAnnouncementArchived() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, archived, title }: { id: string; archived: boolean; title: string }) => {
      const { error } = await supabase
        .from("announcements")
        .update({ is_archived: archived, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      logActivity(
        archived ? "archive" : "restore",
        "announcement",
        id,
        `${archived ? "Archived" : "Restored"} announcement "${title}"`,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

/** Cover image upload to the news-covers bucket (public read / admin
 *  write, migration 0013). Returns the storage path to persist on the row. */
export async function uploadAnnouncementCover(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `covers/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("news-covers").upload(path, file);
  if (error) throw error;
  return path;
}

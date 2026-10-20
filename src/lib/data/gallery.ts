import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { storageFileUrl } from "@/lib/storageUrl";
import { logActivity } from "@/lib/activity";

export interface GalleryPhoto {
  id: string;
  section_slug: string;
  title: string | null;
  caption: string | null;
  storage_path: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export function galleryPhotoUrl(path: string | null | undefined): string | null {
  return storageFileUrl("gallery", path);
}

/* ------------------------------ public ------------------------------ */

export function useGalleryPhotos(sectionSlug: string) {
  return useQuery({
    queryKey: ["gallery-photos", "public", sectionSlug],
    queryFn: async (): Promise<GalleryPhoto[]> => {
      const { data, error } = await supabase
        .from("gallery_photos")
        .select("*")
        .eq("section_slug", sectionSlug)
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/**
 * One photo per section — the landing-page teaser wall. Fetches all
 * published photos in a single query (it's a small table) and keeps the
 * first of each section, keyed by slug.
 */
export function useGalleryTeaser() {
  return useQuery({
    queryKey: ["gallery-photos", "public", "teaser"],
    queryFn: async (): Promise<Record<string, GalleryPhoto>> => {
      const { data, error } = await supabase
        .from("gallery_photos")
        .select("*")
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const firstBySection: Record<string, GalleryPhoto> = {};
      for (const photo of data ?? []) {
        if (!firstBySection[photo.section_slug]) {
          firstBySection[photo.section_slug] = photo;
        }
      }
      return firstBySection;
    },
  });
}

/* ------------------------------ admin ------------------------------ */

export function useAdminGalleryPhotos(sectionSlug: string) {
  return useQuery({
    queryKey: ["gallery-photos", "admin", sectionSlug],
    queryFn: async (): Promise<GalleryPhoto[]> => {
      const { data, error } = await supabase
        .from("gallery_photos")
        .select("*")
        .eq("section_slug", sectionSlug)
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export async function uploadGalleryPhoto(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("gallery").upload(path, file);
  if (error) throw error;
  return path;
}

export function useSaveGalleryPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      sectionSlug: string;
      title?: string;
      caption?: string;
      storagePath: string;
      sortOrder?: number;
    }) => {
      const { error } = await supabase.from("gallery_photos").upsert({
        id: input.id,
        section_slug: input.sectionSlug,
        title: input.title || null,
        caption: input.caption || null,
        storage_path: input.storagePath,
        sort_order: input.sortOrder ?? 0,
      });
      if (error) throw error;
      logActivity(
        input.id ? "update" : "create",
        "gallery_photo",
        input.id ?? null,
        `${input.id ? "Updated" : "Added"} gallery photo in "${input.sectionSlug}"`,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gallery-photos"] }),
  });
}

export function useDeleteGalleryPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
      if (error) throw error;
      // Storage cleanup is best-effort — a dangling object costs space but
      // breaks nothing, while a failed delete shouldn't block the row.
      void supabase.storage.from("gallery").remove([storagePath]);
      logActivity("delete", "gallery_photo", id, "Deleted a gallery photo");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gallery-photos"] }),
  });
}

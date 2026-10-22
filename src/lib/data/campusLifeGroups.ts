import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { storageFileUrl, staffPhotoUrl } from "@/lib/storageUrl";
import { logActivity } from "@/lib/activity";
import type { GroupMemberRole } from "@/data/campusLifeGroups";

export interface CampusLifeGroupMember {
  id: string;
  group_id: string;
  name: string;
  role: GroupMemberRole;
  position: string | null;
  /** Raw storage path — pass this back on edits, never the URL. */
  photo_path: string | null;
  /** Resolved public URL for <img src>. */
  photo_url: string | null;
  sort_order: number;
  is_archived: boolean;
}

export interface CampusLifeGroupPhoto {
  id: string;
  group_id: string;
  /** Raw storage path — used for deletes and edits. */
  storage_path: string;
  /** Resolved public URL for <img src>. */
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface CampusLifeGroup {
  id: string;
  section_id: string;
  slug: string;
  name: string;
  description: string | null;
  /** Raw storage path — pass this back on edits. */
  cover_image_path: string | null;
  /** Resolved public URL for <img src>. */
  cover_image_url: string | null;
  sort_order: number;
  is_archived: boolean;
  members: CampusLifeGroupMember[];
  photos: CampusLifeGroupPhoto[];
}

const GROUPS_KEY = "campus-life-groups";

/**
 * Fetches every group for one campus-life section with its members and
 * photos — three round trips rather than a nested select so the
 * filtering/ordering rules stay readable and match campusLife.ts.
 *
 * `admin: true` includes archived groups/members so the manager can
 * offer Restore; the public call filters them out (RLS would too —
 * this keeps the shapes identical on both sides).
 */
export function useCampusLifeGroups(sectionSlug: string, opts?: { admin?: boolean }) {
  const admin = opts?.admin ?? false;
  return useQuery({
    queryKey: [GROUPS_KEY, admin ? "admin" : "public", sectionSlug],
    queryFn: async (): Promise<CampusLifeGroup[]> => {
      const { data: section, error: sectionError } = await supabase
        .from("campus_life_sections")
        .select("id")
        .eq("slug", sectionSlug)
        .single();
      if (sectionError) throw sectionError;

      let groupsQuery = supabase
        .from("campus_life_groups")
        .select("*")
        .eq("section_id", section.id)
        .order("sort_order")
        .order("name");
      if (!admin) groupsQuery = groupsQuery.eq("is_archived", false);
      const { data: groups, error: groupsError } = await groupsQuery;
      if (groupsError) throw groupsError;
      if (!groups?.length) return [];

      const groupIds = groups.map((g) => g.id);
      let membersQuery = supabase
        .from("campus_life_group_members")
        .select("*")
        .in("group_id", groupIds)
        .order("sort_order")
        .order("name");
      if (!admin) membersQuery = membersQuery.eq("is_archived", false);

      const [{ data: members, error: membersError }, { data: photos, error: photosError }] =
        await Promise.all([
          membersQuery,
          supabase
            .from("campus_life_group_photos")
            .select("*")
            .in("group_id", groupIds)
            .order("sort_order")
            .order("created_at", { ascending: false }),
        ]);
      if (membersError) throw membersError;
      if (photosError) throw photosError;

      return groups.map((group) => ({
        ...group,
        cover_image_url: storageFileUrl("gallery", group.cover_image_path),
        members: (members ?? [])
          .filter((m) => m.group_id === group.id)
          .map((m) => ({ ...m, photo_url: staffPhotoUrl(m.photo_path) })),
        photos: (photos ?? [])
          .filter((p) => p.group_id === group.id)
          .map((p) => ({ ...p, url: storageFileUrl("gallery", p.storage_path) ?? p.storage_path })),
      }));
    },
  });
}

/* ------------------------------ storage ------------------------------ */

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function assertImage(file: File, maxBytes: number) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error("Use a JPEG, PNG, or WebP image.");
  if (file.size > maxBytes) throw new Error(`Image must be ${Math.round(maxBytes / 1048576)} MB or smaller.`);
}

/** Group covers live in the `gallery` bucket under groups/<id>/. */
export async function uploadGroupCover(file: File, groupId: string): Promise<string> {
  assertImage(file, 5 * 1024 * 1024);
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `groups/${groupId}/cover-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("gallery").upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}

/** Member photos share the staff-photos bucket under members/<id>/. */
export async function uploadMemberPhoto(file: File, memberId: string): Promise<string> {
  assertImage(file, 2 * 1024 * 1024);
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `members/${memberId}.${ext}`;
  const { error } = await supabase.storage.from("staff-photos").upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}

/** A gallery-bucket file for a group's photo strip. */
export async function uploadGroupPhoto(file: File, groupId: string): Promise<string> {
  assertImage(file, 5 * 1024 * 1024);
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `groups/${groupId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("gallery").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

/* ------------------------------ mutations ------------------------------ */

export function useSaveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      sectionId: string;
      slug: string;
      name: string;
      description?: string;
      coverImagePath?: string | null;
    }) => {
      // `.select("id")` returns the row so a fresh group can receive a
      // cover upload immediately after its first save.
      const { data, error } = await supabase.from("campus_life_groups").upsert({
        id: input.id,
        section_id: input.sectionId,
        slug: input.slug,
        name: input.name,
        description: input.description || null,
        cover_image_path: input.coverImagePath ?? null,
        updated_at: new Date().toISOString(),
      }).select("id").single();
      if (error) throw error;
      logActivity(
        input.id ? "update" : "create",
        "campus_life_group",
        data?.id ?? null,
        `${input.id ? "Updated" : "Added"} ${input.name}`,
      );
      return data?.id as string | undefined;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GROUPS_KEY] }),
  });
}

export function useArchiveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from("campus_life_groups")
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq("id", groupId);
      if (error) throw error;
      logActivity("archive", "campus_life_group", groupId, "Archived a campus life group");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GROUPS_KEY] }),
  });
}

export function useRestoreGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from("campus_life_groups")
        .update({ is_archived: false, updated_at: new Date().toISOString() })
        .eq("id", groupId);
      if (error) throw error;
      logActivity("restore", "campus_life_group", groupId, "Restored a campus life group");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GROUPS_KEY] }),
  });
}

export function useSaveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (member: {
      id?: string;
      groupId: string;
      name: string;
      role: GroupMemberRole;
      position?: string;
      photoPath?: string | null;
    }) => {
      const { error } = await supabase.from("campus_life_group_members").upsert({
        id: member.id,
        group_id: member.groupId,
        name: member.name,
        role: member.role,
        position: member.position || null,
        // Players are minors — the DB CHECK rejects a photo_path for
        // them anyway; nulling it here makes the UI rule explicit.
        photo_path: member.role === "player" ? null : (member.photoPath ?? null),
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      logActivity(
        member.id ? "update" : "create",
        "campus_life_member",
        member.id ?? null,
        `${member.id ? "Updated" : "Added"} ${member.name}`,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GROUPS_KEY] }),
  });
}

export function useArchiveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("campus_life_group_members")
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq("id", memberId);
      if (error) throw error;
      logActivity("archive", "campus_life_member", memberId, "Archived a group member");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GROUPS_KEY] }),
  });
}

export function useRestoreMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("campus_life_group_members")
        .update({ is_archived: false, updated_at: new Date().toISOString() })
        .eq("id", memberId);
      if (error) throw error;
      logActivity("restore", "campus_life_member", memberId, "Restored a group member");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GROUPS_KEY] }),
  });
}

export function useSaveGroupPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; groupId: string; storagePath: string; caption?: string; sortOrder?: number }) => {
      const { error } = await supabase.from("campus_life_group_photos").upsert({
        id: input.id,
        group_id: input.groupId,
        storage_path: input.storagePath,
        caption: input.caption || null,
        sort_order: input.sortOrder ?? 0,
      });
      if (error) throw error;
      logActivity(input.id ? "update" : "create", "campus_life_group_photo", input.id ?? null, input.id ? "Updated a group photo" : "Added a group photo");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GROUPS_KEY] }),
  });
}

export function useDeleteGroupPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      const { error } = await supabase.from("campus_life_group_photos").delete().eq("id", id);
      if (error) throw error;
      // Best-effort storage cleanup — a dangling object costs space but
      // breaks nothing, while a failed remove shouldn't block the row.
      void supabase.storage.from("gallery").remove([storagePath]);
      logActivity("delete", "campus_life_group_photo", id, "Deleted a group photo");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GROUPS_KEY] }),
  });
}

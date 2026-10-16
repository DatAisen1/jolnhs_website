import { supabase } from "@/lib/supabase";

/**
 * staffPhotoUrl — converts a storage path stored in `photo_path`
 * (e.g. "staff/<uuid>.webp") into the public CDN URL the <img> tag
 * actually needs. The "staff-photos" bucket is public (migration 0004),
 * so getPublicUrl is all it takes — no signing.
 *
 * Why this helper exists: the admin panel already does this conversion
 * (buildPublicPhotoUrl in OfficerManager/StaffMemberManager), but the
 * PUBLIC data layer passed the raw storage path straight into <img src>,
 * which resolved against the site domain and silently rendered a broken
 * image. One shared helper means public and admin can't drift again.
 *
 * Passes through values that are already absolute URLs — seeded or
 * hand-written rows may hold a full URL rather than a storage path.
 */
export function staffPhotoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const { data } = supabase.storage.from("staff-photos").getPublicUrl(path);
  return data.publicUrl || null;
}

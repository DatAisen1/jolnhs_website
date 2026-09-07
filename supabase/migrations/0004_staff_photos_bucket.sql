-- ============================================================
-- 0004: staff-photos storage bucket
--
-- Problem: OfficerManager.tsx has been uploading to a bucket called
-- "staff-photos" since Phase 0, but that bucket was only ever
-- created by hand in the Supabase dashboard — it exists nowhere in
-- version control, so a fresh project (new environment, new
-- developer, disaster recovery) has no working photo upload until
-- someone remembers to click "New bucket" and guesses the right
-- policies.
--
-- Fix: create the bucket and its RLS policies here, so `supabase
-- db push` (or pasting this file into the SQL editor) reproduces
-- the exact same access rules as every other table:
--   - anyone can read (bucket is public — the site has no login)
--   - only rows in admin_users can write/replace/delete
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'staff-photos',
  'staff-photos',
  true,                                  -- public read, matches "Public read" pattern elsewhere
  2097152,                               -- 2 MB — mirrors MAX_PHOTO_BYTES in OfficerManager.tsx
  array['image/jpeg', 'image/png', 'image/webp']  -- mirrors ALLOWED_TYPES in OfficerManager.tsx
)
on conflict (id) do update set
  public              = excluded.public,
  file_size_limit      = excluded.file_size_limit,
  allowed_mime_types   = excluded.allowed_mime_types;

-- storage.objects already has RLS enabled by default in Supabase.
-- Policies below are scoped to this bucket only via `bucket_id =
-- 'staff-photos'`, so they never affect any other bucket.

create policy "Public read staff photos"
on storage.objects
for select
using (bucket_id = 'staff-photos');

create policy "Admin write staff photos"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'staff-photos'
  and exists (select 1 from admin_users where user_id = auth.uid())
)
with check (
  bucket_id = 'staff-photos'
  and exists (select 1 from admin_users where user_id = auth.uid())
);
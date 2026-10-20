-- ============================================================
-- 0013: Content features — announcements, contact inbox,
--       photo gallery, downloadable documents, media buckets
--
-- Follows the established pattern: public rows read what a
-- publish flag allows; writes go through admin_users membership;
-- storage buckets are public-read / admin-write like staff-photos
-- (0004). Paste this file into the Supabase SQL editor.
-- ============================================================

-- ------------------------------------------------------------
-- announcements — news/advisories/events shown on /news and the
-- homepage band. Filipino fields hold optional translations for
-- the key-announcement audience (public-school parents).
-- ------------------------------------------------------------
create table announcements (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  excerpt          text,
  body             text not null default '',
  category         text not null default 'announcement'
                   check (category in ('announcement','news','event','advisory')),
  cover_image_path text,
  is_pinned        boolean not null default false,
  is_published     boolean not null default false,
  published_at     timestamptz,
  title_fil        text,
  excerpt_fil      text,
  body_fil         text,
  is_archived      boolean not null default false,
  created_by       uuid references auth.users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table announcements enable row level security;

-- Public reads only published, un-archived rows whose publish time
-- has arrived (scheduled posts stay invisible until their moment).
create policy "Public read published announcements"
on announcements for select
using (
  is_published = true
  and is_archived = false
  and (published_at is null or published_at <= now())
);

create policy "Admin manage announcements"
on announcements for all to authenticated
using (exists (select 1 from admin_users where user_id = auth.uid()))
with check (exists (select 1 from admin_users where user_id = auth.uid()));

create index idx_announcements_public_feed
on announcements (is_published, is_pinned desc, published_at desc)
where is_published and not is_archived;

-- ------------------------------------------------------------
-- contact_messages — public write-only inbox. Anyone may INSERT
-- (the form is public); only admins can ever read rows back, so
-- the table leaks nothing to the public API.
-- ------------------------------------------------------------
create table contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text not null default 'General inquiry',
  message     text not null,
  is_read     boolean not null default false,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table contact_messages enable row level security;

create policy "Anyone can send a message"
on contact_messages for insert
with check (true);

create policy "Admin read messages"
on contact_messages for select to authenticated
using (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "Admin update messages"
on contact_messages for update to authenticated
using (exists (select 1 from admin_users where user_id = auth.uid()))
with check (exists (select 1 from admin_users where user_id = auth.uid()));

-- ------------------------------------------------------------
-- gallery_photos — event/section photos uploaded from the admin.
-- section_slug ties a photo to a campus-life section page
-- ('general' is fine for school-wide shots).
-- ------------------------------------------------------------
create table gallery_photos (
  id           uuid primary key default gen_random_uuid(),
  section_slug text not null default 'general',
  title        text,
  caption      text,
  storage_path text not null,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table gallery_photos enable row level security;

create policy "Public read gallery photos"
on gallery_photos for select
using (is_published = true);

create policy "Admin manage gallery photos"
on gallery_photos for all to authenticated
using (exists (select 1 from admin_users where user_id = auth.uid()))
with check (exists (select 1 from admin_users where user_id = auth.uid()));

create index idx_gallery_section on gallery_photos (section_slug, sort_order);

-- ------------------------------------------------------------
-- documents — downloadable PDFs/forms (enrollment forms,
-- handbooks, clearances). The file lives in the documents bucket;
-- this row is its catalogue card.
-- ------------------------------------------------------------
create table documents (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  category     text not null default 'other'
               check (category in ('enrollment','forms','handbook','other')),
  file_path    text not null,
  file_name    text not null,
  file_type    text,
  file_size    bigint,
  is_published boolean not null default true,
  sort_order   integer not null default 0,
  is_archived  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table documents enable row level security;

create policy "Public read documents"
on documents for select
using (is_published = true and is_archived = false);

create policy "Admin manage documents"
on documents for all to authenticated
using (exists (select 1 from admin_users where user_id = auth.uid()))
with check (exists (select 1 from admin_users where user_id = auth.uid()));

-- ------------------------------------------------------------
-- Storage buckets — same public-read / admin-write posture as
-- staff-photos (0004).
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('news-covers', 'news-covers', true, 5242880,
   array['image/jpeg','image/png','image/webp']),
  ('gallery', 'gallery', true, 5242880,
   array['image/jpeg','image/png','image/webp']),
  ('documents', 'documents', true, 20971520,
   array['application/pdf','image/jpeg','image/png',
         'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set
  public            = excluded.public,
  file_size_limit   = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read news covers"
on storage.objects for select using (bucket_id = 'news-covers');
create policy "Admin write news covers"
on storage.objects for all to authenticated
using (bucket_id = 'news-covers' and exists (select 1 from admin_users where user_id = auth.uid()))
with check (bucket_id = 'news-covers' and exists (select 1 from admin_users where user_id = auth.uid()));

create policy "Public read gallery files"
on storage.objects for select using (bucket_id = 'gallery');
create policy "Admin write gallery files"
on storage.objects for all to authenticated
using (bucket_id = 'gallery' and exists (select 1 from admin_users where user_id = auth.uid()))
with check (bucket_id = 'gallery' and exists (select 1 from admin_users where user_id = auth.uid()));

create policy "Public read document files"
on storage.objects for select using (bucket_id = 'documents');
create policy "Admin write document files"
on storage.objects for all to authenticated
using (bucket_id = 'documents' and exists (select 1 from admin_users where user_id = auth.uid()))
with check (bucket_id = 'documents' and exists (select 1 from admin_users where user_id = auth.uid()));

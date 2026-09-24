-- ============================================================
-- 0008: Budget admin fields
--
-- Adds archive/status metadata for categories and date/file metadata
-- for accomplishments required by the admin workflow. Fiscal-year
-- immutability still needs a stronger DB policy: the existing RLS
-- blocks writes only when status = 'archived', not every non-current
-- fiscal year. The UI restriction remains a convenience, not security.
-- ============================================================

alter table budget_categories
  add column if not exists is_archived boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table budget_accomplishments
  add column if not exists accomplishment_date date,
  add column if not exists photo_path text,
  add column if not exists document_path text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'budget-files',
  'budget-files',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read budget files"
on storage.objects
for select
using (bucket_id = 'budget-files');

create policy "Admin write budget files"
on storage.objects
for all
 to authenticated
using (
  bucket_id = 'budget-files'
  and exists (select 1 from admin_users where user_id = auth.uid())
)
with check (
  bucket_id = 'budget-files'
  and exists (select 1 from admin_users where user_id = auth.uid())
);

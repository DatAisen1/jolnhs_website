-- ============================================================
-- 0012: align admin_users RLS with the live database (P2.X)
--
-- Fresh projects created from migrations should match the production
-- posture: admin_users is protected by row-level security, only the
-- signed-in admin can read their row, and anon/authenticated have no
-- write privileges on the table.
-- ============================================================

alter table public.admin_users enable row level security;

drop policy if exists "Authenticated can check admin status" on public.admin_users;
drop policy if exists "Admins can read own row" on public.admin_users;

create policy "Admins can read own row"
on public.admin_users
for select to authenticated
using (user_id = auth.uid());

revoke all on public.admin_users from anon;
revoke insert, update, delete, truncate, references, trigger on public.admin_users from authenticated;

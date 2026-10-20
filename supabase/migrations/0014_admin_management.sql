-- ============================================================
-- 0014: Admin user management + activity log
--
-- admin_users rows are invisible to non-admins, and each admin
-- can only see their own row — so both listing "who is an admin"
-- and adding someone by email need SECURITY DEFINER RPCs that can
-- reach auth.users. Each RPC re-checks the caller's admin
-- membership before doing anything.
-- ============================================================

-- ------------------------------------------------------------
-- activity_log — audit trail of who changed what, written by the
-- admin app after each mutation. user_id/email are captured
-- server-side so a client cannot spoof them.
-- ------------------------------------------------------------
create table activity_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id),
  user_email  text not null,
  action      text not null,
  entity_type text not null,
  entity_id   text,
  summary     text not null,
  details     jsonb,
  created_at  timestamptz not null default now()
);

alter table activity_log enable row level security;

create policy "Admin read activity log"
on activity_log for select to authenticated
using (exists (select 1 from admin_users where user_id = auth.uid()));

create index idx_activity_log_recent on activity_log (created_at desc);

-- Insert path is a SECURITY DEFINER RPC so the app never gets a
-- direct INSERT grant — the only way in is via log_activity(),
-- which stamps auth.uid()/email itself.
create or replace function public.log_activity(
  p_action      text,
  p_entity_type text,
  p_entity_id   text,
  p_summary     text,
  p_details     jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  if not exists (select 1 from admin_users where user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;

  select email into v_email from auth.users where id = auth.uid();

  insert into activity_log (user_id, user_email, action, entity_type, entity_id, summary, details)
  values (auth.uid(), coalesce(v_email, 'unknown'), p_action, p_entity_type, p_entity_id, p_summary, p_details);
end;
$$;

-- ------------------------------------------------------------
-- list_admin_users() — returns every admin row plus the auth
-- email, for the Admin Users management screen.
-- ------------------------------------------------------------
create or replace function public.list_admin_users()
returns table (user_id uuid, email text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admin_users where user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;

  return query
    select u.id, u.email::text, au.created_at
    from admin_users au
    join auth.users u on u.id = au.user_id
    order by au.created_at;
end;
$$;

-- ------------------------------------------------------------
-- add_admin_by_email(email) — the admin types an email; we look
-- up the matching auth account and grant it. Fails loudly when
-- no account exists so the UI can say "invite them to sign up
-- first" instead of silently storing a dead email.
-- ------------------------------------------------------------
create or replace function public.add_admin_by_email(p_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not exists (select 1 from admin_users where user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;

  select id into v_id from auth.users where lower(email) = lower(trim(p_email));
  if v_id is null then
    raise exception 'No account found for that email';
  end if;

  insert into admin_users (user_id) values (v_id)
  on conflict (user_id) do nothing;

  return v_id;
end;
$$;

-- ------------------------------------------------------------
-- remove_admin(user_id) — revoke access. Blocks removing your
-- own account so an admin can't lock themselves (and everyone
-- else) out of the panel.
-- ------------------------------------------------------------
create or replace function public.remove_admin(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admin_users where user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot remove your own admin access';
  end if;

  delete from admin_users where user_id = p_user_id;
end;
$$;

-- ============================================================
-- 0005: Server-side login rate limiting (P1.6)
--
-- Problem: the previous lockout lived entirely in sessionStorage
-- on the client. It was a fast UX nicety, but zero real security —
-- a private window or a cleared storage bucket resets it instantly.
--
-- Fix: track failed attempts per email in this table, gated
-- entirely behind SECURITY DEFINER functions. RLS on the table has
-- no policies at all, and direct grants are revoked below, so the
-- anon/authenticated roles used by the browser can never read or
-- write a row directly — the only way in is through
-- check_login_lock() / record_login_attempt(), which enforce the
-- attempt cap and lockout window server-side, in Postgres, where
-- clearing browser storage can't touch it.
--
-- This is keyed by email, not IP — the client (anon key, no
-- server/edge layer in front of Supabase) has no trustworthy way
-- to learn the caller's IP, and a spoofable IP is worse than no
-- IP. Keying by email still fully closes the gap this task is
-- about: unlimited password guesses against one admin account.
-- ============================================================

create table login_attempts (
  email           text primary key,
  failed_count    int not null default 0,
  locked_until    timestamptz,
  last_attempt_at timestamptz not null default now()
);

alter table login_attempts enable row level security;
-- Intentionally zero policies: RLS with no policy denies all
-- access by default, for every role, including the table owner's
-- grants below. Belt-and-suspenders with the explicit revoke.
revoke all on login_attempts from anon, authenticated;

-- ------------------------------------------------------------
-- check_login_lock — read-only pre-flight check.
-- Called before attempting sign-in so a locked-out admin sees the
-- lockout message immediately, without spending a real auth
-- attempt against Supabase Auth.
-- ------------------------------------------------------------
create or replace function public.check_login_lock(p_email text)
returns table(is_locked boolean, seconds_remaining int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_row   login_attempts%rowtype;
begin
  if v_email is null or v_email = '' then
    return query select false, 0;
    return;
  end if;

  select * into v_row from login_attempts where email = v_email;

  if v_row.email is null
     or v_row.locked_until is null
     or v_row.locked_until <= now() then
    return query select false, 0;
  else
    return query select true,
      greatest(0, ceil(extract(epoch from (v_row.locked_until - now()))))::int;
  end if;
end;
$$;

revoke all on function public.check_login_lock(text) from public;
grant execute on function public.check_login_lock(text) to anon, authenticated;

-- ------------------------------------------------------------
-- record_login_attempt — call after every sign-in attempt.
-- p_success = true clears the counter (fresh start after a good
-- login). p_success = false increments it and locks the account
-- once MAX_ATTEMPTS is hit. Stale counters (no attempt in
-- RESET_AFTER_SECONDS) are forgiven rather than compounding
-- forever.
--
-- Keep MAX_ATTEMPTS / LOCKOUT_SECONDS here in sync with the
-- display copy in src/pages/admin/LoginPage.tsx — the UI numbers
-- are just messaging, this function is the actual enforcement.
-- ------------------------------------------------------------
create or replace function public.record_login_attempt(p_email text, p_success boolean)
returns table(is_locked boolean, seconds_remaining int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email              text := lower(trim(p_email));
  v_row                login_attempts%rowtype;
  v_max_attempts        constant int := 5;
  v_lockout_seconds      constant int := 60;
  v_reset_after_seconds  constant int := 900; -- 15 min of inactivity clears the count
begin
  if v_email is null or v_email = '' then
    return query select false, 0;
    return;
  end if;

  if p_success then
    delete from login_attempts where email = v_email;
    return query select false, 0;
    return;
  end if;

  select * into v_row from login_attempts where email = v_email for update;

  if v_row.email is null then
    insert into login_attempts (email, failed_count, last_attempt_at)
    values (v_email, 1, now());
    return query select false, 0;
    return;
  end if;

  -- Already locked: report remaining time, don't extend the lock
  -- just because the admin (or an attacker) submitted again.
  if v_row.locked_until is not null and v_row.locked_until > now() then
    return query select true,
      greatest(0, ceil(extract(epoch from (v_row.locked_until - now()))))::int;
    return;
  end if;

  if v_row.last_attempt_at < now() - make_interval(secs => v_reset_after_seconds) then
    v_row.failed_count := 0;
  end if;

  v_row.failed_count := v_row.failed_count + 1;

  if v_row.failed_count >= v_max_attempts then
    update login_attempts
      set failed_count    = 0,
          locked_until    = now() + make_interval(secs => v_lockout_seconds),
          last_attempt_at = now()
      where email = v_email;

    return query select true, v_lockout_seconds;
  else
    update login_attempts
      set failed_count    = v_row.failed_count,
          locked_until    = null,
          last_attempt_at = now()
      where email = v_email;

    return query select false, 0;
  end if;
end;
$$;

revoke all on function public.record_login_attempt(text, boolean) from public;
grant execute on function public.record_login_attempt(text, boolean) to anon, authenticated;
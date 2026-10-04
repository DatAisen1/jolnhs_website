-- ============================================================
-- 0011: login rate-limit identity check (P2.1)
--
-- Fix the bypass where an anonymous caller could call
-- record_login_attempt(p_email, true) and clear another user's
-- lockout without proving they owned that email address.
-- ============================================================

create or replace function public.record_login_attempt(p_email text, p_success boolean)
returns table(is_locked boolean, seconds_remaining int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email              text := lower(trim(p_email));
  v_row                login_attempts%rowtype;
  v_jwt_email          text;
  v_max_attempts        constant int := 5;
  v_lockout_seconds      constant int := 60;
  v_reset_after_seconds  constant int := 900;
begin
  if v_email is null or v_email = '' then
    return query select false, 0;
    return;
  end if;

  if p_success then
    v_jwt_email := lower(trim(auth.jwt() ->> 'email'));

    if auth.uid() is null or v_jwt_email is null or v_jwt_email <> v_email then
      return query select false, 0;
      return;
    end if;

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

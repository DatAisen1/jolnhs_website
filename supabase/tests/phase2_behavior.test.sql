begin;
select plan(13);

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'admin@example.com'),
  ('22222222-2222-4222-8222-222222222222', 'nonadmin@example.com'),
  ('33333333-3333-4333-8333-333333333333', 'other@example.com')
on conflict (id) do nothing;

insert into public.admin_users (user_id)
values ('11111111-1111-4111-8111-111111111111')
on conflict (user_id) do nothing;

select is(
  (select count(*)::int from pg_policies where schemaname = 'public' and tablename = 'admin_users'),
  1,
  'check 1: exactly one policy on admin_users'
);

select set_config('role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","email":"admin@example.com"}', true);
select is(
  (select count(*)::int from public.admin_users where user_id = auth.uid()),
  1,
  'check 2: admin reads own admin_users row'
);

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","email":"nonadmin@example.com"}', true);
select is(
  (select count(*)::int from public.admin_users where user_id = auth.uid()),
  0,
  'check 3: non-admin reads 0 rows from admin_users'
);

select set_config('role', 'anon', true);
select lives_ok(
  $test$ do $anon_check$
  declare
    visible_rows int;
  begin
    if has_table_privilege('anon', 'public.admin_users', 'select') then
      execute 'select count(*) from public.admin_users' into visible_rows;
      if visible_rows > 0 then
        raise exception 'anon can read admin_users rows';
      end if;
    end if;
  end
  $anon_check$ $test$,
  'check 4: anon is denied or sees no admin_users rows'
);

select set_config('role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","email":"admin@example.com"}', true);
select throws_ok(
  $$ insert into public.admin_users (user_id) values ('44444444-4444-4444-8444-444444444444') $$,
  '42501',
  null,
  'check 5: authenticated insert into admin_users denied'
);

select lives_ok(
  $$ insert into public.staff_members (name, position, category) values ('Admin Write', 'Lead', 'staff') $$,
  'check 6: admin can write to an admin-gated table'
);

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","email":"nonadmin@example.com"}', true);
select throws_ok(
  $$ insert into public.staff_members (name, position, category) values ('Nonadmin Write', 'Lead', 'staff') $$,
  '42501',
  null,
  'check 7: non-admin cannot write to the same table'
);

select set_config('request.jwt.claim.sub', '55555555-5555-4555-8555-555555555555', true);
select set_config('request.jwt.claims', '{"sub":"55555555-5555-4555-8555-555555555555","email":"victim@example.com"}', true);
select * from public.record_login_attempt('victim@example.com', false);
select * from public.record_login_attempt('victim@example.com', false);
select * from public.record_login_attempt('victim@example.com', false);
select * from public.record_login_attempt('victim@example.com', false);
select * from public.record_login_attempt('victim@example.com', false);
select is(
  (select is_locked from public.check_login_lock('victim@example.com')),
  true,
  'check 8: five failed attempts leaves the lock on'
);

select set_config('role', 'anon', true);
select is(
  (select is_locked from public.check_login_lock('victim@example.com')),
  true,
  'check 9: anon record_login_attempt(X, true) does not clear the lock'
);

select set_config('role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
select set_config('request.jwt.claims', '{"sub":"33333333-3333-4333-8333-333333333333","email":"other@example.com"}', true);
select * from public.record_login_attempt('victim@example.com', true);
select is(
  (select is_locked from public.check_login_lock('victim@example.com')),
  true,
  'check 10: different authenticated email does not clear the lock'
);

select set_config('request.jwt.claim.sub', '55555555-5555-4555-8555-555555555555', true);
select set_config('request.jwt.claims', '{"sub":"55555555-5555-4555-8555-555555555555","email":"victim@example.com"}', true);
select * from public.record_login_attempt('victim@example.com', true);
select is(
  (select is_locked from public.check_login_lock('victim@example.com')),
  false,
  'check 11: matching-JWT success clears the lock'
);

select set_config('request.jwt.claim.sub', '66666666-6666-4666-8666-666666666666', true);
select set_config('request.jwt.claims', '{"sub":"66666666-6666-4666-8666-666666666666","email":"victim2@example.com"}', true);
select * from public.record_login_attempt('victim2@example.com', false);
select * from public.record_login_attempt('victim2@example.com', false);
select * from public.record_login_attempt('victim2@example.com', false);
select * from public.record_login_attempt('victim2@example.com', true);
select is(
  (select is_locked from public.check_login_lock('victim2@example.com')),
  false,
  'check 12: three failures then matching-JWT success leaves the account unlocked'
);

select set_config('role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","email":"admin@example.com"}', true);
select lives_ok(
  $$ insert into public.staff_members (name, position, category) values ('Admin Recheck', 'Lead', 'staff') $$,
  'check 13: after 0012, admin-gated writes still allow admins'
);

select * from finish();
rollback;

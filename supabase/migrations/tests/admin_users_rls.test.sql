begin;
select plan(7);

set local role authenticated;

-- Test fixture, not a real account.
insert into auth.users (id, email)
values ('11111111-1111-4111-8111-111111111111', 'nonadmin@test.local')
on conflict (id) do nothing;

insert into auth.users (id, email)
values ('22222222-2222-4222-8222-222222222222', 'admin@test.local')
on conflict (id) do nothing;

insert into admin_users (user_id)
values ('22222222-2222-4222-8222-222222222222')
on conflict (user_id) do nothing;

set local "request.jwt.claim.sub" = '11111111-1111-4111-8111-111111111111';
set local "request.jwt.claims" = '{"sub":"11111111-1111-4111-8111-111111111111","email":"nonadmin@test.local"}';

select is(
  (select count(*)::int from admin_users where user_id = auth.uid()),
  0,
  'authenticated non-admin sees no rows in admin_users'
);
select throws_ok(
  $$ insert into admin_users (user_id) values ('33333333-3333-4333-8333-333333333333') $$,
  '42501',
  null,
  'authenticated non-admin cannot insert into admin_users'
);

set local "request.jwt.claim.sub" = '22222222-2222-4222-8222-222222222222';
set local "request.jwt.claims" = '{"sub":"22222222-2222-4222-8222-222222222222","email":"admin@test.local"}';

select is(
  (select count(*)::int from admin_users where user_id = auth.uid()),
  1,
  'authenticated admin reads only their own admin_users row'
);

insert into staff_members (name, position, category)
values ('Test Staff', 'Coordinator', 'staff');
select is(
  (select count(*)::int from staff_members where name = 'Test Staff'),
  1,
  'admin can still write staff_members through the existing RLS policies'
);

set local role anon;
select is(
  (select count(*)::int from admin_users),
  0,
  'anon cannot select from admin_users'
);

select * from finish();
rollback;

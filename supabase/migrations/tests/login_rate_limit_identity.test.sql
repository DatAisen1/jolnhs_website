begin;
select plan(8);

delete from login_attempts;

for i in 1..5 loop
  perform public.record_login_attempt('victim@example.com', false);
end loop;

select is(
  (select is_locked from public.check_login_lock('victim@example.com')),
  true,
  'five failed attempts lock the email'
);

set local role anon;
select is(
  (select is_locked from public.record_login_attempt('victim@example.com', true)),
  false,
  'anon success call does not clear another user''s lock'
);
select is(
  (select is_locked from public.check_login_lock('victim@example.com')),
  true,
  'anon success call leaves the lock in place'
);

set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-4111-8111-111111111111';
set local "request.jwt.claims" = '{"sub":"11111111-1111-4111-8111-111111111111","email":"other@example.com"}';
select is(
  (select is_locked from public.record_login_attempt('victim@example.com', true)),
  false,
  'different authenticated email does not clear the lock'
);
select is(
  (select is_locked from public.check_login_lock('victim@example.com')),
  true,
  'different authenticated email leaves the lock intact'
);

set local "request.jwt.claim.sub" = '22222222-2222-4222-8222-222222222222';
set local "request.jwt.claims" = '{"sub":"22222222-2222-4222-8222-222222222222","email":"victim@example.com"}';
select is(
  (select is_locked from public.record_login_attempt('victim@example.com', true)),
  false,
  'matching authenticated email clears the lock'
);
select is(
  (select is_locked from public.check_login_lock('victim@example.com')),
  false,
  'successful login clears the stored lockout'
);

set local "request.jwt.claim.sub" = '33333333-3333-4333-8333-333333333333';
set local "request.jwt.claims" = '{"sub":"33333333-3333-4333-8333-333333333333","email":" Victim@Example.com "}';
select is(
  (select is_locked from public.record_login_attempt(' Victim@Example.com ', true)),
  false,
  'trimmed + lowercased email still matches the caller JWT'
);
select is(
  (select is_locked from public.check_login_lock('Victim@Example.com')),
  false,
  'case/whitespace-normalized email clears the match after a successful login'
);

select * from finish();
rollback;

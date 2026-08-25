begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(20);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.account_experience_state'::regclass),
  'account_experience_state has RLS enabled'
);

select policies_are(
  'public',
  'account_experience_state',
  array[
    'Students can establish their own initial experience',
    'Students can read their own account experience',
    'Students can update their own first-use state'
  ],
  'account experience exposes only the governed owner-scoped policies'
);

select ok(not has_table_privilege('anon', 'public.account_experience_state', 'select'), 'anonymous cannot read account experience state');
select ok(has_table_privilege('authenticated', 'public.account_experience_state', 'select'), 'authenticated can select account experience state subject to RLS');
select ok(has_table_privilege('authenticated', 'public.account_experience_state', 'insert'), 'authenticated can establish their Student experience subject to RLS');
select ok(has_table_privilege('authenticated', 'public.account_experience_state', 'update'), 'authenticated can advance their own first-use state subject to RLS');
select ok(not has_table_privilege('authenticated', 'public.account_experience_state', 'delete'), 'account experience cannot be deleted by the browser');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.student_first_use_events'::regclass),
  'student_first_use_events has RLS enabled'
);

select policies_are(
  'public',
  'student_first_use_events',
  array['Students can record their own first-use events'],
  'first-use telemetry exposes only owner-scoped insert'
);

select ok(has_table_privilege('authenticated', 'public.student_first_use_events', 'insert'), 'authenticated can record their own first-use telemetry subject to RLS');
select ok(not has_table_privilege('authenticated', 'public.student_first_use_events', 'select'), 'browser cannot read the first-use telemetry table');

insert into auth.users (id, email) values
  ('51000000-0000-4000-8000-000000000051', 'first-use-user-1@revision.invalid'),
  ('52000000-0000-4000-8000-000000000052', 'first-use-user-2@revision.invalid');

select is(
  (select count(*) from public.account_experience_state where user_id in (
    '51000000-0000-4000-8000-000000000051',
    '52000000-0000-4000-8000-000000000052'
  )),
  0::bigint,
  'accounts created after the FI-021 migration are not compatibility-seeded as onboarding complete'
);

insert into public.account_experience_state (
  user_id, primary_experience, onboarding_stage, onboarding_completed_at
) values (
  '52000000-0000-4000-8000-000000000052', 'student', 'complete', now()
);

set local role authenticated;
set local request.jwt.claim.sub = '51000000-0000-4000-8000-000000000051';

select lives_ok(
  $$insert into public.account_experience_state (user_id, primary_experience, onboarding_stage)
    values ('51000000-0000-4000-8000-000000000051', 'student', 'course')$$,
  'Student can establish their own initial account experience'
);

select throws_ok(
  $$insert into public.account_experience_state (user_id, primary_experience, onboarding_stage)
    values ('51000000-0000-4000-8000-000000000051', 'parent', 'course')$$,
  '42501',
  'new row violates row-level security policy for table "account_experience_state"',
  'Parent cannot be silently enabled through the initial browser policy'
);

select results_eq(
  $$select count(*) from public.account_experience_state$$,
  array[1::bigint],
  'Student can read only their own account experience state'
);

select lives_ok(
  $$update public.account_experience_state
    set onboarding_stage = 'course_ready', updated_at = now()
    where user_id = '51000000-0000-4000-8000-000000000051'$$,
  'Student can advance their own first-use state'
);

select throws_ok(
  $$insert into public.account_experience_state (user_id, primary_experience, onboarding_stage)
    values ('52000000-0000-4000-8000-000000000052', 'student', 'course')$$,
  '42501',
  'new row violates row-level security policy for table "account_experience_state"',
  'Student cannot create first-use state for another account'
);

select lives_ok(
  $$insert into public.student_first_use_events (user_id, event_type, course_id, metadata)
    values ('51000000-0000-4000-8000-000000000051', 'student_selected', null, '{"source":"test"}'::jsonb)$$,
  'Student can record their own bounded first-use event'
);

select throws_ok(
  $$insert into public.student_first_use_events (user_id, event_type, course_id, metadata)
    values ('52000000-0000-4000-8000-000000000052', 'student_selected', null, '{}'::jsonb)$$,
  '42501',
  'new row violates row-level security policy for table "student_first_use_events"',
  'Student cannot record first-use events for another account'
);

reset role;

select is(
  (
    (select count(*) from public.learning_evidence where user_id in (
      '51000000-0000-4000-8000-000000000051',
      '52000000-0000-4000-8000-000000000052'
    ))
    +
    (select count(*) from public.starting_check_evidence where user_id in (
      '51000000-0000-4000-8000-000000000051',
      '52000000-0000-4000-8000-000000000052'
    ))
  ),
  0::bigint,
  'routing state and funnel telemetry do not create educational evidence'
);

select * from finish();
rollback;
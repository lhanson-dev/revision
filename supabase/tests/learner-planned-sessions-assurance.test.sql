begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(25);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.learner_planned_sessions'::regclass),
  'learner_planned_sessions has RLS enabled'
);
select policies_are(
  'public',
  'learner_planned_sessions',
  array['users_manage_own_learner_planned_sessions'],
  'learner planned sessions expose only the owner policy'
);

select ok(not has_table_privilege('anon', 'public.learner_planned_sessions', 'select'), 'anonymous cannot read planned sessions');
select ok(not has_table_privilege('anon', 'public.learner_planned_sessions', 'insert'), 'anonymous cannot insert planned sessions');
select ok(has_table_privilege('authenticated', 'public.learner_planned_sessions', 'select'), 'authenticated can select own planned sessions subject to RLS');
select ok(has_table_privilege('authenticated', 'public.learner_planned_sessions', 'insert'), 'authenticated can insert own planned sessions subject to RLS');
select ok(has_table_privilege('authenticated', 'public.learner_planned_sessions', 'update'), 'authenticated can update own planned sessions subject to RLS');
select ok(has_table_privilege('authenticated', 'public.learner_planned_sessions', 'delete'), 'authenticated can delete own planned sessions subject to RLS');
select ok(not has_table_privilege('service_role', 'public.learner_planned_sessions', 'select'), 'service role has no standing access to planned sessions');

insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-0000000000a1', 'planned-a@revision.invalid'),
  ('00000000-0000-4000-8000-0000000000a2', 'planned-b@revision.invalid');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-0000000000a1';

select lives_ok(
  $$insert into public.learner_planned_sessions (user_id, planned_date, course_id, topic_id, activity_type, minutes, added_by)
    values ('00000000-0000-4000-8000-0000000000a1', '2026-10-08', 'aqa:aqa-a-level:7132', 'finance', 'practice', 20, 'student')$$,
  'a learner can accept a session onto their own plan'
);
select throws_ok(
  $$insert into public.learner_planned_sessions (user_id, planned_date, course_id, topic_id, activity_type, minutes, added_by)
    values ('00000000-0000-4000-8000-0000000000a2', '2026-10-08', 'aqa:aqa-a-level:7132', 'finance', 'practice', 20, 'student')$$,
  '42501',
  'new row violates row-level security policy for table "learner_planned_sessions"',
  'a learner cannot create a planned session for someone else'
);
select throws_ok(
  $$insert into public.learner_planned_sessions (user_id, planned_date, course_id, topic_id, activity_type, minutes, added_by)
    values ('00000000-0000-4000-8000-0000000000a1', '2026-10-08', 'aqa:aqa-a-level:7132', 'finance', 'practice', 25, 'rev')$$,
  '23505',
  null,
  'the same topic and activity cannot be planned twice on one day'
);
select lives_ok(
  $$insert into public.learner_planned_sessions (user_id, planned_date, course_id, topic_id, activity_type, minutes, added_by, recommendation_id)
    values ('00000000-0000-4000-8000-0000000000a1', '2026-10-09', 'aqa:aqa-a-level:7132', 'finance', 'practice', 25, 'rev', 'rec-1')$$,
  'the same topic can be planned on a different day, and a REV suggestion the learner accepted is recorded as rev'
);
select throws_ok(
  $$insert into public.learner_planned_sessions (user_id, planned_date, course_id, topic_id, activity_type, minutes, added_by)
    values ('00000000-0000-4000-8000-0000000000a1', '2026-10-10', 'aqa:aqa-a-level:7132', 'hr', 'practice', 1, 'student')$$,
  '23514',
  null,
  'a session shorter than 5 minutes is rejected'
);
select throws_ok(
  $$insert into public.learner_planned_sessions (user_id, planned_date, course_id, topic_id, activity_type, minutes, added_by)
    values ('00000000-0000-4000-8000-0000000000a1', '2026-10-10', 'aqa:aqa-a-level:7132', 'hr', 'practice', 600, 'student')$$,
  '23514',
  null,
  'a session longer than 240 minutes is rejected'
);
select throws_ok(
  $$insert into public.learner_planned_sessions (user_id, planned_date, course_id, topic_id, activity_type, minutes, added_by)
    values ('00000000-0000-4000-8000-0000000000a1', '2026-10-10', 'aqa:aqa-a-level:7132', 'hr', 'revise', 20, 'student')$$,
  '23514',
  null,
  'an unknown activity type is rejected'
);
select throws_ok(
  $$insert into public.learner_planned_sessions (user_id, planned_date, course_id, topic_id, activity_type, minutes, added_by)
    values ('00000000-0000-4000-8000-0000000000a1', '2026-10-10', 'aqa:aqa-a-level:7132', 'hr', 'practice', 20, 'teacher')$$,
  '23514',
  null,
  'only the student or REV can be recorded as the one who added a session'
);
select throws_ok(
  $$insert into public.learner_planned_sessions (user_id, planned_date, course_id, topic_id, activity_type, minutes, added_by)
    values ('00000000-0000-4000-8000-0000000000a1', '2026-10-10', '   ', 'hr', 'practice', 20, 'student')$$,
  '23514',
  null,
  'a blank course id is rejected'
);

select is(
  (select count(*) from public.learner_planned_sessions),
  2::bigint,
  'a learner sees only their own two planned sessions'
);
select lives_ok(
  $$update public.learner_planned_sessions set status = 'done', updated_at = now() where topic_id = 'finance' and planned_date = '2026-10-08'$$,
  'a learner can mark their own session done'
);
select throws_ok(
  $$update public.learner_planned_sessions set status = 'cancelled' where topic_id = 'finance' and planned_date = '2026-10-09'$$,
  '23514',
  null,
  'an unknown status is rejected'
);

set local request.jwt.claim.sub = '00000000-0000-4000-8000-0000000000a2';

select is(
  (select count(*) from public.learner_planned_sessions),
  0::bigint,
  'another learner cannot see someone else''s planned sessions'
);
select lives_ok(
  $$update public.learner_planned_sessions set status = 'skipped' where topic_id = 'finance'$$,
  'another learner''s update affects no rows (no error, nothing changes)'
);
select lives_ok(
  $$delete from public.learner_planned_sessions where topic_id = 'finance'$$,
  'another learner''s delete affects no rows (no error, nothing changes)'
);

reset role;
select is(
  (select count(*) from public.learner_planned_sessions where user_id = '00000000-0000-4000-8000-0000000000a1'),
  2::bigint,
  'the other learner''s update and delete changed nothing'
);

select * from finish();
rollback;

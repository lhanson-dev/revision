begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(24);

select ok(exists(select 1 from cron.job
  where jobname='revision-expired-exam-attempts-v1' and schedule='0 * * * *'),
  'automatic hourly expiry deletion job is scheduled');

select ok((select relrowsecurity from pg_class where oid='public.learner_exam_attempts'::regclass),
  'exam attempts have row-level security');
select policies_are('public','learner_exam_attempts',array[
  'learner_select_own_exam_attempts','learner_insert_own_exam_attempts',
  'learner_update_own_exam_attempts','learner_delete_own_exam_attempts'
], 'only owner-scoped policies exist');
select ok(not has_table_privilege('anon','public.learner_exam_attempts','SELECT'),'anonymous cannot read raw answers');
select ok(not has_table_privilege('anon','public.learner_exam_attempts','INSERT'),'anonymous cannot create exam attempts');
select ok(not has_table_privilege('service_role','public.learner_exam_attempts','SELECT'),
  'service role has no standing draft access');
select ok(has_table_privilege('authenticated','public.learner_exam_attempts','SELECT'),'authenticated learners may read their own exams');
select ok(has_table_privilege('authenticated','public.learner_exam_attempts','INSERT'),'authenticated learners may create their exams');
select ok(has_table_privilege('authenticated','public.learner_exam_attempts','UPDATE'),'authenticated learners may update their exams');
select ok(has_table_privilege('authenticated','public.learner_exam_attempts','DELETE'),'authenticated learners may discard their exams');

insert into auth.users(id,email) values
  ('00000000-0000-4000-8000-0000000000c1','exam-a@revision.invalid'),
  ('00000000-0000-4000-8000-0000000000c2','exam-b@revision.invalid');
set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-0000000000c1';
select lives_ok($$
  insert into public.learner_exam_attempts
    (user_id,course_id,module_id,exam_id,attempt_id,content_fingerprint,snapshot,expires_at)
  values (
    '00000000-0000-4000-8000-0000000000c1','aqa:aqa-a-level:7132',
    'business-7132-paper-1','mock-1','11111111-1111-4111-8111-111111111111',
    repeat('a',64), '{"schemaVersion":1,"phase":"writing","answers":{"q1":"Private essay draft"},"frozenSubmission":null,"timing":{"policy":"pause-on-interruption","elapsedMs":0,"interrupted":false,"runningSince":null}}'::jsonb,
    now() + interval '14 days')
$$,'learner can create private draft');
select throws_ok($$
  insert into public.learner_exam_attempts
    (user_id,course_id,module_id,exam_id,attempt_id,content_fingerprint,snapshot,expires_at)
  values ('00000000-0000-4000-8000-0000000000c2','other','other','mock-1',
    '22222222-2222-4222-8222-222222222222',repeat('a',64),
    '{"schemaVersion":1,"phase":"writing","frozenSubmission":null,"timing":{"policy":"pause-on-interruption"}}'::jsonb, now() + interval '14 days')
$$, '42501', 'new row violates row-level security policy for table "learner_exam_attempts"',
  'learner cannot insert another learner exam');
select is((select count(*) from public.learner_exam_attempts),1::bigint,'learner reads own draft');
select lives_ok($update public.learner_exam_attempts set revision=2 where exam_id='mock-1'$,'owner can update own draft');
select throws_ok($update public.learner_exam_attempts set revision=2 where exam_id='mock-1'$,
  '23514','Examination revision must increase by one','cannot overwrite an older revision');
select throws_ok($update public.learner_exam_attempts set snapshot='{"schemaVersion":1,"phase":"submitted"}'::jsonb,
  revision=3 where exam_id='mock-1'$,
  '23514','Invalid examination state transition','cannot skip marking and frozen submission');

select throws_ok($update public.learner_exam_attempts set expires_at=now()+interval '15 days',
  revision=3 where exam_id='mock-1'$,'23514','Examination identity and retention cannot change',
  'owner cannot extend retention beyond original 14 days');
select throws_ok($update public.learner_exam_attempts set revision=3,
  snapshot=jsonb_set(snapshot,'{timing,policy}','"wall-clock"'::jsonb)
  where exam_id='mock-1'$,'23514','Exam timer must pause on interruption',
  'owner cannot bypass the approved timer policy');
select ok((select expires_at <= created_at + interval '14 days 2 minutes'
  from public.learner_exam_attempts where exam_id='mock-1'), 'draft remains capped from creation');
select throws_ok($insert into public.learner_exam_attempts
  (user_id,course_id,module_id,exam_id,attempt_id,content_fingerprint,snapshot,expires_at)
  values ('00000000-0000-4000-8000-0000000000c1','aqa:aqa-a-level:7132',
  'business-7132-paper-1','mock-too-long','33333333-3333-4333-8333-333333333333',
  repeat('a',64),'{"schemaVersion":1,"phase":"writing","frozenSubmission":null,"timing":{"policy":"pause-on-interruption"}}'::jsonb,
  now()+interval '16 days')$,'23514','Exam draft retention exceeds 14 days',
  'raw draft lifetime cannot exceed the approved 14-day window');

set local request.jwt.claim.sub='00000000-0000-4000-8000-0000000000c2';
select is((select count(*) from public.learner_exam_attempts),0::bigint,'different learner cannot see raw written responses');
select lives_ok($$update public.learner_exam_attempts set revision=3$$,'different learner cannot modify draft');
select lives_ok($$delete from public.learner_exam_attempts$$,'different learner cannot delete draft');
reset role;
select is((select revision from public.learner_exam_attempts
  where user_id='00000000-0000-4000-8000-0000000000c1'),2::bigint,
  'owner data survives attempted cross-learner modifications');

select * from finish();
rollback;

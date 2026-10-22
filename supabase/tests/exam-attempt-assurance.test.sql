begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(34);

-- Installation and capability boundaries; this file must execute in CI.
select ok(exists(select 1 from cron.job
  where jobname='revision-expired-exam-attempts-v1' and schedule='0 * * * *'
    and command like '%learner_exam_attempts%'),
  'hourly expiry cleanup is registered');
select ok((select relrowsecurity from pg_class
  where oid='public.learner_exam_attempts'::regclass), 'exam drafts have RLS enabled');
select policies_are('public','learner_exam_attempts',array[
  'learner_select_own_exam_attempts','learner_insert_own_exam_attempts',
  'learner_update_own_exam_attempts','learner_delete_own_exam_attempts'
], 'only four scoped learner policies exist');
select ok(not has_table_privilege('anon','public.learner_exam_attempts','SELECT'),
  'anonymous callers have no raw-draft access');
select ok(not has_table_privilege('anon','public.learner_exam_attempts','INSERT'),
  'anonymous callers cannot create exam drafts');
select ok(not has_table_privilege('service_role','public.learner_exam_attempts','SELECT'),
  'service role has no standing raw-draft SELECT grant');
select ok(has_table_privilege('authenticated','public.learner_exam_attempts','SELECT'),
  'authenticated learner has scoped SELECT grant');
select ok(has_table_privilege('authenticated','public.learner_exam_attempts','INSERT'),
  'authenticated learner has scoped INSERT grant');
select ok(has_table_privilege('authenticated','public.learner_exam_attempts','UPDATE'),
  'authenticated learner has scoped UPDATE grant');
select ok(has_table_privilege('authenticated','public.learner_exam_attempts','DELETE'),
  'authenticated learner has scoped DELETE grant');
select ok((public.revision_release_readiness()->'checks'->>'examCleanupScheduler')::boolean,
  'release readiness demands installed expiry scheduler');

insert into auth.users(id,email) values
  ('00000000-0000-4000-8000-0000000000c1','exam-a@revision.invalid'),
  ('00000000-0000-4000-8000-0000000000c2','exam-b@revision.invalid');

set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-0000000000c1';
set local request.jwt.claims='{"sub":"00000000-0000-4000-8000-0000000000c1","app_metadata":{"revision_rec10_pilot":true}}';
select lives_ok($sql$
  insert into public.learner_exam_attempts
    (user_id,course_id,module_id,exam_id,attempt_id,content_fingerprint,snapshot,expires_at)
  values (
    '00000000-0000-4000-8000-0000000000c1','aqa:aqa-a-level:7132',
    'business-7132-paper-1','mock-1','11111111-1111-4111-8111-111111111111',
    repeat('a',64),
    '{"schemaVersion":1,"phase":"writing","answers":{"q1":"Private essay draft"},"frozenSubmission":null,"timing":{"policy":"pause-on-interruption","elapsedMs":0,"interrupted":false,"runningSince":null}}'::jsonb,
    now() + interval '14 days'
  )
$sql$, 'owner can create private draft');
select throws_ok($sql$
  insert into public.learner_exam_attempts
    (user_id,course_id,module_id,exam_id,attempt_id,content_fingerprint,snapshot,expires_at)
  values ('00000000-0000-4000-8000-0000000000c2','other','other','mock-1',
    '22222222-2222-4222-8222-222222222222',repeat('a',64),
    '{"schemaVersion":1,"phase":"writing","frozenSubmission":null,"timing":{"policy":"pause-on-interruption"}}'::jsonb,
    now() + interval '14 days')
$sql$, '42501','new row violates row-level security policy for table "learner_exam_attempts"',
  'owner cannot insert draft under another learner identity');
select is((select count(*) from public.learner_exam_attempts),1::bigint,
  'owner sees only their attempt');
select ok((select expires_at <= created_at + interval '14 days'
  from public.learner_exam_attempts where exam_id='mock-1'),
  'expiry is strictly limited to 14 days from server creation');
select lives_ok($sql$update public.learner_exam_attempts
  set revision=2 where exam_id='mock-1'$sql$, 'owner can save next revision');
select throws_ok($sql$update public.learner_exam_attempts
  set revision=2 where exam_id='mock-1'$sql$,
  '23514','Examination revision must increase by one',
  'stale revision cannot overwrite newer answer');
select throws_ok($sql$update public.learner_exam_attempts
  set revision=3, snapshot=jsonb_set(snapshot,'{phase}','"submitted"'::jsonb)
  where exam_id='mock-1'$sql$,
  '23514','Invalid examination state transition',
  'cannot skip marking and frozen submission');
select throws_ok($sql$update public.learner_exam_attempts
  set expires_at=now()+interval '15 days',revision=3
  where exam_id='mock-1'$sql$,
  '23514','Examination identity and retention cannot change',
  'owner cannot extend original expiry');
select throws_ok($sql$update public.learner_exam_attempts
  set revision=3,snapshot=jsonb_set(snapshot,'{timing,policy}','"wall-clock"'::jsonb)
  where exam_id='mock-1'$sql$,
  '23514','Exam timer must pause on interruption',
  'owner cannot bypass approved timer');
select throws_ok($sql$
  insert into public.learner_exam_attempts
    (user_id,course_id,module_id,exam_id,attempt_id,content_fingerprint,snapshot,expires_at)
  values (
    '00000000-0000-4000-8000-0000000000c1','aqa:aqa-a-level:7132',
    'business-7132-paper-1','mock-too-long','33333333-3333-4333-8333-333333333333',
    repeat('a',64),
    '{"phase":"writing","frozenSubmission":null,"timing":{"policy":"pause-on-interruption"}}'::jsonb,
    now()+interval '16 days')
$sql$, '23514','Exam draft retention exceeds 14 days',
  'server rejects >14-day expiration');

-- A pending scored submission is protected while active. Cron must still purge
-- it after expiry, or one expired row can roll back every other deletion.
insert into public.learner_exam_attempts
  (user_id,course_id,module_id,exam_id,attempt_id,content_fingerprint,snapshot,expires_at)
values ('00000000-0000-4000-8000-0000000000c1','aqa:aqa-a-level:7132',
  'business-7132-paper-1','mock-pending','44444444-4444-4444-8444-444444444444',
  repeat('a',64),
  '{"phase":"writing","frozenSubmission":null,"timing":{"policy":"pause-on-interruption"}}'::jsonb,
  now()+interval '14 days');
update public.learner_exam_attempts set revision=2,
  snapshot=jsonb_set(snapshot,'{phase}','"marking"'::jsonb)
  where exam_id='mock-pending';
update public.learner_exam_attempts set revision=3,
  snapshot=jsonb_set(jsonb_set(snapshot,'{phase}','"submitting"'::jsonb),
    '{frozenSubmission}','{"evidence":[],"result":{"recorded":false}}'::jsonb)
  where exam_id='mock-pending';
select is((select snapshot->>'phase' from public.learner_exam_attempts
  where exam_id='mock-pending'),'submitting',
  'frozen pending submission entered valid lifecycle');
select throws_ok($sql$delete from public.learner_exam_attempts
  where exam_id='mock-pending'$sql$,
  '23514','An examination still being submitted cannot be discarded',
  'active pending submission cannot be discarded');

set local request.jwt.claim.sub='00000000-0000-4000-8000-0000000000c2';
set local request.jwt.claims='{"sub":"00000000-0000-4000-8000-0000000000c2","app_metadata":{"revision_rec10_pilot":true}}';
select is((select count(*) from public.learner_exam_attempts),0::bigint,
  'another learner cannot see raw written work');
select lives_ok($sql$update public.learner_exam_attempts
  set revision=99$sql$, 'different learner update affects no rows');
select lives_ok($sql$delete from public.learner_exam_attempts$sql$,
  'different learner deletion affects no rows');
-- Test same-owner access denial after removing the trusted signed pilot grant.
set local request.jwt.claim.sub='00000000-0000-4000-8000-0000000000c1';
set local request.jwt.claims='{"sub":"00000000-0000-4000-8000-0000000000c1","app_metadata":{}}';
select is((select count(*) from public.learner_exam_attempts),0::bigint,
  'nonpilot owner cannot read private drafts');
select throws_ok($sql$
  insert into public.learner_exam_attempts
    (user_id,course_id,module_id,exam_id,attempt_id,content_fingerprint,snapshot,expires_at)
  values ('00000000-0000-4000-8000-0000000000c1','aqa:aqa-a-level:7132',
    'business-7132-paper-1','mock-no-pilot','55555555-5555-4555-8555-555555555555',
    repeat('a',64),
    '{"phase":"writing","frozenSubmission":null,"timing":{"policy":"pause-on-interruption"}}'::jsonb,
    now()+interval '14 days')
$sql$, '42501','new row violates row-level security policy for table "learner_exam_attempts"',
  'nonpilot owner cannot create a raw draft');
select lives_ok($sql$delete from public.learner_exam_attempts$sql$,
  'nonpilot owner cannot delete another session');
reset role;
select is((select revision from public.learner_exam_attempts
  where exam_id='mock-1'),2::bigint,
  'cross-learner mutation did not modify the original');

-- Only the isolated, rolled-back pgTAP transaction fakes an elapsed expiry.
alter table public.learner_exam_attempts disable trigger learner_exam_attempt_guard;
update public.learner_exam_attempts set expires_at=now()-interval '1 minute'
  where exam_id in ('mock-1','mock-pending');
alter table public.learner_exam_attempts enable trigger learner_exam_attempt_guard;

set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-0000000000c1';
set local request.jwt.claims='{"sub":"00000000-0000-4000-8000-0000000000c1","app_metadata":{"revision_rec10_pilot":true}}';
select is((select count(*) from public.learner_exam_attempts),0::bigint,
  'expired private drafts cannot be read even before hourly purge');
reset role;
select is((select count(*) from public.learner_exam_attempts
  where expires_at <= now()),2::bigint,
  'expiry fixture contains both writing and submitting attempts');
select lives_ok($sql$delete from public.learner_exam_attempts
  where expires_at <= now()$sql$,
  'scheduled cleanup deletes expired writing and submitting attempts together');
select is((select count(*) from public.learner_exam_attempts),0::bigint,
  'no expired exam draft remains after cleanup');

select * from finish();
rollback;

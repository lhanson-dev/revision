begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select plan(13);
select ok((select relrowsecurity from pg_class where oid='public.lf05_written_questions'::regclass),'question RLS');
select ok((select relrowsecurity from pg_class where oid='public.lf05_written_guides'::regclass),'guide RLS');
select ok((select relrowsecurity from pg_class where oid='public.lf05_written_attempts'::regclass),'essay RLS');
select ok(not has_table_privilege('authenticated','lf05_private.lf05_test_memberships','SELECT'),'membership not readable');
select ok(not has_table_privilege('authenticated','public.lf05_written_questions','INSERT'),'only trusted content publisher');
select ok(not has_table_privilege('anon','public.lf05_written_guides','SELECT'),'anonymous cannot read guides');
select is((select count(*) from public.lf05_written_questions),0::bigint,'new schema publishes no drafts');
select is((select count(*) from lf05_private.lf05_test_memberships),0::bigint,'no learners silently admitted');
select ok(exists(select 1 from cron.job where jobname='revision-expired-lf05-written-v1'
 and command like '%lf05_written_attempts%'),'expiry scheduler exists');

insert into auth.users(id,email) values
 ('00000000-0000-4000-8000-0000000000d1','lf05-a@revision.invalid'),
 ('00000000-0000-4000-8000-0000000000d2','lf05-b@revision.invalid');
insert into lf05_private.lf05_test_memberships(user_id,expires_at)
 values('00000000-0000-4000-8000-0000000000d1',now()+interval '1 day');
insert into public.lf05_written_questions
 (id,course_id,paper_number,topic_id,skill_ref,title,question_prompt,
  stimulus,marks_style,content_fingerprint,approved_source_ref,status)
 values('BUS-LF05-02-16','aqa:aqa-a-level:7132',2,'leadership','AQA 7132 §3.2',
 'Fictional leadership question','Evaluate whether the business should use democratic leadership.',
 'Original fictional business case.',16,repeat('a',64),'independent-reviewed-version-2026-11','published');
insert into public.lf05_written_guides(question_id,content_fingerprint,guidance,approved_review_ref)
 values('BUS-LF05-02-16',repeat('a',64),
 '["Distinguish leadership styles.","Apply the scenario carefully.","Credit alternatives."]'::jsonb,
 'independent-reviewed-guide-2026-11');

set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-0000000000d2';
set local request.jwt.claims='{"sub":"00000000-0000-4000-8000-0000000000d2","app_metadata":{}}';
select is((select count(*) from public.lf05_written_questions),0::bigint,'not-entitled learner cannot view content');

set local request.jwt.claim.sub='00000000-0000-4000-8000-0000000000d1';
set local request.jwt.claims='{"sub":"00000000-0000-4000-8000-0000000000d1","app_metadata":{}}';
select is((select count(*) from public.lf05_written_guides),0::bigint,'rubric inaccessible before submitted answer');
insert into public.lf05_written_attempts(user_id,course_id,question_id,attempt_id,content_fingerprint)
 values('00000000-0000-4000-8000-0000000000d1','aqa:aqa-a-level:7132',
 'BUS-LF05-02-16','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',repeat('a',64));
update public.lf05_written_attempts set revision=2,
 draft_text=repeat('The evidence in the scenario supports a cautious democratic leadership recommendation. ',3);
update public.lf05_written_attempts set revision=3,phase='submitted',
 first_answer_text=draft_text,draft_text='';
select is((select count(*) from public.lf05_written_guides),1::bigint,'guide unlocked after exact frozen draft');
select throws_ok($sql$update public.lf05_written_attempts
 set revision=4,phase='draft',first_answer_text='',draft_text='Forged answer'$sql$,
 '23514','LF-05 answer state is immutable after submission','submitted response cannot be undone');
select * from finish();
rollback;

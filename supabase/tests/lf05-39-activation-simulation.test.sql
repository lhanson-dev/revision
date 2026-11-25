-- LF-05 production-release simulation in disposable PostgreSQL only.
-- PR #854 still proposes 6 published + 33 HELD; this transaction rolls back.
-- This test proves RLS/course counts if (and only if) a later source-approved
-- publication migration promotes the 33 candidate exact versions.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select plan(12);

select is((select count(*) from public.lf05_written_questions),39::bigint,
 'source inventory contains all 39 original questions before simulated promotion');
select is((select count(*) from public.lf05_written_questions where status='held'),33::bigint,
 'all 33 additional items remain held in shipped staging migrations');
select is((select count(*) from public.lf05_written_questions where status='published'),6::bigint,
 'only the six established originals are published before promotion');
select ok((select bool_and(q.content_fingerprint=g.content_fingerprint
   and q.original_training_only and jsonb_array_length(g.guidance)>0)
 from public.lf05_written_questions q
 join public.lf05_written_guides g on g.question_id=q.id),
 'candidate questions and separately protected guides preserve joined version identity');

-- Only this test transaction may temporarily promote rows; never apply a
-- production migration without exact independent A3 and Founder approval.
update public.lf05_written_questions
 set status='published'
 where status='held';
select is((select count(*) from public.lf05_written_questions where status='published'),39::bigint,
 'a complete deliberate promotion would expose exactly 39 original identities');
select is((select count(*) from public.lf05_written_questions where status='held'),0::bigint,
 'no held identities remain inside the isolated rollback-only simulation');
select is((select count(*) from public.lf05_written_questions
 where course_id='aqa:aqa-a-level:7132' and status='published'),20::bigint,
 'Business would have 20 source-versioned published originals');
select is((select count(*) from public.lf05_written_questions
 where course_id='aqa:aqa-a-level:7182' and status='published'),19::bigint,
 'Psychology would have 19 source-versioned published originals');

set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-0000000000d9';
set local request.jwt.claims='{"sub":"00000000-0000-4000-8000-0000000000d9","is_anonymous":false}';
select is((select count(*) from public.lf05_written_questions),39::bigint,
 'ordinary authenticated user would see exactly the 39 intentionally published questions');
select is((select count(*) from public.lf05_written_guides),0::bigint,
 'publishing extra questions still never reveals guides before a submitted first answer');
select is((select count(*) from public.lf05_written_attempts),0::bigint,
 'a fresh learner has no invented saved or submitted essay evidence');
reset role;
select is((select count(*) from public.lf05_written_attempts),0::bigint,
 'no test learner answer is created by releasing the catalogue');

select * from finish();
rollback;

-- Full LF-05 initial 39-item inventory is staged; only six original A3 PASS/PASS
-- items are published. The other 33 are held, not user-visible.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select plan(19);
select is((select count(*) from public.lf05_written_questions),39::bigint,
 'all 39 authored original question identities are stored once');
select is((select count(*) from public.lf05_written_guides),39::bigint,
 'each source identity has its own separate guidance record');
select is((select count(*) from public.lf05_written_questions where status='published'),6::bigint,
 'the same six independently released questions are published');
select is((select count(*) from public.lf05_written_questions where status='held'),33::bigint,
 '33 candidates cannot be seen until independent acceptance and activation');
select is((select count(*) from public.lf05_written_questions where course_id='aqa:aqa-a-level:7182'),19::bigint,
 'Psychology original pool includes 17 topics and two scenario variants');
select is((select count(*) from public.lf05_written_questions where course_id='aqa:aqa-a-level:7132'),20::bigint,
 'Business original pool contains 10 contextual and 10 broad essays');
select is((select count(*) from public.lf05_written_questions where course_id='aqa:aqa-a-level:7182' and status='published'),1::bigint,
 'only one Psychology item is currently accepted for learner publication');
select is((select count(*) from public.lf05_written_questions where course_id='aqa:aqa-a-level:7132' and status='published'),5::bigint,
 'only five Business items are currently accepted for learner publication');
select is((select count(*) from public.lf05_written_questions where status='held' and
 approved_source_ref like '%3b318fc53bce95195c8eef8b5771690c123f2a31%'),27::bigint,
 'the 27 candidate source identities refer to the pinned original research head');
select is((select count(*) from public.lf05_written_questions where status='held' and
 id in ('PSY-LF05-03','PSY-LF05-04','PSY-LF05-05','PSY-LF05-06',
 'PSY-LF05-08','PSY-LF05-09','PSY-LF05-10','PSY-LF05-11','PSY-LF05-12',
 'PSY-LF05-14','PSY-LF05-16','BUS-LF05-01-16','BUS-LF05-05-16',
 'BUS-LF05-06-16','BUS-LF05-06-25','BUS-LF05-07-16','BUS-LF05-08-25')),17::bigint,
 'all 17 originally material A3 HOLD identities remain unpublished');
select ok((select bool_and(q.content_fingerprint = g.content_fingerprint
  and length(q.question_prompt)>=15 and q.original_training_only
  and jsonb_array_length(g.guidance)>=5)
 from public.lf05_written_questions q
 join public.lf05_written_guides g on g.question_id=q.id),
 'all 39 candidate question-guide pairs have fingerprint and original provenance');
select ok((select bool_and(
  q.status='held' and g.approved_review_ref like '%new A3/A4 required%'
  and q.original_training_only)
 from public.lf05_written_questions q
 join public.lf05_written_guides g on g.question_id=q.id
 where q.approved_source_ref like '%3b318fc53bce95195c8eef8b5771690c123f2a31%'),
 'all 27 new source drafts explicitly require fresh independent review');
select is((select count(*) from public.lf05_written_questions
  where id like 'PSY-LF05-%' and paper_number=3 and status='held'),10::bigint,
 'all Psychology Paper 3 option/compulsory candidates remain unapproved');
select is((select count(*) from public.lf05_written_questions
  where id like 'BUS-LF05-%' and marks_style=16),10::bigint,
 'all ten Business context-dependent 16-mark-style candidates have identities');
select is((select count(*) from public.lf05_written_questions
  where id like 'BUS-LF05-%' and marks_style=25),10::bigint,
 'all ten Business Paper 1 25-mark-style candidates have identities');
select ok((select bool_and(stimulus is not null and length(stimulus)>45)
 from public.lf05_written_questions where id like 'BUS-LF05-%' and marks_style=16),
 'all ten Business contextual evaluations retain their complete fictional stimulus');
select is((select count(*) from public.lf05_written_questions q join public.lf05_written_guides g on g.question_id=q.id
where q.status='held' and exists (select 1 from jsonb_array_elements_text(g.guidance) as v(entry)
where v.entry ~* 'REVIEW HOLD|provisional level grid|13.?16-quality|5.?8-quality')),0::bigint,
'held learner guides exclude draft labels and invented grading bands');
set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-0000000000d9';
set local request.jwt.claims='{"sub":"00000000-0000-4000-8000-0000000000d9","is_anonymous":false}';
select is((select count(*) from public.lf05_written_questions),6::bigint,
 'a genuine signed-in learner sees precisely six released originals');
select is((select count(*) from public.lf05_written_guides),0::bigint,
 'even with 39 stored, no marking guidance is disclosed before submission');
reset role;
select * from finish();
rollback;

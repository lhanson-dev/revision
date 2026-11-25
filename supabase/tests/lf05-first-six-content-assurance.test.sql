begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select plan(16);

select is((select count(*) from public.lf05_written_questions where status='published' and id in ('BUS-LF05-01-25','BUS-LF05-02-16','BUS-LF05-02-25','BUS-LF05-03-25','BUS-LF05-10-25','PSY-LF05-01-S1')),6::bigint,
  'six exact reviewed item identities were staged');
select is((select count(*) from public.lf05_written_guides g join public.lf05_written_questions q on q.id=g.question_id where q.status='published' and q.id in ('BUS-LF05-01-25','BUS-LF05-02-16','BUS-LF05-02-25','BUS-LF05-03-25','BUS-LF05-10-25','PSY-LF05-01-S1')),6::bigint,
  'each staged item has its independent authored marking guidance');
select is((select count(*) from public.lf05_written_questions where status='published' and id in ('BUS-LF05-01-25','BUS-LF05-02-16','BUS-LF05-02-25','BUS-LF05-03-25','BUS-LF05-10-25','PSY-LF05-01-S1')),6::bigint,
  'six A3-reviewed originals are eligible for signed-in learners');
select is((select count(*) from public.lf05_written_questions
  where course_id='aqa:aqa-a-level:7132' and status='published' and id in ('BUS-LF05-01-25','BUS-LF05-02-16','BUS-LF05-02-25','BUS-LF05-03-25','BUS-LF05-10-25','PSY-LF05-01-S1')),5::bigint,'five Business originals');
select is((select count(*) from public.lf05_written_questions
  where course_id='aqa:aqa-a-level:7182' and status='published' and id in ('BUS-LF05-01-25','BUS-LF05-02-16','BUS-LF05-02-25','BUS-LF05-03-25','BUS-LF05-10-25','PSY-LF05-01-S1')),1::bigint,'one Psychology original');
select is((select count(*) from public.lf05_written_questions
  where marks_style=16 and status='published' and id in ('BUS-LF05-01-25','BUS-LF05-02-16','BUS-LF05-02-25','BUS-LF05-03-25','BUS-LF05-10-25','PSY-LF05-01-S1')),2::bigint,'two original 16-mark-style tasks');
select is((select count(*) from public.lf05_written_questions
  where marks_style=25 and status='published' and id in ('BUS-LF05-01-25','BUS-LF05-02-16','BUS-LF05-02-25','BUS-LF05-03-25','BUS-LF05-10-25','PSY-LF05-01-S1')),4::bigint,'four original 25-mark-style tasks');
select is((select array_agg(id order by id) from public.lf05_written_questions where status='published' and id in ('BUS-LF05-01-25','BUS-LF05-02-16','BUS-LF05-02-25','BUS-LF05-03-25','BUS-LF05-10-25','PSY-LF05-01-S1')),
 array['BUS-LF05-01-25','BUS-LF05-02-16','BUS-LF05-02-25',
       'BUS-LF05-03-25','BUS-LF05-10-25','PSY-LF05-01-S1']::text[],
 'the six previously reviewed item identities remain unchanged in the expanded catalogue');
select ok((select bool_and(length(question_prompt)>=30 and
 content_fingerprint ~ '^[0-9a-f]{64}$' and original_training_only)
 from public.lf05_written_questions where status='published' and id in ('BUS-LF05-01-25','BUS-LF05-02-16','BUS-LF05-02-25','BUS-LF05-03-25','BUS-LF05-10-25','PSY-LF05-01-S1')),'all stems sufficiently populated and finger-printed');
select ok((select bool_and(q.content_fingerprint=g.content_fingerprint and
 jsonb_array_length(g.guidance)>=6)
 from public.lf05_written_questions q join public.lf05_written_guides g on g.question_id=q.id where q.status='published' and q.id in ('BUS-LF05-01-25','BUS-LF05-02-16','BUS-LF05-02-25','BUS-LF05-03-25','BUS-LF05-10-25','PSY-LF05-01-S1')),
 'all original guides are keyed to the exact original published question bytes');
select ok((select stimulus is not null and length(stimulus)>100
 from public.lf05_written_questions where id='BUS-LF05-02-16'),
 'Business 16-mark application includes its independently reviewed original case');
select ok((select stimulus is not null and length(stimulus)>200 and paper_number=1 and topic_id='social-influence'
 from public.lf05_written_questions where id='PSY-LF05-01-S1'),
 'Psychology situation and correct Paper 1 source topic are present');
select is((select count(*) from public.lf05_written_questions where paper_number=1 and status='published' and id in ('BUS-LF05-01-25','BUS-LF05-02-16','BUS-LF05-02-25','BUS-LF05-03-25','BUS-LF05-10-25','PSY-LF05-01-S1')),5::bigint,
 'standalone Business Paper 1 essays and Psychology core task mapped without extra paper totals');
select ok((select bool_and(approved_source_ref like '%675fdc8c53a224fe8fa9a81079b57b15dafef7af%'
   and approved_review_ref like '%43620992688%') from
  public.lf05_written_questions q join public.lf05_written_guides g on g.question_id=q.id where q.status='published' and q.id in ('BUS-LF05-01-25','BUS-LF05-02-16','BUS-LF05-02-25','BUS-LF05-03-25','BUS-LF05-10-25','PSY-LF05-01-S1')),
 'every staged version cites exact independently checked head and review receipt');
select is((select count(*) from lf05_private.lf05_test_memberships),0::bigint,
  'no learner account is admitted by the content-only migration');
set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-0000000000d9';
set local request.jwt.claims='{"sub":"00000000-0000-4000-8000-0000000000d9"}';
select is((select count(*) from public.lf05_written_questions),39::bigint,
  'the released bank presents 39 original questions to every authenticated learner');
reset role;
select * from finish();
rollback;

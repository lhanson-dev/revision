-- Next six original source-mapped candidates must remain invisible until
-- a new independent exact-version question + guidance A3 and real learner A4.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select plan(18);
select is((select count(*) from public.lf05_written_questions where status='published' or id in ('PSY-LF05-01','PSY-LF05-02','PSY-LF05-07','BUS-LF05-03-16','BUS-LF05-04-25','BUS-LF05-07-25')),12::bigint,
  'six previously published plus exactly six held source-mapped candidates');
select is((select count(*) from public.lf05_written_guides g join public.lf05_written_questions q on q.id=g.question_id where q.status='published' or q.id in ('PSY-LF05-01','PSY-LF05-02','PSY-LF05-07','BUS-LF05-03-16','BUS-LF05-04-25','BUS-LF05-07-25')),12::bigint,
  'all twelve question identities have separate guide storage');
select is((select count(*) from public.lf05_written_questions where status='published'),6::bigint,
  'the existing six published originals remain unchanged');
select is((select count(*) from public.lf05_written_questions where id in ('PSY-LF05-01','PSY-LF05-02','PSY-LF05-07','BUS-LF05-03-16','BUS-LF05-04-25','BUS-LF05-07-25') and status='held'),6::bigint,
  'all six new candidates remain HELD by default');
select is((select array_agg(id order by id) from public.lf05_written_questions where status='held' and id in ('PSY-LF05-01','PSY-LF05-02','PSY-LF05-07','BUS-LF05-03-16','BUS-LF05-04-25','BUS-LF05-07-25')),
  array['BUS-LF05-03-16','BUS-LF05-04-25','BUS-LF05-07-25',
    'PSY-LF05-01','PSY-LF05-02','PSY-LF05-07']::text[],
  'exact A3 no-material source identity list, no material-HOLD imports');
select is((select count(*) from public.lf05_written_questions
  where status='held' and id in ('PSY-LF05-01','PSY-LF05-02','PSY-LF05-07') and course_id='aqa:aqa-a-level:7182'),3::bigint,
  'three compulsory Psychology candidates: Social Influence, Memory, Research Methods');
select is((select count(*) from public.lf05_written_questions
  where status='held' and id in ('BUS-LF05-03-16','BUS-LF05-04-25','BUS-LF05-07-25') and course_id='aqa:aqa-a-level:7132'),3::bigint,
  'three Business originals cover Marketing, Operations and Strategic Position');
select is((select count(*) from public.lf05_written_questions
  where status='held' and paper_number=1 and id in ('PSY-LF05-01','PSY-LF05-02','BUS-LF05-04-25','BUS-LF05-07-25')),4::bigint,
  'Psychology Social Influence and Memory and Business Paper 1 broad essays map to Paper 1');
select is((select count(*) from public.lf05_written_questions
  where status='held' and paper_number=2 and id in ('PSY-LF05-07','BUS-LF05-03-16')),2::bigint,
  'Psychology Research Methods and Business applied marketing map to Paper 2');
select ok((select bool_and(q.content_fingerprint=g.content_fingerprint
  and jsonb_array_length(g.guidance)>=6 and length(q.question_prompt)>45
  and q.original_training_only and q.content_fingerprint ~ '^[0-9a-f]{64}$')
  from public.lf05_written_questions q
  join public.lf05_written_guides g on g.question_id=q.id
  where q.status='held' and q.id in ('PSY-LF05-01','PSY-LF05-02','PSY-LF05-07','BUS-LF05-03-16','BUS-LF05-04-25','BUS-LF05-07-25')),
  'held prompts and their matching original guides are version-fingerprinted');
select ok((select bool_and(q.approved_source_ref like '%675fdc8c53a224fe8fa9a81079b57b15dafef7af%'
  and g.approved_review_ref like '%A3/A4 HOLD%')
  from public.lf05_written_questions q
  join public.lf05_written_guides g on g.question_id=q.id
  where q.status='held' and q.id in ('PSY-LF05-01','PSY-LF05-02','PSY-LF05-07','BUS-LF05-03-16','BUS-LF05-04-25','BUS-LF05-07-25')),
  'source versions are preserved but the revised guide has no false independent A3 claim');
select ok((select stimulus is not null and length(stimulus)>120
  from public.lf05_written_questions where id='PSY-LF05-07'),
  'Psychology Research Methods retains original study design context');
select ok((select stimulus is not null and stimulus like '%12% market share%'
  from public.lf05_written_questions where id='BUS-LF05-03-16'),
  'Business marketing decision retains original numbers and exact case');
select ok((select bool_and(stimulus is null)
  from public.lf05_written_questions
  where id in ('PSY-LF05-01','PSY-LF05-02','BUS-LF05-04-25','BUS-LF05-07-25')),
  'standalone essays do not gain misleading compulsory fictional cases');
select ok((select bool_and(g.guidance::text not ilike '%official 2027 marking scheme%'
    and g.guidance::text like '%Training classification%')
  from public.lf05_written_questions q join public.lf05_written_guides g on g.question_id=q.id
  where q.status='held' and q.id in ('PSY-LF05-01','PSY-LF05-02','PSY-LF05-07','BUS-LF05-03-16','BUS-LF05-04-25','BUS-LF05-07-25')),
  'each held guide expressly disclaims official examiner marking');
set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-0000000000d9';
set local request.jwt.claims='{"sub":"00000000-0000-4000-8000-0000000000d9","is_anonymous":false}';
select is((select count(*) from public.lf05_written_questions),6::bigint,
  'genuine learner sees only six published originals, no held stems');
select is((select count(*) from public.lf05_written_guides),0::bigint,
  'the held six and original guides cannot be viewed before independent submission');
select is((select count(*) from public.lf05_written_questions where id='PSY-LF05-01'),0::bigint,
  'a specifically held Psychology item is not visible as a selectable question');
reset role;
select * from finish();
rollback;

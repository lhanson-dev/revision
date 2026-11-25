-- Transactional release rehearsal against ONLY the disposable CI PostgreSQL.
-- Does not modify production or authorise learner publication.
-- The exact 33 held identities come from the reviewed source-stage SQL and
-- proposed release SQL. All modifications below roll back.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select plan(18);

create temporary table lf05_promotion_ids (id text primary key) on commit drop;
insert into lf05_promotion_ids(id) values
  ('BUS-LF05-01-16'),
  ('BUS-LF05-03-16'),
  ('BUS-LF05-04-16'),
  ('BUS-LF05-04-25'),
  ('BUS-LF05-05-16'),
  ('BUS-LF05-05-25'),
  ('BUS-LF05-06-16'),
  ('BUS-LF05-06-25'),
  ('BUS-LF05-07-16'),
  ('BUS-LF05-07-25'),
  ('BUS-LF05-08-16'),
  ('BUS-LF05-08-25'),
  ('BUS-LF05-09-16'),
  ('BUS-LF05-09-25'),
  ('BUS-LF05-10-16'),
  ('PSY-LF05-01'),
  ('PSY-LF05-02'),
  ('PSY-LF05-02-S1'),
  ('PSY-LF05-03'),
  ('PSY-LF05-04'),
  ('PSY-LF05-05'),
  ('PSY-LF05-06'),
  ('PSY-LF05-07'),
  ('PSY-LF05-08'),
  ('PSY-LF05-09'),
  ('PSY-LF05-10'),
  ('PSY-LF05-11'),
  ('PSY-LF05-12'),
  ('PSY-LF05-13'),
  ('PSY-LF05-14'),
  ('PSY-LF05-15'),
  ('PSY-LF05-16'),
  ('PSY-LF05-17');

select is((select count(*) from public.lf05_written_questions),39::bigint,
 'the original catalogue has exactly 39 distinct questions');
select is((select count(*) from public.lf05_written_guides),39::bigint,
 'the original catalogue has exactly 39 separately stored guides');
select is((select count(*) from public.lf05_written_questions where status='held'),33::bigint,
 'exactly 33 source-mapped candidates are held before simulation');
select is((select count(*) from public.lf05_written_questions where status='published'),6::bigint,
 'only the six previously released originals are published initially');
select is((select count(*) from lf05_promotion_ids),33::bigint,
 'the promotion manifest names 33 unique source identities');

select is(
 (select array_agg(id order by id) from public.lf05_written_questions where status='held'),
 (select array_agg(id order by id) from lf05_promotion_ids),
 'the proposed publication identity set matches EVERY held source and no other item'
);
select is((select count(*) from public.lf05_written_questions q
  join lf05_promotion_ids p on q.id=p.id
  where q.status='held' and q.course_id='aqa:aqa-a-level:7132'),15::bigint,
 'exactly 15 held Business originals would be newly available');
select is((select count(*) from public.lf05_written_questions q
  join lf05_promotion_ids p on q.id=p.id
  where q.status='held' and q.course_id='aqa:aqa-a-level:7182'),18::bigint,
 'exactly 18 held Psychology originals would be newly available');

select ok((select count(*)=33 and bool_and(
  q.original_training_only
  and q.content_fingerprint=g.content_fingerprint
  and q.content_fingerprint=encode(sha256(convert_to(
    q.id||chr(31)||q.question_prompt||chr(31)||coalesce(q.stimulus,'')||chr(31)||g.guidance::text,
    'UTF8')),'hex')
  and jsonb_array_length(g.guidance)>=5
) from public.lf05_written_questions q
  join lf05_promotion_ids p on p.id=q.id
  join public.lf05_written_guides g on g.question_id=q.id),
 'all 33 exact question+guide records retain matching content-derived fingerprints');

-- Rehearsal only: no change to authored source text or the six already live.
update public.lf05_written_questions q set status='published'
from lf05_promotion_ids p
where q.id=p.id and q.status='held';
select is((select count(*) from public.lf05_written_questions where status='published'
  and id not in (select id from lf05_promotion_ids)),6::bigint,
 'the pre-existing six published originals remain independently unchanged');
select is((select count(*) from public.lf05_written_questions where status='published'),39::bigint,
 'the manifest would publish all 39 original identities');
select is((select count(*) from public.lf05_written_questions where status='held'),0::bigint,
 'no held questions remain within the isolated rehearsal');
select is((select count(*) from public.lf05_written_questions
  where course_id='aqa:aqa-a-level:7132' and status='published'),20::bigint,
 '20 Business originals would be available in the full catalogue');
select is((select count(*) from public.lf05_written_questions
  where course_id='aqa:aqa-a-level:7182' and status='published'),19::bigint,
 '19 Psychology originals would be available in the full catalogue');

-- RLS still prevents guidance exposure until an independently committed answer.
set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-0000000000d9';
set local request.jwt.claims='{"sub":"00000000-0000-4000-8000-0000000000d9","is_anonymous":false}';
select is((select count(*) from public.lf05_written_questions),39::bigint,
 'an ordinary signed-in learner would see 39 published source identities');
select is((select count(*) from public.lf05_written_guides),0::bigint,
 'a learner still cannot read ANY question guide before initial answer submission');
select is((select count(*) from public.lf05_written_attempts),0::bigint,
 'no saved or submitted student response is invented by publication');
reset role;
select is((select count(*) from public.lf05_written_attempts),0::bigint,
 'rehearsal retains zero synthetic answers and original evidence boundaries');
select * from finish();
rollback;

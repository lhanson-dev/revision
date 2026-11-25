-- Verify complete 39-item published original bank; 33 additional records retain their source identities.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select plan(40);
select is((select count(*) from public.lf05_written_questions),39::bigint,
 'all 39 authored original question identities are stored once');
select is((select count(*) from public.lf05_written_guides),39::bigint,
 'each source identity has its own separate guidance record');
select is((select count(*) from public.lf05_written_questions where status='published'),39::bigint,
 'all 39 original questions are published');
select is((select count(*) from public.lf05_written_questions where status='held'),0::bigint,
 'no held candidate remains after the approved release');
select is((select count(*) from public.lf05_written_questions where course_id='aqa:aqa-a-level:7182'),19::bigint,
 'Psychology original pool includes 17 topics and two scenario variants');
select is((select count(*) from public.lf05_written_questions where course_id='aqa:aqa-a-level:7132'),20::bigint,
 'Business original pool contains 10 contextual and 10 broad essays');
select is((select count(*) from public.lf05_written_questions where course_id='aqa:aqa-a-level:7182' and status='published'),19::bigint,
 'all 19 Psychology originals are published');
select is((select count(*) from public.lf05_written_questions where course_id='aqa:aqa-a-level:7132' and status='published'),20::bigint,
 'all 20 Business originals are published');
select is((select count(*) from public.lf05_written_questions where status='published' and
 approved_source_ref like '%3b318fc53bce95195c8eef8b5771690c123f2a31%'),27::bigint,
 'the 27 candidate source identities refer to the pinned original research head');
select is((select count(*) from public.lf05_written_questions where status='published' and
 id in ('PSY-LF05-03','PSY-LF05-04','PSY-LF05-05','PSY-LF05-06',
 'PSY-LF05-08','PSY-LF05-09','PSY-LF05-10','PSY-LF05-11','PSY-LF05-12',
 'PSY-LF05-14','PSY-LF05-16','BUS-LF05-01-16','BUS-LF05-05-16',
 'BUS-LF05-06-16','BUS-LF05-06-25','BUS-LF05-07-16','BUS-LF05-08-25')),17::bigint,
 'all 17 historically flagged identities retain exact versions after approved publication');
select ok((select bool_and(q.content_fingerprint = g.content_fingerprint
  and length(q.question_prompt)>=15 and q.original_training_only
  and jsonb_array_length(g.guidance)>=5)
 from public.lf05_written_questions q
 join public.lf05_written_guides g on g.question_id=q.id),
 'all 39 candidate question-guide pairs have fingerprint and original provenance');
select ok((select bool_and(
  q.status='published' and g.approved_review_ref like '%Founder PR854 release acceptance%'
  and q.original_training_only)
 from public.lf05_written_questions q
 join public.lf05_written_guides g on g.question_id=q.id
 where q.approved_source_ref like '%3b318fc53bce95195c8eef8b5771690c123f2a31%'),
 'all 27 additional source versions carry the final review acceptance reference');
select is((select count(*) from public.lf05_written_questions
  where id like 'PSY-LF05-%' and paper_number=3 and status='published'),10::bigint,
 'the ten original Psychology Paper 3 items are published with option filtering');
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
where q.status='published' and exists (select 1 from jsonb_array_elements_text(g.guidance) as v(entry)
where v.entry ~* 'REVIEW HOLD|provisional level grid|13.?16-quality|5.?8-quality')),0::bigint,
'held learner guides exclude draft labels and invented grading bands');
select ok((select stimulus not like '%**%' and stimulus like '%76% in Task A and 49% in Task B%'
  from public.lf05_written_questions where id='PSY-LF05-02-S1'),
 'memory case renders plain percentages without unparsed markdown markers');
select ok((select skill_ref not like '% AO' and skill_ref like '%4.1.2%'
  from public.lf05_written_questions where id='PSY-LF05-02-S1'),
 'memory dual-task specification skill mapping is complete');
select ok((select skill_ref ilike '%§3.6.2 Analysing human resource performance%' and skill_ref ilike '%§3.6.3 Making human resource decisions:%'
 from public.lf05_written_questions where id='BUS-LF05-06-16'),
 'Business §3.6.2 explicitly concerns HR performance/turnover, while §3.6.3 contains workforce flow and training');
-- Guided source-correction assertions retained in the published release.
select ok((select g.guidance::text ilike '%geographical profiling as legitimate data-driven%'
 from public.lf05_written_guides g where g.question_id='PSY-LF05-16'),
 'Offender-profile guide credits valid geographical profiling without mandatory investigative psychology');
select ok((select g.guidance::text ilike '%not synonyms%' and
 g.guidance::text ilike '%data-driven comparisons%'
 from public.lf05_written_guides g where g.question_id='PSY-LF05-16'),
 'Offender-profile rubric preserves method distinctions and inclusive answer routes');
select ok((select q.stimulus ilike '%slower expansion funded internally%'
 from public.lf05_written_questions q where q.id='BUS-LF05-01-16'),
 'Marshbrook case fixes the artificial borrowing-versus-retained-profit conflict');
select ok((select g.guidance::text ilike '%mixed-finance%'
 and g.guidance::text ilike '%cannot by itself establish whether the buffer is adequate%'
 from public.lf05_written_guides g where g.question_id='BUS-LF05-01-16'),
 'Marshbrook guide accepts mixed finance and qualifies adequacy of the cash balance');
select ok((select g.guidance::text ilike '%behavioural experiments%'
 and g.guidance::text ilike '%restructure unhelpful%'
 from public.lf05_written_guides g where g.question_id='PSY-LF05-04'),
 'CBT guidance includes practical treatment mechanisms as well as cognitive accounts');
select ok((select g.guidance::text ilike '%antipsychotic%'
 and g.guidance::text ilike '%family therapy%' and
 g.guidance::text ilike '%not demand one fixed treatment%'
 from public.lf05_written_guides g where g.question_id='PSY-LF05-12'),
 'Schizophrenia interactionist guide provides source-aligned examples without mandatory combos');
select ok((select g.guidance::text ilike '%conceptualisation%'
 and g.guidance::text ilike '%skills acquisition and rehearsal%'
 and g.guidance::text ilike '%muscle tension%'
 from public.lf05_written_guides g where g.question_id='PSY-LF05-14'),
 'Stress guide names the three inoculation phases and concrete biofeedback measure');
select ok((select g.guidance::text ilike '%original frustration%'
 and g.guidance::text ilike '%later revisions%'
 from public.lf05_written_guides g where g.question_id='PSY-LF05-15'),
 'Aggression guide distinguishes original frustration hypothesis from later evaluations');
select ok((select g.guidance::text ilike '%automation is only a possibility%'
 and g.guidance::text ilike '%relative net costs are known%'
 from public.lf05_written_guides g where g.question_id='BUS-LF05-04-16'),
 'Pine Components guide does not invent automation or financial rankings');
select ok((select g.guidance::text ilike '%average workforce over the year%'
 and g.guidance::text ilike '%£69,600%'
 from public.lf05_written_guides g where g.question_id='BUS-LF05-06-16'),
 'Orchid guide makes average employment conditional and accepts rounded costs');
select ok((select g.guidance::text ilike '%mergers and takeovers%'
 and g.guidance::text ilike '%not a growth method in itself%'
 from public.lf05_written_guides g where g.question_id='BUS-LF05-09-25'),
 'External growth guide separates growth method from geographic direction');
select ok((select g.guidance::text ilike '%known volunteer sample%'
 and g.guidance::text ilike '%volunteer bias%'
 from public.lf05_written_guides g where g.question_id='PSY-LF05-02-S1'),
 'Applied working memory guide recognises participant volunteers and unknown recruitment');
-- Source-adjudicated corrections remain tested after publication.
select ok((select g.guidance::text like '%56.25%' and
 g.guidance::text like '%£9m%' and
 g.guidance::text not ilike '%cannot yield an unambiguous gearing%'
 from public.lf05_written_guides g where g.question_id='BUS-LF05-07-16'),
 'Kelton guidance applies AQA gearing 9/16 = 56.25 percent and removes false impossible-ratio claim');
select ok((select g.guidance::text ilike '%do not withhold credit%'
 from public.lf05_written_guides g where g.question_id='PSY-LF05-08'),
 'nature-nurture answer guide does not require an independent interactionism definition');
select ok((select g.guidance::text ilike '%not compulsory%'
 from public.lf05_written_guides g where g.question_id='PSY-LF05-13'),
 'anorexia evaluation can reach a valid non-interactionist conclusion');
select ok((select q.skill_ref like '%§3.8.2%'
 from public.lf05_written_questions q where q.id='BUS-LF05-08-25'),
 'Porter strategic positioning remains accurately mapped to §3.8.2 in original AQA 7132 v2.0');
select ok((select q.stimulus ilike '%existing UK specialist-market customers%'
 from public.lf05_written_questions q where q.id='BUS-LF05-08-16'),
 'Ansoff product-development option addresses the existing market, not ambiguous diversification');
select ok((select g.guidance::text ilike '%biological, psychological and social%'
 from public.lf05_written_guides g where g.question_id='PSY-LF05-12'),
 'schizophrenia interactionist treatment credits biological, psychological and social factors');
set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-0000000000d9';
set local request.jwt.claims='{"sub":"00000000-0000-4000-8000-0000000000d9","is_anonymous":false}';
select is((select count(*) from public.lf05_written_questions),39::bigint,
 'a genuine authenticated learner sees all 39 original questions');
select is((select count(*) from public.lf05_written_guides),0::bigint,
 'even with 39 stored, no marking guidance is disclosed before submission');
reset role;
select * from finish();
rollback;

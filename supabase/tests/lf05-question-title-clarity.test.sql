-- LF-05: each original writing question needs a distinct student-readable
-- selector label, not a generic paper/style placeholder. Metadata only.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select plan(11);

select is((select count(*) from public.lf05_written_questions where status='published'),39::bigint,
 'all 39 reviewed original questions remain published');
select is((select count(distinct lower(title)) from public.lf05_written_questions),39::bigint,
 'every question has a unique case-insensitive selector title');
select is((select count(*) from public.lf05_written_questions
 where length(title) not between 12 and 72),0::bigint,
 'all 39 title lengths fit concise readable selection');
select is((select count(*) from public.lf05_written_questions
 where title ~* '(paper [123].*style|[0-9]+-mark|original practice question)'),0::bigint,
 'no generic paper/style placeholder or duplicated mark-style label remains');
select is((select count(*) from public.lf05_written_questions
 where title in ('Attachment','Stress','Gender','Biopsychology','Relationships')),0::bigint,
 'no Psychology question uses an unhelpful one-word topic heading');
select is((select count(*) from public.lf05_written_guides g
 join public.lf05_written_questions q on q.id=g.question_id
 where q.content_fingerprint=g.content_fingerprint),39::bigint,
 'all question-to-guide fingerprints remain unchanged and matching');
select is((select count(*) from public.lf05_written_questions
 where course_id='aqa:aqa-a-level:7132'),20::bigint,
 'all Business question identities remain intact');
select is((select count(*) from public.lf05_written_questions
 where course_id='aqa:aqa-a-level:7182'),19::bigint,
 'all Psychology question identities remain intact');
select is((select title from public.lf05_written_questions where id='BUS-LF05-01-16'),
 'Marshbrook Bakery: cash flow or profit?',
 'the previously generic Marshbrook title identifies the decision');
select is((select title from public.lf05_written_questions where id='BUS-LF05-08-25'),
 'Differentiation vs low-cost strategy',
 'the broad strategic essay title names the decision');
select is((select title from public.lf05_written_questions where id='PSY-LF05-14'),
 'Stress management: inoculation and biofeedback',
 'Psychology title identifies the actual extended-writing demand');
select * from finish();
rollback;

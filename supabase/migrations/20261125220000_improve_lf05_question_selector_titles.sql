-- LF-05 dropdown clarity correction. Titles are learner-facing metadata ONLY.
-- 39 original Business/Psychology question IDs, prompts, stimulus, content
-- fingerprints, independent guides, saved attempts, source review and answer
-- ownership remain exactly as released in PR #854.
-- The old generic titles ("Paper 2/3-style applied evaluation (16)" etc.)
-- did not distinguish different questions in a native select control.
begin;

create temporary table lf05_question_title_updates (
  id text primary key,
  display_title text not null
) on commit drop;

insert into lf05_question_title_updates (id,display_title) values
  ('BUS-LF05-01-16', 'Marshbrook Bakery: cash flow or profit?'),
  ('BUS-LF05-01-25', 'Should survival come first?'),
  ('BUS-LF05-02-16', 'Larch Medical Supplies: democratic leadership'),
  ('BUS-LF05-02-25', 'Leadership vs decision-making methods'),
  ('BUS-LF05-03-16', 'Mira Sports Drinks: premium product or price cut?'),
  ('BUS-LF05-03-25', 'Market research vs marketing mix'),
  ('BUS-LF05-04-16', 'Pine Components: quality or capacity?'),
  ('BUS-LF05-04-25', 'Lean production and competitiveness'),
  ('BUS-LF05-05-16', 'Harbour Furniture: financing expansion'),
  ('BUS-LF05-05-25', 'Cash flow vs profitability during rapid growth'),
  ('BUS-LF05-06-16', 'Orchid Care: investing in staff training'),
  ('BUS-LF05-06-25', 'Financial rewards and employee motivation'),
  ('BUS-LF05-07-16', 'Kelton Mobility: assessing overseas investment'),
  ('BUS-LF05-07-25', 'Quantitative vs qualitative strategic analysis'),
  ('BUS-LF05-08-16', 'Nova Homecare: market or product development?'),
  ('BUS-LF05-08-25', 'Differentiation vs low-cost strategy'),
  ('BUS-LF05-09-16', 'Briar Logistics: acquisition or new depots?'),
  ('BUS-LF05-09-25', 'External growth for rapid expansion'),
  ('BUS-LF05-10-16', 'Valen Foods: consultation during digital change'),
  ('BUS-LF05-10-25', 'Organisational culture and strategic change'),
  ('PSY-LF05-01', 'Resisting influence: support and locus of control'),
  ('PSY-LF05-01-S1', 'Council case: resisting social influence'),
  ('PSY-LF05-02', 'Working-memory model and concurrent tasks'),
  ('PSY-LF05-02-S1', 'Memory investigation: evaluating the WMM'),
  ('PSY-LF05-03', 'Bowlby''s monotropic attachment theory'),
  ('PSY-LF05-04', 'Depression: cognitive explanations and CBT'),
  ('PSY-LF05-05', 'Behaviourism vs social learning theory'),
  ('PSY-LF05-06', 'Brain investigations: fMRI, EEG and post-mortems'),
  ('PSY-LF05-07', 'Designing a memory-and-music study'),
  ('PSY-LF05-08', 'Nature vs nurture debate'),
  ('PSY-LF05-09', 'Romantic relationships: exchange and investment'),
  ('PSY-LF05-10', 'Gender development: Kohlberg and schemas'),
  ('PSY-LF05-11', 'Cognitive development: Piaget vs Vygotsky'),
  ('PSY-LF05-12', 'Schizophrenia: interactionist explanations'),
  ('PSY-LF05-13', 'Anorexia: biological vs psychological explanations'),
  ('PSY-LF05-14', 'Stress management: inoculation and biofeedback'),
  ('PSY-LF05-15', 'Aggression: frustration and social learning'),
  ('PSY-LF05-16', 'Offender profiling: typologies vs data'),
  ('PSY-LF05-17', 'Gambling addiction: learning vs cognition');

do $lf05_titles$
declare
  changed integer;
begin
  if (select count(*) from lf05_question_title_updates) <> 39
    or (select count(*) from public.lf05_written_questions) <> 39
    or (select count(*) from public.lf05_written_questions where status='published') <> 39
    or (select count(*) from public.lf05_written_guides) <> 39
    or (select count(*) from public.lf05_written_questions where course_id='aqa:aqa-a-level:7132') <> 20
    or (select count(*) from public.lf05_written_questions where course_id='aqa:aqa-a-level:7182') <> 19
  then
    raise exception 'LF-05 title update requires the exact published 39-question catalogue';
  end if;

  if (select array_agg(id order by id) from lf05_question_title_updates)
       is distinct from
     (select array_agg(id order by id) from public.lf05_written_questions)
    or exists (
      select 1 from lf05_question_title_updates
      group by lower(display_title) having count(*) > 1
    )
    or exists (
      select 1 from lf05_question_title_updates
      where length(display_title) not between 12 and 72
        or display_title ~* '(paper [123].*style|[0-9]+-mark|original practice question)'
    )
  then
    raise exception 'LF-05 title update rejected: missing, duplicate or non-descriptive question labels';
  end if;

  -- Do not modify question_prompt, stimulus, content_fingerprint, status,
  -- guides, review records or private learner attempt rows.
  update public.lf05_written_questions q
     set title=u.display_title
    from lf05_question_title_updates u
   where q.id=u.id;
  get diagnostics changed=ROW_COUNT;
  if changed<>39 then
    raise exception 'LF-05 title update expected 39 records, updated %',changed;
  end if;

  if exists (
    select 1 from public.lf05_written_questions q
    join lf05_question_title_updates u on u.id=q.id
    where q.title is distinct from u.display_title
  ) then
    raise exception 'LF-05 title update verification failed';
  end if;
end
$lf05_titles$;

commit;

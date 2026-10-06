-- Practice v2.2: calculation questions are scored by software against the mark scheme's answer, so their evidence is a
-- new source, `calculation`. Only the allowed list of sources changes. No rows, policies or grants are touched, and
-- existing evidence stays valid.
alter table public.learning_evidence
  drop constraint learning_evidence_source_check;

alter table public.learning_evidence
  add constraint learning_evidence_source_check
  check (source in ('flashcard', 'multiple_choice', 'calculation', 'exam_question', 'exam_attempt'));

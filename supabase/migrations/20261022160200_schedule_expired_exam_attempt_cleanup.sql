begin;
-- Hourly deletion of drafts at the absolute 14-day deadline. Only
-- this purpose-limited deletion runs as the scheduled database owner.
-- Scored learning_evidence is deliberately excluded.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule(
  'revision-expired-exam-attempts-v1',
  '0 * * * *',
  'delete from public.learner_exam_attempts where expires_at <= now()'
);
commit;

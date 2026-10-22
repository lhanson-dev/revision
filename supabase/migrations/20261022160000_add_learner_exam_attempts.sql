begin;

-- REC-10: candidate persistence for resumable full mock attempts.
-- IMPORTANT: not authorised for production until retention and timer rules are approved.
-- A draft is never scored evidence and grants no educational progress.
create table public.learner_exam_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null check (length(btrim(course_id)) between 1 and 200),
  module_id text not null check (length(btrim(module_id)) between 1 and 200),
  exam_id text not null check (length(btrim(exam_id)) between 1 and 200),
  attempt_id uuid not null,
  revision bigint not null default 1 check (revision between 1 and 2147483647),
  content_fingerprint text not null check (content_fingerprint ~ '^[0-9a-f]{64}$'),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object' and octet_length(snapshot::text) <= 262144),
  expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id, module_id, exam_id),
  constraint exam_draft_phase check (snapshot ->> 'phase' in ('writing', 'marking', 'submitting', 'submitted'))
);
create index learner_exam_attempts_expiry_idx on public.learner_exam_attempts (expires_at);

alter table public.learner_exam_attempts enable row level security;
create policy "learner_select_own_exam_attempts" on public.learner_exam_attempts
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "learner_insert_own_exam_attempts" on public.learner_exam_attempts
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "learner_update_own_exam_attempts" on public.learner_exam_attempts
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "learner_delete_own_exam_attempts" on public.learner_exam_attempts
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on table public.learner_exam_attempts from public, anon, authenticated, service_role;
grant select, insert, update, delete on public.learner_exam_attempts to authenticated;
comment on table public.learner_exam_attempts is
  'Purpose-limited private GCSE/A-level mock draft and frozen submission state. Not scored evidence. Draft retention/deletion policy requires explicit approval before production deployment.';

commit;

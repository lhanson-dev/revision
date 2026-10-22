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

-- Enforce lifecycle and immutable owner/content fields at the database boundary,
-- including direct PostgREST mutations that bypass the React service.
create function public.guard_learner_exam_attempt_transition()
returns trigger language plpgsql security invoker
set search_path = pg_catalog, public
as $
declare
  prior_phase text;
  next_phase text;
begin
  prior_phase := old.snapshot ->> 'phase';
  if tg_op = 'DELETE' then
    if prior_phase = 'submitting' then
      raise exception 'An examination still being submitted cannot be discarded' using errcode = '23514';
    end if;
    return old;
  end if;
  next_phase := new.snapshot ->> 'phase';
  if new.user_id is distinct from old.user_id
    or new.course_id is distinct from old.course_id
    or new.module_id is distinct from old.module_id
    or new.exam_id is distinct from old.exam_id
    or new.attempt_id is distinct from old.attempt_id
    or new.content_fingerprint is distinct from old.content_fingerprint
    or new.expires_at is distinct from old.expires_at then
    raise exception 'Examination identity and retention cannot change' using errcode = '23514';
  end if;
  if new.revision <> old.revision + 1 then
    raise exception 'Examination revision must increase by one' using errcode = '23514';
  end if;
  if prior_phase = 'submitted'
    or (prior_phase = 'submitting' and next_phase <> 'submitted')
    or (prior_phase = 'marking' and next_phase not in ('marking', 'submitting'))
    or (prior_phase = 'writing' and next_phase not in ('writing', 'marking'))
    or (prior_phase = 'submitting' and new.snapshot -> 'frozenSubmission' is distinct from old.snapshot -> 'frozenSubmission') then
    raise exception 'Invalid examination state transition' using errcode = '23514';
  end if;
  if next_phase in ('submitting','submitted')
    and (new.snapshot -> 'frozenSubmission' is null or new.snapshot -> 'frozenSubmission' = 'null'::jsonb) then
    raise exception 'Exam submission must be frozen before recording evidence' using errcode = '23514';
  end if;
  return new;
end;
$;
create trigger learner_exam_attempt_guard
before update or delete on public.learner_exam_attempts
for each row execute function public.guard_learner_exam_attempt_transition();
revoke all on function public.guard_learner_exam_attempt_transition() from public, anon, authenticated, service_role;

revoke all on table public.learner_exam_attempts from public, anon, authenticated, service_role;
grant select, insert, update, delete on public.learner_exam_attempts to authenticated;
comment on table public.learner_exam_attempts is
  'Purpose-limited private GCSE/A-level mock draft and frozen submission state. Not scored evidence. Draft retention/deletion policy requires explicit approval before production deployment.';

commit;

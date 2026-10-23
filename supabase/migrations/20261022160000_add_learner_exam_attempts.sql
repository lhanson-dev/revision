begin;

-- REC-10: candidate persistence for resumable full mock attempts.
-- Founder approved 14-day answer retention and pause-on-interruption rules on 22 October 2026.
-- Release still requires full PR acceptance, explicitly governed merge and backend-ahead checks.
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
  -- Immutable creation anchors the maximum raw-answer retention. Updated saves never extend it.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id, module_id, exam_id),
  constraint exam_draft_phase check (snapshot ->> 'phase' in ('writing', 'marking', 'submitting', 'submitted'))
);
create index learner_exam_attempts_expiry_idx on public.learner_exam_attempts (expires_at);

alter table public.learner_exam_attempts enable row level security;
-- REC-10 is default-deny unless signed Auth app_metadata allows a restricted pilot.

create policy "learner_select_own_exam_attempts" on public.learner_exam_attempts
  for select to authenticated using ((select auth.uid()) = user_id and expires_at > now()
  and (select auth.jwt() -> 'app_metadata' ->> 'revision_rec10_pilot') = 'true');
create policy "learner_insert_own_exam_attempts" on public.learner_exam_attempts
  for insert to authenticated with check ((select auth.uid()) = user_id
  and (select auth.jwt() -> 'app_metadata' ->> 'revision_rec10_pilot') = 'true');
create policy "learner_update_own_exam_attempts" on public.learner_exam_attempts
  for update to authenticated
  using ((select auth.uid()) = user_id and expires_at > now()
    and (select auth.jwt() -> 'app_metadata' ->> 'revision_rec10_pilot') = 'true')
  with check ((select auth.uid()) = user_id and expires_at > now()
    and (select auth.jwt() -> 'app_metadata' ->> 'revision_rec10_pilot') = 'true');
create policy "learner_delete_own_exam_attempts" on public.learner_exam_attempts
  for delete to authenticated using ((select auth.uid()) = user_id
  and (select auth.jwt() -> 'app_metadata' ->> 'revision_rec10_pilot') = 'true');

-- Enforce lifecycle and immutable owner/content fields at the database boundary,
-- including direct PostgREST mutations that bypass the React service.
create function public.guard_learner_exam_attempt_transition()
returns trigger language plpgsql security invoker
set search_path = pg_catalog, public
as $exam_guard$
declare
  prior_phase text;
  next_phase text;
begin
  if tg_op = 'INSERT' then
    -- Never trust a browser-provided creation timestamp.
    new.created_at := now();
    if new.revision <> 1 or new.snapshot ->> 'phase' <> 'writing'
       or new.snapshot -> 'frozenSubmission' is distinct from 'null'::jsonb then
      raise exception 'New examination must start unsubmitted' using errcode = '23514';
    end if;
    if new.expires_at <= now() or new.expires_at > new.created_at + interval '14 days' then
      raise exception 'Exam draft retention exceeds 14 days' using errcode = '23514';
    end if;
    if new.snapshot -> 'timing' ->> 'policy' is distinct from 'pause-on-interruption' then
      raise exception 'Exam timer must pause on interruption' using errcode = '23514';
    end if;
    return new;
  end if;
  prior_phase := old.snapshot ->> 'phase';
  if tg_op = 'DELETE' then
    -- A student cannot discard an in-flight submission, but scheduled
    -- retention deletion MUST clear every expired state, including submitting.
    if prior_phase = 'submitting' and old.expires_at > now() then
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
    or new.expires_at is distinct from old.expires_at
    or new.created_at is distinct from old.created_at then
    raise exception 'Examination identity and retention cannot change' using errcode = '23514';
  end if;
  if new.snapshot -> 'timing' ->> 'policy' is distinct from 'pause-on-interruption' then
    raise exception 'Exam timer must pause on interruption' using errcode = '23514';
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
  if next_phase = 'submitted' and
     (new.snapshot -> 'answers' is distinct from '{}'::jsonb
      or new.snapshot -> 'marks' is distinct from '{}'::jsonb
      or new.snapshot -> 'selectedChoices' is distinct from '{}'::jsonb
      or new.snapshot -> 'flagged' is distinct from '{}'::jsonb) then
    raise exception 'Finished examinations cannot retain raw responses' using errcode = '23514';
  end if;
  if next_phase in ('submitting','submitted')
    and (new.snapshot -> 'frozenSubmission' is null or new.snapshot -> 'frozenSubmission' = 'null'::jsonb) then
    raise exception 'Exam submission must be frozen before recording evidence' using errcode = '23514';
  end if;
  return new;
end;
$exam_guard$;
create trigger learner_exam_attempt_guard
before insert or update or delete on public.learner_exam_attempts
for each row execute function public.guard_learner_exam_attempt_transition();
revoke all on function public.guard_learner_exam_attempt_transition() from public, anon, authenticated, service_role;

revoke all on table public.learner_exam_attempts from public, anon, authenticated, service_role;
grant select, insert, update, delete on public.learner_exam_attempts to authenticated;
comment on table public.learner_exam_attempts is
  'Private, learner-owned GCSE/A-level mock drafts, capped at 14 days from creation and removed by scheduled cleanup. Submitted attempt snapshots carry no raw answers. Not scored evidence.';

commit;

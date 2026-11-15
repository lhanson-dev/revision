begin;

-- LF-05 first implementation stage. No pilot accounts or published items are
-- created by this migration: it is fail-closed until separately approved,
-- individually source-reviewed content + controller-authorised cohort are seeded.
-- Never put the child's account details or original answer in GitHub.
create schema if not exists private;

create table private.lf05_test_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);
alter table private.lf05_test_memberships enable row level security;
revoke all on private.lf05_test_memberships from public, anon, authenticated;
-- Memberships can only be administered using privileged SQL after controller GO.
-- Re-query the server-side membership on *every* request: a cached JWT app flag
-- would not provide immediate revocation.
create or replace function private.lf05_is_authorised()
returns boolean language sql stable security definer
set search_path = ''
as $$
  select auth.uid() is not null
    and coalesce((auth.jwt()->>'is_anonymous')::boolean,false) is false
    and exists (
      select 1 from private.lf05_test_memberships m
      where m.user_id = auth.uid() and m.expires_at > now()
    );
$$;
revoke all on function private.lf05_is_authorised() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.lf05_is_authorised() to authenticated;
comment on function private.lf05_is_authorised() is
  'Restricted LF-05 entitlement check; private schema is not an exposed API. No accounts enabled at migration.';

-- Metadata and original stimulus are distinct from assessment guidance.
-- Only individually cleared items may have state=published. AQA source material
-- is REFERENCE_ONLY; the catalogue must contain ORIGINAL Revision questions.
create table public.lf05_written_questions (
  id text primary key check (id ~ '^(PSY|BUS)-LF05-[0-9]{2}(-[0-9]{2}|-S[0-9]+)?$'),
  course_id text not null check (length(course_id) between 1 and 200),
  paper_number smallint not null check (paper_number between 1 and 3),
  topic_id text not null check (length(topic_id) between 1 and 200),
  skill_ref text not null check (length(skill_ref) between 3 and 240),
  title text not null check (length(title) between 5 and 240),
  question_prompt text not null check (length(question_prompt) between 15 and 12000),
  stimulus text,
  marks_style smallint not null check (marks_style between 4 and 30),
  content_fingerprint text not null check (content_fingerprint ~ '^[0-9a-f]{64}$'),
  original_training_only boolean not null default true check (original_training_only),
  status text not null default 'held' check (status in ('held','published')),
  approved_source_ref text not null check (length(approved_source_ref) between 10 and 300),
  updated_at timestamptz not null default now()
);
alter table public.lf05_written_questions enable row level security;
create index lf05_questions_course_idx on public.lf05_written_questions(course_id, status);
create policy lf05_question_select on public.lf05_written_questions
  for select to authenticated
  using (status='published' and (select private.lf05_is_authorised()));
revoke all on public.lf05_written_questions from public, anon, authenticated;
grant select on public.lf05_written_questions to authenticated;

create table public.lf05_written_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null check (length(course_id) between 1 and 200),
  question_id text not null references public.lf05_written_questions(id),
  attempt_id uuid not null,
  revision bigint not null default 1 check (revision between 1 and 2147483647),
  content_fingerprint text not null check (content_fingerprint ~ '^[0-9a-f]{64}$'),
  phase text not null default 'draft' check (phase in ('draft','submitted','completed')),
  draft_text text not null default '' check (length(draft_text) <= 30000),
  first_answer_text text not null default '' check (length(first_answer_text) <= 30000),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  primary key(user_id,course_id,question_id,attempt_id),
  constraint lf05_phase_shape check (
    (phase='draft' and submitted_at is null and first_answer_text='')
    or (phase='submitted' and submitted_at is not null and draft_text='' and length(first_answer_text)>=100)
    or (phase='completed' and submitted_at is not null and draft_text='' and first_answer_text='')
  )
);
create index lf05_written_attempts_expiry_idx on public.lf05_written_attempts(expires_at);
create index lf05_written_attempts_question_idx on public.lf05_written_attempts(user_id,question_id,phase,expires_at);
alter table public.lf05_written_attempts enable row level security;

create policy lf05_attempt_select on public.lf05_written_attempts
  for select to authenticated
  using (user_id=(select auth.uid()) and expires_at>now() and (select private.lf05_is_authorised()));
create policy lf05_attempt_insert on public.lf05_written_attempts
  for insert to authenticated
  with check (user_id=(select auth.uid()) and (select private.lf05_is_authorised())
    and exists (select 1 from public.lf05_written_questions q
      where q.id=question_id and q.course_id=course_id
      and q.content_fingerprint=content_fingerprint and q.status='published'));
create policy lf05_attempt_update on public.lf05_written_attempts
  for update to authenticated
  using (user_id=(select auth.uid()) and expires_at>now() and (select private.lf05_is_authorised()))
  with check (user_id=(select auth.uid()) and expires_at>now() and (select private.lf05_is_authorised()));
create policy lf05_attempt_delete on public.lf05_written_attempts
  for delete to authenticated
  using (user_id=(select auth.uid()) and (select private.lf05_is_authorised()));
revoke all on public.lf05_written_attempts from public, anon, authenticated;
grant select,insert,update,delete on public.lf05_written_attempts to authenticated;

-- DB-enforced immutable first answer, CAS revision, and creation-anchored
-- retention. No client may manually skip the confirmed saved draft or revert a
-- submitted attempt to a new question/response.
create function public.guard_lf05_written_attempt()
returns trigger language plpgsql security invoker
set search_path = ''
as $guard$
begin
  if tg_op='INSERT' then
    new.created_at:=now();
    new.updated_at:=new.created_at;
    new.expires_at:=new.created_at+interval '14 days';
    if new.revision<>1 or new.phase<>'draft' or new.first_answer_text<>'' or
       new.submitted_at is not null then
      raise exception 'LF-05 must start as an unsubmitted draft' using errcode='23514';
    end if;
    return new;
  end if;
  if tg_op='DELETE' then return old; end if;
  if old.expires_at<=now() then
    raise exception 'LF-05 draft has expired' using errcode='23514';
  end if;
  if new.user_id is distinct from old.user_id or
     new.course_id is distinct from old.course_id or
     new.question_id is distinct from old.question_id or
     new.attempt_id is distinct from old.attempt_id or
     new.content_fingerprint is distinct from old.content_fingerprint or
     new.created_at is distinct from old.created_at or
     new.expires_at is distinct from old.expires_at then
    raise exception 'LF-05 answer identity/expiry cannot change' using errcode='23514';
  end if;
  if new.revision<>old.revision+1 then
    raise exception 'LF-05 stale or skipped save revision' using errcode='23514';
  end if;
  if old.phase='draft' and new.phase='draft' then
    if new.first_answer_text<>'' or new.submitted_at is not null then
      raise exception 'LF-05 draft cannot reveal or freeze an answer' using errcode='23514';
    end if;
  elsif old.phase='draft' and new.phase='submitted' then
    if length(btrim(old.draft_text))<100 or
       new.first_answer_text is distinct from old.draft_text or
       new.draft_text<>'' then
      raise exception 'LF-05 first submit requires the confirmed independent draft' using errcode='23514';
    end if;
    new.submitted_at:=now();
  elsif old.phase='submitted' and new.phase='completed' then
    if new.draft_text<>'' or new.first_answer_text<>'' or
       new.submitted_at is distinct from old.submitted_at then
      raise exception 'LF-05 completion must scrub raw answers' using errcode='23514';
    end if;
  else
    raise exception 'LF-05 answer state is immutable after submission' using errcode='23514';
  end if;
  new.updated_at:=now();
  return new;
end;
$guard$;
create trigger guard_lf05_written_attempt
  before insert or update or delete on public.lf05_written_attempts
  for each row execute function public.guard_lf05_written_attempt();
revoke all on function public.guard_lf05_written_attempt() from public, anon, authenticated;

-- Guides are never bundled into the public browser build. The server only
-- permits a guide SELECT once the same learner committed a substantial first
-- response on the *exact question fingerprint* in this restricted cohort.
create table public.lf05_written_guides (
  question_id text primary key references public.lf05_written_questions(id) on delete cascade,
  content_fingerprint text not null check(content_fingerprint ~ '^[0-9a-f]{64}$'),
  guidance jsonb not null check(jsonb_typeof(guidance)='array'
    and jsonb_array_length(guidance) between 3 and 30
    and octet_length(guidance::text) <= 32000),
  approved_review_ref text not null check(length(approved_review_ref) between 10 and 300)
);
alter table public.lf05_written_guides enable row level security;
create policy lf05_guide_after_first_answer on public.lf05_written_guides
  for select to authenticated
  using ((select private.lf05_is_authorised())
    and exists (select 1 from public.lf05_written_questions q
      where q.id=question_id and q.status='published'
      and q.content_fingerprint=lf05_written_guides.content_fingerprint)
    and exists (select 1 from public.lf05_written_attempts a
      where a.user_id=(select auth.uid()) and a.question_id=lf05_written_guides.question_id
      and a.content_fingerprint=lf05_written_guides.content_fingerprint
      and a.phase in ('submitted','completed') and a.expires_at>now()));
revoke all on public.lf05_written_guides from public, anon, authenticated;
grant select on public.lf05_written_guides to authenticated;

create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('revision-expired-lf05-written-v1','0 * * * *',
  'delete from public.lf05_written_attempts where expires_at <= now()');

comment on table public.lf05_written_questions is 'Restricted Original Revision extended writing; empty/default held until per-item assurance and controller GO.';
comment on table public.lf05_written_guides is 'Server-gated after confirmed learner first submission; never exposed with original question stem.';
comment on table public.lf05_written_attempts is 'Owner-private, 14-day creation-anchored original essays; never verified examination marks or independent mastery.';

commit;

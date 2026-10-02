begin;

-- Accepted sessions: the student's own choices on their plan ("Add to Thursday", "Move it").
-- The plan itself stays derived and is rebuilt each time; only a session the student accepted is stored,
-- so it stays put and the planner can treat it as already placed.
-- Design: docs/design/learner-redesign-v2/data-model-proposal.md, section 5 (agreed by the Founder, 1 Oct 2026).
create table public.learner_planned_sessions (
  session_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planned_date date not null,
  course_id text not null,
  topic_id text not null,
  activity_type text not null check (activity_type in ('learn', 'practice', 'exam_prep')),
  minutes smallint not null check (minutes between 5 and 240),
  added_by text not null check (added_by in ('student', 'rev')),
  recommendation_id text,
  status text not null default 'planned' check (status in ('planned', 'done', 'skipped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learner_planned_sessions_course_id_present check (length(btrim(course_id)) between 1 and 200),
  constraint learner_planned_sessions_topic_id_present check (length(btrim(topic_id)) between 1 and 200),
  constraint learner_planned_sessions_recommendation_id_bounded check (recommendation_id is null or length(recommendation_id) between 1 and 200)
);

-- The same topic and activity is not planned twice on one day.
create unique index learner_planned_sessions_one_planned_per_day_idx
  on public.learner_planned_sessions (user_id, planned_date, course_id, topic_id, activity_type)
  where status = 'planned';

create index learner_planned_sessions_user_date_idx
  on public.learner_planned_sessions (user_id, planned_date);

alter table public.learner_planned_sessions enable row level security;

create policy "users_manage_own_learner_planned_sessions"
  on public.learner_planned_sessions
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on table public.learner_planned_sessions from anon;
revoke all on table public.learner_planned_sessions from authenticated;
revoke all on table public.learner_planned_sessions from service_role;

grant select, insert, update, delete on table public.learner_planned_sessions to authenticated;

comment on table public.learner_planned_sessions is
  'Learner-owned sessions the student accepted onto their plan (themselves or from a REV suggestion). The rest of the plan is derived, not stored. Not mastery or readiness evidence.';

commit;

begin;

create table public.revision_assessments (
  assessment_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  course_id text,
  module_id text,
  assessment_type text not null check (assessment_type in ('topic_test', 'mock', 'public_exam', 'other')),
  title text not null,
  assessment_date date not null,
  relative_importance text not null default 'normal' check (relative_importance in ('normal', 'high')),
  scope jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint revision_assessments_nonempty_subject check (length(btrim(subject_id)) > 0),
  constraint revision_assessments_nonempty_title check (length(btrim(title)) > 0)
);

create index revision_assessments_user_date_idx
  on public.revision_assessments (user_id, assessment_date)
  where is_active;

create table public.revision_availability_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  weekday_minutes integer not null default 0 check (weekday_minutes between 0 and 1440),
  weekend_minutes integer not null default 0 check (weekend_minutes between 0 and 1440),
  timezone text not null default 'Europe/London',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint revision_availability_timezone_nonempty check (length(btrim(timezone)) > 0)
);

create table public.revision_availability_exceptions (
  exception_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  available_minutes integer not null check (available_minutes between 0 and 1440),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_date)
);

create index revision_availability_exceptions_user_date_idx
  on public.revision_availability_exceptions (user_id, local_date);

create table public.revision_planning_preferences (
  preference_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  preference_type text not null check (preference_type in ('prefer_subject', 'reduce_subject', 'prefer_activity')),
  subject_id text,
  activity_type text,
  starts_on date not null,
  ends_on date not null,
  strength smallint not null default 1 check (strength between 1 and 3),
  source text not null default 'learner' check (source in ('learner', 'rev_negotiated')),
  rationale text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint revision_planning_preferences_valid_dates check (ends_on >= starts_on),
  constraint revision_planning_preferences_target check (
    (preference_type in ('prefer_subject', 'reduce_subject') and subject_id is not null and length(btrim(subject_id)) > 0)
    or (preference_type = 'prefer_activity' and activity_type is not null and length(btrim(activity_type)) > 0)
  )
);

create index revision_planning_preferences_user_window_idx
  on public.revision_planning_preferences (user_id, starts_on, ends_on)
  where is_active;

create table public.revision_activity_events (
  event_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommendation_id text,
  event_type text not null check (event_type in ('offered', 'started', 'meaningfully_engaged', 'completed', 'chosen_alternative')),
  subject_id text not null,
  course_id text,
  module_id text,
  topic_id text,
  activity_type text,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  schema_version smallint not null default 1 check (schema_version > 0),
  created_at timestamptz not null default now(),
  constraint revision_activity_events_nonempty_subject check (length(btrim(subject_id)) > 0)
);

create index revision_activity_events_user_occurred_idx
  on public.revision_activity_events (user_id, occurred_at desc);

create index revision_activity_events_user_recommendation_idx
  on public.revision_activity_events (user_id, recommendation_id, occurred_at desc)
  where recommendation_id is not null;

alter table public.revision_assessments enable row level security;
alter table public.revision_availability_profiles enable row level security;
alter table public.revision_availability_exceptions enable row level security;
alter table public.revision_planning_preferences enable row level security;
alter table public.revision_activity_events enable row level security;

create policy "users_manage_own_revision_assessments"
  on public.revision_assessments
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users_manage_own_revision_availability_profiles"
  on public.revision_availability_profiles
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users_manage_own_revision_availability_exceptions"
  on public.revision_availability_exceptions
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users_manage_own_revision_planning_preferences"
  on public.revision_planning_preferences
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users_manage_own_revision_activity_events"
  on public.revision_activity_events
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on table public.revision_assessments from anon;
revoke all on table public.revision_availability_profiles from anon;
revoke all on table public.revision_availability_exceptions from anon;
revoke all on table public.revision_planning_preferences from anon;
revoke all on table public.revision_activity_events from anon;

revoke all on table public.revision_assessments from authenticated;
revoke all on table public.revision_availability_profiles from authenticated;
revoke all on table public.revision_availability_exceptions from authenticated;
revoke all on table public.revision_planning_preferences from authenticated;
revoke all on table public.revision_activity_events from authenticated;

grant select, insert, update, delete on table public.revision_assessments to authenticated;
grant select, insert, update, delete on table public.revision_availability_profiles to authenticated;
grant select, insert, update, delete on table public.revision_availability_exceptions to authenticated;
grant select, insert, update, delete on table public.revision_planning_preferences to authenticated;
grant select, insert, update, delete on table public.revision_activity_events to authenticated;

comment on table public.revision_assessments is
  'Learner-owned assessment dates, scope and importance used as adaptive planner inputs.';
comment on table public.revision_availability_profiles is
  'Learner-owned normal weekday/weekend revision capacity. Capacity is flexible workload, not a clock timetable.';
comment on table public.revision_availability_exceptions is
  'Learner-owned date-specific capacity overrides for adaptive planning.';
comment on table public.revision_planning_preferences is
  'Bounded learner or REV-negotiated planning preferences. These are planning context, not mastery/readiness evidence.';
comment on table public.revision_activity_events is
  'Minimal adaptive-planner activity state events. Events do not represent precise active study time or mastery by themselves.';

commit;

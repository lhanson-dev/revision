create table if not exists public.account_experience_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  primary_experience text not null,
  onboarding_stage text not null default 'course',
  onboarding_completed_at timestamptz,
  starter_topic_id text,
  starter_activity text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_experience_state_primary_experience_check
    check (primary_experience = 'student'),
  constraint account_experience_state_stage_check
    check (onboarding_stage in ('course', 'course_ready', 'starting_check', 'recommendation', 'activity', 'feedback', 'complete')),
  constraint account_experience_state_starter_activity_check
    check (starter_activity is null or starter_activity in ('flashcard', 'quick-check')),
  constraint account_experience_state_starter_pair_check
    check ((starter_topic_id is null) = (starter_activity is null)),
  constraint account_experience_state_completion_check
    check (
      (onboarding_stage = 'complete' and onboarding_completed_at is not null)
      or (onboarding_stage <> 'complete')
    )
);

comment on table public.account_experience_state is
  'Owner-scoped primary product experience and first-use journey state. This is application routing state, not authorization, billing, payer or Student-data permission.';

alter table public.account_experience_state enable row level security;

revoke all on table public.account_experience_state from anon, authenticated;
grant select, insert, update on table public.account_experience_state to authenticated;

create policy "Students can read their own account experience"
  on public.account_experience_state
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Students can establish their own initial experience"
  on public.account_experience_state
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and primary_experience = 'student'
    and onboarding_stage = 'course'
    and onboarding_completed_at is null
    and starter_topic_id is null
    and starter_activity is null
  );

create policy "Students can update their own first-use state"
  on public.account_experience_state
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and primary_experience = 'student');

-- Compatibility boundary: accounts that existed when FI-021 is introduced are
-- treated as established Students so they are not unexpectedly re-onboarded.
-- Accounts created after this migration receive no row until they choose Student.
insert into public.account_experience_state (
  user_id,
  primary_experience,
  onboarding_stage,
  onboarding_completed_at,
  starter_topic_id,
  starter_activity,
  created_at,
  updated_at
)
select
  users.id,
  'student',
  'complete',
  now(),
  null,
  null,
  now(),
  now()
from auth.users as users
on conflict (user_id) do nothing;

create table if not exists public.student_first_use_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  course_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint student_first_use_events_type_check check (event_type in (
    'onboarding_started',
    'account_type_viewed',
    'student_selected',
    'first_course_setup_viewed',
    'first_course_added',
    'starting_check_offered',
    'starting_check_started',
    'starting_check_completed',
    'starting_check_partial',
    'starting_check_skipped',
    'recommendation_shown',
    'recommendation_accepted',
    'recommendation_overridden',
    'first_activity_started',
    'first_activity_completed',
    'feedback_viewed',
    'onboarding_completed',
    'onboarding_error',
    'onboarding_resumed'
  )),
  constraint student_first_use_events_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

comment on table public.student_first_use_events is
  'Bounded GJ-01 product funnel telemetry. Raw learning answers are excluded; educational responses remain in governed evidence tables.';

create index if not exists student_first_use_events_user_created_idx
  on public.student_first_use_events (user_id, created_at asc);

alter table public.student_first_use_events enable row level security;

revoke all on table public.student_first_use_events from anon, authenticated;
grant insert on table public.student_first_use_events to authenticated;

create policy "Students can record their own first-use events"
  on public.student_first_use_events
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
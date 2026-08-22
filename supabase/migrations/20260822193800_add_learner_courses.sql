begin;

create table public.learner_courses (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id),
  constraint learner_courses_nonempty_course_id check (length(btrim(course_id)) > 0)
);

create index learner_courses_course_id_idx
  on public.learner_courses (course_id);

create table public.learner_course_events (
  event_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in (
    'courses_index_viewed',
    'add_course_opened',
    'course_added',
    'course_add_failed',
    'course_removed',
    'course_remove_cancelled',
    'course_opened_from_global_navigation',
    'course_opened_from_courses_index',
    'course_membership_integrity_exception'
  )),
  course_id text,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint learner_course_events_course_id_not_blank check (course_id is null or length(btrim(course_id)) > 0)
);

create index learner_course_events_user_occurred_idx
  on public.learner_course_events (user_id, occurred_at desc);

create index learner_course_events_type_occurred_idx
  on public.learner_course_events (event_type, occurred_at desc);

alter table public.learner_courses enable row level security;
alter table public.learner_course_events enable row level security;

create policy "users_manage_own_learner_courses"
  on public.learner_courses
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users_select_own_learner_course_events"
  on public.learner_course_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users_insert_own_learner_course_events"
  on public.learner_course_events
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

revoke all on table public.learner_courses from anon;
revoke all on table public.learner_course_events from anon;
revoke all on table public.learner_courses from authenticated;
revoke all on table public.learner_course_events from authenticated;

grant select, insert, delete on table public.learner_courses to authenticated;
grant select, insert on table public.learner_course_events to authenticated;

-- Bounded FI-020 compatibility transition.
-- Before persisted membership existed, the production runtime treated both currently
-- published Business courses as part of every authenticated learner's programme.
-- Seed only those two course identities for users who already exist when this migration
-- runs. Future users and future published courses are not automatically enrolled.
insert into public.learner_courses (user_id, course_id)
select users.id, seeded.course_id
from auth.users as users
cross join (values
  ('aqa:aqa-a-level:7132'::text),
  ('aqa:aqa-as:7131'::text)
) as seeded(course_id)
on conflict (user_id, course_id) do nothing;

comment on table public.learner_courses is
  'Authenticated learner-owned active course membership. Membership is programme context, not learning/mastery/readiness evidence.';
comment on table public.learner_course_events is
  'Minimal FI-020 product/assurance telemetry for learner course management. Events are not learning evidence.';

commit;

begin;

create table public.learner_plan_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'paid', 'premium')),
  assignment_source text not null default 'registration_default' check (assignment_source in ('registration_default', 'compatibility_default', 'admin_manual')),
  assigned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learner_plan_state_manual_assignment_has_actor check (
    assignment_source <> 'admin_manual' or assigned_by is not null
  )
);

create table public.learner_plan_assignment_events (
  event_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  previous_tier text check (previous_tier is null or previous_tier in ('free', 'paid', 'premium')),
  tier text not null check (tier in ('free', 'paid', 'premium')),
  assigned_by uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now()
);

create index learner_plan_assignment_events_user_occurred_idx
  on public.learner_plan_assignment_events (user_id, occurred_at desc);

alter table public.learner_plan_state enable row level security;
alter table public.learner_plan_assignment_events enable row level security;

create policy "users_select_own_learner_plan_state"
  on public.learner_plan_state
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.learner_plan_state from anon, authenticated, service_role;
revoke all on table public.learner_plan_assignment_events from anon, authenticated, service_role;

grant select on table public.learner_plan_state to authenticated;
grant select, insert, update on table public.learner_plan_state to service_role;
grant select, insert on table public.learner_plan_assignment_events to service_role;

create or replace function revision_private.handle_new_auth_user_plan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.learner_plan_state (user_id, tier, assignment_source)
  values (new.id, 'free', 'registration_default')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function revision_private.handle_new_auth_user_plan() from public, anon, authenticated;

drop trigger if exists revision_create_learner_plan_after_auth_user on auth.users;
create trigger revision_create_learner_plan_after_auth_user
  after insert on auth.users
  for each row execute function revision_private.handle_new_auth_user_plan();

insert into public.learner_plan_state (user_id, tier, assignment_source)
select id, 'free', 'compatibility_default'
from auth.users
on conflict (user_id) do nothing;

create or replace function public.assign_learner_plan(
  p_user_id uuid,
  p_tier text,
  p_assigned_by uuid
)
returns table (
  user_id uuid,
  tier text,
  assignment_source text,
  assigned_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  previous_tier text;
begin
  if p_tier is null or p_tier not in ('free', 'paid', 'premium') then
    raise exception 'Invalid learner plan tier'
      using errcode = '22023';
  end if;

  if p_assigned_by is null then
    raise exception 'Manual learner plan assignment requires an actor'
      using errcode = '22023';
  end if;

  select current_state.tier
    into previous_tier
  from public.learner_plan_state as current_state
  where current_state.user_id = p_user_id
  for update;

  insert into public.learner_plan_state as state (
    user_id,
    tier,
    assignment_source,
    assigned_by,
    created_at,
    updated_at
  ) values (
    p_user_id,
    p_tier,
    'admin_manual',
    p_assigned_by,
    now(),
    now()
  )
  on conflict (user_id) do update
  set tier = excluded.tier,
      assignment_source = 'admin_manual',
      assigned_by = excluded.assigned_by,
      updated_at = now();

  insert into public.learner_plan_assignment_events (
    user_id,
    previous_tier,
    tier,
    assigned_by
  ) values (
    p_user_id,
    previous_tier,
    p_tier,
    p_assigned_by
  );

  return query
  select state.user_id,
         state.tier,
         state.assignment_source,
         state.assigned_by,
         state.created_at,
         state.updated_at
  from public.learner_plan_state as state
  where state.user_id = p_user_id;
end;
$$;

revoke all on function public.assign_learner_plan(uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.assign_learner_plan(uuid, text, uuid) to service_role;

comment on table public.learner_plan_state is
  'FI-022 durable learner plan identity. Plan state is account/commercial context only and is not educational evidence, Admin authorization, payer identity or supporter permission.';
comment on table public.learner_plan_assignment_events is
  'Append-only audit evidence for protected manual FI-022 learner plan assignments.';
comment on function public.assign_learner_plan(uuid, text, uuid) is
  'Atomic service-role operation used only after protected Admin authorization to assign Free, Paid or Premium and record assignment audit evidence.';

create or replace function public.revision_release_readiness()
returns jsonb
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
select jsonb_build_object(
  'contract', 'plan-state-v1',
  'ready', (
    to_regclass('public.profiles') is not null
    and to_regclass('public.learning_evidence') is not null
    and to_regclass('public.revision_assessments') is not null
    and to_regclass('public.revision_availability_profiles') is not null
    and to_regclass('public.revision_availability_exceptions') is not null
    and to_regclass('public.revision_planning_preferences') is not null
    and to_regclass('public.revision_activity_events') is not null
    and to_regclass('public.learner_courses') is not null
    and to_regclass('public.learner_course_events') is not null
    and to_regclass('public.learner_plan_state') is not null
    and to_regclass('public.learner_plan_assignment_events') is not null
    and to_regprocedure('public.admin_operations_metrics()') is not null
    and to_regprocedure('public.admin_planner_metrics()') is not null
    and to_regprocedure('public.assign_learner_plan(uuid,text,uuid)') is not null
  ),
  'checks', jsonb_build_object(
    'profiles', to_regclass('public.profiles') is not null,
    'learningEvidence', to_regclass('public.learning_evidence') is not null,
    'assessments', to_regclass('public.revision_assessments') is not null,
    'availabilityProfiles', to_regclass('public.revision_availability_profiles') is not null,
    'availabilityExceptions', to_regclass('public.revision_availability_exceptions') is not null,
    'planningPreferences', to_regclass('public.revision_planning_preferences') is not null,
    'activityEvents', to_regclass('public.revision_activity_events') is not null,
    'learnerCourses', to_regclass('public.learner_courses') is not null,
    'learnerCourseEvents', to_regclass('public.learner_course_events') is not null,
    'learnerPlanState', to_regclass('public.learner_plan_state') is not null,
    'learnerPlanAssignmentEvents', to_regclass('public.learner_plan_assignment_events') is not null,
    'adminOperationsMetrics', to_regprocedure('public.admin_operations_metrics()') is not null,
    'plannerAdminMetrics', to_regprocedure('public.admin_planner_metrics()') is not null,
    'assignLearnerPlan', to_regprocedure('public.assign_learner_plan(uuid,text,uuid)') is not null
  )
);
$$;

comment on function public.revision_release_readiness() is
  'Public, non-sensitive release-readiness contract used by deployment automation. Runs as SECURITY INVOKER and exposes only boolean capability presence plus a contract identifier.';

revoke all on function public.revision_release_readiness() from public;
grant execute on function public.revision_release_readiness() to anon, authenticated;

commit;

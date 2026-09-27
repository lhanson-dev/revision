begin;

alter table public.revision_availability_profiles
  add column monday_minutes integer not null default 0 check (monday_minutes between 0 and 1440),
  add column tuesday_minutes integer not null default 0 check (tuesday_minutes between 0 and 1440),
  add column wednesday_minutes integer not null default 0 check (wednesday_minutes between 0 and 1440),
  add column thursday_minutes integer not null default 0 check (thursday_minutes between 0 and 1440),
  add column friday_minutes integer not null default 0 check (friday_minutes between 0 and 1440),
  add column saturday_minutes integer not null default 0 check (saturday_minutes between 0 and 1440),
  add column sunday_minutes integer not null default 0 check (sunday_minutes between 0 and 1440);

update public.revision_availability_profiles
set monday_minutes = weekday_minutes,
    tuesday_minutes = weekday_minutes,
    wednesday_minutes = weekday_minutes,
    thursday_minutes = weekday_minutes,
    friday_minutes = weekday_minutes,
    saturday_minutes = weekend_minutes,
    sunday_minutes = weekend_minutes;

comment on table public.revision_availability_profiles is
  'Learner-owned recurring Monday-Sunday revision capacity. Legacy weekday/weekend aggregate columns are retained for compatibility. Capacity is flexible workload, not a clock timetable or learning evidence.';

create or replace function public.revision_release_readiness()
returns jsonb
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
select jsonb_build_object(
  'contract', 'planner-week-v1',
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
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'revision_availability_profiles'
        and column_name = 'monday_minutes'
    )
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'revision_availability_profiles'
        and column_name = 'tuesday_minutes'
    )
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'revision_availability_profiles'
        and column_name = 'wednesday_minutes'
    )
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'revision_availability_profiles'
        and column_name = 'thursday_minutes'
    )
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'revision_availability_profiles'
        and column_name = 'friday_minutes'
    )
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'revision_availability_profiles'
        and column_name = 'saturday_minutes'
    )
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'revision_availability_profiles'
        and column_name = 'sunday_minutes'
    )
  ),
  'checks', jsonb_build_object(
    'profiles', to_regclass('public.profiles') is not null,
    'learningEvidence', to_regclass('public.learning_evidence') is not null,
    'assessments', to_regclass('public.revision_assessments') is not null,
    'availabilityProfiles', to_regclass('public.revision_availability_profiles') is not null,
    'weeklyAvailability', (
      select count(*) = 7
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'revision_availability_profiles'
        and column_name in (
          'monday_minutes',
          'tuesday_minutes',
          'wednesday_minutes',
          'thursday_minutes',
          'friday_minutes',
          'saturday_minutes',
          'sunday_minutes'
        )
    ),
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
  'Public, non-sensitive release-readiness contract used by deployment automation. planner-week-v1 additionally requires recurring Monday-Sunday planner availability. Runs as SECURITY INVOKER and exposes only boolean capability presence plus a contract identifier.';

revoke all on function public.revision_release_readiness() from public;
grant execute on function public.revision_release_readiness() to anon, authenticated;

commit;
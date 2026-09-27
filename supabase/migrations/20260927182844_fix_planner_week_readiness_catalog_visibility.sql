begin;

create or replace function public.revision_release_readiness()
returns jsonb
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
with weekly_availability as (
  select count(*) = 7 as present
  from pg_catalog.pg_attribute
  where attrelid = to_regclass('public.revision_availability_profiles')
    and attname in (
      'monday_minutes',
      'tuesday_minutes',
      'wednesday_minutes',
      'thursday_minutes',
      'friday_minutes',
      'saturday_minutes',
      'sunday_minutes'
    )
    and attnum > 0
    and not attisdropped
)
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
    and (select present from weekly_availability)
  ),
  'checks', jsonb_build_object(
    'profiles', to_regclass('public.profiles') is not null,
    'learningEvidence', to_regclass('public.learning_evidence') is not null,
    'assessments', to_regclass('public.revision_assessments') is not null,
    'availabilityProfiles', to_regclass('public.revision_availability_profiles') is not null,
    'weeklyAvailability', (select present from weekly_availability),
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
  'Public, non-sensitive release-readiness contract used by deployment automation. planner-week-v1 uses pg_catalog metadata so SECURITY INVOKER checks remain valid for the anonymous release probe without granting table access.';

revoke all on function public.revision_release_readiness() from public;
grant execute on function public.revision_release_readiness() to anon, authenticated;

commit;

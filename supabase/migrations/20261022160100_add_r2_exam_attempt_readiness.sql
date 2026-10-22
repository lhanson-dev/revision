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
),
learn_exposure as (
  select coalesce(
    to_regclass('public.learner_learn_exposures') is not null
    and exists (
      select 1 from pg_catalog.pg_class
      where oid = to_regclass('public.learner_learn_exposures') and relrowsecurity
    )
    and has_table_privilege('authenticated', to_regclass('public.learner_learn_exposures'), 'SELECT')
    and has_table_privilege('authenticated', to_regclass('public.learner_learn_exposures'), 'INSERT')
    and not has_table_privilege('authenticated', to_regclass('public.learner_learn_exposures'), 'UPDATE')
    and not has_table_privilege('authenticated', to_regclass('public.learner_learn_exposures'), 'DELETE')
    and not has_table_privilege('anon', to_regclass('public.learner_learn_exposures'), 'SELECT')
  , false) as present
),
practice_checkpoint as (
  select coalesce(
    to_regclass('public.learner_practice_checkpoints') is not null
    and exists (
      select 1 from pg_catalog.pg_class
      where oid = to_regclass('public.learner_practice_checkpoints') and relrowsecurity
    )
    and has_table_privilege('authenticated', to_regclass('public.learner_practice_checkpoints'), 'SELECT')
    and has_table_privilege('authenticated', to_regclass('public.learner_practice_checkpoints'), 'INSERT')
    and has_table_privilege('authenticated', to_regclass('public.learner_practice_checkpoints'), 'UPDATE')
    and has_table_privilege('authenticated', to_regclass('public.learner_practice_checkpoints'), 'DELETE')
    and not has_table_privilege('anon', to_regclass('public.learner_practice_checkpoints'), 'SELECT')
    and not has_table_privilege('service_role', to_regclass('public.learner_practice_checkpoints'), 'SELECT')
  , false) as present
),
exam_attempt as (
  select coalesce(
    to_regclass('public.learner_exam_attempts') is not null
    and exists (
      select 1 from pg_catalog.pg_class
      where oid = to_regclass('public.learner_exam_attempts') and relrowsecurity
    )
    and has_table_privilege('authenticated', to_regclass('public.learner_exam_attempts'), 'SELECT')
    and has_table_privilege('authenticated', to_regclass('public.learner_exam_attempts'), 'INSERT')
    and has_table_privilege('authenticated', to_regclass('public.learner_exam_attempts'), 'UPDATE')
    and has_table_privilege('authenticated', to_regclass('public.learner_exam_attempts'), 'DELETE')
    and not has_table_privilege('anon', to_regclass('public.learner_exam_attempts'), 'SELECT')
    and not has_table_privilege('service_role', to_regclass('public.learner_exam_attempts'), 'SELECT')
  , false) as present
)
select jsonb_build_object(
  'contract', 'r2-exam-attempt-v1',
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
    and (select present from learn_exposure)
    and (select present from practice_checkpoint)
    and (select present from exam_attempt)
    and exists (select 1 from pg_catalog.pg_extension where extname = 'pg_cron')
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
    'learnExposures', (select present from learn_exposure),
    'practiceCheckpoints', (select present from practice_checkpoint),
    'examAttempts', (select present from exam_attempt),
    'examCleanupScheduler', exists (select 1 from pg_catalog.pg_extension where extname = 'pg_cron'),
    'adminOperationsMetrics', to_regprocedure('public.admin_operations_metrics()') is not null,
    'plannerAdminMetrics', to_regprocedure('public.admin_planner_metrics()') is not null,
    'assignLearnerPlan', to_regprocedure('public.assign_learner_plan(uuid,text,uuid)') is not null
  )
);
$$;

comment on function public.revision_release_readiness() is
  'Public, non-sensitive r2-exam-attempt-v1 release-readiness contract; requires owner-only full exam attempt drafts, the installed pg_cron scheduler extension, Practice checkpoints and all preceding capabilities. The actual job execution is verified operationally. Only boolean capabilities are returned.';

revoke all on function public.revision_release_readiness() from public;
grant execute on function public.revision_release_readiness() to anon, authenticated;

commit;

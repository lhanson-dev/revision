begin;

create or replace function public.revision_release_readiness()
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
select jsonb_build_object(
  'contract', 'planner-v1',
  'ready', (
    to_regclass('public.profiles') is not null
    and to_regclass('public.learning_evidence') is not null
    and to_regclass('public.revision_assessments') is not null
    and to_regclass('public.revision_availability_profiles') is not null
    and to_regclass('public.revision_availability_exceptions') is not null
    and to_regclass('public.revision_planning_preferences') is not null
    and to_regclass('public.revision_activity_events') is not null
    and to_regprocedure('public.admin_operations_metrics()') is not null
    and to_regprocedure('public.admin_planner_metrics()') is not null
  ),
  'checks', jsonb_build_object(
    'profiles', to_regclass('public.profiles') is not null,
    'learningEvidence', to_regclass('public.learning_evidence') is not null,
    'assessments', to_regclass('public.revision_assessments') is not null,
    'availabilityProfiles', to_regclass('public.revision_availability_profiles') is not null,
    'availabilityExceptions', to_regclass('public.revision_availability_exceptions') is not null,
    'planningPreferences', to_regclass('public.revision_planning_preferences') is not null,
    'activityEvents', to_regclass('public.revision_activity_events') is not null,
    'adminOperationsMetrics', to_regprocedure('public.admin_operations_metrics()') is not null,
    'plannerAdminMetrics', to_regprocedure('public.admin_planner_metrics()') is not null
  )
);
$$;

comment on function public.revision_release_readiness() is
  'Public, non-sensitive release-readiness contract used by deployment automation to verify required Revision database capabilities before publishing a new frontend. It exposes only boolean capability presence and a contract identifier.';

revoke all on function public.revision_release_readiness() from public;
grant execute on function public.revision_release_readiness() to anon, authenticated;

commit;

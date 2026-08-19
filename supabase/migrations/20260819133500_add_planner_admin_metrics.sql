begin;

create or replace function public.admin_planner_metrics()
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
with
  learner_profiles as (
    select user_id
    from public.profiles
    where not is_test_user and not is_admin
  ),
  active_assessments as (
    select a.*
    from public.revision_assessments a
    join learner_profiles p on p.user_id = a.user_id
    where a.is_active
      and a.assessment_date >= current_date
  ),
  learners_with_availability as (
    select distinct a.user_id
    from public.revision_availability_profiles a
    join learner_profiles p on p.user_id = a.user_id
  ),
  active_plan_learners as (
    select distinct a.user_id
    from active_assessments a
    join public.revision_availability_profiles v on v.user_id = a.user_id
  ),
  planner_events_30d as (
    select e.*
    from public.revision_activity_events e
    join learner_profiles p on p.user_id = e.user_id
    where e.occurred_at >= now() - interval '30 days'
  ),
  active_preferences as (
    select pref.*
    from public.revision_planning_preferences pref
    join learner_profiles p on p.user_id = pref.user_id
    where pref.is_active
      and pref.starts_on <= current_date
      and pref.ends_on >= current_date
  )
select jsonb_build_object(
  'activePlanLearners', (select count(*)::int from active_plan_learners),
  'activeAssessments', (select count(*)::int from active_assessments),
  'learnersWithAvailability', (select count(*)::int from learners_with_availability),
  'activePreferences', (select count(*)::int from active_preferences),
  'events7d', (select count(*)::int from planner_events_30d where occurred_at >= now() - interval '7 days'),
  'events30d', (select count(*)::int from planner_events_30d),
  'started7d', (select count(*)::int from planner_events_30d where event_type = 'started' and occurred_at >= now() - interval '7 days'),
  'completed7d', (select count(*)::int from planner_events_30d where event_type = 'completed' and occurred_at >= now() - interval '7 days'),
  'started30d', (select count(*)::int from planner_events_30d where event_type = 'started'),
  'completed30d', (select count(*)::int from planner_events_30d where event_type = 'completed'),
  'alternativeChoices30d', (select count(*)::int from planner_events_30d where event_type = 'chosen_alternative'),
  'priorityModeStarts30d', (
    select count(*)::int
    from planner_events_30d
    where event_type = 'started'
      and metadata ->> 'capacityState' = 'prioritising'
  ),
  'latestEventAt', (select max(occurred_at) from planner_events_30d),
  'calculationFailuresKnown', false
);
$$;

comment on function public.admin_planner_metrics() is
  'Aggregate adaptive-planner adoption and activity metrics for the protected Revision Admin service. Test and admin accounts are excluded. Calculation failures remain explicitly unknown until dedicated planner failure telemetry exists.';

revoke all on function public.admin_planner_metrics() from public;
revoke all on function public.admin_planner_metrics() from anon;
revoke all on function public.admin_planner_metrics() from authenticated;
grant execute on function public.admin_planner_metrics() to service_role;

commit;

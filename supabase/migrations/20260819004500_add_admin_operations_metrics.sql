begin;

-- Aggregate-only operational metrics for the protected Admin dashboard.
-- The function is executable only by the service role and is called from the
-- server-side admin-operations Edge Function after database-backed admin access
-- has been verified for the requesting user.
create or replace function public.admin_operations_metrics()
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
with
  all_profiles as (
    select user_id, is_test_user, is_admin, created_at
    from public.profiles
  ),
  learner_profiles as (
    select user_id, created_at
    from all_profiles
    where not is_test_user and not is_admin
  ),
  learner_events_30d as (
    select e.user_id, e.module_id, e.topic_id, e.source, e.occurred_at
    from public.learning_evidence e
    join learner_profiles p on p.user_id = e.user_id
    where e.occurred_at >= now() - interval '30 days'
  ),
  days_14 as (
    select generate_series(current_date - 13, current_date, interval '1 day')::date as day
  ),
  signup_series as (
    select
      d.day,
      count(p.user_id)::int as count
    from days_14 d
    left join learner_profiles p on p.created_at::date = d.day
    group by d.day
    order by d.day
  ),
  activity_series as (
    select
      d.day,
      count(e.user_id)::int as count
    from days_14 d
    left join learner_events_30d e on e.occurred_at::date = d.day
    group by d.day
    order by d.day
  ),
  module_activity as (
    select module_id, count(*)::int as count
    from learner_events_30d
    group by module_id
    order by count desc, module_id
    limit 20
  )
select jsonb_build_object(
  'users', jsonb_build_object(
    'totalLearners', (select count(*)::int from learner_profiles),
    'adminAccounts', (select count(*)::int from all_profiles where not is_test_user and is_admin),
    'testAccounts', (select count(*)::int from all_profiles where is_test_user),
    'newLearners7d', (select count(*)::int from learner_profiles where created_at >= now() - interval '7 days'),
    'newLearners30d', (select count(*)::int from learner_profiles where created_at >= now() - interval '30 days'),
    'activeLearners1d', (select count(distinct user_id)::int from learner_events_30d where occurred_at >= now() - interval '1 day'),
    'activeLearners7d', (select count(distinct user_id)::int from learner_events_30d where occurred_at >= now() - interval '7 days'),
    'activeLearners30d', (select count(distinct user_id)::int from learner_events_30d),
    'signups14d', coalesce((
      select jsonb_agg(jsonb_build_object('date', day, 'count', count) order by day)
      from signup_series
    ), '[]'::jsonb)
  ),
  'activity', jsonb_build_object(
    'events7d', (select count(*)::int from learner_events_30d where occurred_at >= now() - interval '7 days'),
    'events30d', (select count(*)::int from learner_events_30d),
    'flashcards30d', (select count(*)::int from learner_events_30d where source = 'flashcard'),
    'quickChecks30d', (select count(*)::int from learner_events_30d where source = 'multiple_choice'),
    'examQuestions30d', (select count(*)::int from learner_events_30d where source = 'exam_question'),
    'examAttempts30d', (select count(*)::int from learner_events_30d where source = 'exam_attempt'),
    'modulesWithEvidence30d', (select count(distinct module_id)::int from learner_events_30d),
    'topicsWithEvidence30d', (select count(distinct module_id || ':' || topic_id)::int from learner_events_30d),
    'latestEventAt', (select max(occurred_at) from learner_events_30d),
    'daily14d', coalesce((
      select jsonb_agg(jsonb_build_object('date', day, 'count', count) order by day)
      from activity_series
    ), '[]'::jsonb),
    'modules30d', coalesce((
      select jsonb_agg(jsonb_build_object('moduleId', module_id, 'count', count) order by count desc, module_id)
      from module_activity
    ), '[]'::jsonb)
  )
);
$$;

comment on function public.admin_operations_metrics() is
  'Aggregate learner-account and learning-activity metrics for the protected Revision Admin dashboard. Test and admin accounts are excluded from learner engagement metrics.';

revoke all on function public.admin_operations_metrics() from public;
revoke all on function public.admin_operations_metrics() from anon;
revoke all on function public.admin_operations_metrics() from authenticated;
grant execute on function public.admin_operations_metrics() to service_role;

commit;

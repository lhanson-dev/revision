begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

select ok(
  (select relrowsecurity from pg_class where oid = 'public.learner_plan_state'::regclass),
  'learner_plan_state has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.learner_plan_assignment_events'::regclass),
  'learner_plan_assignment_events has RLS enabled'
);

select policies_are(
  'public',
  'learner_plan_state',
  array['users_select_own_learner_plan_state'],
  'learner plan state exposes only the authenticated owner read policy'
);
select is(
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'learner_plan_assignment_events'),
  0::bigint,
  'learner plan assignment audit has no browser RLS policy'
);

select ok(not has_table_privilege('anon', 'public.learner_plan_state', 'select'), 'anonymous cannot read learner plan state');
select ok(has_table_privilege('authenticated', 'public.learner_plan_state', 'select'), 'authenticated can select own learner plan state subject to RLS');
select ok(not has_table_privilege('authenticated', 'public.learner_plan_state', 'insert'), 'authenticated cannot insert learner plan state');
select ok(not has_table_privilege('authenticated', 'public.learner_plan_state', 'update'), 'authenticated cannot update learner plan state');
select ok(not has_table_privilege('authenticated', 'public.learner_plan_state', 'delete'), 'authenticated cannot delete learner plan state');

select ok(not has_table_privilege('anon', 'public.learner_plan_assignment_events', 'select'), 'anonymous cannot read learner plan assignment audit');
select ok(not has_table_privilege('authenticated', 'public.learner_plan_assignment_events', 'select'), 'authenticated cannot read learner plan assignment audit');
select ok(not has_table_privilege('authenticated', 'public.learner_plan_assignment_events', 'insert'), 'authenticated cannot insert learner plan assignment audit');
select ok(not has_table_privilege('authenticated', 'public.learner_plan_assignment_events', 'update'), 'authenticated cannot update learner plan assignment audit');
select ok(not has_table_privilege('authenticated', 'public.learner_plan_assignment_events', 'delete'), 'authenticated cannot delete learner plan assignment audit');

select ok(has_table_privilege('service_role', 'public.learner_plan_state', 'select'), 'service role can read learner plan state after protected Admin authorization');
select ok(has_table_privilege('service_role', 'public.learner_plan_state', 'insert'), 'service role can create learner plan state after protected Admin authorization');
select ok(has_table_privilege('service_role', 'public.learner_plan_state', 'update'), 'service role can update learner plan state after protected Admin authorization');
select ok(not has_table_privilege('service_role', 'public.learner_plan_state', 'delete'), 'service role cannot delete learner plan state');
select ok(has_table_privilege('service_role', 'public.learner_plan_assignment_events', 'select'), 'service role can read learner plan assignment audit');
select ok(has_table_privilege('service_role', 'public.learner_plan_assignment_events', 'insert'), 'service role can append learner plan assignment audit');
select ok(not has_table_privilege('service_role', 'public.learner_plan_assignment_events', 'update'), 'service role cannot rewrite learner plan assignment audit');
select ok(not has_table_privilege('service_role', 'public.learner_plan_assignment_events', 'delete'), 'service role cannot delete learner plan assignment audit');

select ok(
  not has_function_privilege('authenticated', 'public.assign_learner_plan(uuid,text,uuid)', 'execute'),
  'authenticated cannot execute protected learner plan assignment RPC'
);
select ok(
  has_function_privilege('service_role', 'public.assign_learner_plan(uuid,text,uuid)', 'execute'),
  'service role can execute learner plan assignment RPC after protected Admin authorization'
);
select ok(
  not (select prosecdef from pg_proc where oid = 'public.assign_learner_plan(uuid,text,uuid)'::regprocedure),
  'learner plan assignment RPC runs as SECURITY INVOKER'
);
select is(
  (
    select count(*)
    from pg_trigger
    where tgrelid = 'auth.users'::regclass
      and tgname = 'revision_create_learner_plan_after_auth_user'
      and not tgisinternal
  ),
  1::bigint,
  'Auth user creation has exactly one FI-022 learner plan trigger'
);

insert into auth.users (id, email) values
  ('30000000-0000-4000-8000-000000000003', 'plan-user-1@revision.invalid'),
  ('40000000-0000-4000-8000-000000000004', 'plan-user-2@revision.invalid');

select is(
  (
    select count(*)
    from public.learner_plan_state
    where user_id in (
      '30000000-0000-4000-8000-000000000003',
      '40000000-0000-4000-8000-000000000004'
    )
      and tier = 'free'
      and assignment_source = 'registration_default'
      and assigned_by is null
  ),
  2::bigint,
  'new Auth users receive exactly one Free registration-default plan state'
);

set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000003';

select is(
  (select count(*) from public.learner_plan_state),
  1::bigint,
  'authenticated learner can read only their own plan state'
);
select is(
  (select tier from public.learner_plan_state where user_id = '30000000-0000-4000-8000-000000000003'),
  'free',
  'authenticated learner sees their Free default plan'
);

reset role;

set local role service_role;
select lives_ok(
  $$select * from public.assign_learner_plan(
    '30000000-0000-4000-8000-000000000003',
    'paid',
    '40000000-0000-4000-8000-000000000004'
  )$$,
  'protected service role can assign a learner plan'
);
select throws_ok(
  $$select * from public.assign_learner_plan(
    '30000000-0000-4000-8000-000000000003',
    'invalid',
    '40000000-0000-4000-8000-000000000004'
  )$$,
  '22023',
  'Invalid learner plan tier',
  'invalid learner plan tier is rejected by the database operation'
);
reset role;

select is(
  (select tier from public.learner_plan_state where user_id = '30000000-0000-4000-8000-000000000003'),
  'paid',
  'manual assignment persists the requested tier'
);
select is(
  (select assignment_source from public.learner_plan_state where user_id = '30000000-0000-4000-8000-000000000003'),
  'admin_manual',
  'manual assignment records admin_manual provenance on current plan state'
);
select is(
  (select assigned_by from public.learner_plan_state where user_id = '30000000-0000-4000-8000-000000000003'),
  '40000000-0000-4000-8000-000000000004'::uuid,
  'manual assignment records the assigning actor'
);
select is(
  (
    select count(*)
    from public.learner_plan_assignment_events
    where user_id = '30000000-0000-4000-8000-000000000003'
      and previous_tier = 'free'
      and tier = 'paid'
      and assigned_by = '40000000-0000-4000-8000-000000000004'
  ),
  1::bigint,
  'manual assignment appends immutable audit provenance'
);

select is(
  public.revision_release_readiness()->>'contract',
  'plan-state-v1',
  'release readiness advertises the FI-022 plan-state-v1 contract'
);
select ok(
  (public.revision_release_readiness()->>'ready')::boolean,
  'release readiness reports all FI-022 database capabilities present after migration replay'
);
select ok(
  (public.revision_release_readiness()->'checks'->>'learnerPlanState')::boolean,
  'release readiness explicitly confirms learner plan state capability'
);
select ok(
  (public.revision_release_readiness()->'checks'->>'assignLearnerPlan')::boolean,
  'release readiness explicitly confirms protected assignment RPC capability'
);

select * from finish();
rollback;

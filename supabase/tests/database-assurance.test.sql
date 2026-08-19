begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(19);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.learning_evidence'::regclass),
  'learning_evidence has RLS enabled'
);

select policies_are(
  'public',
  'learning_evidence',
  array['users_insert_own_learning_evidence', 'users_select_own_learning_evidence'],
  'learning_evidence exposes only the declared owner policies'
);

select ok(not has_table_privilege('anon', 'public.learning_evidence', 'select'), 'anonymous cannot read learning evidence');
select ok(has_table_privilege('authenticated', 'public.learning_evidence', 'select'), 'authenticated can select learning evidence subject to RLS');
select ok(has_table_privilege('authenticated', 'public.learning_evidence', 'insert'), 'authenticated can insert learning evidence subject to RLS');
select ok(not has_table_privilege('authenticated', 'public.learning_evidence', 'update'), 'learning evidence remains append-only for authenticated users');
select ok(not has_table_privilege('authenticated', 'public.learning_evidence', 'delete'), 'learning evidence cannot be deleted by authenticated users');

select is(
  (
    select count(*)
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in (
        'revision_assessments',
        'revision_availability_profiles',
        'revision_availability_exceptions',
        'revision_planning_preferences',
        'revision_activity_events'
      )
      and c.relrowsecurity
  ),
  5::bigint,
  'all five planner persistence tables have RLS enabled'
);

select is(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'revision_assessments',
        'revision_availability_profiles',
        'revision_availability_exceptions',
        'revision_planning_preferences',
        'revision_activity_events'
      )
      and roles = array['authenticated']::name[]
      and qual like '%auth.uid()%user_id%'
      and with_check like '%auth.uid()%user_id%'
  ),
  5::bigint,
  'planner tables have authenticated owner-scoped USING and WITH CHECK policies'
);

select ok(not has_function_privilege('authenticated', 'public.admin_operations_metrics()', 'execute'), 'authenticated cannot execute admin operations aggregate');
select ok(has_function_privilege('service_role', 'public.admin_operations_metrics()', 'execute'), 'service role can execute admin operations aggregate');
select ok(not has_function_privilege('authenticated', 'public.admin_planner_metrics()', 'execute'), 'authenticated cannot execute planner admin aggregate');
select ok(has_function_privilege('service_role', 'public.admin_planner_metrics()', 'execute'), 'service role can execute planner admin aggregate');

insert into auth.users (id, email) values
  ('10000000-0000-4000-8000-000000000001', 'rls-user-1@revision.invalid'),
  ('20000000-0000-4000-8000-000000000002', 'rls-user-2@revision.invalid');

insert into public.learning_evidence (
  user_id, evidence_id, module_id, topic_id, source, occurred_at, content_id, payload
) values
  ('10000000-0000-4000-8000-000000000001', 'user-1-existing', 'module-a', 'topic-a', 'flashcard', now(), 'card-a', '{}'::jsonb),
  ('20000000-0000-4000-8000-000000000002', 'user-2-existing', 'module-b', 'topic-b', 'flashcard', now(), 'card-b', '{}'::jsonb);

set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000001';

select results_eq(
  $$select count(*) from public.learning_evidence$$,
  array[1::bigint],
  'learner can read only their own learning evidence'
);

select lives_ok(
  $$insert into public.learning_evidence (user_id, evidence_id, module_id, topic_id, source, occurred_at, content_id, payload)
    values ('10000000-0000-4000-8000-000000000001', 'user-1-own', 'module-a', 'topic-a', 'multiple_choice', now(), 'question-a', '{}'::jsonb)$$,
  'learner can insert their own learning evidence'
);

select throws_ok(
  $$insert into public.learning_evidence (user_id, evidence_id, module_id, topic_id, source, occurred_at, content_id, payload)
    values ('20000000-0000-4000-8000-000000000002', 'cross-user-attempt', 'module-b', 'topic-b', 'multiple_choice', now(), 'question-b', '{}'::jsonb)$$,
  '42501',
  'new row violates row-level security policy for table "learning_evidence"',
  'learner cannot insert learning evidence for another user'
);

select lives_ok(
  $$insert into public.revision_assessments (user_id, subject_id, assessment_type, title, assessment_date)
    values ('10000000-0000-4000-8000-000000000001', 'business', 'mock', 'Own mock', current_date + 7)$$,
  'learner can create their own planner assessment'
);

select throws_ok(
  $$insert into public.revision_assessments (user_id, subject_id, assessment_type, title, assessment_date)
    values ('20000000-0000-4000-8000-000000000002', 'business', 'mock', 'Cross-user mock', current_date + 7)$$,
  '42501',
  'new row violates row-level security policy for table "revision_assessments"',
  'learner cannot create planner data for another user'
);

reset role;

select ok(has_function_privilege('anon', 'public.revision_release_readiness()', 'execute'), 'publishable/anonymous role can read the non-sensitive release readiness contract');

select * from finish();
rollback;

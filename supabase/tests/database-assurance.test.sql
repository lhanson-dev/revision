begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(54);

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

select ok(
  (select relrowsecurity from pg_class where oid = 'public.learner_courses'::regclass),
  'learner_courses has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.learner_course_events'::regclass),
  'learner_course_events has RLS enabled'
);

select policies_are(
  'public',
  'learner_courses',
  array['users_manage_own_learner_courses'],
  'learner_courses exposes only the authenticated owner policy'
);
select policies_are(
  'public',
  'learner_course_events',
  array['users_insert_own_learner_course_events', 'users_select_own_learner_course_events'],
  'learner course telemetry exposes only own-row insert/select policies'
);

select ok(not has_table_privilege('anon', 'public.learner_courses', 'select'), 'anonymous cannot read learner course membership');
select ok(has_table_privilege('authenticated', 'public.learner_courses', 'select'), 'authenticated can select learner course membership subject to RLS');
select ok(has_table_privilege('authenticated', 'public.learner_courses', 'insert'), 'authenticated can insert learner course membership subject to RLS');
select ok(has_table_privilege('authenticated', 'public.learner_courses', 'delete'), 'authenticated can delete learner course membership subject to RLS');
select ok(not has_table_privilege('authenticated', 'public.learner_courses', 'update'), 'learner course membership is not updateable by browser roles');

select ok(not has_table_privilege('anon', 'public.learner_course_events', 'select'), 'anonymous cannot read learner course events');
select ok(has_table_privilege('authenticated', 'public.learner_course_events', 'select'), 'authenticated can select own learner course events subject to RLS');
select ok(has_table_privilege('authenticated', 'public.learner_course_events', 'insert'), 'authenticated can insert own learner course events subject to RLS');
select ok(not has_table_privilege('authenticated', 'public.learner_course_events', 'update'), 'learner course events are not updateable by browser roles');
select ok(not has_table_privilege('authenticated', 'public.learner_course_events', 'delete'), 'learner course events are not deletable by browser roles');

select ok(has_table_privilege('service_role', 'public.learner_courses', 'select'), 'service role can read learner course membership for protected operations');
select ok(not has_table_privilege('service_role', 'public.learner_courses', 'insert'), 'service role is not granted learner course insert through FI-020');
select ok(not has_table_privilege('service_role', 'public.learner_courses', 'update'), 'service role is not granted learner course update through FI-020');
select ok(not has_table_privilege('service_role', 'public.learner_courses', 'delete'), 'service role is not granted learner course delete through FI-020');
select ok(has_table_privilege('service_role', 'public.learner_course_events', 'select'), 'service role can read learner course events for protected assurance');
select ok(not has_table_privilege('service_role', 'public.learner_course_events', 'insert'), 'service role is not granted learner course event insert through FI-020');
select ok(not has_table_privilege('service_role', 'public.learner_course_events', 'update'), 'service role is not granted learner course event update through FI-020');
select ok(not has_table_privilege('service_role', 'public.learner_course_events', 'delete'), 'service role is not granted learner course event delete through FI-020');

select ok(
  (
    select pg_get_constraintdef(oid)
    from pg_constraint
    where conrelid = 'public.learner_courses'::regclass
      and contype = 'p'
  ) like '%PRIMARY KEY (user_id, course_id)%',
  'learner course membership primary key is duplicate-safe across user and course'
);

insert into auth.users (id, email) values
  ('10000000-0000-4000-8000-000000000001', 'rls-user-1@revision.invalid'),
  ('20000000-0000-4000-8000-000000000002', 'rls-user-2@revision.invalid');

insert into public.learning_evidence (
  user_id, evidence_id, module_id, topic_id, source, occurred_at, content_id, payload
) values
  ('10000000-0000-4000-8000-000000000001', 'user-1-existing', 'module-a', 'topic-a', 'flashcard', now(), 'card-a', '{}'::jsonb),
  ('20000000-0000-4000-8000-000000000002', 'user-2-existing', 'module-b', 'topic-b', 'flashcard', now(), 'card-b', '{}'::jsonb);

insert into public.learner_courses (user_id, course_id) values
  ('10000000-0000-4000-8000-000000000001', 'aqa:aqa-as:7131'),
  ('20000000-0000-4000-8000-000000000002', 'aqa:aqa-a-level:7132');

insert into public.learner_course_events (user_id, event_type, course_id) values
  ('20000000-0000-4000-8000-000000000002', 'course_added', 'aqa:aqa-a-level:7132');

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

select results_eq(
  $$select count(*) from public.learner_courses$$,
  array[1::bigint],
  'learner can read only their own active course membership'
);

select lives_ok(
  $$insert into public.learner_courses (user_id, course_id)
    values ('10000000-0000-4000-8000-000000000001', 'aqa:aqa-a-level:7132')$$,
  'learner can add a course to their own programme'
);

select throws_ok(
  $$insert into public.learner_courses (user_id, course_id)
    values ('20000000-0000-4000-8000-000000000002', 'aqa:aqa-as:7131')$$,
  '42501',
  'new row violates row-level security policy for table "learner_courses"',
  'learner cannot add a course to another learner programme'
);

select lives_ok(
  $$delete from public.learner_courses
    where user_id = '10000000-0000-4000-8000-000000000001'
      and course_id = 'aqa:aqa-a-level:7132'$$,
  'learner can remove a course from their own programme'
);

select lives_ok(
  $$delete from public.learner_courses
    where user_id = '20000000-0000-4000-8000-000000000002'
      and course_id = 'aqa:aqa-a-level:7132'$$,
  'cross-user delete attempt is safely filtered by RLS'
);

select lives_ok(
  $$insert into public.learner_course_events (user_id, event_type, course_id)
    values ('10000000-0000-4000-8000-000000000001', 'course_added', 'aqa:aqa-as:7131')$$,
  'learner can insert their own course-management telemetry'
);

select throws_ok(
  $$insert into public.learner_course_events (user_id, event_type, course_id)
    values ('20000000-0000-4000-8000-000000000002', 'course_removed', 'aqa:aqa-a-level:7132')$$,
  '42501',
  'new row violates row-level security policy for table "learner_course_events"',
  'learner cannot insert telemetry for another learner'
);

select results_eq(
  $$select count(*) from public.learner_course_events$$,
  array[1::bigint],
  'learner reads only their own course-management telemetry'
);

reset role;

select is(
  (select count(*) from public.learner_courses where user_id = '20000000-0000-4000-8000-000000000002'),
  1::bigint,
  'cross-user course removal attempt did not remove the other learner membership'
);

select is(
  public.revision_release_readiness()->>'contract',
  'courses-v1',
  'release readiness advertises the FI-020 courses-v1 contract'
);
select ok(
  (public.revision_release_readiness()->>'ready')::boolean,
  'release readiness reports all courses-v1 database capabilities present after migration replay'
);

select ok(has_function_privilege('anon', 'public.revision_release_readiness()', 'execute'), 'publishable/anonymous role can read the non-sensitive release readiness contract');
select ok(
  not (select prosecdef from pg_proc where oid = 'public.revision_release_readiness()'::regprocedure),
  'release readiness RPC runs as SECURITY INVOKER'
);

select * from finish();
rollback;
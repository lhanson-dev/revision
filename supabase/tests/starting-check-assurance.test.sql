begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(13);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.starting_check_evidence'::regclass),
  'starting_check_evidence has RLS enabled'
);

select policies_are(
  'public',
  'starting_check_evidence',
  array['users_insert_own_starting_check_evidence', 'users_select_own_starting_check_evidence'],
  'starting-check evidence exposes only owner-scoped insert/select policies'
);

select ok(not has_table_privilege('anon', 'public.starting_check_evidence', 'select'), 'anonymous cannot read starting-check evidence');
select ok(has_table_privilege('authenticated', 'public.starting_check_evidence', 'select'), 'authenticated can select starting-check evidence subject to RLS');
select ok(has_table_privilege('authenticated', 'public.starting_check_evidence', 'insert'), 'authenticated can insert starting-check evidence subject to RLS');
select ok(not has_table_privilege('authenticated', 'public.starting_check_evidence', 'update'), 'starting-check evidence is append-only');
select ok(not has_table_privilege('authenticated', 'public.starting_check_evidence', 'delete'), 'starting-check evidence cannot be deleted by learners');

insert into auth.users (id, email) values
  ('30000000-0000-4000-8000-000000000003', 'starting-check-user-1@revision.invalid'),
  ('40000000-0000-4000-8000-000000000004', 'starting-check-user-2@revision.invalid');

insert into public.starting_check_evidence (
  user_id, evidence_id, module_id, topic_id, question_id, occurred_at, payload
) values
  ('30000000-0000-4000-8000-000000000003', 'existing-1', 'module-a', 'topic-a', 'question-a', now(), '{}'::jsonb),
  ('40000000-0000-4000-8000-000000000004', 'existing-2', 'module-b', 'topic-b', 'question-b', now(), '{}'::jsonb);

set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000003';

select results_eq(
  $$select count(*) from public.starting_check_evidence$$,
  array[1::bigint],
  'learner can read only their own starting-check evidence'
);

select lives_ok(
  $$insert into public.starting_check_evidence (user_id, evidence_id, module_id, topic_id, question_id, occurred_at, payload)
    values ('30000000-0000-4000-8000-000000000003', 'own-new', 'module-a', 'topic-a', 'question-c', now(), '{}'::jsonb)$$,
  'learner can insert their own starting-check evidence'
);

select throws_ok(
  $$insert into public.starting_check_evidence (user_id, evidence_id, module_id, topic_id, question_id, occurred_at, payload)
    values ('40000000-0000-4000-8000-000000000004', 'cross-user', 'module-b', 'topic-b', 'question-d', now(), '{}'::jsonb)$$,
  '42501',
  'new row violates row-level security policy for table "starting_check_evidence"',
  'learner cannot insert starting-check evidence for another user'
);

reset role;

select is(
  (select count(*) from public.learning_evidence where user_id in ('30000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000004')),
  0::bigint,
  'starting-check observations remain structurally separate from ordinary learning evidence'
);

select is(
  (select count(*) from public.starting_check_evidence where user_id = '40000000-0000-4000-8000-000000000004'),
  1::bigint,
  'cross-user insert attempt did not create another learner row'
);

select * from finish();
rollback;

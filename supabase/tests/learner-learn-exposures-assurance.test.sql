begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(13);
select ok((select relrowsecurity from pg_class where oid = 'public.learner_learn_exposures'::regclass), 'Learn exposure table has RLS enabled');
select policies_are('public','learner_learn_exposures',array['users_select_own_learn_exposures','users_insert_own_learn_exposures'], 'Only owner-scoped policies exist');
select ok(not has_table_privilege('anon','public.learner_learn_exposures','select'), 'Anonymous cannot read exposure');
select ok(has_table_privilege('authenticated','public.learner_learn_exposures','select'), 'Authenticated can read own exposure with RLS');
select ok(has_table_privilege('authenticated','public.learner_learn_exposures','insert'), 'Authenticated can insert own exposure with RLS');
select ok(not has_table_privilege('authenticated','public.learner_learn_exposures','update'), 'Student cannot rewrite reviewed evidence');
select ok(not has_table_privilege('authenticated','public.learner_learn_exposures','delete'), 'Student cannot delete reviewed evidence');

insert into auth.users (id,email) values
 ('00000000-0000-4000-8000-0000000000b1','learn-a@revision.invalid'),
 ('00000000-0000-4000-8000-0000000000b2','learn-b@revision.invalid');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-0000000000b1';
select lives_ok(
 $$insert into public.learner_learn_exposures (user_id,course_id,module_id,topic_id,page_id)
   values ('00000000-0000-4000-8000-0000000000b1','aqa:aqa-a-level:7132','business-aqa-7132-paper-1','finance','learn-page-1')$$,
 'Learner can confirm reviewed page in own course');
select lives_ok(
 $$insert into public.learner_learn_exposures (user_id,course_id,module_id,topic_id,page_id)
   values ('00000000-0000-4000-8000-0000000000b1','aqa:aqa-a-level:7132','business-aqa-7132-paper-1','finance','learn-page-1')
   on conflict do nothing$$,
 'Retry does not create another reviewed fact');
select throws_ok(
 $$insert into public.learner_learn_exposures (user_id,course_id,module_id,topic_id,page_id)
   values ('00000000-0000-4000-8000-0000000000b2','aqa:aqa-a-level:7182','psychology-other','memory','learn-page-2')$$,
 '42501','new row violates row-level security policy for table "learner_learn_exposures"',
 'Learner cannot save evidence for another user');
select is((select count(*) from public.learner_learn_exposures),1::bigint, 'Owner sees exactly one durable reviewed fact');

set local request.jwt.claim.sub = '00000000-0000-4000-8000-0000000000b2';
select is((select count(*) from public.learner_learn_exposures),0::bigint, 'Other learner cannot view another learner review');
select throws_ok(
 $delete from public.learner_learn_exposures where page_id='learn-page-1'$,
 '42501',null,'Other user cannot delete another user review');
select * from finish();
rollback;

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(17);

select ok((select relrowsecurity from pg_class where oid='public.learner_practice_checkpoints'::regclass), 'Practice checkpoints require RLS');
select policies_are('public','learner_practice_checkpoints',array[
  'learner_select_own_practice_checkpoints','learner_insert_own_practice_checkpoints',
  'learner_update_own_practice_checkpoints','learner_delete_own_practice_checkpoints'
], 'Only the four owner-scoped policies exist');
select ok(not has_table_privilege('anon','public.learner_practice_checkpoints','SELECT'),'anonymous cannot read Practice drafts');
select ok(not has_table_privilege('anon','public.learner_practice_checkpoints','INSERT'),'anonymous cannot insert Practice drafts');
select ok(not has_table_privilege('service_role','public.learner_practice_checkpoints','SELECT'),'service role has no standing Practice-draft access');
select ok(has_table_privilege('authenticated','public.learner_practice_checkpoints','SELECT'),'signed-in learner can select own session');
select ok(has_table_privilege('authenticated','public.learner_practice_checkpoints','INSERT'),'signed-in learner can create own session');
select ok(has_table_privilege('authenticated','public.learner_practice_checkpoints','UPDATE'),'signed-in learner can update own session');
select ok(has_table_privilege('authenticated','public.learner_practice_checkpoints','DELETE'),'signed-in learner can discard own session');

insert into auth.users(id,email) values
  ('00000000-0000-4000-8000-0000000000b1','practice-a@revision.invalid'),
  ('00000000-0000-4000-8000-0000000000b2','practice-b@revision.invalid');

set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-0000000000b1';

select lives_ok($$
  insert into public.learner_practice_checkpoints
    (user_id,course_id,module_id,topic_id,session_id,content_fingerprint,snapshot)
  values
    ('00000000-0000-4000-8000-0000000000b1','aqa:aqa-a-level:7132',
     'business-7132-paper-1','marketing','11111111-1111-4111-8111-111111111111',
     repeat('a',64),'{"schemaVersion":1,"session":{"total":2}}'::jsonb)
$$,'owner can store a minimal unscored checkpoint');
select throws_ok($$
  insert into public.learner_practice_checkpoints
    (user_id,course_id,module_id,topic_id,session_id,content_fingerprint,snapshot)
  values
    ('00000000-0000-4000-8000-0000000000b2','aqa:aqa-a-level:7132',
     'business-7132-paper-1','marketing','22222222-2222-4222-8222-222222222222',
     repeat('a',64),'{"schemaVersion":1}'::jsonb)
$$,'42501','new row violates row-level security policy for table "learner_practice_checkpoints"',
  'learner cannot insert another learner checkpoint');
select is((select count(*) from public.learner_practice_checkpoints),1::bigint,'learner sees only own checkpoint');
select lives_ok($$update public.learner_practice_checkpoints set revision=2 where topic_id='marketing'$$,'owner may update own revision');

set local request.jwt.claim.sub='00000000-0000-4000-8000-0000000000b2';
select is((select count(*) from public.learner_practice_checkpoints),0::bigint,'different learner cannot read Practice checkpoint');
select lives_ok($$update public.learner_practice_checkpoints set revision=3 where topic_id='marketing'$$,'other learner cannot affect checkpoint through update');
select lives_ok($$delete from public.learner_practice_checkpoints where topic_id='marketing'$$,'other learner cannot affect checkpoint through delete');

reset role;
select is((select revision from public.learner_practice_checkpoints where user_id='00000000-0000-4000-8000-0000000000b1'),2::bigint,'owner data survives attempted cross-learner mutations');

select * from finish();
rollback;

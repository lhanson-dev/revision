begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(13);

select ok(has_function_privilege('supabase_auth_admin', 'public.revision_before_user_created(jsonb)','execute'),
  'Auth server can invoke private admission hook');
select ok(has_schema_privilege('supabase_auth_admin', 'extensions', 'usage'),
  'Auth server can execute pgcrypto HMAC without a 500 hook error');
select ok(not has_function_privilege('anon','public.revision_before_user_created(jsonb)','execute'),
  'anonymous Data API cannot invoke the hook directly');
select ok(not has_table_privilege('authenticated','revision_private.family_signup_control','SELECT'),
  'learners cannot read admission secret');
select ok(not has_table_privilege('anon','revision_private.family_signup_control','SELECT'),
  'unauthenticated callers cannot read admission secret');

create temp table private_test_input(event jsonb);
insert into private_test_input
select jsonb_build_object('user', jsonb_build_object('email', 'TEST@example.invalid',
  'app_metadata', jsonb_build_object('provider','email'),
  'user_metadata', jsonb_build_object('revision_signup_minute',
       floor(extract(epoch from clock_timestamp()) / 60)::bigint,
       'revision_signup_proof', encode(extensions.hmac(
         pg_catalog.convert_to('revision:private-signup:v1:test@example.invalid:' ||
           floor(extract(epoch from clock_timestamp()) / 60)::bigint, 'UTF8'),
         pg_catalog.convert_to(signup_code, 'UTF8'), 'sha256'), 'hex'))))
from revision_private.family_signup_control;

select ok((public.revision_before_user_created((select event from private_test_input)) -> 'error') is not null,
  'private admission disabled by default blocks even a correctly signed proof');
update revision_private.family_signup_control set enabled=true;

-- pgTAP runs under the isolated test database role (which cannot SET ROLE
-- supabase_auth_admin). Explicit grant assertions above verify hook eligibility.
select is(public.revision_before_user_created((select event from private_test_input)),
  '{}'::jsonb,'enabled hook admits correct signed proof for ordinary email signup');
select ok((public.revision_before_user_created(
  (select jsonb_set(event,'{user,user_metadata,revision_signup_proof}','"fake"'::jsonb)
   from private_test_input))->'error') is not null,'forged proof is denied');
select ok((public.revision_before_user_created(
  (select jsonb_set(event,'{user,email}','"other@example.invalid"'::jsonb)
   from private_test_input))->'error') is not null,'proof cannot be reused for another email');
select ok((public.revision_before_user_created(
  (select jsonb_set(event,'{user,user_metadata,revision_signup_minute}',
      to_jsonb(floor(extract(epoch from clock_timestamp()) / 60)::bigint - 20))
   from private_test_input))->'error') is not null,'expired proof is denied');
select ok((public.revision_before_user_created(
  (select event #- '{user,user_metadata,revision_signup_proof}' from private_test_input)
  )->'error') is not null,'missing admission proof is denied');
select ok((public.revision_before_user_created(
  (select jsonb_set(event,'{user,app_metadata,provider}','"google"'::jsonb)
   from private_test_input))->'error') is not null,'new Google OAuth accounts cannot bypass private admission');
select ok((public.revision_before_user_created(
  (select jsonb_set(event,'{user,is_anonymous}','true'::jsonb)
   from private_test_input))->'error') is not null,'anonymous Auth signups cannot use private admission');
select * from finish();
rollback;

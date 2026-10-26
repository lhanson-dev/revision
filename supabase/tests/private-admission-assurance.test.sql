begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(8);

select ok(has_function_privilege('supabase_auth_admin', 'public.revision_before_user_created(jsonb)', 'execute'),
  'Supabase Auth can invoke the existing provider hook');
select ok(not has_function_privilege('anon','public.revision_before_user_created(jsonb)','execute'),
  'anonymous Data API cannot invoke the hook itself');
select ok(not has_function_privilege('authenticated','public.revision_before_user_created(jsonb)','execute'),
  'learners cannot invoke the hook directly');
select ok(not has_table_privilege('authenticated','revision_private.family_signup_control','SELECT'),
  'old private secret cannot be read by authenticated learners');
select ok(not has_table_privilege('anon','revision_private.family_signup_control','SELECT'),
  'old private secret cannot be read by anonymous API callers');
select is(public.revision_before_user_created('{"user":{"email":"test@example.invalid","app_metadata":{"provider":"email"}}}'::jsonb),
  '{}'::jsonb, 'standard email registration succeeds without any proof');
select is(public.revision_before_user_created('{"user":{"email":"test@example.invalid","app_metadata":{"provider":"google"}}}'::jsonb),
  '{}'::jsonb, 'existing enabled OAuth signup does not require an invitation code');
select is(public.revision_before_user_created('{"user":{"email":"test@example.invalid","user_metadata":{"revision_signup_proof":"invalid"}}}'::jsonb),
  '{}'::jsonb, 'legacy proof metadata does not control registration');
select * from finish();
rollback;

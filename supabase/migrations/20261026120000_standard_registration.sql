-- #665: Remove the private registration-code requirement from normal Auth.
-- The hosted Supabase Before User Created hook remains attached. It must return
-- an empty successful response so email signup is not denied during cutover.
-- Do not change access to learner data; row-level ownership and expiry still apply.
begin;
create or replace function public.revision_before_user_created(event jsonb)
returns jsonb language plpgsql security invoker set search_path = ''
as $hook$
begin
  return '{}'::jsonb;
end;
$hook$;
revoke all on function public.revision_before_user_created(jsonb) from public, anon, authenticated;
grant execute on function public.revision_before_user_created(jsonb) to supabase_auth_admin;
comment on function public.revision_before_user_created(jsonb) is
  'Normal registration is allowed by the hosted Auth hook. No private code or learner feature flag is required.';
commit;

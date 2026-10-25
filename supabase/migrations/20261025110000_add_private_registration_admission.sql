-- #665: a SINGLE server-enforced *signup admission* boundary, not feature flags.
-- Install the function dormant. Enable the Auth hook and access window only
-- after owner approval, privacy pre-use review, and isolated evidence.
begin;
create extension if not exists pgcrypto with schema extensions;

create schema if not exists revision_private;
revoke all on schema revision_private from public, anon, authenticated;
grant usage on schema revision_private to supabase_auth_admin;
-- The hook executes extensions.hmac() as supabase_auth_admin (SECURITY INVOKER).
-- Without USAGE on extensions, GoTrue returns HTTP 500 for every signed proof.
grant usage on schema extensions to supabase_auth_admin;

create table revision_private.family_signup_control (
  singleton boolean primary key default true check(singleton),
  signup_code text not null check(signup_code ~ '^[0-9a-f]{32}$'),
  enabled boolean not null default false,
  created_at timestamptz not null default now()
);
revoke all on revision_private.family_signup_control from public, anon, authenticated;
grant select on revision_private.family_signup_control to supabase_auth_admin;
alter table revision_private.family_signup_control enable row level security;
create policy "auth_hook_can_read_private_admission" on revision_private.family_signup_control
  for select to supabase_auth_admin using (true);
-- Create one secret on installation, once per project, never in the Git repo.
-- It must be distributed privately only via an operator's secure channel.
insert into revision_private.family_signup_control(singleton, signup_code, enabled)
values (true, encode(extensions.gen_random_bytes(16), 'hex'), false)
on conflict (singleton) do nothing;

create function public.revision_before_user_created(event jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $hook$
declare
  email text := lower(trim(coalesce(event->'user'->>'email', '')));
  provider text := coalesce(event->'user'->'app_metadata'->>'provider', '');
  minute_text text := event->'user'->'user_metadata'->>'revision_signup_minute';
  proof text := event->'user'->'user_metadata'->>'revision_signup_proof';
  secret text;
  currently_enabled boolean;
  target_minute bigint;
  current_minute bigint := floor(extract(epoch from clock_timestamp()) / 60)::bigint;
  expected_proof text;
  denied jsonb := '{"error":{"http_code":403,"message":"Private testing requires a valid registration code."}}'::jsonb;
begin
  -- Fail closed until an operator activates admission. Never accept a code
  -- merely because a caller supplied it in user-editable metadata.
  select signup_code, enabled into secret, currently_enabled
  from revision_private.family_signup_control where singleton = true;
  if not coalesce(currently_enabled, false) or provider <> 'email'
     or email = '' or coalesce(event->'user'->>'is_anonymous', 'false') = 'true'
     or minute_text is null or minute_text !~ '^[0-9]{8,12}$'
     or proof is null or proof !~ '^[0-9a-f]{64}$' then
    return denied;
  end if;

  target_minute := minute_text::bigint;
  if target_minute < current_minute - 2 or target_minute > current_minute + 1 then
    return denied;
  end if;

  expected_proof := encode(extensions.hmac(
    pg_catalog.convert_to('revision:private-signup:v1:' || email || ':' || target_minute, 'UTF8'),
    pg_catalog.convert_to(secret, 'UTF8'), 'sha256'), 'hex');
  if proof <> expected_proof then return denied; end if;
  return '{}'::jsonb;
end;
$hook$;
revoke all on function public.revision_before_user_created(jsonb) from public, anon, authenticated;
grant usage on schema public to supabase_auth_admin;
grant execute on function public.revision_before_user_created(jsonb) to supabase_auth_admin;
comment on function public.revision_before_user_created(jsonb) is
  'Private tester admission. Must be explicitly attached to Supabase Auth Before User Created hook. No effect on existing sign-ins; no per-account flags.';

commit;

-- Read-only verification queries for the first additive regularisation migration.
-- Run after applying the migration. These queries must not modify production data.

-- 1. Every auth user has exactly one profile row.
select
  (select count(*) from auth.users) as auth_users,
  (select count(*) from public.profiles) as profiles,
  (select count(*)
     from auth.users u
     left join public.profiles p on p.user_id = u.id
    where p.user_id is null) as users_missing_profile;

-- 2. Existing progress rows remain present and versioned.
select
  count(*) as progress_rows,
  count(*) filter (where schema_version = 1) as version_1_rows,
  count(*) filter (where schema_version is null or schema_version <= 0) as invalid_version_rows
from public.revision_progress;

-- 3. RLS is enabled on profiles.
select relrowsecurity as profiles_rls_enabled
from pg_class
where oid = 'public.profiles'::regclass;

-- 4. Only the expected learner policy exists on profiles.
select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'profiles'
order by policyname;

-- 5. Data API grants are explicit and least-privilege.
select
  has_table_privilege('anon', 'public.profiles', 'select') as anon_can_select,
  has_table_privilege('authenticated', 'public.profiles', 'select') as authenticated_can_select,
  has_table_privilege('authenticated', 'public.profiles', 'insert') as authenticated_can_insert,
  has_table_privilege('authenticated', 'public.profiles', 'update') as authenticated_can_update,
  has_table_privilege('authenticated', 'public.profiles', 'delete') as authenticated_can_delete,
  has_table_privilege('service_role', 'public.profiles', 'select') as service_role_can_select,
  has_table_privilege('service_role', 'public.profiles', 'update') as service_role_can_update,
  has_table_privilege('service_role', 'public.profiles', 'insert') as service_role_can_insert,
  has_table_privilege('service_role', 'public.profiles', 'delete') as service_role_can_delete;

-- 6. Signup trigger and private trigger function exist.
select tgname, tgenabled
from pg_trigger
where tgrelid = 'auth.users'::regclass
  and tgname = 'revision_create_profile_after_auth_user'
  and not tgisinternal;

select n.nspname as schema_name, p.proname, p.prosecdef
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'revision_private'
  and p.proname = 'handle_new_auth_user_profile';

-- 7. Existing revision_progress ownership policies remain present.
select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'revision_progress'
order by policyname;

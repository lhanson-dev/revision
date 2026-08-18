-- Read-only verification queries for database-backed Revision admin access.
-- Run after applying 20260818222500_add_admin_access.sql.

-- 1. Admin classification exists and remains non-null.
select
  count(*) as profile_rows,
  count(*) filter (where is_admin) as admin_rows,
  count(*) filter (where is_admin is null) as null_admin_rows
from public.profiles;

-- 2. The requested initial administrator is assigned when that auth user exists.
select
  u.email,
  p.is_admin
from auth.users u
join public.profiles p on p.user_id = u.id
where lower(u.email) = lower('leehanson@hotmail.com');

-- 3. Browser-authenticated users still cannot mutate profile classification.
select
  has_table_privilege('authenticated', 'public.profiles', 'select') as authenticated_can_select,
  has_table_privilege('authenticated', 'public.profiles', 'update') as authenticated_can_update,
  has_table_privilege('authenticated', 'public.profiles', 'insert') as authenticated_can_insert,
  has_table_privilege('authenticated', 'public.profiles', 'delete') as authenticated_can_delete;

-- 4. RLS remains enabled and the existing own-profile SELECT policy remains the only learner policy.
select relrowsecurity as profiles_rls_enabled
from pg_class
where oid = 'public.profiles'::regclass;

select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'profiles'
order by policyname;

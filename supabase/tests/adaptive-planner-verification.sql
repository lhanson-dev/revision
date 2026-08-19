-- Read-only verification queries for FI-001 adaptive planner persistence.
-- Run after applying 20260819123500_add_adaptive_planner_foundation.sql.

-- 1. Required planner tables exist and RLS is enabled.
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
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
order by c.relname;

-- 2. Anonymous clients have no table privileges.
select
  table_name,
  has_table_privilege('anon', format('public.%I', table_name), 'select') as anon_can_select,
  has_table_privilege('anon', format('public.%I', table_name), 'insert') as anon_can_insert,
  has_table_privilege('anon', format('public.%I', table_name), 'update') as anon_can_update,
  has_table_privilege('anon', format('public.%I', table_name), 'delete') as anon_can_delete
from (values
  ('revision_assessments'),
  ('revision_availability_profiles'),
  ('revision_availability_exceptions'),
  ('revision_planning_preferences'),
  ('revision_activity_events')
) as planner_tables(table_name);

-- 3. Authenticated clients have the CRUD privileges that are subsequently owner-scoped by RLS.
select
  table_name,
  has_table_privilege('authenticated', format('public.%I', table_name), 'select') as authenticated_can_select,
  has_table_privilege('authenticated', format('public.%I', table_name), 'insert') as authenticated_can_insert,
  has_table_privilege('authenticated', format('public.%I', table_name), 'update') as authenticated_can_update,
  has_table_privilege('authenticated', format('public.%I', table_name), 'delete') as authenticated_can_delete
from (values
  ('revision_assessments'),
  ('revision_availability_profiles'),
  ('revision_availability_exceptions'),
  ('revision_planning_preferences'),
  ('revision_activity_events')
) as planner_tables(table_name);

-- 4. Each learner-owned table has an authenticated owner-scoped policy.
select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'revision_assessments',
    'revision_availability_profiles',
    'revision_availability_exceptions',
    'revision_planning_preferences',
    'revision_activity_events'
  )
order by tablename, policyname;

-- 5. Planner context remains separate from objective learning evidence.
-- This query should return no foreign keys from planning preferences/activity events into learning_evidence.
select
  tc.table_name,
  tc.constraint_name,
  ccu.table_name as referenced_table
from information_schema.table_constraints tc
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
  and ccu.constraint_schema = tc.constraint_schema
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
  and tc.table_name in ('revision_planning_preferences', 'revision_activity_events')
  and ccu.table_name = 'learning_evidence';

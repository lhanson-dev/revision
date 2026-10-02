-- Read-only verification queries for public.learner_planned_sessions.
-- Migration: 20261002060000_add_learner_planned_sessions.sql
-- Run section A BEFORE applying (expect: table absent, migration not recorded).
-- Run section B AFTER applying (expect: every "ok" column true). None of these queries write anything.
-- Runbook: docs/technical/Learner Planned Sessions Production Runbook.md

-- ===== A. BEFORE applying =====

-- A1. The table must not already exist (expect 0 rows).
select c.relname
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'learner_planned_sessions';

-- A2. The migration must not already be recorded (expect 0 rows).
select version
from supabase_migrations.schema_migrations
where version = '20261002060000';

-- A3. The migrations before it are already applied (expect the latest version to be 20260927182844 or later, and no gap you do not recognise).
select version
from supabase_migrations.schema_migrations
order by version desc
limit 5;

-- ===== B. AFTER applying =====

-- B1. The table exists, row-level security is on, and it is empty.
select
  c.relrowsecurity as rls_enabled,
  (select count(*) from public.learner_planned_sessions) as row_count,
  c.relrowsecurity and (select count(*) from public.learner_planned_sessions) = 0 as ok
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'learner_planned_sessions';

-- B2. Exactly one policy, for authenticated users only, scoped to the owner (expect 1 row, ok = true).
select
  policyname,
  roles,
  cmd,
  qual,
  with_check,
  count(*) over () = 1
    and roles = '{authenticated}'
    and cmd = 'ALL'
    and qual like '%auth.uid()%user_id%'
    and with_check like '%auth.uid()%user_id%' as ok
from pg_policies
where schemaname = 'public' and tablename = 'learner_planned_sessions';

-- B3. Privileges: anon none, service_role none, authenticated select/insert/update/delete only (expect ok = true).
select
  has_table_privilege('anon', 'public.learner_planned_sessions', 'select') as anon_select,
  has_table_privilege('anon', 'public.learner_planned_sessions', 'insert') as anon_insert,
  has_table_privilege('service_role', 'public.learner_planned_sessions', 'select') as service_role_select,
  has_table_privilege('authenticated', 'public.learner_planned_sessions', 'select') as authenticated_select,
  has_table_privilege('authenticated', 'public.learner_planned_sessions', 'insert') as authenticated_insert,
  has_table_privilege('authenticated', 'public.learner_planned_sessions', 'update') as authenticated_update,
  has_table_privilege('authenticated', 'public.learner_planned_sessions', 'delete') as authenticated_delete,
  not has_table_privilege('anon', 'public.learner_planned_sessions', 'select')
    and not has_table_privilege('anon', 'public.learner_planned_sessions', 'insert')
    and not has_table_privilege('service_role', 'public.learner_planned_sessions', 'select')
    and has_table_privilege('authenticated', 'public.learner_planned_sessions', 'select')
    and has_table_privilege('authenticated', 'public.learner_planned_sessions', 'insert')
    and has_table_privilege('authenticated', 'public.learner_planned_sessions', 'update')
    and has_table_privilege('authenticated', 'public.learner_planned_sessions', 'delete') as ok;

-- B4. The two indexes exist, one of them the "same topic and activity once per day while planned" rule (expect 2 rows).
select indexname, indexdef
from pg_indexes
where schemaname = 'public' and tablename = 'learner_planned_sessions'
  and indexname in ('learner_planned_sessions_one_planned_per_day_idx', 'learner_planned_sessions_user_date_idx')
order by indexname;

-- B5. The check constraints are present (expect 7 rows: activity type, added by, minutes, status and the three id checks).
select conname
from pg_constraint
where conrelid = 'public.learner_planned_sessions'::regclass and contype = 'c'
order by conname;

-- B6. The migration is recorded (expect 1 row).
select version
from supabase_migrations.schema_migrations
where version = '20261002060000';

-- Read-only verification queries for the `calculation` evidence source.
-- Migration: 20261006180000_add_calculation_evidence_source.sql
-- Run section A BEFORE applying. Run section B AFTER applying (expect: every "ok" column true).
-- None of these queries write anything.
-- Runbook: docs/technical/Calculation Evidence Production Runbook.md

-- ===== A. BEFORE applying =====

-- A1. The constraint the migration replaces exists under the expected name, and does not yet allow 'calculation' (expect 1 row, ok = true).
select
  conname,
  pg_get_constraintdef(oid) as definition,
  pg_get_constraintdef(oid) not like '%calculation%' as ok
from pg_constraint
where conrelid = 'public.learning_evidence'::regclass
  and conname = 'learning_evidence_source_check';

-- A2. The migration must not already be recorded (expect 0 rows).
select version
from supabase_migrations.schema_migrations
where version = '20261006180000';

-- A3. The migrations before it are already applied (expect no gap you do not recognise).
select version
from supabase_migrations.schema_migrations
order by version desc
limit 5;

-- A4. How much evidence exists today, by source, so section B can show nothing was lost.
select source, count(*) as rows
from public.learning_evidence
group by source
order by source;

-- ===== B. AFTER applying =====

-- B1. The constraint now allows all five sources (expect 1 row, ok = true).
select
  conname,
  pg_get_constraintdef(oid) as definition,
  pg_get_constraintdef(oid) like '%flashcard%'
    and pg_get_constraintdef(oid) like '%multiple_choice%'
    and pg_get_constraintdef(oid) like '%calculation%'
    and pg_get_constraintdef(oid) like '%exam_question%'
    and pg_get_constraintdef(oid) like '%exam_attempt%' as ok
from pg_constraint
where conrelid = 'public.learning_evidence'::regclass
  and conname = 'learning_evidence_source_check';

-- B2. Existing evidence is unchanged: compare with A4 (the same counts for the four older sources, 0 for calculation).
select source, count(*) as rows
from public.learning_evidence
group by source
order by source;

-- B3. Row-level security and privileges are exactly as before (expect ok = true).
select
  c.relrowsecurity as rls_enabled,
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'learning_evidence') as policy_count,
  has_table_privilege('anon', 'public.learning_evidence', 'select') as anon_select,
  has_table_privilege('authenticated', 'public.learning_evidence', 'select') as authenticated_select,
  has_table_privilege('authenticated', 'public.learning_evidence', 'insert') as authenticated_insert,
  has_table_privilege('authenticated', 'public.learning_evidence', 'update') as authenticated_update,
  has_table_privilege('authenticated', 'public.learning_evidence', 'delete') as authenticated_delete,
  c.relrowsecurity
    and (select count(*) from pg_policies where schemaname = 'public' and tablename = 'learning_evidence') = 2
    and not has_table_privilege('anon', 'public.learning_evidence', 'select')
    and has_table_privilege('authenticated', 'public.learning_evidence', 'select')
    and has_table_privilege('authenticated', 'public.learning_evidence', 'insert')
    and not has_table_privilege('authenticated', 'public.learning_evidence', 'update')
    and not has_table_privilege('authenticated', 'public.learning_evidence', 'delete') as ok
from pg_class c
where c.oid = 'public.learning_evidence'::regclass;

-- B4. The migration is recorded (expect 1 row).
select version
from supabase_migrations.schema_migrations
where version = '20261006180000';

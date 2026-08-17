# Current Supabase Baseline

Status: implementation evidence captured 2026-08-17. This document describes what exists today; it does not redefine product or engineering authority.

## Project
- Project: Revision
- Project ref: `xwwhshpmeogswxfjtpvq`
- Region: `eu-west-1`
- Database engine: PostgreSQL 17
- Project status at inspection: healthy

## Authentication
- 2 auth users at inspection time
- both confirmed
- both have signed in
- email/password identities only

## Public application schema
One application table exists: `public.revision_progress`.

Columns:
- `user_id uuid not null`
- `module_id text not null`
- `state jsonb not null default '{}'::jsonb`
- `updated_at timestamptz not null default now()`

Constraints:
- primary key `(user_id, module_id)`
- foreign key `user_id -> auth.users(id)` with `ON DELETE CASCADE`

Indexes:
- primary-key unique btree index on `(user_id, module_id)`

## Row level security
RLS is enabled on `revision_progress`.

Authenticated-user policies exist for:
- SELECT own rows only
- INSERT own rows only
- UPDATE own rows only, including ownership check on the new row
- DELETE own rows only

The ownership predicate is based on `auth.uid() = user_id`.

## Current learner data shape
At inspection time:
- 2 progress rows
- 2 users with progress
- 1 module: `business-aqa-as-paper-2`

Observed top-level JSON state keys:
- `cards`
- `quiz`
- `topic`
- `v2` on one record

No learner-specific values are reproduced in this document.

## Advisor state
Security advisor:
- warning: leaked-password protection is disabled

Performance advisor:
- no warnings at inspection time

## Assessment
The current database is small and the ownership model is sound. The main limitation is architectural: learner progress is stored mostly inside one opaque JSON document, which is difficult to query, version, report on and evolve safely as Revision adds more content, assessments, readiness evidence, analytics and admin operations.

# Supabase Migration Plan

## Objective
Move Revision from prototype JSON progress storage toward a structured, versioned learner-data model without losing current learner progress.

## Migration principles
1. Additive before destructive.
2. Preserve `revision_progress` until replacement behaviour has been proven.
3. Do not overwrite or delete current learner data as part of initial regularisation.
4. Every schema change is version-controlled in `supabase/migrations/`.
5. RLS ownership rules must be tested automatically.
6. Test identities and synthetic records must remain distinguishable from real learner data and excluded from live reporting.
7. Changes to learner data are high risk and require full automated assurance plus explicit Founder approval.

## Proposed phases
### Phase A — repository baseline
- capture current schema, RLS and auth state
- create `supabase/` migration structure in the repository
- no live database change

### Phase B — minimum structural regularisation
Introduce only the fields/tables needed to support reliable versioning and future migration. Likely candidates include:
- explicit schema/data versioning
- structured module-level progress
- test-user marker/profile metadata
- timestamps suitable for conflict handling

Exact DDL must be reviewed separately before execution.

### Phase C — structured evidence model
Add structured records where Revision needs queryable evidence, such as:
- question attempts
- exam attempts
- revision sessions
- readiness/evidence inputs

The engine must be able to derive recommendations from these records without depending on opaque UI state.

### Phase D — compatibility and backfill
- read existing JSON state
- populate structured records where the mapping is reliable
- preserve original state during verification
- compare old/new behaviour for existing users

### Phase E — cutover
Only after parity and automated tests are proven:
- make structured storage canonical for the migrated capability
- retain rollback/recovery path
- retire obsolete JSON fields only in a later deliberate migration

## Explicit non-goals for the first migration
- no broad rewrite of all learner data
- no removal of `revision_progress`
- no destructive cleanup
- no production analytics warehouse
- no subject catalogue tables unless the catalogue design genuinely requires persisted learner selections

## Security hardening follow-up
Leaked-password protection should be considered as a separate Auth configuration change so its operational effect is reviewed independently of schema migration work.

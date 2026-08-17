# Target Data Model

Status: Direction approved; exact schema remains to be designed after inspecting the live Supabase project.

## Principles
- Supabase is canonical for persisted authenticated learner progress.
- Learner ownership is explicit and protected with RLS.
- Data is structured and versionable.
- Browser/local storage is cache, working state and recovery only.
- Synthetic/test users and records are explicitly classifiable and excluded from live metrics.

## Likely concepts
- profiles / user classification
- module progress
- question/activity attempts
- exam attempts
- revision sessions/evidence events where justified

These are target concepts, not an approved final table design. The implementation PR must inspect current schema/data/policies first and propose migrations that preserve existing learner data where practical.

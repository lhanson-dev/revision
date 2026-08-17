# Phase 5 — Learning evidence service

## Purpose
Wire the React learner application architecture to the approved `public.learning_evidence` store without yet changing production learner routes or UI.

## Live database state
The `add_learning_evidence` migration has been applied to the Revision Supabase project.

Post-migration verification confirmed:
- existing `revision_progress` remains at 2 rows;
- `learning_evidence` starts at 0 rows;
- RLS is enabled;
- authenticated learners have SELECT and INSERT only;
- `anon` has no table grants;
- SELECT and INSERT policies enforce `(select auth.uid()) = user_id`;
- expected module/topic occurrence indexes exist.

The only security advisor warning remains the pre-existing Auth leaked-password-protection setting. New indexes are reported as unused because the table has not yet received production evidence.

## Application boundary
`learning-evidence-service.ts` owns persistence behaviour:
- validates evidence before save;
- maps it to the database record shape;
- treats duplicate stable evidence IDs as safe idempotent retries;
- never updates or deletes an existing evidence fact;
- loads evidence by learner/module and optional topic;
- validates persisted payloads again before returning them to the engine;
- surfaces genuine database errors rather than silently losing progress.

Readiness calculations remain in the engine. The database service stores and retrieves evidence facts only.

## Why duplicate inserts are idempotent
Browser/network retries can repeat a completed action. The `(user_id, evidence_id)` primary key prevents a second fact being created. A duplicate-key response is treated as confirmation that the same stable evidence ID was already recorded, without granting UPDATE permission or mutating the stored fact.

## Production boundary
This phase does not:
- change the old production learner routes;
- create evidence on behalf of existing learners;
- migrate legacy JSON progress into synthetic evidence;
- surface readiness UI;
- introduce a service-role key in browser code.

## Next step
Create the authenticated `/app/` shell and Supabase browser client, then connect real learner actions to this service. Recent activity and readiness progress should read from the same persisted evidence stream so completed work is immediately visible even before a readiness score is available.

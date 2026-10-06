# Learner Planned Sessions: production runbook

**Status:** **Applied to production** (found on 6 October 2026 by a read-only check: version `20261002060000` recorded; table exists, row-level security on, one owner-only policy for signed-in students, signed-out users and the service role denied select, 3 indexes, 9 constraints, 0 rows, no advisor finding for this table). The steps below are kept as the record; **do not apply it again**. How it was applied is not recorded here.
**What it covers:** applying `supabase/migrations/20261002060000_add_learner_planned_sessions.sql` (merged in PR #494) to the production Supabase project.
**Why it is separate:** merging a migration does not apply it, and the GitHub Pages deploy does not run production migrations. Applying it is a production database write and needs its own explicit instruction from the Founder (`supabase/README.md`, `First Supabase Migration Execution Plan.md`).

## What the Founder is deciding

Until this table exists in production, students cannot save a session to their plan: "Add to Thursday", "Move it", Done, Skip and Remove on Plan and Home quietly do nothing lasting, and the screens behave as they did before PR 8. Nothing breaks without it.

Applying it adds **one new, empty table**. It changes no existing table, row or setting. It is private to each student (a student can only see and change their own rows), and it holds only the sessions a student chose to add. It is planning context, never evidence of what they know.

Risk is low: the table is new and nothing else reads it. The one-line undo is in "Rollback".

## Before applying (the AI runs these read-only checks and reports the answers)

Run section A of `supabase/tests/learner-planned-sessions-verification.sql` against production.

1. The table `public.learner_planned_sessions` does not exist (A1 returns no rows).
2. Version `20261002060000` is not already recorded (A2 returns no rows).
3. The migrations before it are present and the latest recorded version is `20260927182844` or later (A3).
4. The migration file on `main` is unchanged since it was approved. Its SHA-256 is:

   `b15d8ac190fe22b41872b42b76b54a1e4ae2a622cd5e7d550c39ebe2a0228334`

   Check with `sha256sum supabase/migrations/20261002060000_add_learner_planned_sessions.sql`. If it differs, stop: the file is not the one that was approved.
5. The Supabase project is healthy, and the Founder has given the explicit instruction to apply (a reply in the chat naming this migration).

## Applying

Apply the file exactly as it is in `main`, through the project's normal governed route (Supabase CLI `supabase db push` against the production project, or the same file run in the Supabase SQL editor and then recorded as applied). The migration is one transaction (`begin` … `commit`): it either fully applies or does not apply at all. Do not edit it while applying.

## After applying (read-only checks)

Run section B of `supabase/tests/learner-planned-sessions-verification.sql`. Every `ok` column must be true:

- B1: the table exists, row-level security is on, and it is empty.
- B2: exactly one policy, for signed-in students only, limited to their own rows.
- B3: signed-out users and the service role have no access; signed-in students can read, add, change and delete.
- B4: both indexes exist, including the rule that the same topic and activity cannot be planned twice on one day.
- B5: seven constraints are present.
- B6: the migration is recorded.

Then run the Supabase security and performance advisors and confirm there is no new finding for this table.

## Checking it works for a real student (synthetic test accounts only)

With two synthetic test identities (never real students):

1. Student A adds a session to their plan; it is still there after reloading.
2. Student B cannot see, change or delete student A's session.
3. Signed out, the table cannot be read.
4. Removing the session removes it. Delete the test rows and test accounts afterwards.

Then on the live site, as a test student, add a session from Home or Plan and confirm it survives a reload.

## Rollback

`drop table public.learner_planned_sessions;`

This deletes any sessions students have saved to their plan, so use it only if something is wrong and preferably before students have used the feature. After a rollback, the screens go back to behaving as they did before PR 8 (the app copes with the table being missing).

## What is not part of this

- No change to `revision_release_readiness()`. The deploy does not wait for this table, because the screens work without it. If the Founder later wants the deploy to refuse to ship without it, that is a separate, deliberate change.
- No data is copied or migrated. The table starts empty.

## Record to keep after it is done

Add one line to the Current Supabase Baseline (`docs/technical/Current Supabase Baseline.md`) and change the status line of `Learner Planned Sessions Implementation.md` to "applied to production" with the date, in the same PR as the Founder's confirmation.

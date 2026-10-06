# Calculation evidence: production runbook

**Status:** **already applied to production** (found on 6 October 2026). A read-only check run through ChatGPT's Supabase access reported that production already had the rule allowing `calculation` and already recorded migration version `20261006180000` (latest versions: `20261006180000`, `20261002060000`, `20260927182844`). No change was made by that check. The steps below are kept as the record and for re-checking; **do not apply the migration again**.
**What it covers:** applying `supabase/migrations/20261006180000_add_calculation_evidence_source.sql` (merged in PR #556) to the production Supabase project (`xwwhshpmeogswxfjtpvq`).
**Why it is separate:** merging a migration does not apply it, and the GitHub Pages deploy does not run production migrations (`supabase/README.md`, `First Supabase Migration Execution Plan.md`). Applying it is a production database write and needs the Founder's explicit instruction, which was given in the chat on 6 October 2026 ("Apply the migration now"). The AI session that prepared this has no production database access, so someone with it runs the steps below.

## What this was, and why it mattered

Until it was applied, a student who picks the new **Calculations** kind in Practice types a number and chooses how sure they are, and **the answer cannot be saved**: the database refuses evidence whose source is `calculation`. The screen shows "Your work is still on screen; try saving it again", the question cannot be checked, and the student is stuck on it. Multiple choice, flashcards and everything else are unaffected. Nothing is lost or corrupted.

Applying it changes **one rule on one table**: the list of allowed evidence types on `public.learning_evidence` gains `calculation`. No row, policy, grant or setting changes, and existing evidence stays valid. It runs as two statements (drop the old rule, add the new one) and takes a moment on a small table.

Risk is low. The one-line undo is in "Rollback".

## Before applying (read-only; the person with access runs these and reports the answers)

Run section A of `supabase/tests/calculation-evidence-source-verification.sql` against production (Supabase SQL editor is fine).

1. A1 returns one row with `ok = true`: the constraint exists under the name `learning_evidence_source_check` and does not yet allow `calculation`. **If A1 returns no rows, stop**: the constraint has a different name in production and the migration would fail. Report the name and the migration must be adjusted in a new PR.
2. A2 returns no rows: not already applied.
3. A3 shows the migrations before it are present and no gap you do not recognise.
4. Note A4 (rows by source) for comparison afterwards.
5. The migration file on `main` is unchanged since it was approved. Its SHA-256 is:

   `3b23fda4da46b4d99595fb5d8689ebdab5b9f824d011045125b38c612a832767`

   Check with `sha256sum supabase/migrations/20261006180000_add_calculation_evidence_source.sql`. If it differs, stop.
6. The Supabase project is healthy.

## Applying

Apply the file exactly as it is in `main`, through the project's normal governed route: Supabase CLI `supabase db push` against the production project, or the same file run in the Supabase SQL editor and then recorded as applied (so `supabase_migrations.schema_migrations` lists version `20261006180000`). Do not edit it while applying. The two statements should be run together, in one go, so the rule is never absent for long.

## After applying (read-only checks)

Run section B of the same file. Every `ok` column must be true:

- B1: the rule now allows all five sources.
- B2: the counts by source match A4 (and `calculation` has none yet).
- B3: row-level security, the two policies and the privileges are exactly as before.
- B4: the migration is recorded.

Then run the Supabase security and performance advisors and confirm there is no new finding for `learning_evidence`.

## Checking it works (synthetic test accounts only)

1. On the live site, as a synthetic test student, open Practice on a topic with a calculation (topic 1, "What is Business?", has one), choose **Calculations**, answer, choose how sure you are. The answer is checked and the feedback appears.
2. Reload: the activity is still in that student's evidence.
3. Delete the test rows and the test account afterwards.

## Rollback

```sql
alter table public.learning_evidence drop constraint learning_evidence_source_check;
alter table public.learning_evidence add constraint learning_evidence_source_check
  check (source in ('flashcard', 'multiple_choice', 'exam_question', 'exam_attempt'));
```

This fails if any `calculation` evidence has already been saved, because those rows would break the old rule. Do not delete students' evidence to make it pass; instead leave the migration in place and, if Calculations must come off, hide the option in the app in a code change.

## What is not part of this

- The admin operations metrics function counts quick checks by source `multiple_choice` only, so calculations are not in that count yet. It does not affect students. Fixing it means replacing an admin database function, so it is its own PR.
- The deploy readiness check (`revision_release_readiness`) does not wait for this rule. If the Founder later wants the deploy to refuse to ship without it, that is a separate, deliberate change.

## What was observed on 6 October 2026

- Project `xwwhshpmeogswxfjtpvq`, "Revision", status healthy.
- A1: the rule `learning_evidence_source_check` already lists `flashcard`, `multiple_choice`, `calculation`, `exam_question`, `exam_attempt`.
- A2: version `20261006180000` already recorded.
- A4: evidence rows by source: `exam_attempt` 1, `exam_question` 24, `flashcard` 2, `multiple_choice` 25, no `calculation` rows yet.
- Not run (the check stopped at its own safety rule): the after-checks B2 and B3 (counts and privileges), the advisors, and the test with a synthetic student. They are still worth doing once, read-only.
- How it got there is not recorded here (the session that prepared the migration had no database access). The likely route is the project's automatic migration step on merge; confirm with whoever set that up.

## Record to keep after it is done

`docs/technical/Current Supabase Baseline.md` has a line saying the `calculation` evidence source is applied (6 October 2026), and the `Practice calculations` row in `docs/design/learner-redesign-v2/STATUS.md` says so too.

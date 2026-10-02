# Learner Planned Sessions Implementation

**Status:** migration written in its own PR, awaiting Founder approval. Not applied to production. No screen uses it yet.
**Decision:** `docs/design/learner-redesign-v2/data-model-proposal.md`, section 5 (agreed by the Founder, 1 October 2026).

## What it is

`public.learner_planned_sessions` stores only the sessions a student **accepted onto their plan**: they added it themselves, or accepted a REV suggestion ("Add to Thursday", "Move it"). The rest of the plan is still worked out fresh each time from exam dates, study time and evidence. Storing only the student's choices means a choice stays put and the planner can treat it as already placed.

It is planning context. It is not mastery or readiness evidence, and nothing in it changes a status, Topics covered or readiness.

## Columns

| Column | Meaning |
| --- | --- |
| `session_id` | Unique id |
| `user_id` | The student (deleted with the account) |
| `planned_date` | The day it is planned for |
| `course_id`, `topic_id` | What to study (course and topic ids from the content packs) |
| `activity_type` | `learn`, `practice` or `exam_prep` |
| `minutes` | 5 to 240 |
| `added_by` | `student`, or `rev` for a REV suggestion the student accepted |
| `recommendation_id` | The suggestion it came from, if any |
| `status` | `planned`, `done` or `skipped` |
| `created_at`, `updated_at` | Timestamps |

The same topic and activity cannot be `planned` twice on one day (once it is done or skipped, it can be planned again).

## Security

- Row-level security on. One policy: a student can read, add, change and delete only their own rows (`auth.uid() = user_id`).
- `anon` has no access. The service role has no standing access.
- No admin or parent browsing.

## Code

`src/services/planning/planned-session-service.ts`: load a date range, add, set status, move to another day, remove. Checks minutes and dates before asking the database and turns errors into readable messages. Not used by any screen yet.

## Assurance

- `supabase/tests/learner-planned-sessions-assurance.test.sql` (pgTAP, run in CI with the other database tests): RLS on, one policy, privileges, cross-student isolation for read, insert, update and delete, and every constraint above.
- `src/services/planning/planned-session-service.test.ts`: the service layer.
- Also run on a local Postgres 16 with stubbed Auth when written: every constraint and the cross-student rules behaved as expected.

## Rollback

The table is new and nothing reads it. To undo: `drop table public.learner_planned_sessions;`. Accepted sessions the student has made would be lost, so this should only be done before any screen uses it.

## Next

Wire it into Plan and Home: "Add to Thursday", "Move it", the REV PICK label, faded done sessions, and the planner treating an accepted session as already placed. That is a separate PR.

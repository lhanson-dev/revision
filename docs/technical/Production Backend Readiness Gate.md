# Production Backend Readiness Gate

**Status:** Active production control. Production Supabase currently exposes `plan-state-v1`; the 27 September 2026 Plan refresh proposes `planner-week-v1` and must not merge/release until that additive production capability is enabled and independently verified.  
**Owner:** Engineering / Operations  
**Governing authority:** `50-engineering-standards/Release & Deployment Standard.md`

## Purpose

Prevent Revision from publishing a frontend that either:

1. depends on database/server-side capabilities that are not enabled in production; or
2. cannot be traced back to a governed PR with exact-head CI and explicit Founder approval.

A successful frontend build is not sufficient evidence that the release is usable or governed.

## Release sequence

The canonical deployment sequence is:

1. governed release-lineage preflight;
2. production backend readiness;
3. production build;
4. Pages deployment;
5. production smoke; and
6. durable `revision/path-to-live` commit status publication.

Every stage fails closed. The final durable status is `success` only when every required stage succeeds for the same `main` commit.

## Governed release-lineage preflight

`scripts/assurance/release-lineage.mjs` verifies the release candidate before backend readiness. For the `main` commit being deployed it requires:

- the exact merged PR can be established;
- the exact proposed PR head SHA can be established;
- the latest Revision CI for that exact head completed successfully;
- the PR contains the required machine-readable Founder approval marker authored by the configured Founder identity and recorded after exact-head CI; and
- the immediately previous governed `main` release has successful `revision/path-to-live` evidence, subject only to explicitly governed recovery checkpoints.

Founder marker format:

```text
revision-founder-approval:v1
head_sha: <40-character exact PR head SHA>
```

Current release-lineage recovery history is maintained in `docs/technical/Release Lineage Recovery Checkpoint.md` and ADR-0018. Historical exceptions are not backfilled as compliant approvals.

## Durable path-to-live status

The deployment workflow writes the commit status:

`revision/path-to-live`

It is:

- `pending` while release verification is underway;
- `success` only when governed lineage, backend readiness, build, deploy and production smoke all succeed; and
- terminal non-success otherwise.

The status links directly to the release workflow run and is attached to the exact production commit.

## Production database contract

The non-sensitive readiness RPC is:

`public.revision_release_readiness()`

It runs as **SECURITY INVOKER** and exposes only:

- a contract identifier;
- an aggregate `ready` boolean; and
- boolean capability-presence checks.

It does not expose learner data, credentials, migration history or privileged operational detail.

### Historical contract progression

`planner-v1` established the first fail-closed database dependency contract for the planner and protected Admin foundations.

`courses-v1` added FI-020 learner-course membership and course-event capabilities while retaining all earlier checks.

`plan-state-v1` added FI-022 learner plan-state capabilities while retaining every earlier requirement.

The Plan experience refresh proposes `planner-week-v1`, which additionally requires explicit recurring Monday-Sunday planner availability on the existing learner-owned availability profile.

Historical applied migrations remain forward-only and are not rewritten when the contract advances.

## Current production `plan-state-v1` contract

Production applied:

`20260824165737_add_learner_plan_state`

on 24 August 2026.

`plan-state-v1` requires the previous learner/profile/evidence/planner/course capabilities plus:

- `public.learner_plan_state`;
- `public.learner_plan_assignment_events`; and
- `public.assign_learner_plan(uuid,text,uuid)`.

Production verification immediately after enablement confirmed:

- contract `plan-state-v1`;
- aggregate `ready: true`;
- RLS enabled on both plan tables;
- authenticated own-plan read without browser plan writes;
- assignment-event browser denial;
- service-role-only execution of the plan-assignment RPC;
- `revision_release_readiness()` remains `SECURITY INVOKER`;
- all users present at migration time received compatibility Free state; and
- rollback-safe synthetic-user verification proved new-user `registration_default` Free creation.

Detailed evidence is maintained in `docs/technical/Learner Plan State Implementation.md`.

## Proposed `planner-week-v1` contract

The Plan experience refresh introduces version-controlled migration:

`20260927134400_add_recurring_weekly_planner_availability.sql`

The migration is additive. It extends `public.revision_availability_profiles` with:

- `monday_minutes`;
- `tuesday_minutes`;
- `wednesday_minutes`;
- `thursday_minutes`;
- `friday_minutes`;
- `saturday_minutes`; and
- `sunday_minutes`.

Existing rows are backfilled from the prior weekday/weekend values. The legacy aggregate fields remain for backwards compatibility. The table's existing learner-owner RLS model remains the authorization boundary.

The migration advances `revision_release_readiness()` to `planner-week-v1` only when all earlier required capabilities remain present and all seven new recurring-capacity columns exist.

`.github/workflows/deploy-pages.yml` on the Plan refresh branch expects `planner-week-v1`. Therefore the branch is intentionally not production-releasable until production has been prepared. This is the same backend-ahead/fail-closed operating pattern used for earlier additive contracts.

Before Founder merge approval can safely be acted on, the production change requires:

1. apply the additive migration through the governed Supabase migration path;
2. verify existing rows were backfilled correctly without weakening RLS;
3. verify `revision_release_readiness()` reports `planner-week-v1` and `ready: true`;
4. run Supabase Security and Performance Advisors and review new findings; and
5. reconcile the production migration ledger with the committed migration identity.

Until those checks are complete, the frontend/repository PR may be reviewed and CI-tested but must not be treated as release-ready.

## Required protected Edge Functions

The production release gate requires these protected functions:

- `admin-operations` — Founder Operations / Founder Assurance;
- `planner-operations` — planner operational assurance; and
- `learner-plan-operations` — FI-022 plan integrity summary and protected manual plan assignment.

The workflow probes each function without a user JWT. Each must reject the unauthenticated POST with HTTP `401`.

For FI-022, production `learner-plan-operations` version 1 was deployed ACTIVE on 24 August 2026 with platform JWT verification enabled. The repository also declares `verify_jwt = true` explicitly in `supabase/config.toml`.

A protected function may use privileged service-role capability only after its own server-side authorization boundary has re-established the caller's permission. UI hiding is never authorization.

## Backend-ahead release windows

Revision intentionally enables additive backend capability before merging the frontend/repository release that requires it. This allows the candidate deployment to fail closed if production has not been prepared.

The same rule applies to `planner-week-v1`: production should advance to the additive weekly-capacity contract immediately before the governed frontend merge, after exact candidate migration review and before Founder-authorized merge/release. During that narrow window an older workflow expecting `plan-state-v1` would fail closed rather than silently accepting an unexpected contract.

This temporary mismatch is a release-control state by design; it must be bounded to the governed change and not left open while unrelated production releases proceed.

## Extending the contract

A governed change that adds a new required production dependency must update the backend readiness gate in the same PR when the application would fail without it.

For a database dependency:

1. create a forward-only version-controlled migration;
2. add capability checks to `revision_release_readiness()`;
3. advance the contract identifier when the required backend contract changes;
4. update `EXPECTED_BACKEND_CONTRACT` in `.github/workflows/deploy-pages.yml`; and
5. enable and independently verify the additive production capability before release.

For a required Edge Function:

1. add the version-controlled function under `supabase/functions/`;
2. keep JWT verification enabled unless a separately governed trust model requires otherwise;
3. deploy it before the requiring release;
4. add a safe readiness probe; and
5. prove the probe verifies deployment/authentication without privileged credentials.

After production application, reconcile repository migration filenames to the exact `supabase_migrations.schema_migrations` ledger version.

## Security and advisor review

Production schema changes require Security and Performance Advisor review.

The `planner-week-v1` change adds columns only to an existing owner-protected table and does not deliberately add grants or policies. That reduces authorization surface area but does not remove the requirement to run advisor review and re-check effective grants/RLS after production application.

The separate pre-existing leaked-password-protection warning remains outside this Plan change unless independently remediated.

Supabase password-security reference: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## What this gate does not prove

The release gate proves governed lineage, required backend capability presence, protected-function deployment/authentication posture, successful build/deploy and declared production smoke. It does not by itself prove:

- every RLS ownership path;
- every authenticated Admin success path;
- every feature's educational correctness;
- continuing production health indefinitely after smoke; or
- third-party configuration not represented in the declared contract.

Those remain separate responsibilities under the Testing & Assurance Standard, Security Standard, operational assurance and Assurance Coverage Register.

## Documentation maintenance

When the required production contract changes, update this document, the workflow, the relevant feature technical implementation record and the Assurance Coverage Register in the same governed PR. Preserve historical applied migration evidence and decision records; do not rewrite them to match the new state.
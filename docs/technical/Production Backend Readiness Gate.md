# Production Backend Readiness Gate

**Status:** Active production control. Production Supabase exposes `planner-week-v1` as of 27 September 2026 for PR #403 backend-ahead enablement; the Plan refresh must still pass exact-head assurance, explicit Founder merge approval, governed merge, deployment and production smoke before it is Live.  
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

`planner-week-v1` adds explicit recurring Monday-Sunday planner availability on the existing learner-owned availability profile while retaining every earlier requirement.

Historical applied migrations remain forward-only and are not rewritten when the contract advances.

## Historical `plan-state-v1` contract

Production applied `20260824165737_add_learner_plan_state` on 24 August 2026.

`plan-state-v1` required the previous learner/profile/evidence/planner/course capabilities plus:

- `public.learner_plan_state`;
- `public.learner_plan_assignment_events`; and
- `public.assign_learner_plan(uuid,text,uuid)`.

Production verification after that enablement confirmed `ready: true`, learner-plan RLS/privilege boundaries, service-role-only assignment and a `SECURITY INVOKER` readiness RPC. Detailed evidence remains in `docs/technical/Learner Plan State Implementation.md`.

## Current production `planner-week-v1` contract

The Plan experience refresh uses the production-ledger migration identity:

`20260927161359_add_recurring_weekly_planner_availability.sql`

The migration is additive. It extends `public.revision_availability_profiles` with:

- `monday_minutes`;
- `tuesday_minutes`;
- `wednesday_minutes`;
- `thursday_minutes`;
- `friday_minutes`;
- `saturday_minutes`; and
- `sunday_minutes`.

Existing rows are backfilled from the prior weekday/weekend values. The legacy aggregate fields remain for backwards compatibility. The table's existing learner-owner RLS model remains the authorization boundary.

The migration advances `revision_release_readiness()` to `planner-week-v1` only when all earlier required capabilities remain present and all seven new recurring-capacity columns exist. `.github/workflows/deploy-pages.yml` on the Plan refresh branch expects the same contract.

### Production enablement evidence — 27 September 2026

Immediately before enablement, production reported `plan-state-v1` with `ready: true`. Production contained one availability profile with valid legacy values of 120 weekday minutes and 120 weekend minutes, RLS was enabled, and none of the seven new columns existed.

The governed additive migration was then applied to the production Revision Supabase project. Independent post-change verification confirmed:

- `revision_release_readiness()` reports `planner-week-v1` with aggregate `ready: true`;
- the `weeklyAvailability` capability check is `true` and all earlier capability checks remain `true`;
- the existing availability profile was backfilled exactly to 120 minutes on Monday through Sunday while retaining its legacy values;
- `revision_availability_profiles` still has RLS enabled;
- the authenticated owner policy remains `auth.uid() = user_id` for both `USING` and `WITH CHECK`;
- `revision_release_readiness()` remains `SECURITY INVOKER` and stable;
- routine execution remains deliberately limited to the expected roles after `PUBLIC` revocation; and
- the production migration ledger records version `20260927161359` with name `add_recurring_weekly_planner_availability`.

Security and Performance Advisor checks were run before and after the migration. The post-change findings are unchanged from the preflight baseline and introduce no Plan-specific warning or performance regression. The existing findings remain:

- informational RLS/no-policy notice for `learner_plan_assignment_events`, reflecting its existing deny-browser design;
- the separate leaked-password-protection warning;
- informational unindexed `assigned_by` foreign-key suggestions on the existing learner-plan tables; and
- existing unused-index notices.

The production-backend prerequisite for PR #403 is therefore satisfied. This does **not** make the Plan refresh Live: exact final-head CI, Founder approval, merge, governed deployment and production smoke remain required.

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

Production is currently in the bounded `planner-week-v1` backend-ahead window for PR #403. Current approved `main` still expects the earlier `plan-state-v1` contract, so unrelated production merges should not be introduced until PR #403 either completes its governed path or the backend contract is deliberately remediated through a governed change.

This temporary mismatch is a release-control state by design. The schema change itself is additive and backward-compatible; the strict contract mismatch exists to stop an older release workflow silently accepting an unexpected backend state.

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

After production application, reconcile repository migration filenames to the exact `supabase_migrations.schema_migrations` ledger version. PR #403 is reconciled to production version `20260927161359`.

## Security and advisor review

Production schema changes require Security and Performance Advisor review.

The `planner-week-v1` change adds columns only to an existing owner-protected table and does not add grants or policies. Post-change advisor review on 27 September 2026 showed no new Plan-specific finding compared with the pre-migration baseline.

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

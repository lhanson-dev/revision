# Production Backend Readiness Gate

**Status:** Merged and production database contract enabled; first fully evidenced readiness-gated Pages lineage still to be recorded  
**Owner:** Engineering / Operations  
**Governing authority:** `50-engineering-standards/Release & Deployment Standard.md`

## Purpose

Prevent Revision from publishing a new frontend that depends on database or server-side capabilities that are not yet enabled in production.

This closes the path-to-live failure exposed after FI-001, when the Pages frontend was deployed successfully while the adaptive-planner Supabase tables had not yet been applied.

## Release boundary

The canonical frontend remains GitHub Pages `/app/`. Supabase database migrations and Edge Functions are separately deployed dependencies.

A successful frontend build therefore does not by itself prove the release is usable.

Before the Pages build/upload job can run, `.github/workflows/deploy-pages.yml` executes a `Production backend readiness` job.

The gate currently verifies:

1. `public.revision_release_readiness()` exists and is callable with the public publishable key;
2. the returned contract identifier is exactly `planner-v1`;
3. the contract reports all current required database capabilities as present, including both protected Admin aggregate RPCs; and
4. the protected `admin-operations` and `planner-operations` Edge Functions are deployed and each rejects an unauthenticated request with `401`.

Any missing function, contract mismatch, missing schema capability, missing Edge Function or unexpected authentication behaviour fails the workflow before a new Pages artifact is built or deployed.

## Database contract

The production migration ledger records `20260819154143_add_release_backend_readiness.sql`, defining the deliberately narrow public RPC:

`public.revision_release_readiness()`

It exposes only:

- a contract identifier;
- one aggregate `ready` boolean; and
- boolean presence checks for required schema capabilities.

It does not expose learner data, migration history, credentials or operational secrets.

The initial `planner-v1` contract verifies the current learner/profile/evidence tables, FI-001 planner tables, `admin_operations_metrics()` and `admin_planner_metrics()` required by the deployed runtime.

Production verification on 2026-08-19 confirmed the RPC is present and currently returns `ready: true` with all `planner-v1` database capability checks true. That proves the database side of the readiness contract is enabled; it does not by itself prove that a complete Pages deployment has subsequently passed every readiness and smoke stage.

The original applied migration created the RPC as `SECURITY DEFINER`. Supabase Security Advisor identified that elevated execution is unnecessary for a function callable by `anon` and `authenticated`. A rolled-back production verification proved the same contract remains callable by `anon` as `SECURITY INVOKER`. PR #62 therefore adds a forward-only hardening migration, `20260819160700_harden_release_readiness_security.sql`, rather than rewriting the historical applied migration. The isolated database assurance suite verifies the final RPC is `SECURITY INVOKER`.

Until that forward migration is applied in production after an approved merge, the production advisor warning remains a real deployment follow-up and must not be represented as closed.

## Required Edge Functions

The current frontend has protected Admin experiences that depend on two separately deployed functions:

- `admin-operations` — Founder Operations / Founder Assurance evidence;
- `planner-operations` — planner-specific protected operational evidence.

The release workflow probes both without credentials. A `401` proves that the route is deployed and that its JWT boundary is active. A missing route, success without authentication, or any other response fails the gate.

`content-factory-intake` is not currently a whole-product deployment blocker because Content Operations can truthfully surface its unavailable/unconfigured state without breaking the learner runtime. Its health remains independently visible in Admin. If a future release makes that function mandatory for the production contract, it must be promoted into this gate deliberately.

## Extending the contract

A governed change that adds a new production dependency must update the readiness gate in the same PR when the new frontend would fail without that dependency.

For a new database dependency:

1. add the version-controlled migration;
2. add the required capability check to `revision_release_readiness()`;
3. bump the contract identifier when the required production contract changes; and
4. update `EXPECTED_BACKEND_CONTRACT` in `.github/workflows/deploy-pages.yml` to the same value.

For a new required Edge Function:

1. add/deploy the version-controlled function under `supabase/functions/`;
2. add a safe readiness probe to the deployment workflow;
3. verify the probe proves deployment and the intended authentication boundary without needing privileged credentials.

The Pages deployment should remain blocked until the production dependency has been enabled. Once the dependency is enabled, the workflow can be rerun manually.

## What this control does not prove

The readiness gate proves that the capabilities required by the frontend are present at the deployment boundary. It does not prove:

- RLS ownership correctness;
- end-to-end data persistence correctness;
- authenticated Admin success paths;
- educational correctness;
- all Edge Function environment/secrets beyond what the readiness probe exercises; or
- general production health after deployment.

Those remain separate assurance responsibilities under the Testing & Assurance Standard, Security Standard, production smoke and Assurance Coverage Register.

## Current production enablement

The FI-001 planner schema, `admin_planner_metrics()`, `admin_operations_metrics()`, `planner-operations`, `admin-operations` and the `planner-v1` release-readiness RPC are currently present in production.

The remaining path-to-live evidence gap is lineage, not database capability presence: Revision still needs a recorded deployment where the current production commit is shown to have passed the readiness gate, Pages deployment and production smoke as one correlated chain. Until that evidence is correlated, PTL-03 remains Partial and Founder Assurance Path to live remains Unknown rather than overstated.

The release-readiness least-privilege hardening in PR #62 is a separate production enablement step. It is not required for frontend functionality, but the Security Advisor warning remains open until the new forward migration is applied and rechecked.

## Migration-history note

PR #62 reconciles repository migration filenames to the exact versions in the production `supabase_migrations.schema_migrations` ledger and restores the original `create_revision_progress` migration from the SQL retained by production. This makes isolated migration replay faithful to the production history and avoids introducing duplicate earlier migrations that would make future CLI migration comparison unsafe.

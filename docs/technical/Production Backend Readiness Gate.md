# Production Backend Readiness Gate

**Status:** Merged and production database contract enabled; readiness hardening applied and reconciled; first fully evidenced readiness-gated Pages lineage still to be recorded  
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

Production verification on 2026-08-19 confirmed the RPC is present and returns `ready: true` with all `planner-v1` database capability checks true.

The original applied readiness migration created the RPC as `SECURITY DEFINER`. Supabase Security Advisor identified that elevated execution was unnecessary for a non-sensitive function callable by `anon` and `authenticated`.

PR #62 introduced a forward-only hardening migration rather than rewriting historical applied SQL. When that migration was applied through Supabase, production recorded the exact migration version as:

`20260819162037_harden_release_readiness_security.sql`

PR #63 reconciled the repository filename to that production migration-ledger version. Production verification on 2026-08-19 confirmed `revision_release_readiness()` is now `SECURITY INVOKER`, and the previous Security Advisor warning for this function is closed.

The isolated database assurance suite also verifies the final RPC remains `SECURITY INVOKER`, so repository replay and production state now agree on this control.

## Required Edge Functions

The current frontend has protected Admin experiences that depend on two separately deployed functions:

- `admin-operations` — Founder Operations / Founder Assurance evidence;
- `planner-operations` — planner-specific protected operational evidence.

Both functions were verified active in production on 2026-08-19 with JWT verification enabled.

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

The readiness RPC currently reports `planner-v1` and `ready: true`. The least-privilege hardening is applied in production and reconciled to repository migration history.

The remaining path-to-live evidence gap is lineage, not backend capability presence: Revision still needs a recorded deployment where the same production lineage is correlated across required CI, explicit Founder merge approval, resulting `main` commit, backend readiness, Pages deployment and production smoke. Until that evidence is correlated, PTL-03 remains Partial and Founder Assurance Path to live remains Unknown rather than overstated.

## Migration-history note

PR #62 reconciled repository migration history to the production `supabase_migrations.schema_migrations` ledger and restored the original `create_revision_progress` migration from SQL retained by production. PR #63 completed the reconciliation for the readiness-hardening migration after Supabase assigned its applied version.

The current repository migration filename and production ledger now both use `20260819162037_harden_release_readiness_security.sql`. This keeps isolated migration replay faithful to production history and avoids duplicate or divergent migration versions.

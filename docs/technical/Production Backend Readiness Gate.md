# Production Backend Readiness Gate

**Status:** Production backend contract, governed release-lineage preflight and durable `revision/path-to-live` commit status are enabled and have been observed successfully in production. PTL-03 is Covered from the first complete governed release chain.  
**Owner:** Engineering / Operations  
**Governing authority:** `50-engineering-standards/Release & Deployment Standard.md`

## Purpose

Prevent Revision from publishing a frontend that either:

1. depends on database/server-side capabilities that are not enabled in production; or
2. cannot be traced back to a governed PR with exact-head CI and explicit Founder approval.

The backend-readiness requirement closes the failure exposed after FI-001, when the Pages frontend was deployed while the adaptive-planner Supabase tables had not yet been applied. The release-lineage requirement closes the separate governance/observability gap where a successful Pages run could not be durably correlated from the production commit using the available operational tooling.

## Release boundary

The canonical learner frontend remains the React/Vite application at `/app/`, deployed to `/revision/app/` through GitHub Pages. Supabase database migrations and Edge Functions remain separately deployed dependencies.

A successful frontend build therefore does not by itself prove that the release is usable or governed.

The current deployment sequence is:

1. governed release-lineage preflight;
2. production backend readiness;
3. production build;
4. Pages deploy;
5. production smoke; and
6. durable `revision/path-to-live` commit status publication.

Every stage fails closed. The final durable status is `success` only when all required stages complete successfully for the same `main` commit.

## Governed release-lineage preflight

PR #68 added `scripts/assurance/release-lineage.mjs` and made `.github/workflows/deploy-pages.yml` run it before backend readiness.

For the `main` commit being deployed, the preflight requires:

1. the commit can be associated with the exact merged pull request;
2. the exact proposed PR head SHA can be established;
3. the latest Revision CI for that exact head completed successfully;
4. the PR contains a valid machine-readable Founder approval marker authored by the configured Founder GitHub identity for that exact head and recorded after the latest exact-head CI completed; and
5. the immediately previous `main` commit has a successful `revision/path-to-live` status, except for the one explicit bootstrap parent described below.

Founder approval marker format remains:

```text
revision-founder-approval:v1
head_sha: <40-character exact PR head SHA>
```

Missing PR, CI, approval or prior-release evidence blocks deployment. A successful merge is never treated as a substitute for explicit approval evidence.

### Release-chain rule

After the bootstrap release, every deployed `main` revision must descend directly from a previous `main` revision whose latest `revision/path-to-live` status is `success`.

This means an ordinary direct push to `main` cannot deploy under the unchanged governed workflow: it has no associated governed PR/approval lineage, the preflight fails, and the release status remains non-successful. The failed revision also prevents the next release from silently carrying it forward because the prior-release chain check fails closed until deliberately remediated.

This is a strong compensating production control while GitHub branch protection is not yet configured. It is **not equivalent to repository branch protection**, because someone with sufficient repository write/admin access could deliberately alter the workflow itself. GitHub branch protection/rulesets therefore remain required defence in depth.

### Bootstrap parent

The first durable release-status deployment needed a single known parent because earlier releases did not publish `revision/path-to-live` commit statuses.

The allowed bootstrap parent was deliberately pinned to PR #67's governed merge:

`7295f21d9baaf058e8f438fd48558a33f05d2042`

PR #67 had prospectively recorded exact-head CI and Founder approval before merge. The bootstrap exception applied only when that exact SHA was the first parent of the first status-producing release. It must not be broadened or reused for an unrelated ancestry gap.

## Durable path-to-live status

The deployment workflow writes a GitHub commit status with context:

`revision/path-to-live`

The status is:

- `pending` while governed release verification is in progress;
- `success` only when governed-lineage preflight, backend readiness, build, Pages deploy and production smoke are all successful; and
- a terminal non-success result otherwise.

The status links to the corresponding GitHub Actions run and is attached directly to the deployed/attempted `main` commit. This makes the release-chain result queryable through ordinary commit-status APIs without relying on a client being able to enumerate push-triggered workflow runs.

The workflow requests only the GitHub permissions required for the control: repository/action/PR/issue read access, commit-status write access, and the existing Pages/id-token deployment permissions.

## Production backend readiness

After governed lineage succeeds, `.github/workflows/deploy-pages.yml` runs `Production backend readiness`.

The gate currently verifies:

1. `public.revision_release_readiness()` exists and is callable with the public publishable key;
2. the returned contract identifier is exactly `planner-v1`;
3. the contract reports all current required database capabilities as present, including protected Admin aggregate RPCs; and
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

PR #62 introduced a forward-only hardening migration rather than rewriting historical applied SQL. Production recorded the applied migration version as:

`20260819162037_harden_release_readiness_security.sql`

PR #63 reconciled the repository filename to that production migration-ledger version. Production verification on 2026-08-19 confirmed `revision_release_readiness()` is `SECURITY INVOKER`, and the previous Security Advisor warning for this function is closed.

The isolated database assurance suite also verifies the final RPC remains `SECURITY INVOKER`, so repository replay and production state agree on this control.

## Required Edge Functions

The current frontend has protected Admin experiences that depend on two separately deployed functions:

- `admin-operations` — Founder Operations / Founder Assurance evidence;
- `planner-operations` — planner-specific protected operational evidence.

Both functions were verified active in production on 2026-08-19 with JWT verification enabled.

The release workflow probes both without credentials. A `401` proves the route is deployed and its JWT boundary is active. A missing route, success without authentication, or any other response fails the gate.

`content-factory-intake` is not currently a whole-product deployment blocker because Content Operations can truthfully surface its unavailable/unconfigured state without breaking the learner runtime. If a future release makes that function mandatory, it must be promoted into the readiness contract deliberately.

## Extending the contract

A governed change that adds a new production dependency must update the readiness gate in the same PR when the frontend would fail without that dependency.

For a new database dependency:

1. add the version-controlled migration;
2. add the required capability check to `revision_release_readiness()`;
3. bump the contract identifier when the required production contract changes; and
4. update `EXPECTED_BACKEND_CONTRACT` in `.github/workflows/deploy-pages.yml` to the same value.

For a new required Edge Function:

1. add/deploy the version-controlled function under `supabase/functions/`;
2. add a safe readiness probe to the deployment workflow;
3. verify the probe proves deployment and the intended authentication boundary without privileged credentials.

The Pages deployment remains blocked until the production dependency is enabled. Once the dependency is enabled, the same governed `main` revision may be retried; the lineage check still has to pass.

## What these controls do not prove

The release gate proves governance lineage, required backend capability presence, successful deploy and declared production smoke for the revision. It does not by itself prove:

- all RLS ownership correctness;
- all end-to-end data persistence correctness;
- all authenticated Admin success paths;
- educational correctness;
- all Edge Function environment/secrets beyond what the readiness probes exercise; or
- continuing production health indefinitely after the smoke run.

Those remain separate assurance responsibilities under the Testing & Assurance Standard, Security Standard, operational health checks and Assurance Coverage Register.

## First observed complete production lineage

PR #68 exact head `53e8bbef9bb85dd95830a504ce55de29bad7f1ff` passed Revision CI #413 / run `32303360669` and was explicitly Founder-approved after that CI completed.

PR #68 merged as:

`2f4eb8f9166ca658ae19a8b72400e26488d5c16a`

Production release run `32304142083` then completed successfully across governed lineage, production backend readiness, build, GitHub Pages deployment, production smoke and durable status publication.

The exact merge commit was independently observed with:

`revision/path-to-live = success`

This is the first complete observed production lineage under the durable commit-level control and is sufficient to promote PTL-03 to Covered. Future release health remains dynamic operational evidence and must continue to be read from the current release status rather than inferred from this historical success.

## Migration-history note

PR #62 reconciled repository migration history to the production `supabase_migrations.schema_migrations` ledger and restored the original `create_revision_progress` migration from SQL retained by production. PR #63 completed reconciliation for the readiness-hardening migration after Supabase assigned its applied version.

The current repository migration filename and production ledger both use `20260819162037_harden_release_readiness_security.sql`. Historical applied migrations remain unchanged.

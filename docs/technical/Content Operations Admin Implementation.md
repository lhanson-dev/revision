# Content Operations Admin Implementation

Status: Operations Dashboard implementation merged to `main` in PR #52. Database-backed admin assignment and Google OAuth are live. The Admin assurance expansion described below is a governed target; the new assurance telemetry/defect aggregation is not yet implemented. The admin metrics migration and Edge Function production enablement from PR #52 still require deployment verification before their live status is represented as Healthy.

## Purpose

Record the protected Founder operations capability inside Revision's canonical React application and its relationship to Supabase operational data, GitHub deployment evidence, assurance evidence and the governed Content Factory.

## Route and runtime boundary

- Canonical application: `/app/`
- Standard learner destinations: Home / Subjects / Progress / REV
- Role-gated Admin landing view: `/app/#/admin`
- Current protected detail views: `/app/#/admin/users`, `/app/#/admin/activity`, `/app/#/admin/health`, `/app/#/admin/content`
- Target assurance detail view: `/app/#/admin/assurance`
- Public root: `/`

There is no standalone `/admin/` HTML entry point or separate Admin React bootstrap.

For a database-approved administrator, desktop primary navigation exposes an additional **Admin** item. Mobile preserves the four-item learner bottom navigation and exposes Admin through the account/additional-links drawer.

For ordinary learner accounts, the Admin item is absent.

## Operations Dashboard

The Admin landing view is a high-level operations summary rather than a dense back-office console.

It currently presents:

- overall health and known items needing attention;
- total learner accounts excluding admin/test classifications;
- learners with recorded learning activity in the last 7 days;
- recorded learning activities in the last 7 days;
- Content Factory job state at a high level;
- published course/component counts derived from the current learner catalogue; and
- click-through navigation to Users, Activity, System Health and Content Operations.

The dashboard deliberately distinguishes **recorded learning activity** from general app usage. Revision does not currently collect governed page-view/session telemetry, so the dashboard does not invent reading time, session duration, DAU based on visits or REV usage counts.

## Founder assurance target

The next Admin assurance increment should add a dedicated **Assurance** view rather than overloading System Health.

The landing dashboard should gain a compact **Founder assurance confidence** summary with five independently evidenced cards:

1. **Production** — Is the canonical live product up and serving the expected production revision?
2. **Path to live** — Did the current production lineage pass required CI, deployment and post-deployment smoke?
3. **Critical journeys** — Which declared learner/Admin journeys are Covered, Partial, Uncovered or Unknown at their required layer?
4. **Data & security** — Which declared database/security controls have current automated evidence?
5. **Defects** — Open P0/P1/P2 counts and the highest current severity.

The cards should not be collapsed into one numeric confidence score. A single score would hide important differences, such as production being reachable while RLS assurance remains Partial.

### Recommended Assurance detail layout

The Assurance view should be organised in this order:

**A. Current confidence banner**
- overall operational state: Healthy / Attention needed / Unknown;
- production commit/revision being assessed;
- generated/evidence timestamp;
- highest open defect severity;
- a plain-language explanation of any condition preventing Healthy.

**B. Production & path to live**
- live `/app/` reachability;
- deployed revision;
- latest required PR/main CI evidence where applicable;
- production deployment result;
- production smoke result;
- backend/database/Edge Function readiness where the deployed feature depends on them;
- evidence freshness.

**C. Critical journey coverage**
A table/card matrix driven by `90-governance-registers/Assurance Coverage Register.md`, showing:
- journey/control name;
- risk;
- required assurance layer;
- current coverage state;
- latest evidence source/run;
- gap or next action.

Filters should allow Founder focus on Uncovered/Partial and Critical/High risk first.

**D. Data & security assurance**
A focused control list for:
- learner data ownership/RLS;
- evidence persistence/reload;
- Admin authorization;
- privileged database-function execution boundaries;
- secret/server-side credential controls;
- test/admin exclusion from live metrics.

**E. Defects**
Headline counts for P0 / P1 / P2 plus drill-down records showing:
- title;
- severity;
- affected journey/control;
- current status;
- evidence/impact;
- next action;
- linked fix PR and verification where present.

Open P0 must dominate the view. Open P1 must visibly mark the affected assurance domain Attention needed. P2 remains visible without making unrelated domains unhealthy.

### Truthfulness rules for the UI

- Do not show a zero defect count until a durable defect source has been queried successfully; otherwise show Unknown.
- Do not show a coverage percentage unless the denominator is the declared critical journey/control register and the weighting rule is explicit.
- Prefer counts such as `12 Covered · 5 Partial · 2 Uncovered` over an unexplained `86% covered`.
- Planned tests never count as Covered.
- A successful PR CI run does not prove production health.
- A successful static Pages deployment does not prove database migrations/Edge Functions/secrets are healthy.
- Stale evidence degrades to Unknown.
- Every status should expose its evidence source and last-checked time on drill-down.

## Users detail

The Users detail view shows aggregate operational information only:

- learner count;
- new learners over 7/30 days;
- learners with recorded activity over 1/7/30 days;
- 14-day learner-signup trend; and
- counts of admin/test accounts excluded from learner metrics.

It does not expose learner email addresses or private learner content in this initial implementation.

## Activity detail

The Activity detail view is derived from `public.learning_evidence` and can show:

- evidence events over 7/30 days;
- flashcard, multiple-choice, exam-question and exam-attempt counts;
- distinct topics/modules with evidence;
- latest real-learner evidence timestamp;
- 14-day activity trend; and
- module/course/component activity breakdown.

No global average score is calculated across heterogeneous evidence types.

## System Health detail

The protected `admin-operations` Edge Function returns plain-language health checks using the governed statuses **Healthy**, **Attention needed** and **Unknown**.

Current implementation checks include:

- authenticated admin access;
- database/metrics availability;
- learner-evidence data availability;
- production `/app/` reachability;
- latest `main` Pages deployment/smoke result where GitHub evidence is available; and
- Content Factory intake readiness.

Missing external evidence is reported as **Unknown**, not Healthy.

System Health should remain focused on runtime/service health. Assurance coverage, path-to-live lineage and defect governance should move to the dedicated Assurance view as that implementation is added.

## Authentication and admin assignment

Learners and administrators use the same Supabase Auth sign-in experience in `/app/`.

`public.profiles.is_admin` is database-owned. The production migration is applied and `leehanson@hotmail.com` is the current administrator. The separate Google-linked `lhanson@gmail.com` account remains a test/non-admin account.

The browser uses `profiles.is_admin` only to decide whether to present the Admin entry point and screen. That UI check is not treated as privileged authorization.

## Protected metrics boundary

Cross-user metrics are not made available by weakening learner RLS.

The server-side Edge Function `admin-operations`:

1. requires an authenticated request;
2. resolves the authenticated user through Supabase Auth;
3. rechecks that user's own `profiles.is_admin` value under learner RLS;
4. returns `403` unless the database admin flag is true;
5. only then uses the server-side Supabase service role to call the restricted aggregate database function `public.admin_operations_metrics()`;
6. reads public GitHub operational evidence for Pages deployment and Content Factory Issue records; and
7. returns aggregate metrics and health evidence to the Admin UI.

The browser never receives the service-role credential.

### Aggregate SQL function

`public.admin_operations_metrics()` performs aggregation inside PostgreSQL so Admin statistics do not depend on downloading an unbounded set of learner rows into the Edge Function.

The function is `SECURITY DEFINER` with a fixed search path and exposes no parameters. Execution is revoked from `public`, `anon` and `authenticated` and granted only to `service_role`.

Learner engagement queries exclude:

- `profiles.is_test_user = true`; and
- `profiles.is_admin = true`.

## Assurance telemetry implementation direction

The Assurance view should be fed from machine-readable evidence rather than hard-coded labels.

A practical implementation sequence is:

1. make the Assurance Coverage Register available to build/runtime as a validated machine-readable manifest or generated JSON representation;
2. collect current GitHub CI/deployment/smoke evidence with commit IDs and timestamps;
3. make database/RLS/Edge Function verification tests executable automatically rather than leaving SQL files as manual assets;
4. add integration/browser tests that close the current persistence/security gaps in the register;
5. establish a durable defect record source using the governed P0/P1/P2 taxonomy;
6. aggregate those evidence sources server-side through the protected Admin boundary;
7. add `/app/#/admin/assurance` plus landing-page summary cards;
8. add responsive browser tests for the new Assurance view and truthfulness/Unknown states.

The runtime should never infer Covered from the existence of a test filename. Coverage is established by the declared register plus successful current evidence for the required test/check.

## Content Operations

The Content Operations detail view retains Add Course and current factory-job visibility.

Add Course invokes `content-factory-intake`.

The function requires authenticated database-backed admin access before creating a GitHub Issue job. The implementation also exposes an admin-authenticated read-only `GET` health response so the Operations Dashboard can distinguish an undeployed/unconfigured intake function from a ready one without creating a job.

The write path still requires the deployment secret `GITHUB_CONTENT_FACTORY_TOKEN`.

The token must be narrowly scoped to the Revision repository with the minimum Issue write access needed by this function. It must not be committed to Git or returned to the browser.

The Dashboard reads Content Factory Issue records as operational evidence only. Job state never overrides educational authority, publication gates, CI or explicit Founder merge approval.

## Production enablement

Static Pages deployment alone does not enable the operations backend.

PR #52 merged the repository implementation. Production operational confidence still requires verification of the backend enablement steps recorded by that change:

1. apply/verify the approved `admin_operations_metrics` database migration;
2. deploy/verify `admin-operations` with authenticated JWT verification enabled;
3. deploy/verify the approved `content-factory-intake` version with authenticated JWT verification enabled;
4. configure/verify `GITHUB_CONTENT_FACTORY_TOKEN` before Add Course can be reported Healthy;
5. verify the Admin dashboard loads only for the database-approved administrator;
6. verify the test account remains unable to see/open Admin;
7. verify test/admin data is excluded from learner engagement metrics;
8. verify system-health Unknown/Attention states are truthful; and
9. run one governed Add Course smoke only when the Content Factory GitHub secret is configured.

The project currently uses Supabase's hosted legacy `SUPABASE_SERVICE_ROLE_KEY` inside server-side Edge Functions. Migration to the newer secret-key model should occur before the legacy key is retired.

## Assurance

Repository assurance currently includes TypeScript/lint/build checks, unit tests, responsive browser assurance and a production Pages smoke. The new Assurance Coverage Register deliberately records several data/security/persistence areas as Partial or Uncovered until repeatable automated evidence exists.

Future implementation should close those gaps rather than changing the labels.

## Documentation impact

This document records current Admin implementation truth and the target technical direction required by the updated Testing & Assurance, Observability & Operations, and Release & Deployment standards. The current coverage state is maintained in `90-governance-registers/Assurance Coverage Register.md`.

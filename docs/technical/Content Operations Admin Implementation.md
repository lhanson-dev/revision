# Content Operations Admin Implementation

Status: Operations Dashboard implementation candidate on governed branch. Production currently has database admin assignment and Google OAuth enabled; the new metrics endpoint/database aggregate and Content Factory Edge Function deployment remain post-merge production enablement steps.

## Purpose

Record the protected Founder operations capability inside Revision's canonical React application and its relationship to Supabase operational data, GitHub deployment evidence and the governed Content Factory.

## Route and runtime boundary

- Canonical application: `/app/`
- Standard learner destinations: Home / Subjects / Progress / REV
- Role-gated Admin landing view: `/app/#/admin`
- Protected detail views: `/app/#/admin/users`, `/app/#/admin/activity`, `/app/#/admin/health`, `/app/#/admin/content`
- Public root: `/`

There is no standalone `/admin/` HTML entry point or separate Admin React bootstrap.

For a database-approved administrator, desktop primary navigation exposes an additional **Admin** item. Mobile preserves the four-item learner bottom navigation and exposes Admin through the account/additional-links drawer.

For ordinary learner accounts, the Admin item is absent.

## Operations Dashboard

The Admin landing view is a high-level operations summary rather than a dense back-office console.

It presents:

- overall health and known items needing attention;
- total learner accounts excluding admin/test classifications;
- learners with recorded learning activity in the last 7 days;
- recorded learning activities in the last 7 days;
- Content Factory job state at a high level;
- published course/component counts derived from the current learner catalogue; and
- click-through navigation to Users, Activity, System Health and Content Operations.

The dashboard deliberately distinguishes **recorded learning activity** from general app usage. Revision does not currently collect governed page-view/session telemetry, so the dashboard does not invent reading time, session duration, DAU based on visits or REV usage counts.

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

Initial checks are:

- authenticated admin access;
- database/metrics availability;
- learner-evidence data availability;
- production `/app/` reachability;
- latest `main` Pages deployment/smoke result where GitHub evidence is available; and
- Content Factory intake readiness.

Missing external evidence is reported as **Unknown**, not Healthy.

## Authentication and admin assignment

Learners and administrators use the same Supabase Auth sign-in experience in `/app/`.

`public.profiles.is_admin` is database-owned. The production migration is applied and `leehanson@hotmail.com` is the current administrator. The separate Google-linked `lhanson@gmail.com` account remains a test/non-admin account.

The browser uses `profiles.is_admin` only to decide whether to present the Admin entry point and screen. That UI check is not treated as privileged authorization.

## Protected metrics boundary

Cross-user metrics are not made available by weakening learner RLS.

A new server-side Edge Function:

`admin-operations`

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

## Content Operations

The Content Operations detail view retains Add Course and adds current factory-job visibility.

Add Course invokes:

`content-factory-intake`

The function requires authenticated database-backed admin access before creating a GitHub Issue job. The implementation also exposes an admin-authenticated read-only `GET` health response so the Operations Dashboard can distinguish an undeployed/unconfigured intake function from a ready one without creating a job.

The write path still requires the deployment secret:

`GITHUB_CONTENT_FACTORY_TOKEN`

The token must be narrowly scoped to the Revision repository with the minimum Issue write access needed by this function. It must not be committed to Git or returned to the browser.

The Dashboard reads Content Factory Issue records as operational evidence only. Job state never overrides educational authority, publication gates, CI or explicit Founder merge approval.

## Production enablement

Static Pages deployment alone does not enable the operations backend.

After the governed PR is merged, production enablement requires:

1. apply the approved `admin_operations_metrics` database migration;
2. deploy `admin-operations` with authenticated JWT verification enabled;
3. deploy the approved `content-factory-intake` version with authenticated JWT verification enabled;
4. configure `GITHUB_CONTENT_FACTORY_TOKEN` before Add Course can be reported Healthy;
5. verify the Admin dashboard loads only for the database-approved administrator;
6. verify the test account remains unable to see/open Admin;
7. verify test/admin data is excluded from learner engagement metrics;
8. verify system-health Unknown/Attention states are truthful; and
9. run one governed Add Course smoke only when the Content Factory GitHub secret is configured.

The project currently uses Supabase's hosted legacy `SUPABASE_SERVICE_ROLE_KEY` inside server-side Edge Functions. Supabase documentation states that hosted functions still receive this legacy variable during the 2026 key-transition period; migration to the newer secret-key model should occur before the legacy key is retired.

## Assurance

Repository assurance should cover:

- TypeScript/lint/build coverage for the Admin dashboard and detail views;
- generic Admin hash routing under `/app/#/admin/...`;
- ordinary accounts receiving no Admin navigation;
- database-admin accounts receiving Admin without changing the four-item mobile learner navigation;
- mock-backed browser verification of dashboard metrics, health and detail navigation;
- SQL privilege verification for the aggregate function;
- no test/admin activity in learner headline metrics; and
- the existing Pages production smoke for the canonical `/app/` entry point.

## Documentation impact

This implementation follows the Founder-approved v0.2 Content Operations Admin amendment and the Observability & Operations Standard. It does not alter learner navigation, learner publication rules or the Founder merge boundary.

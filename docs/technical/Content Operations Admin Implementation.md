# Content Operations Admin Implementation

Status: Operations Dashboard implementation merged in PR #52. Founder Assurance v1 is implemented on `implementation/founder-assurance-v1` and is pending Founder-approved merge. Database-backed admin assignment and Google OAuth are live. Dynamic CI lineage, durable defect aggregation and several database/security assurance gaps remain follow-on work. The admin metrics migration and Edge Function production enablement from PR #52 still require deployment verification before their live status is represented as Healthy.

## Purpose

Record the protected Founder operations capability inside Revision's canonical React application and its relationship to Supabase operational data, GitHub deployment evidence, assurance evidence and the governed Content Factory.

## Route and runtime boundary

- Canonical application: `/app/`
- Standard learner destinations: Home / Subjects / Progress / REV
- Role-gated Admin landing view: `/app/#/admin`
- Protected detail views: `/app/#/admin/users`, `/app/#/admin/activity`, `/app/#/admin/health`, `/app/#/admin/assurance`, `/app/#/admin/content`
- Public root: `/`

There is no standalone `/admin/` HTML entry point or separate Admin React bootstrap.

For a database-approved administrator, desktop primary navigation exposes an additional **Admin** item. Mobile preserves the four-item learner bottom navigation and exposes Admin through the account/additional-links drawer. Ordinary learner accounts do not see Admin.

## Operations Dashboard

The Admin landing view is a high-level operations summary rather than a dense back-office console.

It presents:

- overall health and known items needing attention;
- a compact Founder Assurance summary;
- total learner accounts excluding admin/test classifications;
- learners with recorded learning activity in the last 7 days;
- recorded learning activities in the last 7 days;
- Content Factory job state at a high level;
- published course/component counts derived from the learner catalogue; and
- click-through navigation to Users, Activity, System Health, Assurance and Content Operations.

The dashboard deliberately distinguishes **recorded learning activity** from general app usage. Revision does not currently collect governed page-view/session telemetry, so it does not invent reading time, session duration, DAU based on visits or REV usage counts.

## Founder Assurance v1

Founder Assurance is a dedicated Admin detail view rather than an extension of System Health.

It answers five separate questions:

1. **Production** — current protected evidence that the canonical `/app/` route is reachable.
2. **Path to live** — current deployment/smoke evidence, while remaining `Unknown` until exact-head CI → merge → deploy lineage is correlated.
3. **Critical journeys** — Covered / Partial / Uncovered / Unknown counts and rows from the governed Assurance Coverage Register.
4. **Data & security** — the same governed coverage states for declared data/security controls.
5. **Defects** — `Unknown` until a durable P0/P1/P2 source exists; v1 never invents a zero defect count.

The cards are not collapsed into a numeric confidence score.

### Coverage source

`src/assurance/coverage-register.ts` imports `90-governance-registers/Assurance Coverage Register.md` as raw build input and parses the governed table into typed runtime records.

This is an implementation projection, not a second source of truth. The runtime does not infer coverage from test filenames or maintain a separate manually edited list.

The projection exposes:

- stable assurance ID;
- journey/control name;
- risk;
- required assurance layer;
- current evidence source;
- governed headline state;
- gap/next action.

Unrecognised coverage wording fails to `Unknown` rather than being treated as Covered.

### Dynamic evidence boundary

Current production and deployment signals continue to come from the protected `admin-operations` Edge Function. v1 deliberately keeps dynamic evidence separate from the static coverage model.

A successful deployment/smoke check alone is not sufficient to make **Path to live** Healthy. Exact-head PR CI, Founder approval/merge, resulting `main` commit and production deployment still need to be correlated into one evidence chain.

### Truthfulness rules

- Do not show a zero defect count until a durable defect source has been queried successfully; otherwise show Unknown.
- Do not show an unexplained coverage percentage.
- Planned tests never count as Covered.
- A successful PR CI run does not prove production health.
- A successful frontend deployment does not prove database migrations/Edge Functions/secrets are healthy.
- Missing evidence remains Unknown.
- Partial and Uncovered controls remain visible until repeatable evidence closes them.

## Users detail

The Users view shows aggregate operational information only:

- learner count;
- new learners over 7/30 days;
- learners with recorded activity over 1/7/30 days;
- 14-day learner-signup trend; and
- counts of admin/test accounts excluded from learner metrics.

It does not expose learner email addresses or private learner content.

## Activity detail

The Activity view is derived from `public.learning_evidence` and can show:

- evidence events over 7/30 days;
- flashcard, multiple-choice, exam-question and exam-attempt counts;
- distinct topics/modules with evidence;
- latest real-learner evidence timestamp;
- 14-day activity trend; and
- module/course/component activity breakdown.

No global average score is calculated across heterogeneous evidence types.

## System Health detail

The protected `admin-operations` Edge Function returns plain-language health checks using **Healthy**, **Attention needed** and **Unknown**.

Current checks include:

- authenticated admin access;
- database/metrics availability;
- learner-evidence data availability;
- production `/app/` reachability;
- latest `main` Pages deployment/smoke result where GitHub evidence is available; and
- Content Factory intake readiness.

Missing external evidence is **Unknown**, not Healthy. System Health remains focused on runtime/service health; assurance coverage and defects belong in Founder Assurance.

## Authentication and admin assignment

Learners and administrators use the same Supabase Auth sign-in experience in `/app/`.

`public.profiles.is_admin` is database-owned. The production migration is applied and `leehanson@hotmail.com` is the current administrator. The separate Google-linked `lhanson@gmail.com` account remains a test/non-admin account.

The browser uses `profiles.is_admin` only to decide whether to present Admin. That UI check is not privileged authorization.

## Protected metrics boundary

Cross-user metrics are not made available by weakening learner RLS.

The server-side `admin-operations` Edge Function:

1. requires an authenticated request;
2. resolves the user through Supabase Auth;
3. rechecks the user's own `profiles.is_admin` value under learner RLS;
4. returns `403` unless the database admin flag is true;
5. only then uses the server-side Supabase service role to call `public.admin_operations_metrics()`;
6. reads public GitHub operational evidence for Pages deployment and Content Factory Issue records; and
7. returns aggregate metrics and health evidence to Admin.

The browser never receives the service-role credential.

### Aggregate SQL function

`public.admin_operations_metrics()` aggregates inside PostgreSQL. It is `SECURITY DEFINER` with a fixed search path, execution revoked from `public`, `anon` and `authenticated`, and granted only to `service_role`.

Learner engagement queries exclude `profiles.is_test_user = true` and `profiles.is_admin = true`.

## Content Operations

Content Operations retains Add Course and Content Factory job visibility. Add Course invokes `content-factory-intake`, which requires authenticated database-backed admin access before creating a GitHub Issue job.

The write path requires `GITHUB_CONTENT_FACTORY_TOKEN`, narrowly scoped to the Revision repository with only the Issue write capability needed. The token must never be committed or returned to the browser.

Content Factory job state is operational evidence only. It never overrides educational authority, publication gates, CI or explicit Founder merge approval.

## Production enablement

Static Pages deployment alone does not enable the operations backend.

PR #52 repository implementation still requires verified production enablement of:

1. `admin_operations_metrics` migration;
2. `admin-operations` with authenticated JWT verification;
3. `content-factory-intake` with authenticated JWT verification;
4. `GITHUB_CONTENT_FACTORY_TOKEN` before Add Course can be reported Healthy;
5. Admin access only for the database-approved administrator;
6. non-admin/test account denial;
7. exclusion of test/admin data from learner metrics;
8. truthful Unknown/Attention states; and
9. one governed Add Course smoke only when the factory secret is configured.

The project currently uses Supabase's hosted legacy `SUPABASE_SERVICE_ROLE_KEY` inside server-side Edge Functions. Migration to the newer secret-key model should occur before the legacy key is retired.

## Assurance coverage

Repository assurance includes TypeScript/lint/build checks, unit tests, responsive browser assurance and a production Pages smoke.

Founder Assurance v1 adds:

- unit assurance for parsing the governed coverage register;
- browser assurance for the new `/app/#/admin/assurance` journey;
- explicit UI behaviour that keeps Path to live and Defects Unknown when required evidence is missing.

The Assurance Coverage Register still records data/security/persistence/accessibility/defect gaps as Partial or Uncovered where repeatable evidence does not exist. Future work must close those gaps rather than changing labels.

## Next implementation priorities

1. automated database/RLS verification;
2. learner evidence persistence/reload integration coverage;
3. Admin Edge Function 401/403/authorised integration coverage;
4. automated accessibility checks;
5. CI change-risk classification and assurance-plan artifact;
6. exact CI → merge → deployment → smoke correlation;
7. durable P0/P1/P2 records and protected aggregation;
8. targeted production journey smokes selected by change risk.

## Documentation impact

This document records current Admin implementation truth for Founder Assurance v1. `docs/technical/Founder Assurance Implementation.md` contains the more detailed assurance implementation model, while `90-governance-registers/Assurance Coverage Register.md` remains the current coverage source of truth. No normative authority change is required because v1 implements already approved Founder Assurance authority.

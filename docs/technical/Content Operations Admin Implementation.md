# Content Operations Admin Implementation

Status: Operations Dashboard implementation merged to `main` in PR #52. Database-backed admin assignment and Google OAuth are live. PR #58 adds adaptive-planner capability, planner-specific protected assurance and aggregate planner operations metrics. Founder Assurance v1 is implemented on `implementation/founder-assurance-v1-main-refresh` and is pending Founder-approved merge. Dynamic exact-head CI lineage, durable defect aggregation and several database/security assurance gaps remain follow-on work. The production backend components described below must be verified before their live status is represented as Healthy.

## Purpose

Record the protected Founder operations capability inside Revision's canonical React application and its relationship to Supabase operational data, GitHub deployment evidence, assurance evidence, adaptive planning and the governed Content Factory.

## Route and runtime boundary

- Canonical application: `/app/`
- Standard learner destinations: **Home / Plan / REV / Progress / Subjects**
- Role-gated Admin landing view: `/app/#/admin`
- Protected Admin detail views: `/app/#/admin/users`, `/app/#/admin/activity`, `/app/#/admin/health`, `/app/#/admin/assurance`, `/app/#/admin/content`
- Planner-specific protected assurance capability introduced by FI-001: `/app/#/admin/planner` where exposed by the planner implementation
- Public root: `/`

There is no standalone `/admin/` HTML entry point or separate Admin React bootstrap.

For a database-approved administrator, Admin remains a secondary utility rather than a sixth learner destination. The learner runtime preserves the governed five-destination navigation on desktop and mobile. Admin and planner-specific operational utilities remain role-gated secondary controls. Ordinary learner accounts must not see them.

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
- links to Users, Activity, System Health, Assurance and Content Operations.

The dashboard deliberately distinguishes **recorded learning activity** from general app usage. Revision does not currently collect governed page-view/session telemetry, so it does not invent reading time, session duration, DAU based on visits or REV usage counts.

## Planner assurance increment

FI-001 adds planner-specific protected assurance and server-side aggregate metrics for the adaptive planning loop. That evidence is narrower than the broader Founder Assurance view and remains governed by Adaptive Revision Planning, data ownership and security authority.

Planner assurance may surface, where backed by current data:

- learners with assessments/availability configured;
- planner activity states such as offered, started and completed;
- alternative-choice activity;
- priority-mode incidence; and
- planner data/service failures or Unknown states where evidence cannot be established.

These metrics are operational evidence only. They are not mastery, readiness or learner-success evidence. Planner context must not become learning evidence merely because it is visible operationally.

## Founder Assurance v1

Founder Assurance is a dedicated Admin detail view rather than an extension of System Health. It answers five separate questions:

1. **Production** — current protected evidence that the canonical `/app/` route is reachable.
2. **Path to live** — current deployment/smoke evidence, while remaining `Unknown` until exact-head CI → explicit Founder merge → resulting `main` commit → deployment/smoke lineage is correlated.
3. **Critical journeys** — Covered / Partial / Uncovered / Unknown counts and records from the governed Assurance Coverage Register, including the adaptive-planner journey.
4. **Data & security** — the same governed states for declared data/security controls, including planner-specific DATA-04 and SEC-04.
5. **Defects** — `Unknown` until a durable P0/P1/P2 source exists; v1 never invents a zero defect count.

The five domains are not collapsed into a numeric confidence score.

### Governed coverage projection

`src/assurance/coverage-register.ts` imports `90-governance-registers/Assurance Coverage Register.md` as raw build input and parses the governed table into typed runtime records.

This is an implementation projection, not a second source of truth. The runtime does not infer coverage from test filenames and does not maintain a separate manually edited inventory.

The projection exposes:

- stable assurance ID;
- journey/control name;
- risk;
- required assurance layer;
- current evidence source;
- governed headline state; and
- gap/next action.

Qualified states such as `Covered at browser layer` are normalised to the governed headline state. Unrecognised coverage wording fails to `Unknown`. If a domain cannot be projected at all, the UI shows Unknown rather than misleading zero counts.

### Dynamic evidence boundary

Current production and deployment signals continue to come from the protected `admin-operations` Edge Function. Founder Assurance v1 deliberately keeps those dynamic checks separate from the static coverage model.

A successful deployment/smoke check alone is not sufficient to make **Path to live** Healthy. The implementation still needs to correlate exact-head PR CI, explicit Founder approval/merge, resulting `main` commit and production deployment into one evidence chain.

The UI shows the operations evidence refresh timestamp and retains Unknown when required evidence is absent.

### Truthfulness rules

- Do not show a zero defect count until a durable defect source has been queried successfully; otherwise show Unknown.
- Do not show an unexplained coverage percentage.
- Planned tests never count as Covered.
- A successful PR CI run does not prove production health.
- A successful frontend deployment does not prove database migrations, Edge Functions or secrets are healthy.
- Missing or stale evidence remains Unknown.
- Partial and Uncovered controls remain visible until repeatable evidence closes them.
- Planner-specific operational metrics do not override the broader coverage register or turn planning context into mastery/readiness evidence.

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

Missing external evidence is **Unknown**, not Healthy. System Health remains focused on runtime/service health; assurance coverage, path-to-live lineage and defect governance belong in Founder Assurance.

## Authentication and admin assignment

Learners and administrators use the same Supabase Auth sign-in experience in `/app/`.

`public.profiles.is_admin` is database-owned. The production migration is applied and `leehanson@hotmail.com` is the current administrator. The separate Google-linked `lhanson@gmail.com` account remains a test/non-admin account.

The browser uses `profiles.is_admin` only to decide whether to present Admin. That UI check is not privileged authorization.

## Protected server boundary

Cross-user operational metrics are not made available by weakening learner RLS.

The server-side `admin-operations` Edge Function:

1. requires an authenticated request;
2. resolves the user through Supabase Auth;
3. rechecks the user's own `profiles.is_admin` value under learner RLS;
4. returns `403` unless the database admin flag is true;
5. only then uses the server-side Supabase service role to call `public.admin_operations_metrics()`;
6. reads approved operational evidence; and
7. returns aggregate metrics and health evidence to Admin.

The browser never receives the service-role credential.

`public.admin_operations_metrics()` aggregates inside PostgreSQL. It is `SECURITY DEFINER` with a fixed search path, execution revoked from `public`, `anon` and `authenticated`, and granted only to `service_role`. Learner metrics exclude test and admin accounts.

FI-001 planner metrics follow the same aggregate-first principle. Cross-user planner rows must not become browser-readable merely to support Founder reporting, and planner operational aggregation must re-authorise server-side.

## Content Operations

Content Operations retains Add Course and Content Factory job visibility. Add Course invokes `content-factory-intake`, which requires authenticated database-backed admin access before creating a GitHub Issue job.

The write path requires `GITHUB_CONTENT_FACTORY_TOKEN`, narrowly scoped to the Revision repository with only the Issue write capability needed. The token must never be committed or returned to the browser.

Content Factory job state is operational evidence only. It never overrides educational authority, publication gates, CI or explicit Founder merge approval.

## Production enablement

Static Pages deployment alone does not enable separately deployed backend components.

The Operations/Admin backend requires verified production enablement of the approved database migrations, `admin-operations`, `content-factory-intake`, required server-side secrets and role boundaries before those components can be represented as Healthy.

FI-001 additionally introduces planner migrations and a `planner-operations` server-side function. Those components require deployment/readiness verification before planner assurance is represented as operationally Healthy in production.

The project currently uses Supabase's hosted legacy `SUPABASE_SERVICE_ROLE_KEY` inside server-side Edge Functions. Migration to the newer secret-key model should occur before the legacy key is retired.

## Assurance coverage

Repository assurance includes TypeScript/lint/build checks, unit tests, responsive browser assurance and a production Pages smoke. FI-001 extends domain/browser coverage across Home → Plan → REV and adds planner-specific SQL verification assets.

Founder Assurance v1 adds:

- unit assurance for parsing the governed coverage register;
- browser assurance for `/app/#/admin/assurance`;
- explicit presentation of the planner journey/control rows now present in the register;
- explicit UI behaviour that keeps Path to live and Defects Unknown when required evidence is missing; and
- fail-safe Unknown presentation if a coverage domain cannot be projected.

The Assurance Coverage Register continues to mark database/RLS/persistence/accessibility/defect gaps Partial or Uncovered where repeatable evidence does not exist. Future work must close those gaps rather than changing the labels.

## Next implementation priorities

1. automate database/RLS verification, including adaptive-planner SQL/RLS checks;
2. add learner evidence and planner persistence/reload integration coverage;
3. add Admin/planner operations 401/403/authorised integration coverage;
4. add automated accessibility checks across Home / Plan / REV and other critical learner journeys;
5. implement CI change-risk classification and assurance-plan artifacts;
6. correlate exact CI → merge → deployment → smoke evidence;
7. establish durable P0/P1/P2 records and protected aggregation; and
8. add targeted production journey smokes selected by change risk.

## Documentation impact

This document records current Admin implementation truth while preserving the FI-001 adaptive-planner implementation introduced on `main`. `docs/technical/Founder Assurance Implementation.md` contains the detailed Founder Assurance model, while `90-governance-registers/Assurance Coverage Register.md` remains the current coverage source of truth. No normative authority change is required because Founder Assurance v1 implements already-approved authority.

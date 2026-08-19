# Founder Assurance Implementation

Status: Founder Assurance v1 is implemented on `main`. PR #62 adds automated isolated database/RLS assurance and reconciles repository migration history to production truth. Dynamic CI lineage, durable defect aggregation, persistence/reload integration, Edge Function authorised-path integration and accessibility assurance remain follow-on work until implemented and verified.

## Purpose

Define and record how Revision implements the living Founder assurance model so operational confidence grows with the product and test execution remains proportionate to change risk.

This document implements the intent of:

- `50-engineering-standards/Testing & Assurance Standard.md`;
- `50-engineering-standards/Observability & Operations Standard.md`;
- `50-engineering-standards/Release & Deployment Standard.md`;
- `90-governance-registers/Assurance Coverage Register.md`; and
- `10-product-governance/Core User Journeys.md`.

It does not replace those authorities.

## Canonical runtime

The implementation is inside the existing role-gated Admin capability in the canonical React runtime:

- application: `/app/`;
- Admin landing: `/app/#/admin`;
- Founder Assurance: `/app/#/admin/assurance`;
- existing protected evidence service: `supabase/functions/admin-operations`.

No second Admin application or alternate login/runtime is introduced.

## Implemented in v1

### Governed coverage projection

`src/assurance/coverage-register.ts` imports `90-governance-registers/Assurance Coverage Register.md` as raw build input and parses the governed table into typed coverage records.

This avoids a competing manually maintained runtime coverage inventory. The Markdown register remains the current-state source of truth; the runtime projection is implementation derived from it.

The parser:

- recognises stable assurance IDs;
- preserves risk, required layer, evidence source, baseline status and gap/next action;
- normalises qualified states such as `Covered at browser layer` to the governed headline state `Covered`;
- fails unrecognised status text to `Unknown` rather than inventing coverage;
- is unit tested in `src/assurance/coverage-register.test.ts`.

### Founder Assurance Admin view

`src/app/FounderAssurance.tsx` provides `/app/#/admin/assurance`.

It presents five separate Founder questions:

1. **Production** — derived from the protected `learner-app` production reachability check.
2. **Path to live** — uses current deployment/smoke evidence but remains `Unknown` while exact-head CI → merge → deploy correlation is not implemented.
3. **Critical journeys** — counts and detailed rows derived directly from the governed coverage register.
4. **Data & security** — counts and detailed rows derived directly from the governed coverage register.
5. **Defects** — deliberately reports `Unknown` while `DEF-01` remains Uncovered and no durable P0/P1/P2 source exists.

The page also exposes the underlying journey/control records with risk, evidence source and gap/next action. It does not calculate a single confidence percentage.

### Admin landing summary

The existing `/app/#/admin` landing page includes a compact Founder Assurance summary linking to the detailed view. It keeps System Health and Assurance separate:

- System Health answers whether current services/checks are working now;
- Founder Assurance answers why the Founder should trust the product and where coverage still has gaps.

### Browser assurance

`tests/e2e/admin-operations.spec.ts` covers the Founder Assurance summary, navigation to the Assurance view, production evidence presentation, truthful Unknown states and visibility of governed journey/data-control rows. The browser test uses controlled mocks and therefore proves presentation behaviour, not production backend/data integration.

## Automated database and RLS assurance

PR #62 adds a separate `Database and RLS assurance` CI job. It starts an isolated Supabase stack, replays the version-controlled migration chain from zero and runs `supabase/tests/database-assurance.test.sql` through pgTAP. No production learner data is used.

The suite proves the current declared scope including:

- `learning_evidence` RLS is enabled and only the intended owner policies exist;
- anonymous users cannot read learner evidence;
- authenticated learners retain append-only select/insert privileges without update/delete;
- one authenticated learner can read/insert their own learning evidence but cannot insert evidence for another learner;
- all five adaptive-planner persistence tables have RLS and owner-scoped `USING`/`WITH CHECK` policies;
- a learner can create their own planner assessment but cannot create one for another learner;
- browser roles cannot execute the privileged Admin aggregate functions while `service_role` can;
- the public release-readiness contract remains callable; and
- the release-readiness RPC runs as `SECURITY INVOKER`, not with unnecessary elevated execution.

The repository migration filenames are reconciled to the exact versions recorded in the production Supabase migration ledger. The original `create_revision_progress` migration was restored from the exact SQL retained by production. Already-applied historical migration SQL is preserved; new desired database behaviour is introduced only through forward migrations.

This automation closes the repeatability gap for the specific RLS/privilege controls it asserts. It does not by itself prove browser-to-database persistence/reload, Admin Edge Function authorised success paths or all planner lifecycle persistence behaviour.

## Core implementation rule

Assurance is a living product map, not a fixed regression pack.

Every material change must resolve:

1. which governed user journeys and controls are affected;
2. the risk level of the change;
3. the minimum required assurance layers for those affected journeys/controls;
4. whether existing tests still provide valid evidence;
5. which tests/checks must run before merge;
6. which checks must run after deployment; and
7. whether the Assurance Coverage Register changes.

A new feature or journey is not complete merely because its implementation works locally. Its assurance ownership and required evidence must be recorded as part of the same governed change.

## Risk classification

Risk is determined by blast radius and consequence, not by number of files or lines changed.

### Level 1 — Low

Typical examples include documentation-only changes, copy changes, isolated visual styling with no behavioural change and bounded internal refactors with no shared contract change.

Expected pre-merge assurance is relevant static/schema checks, typecheck/lint where code changed, targeted unit assurance where domain logic changed and a production build where runtime code changed. Full browser regression is not required by default.

### Level 2 — Medium

Typical examples include bounded learner-facing behaviour, one page/journey interaction, local form/navigation behaviour or a non-shared component affecting an identified journey.

Expected assurance adds targeted unit/integration coverage, targeted Playwright coverage for the affected journey and relevant responsive/accessibility assurance.

### Level 3 — High

Typical examples include authentication/authorization, RLS/security boundaries, learner evidence/progress persistence, database migrations, shared navigation/runtime infrastructure, shared readiness/scoring engines, exam behaviour and shared APIs/data contracts.

Expected assurance includes deterministic integration/database/security verification plus regression across every critical journey/control depending on the changed shared component. Scope is dependency-led rather than automatically the entire site.

### Level 4 — Critical

Typical examples include major authentication replacement, destructive/high-blast-radius data migration, canonical runtime cutover or security incident remediation.

Expected assurance adds full relevant regression, recovery/rollback verification, enhanced production smoke and Founder-visible residual risk.

## Target CI implementation

Risk-based CI selection is not yet implemented. The target remains:

1. inspect changed files and declared affected journeys/controls;
2. calculate a proposed risk level;
3. produce a machine-readable assurance plan;
4. run mandatory foundation checks;
5. run targeted checks selected from journey/control dependencies;
6. escalate to broader regression for Level 3/4 changes;
7. publish selected scope, reason and results as an assurance artifact;
8. block merge readiness if required evidence is missing or failed.

The assurance plan should include change risk, classification reason, affected journeys/controls, selected checks, checks not required, results and exact commit SHA.

## Path-to-live implementation

Pre-merge evidence and production evidence remain separate.

The protected operations service provides production reachability and latest deployment/smoke evidence. Founder Assurance intentionally does not mark Path to live Healthy from that alone.

Follow-on implementation must correlate:

- PR/head SHA and required CI result;
- explicit Founder approval and merge;
- resulting `main` commit;
- production deployment run;
- production smoke result;
- backend/database deployment evidence where relevant; and
- latest operational observation.

Only then can Admin report a complete Path-to-live health state for the current production lineage.

## Data/security and defect boundary

Database/RLS automation only promotes controls whose required scope is now repeatably asserted. Persistence/reload and protected Edge Function authorised paths remain Partial until their additional required layers exist.

Founder Assurance still does not invent `0 P0 / 0 P1 / 0 P2`. Defects remain Unknown until a durable governed defect source can be queried successfully.

## Next implementation priorities

1. add real learner evidence persistence/reload integration coverage;
2. add protected Admin and Planner 401/403/authorised Edge Function integration coverage;
3. add automated accessibility checks for critical learner journeys;
4. implement CI risk classification and assurance-plan artifact;
5. correlate exact-head/main/deployment/smoke evidence;
6. establish durable P0/P1/P2 defect records;
7. aggregate those dynamic evidence sources through the protected Admin boundary;
8. add targeted production journey smokes selected by change risk.

## Truthfulness boundary

The Admin must show existing evidence only. Missing/stale evidence is Unknown. Planned risk-based CI selection, unimplemented persistence/integration coverage or defect aggregation must not be represented as live capability until implemented and verified.

## Documentation impact

Founder Assurance v1 added the Admin assurance presentation and machine-readable projection. PR #62 changes implementation truth by making a defined set of database/RLS controls repeatably executable in CI and reconciling migration history to production. The Assurance Coverage Register is updated only for controls whose required automated evidence is now proven; other gaps remain Partial/Uncovered.

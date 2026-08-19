# Founder Assurance Implementation

Status: Founder Assurance v1 is implemented on `main`. The governing strategy is active. Dynamic CI lineage, durable defect aggregation and stronger database/security assurance remain follow-on work until implemented and verified.

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

`src/app/FounderAssurance.tsx` provides the first `/app/#/admin/assurance` detail view.

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

`tests/e2e/admin-operations.spec.ts` covers:

- the Founder Assurance summary appearing on the Admin landing page;
- navigation to `/app/#/admin/assurance`;
- production evidence presentation;
- Path to live remaining Unknown when CI lineage is not correlated;
- defect state remaining Unknown without a durable source;
- governed journey/data-control rows being visible.

The test uses controlled browser mocks and therefore proves Admin presentation behaviour, not production backend/data integration.

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

Risk-based CI selection is **not implemented by v1**. The target remains:

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

The current protected operations service provides production reachability and latest deployment/smoke evidence. v1 intentionally does not mark Path to live Healthy from that alone.

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

v1 does not convert the existing manual/partial database and security checks into Covered evidence. The coverage register continues to report those rows Partial/Uncovered until repeatable automation exists.

Likewise, v1 does not invent `0 P0 / 0 P1 / 0 P2`. Defects remain Unknown until a durable governed defect source can be queried successfully.

## Next implementation priorities

1. automate database/RLS verification in CI or a governed integration environment;
2. add real learner evidence persistence/reload integration coverage;
3. add protected Admin 401/403/authorised Edge Function integration coverage;
4. add automated accessibility checks for critical learner journeys;
5. implement CI risk classification and assurance-plan artifact;
6. correlate exact-head/main/deployment/smoke evidence;
7. establish durable P0/P1/P2 defect records;
8. aggregate those dynamic evidence sources through the protected Admin boundary;
9. add targeted production journey smokes selected by change risk.

## Truthfulness boundary

The Admin must show existing evidence only. Missing/stale evidence is Unknown. Planned risk-based CI selection, database/security automation or defect aggregation must not be represented as live capability until implemented and verified.

## Documentation impact

This implementation changes current Admin behaviour and adds a machine-readable projection of the governed assurance register. The corresponding coverage register has been updated with `ADM-02` for the Founder Assurance presentation journey. No new normative authority is required because this implementation is within the already approved Founder Assurance scope.

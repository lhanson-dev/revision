# Founder Assurance Implementation

Status: Governed implementation direction on PR #55. The assurance strategy is defined in the active engineering standards on this branch; runtime telemetry, risk-based CI selection and the Admin Assurance view are follow-on implementation work and must not be represented as live until implemented and verified.

## Purpose

Define how Revision should implement the living Founder assurance model so operational confidence grows with the product and test execution remains proportionate to change risk.

This document implements the intent of:

- `50-engineering-standards/Testing & Assurance Standard.md`;
- `50-engineering-standards/Observability & Operations Standard.md`;
- `50-engineering-standards/Release & Deployment Standard.md`;
- `90-governance-registers/Assurance Coverage Register.md`; and
- `10-product-governance/Core User Journeys.md`.

It does not replace those authorities.

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

Typical examples:
- documentation-only changes;
- copy changes;
- isolated visual styling with no behavioural change;
- bounded internal refactors with no shared contract change.

Expected pre-merge assurance:
- relevant static/schema checks;
- typecheck/lint where code changed;
- targeted unit test if domain logic changed;
- production build where runtime code changed.

Full browser regression is not required by default.

### Level 2 — Medium

Typical examples:
- bounded learner-facing behaviour;
- one page or journey interaction change;
- local form/navigation behaviour with limited blast radius;
- non-shared component changes affecting an identified journey.

Expected pre-merge assurance:
- Level 1 checks;
- targeted unit/integration coverage;
- targeted Playwright coverage for the affected journey;
- relevant responsive/accessibility assurance for learner-facing changes.

Unrelated journeys should not be run merely to increase test volume.

### Level 3 — High

Typical examples:
- authentication or authorization;
- RLS/security boundaries;
- learner evidence/progress persistence;
- database migrations;
- shared navigation/runtime infrastructure;
- shared recommendation/readiness/scoring engine;
- exam assessment behaviour;
- shared APIs or data contracts used by multiple journeys.

Expected pre-merge assurance:
- all relevant lower-layer checks;
- integration/database/security verification for the changed boundary;
- regression across every critical journey/control that depends on the changed shared component;
- production build;
- explicit verification that the coverage register still reflects the affected controls.

The regression scope is dependency-led, not automatically the entire site.

### Level 4 — Critical

Typical examples:
- major authentication replacement;
- destructive or high-blast-radius data migration;
- canonical runtime/hosting cutover;
- security incident remediation;
- changes capable of widespread data loss, exposure or core-product outage.

Expected assurance:
- full relevant regression suite;
- explicit migration/recovery/rollback verification where applicable;
- enhanced production smoke after deployment;
- operational observation of the affected controls;
- Founder-visible disposition of any residual risk.

## Automatic escalation rules

The implementation should classify changed areas using repository paths plus declared dependencies, then allow deliberate human/agent escalation when context requires it.

At minimum, changes touching the following should default to Level 3 or above unless demonstrated otherwise:

- authentication/session code;
- Supabase migrations or RLS policies;
- privileged Edge Functions/RPCs;
- evidence persistence;
- progress/readiness/scoring engines;
- exam-attempt/assessment logic;
- shared routing/navigation;
- security/privacy controls.

If classification is uncertain, escalate rather than silently omit relevant assurance.

## Journey dependency mapping

The Assurance Coverage Register should evolve into a machine-readable manifest that links each critical journey/control to:

- governing authority;
- risk classification;
- runtime components/dependencies;
- required assurance layers;
- test/check identifiers;
- production-smoke requirement;
- evidence freshness expectation.

Example conceptual record:

```text
journey: practice-save-progress
risk: high
dependencies:
  - learning_evidence persistence
  - authenticated Supabase client
  - RLS learner ownership
required:
  - unit
  - integration/database
  - browser
  - production smoke after affected backend/data changes
```

This dependency mapping lets a shared RLS change select every journey that relies on learner-owned data without requiring a full unrelated visual regression.

## CI implementation direction

The target CI flow is:

1. inspect changed files and declared affected journeys/controls;
2. calculate a proposed risk level;
3. produce a machine-readable assurance plan;
4. run mandatory foundation checks;
5. run targeted checks selected from journey/control dependencies;
6. escalate to broader regression for Level 3/4 changes;
7. publish the selected scope, reason and results as an assurance artifact;
8. block merge readiness if required evidence is missing or failed.

The assurance plan should include:

- change risk level;
- reason for classification;
- affected journeys/controls;
- selected checks;
- checks deliberately not required;
- result of each required check;
- exact commit SHA.

This evidence should later feed the protected Admin Assurance view.

## Path-to-live implementation

Pre-merge evidence and production evidence remain separate.

For the merged production lineage, Admin should be able to correlate:

- PR/head SHA and required CI result;
- explicit Founder approval and merge;
- resulting `main` commit;
- production deployment run;
- production smoke result;
- backend/database deployment evidence where relevant;
- latest operational observation.

A Level 1 change may need only the standard production availability smoke. A Level 3/4 change may require targeted post-deployment smoke for the affected high-risk journey/control.

## Admin presentation

The future `/app/#/admin/assurance` view should expose, for the current production revision:

- Production status;
- Path-to-live status;
- Critical journey/control coverage;
- Data & security assurance;
- P0/P1/P2 defects.

For the latest change it should also show the selected assurance scope in plain language, for example:

```text
Change risk: Medium
Affected journeys: Authentication, Account creation
Required checks: 14
Passed: 14
Full-site regression: Not required
Reason: bounded authentication UI change; no shared auth/data contract changed
```

The view must never imply that tests which were deliberately not required have failed or are missing. It should distinguish **not required for this change** from **required but uncovered**.

## Living coverage maintenance

When product authority adds or changes a critical user journey:

1. update the Assurance Coverage Register;
2. assign its risk and required evidence layers;
3. add the appropriate automated assurance or record the gap as Partial/Uncovered;
4. update dependency mapping used by CI selection;
5. surface the new coverage state in Admin once telemetry exists.

This makes assurance grow with Revision rather than becoming a stale test pack.

## Initial implementation backlog

The next implementation should prioritise:

1. machine-readable assurance coverage/dependency manifest;
2. automated database/RLS integration tests;
3. real evidence persistence/reload journey coverage;
4. protected Admin 401/403/authorised integration coverage;
5. automated accessibility checks for critical learner journeys;
6. risk classifier and CI assurance-plan artifact;
7. durable defect records using P0/P1/P2;
8. protected Assurance telemetry aggregation;
9. `/app/#/admin/assurance` UI;
10. targeted production journey smokes selected by change risk.

## Truthfulness boundary

Until each item above is implemented, the Admin must show existing evidence only. Planned risk-based CI selection, coverage automation or defect aggregation must not be presented as live capability.

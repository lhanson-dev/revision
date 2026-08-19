# Founder Assurance Implementation

Status: Founder Assurance v1 is implemented on `main`. PR #62 adds repeatable isolated database/RLS assurance and reconciles repository migration versions to the production Supabase ledger. Dynamic CI-to-production lineage, durable defect aggregation, persistence/reload integration, Edge Function authorization integration and accessibility remain follow-on work until implemented and verified.

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
- protected operational evidence service: `supabase/functions/admin-operations`.

No second Admin application or alternate login/runtime is introduced.

## Founder Assurance v1

### Governed coverage projection

`src/assurance/coverage-register.ts` imports `90-governance-registers/Assurance Coverage Register.md` as raw build input and parses the governed table into typed coverage records. The Markdown register remains the current-state source of truth; the runtime projection is derived implementation rather than a second manually maintained inventory.

The parser recognises stable assurance IDs, preserves risk/required layer/evidence/gap, normalises qualified states to the governed headline state, fails unrecognised state text to `Unknown`, and is unit-tested.

### Founder Assurance Admin view

`src/app/FounderAssurance.tsx` provides `/app/#/admin/assurance` and keeps five questions separate:

1. **Production** — current protected production reachability evidence.
2. **Path to live** — deployment/smoke evidence, remaining `Unknown` until the exact CI → Founder merge → deploy lineage is correlated.
3. **Critical journeys** — governed coverage counts and records.
4. **Data & security** — governed coverage counts and records.
5. **Defects** — `Unknown` while no durable P0/P1/P2 source exists.

The page exposes evidence and gaps without calculating a single opaque confidence percentage. The Admin landing page includes a compact link/summary while System Health remains a separate current-runtime question.

### Browser assurance

`tests/e2e/admin-operations.spec.ts` verifies Founder Assurance presentation and its fail-safe Unknown behaviour using controlled browser mocks. It proves presentation behaviour, not production backend/data integration.

## Database and RLS assurance

PR #62 introduces the first repeatable database/security integration layer.

### Production-aligned migration history

Before PR #62, repository migration filenames did not match the versions stored in the production `supabase_migrations.schema_migrations` ledger, and the original `revision_progress` creation migration was absent from the repository. That meant the repository was not a faithful replayable representation of production migration history.

Supabase retained the applied migration versions, names and SQL statements. PR #62 reconciles the repository to that production ledger:

- `20260816172806_create_revision_progress.sql`
- `20260817140337_first_additive_regularisation.sql`
- `20260817163347_add_learning_evidence.sql`
- `20260818231425_add_admin_access.sql`
- `20260819144057_add_adaptive_planner_foundation.sql`
- `20260819144113_add_planner_admin_metrics.sql`
- `20260819152735_add_admin_operations_metrics.sql`
- `20260819154143_add_release_backend_readiness.sql`

The existing migration SQL is preserved; the missing initial migration is restored from the SQL recorded by production. This allows a fresh isolated database to replay the same ordered ledger while avoiding a duplicate earlier migration that production would consider out of sync.

### Isolated CI database

`supabase/config.toml` defines a committed non-secret local Supabase configuration. `.github/workflows/ci.yml` adds a separate **Database and RLS assurance** job using pinned Supabase CLI `2.111.0`.

The job:

1. starts an isolated local Supabase stack;
2. replays the complete production-aligned migration ledger from zero;
3. runs `supabase/tests/database-assurance.test.sql` with pgTAP;
4. always tears the local stack down.

It never reads or mutates production learner data.

### Assertions currently proved

The pgTAP suite verifies:

- `learning_evidence` has RLS enabled and only the declared owner select/insert policies;
- anonymous users cannot read learner evidence;
- authenticated learner evidence remains append-only at the table-privilege boundary;
- one learner sees only their own evidence;
- a learner can insert their own evidence but cross-user insertion is rejected by RLS;
- all five adaptive-planner persistence tables have RLS enabled and authenticated owner-scoped policies;
- a learner can create their own assessment but a cross-user assessment write is rejected;
- authenticated/browser roles cannot execute `admin_operations_metrics()` or `admin_planner_metrics()`;
- `service_role` can execute those protected aggregates; and
- the narrow non-sensitive release-readiness RPC remains callable by the publishable/anonymous role.

This closes DATA-01 and SEC-01 at their declared database assurance layer. It strengthens DATA-04 and SEC-04 but does not make them Covered because full planner ownership/reload and Edge Function authorization integration remain outstanding.

## Core implementation rule

Assurance is a living product map, not a fixed regression pack. Every material change must identify affected governed journeys/controls, risk level, required assurance layers, whether existing evidence remains valid, required pre/post-deploy checks, and any Assurance Coverage Register change.

Risk remains based on blast radius and consequence:

- **Level 1 — Low:** static/relevant checks; no automatic full browser regression.
- **Level 2 — Medium:** targeted unit/integration/browser assurance for the affected journey.
- **Level 3 — High:** database/security/integration evidence plus dependent-journey regression for shared/high-consequence boundaries.
- **Level 4 — Critical:** full relevant regression plus recovery/rollback and enhanced production verification.

## Target CI risk selection

Automated risk-based CI selection is not yet implemented. The target remains to inspect changed areas/dependencies, calculate risk, produce a machine-readable assurance plan, run mandatory foundation checks plus targeted/dependent checks, and publish exact-SHA scope/results. Tests deliberately not required must remain distinguishable from required-but-uncovered tests.

## Path-to-live implementation

Pre-merge and production evidence remain separate. The protected operations service provides production reachability and deployment/smoke evidence, and the deployment workflow has a pre-deploy backend-readiness gate. Founder Assurance must not mark the complete Path to live Healthy until it can correlate:

- PR/head SHA and required CI;
- explicit Founder merge approval;
- resulting `main` commit;
- database/backend readiness where applicable;
- production deployment;
- production smoke; and
- current operational observation.

## Remaining data/security boundary

Automated database assurance does not prove every end-to-end boundary. In particular:

- DATA-02 still needs database-backed learner evidence save → reload coverage;
- DATA-03 needs executable assertions for admin/test exclusion semantics;
- DATA-04 needs broader planner-table ownership plus reload/domain integration;
- SEC-02 and SEC-04 need repeatable Edge Function 401/403/authorised-success integration;
- SEC-03 needs automated secret/config scanning.

Defects remain `Unknown` until a durable governed P0/P1/P2 source can be queried successfully.

## Next implementation priorities

1. add real learner evidence persistence/reload integration coverage and Practice → save → Progress assurance;
2. add protected Admin/planner Edge Function 401/403/authorised integration coverage;
3. add automated accessibility checks for critical learner journeys;
4. make admin/test aggregate-exclusion semantics executable in database assurance;
5. implement CI risk classification and assurance-plan artifacts;
6. correlate exact-head/main/backend/deployment/smoke evidence in Founder Assurance;
7. establish durable P0/P1/P2 defect records;
8. add targeted production journey smokes selected by change risk.

## Truthfulness boundary

Admin must show existing evidence only. Missing or stale evidence is `Unknown`. Database assertions are only Covered where the executable CI suite proves the declared boundary; passing database CI must never be stretched into a claim about browser persistence, Edge Function authorization or production deployment.

## Documentation impact

PR #62 changes current engineering implementation rather than normative product behaviour. The Assurance Coverage Register is updated for the controls actually closed or strengthened. Migration reconciliation records production implementation truth and does not rewrite product/decision history.

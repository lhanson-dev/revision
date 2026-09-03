# Assurance Coverage Register

**Status:** Active current-state register  
**Purpose:** Record which critical Revision journeys and controls currently have repeatable assurance evidence, which layer provides it, and where gaps remain. This register implements the Testing & Assurance Standard; it does not replace product, security, privacy, content or release authority.

## Rules

- **Covered** means the declared required assurance layer is implemented with a repeatable evidence source.
- **Partial** means useful assurance exists but an important required boundary remains unproved.
- **Uncovered** means no meaningful automated evidence exists at the required layer.
- **Unknown** means current evidence cannot be established reliably.
- Planned tests do not count as coverage.
- CI/deployment results are dynamic operational evidence and must be read from their current source.
- Update this register when a material journey/control, required assurance layer or evidence owner changes.

## Current baseline — 2026-09-03

| ID | Critical journey/control | Risk | Required assurance | Current evidence source | Status | Gap / next step |
|---|---|---:|---|---|---|---|
| AV-01 | Canonical production `/app/` is reachable and serves the built React artifact | High | Production smoke | `.github/workflows/deploy-pages.yml` production-smoke; protected Admin learner-app check | Covered | Retain exact-revision correlation |
| PTL-01 | PR change passes required quality gates | High | Exact-head CI | `.github/workflows/ci.yml` | Covered | Retain exact-head evidence |
| PTL-02 | `main` deploys and production smoke follows deploy | High | Deploy + smoke | `.github/workflows/deploy-pages.yml`; `revision/path-to-live` | Covered | Retain ordered fail-closed release chain |
| PTL-03 | Frontend release is blocked unless governed lineage and required production backend capabilities are present | Critical | Approval lineage + backend readiness + deploy + smoke | `release-lineage.mjs`; `revision_release_readiness()`; deploy workflow; `revision/path-to-live` | Covered | FI-022 advances the required candidate contract to `plan-state-v1`; retain exact contract/function probes |
| PTL-04 | Change risk/assurance needs are classified before main suites | High | Machine-readable change classification | `change-classifier.mjs`; assurance plan artifact | Covered | Selective execution remains separately governed |
| PTL-05 | `main` cannot be casually bypassed outside governed PR/CI/Founder flow | Critical | Repository protection + release fail-closed | protected `main`; Founder approval gate; release lineage | Covered | Retain PR-only merge and no bypass discipline |
| PTL-06 | Level 3/4 AI-led changes carry authority-derived invariants, failure hypotheses, adversarial review and test-sensitivity evidence | High | Machine-validated PR evidence + governed fresh-context review | `.github/PULL_REQUEST_TEMPLATE.md`; `validate-high-risk-pr-evidence.mjs`; AI-Led Assurance Workflow; Revision CI | Covered | Evidence quality still depends on truthful adversarial execution; do not represent this as human technical review |
| ASSUR-01 | Critical assurance assets cannot silently disappear, be suppressed or lose required explicit CI invocation | Critical | Structural integrity + high-risk change escalation | `critical-assurance-manifest.json`; `validate-critical-assurance.mjs`; `change-classifier.mjs`; Revision CI | Covered | Static integrity cannot prove assertion semantics; retain Level-3 review/test-sensitivity requirement for changes to protected assurance |
| AUTH-01 | Sign-in entry is usable and provider gating fails closed | High | Browser | `tests/e2e/auth-entry.spec.ts` | Partial | Does not prove a real production sign-in transaction |
| AUTH-02 | Ordinary learner does not receive Admin navigation/utilities | High | Browser | `tests/e2e/app-responsive.spec.ts` | Covered for UI presentation | Server authorization remains separate |
| ADM-01 | Database-approved Admin receives protected Admin experience | High | Browser + server/data | Admin browser tests; `edge-operations.test.ts`; repository Edge source | Covered | Retain 401/403/Admin success assertions |
| ADM-02 | Founder Assurance exposes governed coverage and Unknown states truthfully | High | Unit + browser | register parsers/tests; Admin browser; protected dynamic release evidence | Covered | Missing evidence must remain Unknown |
| JRN-01 | Home / Plan / Ask REV launch uses active learner programme | High | Unit + responsive browser | learner programme/planner tests; app responsive suite | Covered at browser/domain layer | Production backend health remains separate |
| JRN-02 | Courses index, saved-course navigation, Add/Remove and legacy normalisation | High | Browser + persistence | responsive + database persistence + navigation tests | Covered | Retain empty/reload/remove/re-add cases |
| JRN-03 | Learn journey | Medium | Responsive browser | `tests/e2e/app-responsive.spec.ts` | Partial | Completion interaction not yet fully covered |
| JRN-04 | Practice journey and evidence creation | High | Browser + persistence | DB browser journey; evidence service/engine tests | Covered | Retain persistence/reload assertions |
| JRN-05 | Exam Prep / timed exam start | High | Responsive browser | `tests/e2e/app-responsive.spec.ts` | Covered for navigation/start | Full exam save/result lifecycle remains |
| JRN-06 | Progress review from persisted learner evidence | High | Browser + persistence | DB browser journey; progress/evidence tests | Covered | Retain reconstruction after course changes |
| JRN-07 | Adaptive planner setup, prioritisation, capacity and replanning context | High | Unit + browser + persistence | planner tests; Supabase integration; RLS CI | Covered | Retain deterministic reload/replan evidence |
| JRN-08 | GJ-01 new-Student first use reaches one exact saved course, cautious starting signal, exact useful revision, feedback and meaningful Home; skip/recovery and established-account bypass remain safe | High | Responsive browser + persistence + release lineage | `tests/e2e/student-first-use.spec.ts`; `tests/e2e/database-persistence.spec.ts`; Revision CI; governed Pages release | Covered at browser/persistence layer | A real production signup transaction remains outside automated smoke; retain exact deployed-revision lineage |
| DATA-01 | Learner learning evidence cannot cross user boundaries | Critical | Database/RLS | `database-assurance.test.sql` | Covered | Retain owner/cross-user assertions |
| DATA-02 | Learner evidence persists and reloads safely | Critical | Integration + browser | Supabase persistence + DB browser journey | Covered | Retain service/browser round trips |
| DATA-03 | Admin/test accounts are excluded from learner metrics | High | SQL/integration | Admin metrics logic/verification | Partial | Add broader executable aggregate values where needed |
| DATA-04 | Planner state is learner-owned and planning context does not become mastery evidence | Critical | Database/RLS + domain | pgTAP; Supabase persistence; planner tests | Covered | Retain context/evidence separation |
| DATA-05 | Learner course membership/events remain learner-owned programme context and preserve evidence | Critical | Database/RLS + integration + browser | pgTAP; persistence; DB browser; composite PK | Covered | Retain duplicate/cross-user/remove/re-add cases |
| DATA-06 | Learner plan state defaults safely, remains learner-owned read-only account context and does not become educational evidence | Critical | Database/RLS + domain | `learner-plan-assurance.test.sql`; learner plan resolver tests; production `plan-state-v1` verification | Covered | Before differentiated entitlements, revisit failure/security semantics through FI-002 |
| DATA-07 | First-use account routing state and funnel events remain owner-scoped, bounded and separate from educational evidence/raw answers | Critical | Database/RLS + persistence | `student-first-use-assurance.test.sql`; database-backed browser persistence; onboarding service tests | Covered | Retain cross-user denial, browser event insert-only and evidence-separation assertions |
| SEC-01 | Privileged Admin aggregates are not executable by browser roles | Critical | SQL/integration | database assurance | Covered | Retain service-role-only aggregate execution |
| SEC-02 | Admin operations re-authorise server-side before service-role use | Critical | Integration | `edge-operations.test.ts` | Covered | Retain 401/403/Admin-success boundary |
| SEC-03 | Privileged credentials stay server-side and public readiness remains least privilege | Critical | Static/config + database | secret scan; SECURITY INVOKER assertions | Covered | Pre-existing leaked-password Auth warning remains separate |
| SEC-04 | Planner operations re-authorise server-side and preserve learner isolation | Critical | SQL/integration + protected service | database CI; `edge-operations.test.ts` | Covered | Retain protected-service assertions |
| SEC-05 | Learner plan assignment cannot be self-elevated and protected Admin assignment is authenticated, authorized and auditable | Critical | RLS/RPC + protected Edge integration | `learner-plan-assurance.test.sql`; `edge-operations.test.ts`; `learner-plan-operations`; production ACTIVE/JWT verification and rollback-safe assignment check | Covered | Real billing must replace testing assignment semantics through FI-002 without weakening this boundary |
| SEC-06 | Level 3/4 PRs receive security/supply-chain analysis independent of Revision-authored application tests | High | CodeQL + dependency review | `Revision CI` `Independent security and dependency analysis` job | Covered on high-risk PR path | Does not replace dynamic RLS/service/negative tests; investigate platform/tool failures rather than bypassing them |
| CNT-01 | Available learner content has governed educational assurance | Critical | Content Accuracy Assurance Gate | per-pack assurance records/workflows | Partial by catalogue | Never infer content accuracy from software CI |
| A11Y-01 | Critical learner journeys meet automated accessibility baseline | High | Automated accessibility | axe Playwright suite across phone/tablet/desktop | Covered | Manual/AT review still applies where warranted |
| DEF-01 | Open P0/P1/P2 defects are durably tracked and surfaced | High | Defect register + Admin integration | `Defect Register.md`; parser/unit; Founder Assurance | Covered | Zero means zero known recorded defects only |

## FI-021 assurance interpretation

PR #163 added Level-3 assurance for the full GJ-01 first-use boundary: Student selection, Parent/Teacher unavailable semantics, canonical first-course persistence, starting-check completion and skip fallback, exact recommendation-to-work routing, ordinary learning-evidence creation, feedback/Home transition, bounded telemetry, responsive Light/Dark behaviour, post-migration account distinction and owner-scoped RLS for first-use state/events.

Exact PR head `d8971ed83d49e96106c1eed70eb0e8de97908f8d` passed Revision CI #966 before Founder approval and merge. PR #163 then merged to `main` as `8ccf0e14c8d88954d6f942a3d2b085971fe21af0`; post-merge Revision CI #967 also completed successfully. Governed deployment run `32815982121` / Pages run #123 passed release lineage, production backend readiness, build, deployment, production smoke and durable `revision/path-to-live = success`.

This supports FI-021 `In Progress → Live` and the JRN-08 / DATA-07 coverage declarations above. It does not upgrade AUTH-01: the automated production smoke proves the canonical deployed revision and release lineage, not a real external email/Google signup transaction.

## FI-022 assurance interpretation

PR #159 adds a Level-3 assurance boundary for learner plan state. Revision CI #938 passed after migration replay, dedicated plan-state pgTAP tests, protected Edge authorization integration, typecheck/lint/unit/build and browser regression.

Production backend enablement on 24 August 2026 then established `plan-state-v1`, Free compatibility rows for all existing Auth identities, own-plan SELECT/no browser write privileges, service-role-only assignment RPC execution and an ACTIVE `learner-plan-operations` function with JWT verification enabled. Rollback-safe production checks proved new-user Free defaulting and atomic manual assignment/audit without retaining test data.

Security Advisor introduced no warning-level FI-022 vulnerability. Its informational no-policy notice on `learner_plan_assignment_events` reflects intentional deny-all browser access. Performance Advisor's FI-022 foreign-key-index notices are informational at current scale and do not weaken correctness or authorization assurance.

FI-022 is **Live**. PR #159 merged as `df7d9b520fec60d4b804c49dfc2c441498f37b99`, and production workflow run `32755286006` passed governed release lineage, `plan-state-v1` backend readiness, build, GitHub Pages deployment, production smoke and durable `revision/path-to-live = success`. Assurance coverage remains current evidence for that live foundation; differentiated entitlement behaviour remains FI-002 scope.

## Existing qualified gaps

- AUTH-01 remains Partial because isolated/browser assurance is not a real production sign-in transaction.
- JRN-03 remains Partial because navigation/content presence does not prove a complete Learn interaction.
- JRN-05 is Covered only for navigation/start; full exam persistence/result completion remains future assurance work.
- DATA-03 remains Partial for value-level Admin/test aggregate exclusion breadth.
- Content assurance remains independent of software CI and varies by governed content pack.
- Supabase leaked-password protection remains a separate managed Auth warning and should be enabled/reverified before broad external acquisition or when the justified Supabase plan supports it.
- Revision currently has no routine independent human technical code reviewer. The AI-led assurance controls reduce, but cannot eliminate, correlated builder/reviewer blind-spot risk; do not represent AI/Founder approval as human technical review.
- A targeted automated mutation/property-testing harness is not yet a universal CI control. High-risk PRs require test-sensitivity/invariant evidence now; mutation/property tooling should be added selectively where measured value justifies it.

## Maintenance model

Update this register when a material PR introduces a new critical journey/control, changes its required assurance, closes a listed gap, removes/weakens an evidence source, or changes production smoke/control ownership. Historical CI runs, audits and incidents remain evidence in their own sources; this register records the current coverage model.

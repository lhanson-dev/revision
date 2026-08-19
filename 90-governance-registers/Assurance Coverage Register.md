# Assurance Coverage Register

**Status:** Active current-state register  
**Purpose:** Record which critical Revision journeys and controls currently have assurance evidence, which layer provides it, and where gaps remain. This register implements the Testing & Assurance Standard; it does not replace the underlying product, security, privacy, content or release authority.

## Rules

- A row is **Covered** only when the declared required assurance layer is implemented and there is a repeatable evidence source.
- **Partial** means useful automated assurance exists but a required layer or important boundary remains unproved.
- **Uncovered** means the declared control/journey has no meaningful automated evidence at the required layer.
- **Unknown** means current evidence cannot be established reliably.
- Planned tests do not count as coverage.
- CI/deployment execution results are dynamic operational evidence and must be read from their current source; this register records the intended assurance ownership and implemented evidence paths, not a permanently green result.
- Update this register when a material feature/journey/control is added, materially changed, or its assurance ownership changes.
- The Admin runtime may project this register into machine-readable data, but the projection must read this governed source rather than becoming a competing manually maintained coverage inventory.

## Current baseline — 2026-08-19

| ID | Critical journey/control | Risk | Required assurance | Current evidence source | Baseline status | Gap / next step |
|---|---|---:|---|---|---|---|
| AV-01 | Canonical production `/app/` is reachable and serves the built React artifact | High | Production smoke | `.github/workflows/deploy-pages.yml` production-smoke job; protected `admin-operations` learner-app check | Covered | Admin Assurance surfaces the current reachability check; add explicit production revision/freshness correlation |
| PTL-01 | PR change can pass required quality gates | High | Exact-head CI | `.github/workflows/ci.yml` — install, typecheck, lint, unit tests, build, Playwright | Covered | Admin must still correlate exact-head CI evidence to the deployed production revision before Path to live can be Healthy |
| PTL-02 | `main` deploys and production smoke follows deploy | High | Deploy + production smoke | `.github/workflows/deploy-pages.yml`; protected deployment health check | Covered | Admin Assurance surfaces deployment/smoke evidence but still needs full CI → merge → deploy lineage correlation |
| PTL-03 | Frontend deployment is blocked when required production database/backend capabilities are absent | Critical | Pre-deploy backend readiness | `revision_release_readiness()` plus `.github/workflows/deploy-pages.yml` backend-readiness job | Partial | Database contract is live and ready; record a correlated production lineage that passes readiness, deployment and smoke before promoting to Covered |
| AUTH-01 | Sign-in entry is usable and provider gating fails closed | High | Browser | `tests/e2e/auth-entry.spec.ts`; responsive sign-in check | Partial | Browser tests stub provider settings and do not prove a real production sign-in transaction |
| AUTH-02 | Ordinary learner does not receive Admin navigation or Admin utilities | High | Browser | `tests/e2e/app-responsive.spec.ts` | Covered for UI presentation | Add/retain server-side authorization coverage so UI hiding is never treated as authorization |
| ADM-01 | Database-approved admin receives protected Admin experience | High | Browser + server/data boundary | `tests/e2e/admin-operations.spec.ts`, `tests/e2e/app-responsive.spec.ts`, protected Edge implementation | Partial | Add repeatable Edge Function 401/403/admin-success integration evidence |
| ADM-02 | Founder Assurance view truthfully exposes governed coverage and Unknown states | High | Unit + browser | `src/assurance/coverage-register.test.ts`; `tests/e2e/admin-operations.spec.ts` | Covered at UI/projection layer | Add protected dynamic CI/defect evidence sources without weakening Unknown truthfulness |
| JRN-01 | Learner Home / Plan / REV entry and recommendation launch | High | Responsive browser | `tests/e2e/app-responsive.spec.ts`; FI-001 planner browser journey | Covered at browser layer | Production planner/backend readiness remains separately evidenced |
| JRN-02 | Subject Home and course navigation | High | Responsive browser | `tests/e2e/app-responsive.spec.ts` | Covered at browser layer | Expand as new subjects introduce materially different structures |
| JRN-03 | Learn journey | Medium | Responsive browser | `tests/e2e/app-responsive.spec.ts` | Partial | Current browser assurance proves navigation/content presence, not completion of a learning interaction |
| JRN-04 | Practice journey and evidence creation | High | Browser + persistence integration | Browser coverage reaches Practice; unit evidence engine exists | Partial | Add an end-to-end practice completion that verifies evidence is persisted/reloaded |
| JRN-05 | Exam Prep / timed exam start | High | Responsive browser | `tests/e2e/app-responsive.spec.ts` | Covered for navigation/start | Add save/complete/result persistence assurance for the full exam lifecycle |
| JRN-06 | Progress review from persisted learner evidence | High | Browser + persistence integration | Engine/unit coverage and UI presence exist | Partial | Add deterministic persisted-evidence → Progress display E2E/integration coverage |
| JRN-07 | Adaptive planner setup, deterministic prioritisation, constrained-time mode and replanning context | High | Unit + responsive browser + persistence integration | `src/engine/planning/planning.test.ts`, `src/app/planner-model.test.ts`, `tests/e2e/app-responsive.spec.ts`, database RLS CI | Partial | RLS ownership is automated; add database-backed planner setup/reload/replan integration evidence |
| DATA-01 | Learner-owned learning evidence cannot be read/written across users | Critical | Automated database/RLS integration | `.github/workflows/ci.yml` database-assurance job; `supabase/tests/database-assurance.test.sql` | Covered | Retain direct owner-read/insert and cross-user rejection assertions as the schema evolves |
| DATA-02 | Learner evidence persists and reloads safely | Critical | Integration + browser | Persistence implementation/unit coverage plus automated RLS ownership evidence | Partial | Add a repeatable browser/client database-backed persistence and reload journey |
| DATA-03 | Admin/test accounts are excluded from learner metrics | High | SQL/integration | `admin_operations_metrics()` logic and manual verification assets | Partial | Add executable value-level aggregate assertions for admin/test exclusion |
| DATA-04 | Planner assessments, availability, bounded preferences and activity events remain learner-owned and planning context does not become mastery evidence | Critical | Database/RLS + domain integration | `supabase/tests/database-assurance.test.sql`; planner engine/service separation | Partial | RLS ownership is automated; add database-backed ownership/reload integration and retain domain separation coverage |
| SEC-01 | Privileged Admin aggregate is not executable by browser roles | Critical | SQL/integration | `.github/workflows/ci.yml` database-assurance job; `supabase/tests/database-assurance.test.sql` | Covered | Retain browser-role denial and service-role execution assertions for both Admin aggregates |
| SEC-02 | Admin operations re-authorise server-side before service-role use | Critical | Integration | Edge Function implementation; browser mocks exercise presentation | Partial | Add Edge Function integration tests for 401/403/admin-success paths |
| SEC-03 | Privileged credentials remain server-side and public readiness checks do not gain unnecessary elevated execution | Critical | Static/config + database security assurance | server-side architecture; database CI asserts `revision_release_readiness()` is `SECURITY INVOKER` | Partial | Add secret/config scanning or equivalent automated repository check; apply/reverify the forward readiness hardening migration in production |
| SEC-04 | Planner assurance aggregates re-authorise server-side and do not expose cross-user planner rows to browser roles | Critical | SQL/integration + protected server boundary | planner aggregate execution denied to browser role in database CI; `planner-operations` implementation | Partial | Add repeatable 401/403/admin-success Edge integration evidence and production readiness verification |
| CNT-01 | Available learner content has governed educational assurance | Critical | Content Accuracy Assurance Gate | Per-pack assurance records and content workflows | Partial by catalogue | Admin assurance should summarise pack status separately; never infer from software CI alone |
| A11Y-01 | Critical learner journeys meet automated accessibility baseline | High | Automated accessibility | Required by Testing Standard | Uncovered | Introduce automated accessibility assertions/scanning into browser assurance, including Home / Plan / REV |
| DEF-01 | Open P0/P1/P2 defects are durably tracked and surfaced | High | Defect register + Admin integration | Severity model defined in Testing & Assurance Standard | Uncovered | Establish durable defect records and Admin aggregation before showing zero as a real value |

## Current interpretation

The repository has a meaningful automated foundation around build quality, responsive browser navigation, production artifact smoke and now isolated database/RLS assurance. FI-001 extends browser and domain coverage to the adaptive planner, and Founder Assurance projects this register without converting gaps into a false confidence score.

The database-assurance job can recreate the schema from the production-aligned migration chain and proves learner-evidence ownership isolation plus the privileged Admin aggregate execution boundary. This is sufficient to promote DATA-01 and SEC-01 to Covered. It does not prove browser/client persistence-reload, complete planner persistence lifecycles or protected Edge Function authorised success paths, so those related controls remain Partial.

The production incident in which the planner frontend was deployed before its Supabase schema existed exposed a separate path-to-live gap: frontend availability did not prove backend readiness. The `planner-v1` database readiness contract is currently present and returns ready; PTL-03 remains Partial until one complete production lineage is correlated through readiness, deploy and smoke.

PR #62 also records a forward least-privilege hardening of the public readiness RPC after Supabase Security Advisor identified its historical `SECURITY DEFINER` execution. CI proves the desired final state is `SECURITY INVOKER`; the production warning remains open until that forward migration is applied after governed merge.

The current implementation does **not** justify claiming complete production-backed persistence, real production authentication, accessibility, the full practice/progress/exam evidence lifecycle, exact CI-to-production lineage or durable defect aggregation.

That distinction is intentional. Founder confidence should increase as Partial/Uncovered rows become Covered through real automated evidence rather than by changing labels.

## Maintenance model

When a material PR changes a critical journey/control, its documentation-impact check should include this register when one of the following is true:
- a new critical journey/control is introduced;
- required assurance changes;
- a new automated test closes a listed gap;
- an existing evidence source is removed or materially weakened;
- a production smoke/control is added or retired.

Historical CI runs, defect incidents and assurance reviews remain evidence in their own sources; this register records the current coverage model.

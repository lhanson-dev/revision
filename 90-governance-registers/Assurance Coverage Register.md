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
| AV-01 | Canonical production `/app/` is reachable and serves the built React artifact | High | Production smoke | `.github/workflows/deploy-pages.yml` production-smoke job; protected `admin-operations` learner-app check | Covered | Admin Assurance surfaces the current reachability check; retain production revision/freshness correlation |
| PTL-01 | PR change can pass required quality gates | High | Exact-head CI | `.github/workflows/ci.yml` — deterministic install, typecheck, lint, unit tests, build, browser assurance | Covered | Retain exact-head evidence and keep production deployment evidence separate |
| PTL-02 | `main` deploys and production smoke follows deploy | High | Deploy + production smoke | `.github/workflows/deploy-pages.yml`; protected deployment health check; durable `revision/path-to-live` status | Covered | Retain deploy/smoke ordering and exact-revision status publication |
| PTL-03 | Frontend deployment is blocked unless governed lineage and required production backend capabilities are present | Critical | PR/CI/approval lineage + pre-deploy backend readiness + deploy + smoke | `scripts/assurance/release-lineage.mjs`; `revision_release_readiness()`; `.github/workflows/deploy-pages.yml`; `revision/path-to-live` commit status; production run `32304142083` for merge `2f4eb8f9166ca658ae19a8b72400e26488d5c16a` | Covered | Retain fail-closed lineage, backend-readiness, deploy/smoke ordering and chained prior-release status |
| PTL-04 | Change risk and required assurance are classified visibly and fail safe before main CI suites execute | High | Machine-readable exact-head change classification | `scripts/assurance/change-classifier.mjs`; `generate-assurance-plan.mjs`; `.github/workflows/ci.yml` Assurance plan job; retained `assurance-plan-<run-id>` artifact | Covered | V1 intentionally uses `conservative-full`; any later selective test execution requires a separate governed change and must preserve fail-safe escalation |
| PTL-05 | `main` cannot be casually bypassed outside the governed PR/CI/Founder flow | Critical | Repository protection + production fail-closed enforcement | PR #68 governed-lineage deployment preflight and chained `revision/path-to-live` status; Issue #65 tracks GitHub protection | Partial | Compensating deploy control blocks ungoverned releases under the unchanged workflow; configure and reverify GitHub `main` protection/ruleset for defence in depth |
| AUTH-01 | Sign-in entry is usable and provider gating fails closed | High | Browser | `tests/e2e/auth-entry.spec.ts`; responsive sign-in check | Partial | Browser tests stub provider settings and do not prove a real production sign-in transaction |
| AUTH-02 | Ordinary learner does not receive Admin navigation or Admin utilities | High | Browser | `tests/e2e/app-responsive.spec.ts` | Covered for UI presentation | Add/retain server-side authorization coverage so UI hiding is never treated as authorization |
| ADM-01 | Database-approved admin receives protected Admin experience | High | Browser + server/data boundary | `tests/e2e/admin-operations.spec.ts`; `tests/integration/edge-operations.test.ts`; repository `admin-operations` source served against isolated Supabase | Covered | Retain browser presentation plus unauthenticated, ordinary-user and database-authorised-admin server-boundary assertions |
| ADM-02 | Founder Assurance view truthfully exposes governed coverage and Unknown states | High | Unit + browser | coverage + defect register parsers/tests; `tests/e2e/admin-operations.spec.ts`; protected `admin-operations` dynamic path-to-live evidence | Covered | Retain fail-closed Unknown behaviour when governed register or dynamic lineage evidence is unavailable |
| JRN-01 | Learner Home / Plan / REV entry and recommendation launch | High | Responsive browser | `tests/e2e/app-responsive.spec.ts`; FI-001 planner browser journey | Covered at browser layer | Production planner/backend readiness remains separately evidenced |
| JRN-02 | Subject Home and course navigation | High | Responsive browser | `tests/e2e/app-responsive.spec.ts` | Covered at browser layer | Expand as new subjects introduce materially different structures |
| JRN-03 | Learn journey | Medium | Responsive browser | `tests/e2e/app-responsive.spec.ts` | Partial | Current browser assurance proves navigation/content presence, not completion of a learning interaction |
| JRN-04 | Practice journey and evidence creation | High | Browser + persistence integration | `tests/e2e/database-persistence.spec.ts`; authenticated service integration; evidence engine/unit coverage | Covered | Retain real Practice save → browser reload assertions as evidence schema and UI evolve |
| JRN-05 | Exam Prep / timed exam start | High | Responsive browser | `tests/e2e/app-responsive.spec.ts` | Covered for navigation/start | Add save/complete/result persistence assurance for the full exam lifecycle |
| JRN-06 | Progress review from persisted learner evidence | High | Browser + persistence integration | `tests/e2e/database-persistence.spec.ts`; progress/evidence unit coverage | Covered | Retain database-backed reload → Progress reconstruction assertion |
| JRN-07 | Adaptive planner setup, deterministic prioritisation, constrained-time mode and replanning context | High | Unit + responsive browser + persistence integration | planning/model unit tests; responsive planner browser journey; `tests/integration/supabase-persistence.test.ts`; database/RLS CI | Covered | Retain persisted planner-state reload → deterministic replanning and learner-priority reason assertions |
| DATA-01 | Learner-owned learning evidence cannot be read/written across users | Critical | Automated database/RLS integration | `.github/workflows/ci.yml` database-assurance job; `supabase/tests/database-assurance.test.sql` | Covered | Retain direct owner-read/insert and cross-user rejection assertions as the schema evolves |
| DATA-02 | Learner evidence persists and reloads safely | Critical | Integration + browser | authenticated `supabase-persistence` integration plus `tests/e2e/database-persistence.spec.ts` against isolated Supabase | Covered | Retain service round-trip, cross-user isolation and real browser reload evidence |
| DATA-03 | Admin/test accounts are excluded from learner metrics | High | SQL/integration | `admin_operations_metrics()` logic and manual verification assets | Partial | Add executable value-level aggregate assertions for admin/test exclusion |
| DATA-04 | Planner assessments, availability, bounded preferences and activity events remain learner-owned and planning context does not become mastery evidence | Critical | Database/RLS + domain integration | pgTAP RLS assurance; `tests/integration/supabase-persistence.test.ts`; deterministic planner/domain tests and service separation | Covered | Retain cross-user rejection plus reloaded preference → planner reason assertions without converting planning context into learning evidence |
| SEC-01 | Privileged Admin aggregate is not executable by browser roles | Critical | SQL/integration | `.github/workflows/ci.yml` database-assurance job; `supabase/tests/database-assurance.test.sql` | Covered | Retain browser-role denial and service-role execution assertions for both Admin aggregates |
| SEC-02 | Admin operations re-authorise server-side before service-role use | Critical | Integration | `tests/integration/edge-operations.test.ts` against repository `admin-operations` source and isolated Supabase | Covered | Retain 401 unauthenticated, 403 ordinary-user and authorised-admin success assertions |
| SEC-03 | Privileged credentials remain server-side and public readiness checks do not gain unnecessary elevated execution | Critical | Static/config + database security assurance | `scripts/assurance/scan-secrets.mjs` enforced by CI; database CI asserts `revision_release_readiness()` is `SECURITY INVOKER`; production hardening reverified | Covered | Retain repository privileged-secret/config scanning and least-privilege readiness assertions; vendor account-security features remain separately tracked |
| SEC-04 | Planner assurance aggregates re-authorise server-side and do not expose cross-user planner rows to browser roles | Critical | SQL/integration + protected server boundary | database CI denies browser-role aggregate execution; `tests/integration/edge-operations.test.ts` exercises repository `planner-operations` source | Covered | Retain SQL privilege boundary plus 401/403/admin-success protected-service assertions |
| CNT-01 | Available learner content has governed educational assurance | Critical | Content Accuracy Assurance Gate | Per-pack assurance records and content workflows | Partial by catalogue | Admin assurance should summarise pack status separately; never infer from software CI alone |
| A11Y-01 | Critical learner journeys meet automated accessibility baseline | High | Automated accessibility | pinned `@axe-core/playwright`; `tests/e2e/accessibility.spec.ts` across phone/tablet/desktop; exact-head CI evidence | Covered | Automated WCAG A/AA is a baseline, not a substitute for manual/assistive-technology review when interaction risk warrants it |
| DEF-01 | Open P0/P1/P2 defects are durably tracked and surfaced | High | Defect register + Admin integration | `90-governance-registers/Defect Register.md`; fail-closed parser/unit tests; Founder Assurance browser projection | Covered | Retain deliberate triage date/schema marker and closure evidence; zero means zero known recorded open P0/P1/P2 defects only |

## Current interpretation

Revision now has repeatable assurance across deterministic build quality, explicit risk classification, repository secret/config scanning, responsive browser journeys, automated WCAG A/AA checks, isolated migration/RLS replay, authenticated learner persistence/reload, planner-state reuse, protected Edge authorization and governed defect evidence. Founder Assurance projects governed evidence without converting missing evidence into a false confidence score.

The risk classifier produces a machine-readable exact-base/head `assurance-plan.json` before the main suites run. Unknown executable/config changes fail safe to High and destructive migration signatures escalate to Critical. Version 1 is deliberately conservative: the plan is inspectable evidence, but both existing CI suites remain mandatory while classification boundaries are calibrated.

The database/service job recreates the production-aligned schema, proves learner ownership isolation and privileged aggregate boundaries, then uses synthetic authenticated users to exercise real learning-evidence and planner service round trips. A database-backed Playwright journey proves a scored Practice result survives a real browser reload and is reconstructed in Progress. Reloaded planner context is fed back through the deterministic planner.

Protected `admin-operations` and `planner-operations` source is served against the isolated stack and must reject unauthenticated and ordinary authenticated users while allowing a database-authorised administrator. The automated accessibility gate scans the current critical learner journey on phone, tablet and desktop; the two P2 accessibility findings discovered during PR #66 remain closed with recorded verification evidence.

PR #68 implemented the durable fail-closed production release chain. On 2026-08-19 it was Founder-approved after exact-head CI, merged as `2f4eb8f9166ca658ae19a8b72400e26488d5c16a`, and production run `32304142083` successfully passed governed lineage, backend readiness, build, Pages deployment, production smoke and durable status publication. The merge commit was independently observed with `revision/path-to-live = success`; PTL-03 is therefore Covered from implemented and observed production evidence rather than planned intent.

GitHub `main` protection is still an external repository setting. PTL-05 records the distinction explicitly: the deploy-chain control prevents an ordinary ungoverned push from reaching production under the unchanged workflow, but it cannot stop an administrator from mutating repository history or the workflow itself. Repository branch protection/rulesets remain defence in depth and must be configured/reverified before that row can be Covered.

`revision_release_readiness()` remains least-privilege `SECURITY INVOKER`. SEC-03 is Covered because repository-level secret/config scanning is enforced before downstream CI, while public publishable browser configuration remains correctly treated as public. Supabase managed leaked-password protection is a separate vendor Auth setting; its current warning is not implied to be closed by SEC-03.

Supabase managed leaked-password protection is currently unavailable on Revision's Free plan. The warning remains visible; it is treated as a paid launch/upgrade control rather than silently dismissed. Current production inspection on 2026-08-19 shows 3 Auth users / 3 profiles including 1 admin. Enable and reverify the managed control before broad external learner acquisition, or when moving to Supabase Pro for another justified reason, whichever comes first.

AUTH-01 remains Partial because isolated CI authentication is not a real production sign-in transaction. JRN-05 remains qualified to navigation/start because the complete exam save/result lifecycle is not yet covered. Content assurance remains independent of software CI.

That distinction is intentional. Founder confidence increases only when the declared required layer is actually implemented and repeatable.

## Maintenance model

When a material PR changes a critical journey/control, its documentation-impact check should include this register when one of the following is true:
- a new critical journey/control is introduced;
- required assurance changes;
- a new automated test closes a listed gap;
- an existing evidence source is removed or materially weakened;
- a production smoke/control is added or retired.

Historical CI runs, defect incidents and assurance reviews remain evidence in their own sources; this register records the current coverage model.

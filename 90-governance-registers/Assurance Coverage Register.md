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

## Current baseline — 2026-08-19

| ID | Critical journey/control | Risk | Required assurance | Current evidence source | Baseline status | Gap / next step |
|---|---|---:|---|---|---|---|
| AV-01 | Canonical production `/app/` is reachable and serves the built React artifact | High | Production smoke | `.github/workflows/deploy-pages.yml` production-smoke job | Covered | Surface latest run/commit/freshness in Admin |
| PTL-01 | PR change can pass required quality gates | High | Exact-head CI | `.github/workflows/ci.yml` — install, typecheck, lint, unit tests, build, Playwright | Covered | Admin should show latest relevant run and exact commit |
| PTL-02 | `main` deploys and production smoke follows deploy | High | Deploy + production smoke | `.github/workflows/deploy-pages.yml` | Covered | Correlate deployed commit with smoke evidence in Admin |
| AUTH-01 | Sign-in entry is usable and provider gating fails closed | High | Browser | `tests/e2e/auth-entry.spec.ts`; responsive sign-in check | Partial | Browser tests stub provider settings and do not prove a real production sign-in transaction |
| AUTH-02 | Ordinary learner does not receive Admin navigation | High | Browser | `tests/e2e/app-responsive.spec.ts` | Covered for UI presentation | Add/retain server-side authorization coverage so UI hiding is never treated as authorization |
| ADM-01 | Database-approved admin receives protected Admin experience | High | Browser + server/data boundary | `tests/e2e/admin-operations.spec.ts`, `tests/e2e/app-responsive.spec.ts`, `supabase/tests/admin-access-verification.sql` | Partial | SQL verification is not currently part of CI; production Edge Function authorization needs repeatable integration/smoke evidence |
| JRN-01 | Learner Home / REV entry and recommendation launch | High | Responsive browser | `tests/e2e/app-responsive.spec.ts` | Covered at browser layer | Add production-smoke depth only if cost/risk justifies it |
| JRN-02 | Subject Home and course navigation | High | Responsive browser | `tests/e2e/app-responsive.spec.ts` | Covered at browser layer | Expand as new subjects introduce materially different structures |
| JRN-03 | Learn journey | Medium | Responsive browser | `tests/e2e/app-responsive.spec.ts` | Partial | Current browser assurance proves navigation/content presence, not completion of a learning interaction |
| JRN-04 | Practice journey and evidence creation | High | Browser + persistence integration | Browser coverage reaches Practice; unit evidence engine exists | Partial | Add an end-to-end practice completion that verifies evidence is persisted/reloaded |
| JRN-05 | Exam Prep / timed exam start | High | Responsive browser | `tests/e2e/app-responsive.spec.ts` | Covered for navigation/start | Add save/complete/result persistence assurance for the full exam lifecycle |
| JRN-06 | Progress review from persisted learner evidence | High | Browser + persistence integration | Engine/unit coverage and UI presence exist | Partial | Add deterministic persisted-evidence → Progress display E2E/integration coverage |
| DATA-01 | Learner-owned learning evidence cannot be read/written across users | Critical | Automated database/RLS integration | Database authority requires it; repository has SQL verification assets | Partial | Make RLS ownership tests executable in CI or an automated Supabase test job |
| DATA-02 | Learner evidence persists and reloads safely | Critical | Integration + browser | Persistence implementation/unit coverage exists | Partial | Add a repeatable database-backed integration journey; browser mocks alone are insufficient |
| DATA-03 | Admin/test accounts are excluded from learner metrics | High | SQL/integration | `admin_operations_metrics()` logic and `supabase/tests/admin-operations-verification.sql` | Partial | Execute verification automatically and expose latest evidence in Admin |
| SEC-01 | Privileged Admin aggregate is not executable by browser roles | Critical | SQL/integration | `supabase/tests/admin-operations-verification.sql` | Partial | Automate execution in CI/post-deploy rather than relying on a manual verification file |
| SEC-02 | Admin operations re-authorise server-side before service-role use | Critical | Integration | Edge Function implementation; browser mocks exercise presentation | Partial | Add Edge Function integration tests for 401/403/admin-success paths |
| SEC-03 | Privileged credentials remain server-side | Critical | Static/config assurance + review | architecture/security standards and server-side implementation | Partial | Add secret/config scanning or equivalent automated repository check |
| CNT-01 | Available learner content has governed educational assurance | Critical | Content Accuracy Assurance Gate | Per-pack assurance records and content workflows | Partial by catalogue | Admin assurance should summarise pack status separately; never infer from software CI alone |
| A11Y-01 | Critical learner journeys meet automated accessibility baseline | High | Automated accessibility | Required by Testing Standard | Uncovered | Introduce automated accessibility assertions/scanning into browser assurance |
| DEF-01 | Open P0/P1/P2 defects are durably tracked and surfaced | High | Defect register + Admin integration | Severity model defined in Testing & Assurance Standard | Uncovered | Establish durable defect records and Admin aggregation before showing zero as a real value |

## Current interpretation

The repository has a meaningful automated foundation, particularly around build quality, responsive browser navigation and production artifact smoke. It does **not** yet justify claiming complete end-to-end assurance of learner data persistence, RLS/security boundaries, real production authentication, accessibility or the full practice/progress/exam evidence lifecycle.

That distinction is intentional. Founder confidence should increase as these Partial/Uncovered rows become Covered through real automated evidence rather than by changing labels.

## Maintenance model

When a material PR changes a critical journey/control, its documentation-impact check should include this register when one of the following is true:
- a new critical journey/control is introduced;
- required assurance changes;
- a new automated test closes a listed gap;
- an existing evidence source is removed or materially weakened;
- a production smoke/control is added or retired.

Historical CI runs, defect incidents and assurance reviews remain evidence in their own sources; this register records the current coverage model.

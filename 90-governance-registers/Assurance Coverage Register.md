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

## Current baseline — 2026-09-27 Plan refresh candidate

| ID | Critical journey/control | Risk | Required assurance | Current evidence source | Status | Gap / next step |
|---|---|---:|---|---|---|---|
| AV-01 | Canonical production `/app/` is reachable and serves the built React artifact | High | Production smoke | `.github/workflows/deploy-pages.yml` production-smoke; protected Admin learner-app check | Covered | Retain exact-revision correlation |
| PTL-01 | PR change passes required quality gates | High | Exact-head CI | `.github/workflows/ci.yml` | Covered | Retain exact-head evidence; final PR head must be green before merge |
| PTL-02 | `main` deploys and production smoke follows deploy | High | Deploy + smoke | `.github/workflows/deploy-pages.yml`; `revision/path-to-live` | Covered | Retain ordered fail-closed release chain |
| PTL-03 | Frontend release is blocked unless governed lineage and required production backend capabilities are present | Critical | Approval lineage + backend readiness + deploy + smoke | `release-lineage.mjs`; `revision_release_readiness()`; deploy workflow; `revision/path-to-live` | Covered | Production now exposes verified `planner-week-v1`; PR #403 still requires final exact-head CI, Founder-approved merge and governed release |
| PTL-04 | Change risk/assurance needs are classified before main suites | High | Machine-readable change classification | `change-classifier.mjs`; assurance plan artifact | Covered | Selective execution remains separately governed |
| PTL-05 | `main` cannot be casually bypassed outside governed PR/CI/Founder flow | Critical | Repository protection + release fail-closed | protected `main`; Founder approval gate; release lineage | Covered | Retain PR-only merge and no bypass discipline |
| AUTH-01 | Sign-in entry is usable and provider gating fails closed | High | Browser | `tests/e2e/auth-entry.spec.ts` | Partial | Does not prove a real production sign-in transaction |
| AUTH-02 | Ordinary learner does not receive Admin navigation/utilities | High | Browser | `tests/e2e/app-responsive.spec.ts` | Covered for UI presentation | Server authorization remains separate |
| ADM-01 | Database-approved Admin receives protected Admin experience | High | Browser + server/data | Admin browser tests; `edge-operations.test.ts`; repository Edge source | Covered | Retain 401/403/Admin success assertions |
| ADM-02 | Founder Assurance exposes governed coverage and Unknown states truthfully | High | Unit + browser | register parsers/tests; Admin browser; protected dynamic release evidence | Covered | Missing evidence must remain Unknown |
| JRN-01 | Home / Plan / Ask REV launch uses active learner programme | High | Unit + responsive browser | learner programme/planner tests; app responsive suite | Covered at browser/domain layer | Production backend health remains separate |
| JRN-09 | FI-023 Home v3 truthful REV/Today/Exams/Progress/course actions and independent section recovery | High | Unit + responsive/browser + Founder-approved visual captures + exact-head CI + governed production smoke | `home-v3-model.test.ts`, `navigation.test.ts`, `returning-home.spec.ts`, responsive/visual learner suites, database persistence; exact-head Revision CI #38251769839 at `e517b420ee3920df0797f2bc5376ccebb8a6aece`; visual approval and artifact 11732295608; merge #601 `b405f52b21e61517e4ff16786b2513d93aef617b`; deployment #38254172559; `revision/path-to-live = success` | Covered at automated browser, domain, database and canonical production-route smoke layers — Live 2026-10-12 | Production smoke validates deployed canonical React app/legacy retirement and release gate, not direct real-learner interaction. Continue normal monitoring and optional real-student usability review without inventing production-user test results. |
| JRN-02 | Courses index, saved-course navigation, Add/Remove and legacy normalisation | High | Browser + persistence | responsive + database persistence + navigation tests | Covered | Retain empty/reload/remove/re-add cases |
| JRN-03 | Learn journey | Medium | Responsive browser | `tests/e2e/app-responsive.spec.ts` | Partial | Completion interaction not yet fully covered |
| JRN-04 | Practice journey and evidence creation | High | Browser + persistence | DB browser journey; evidence service/engine tests | Covered | Retain persistence/reload assertions |
| JRN-05 | Exam Prep / timed exam start | High | Responsive browser | `tests/e2e/app-responsive.spec.ts` | Covered for navigation/start | Full exam save/result lifecycle remains |
| JRN-06 | Progress review from persisted learner evidence | High | Browser + persistence | DB browser journey; progress/evidence tests | Covered | Retain reconstruction after course changes |
| JRN-07 | Adaptive planner setup, Day/Week/Month forecast, prioritisation, recurring daily capacity and replanning context | High | Unit + responsive browser + persistence | planner engine/model tests; Plan responsive/visual browser assurance; Supabase integration; RLS CI | Covered at candidate assurance layer | Retain configured Week and missing-input setup states across phone/tablet/desktop; final exact-head CI and production release evidence remain merge/live gates |
| JRN-08 | GJ-01 new-Student first use reaches one exact saved course, cautious starting signal, exact useful revision, feedback and meaningful Home; skip/recovery and established-account bypass remain safe | High | Responsive browser + persistence + release lineage | `tests/e2e/student-first-use.spec.ts`; `tests/e2e/database-persistence.spec.ts`; Revision CI; governed Pages release | Covered at browser/persistence layer | A real production signup transaction remains outside automated smoke; retain exact deployed-revision lineage |
| DATA-01 | Learner learning evidence cannot cross user boundaries | Critical | Database/RLS | `database-assurance.test.sql` | Covered | Retain owner/cross-user assertions |
| DATA-02 | Learner evidence persists and reloads safely | Critical | Integration + browser | Supabase persistence + DB browser journey | Covered | Retain service/browser round trips |
| DATA-03 | Admin/test accounts are excluded from learner metrics | High | SQL/integration | Admin metrics logic/verification | Partial | Add broader executable aggregate values where needed |
| DATA-04 | Planner state/availability is learner-owned planning context and does not become mastery evidence | Critical | Database/RLS + domain | pgTAP including seven-day availability/readiness contract; Supabase persistence; planner tests; production RLS/readiness verification | Covered | Retain context/evidence separation and recurring-day owner policy |
| DATA-05 | Learner course membership/events remain learner-owned programme context and preserve evidence | Critical | Database/RLS + integration + browser | pgTAP; persistence; DB browser; composite PK | Covered | Retain duplicate/cross-user/remove/re-add cases |
| DATA-06 | Learner plan state defaults safely, remains learner-owned read-only account context and does not become educational evidence | Critical | Database/RLS + domain | `learner-plan-assurance.test.sql`; learner plan resolver tests; production readiness verification | Covered | Before differentiated entitlements, revisit failure/security semantics through FI-002 |
| DATA-07 | First-use account routing state and funnel events remain owner-scoped, bounded and separate from educational evidence/raw answers | Critical | Database/RLS + persistence | `student-first-use-assurance.test.sql`; database-backed browser persistence; onboarding service tests | Covered | Retain cross-user denial, browser event insert-only and evidence-separation assertions |
| SEC-01 | Privileged Admin aggregates are not executable by browser roles | Critical | SQL/integration | database assurance | Covered | Retain service-role-only aggregate execution |
| SEC-02 | Admin operations re-authorise server-side before service-role use | Critical | Integration | `edge-operations.test.ts` | Covered | Retain 401/403/Admin-success boundary |
| SEC-03 | Privileged credentials stay server-side and public readiness remains least privilege | Critical | Static/config + database | secret scan; SECURITY INVOKER assertions | Covered | Pre-existing leaked-password Auth warning remains separate |
| SEC-04 | Planner operations re-authorise server-side and preserve learner isolation | Critical | SQL/integration + protected service | database CI; `edge-operations.test.ts` | Covered | Retain protected-service assertions |
| SEC-05 | Learner plan assignment cannot be self-elevated and protected Admin assignment is authenticated, authorized and auditable | Critical | RLS/RPC + protected Edge integration | `learner-plan-assurance.test.sql`; `edge-operations.test.ts`; `learner-plan-operations`; production ACTIVE/JWT verification and rollback-safe assignment check | Covered | Real billing must replace testing assignment semantics through FI-002 without weakening this boundary |
| CNT-01 | Available learner content has governed educational assurance | Critical | Content Accuracy Assurance Gate | per-pack assurance records/workflows | Partial by catalogue | Never infer content accuracy from software CI |
| A11Y-01 | Critical learner journeys meet automated accessibility baseline | High | Automated accessibility | axe Playwright suite across phone/tablet/desktop | Covered | Manual/AT review still applies where warranted |
| DEF-01 | Open P0/P1/P2 defects are durably tracked and surfaced | High | Defect register + Admin integration | `Defect Register.md`; parser/unit; Founder Assurance | Covered | Zero means zero known recorded defects only |

## FI-021 assurance interpretation

PR #163 added Level-3 assurance for the full GJ-01 first-use boundary: Student selection, Parent/Teacher unavailable semantics, canonical first-course persistence, starting-check completion and skip fallback, exact recommendation-to-work routing, ordinary learning-evidence creation, feedback/Home transition, bounded telemetry, responsive Light/Dark behaviour, post-migration account distinction and owner-scoped RLS for first-use state/events.

Exact PR head `d8971ed83d49e96106c1eed70eb0e8de97908f8d` passed Revision CI #966 before Founder approval and merge. PR #163 then merged to `main` as `8ccf0e14c8d88954d6f942a3d2b085971fe21af0`; post-merge Revision CI #967 also completed successfully. Governed deployment run `32815982121` / Pages run #123 passed release lineage, production backend readiness, build, deployment, production smoke and durable `revision/path-to-live = success`.

This supports FI-021 `In Progress → Live` and the JRN-08 / DATA-07 coverage declarations above. It does not upgrade AUTH-01: the automated production smoke proves the canonical deployed revision and release lineage, not a real external email/Google signup transaction.

## FI-022 assurance interpretation

PR #159 added a Level-3 assurance boundary for learner plan state. Revision CI #938 passed after migration replay, dedicated plan-state pgTAP tests, protected Edge authorization integration, typecheck/lint/unit/build and browser regression.

Production backend enablement on 24 August 2026 established `plan-state-v1`, Free compatibility rows for all existing Auth identities, own-plan SELECT/no browser plan writes, service-role-only assignment RPC execution and an ACTIVE `learner-plan-operations` function with JWT verification enabled. Rollback-safe production checks proved new-user Free defaulting and atomic manual assignment/audit without retaining test data.

Security Advisor introduced no warning-level FI-022 vulnerability. Its informational no-policy notice on `learner_plan_assignment_events` reflects intentional deny-all browser access. Performance Advisor's FI-022 foreign-key-index notices are informational at current scale and do not weaken correctness or authorization assurance.

FI-022 is **Live**. PR #159 merged as `df7d9b520fec60d4b804c49dfc2c441498f37b99`, and production workflow run `32755286006` passed governed release lineage, `plan-state-v1` backend readiness, build, GitHub Pages deployment, production smoke and durable `revision/path-to-live = success`. Assurance coverage remains current evidence for that live foundation; differentiated entitlement behaviour remains FI-002 scope.

## Plan experience refresh assurance interpretation

PR #403 is the governed candidate for the 27 September 2026 Plan experience refresh. It extends the existing FI-001 planner rather than creating a new planning authority or an LLM-owned scheduler.

The candidate adds repeatable domain/database assurance for deterministic multi-day allocation, no duplicate allocation of one candidate within the derived schedule, visible unused capacity rather than invented work, recurring Monday-Sunday capacity, date exceptions, seven-day schema presence and the fail-closed `planner-week-v1` release-readiness contract. Responsive/visual browser assurance covers both the configured Week-first Plan and missing-input setup treatment inside the existing learner shell/canvas.

Exact PR head `0c98256dcc2e79d7526e115058fb1daeaca30f42` passed Revision CI before the production-ledger/documentation reconciliation. The production additive migration was then applied and independently verified: `planner-week-v1` reports `ready: true`, recurring-day backfill is correct, RLS/owner policy and SECURITY INVOKER posture are retained, advisor findings are unchanged from preflight, and the repository migration is reconciled to production ledger version `20260927161359`.

This section does **not** claim PR #403 is Live. The final reconciled PR head must still pass exact-head CI, receive explicit Founder merge approval, merge through the governed boundary, and pass the `planner-week-v1` deployment plus production smoke. Production backend capability is ahead of the current `main` UI during this deliberately bounded release window.

## Existing qualified gaps

- AUTH-01 remains Partial because isolated/browser assurance is not a real production sign-in transaction.
- JRN-03 remains Partial because navigation/content presence does not prove a complete Learn interaction.
- JRN-05 is Covered only for navigation/start; full exam persistence/result completion remains future assurance work.
- DATA-03 remains Partial for value-level Admin/test aggregate exclusion breadth.
- Content assurance remains independent of software CI and varies by governed content pack.
- Supabase leaked-password protection remains a separate managed Auth warning and should be enabled/reverified before broad external acquisition or when the justified Supabase plan supports it.
- PR #403 must not be treated as Live until final exact-head CI, Founder-approved merge and governed release evidence are complete.

## Maintenance model

Update this register when a material PR introduces a new critical journey/control, changes its required assurance, closes a listed gap, removes/weakens an evidence source, or changes production smoke/control ownership. Historical CI runs, audits and incidents remain evidence in their own sources; this register records the current coverage model.

## FI-001 R1a candidate assurance boundary

R1a adds registry-derived deterministic deadline/scope/shared-paper fixtures in `src/app/planner-r1a.test.ts` and canonical route/accepted-session failure browser checks in `tests/e2e/planner-r1a.spec.ts`. The fixture index and explicit partial/oracle boundaries are in `docs/technical/Adaptive Revision Planner Implementation.md`. This candidate extends JRN-07 and protects DATA-04 by reading evidence without changing its semantics; it introduces no database migration, new security boundary or new evidence source.

This is candidate evidence, not a Live or full-R1 claim. R1-07/R1-08 remain R1b, and full cross-surface/starting-check/Quick-check integration remains R1c. Paper-format/AO-specific exact activity selection is not asserted from a generic topic bridge; existing coarse accepted-session identities are retained. Current-head CI, independent review, explicit Founder merge approval and governed release verification remain outstanding.

## FI-001 R1a + R1b integrated candidate assurance — 13 October 2026

Draft #617 now combines R1a with the approved #612/#619 main baseline. `today-recommendations.test.ts` covers R1-06/07/08 and rest/completed/partial-data safety on real registry fixtures; `planner-r1b.spec.ts` covers Home/Plan/REV same-item selection, cross-route dismissal and exact-question Start. The existing R1a engine/scope/date fixtures are retained. Technical docs index the oracles; the PR records actual commands/results and limits, including R1-11's remaining full-journey assurance and live RLS/production coverage. No Live claim, visual baseline repinning or Founder approval is inferred. Independent ChatGPT review, exact-head CI and separate Founder merge approval remain required.

## #617 independent-review repair assurance — 13 October 2026

Review: https://github.com/lhanson-dev/revision/pull/617#issuecomment-6143541718. Old CI #38380380403 failed 19 browser cases; its unit, build, DB/RLS/protected-service and secret checks passed. Fifteen functional failures were stale fixtures/contracts; all affected functional specs now pass in the focused 84-pass/6-viewport-skip run. The serious Plan Information Status contrast defect was independently reproduced and corrected at the shared semantic token; `status-contrast.spec.ts` verifies Light/Dark.

`today-recommendations.test.ts` adds real Learn page/course/component routing, unavailable Learn and conservative ambiguous/expired/archived Exam Prep identity. `planner-r1b.spec.ts` adds Home/Plan/REV Learn Start (including direct Today-reply action) and responsive retained Exam Prep limitations. Existing R1a/R1b acceptance tests are preserved.

Four protected Home screenshot gates remain unresolved; no approved digests were changed. Local paired main/candidate captures and evidence limits are recorded in the review README. Final-head CI is required and its actual state is recorded in #617. This is not merge-ready/Live evidence. R1-11 remains PARTIAL with R1c engineering/assurance responsible for starting-check-only/unscored-Quick-check replan journey coverage. No approval, production verification or new evidence semantics are inferred.

## Founder-approved Home baseline closure — 13 October 2026

The Founder explicitly approved only the four Home Desktop/Phone Light/Dark baseline changes: https://github.com/lhanson-dev/revision/pull/617#issuecomment-6144958070. This is visual approval, not merge approval.

The four values in `tests/e2e/interface-visual-regression.spec.ts` now use exact-head CI #38387830199, implementation head `fdf83fd85b5943b508e51095e2286a23da5a9145`, artifact `11807429017`. Artifact metadata independently matches the run/head and is unexpired. Each hash matches two actual protected-fixture assertion results (initial and retry); no local screenshot digest is accepted. Raw artifact ZIP download returned 403 in this executor, so independent recomputation from PNG bytes is not claimed. New exact-head CI is the required execution check; final outcomes are recorded in #617.

Only the four Home SHA-256 values and their dated audit comment changed in the visual test. All other digest sequences were compared programmatically and remain identical; no visual assertion, fixture, application behavior or normative authority changed. Existing local review captures are unchanged historical evidence.

The four targeted Home cases were run locally with `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npx playwright test tests/e2e/interface-visual-regression.spec.ts --grep '(phone|desktop) home (light|dark) visual contract' --project=phone --project=desktop --output work/baseline-targeted-results --workers=2`: four local hash mismatches, four intentional viewport skips. This executor already reproduces different hashes for unmodified approved main; those local rasterisation results do not replace the specifically approved CI values. No retry, assertion suppression or unrelated repin. All four checks must pass in the required new CI before closure is reported.

Approved main `9afcbe36e83166b5adf498c07a84c625b431a794` remains an ancestor of the PR branch. Keep #617 draft and do not merge. R1-11 remains a separately owned R1c engineering/assurance gap; no full-R1/Live claim.

## 13 October 2026 — learner design consistency candidate (Issue #616)

UI-DS-01 covers shared learner ordinary-action geometry and drift prevention across auth/create account, onboarding, empty/returning Home, Plan, global/course Progress, Courses/Overview, Learn, Practice, Exam Prep/Simulator, REV and shared overlays. Governing sources are Learner Design System and Interactive Component Quality Standard. Required assurance is production-component/browser computed geometry, interaction/accessibility, representative phone/tablet/desktop Light/Dark rendering and the existing approved visual regression set.

Implementation: `tests/e2e/learner-design-consistency.spec.ts`, `scripts/assurance/learner-control-ownership.test.mjs`, and existing journey/theme/overlay/accessibility/token suites. The browser suite checks values actually rendered, font loading, ordinary/specialist target eligibility, async auth recovery preserving work and primary theme consistency. Existing database/RLS/service evidence retains its independent ownership.

**Status: Partial / fix in review (draft PR #618).** Representative local browser coverage exists, but final exact-head CI, Founder-approved changed visual baselines and production evidence are not yet established. Neither screenshot capture nor an independent code review closes Issue #616. See `audits/2026-10-13-learner-design-consistency-616.md` for inventory, corrected owners, specialist exception rationale and limitations.

## Issue #622 Home refinement candidate — 13 October 2026

Affected existing controls: returning Home/REV, exact Start across Home/Plan/REV, accepted commitments, optional first-use context, assessment date truth, shared progress and accessible learner controls. No new data/security journey. Tests: returning-home, planner-r1b, accepted-sessions, home-refinement, learner-design-consistency, learner-control-ownership, Home model/setup and shared UI tests. Status **Partial / implementation under review** until exact-head CI, Founder visual approval, independent final integration review and separate merge approval. Existing screenshot hashes and historical evidence remain intact. Execution evidence belongs in `audits/2026-10-13-home-refinement-622.md`; no Live/production claim.

Issue #622 update: Founder approved the Home comparison bundle on 13 October 2026 at reviewed PR #623 head `134a020c739714bce81f46286b0f3bab1b503425`. Only four matching CI-derived Home digests are replaced, with provenance in `audits/2026-10-13-home-622-visual-approval.md`. Coverage remains Partial pending final exact-head CI/review and later approved production evidence. No merge approval is inferred.

## Issue #622 Home refinement — verified production release (13 October 2026)

**Status: Covered for the bounded #622 Home refinement; separate planner-wide R1c and unrelated journey assurance gaps remain independently owned.** The four Founder-approved Home visual assertions and targeted configured review contracts passed on [PR #623 exact-head CI #38468098665](https://github.com/lhanson-dev/revision/actions/runs/38468098665) at `ba33ef56bbdf5be35c25a7e9a010eb28b752c756`. Final CI recorded **1,343 unit tests passed (35 existing skips)** and **605 browser tests passed (322 intentional project/state skips)**, including shared component, responsive, keyboard, reduced-motion and exact Start/Plan agreement assurance. Founder-approved visual provenance is retained in `audits/2026-10-13-home-622-visual-approval.md`.

After explicit Founder approval, [PR #623](https://github.com/lhanson-dev/revision/pull/623) merged as `b5dfdd9d0611ec46818f804b4ed33f9c455d8def`. [Production deployment #38471897996](https://github.com/lhanson-dev/revision/actions/runs/38471897996) passed release lineage, backend readiness, build/deploy, production smoke and `revision/path-to-live`. The production smoke validates canonical deployed delivery and release integrity; personalised journey behaviour remains supported by controlled browser/unit evidence, not a claimed real-account production walkthrough. The unavailable frozen Claude HTML limits pixel-fidelity claims to the written handoff and approved rendered comparisons. Prior candidate sections above are dated historical assurance snapshots, not current pending gates.

## FI-001 R1c evidence-integrity candidate — 13 October 2026

**Current state:** #617 (R1a/R1b) merged at `e9d1266791f234753780ffbb489f0126ce12eadf` and production path-to-live passed in #38401029075. This supersedes earlier *candidate/unmerged* wording in the dated R1a/R1b entries above, which remain retained review history.

**R1-11: PARTIAL, not Covered.** The new `src/app/planner-r1c.test.tsx` and `tests/e2e/planner-r1c.spec.ts` are an implementation candidate, with CI #38467737756 green at the earlier `e7fe803b` commit and final-head CI still required after subsequent improvements. Their target is the critical distinction between starting-check-only low-strength directional observations (`starting_check_evidence`), unscored Learn Quick checks and properly validated `learning_evidence`. They add joined first-use, cross-screen, deterministic replan and Progress checks. Existing `progress.spec.ts` proves a scored Practice positive control. The added dev-only Learn fixture browser interaction exercises the real unscored `QuickCheck` component (wrong answer, retry, correct answer), then returns to Home/Plan/REV/Progress and verifies no scored write or unsupported measure change. Inspected Business 7132 and Psychology 7182 authored Learn do not currently publish that block. The fixture remains a **non-shipped** educational example, not a published-course end-to-end journey; do not equate a component fixture with a shipped-content journey. JRN-07 and DATA-04 retain earlier coverage **without claiming** this new R1-11 integration boundary is closed.

Earlier exact-head Revision CI #38467737756 passed foundation checks, 1,344 unit tests, 569 Playwright tests and database/RLS/protected service checks at `e7fe803b7123fa6e7afde5983425849301b010c9`. The newer component-to-learner browser test and documentation updates still require exact-head CI, and **no PR #624 production path-to-live** result exists. No database/RLS change is proposed. R2–R5 intentionally remain out of scope.

### FI-001 R1c integrated candidate CI and independent assessment — 13 October 2026

Draft PR #624 R1c was reconstructed from integrated `main` `b5dfdd9d0611ec46818f804b4ed33f9c455d8def` after PR #623 merged, preserving the newer Home implementation, authority and register amendments. At head `25a39255ff042b8520bd7bcd3babec584c4b2f3d`, [Revision CI #38476263924](https://github.com/lhanson-dev/revision/actions/runs/38476263924) passed all required jobs: 1,346 unit passing / 35 skipped, 610 browser passing / 326 skipped, typecheck, lint, build, assurance plan/secrets and isolated database/RLS/protected services. Automated green results support the bounded component/provenance regression tests, not production release evidence.

**R1-11 remains PARTIAL**: dev-only Learn fixture interaction uses the actual production `QuickCheck` component, but is not a published-course student Learn completion. Approved authored Business 7132/Psychology 7182 currently offer no such shipped block. Closing R1-11 requires applicable authentic published-course evidence or a separately governed change to the frozen oracle. JRN-07/DATA-04 retain their existing independent coverage; do not promote them to full R1-11 assurance or claim R1 complete. Founder-specific PR merge approval and subsequent production verification remain separate gates.

### FI-001 R1c independent-review corrections — 14 October 2026

Independent source review of #624 identified an untested aspect of **R1-14** (genuinely stronger validated scored Psychology evidence compared with weaker Business evidence during a moved Business deadline) and over-broad descriptions of R1-11 store-mock/first-use coverage. The targeted candidate test in `src/app/planner-r1a.test.ts` now uses actual Business 7132 and Psychology 7182 approved MCQ identities and answer keys, asserting observed contrasting understanding, source-specific reason codes, deadline eligibility, determinism and unchanged scored evidence after replanning. **R1-14 verification is conditional on refreshed exact-head CI**, and this evidence does not establish R3 subject-balance optimality. The R1-11 store-mock and synthetic first-use limitations remain, so **R1-11 stays PARTIAL**. Existing R1-12 tests cover date-only boundaries but do not independently prove changing Europe/London timezone offsets; its true DST-offset transition layer is **PARTIAL**. Earlier exact-head CI #38501428456 was green for the previous head (1,346 unit, 610 browser, isolated database/RLS), not for the new candidate. Preserve this material gap accounting until follow-on assurance; #621 remains open. No normative amendment, scorer change, production deployment or Founder merge approval is implied.

### FI-001 R1-12 DST-offset proof candidate — 14 October 2026

After the successful governed PR #624 release (merge `0bcbda49bbc2004e98e0e244cbece16623935d26`, [path-to-live #38549354206](https://github.com/lhanson-dev/revision/actions/runs/38549354206)), R1-12 still lacked a *genuine changing-offset* regression. A targeted candidate `src/app/planner-r1-dst.test.ts` now checks Europe/London spring and autumn 2026 UTC offset changes against actual local date keys, R1 date-only exam expiry, deterministic Business 7132 planner schedule and Sunday/Monday capacity, and same-day/next-day REV dismissal. **Status: CANDIDATE; exact-head CI and Founder-approved merge still required before the R1-12 DST-offset layer is marked Covered.** Do not confuse date-only March/October fixtures with offset transitions or unit results with browser/live-user evidence.

**R1-11 stays PARTIAL**, with its independent published-course Learn QuickCheck and authentic onboarding read-after-write replan limits retained under open issue #621. No scored attainment, R2 readiness or full-R1 closure is implied by this bounded regression.

### FI-001 R2a weekly programme projection — candidate (14 October 2026)

**Readiness provenance:** Founder explicitly approved bounded FI-001 R2 `Ready` once PR #628 was merged (merge `97d209c73025af9590ed06bb89034bf222fb3a4d`; [Ready receipt](https://github.com/lhanson-dev/revision/pull/628#issuecomment-6170900923)). The first **implementation candidate** adds `src/engine/planning/programme.ts` and `programme.test.ts`, independent of the live R1 60-day planner. It projects final known future assessment milestones and read-only supported course opportunity presence in calendar weeks. Tests cover >60-day horizon, 120/365/730-day dates, multi-paper shared candidate survival, stale/invalid/unknown dates, no invented unsupported Psychology options, correct scheduled-day exam cutoff, deterministic order, immutable inputs and DST-safe date keys. **Status: CANDIDATE/NOT LIVE; exact-head CI, explicit Founder merge approval, production release and subsequent R2b/c UI integration outstanding.** Programme presence is not a booked activity, learning evidence, valid candidate count-to-workload conversion or grade/coverage prediction. No new schema, entitlements, UI, AI scheduling or scorer. Current R1-11 remains PARTIAL under #621. R3–R5/FI-009–012 are separate readiness gates.


### FI-001 R2b Plan-horizon candidate — 14 October 2026

R2a PR #629 has Founder-approved merge `c227f91934cf7e078335adc19a5ae34b16897535` and [successful production path-to-live #38589514099](https://github.com/lhanson-dev/revision/actions/runs/38589514099), **foundation Live with no R2 learner-facing claims**. The governed draft R2b branch adds full-horizon weekly Plan presentation, stable exact assessment milestones, bounded 14-day concrete Plan projection and disjoint accepted-session windows for current/visible weeks and months. New `plan-session-windows.test.ts` is R2-09 **candidate** coverage for 120-/365-/730-day query shape, not browser/DB proof. R2-01/05/06/08/09/12 must be verified at the learner route, including failure messaging, selected real Business 7132/Psychology 7182 paper scope, accessibility, responsive and visual checks. R2-04 persistence/weekly capacity and R2-07/10/11 cross-surface consistency remain in full R2c programme acceptance. **R2b is not Live or merge-approved.** R1-11 stays Partial on #621.


**R2b weekly capacity candidate clarification (14 October 2026):** `plan-weekly-capacity.test.ts` verifies programme-week capacity derived only from saved recurring Monday–Sunday availability and date exceptions, including partial weeks, missing/zero/low capacity and DST. Learner copy must distinguish available time from bookings and cannot claim a long-range allocation or a feasibility guarantee. This augments R2-04/R2-06/R2-08 candidate evidence; R2c retains full persistence and cross-surface oracles. No evidence semantics, R1-11 status (#621), new entitlement or R3 balancing authority changes.

### FI-001 R2b production and R2c shared-guidance candidate — 14 October 2026

**R2b release evidence:** PR #630 received exact-head CI #38600932633 and a Founder-specific exact-head approval marker before merging as `9d119f829fb22c7e9db9fb75b02b0b34aa8d78da`. [Path-to-live #38622989882](https://github.com/lhanson-dev/revision/actions/runs/38622989882) passed lineage, backend readiness, build, deployment, smoke and durable status. Accordingly the R2b learner Plan full-horizon **outlook** is Live; the historical candidate language above remains a dated point-in-time record, not a current gate.

**R2c candidate evidence (not Live):** `plan-session-windows.ts` centralises Home/Plan/REV accepted-range and 14-day detailed-forecast boundaries and ensures distant visible accepted sessions cannot change the near-term next recommendation. The existing pure `programme.ts` now projects explanatory course focus in closest eligible exam order, preserving date cutoffs and shared-paper later work without claiming R3 fairness or fixed future bookings. New `programme.test.ts` oracles, `plan-session-windows.test.ts` and `planner-r2c.spec.ts` target R2-02/03/05/07/11, while R2b and R1 tests remain evidence for the remaining frozen oracles. **Status: candidate**, pending exact-head typecheck/lint/build, unit, responsive/browser, DB/RLS, risk review, final current-main integration, Founder-specific merge approval and governed release. The new tests use controlled candidates/network-edge mock students, not genuine live learner transactions. R2-10 retains unscored/directional evidence limitations and R1-11 is still **PARTIAL** under #621. Performance timings and selected real Psychology Paper 3 option journeys must be assessed honestly before asserting full R2-01..12 closure.


### FI-001 R2 — learner-value defect after #631 release (14 October 2026)

**Founder-observed gap, not Covered:** Production Plan can list about 35 identical weekly course/exam summaries without naming useful syllabus topics. The already-verified R2a–R2c source, CI and deployment evidence remains real, but none of those checks established *distinct weekly study topics across a whole exam horizon*. This is a **Partial** R2 weekly-priority experience acceptance result, not a request to erase prior CI or hide the regression.

**Correction candidate:** `src/engine/planning/weekly-focus.ts`, `weekly-focus.test.ts`, `PlanProgrammeOutlook.tsx`, and `tests/e2e/planner-r2-weekly-focus.spec.ts` introduce/test supported specific topics for distant weeks, meaningful variation across >30 weeks, real course/paper eligibility, 0/15/30-minute and unknown capacity, low-time multi-course non-starvation, no invented long-range session persistence, and responsive/accessibility exposure. Preserve Home/Plan/REV exact-Start and all frozen R2-01..12 regression tests. Status **not covered until this branch passes exact-head CI and Founder-approved production smoke**. R1-11 remains Partial in independent issue #621; R3–R5 and FI-009–012 are outside this R2 defect correction.

# Adaptive Revision Planner Implementation

**Status:** FI-001 live on `main`; Plan experience refresh live, with the 29 September 2026 task-rationale presentation refinement proposed on `fix/remove-plan-why-this`  
**Owner:** Product / Engineering  
**Canonical product surface:** `/app/` React/Vite learner runtime, published under GitHub Pages as `/revision/app/`  
**Governed product authority:** `10-product-governance/Adaptive Revision Planning.md`

## Purpose

Record the current implementation truth for FI-001 Adaptive Revision Planning in the canonical learner runtime. Normative planner behaviour remains governed by `10-product-governance/Adaptive Revision Planning.md`; this document describes how that authority is implemented, including the 27 September 2026 Plan experience refresh and the proposed 29 September 2026 removal of repeated inline task rationale text.

## Canonical runtime and route

The authenticated learner product is the React/Vite application at `/app/`, published under GitHub Pages as `/revision/app/`.

Current implementation entry points include:

- `src/app/navigation.ts` — learner route model and hash-route parsing;
- `src/app/PlannerRuntime.tsx` and `src/app/App.tsx` — learner shell, Home, Plan, REV and shared learner experience;
- `src/app/PlanScreen.tsx` — canonical `#/plan` experience;
- `src/engine/planning/**` — deterministic planning domain logic;
- `src/app/planner-model.ts` — bridge from learner evidence/assessments/availability into planner candidates and days;
- `src/services/planning/**` — planner persistence adapters and loading/saving boundaries;
- `supabase/migrations/**` — version-controlled learner planner persistence and protected Admin aggregates.

The retired static learner runtime and legacy/compatibility surfaces are not implementation targets.

## Implemented product behaviour

FI-001 is live in the canonical learner runtime. Governed learner-wide destinations are:

- Home;
- Plan;
- Progress; and
- Courses.

Ask REV is the persistent global action rather than a peer navigation destination. Desktop uses the governed left learner rail; tablet/mobile use the governed menu/drawer with the persistent Ask REV dock.

### Home

Home is led by REV and answers the immediate question **What should I do now?**. When planner context is available, Home presents the current recommendation and Today’s revision plan rather than a static timetable.

### Plan

`#/plan` is the wider adaptive-programme surface. The 27 September 2026 refresh keeps the existing learner shell and stable learner canvas but changes the internal Plan composition from equal setup/management panels to a schedule-first experience.

The refreshed Plan implementation provides:

- a compact shared learner-header Ask REV route using the existing contextual conversation layer rather than a second chat implementation;
- a plain-English **Your plan adapts as you go** explanation without exposing internal weights or treating passive activity as learning evidence;
- setup-first empty states when exams and/or recurring availability are missing;
- known course/paper choices for adding public examinations plus a secondary route for mocks/topic tests/other assessments;
- recurring Monday-Sunday realistic capacity controls;
- concise programme context for the next exam, current-week capacity and normal/prioritising state;
- secondary **Manage exams** and **Plan settings** controls once setup exists;
- **Day / Week / Month** views with **Week as the default**;
- structured recommendation reasons retained for contextual explanation through REV without repeating them beneath every Plan task;
- restrained governed subject accents for task/exam recognition; and
- an upcoming-exam milestone treatment.

The plan remains recalculated rather than maintained as a task-debt ledger. Missed work creates new planning information; it is not mechanically moved forward as overdue work.

#### View precision

The deterministic schedule supplies the near-term Day/Week views. Day is the most specific execution view. Week shows the current seven-day adaptive forecast. Month groups the following four weeks into broader subject/time focus plus exam milestones rather than rendering a falsely precise 30-day task grid.

All views are representations of the same adaptive planner, not separate manual calendars.

### REV

REV receives structured planner context and can explain why work is being recommended, discuss learner priorities and apply bounded temporary planning preferences. REV does not own the scheduling calculation and does not turn preferences into mastery or readiness evidence.

## Deterministic planning core

Planning authority lives in pure TypeScript domain logic under `src/engine/planning/**`, not in an LLM call.

The planner consumes context including:

- active assessments and dates;
- assessment importance and scope;
- recurring Monday-Sunday realistic revision capacity and date-specific exceptions;
- specification/course work candidates;
- learning evidence, coverage, readiness and evidence confidence;
- recent planner/activity state; and
- bounded learner planning preferences.

It produces ordered priority candidates, a deterministic multi-day schedule, current-day items, capacity state, structured reason codes and calculation metadata.

The implementation uses an explainable weighted heuristic rather than a trained planning model. Versioned implementation parameters are tested and are not shown to learners as scores.

### Multi-day schedule allocation

`buildAdaptivePlan()` allocates useful ranked candidates across the available planner days in deterministic priority order. Each candidate is allocated at most once in the current derived schedule. A day retains its remaining/unallocated capacity rather than being filled with invented low-value work.

`today` remains the first scheduled day's items, so Home/existing today consumers continue to use the same deterministic source rather than a separate schedule calculation.

The schedule is derived state. It is rebuilt from current assessments, evidence, availability and preferences; individual future task placements are not persisted as immutable appointments.

### Current reason vocabulary

The implemented planner uses bounded reason codes including:

- `ASSESSMENT_SOON`;
- `HIGH_IMPORTANCE_ASSESSMENT`;
- `LOW_EVIDENCE`;
- `WEAK_EVIDENCE`;
- `UNDER_COVERED`;
- `EXAM_PRACTICE_DUE`;
- `HIGH_MARK_OPPORTUNITY`;
- `ALREADY_STRONG`;
- `LEARNER_PRIORITY`;
- `COMPETING_PRIORITY`;
- `CAPACITY_CONSTRAINED`.

The reason codes remain planner truth and are available to REV for plain-language explanation. The Plan task cards themselves do not repeat a **Why this?** line beneath every entry; the page-level adaptive-plan explanation provides the routine context and REV can explain a specific recommendation when useful.

## Capacity and prioritising state

The engine compares remaining useful work with realistic remaining capacity. When useful workload materially exceeds capacity, Revision enters a calm `prioritising` state and concentrates on the highest-value candidates rather than presenting an impossible full-coverage timetable.

Workload estimates are deliberately coarse. They are not represented as precise predictions of study time.

## Recalculation behaviour

The implementation can recalculate after material changes including:

- assessment create/edit/archive;
- recurring weekly availability or date-specific exception changes;
- new validated learning evidence;
- reliable planner-linked activity completion;
- material learner planning-preference changes;
- meaningful external-revision reconciliation; and
- establishing a new local day/current-plan view.

Minor navigation events do not create learner-visible plan churn.

## Persistence

Planner persistence is implemented in Supabase using learner-owned tables including:

- `revision_assessments`;
- `revision_availability_profiles`;
- `revision_availability_exceptions`;
- `revision_planning_preferences`;
- `revision_activity_events`.

These tables reference the authenticated learner, use RLS, deny anonymous access and expose owner-scoped authenticated operations only.

### Recurring weekly availability migration

`20260927161359_add_recurring_weekly_planner_availability.sql` adds `monday_minutes` through `sunday_minutes` to the existing learner-owned availability profile. The filename is reconciled to the exact production Supabase migration-ledger version. Existing rows are backfilled from the former weekday/weekend values:

- Monday-Friday inherit `weekday_minutes`;
- Saturday-Sunday inherit `weekend_minutes`.

The legacy aggregate columns remain for backwards compatibility. New saves persist the seven daily values and refresh the aggregate compatibility values. Existing row ownership/RLS remains unchanged because the migration extends the existing protected table rather than creating a new learner-data surface.

Production enablement on 27 September 2026 verified `planner-week-v1` with `ready: true`, all seven capability checks present, the existing availability row correctly backfilled, RLS still enabled with the existing learner-owner policy, and the readiness RPC still `SECURITY INVOKER`. Pre/post Security and Performance Advisor findings were unchanged and introduced no Plan-specific finding.

The current plan remains derived state. Revision persists learner/context inputs and relevant activity state, then recomputes planning outputs.

## Activity and evidence boundary

Planner activity supports states such as offered, started, meaningfully engaged, completed and chosen alternative.

Planner events, availability and preferences are planning/behaviour context only. They do not become mastery/readiness evidence simply because an item was opened, selected, scheduled or completed. Learning evidence must come through the governed evidence model.

## Admin and operational evidence

Planner operational evidence is exposed through protected server-side paths. `planner-operations` is deployed in production with JWT verification, and privileged planner aggregates are not executable by browser roles.

Current Admin/Founder Assurance can surface planner coverage and operational evidence without treating missing telemetry as Healthy.

## Assurance implemented / required for this refresh

FI-001 is high-risk because it touches persisted learner data, deterministic guidance and protected operational evidence.

Repeatable assurance includes:

- unit tests for planner prioritisation/capacity/reason behaviour;
- unit assurance that multi-day allocation is deterministic, does not duplicate one candidate across days and leaves genuinely unused capacity visible;
- planner-model tests for distinct recurring daily capacity and date exceptions;
- responsive Playwright coverage across Plan and the existing learner shell;
- isolated database migration replay and pgTAP RLS/privilege assurance;
- authenticated Supabase persistence/reload integration;
- protected Edge-function assurance;
- production backend-readiness checks for the required planner database contract; and
- typecheck, lint, unit tests and production build in GitHub Actions.

The Plan refresh visual/browser assurance covers configured Week-view Plan and the missing-exam / missing-availability setup treatment across the governed responsive matrix. The approved Plan light/dark visual captures are pinned exactly after manual inspection rather than accepted through a broad tolerance.

PR #403 exact head `0c98256dcc2e79d7526e115058fb1daeaca30f42` passed Revision CI before the production-ledger/documentation reconciliation. Because that reconciliation changes the PR head, final merge readiness still requires fresh exact-head CI for the final candidate.

The Assurance Coverage Register retains qualified gaps that are outside this Plan change and must not be overstated as closed.

## Backend release contract

The Plan refresh advances the required production readiness contract from `plan-state-v1` to **`planner-week-v1`**.

`planner-week-v1` requires the existing learner-plan capabilities plus the seven recurring availability columns on `revision_availability_profiles`. `.github/workflows/deploy-pages.yml` expects the same contract.

Production was enabled and independently verified on 27 September 2026 before merge. The live database reports `planner-week-v1` with `ready: true`; the production migration ledger records version `20260927161359`; backfill/RLS/function posture are verified; and post-change advisor results match the preflight baseline.

Production is therefore backend-ready for the refreshed Plan release. The product change remains pending until final exact-head CI, explicit Founder merge approval, merge, governed deployment and production smoke complete.

This readiness proof confirms required backend capability presence; it does not replace end-to-end persistence, security or journey assurance.

## Documentation impact

The 29 September 2026 task-rationale presentation refinement updates the normative adaptive-planning authority, this implementation record, `PlanScreen` and configured-Plan browser assurance in the same governed change. It removes only the repeated inline rationale text from Plan task cards; structured reason codes, planner calculation, REV explanation capability, persistence, backend contracts and historical evidence are unchanged.

## FI-001 R1a — deadline, scope and shared-paper correctness (implementation candidate)

This bounded change implements the R1a safe subset authorised by the Founder Ready receipt in the [R1 analysis](../../10-product-governance/backlog/FI-001%20Evidence-led%20Planner%20R1%20Readiness%20Analysis.md). It is not evidence of merge, deployment, or completion of R1b/R1c.

`planner-model.ts` resolves assessments against the supplied active programme states. Course, subject and optional module identifiers must agree; legacy subject-only records are used only when exactly one state resolves. Invalid explicit topic scopes no longer widen to a whole course. Published Exam Prep paper guides constrain paper topic eligibility; a missing mapping for a multi-paper shared course fails closed. Dates must be real local calendar dates, and date-only exams expire at the beginning of their date. Calendar-day arithmetic uses local date components and UTC ordinals, avoiding elapsed-hour errors across DST.

Candidates carry `assessmentTargets` with assessment/date, module/paper identity where known, and verified topic scope. Generic work is merged by course + shared learning context + topic + supported activity only when the existing catalogue declares shared learning. Component-specific contexts retain their module in the intent key. All applicable future assessment references remain on the candidate. Each proposed scheduled day discards expired targets and uses the nearest surviving assessment for its reason context; a shared task can therefore survive for a later paper without continuing to target an expired paper. Candidate and recommendation intent IDs do not depend on the assessment date or assessment order. Existing accepted-session recommendation IDs are not rewritten; course/topic suppression and planned/done/skipped capacity handling remain compatible.

The bridge offers only topic-backed Quick check or Flashcards. It no longer invents an `exam-question` candidate from a score/urgency threshold: the existing exam Start leads to generic Exam Prep, not a verified exact question. Missing assets produce no candidate, with a Flashcards fallback when that asset exists. Explicit scoped topics provide the only existing selection input for optional Psychology content; published exam choice-group metadata rejects multiple choices from one group. Without an explicit choice, optional topics are excluded, leaving mapped compulsory topics available. No learner-option persistence or new syllabus/AO mapping is introduced.

Allocation requires the full existing coarse activity estimate to fit the day's remaining capacity. A 30-minute task is never described as a complete 15-minute task. Plan Start now routes to the exact course/component and topic Practice destination. If accepted-session loading fails, derived Plan suggestions are withheld and an accessible status explains that commitments could not be checked. Evidence-load failure clears stale derived learning states. Persisted commitments remain learner choices and are not deleted or marked completed because an assessment changes.

### Fixture index and limits

The deterministic cases below live in `src/app/planner-r1a.test.ts`, derived from `listAvailableContentAdapters()` and the real catalogue identities `aqa:aqa-a-level:7132` and `aqa:aqa-a-level:7182`.

| R1 oracle | R1a test name / coverage | Boundary |
| --- | --- | --- |
| R1-01 | merges shared Business 7132 intents and retains both paper scopes; keeps distinct paper intents separate in the scheduler | PASS for generic assets and distinct engine intents; paper-format engine fixture is explicitly synthetic, not a shipped exact-question claim |
| R1-02 | cuts off paper-only work on the exam day while shared later-paper work survives | PASS for per-day cutoff and later-paper provenance |
| R1-03 | replans earlier/later/archived dates without changing stable intent IDs or accepted sessions | PASS for rebuild/identity/immutability |
| R1-04 | only resolves exact active courses and unambiguous legacy scopes; rejects invalid explicit scopes | PASS for active-state identity, conflicting modules and invalid scope |
| R1-05 | preserves planned/done/skipped commitments and legacy keys | PASS for existing accepted-session suppression/capacity contract |
| R1-06 | leaves absent/unknown dates and unsupported assets honest | PASS for R1a null timed-plan contract; Home/REV fallback integration remains R1b |
| R1-07 / R1-08 | not implemented in this change | R1b ranking unification and dismissal/midnight integration explicitly excluded |
| R1-09 | limits Psychology 7182 to the mapped paper and explicit option choice | PASS for scoped selections, missing/conflicting choices, inactive assessments and unknown paper IDs; no option-selection storage added |
| R1-10 | never truncates work into invented durations at 0/15/30 minutes | PASS for capacity/full-estimate behavior; accepted-session deductions tested separately |
| R1-11 / R1-14 | reads existing evidence without changing understanding/readiness when deadlines shift | PASS for read-only evidence and date-safe replanning; full starting-check/Quick-check journey integration remains R1c |
| R1-12 | uses local calendar days across 2026-03-29, 2026-10-25 and 2026-12-31 deterministically | PASS under Europe/London for DST and year boundaries |
| R1-13 | leaves absent/unknown dates and unsupported assets honest; browser: hides derived tasks when accepted commitments cannot be loaded; supported Plan Start keeps exact course/topic Practice identity | Unit asset fallback plus canonical browser failure/route smoke |

Remaining constraints are deliberate: the existing 60-day horizon, evidence/readiness calculations, preference weights, storage, RLS and entitlements are unchanged. The current session schema has no paper/question intent, so existing coarse course/topic accepted-session suppression is retained rather than inventing a migration. Actual paper-specific format/AO selection and exact-question Start cannot be assured by this generic bridge; no new paper-skill work is fabricated or merged into shared knowledge. Unknown paper maps fail closed. R1b must reconcile Home/Plan/REV ranking and fallback; this PR does not claim those surfaces now agree. Independent review and exact-head CI remain required before any Founder merge decision.

### Executed local validation for this candidate

- `TZ=Europe/London npx vitest run src/app/planner-r1a.test.ts src/engine/planning/planning.test.ts src/app/planner-model.test.ts src/app/accepted-sessions.test.ts src/app/rev-suggestions.test.ts`: 50 passed. An earlier baseline run found the old partial-duration expectation; that assertion was corrected to the approved R1-10 rule.
- `npm run validate`: typecheck, lint, all unit tests and production build passed; 1,332 tests passed and 35 skipped (235 test files passed, 13 skipped). Two existing React Hooks lint warnings and the existing bundle-size warning remain. No paid provider workflow was run.
- `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npx playwright install chromium`: completed successfully with the pinned Playwright browser.
- `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npx playwright test tests/e2e/planner-r1a.spec.ts tests/e2e/plan-screen-v22.spec.ts --workers=2`: initially 47 passed, 84 intentionally skipped, one failed assertion expecting duplicated weekly minutes. The one relevant expectation was corrected from 5h 15m to 3h 55m (160m of shared work plus 75m of accepted sessions).
- `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npx playwright test tests/e2e/plan-screen-v22.spec.ts --project=desktop --grep 'summary is time against plan' --workers=1`: the affected test passed after that assertion correction. New R1a failure/Start checks passed at all three viewport classes; existing keyboard and WCAG A/AA cases passed in the broader run.
- `git diff --check`: passed. `origin/main` remained `f07bbbb0b8f2059e4fcd7f5cf811a8e0975b0a54` at the final integration check.

No database/RLS service tests or production smoke were executed for this frontend-only change. GitHub CI and independent ChatGPT review are separate outstanding evidence; passing local tests does not authorise merge or establish deployment.

## FI-001 R1b integrated candidate — 13 October 2026

The #617 branch incorporates approved main `9afcbe36` (#612 exact question Start and #619 Today-first authority). R1a cutoffs, shared-intent nonduplication, scope joins, full-duration capacity and accepted-session protections remain.

`today-recommendations.ts` is the shared presentation source over the existing `PlanDay` and engine. Accepted actionable commitments sort by creation timestamp then stable session ID before derived engine order; no clock appointments are inferred. Home promotes the same identity that Plan marks Up next, and REV's opening/today reply describes the same topic, course, activity and factual reason. Confirmed preferences still use the existing governed save path; they do not rewrite accepted commitments or evidence.

`activityForTopic` now permits a real exam-question when the existing recommendation calls for it or the existing near-assessment/evidence context supports exam practice. `exactExamTarget` resolves only published unrestricted assets, respecting the assessed module and selected topic scope. Candidate IDs retain exact module/question identity, so distinct paper intents are not collapsed into generic shared work. Module/exam/question identity is carried through the engine and the #612 focused launcher on all three screens. Generic Quick checks and Flashcards remain asset-backed.

Not now/another suggestion exclude stable IDs for the local day, leave persisted sessions untouched and exhaust honestly. Missing planning inputs permit explicitly unscheduled intents ranked by the same engine (with actual assessment candidates where available, otherwise neutral deadline inputs); no timed plan or availability is inferred. Completed/rest days and partial data do not invoke this fallback. All screens use the same bounded accepted-session horizon and refresh local-date calculations at midnight/DST.

Legacy accepted sessions lack paper/question/card fields. Broad Practice resolves a supported Quick check (or Flashcards if retained recommendation identity specifies it); broad Exam Prep cannot establish an exact question and now fails closed with a clear limitation. New exact-question recommendation keys preserve module/question identity without a database migration. Unsupported accepted sessions remain stored and visible; no unsupported lead recommendation is offered. Paper/AO-specific generation beyond available asset/scope assurance remains excluded.

Additional fixture index:

| Oracle | Test / evidence |
| --- | --- |
| R1-06 | `today-recommendations.test.ts`: missing inputs unscheduled; browser missing setup |
| R1-07 | same file: accepted before derived, exact row/REV reason, exact real paper/question; `planner-r1b.spec.ts`: all three Starts |
| R1-08 | same file: exclusion/exhaustion/local-day expiry; browser cross-route dismissal |
| R1-10/13 | same file: rest/completed/partial data/removed course; existing R1a failure browser check |

R1-01..05/09..14 retain the R1a fixtures above. R1-11's full starting-check/unscored activity journey, live database/RLS and production smoke are not newly claimed by these tests. No scoring, RLS, entitlement, telemetry schema, paid operation, 60-day expansion or R2–R5 changes. The assurance register and PR state the actual final results and limitations.

Documentation-impact check: planner, Home and contextual REV technical docs and assurance register updated; no ADR/schema change. Historical analysis and audits preserved. The merged #619 authority still contains prospective status text (including FI-001's “v0.7 proposed” banner); flag this for a separate narrow source-status correction, without interpreting it as unmerged policy or changing policy here.

## Independent-review corrections to #617 — 13 October 2026

The review of `c7d2d4e8` found that accepted Learn used ignored topic context, REV's Today reply omitted its action, broad accepted Exam Prep could substitute a question, and some browser fixtures assumed the superseded Home selector or did not mock accepted-session loading.

Accepted Learn now resolves the first real adapter Learn page for the promised topic and carries `learnTarget` (page ID and component where required). All three surfaces route through `learnRouteForTask`, using canonical `learnPageId`, with a course route for shared learning or component route for component-specific learning. Ambiguous states/missing pages cannot lead a claimed exact Start. The first supported page is a topic entry point, not an invented page-level commitment.

An accepted Exam Prep session without exact question identity is kept visible/stored and gives a limitation when Start is requested. A recognised exact recommendation key must resolve uniquely to a published unrestricted module/question **and** a currently active, future, matching module assessment whose verified scope covers the topic. Missing/ambiguous scope, expired/archived assessment, unmatched key or duplicate asset identities withhold exact Start; another paper is not substituted. No persistence migration or backfilled identity.

The Today conversation reply retains its selected task and exposes direct Start. The action revalidates against the current next task so a preference change, dismissal or rollover cannot start a stale offered recommendation. Existing preference confirmation and safety replies remain unchanged.

The shared Information Status foreground token now has 5.65:1 contrast on its unchanged semantic background (previously 4.47:1), covering Plan messages via the canonical component. No page-local styling exception. Tests reproduce the old violation on the real component and verify the corrected pair in both themes.

Focused browser assurance: **84 passed, 6 intentional viewport skips** across accepted sessions, responsive hierarchy, Ask REV, brand/motion, accessibility, R1b and status contrast. Learn Start is covered from Home/Plan/REV Today reply at desktop; broad Exam Prep limitation is responsive. Frozen R1a/R1b/route tests remain, including deadline/shared-paper/capacity/choice behavior. Final relevant validation and exact-head CI are recorded in the PR. No local unrelated Content Factory/provider suite was run in this correction task.

Home's four protected visual digests remain unchanged and unresolved. Paired local approved-main/candidate captures and inspection findings are retained in `docs/design/learner-redesign-v2/screenshots/fi-001-r1b-review/README.md`; they explain content-driven wrapping/height differences and the blocked original CI artifact download. They are review evidence, not approved CI baseline replacements.

R1-11 remains PARTIAL. **R1c engineering/assurance owner** must add the full starting-check-only and unscored Quick-check → Home/Plan/REV replan journey, asserting unchanged understanding/progress/readiness with no scored evidence. No Live/full-R1 claim. Product-authority/historical documents were not modified, including the already-flagged stale proposed-status banner.

## Founder-approved Home baseline closure — 13 October 2026

The Founder explicitly approved only the four Home Desktop/Phone Light/Dark baseline changes: https://github.com/lhanson-dev/revision/pull/617#issuecomment-6144958070. This is visual approval, not merge approval.

The four values in `tests/e2e/interface-visual-regression.spec.ts` now use exact-head CI #38387830199, implementation head `fdf83fd85b5943b508e51095e2286a23da5a9145`, artifact `11807429017`. Artifact metadata independently matches the run/head and is unexpired. Each hash matches two actual protected-fixture assertion results (initial and retry); no local screenshot digest is accepted. Raw artifact ZIP download returned 403 in this executor, so independent recomputation from PNG bytes is not claimed. New exact-head CI is the required execution check; final outcomes are recorded in #617.

Only the four Home SHA-256 values and their dated audit comment changed in the visual test. All other digest sequences were compared programmatically and remain identical; no visual assertion, fixture, application behavior or normative authority changed. Existing local review captures are unchanged historical evidence.

The four targeted Home cases were run locally with `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npx playwright test tests/e2e/interface-visual-regression.spec.ts --grep '(phone|desktop) home (light|dark) visual contract' --project=phone --project=desktop --output work/baseline-targeted-results --workers=2`: four local hash mismatches, four intentional viewport skips. This executor already reproduces different hashes for unmodified approved main; those local rasterisation results do not replace the specifically approved CI values. No retry, assertion suppression or unrelated repin. All four checks must pass in the required new CI before closure is reported.

Approved main `9afcbe36e83166b5adf498c07a84c625b431a794` remains an ancestor of the PR branch. Keep #617 draft and do not merge. R1-11 remains a separately owned R1c engineering/assurance gap; no full-R1/Live claim.

## FI-001 R1c — evidence-provenance assurance candidate (13 October 2026)

**Baseline:** Main `501388ee77484ffd896a7dad876a657d822b6ccb` (#618), containing merged R1a/R1b #617 and authority #619. The earlier #617 candidate sections in this file are retained as dated pre-merge implementation/review evidence; #617 is now **merged, deployed and path-to-live verified** by workflow #38401029075 at `e9d1266791f234753780ffbb489f0126ce12eadf`. That production result covers R1a/R1b, **not** R1c.

**Canonical runtime:** React/Vite authenticated `/app/`, published as `/revision/app/` via `src/app/PlannerRuntime.tsx`. The Home, Plan and REV screens and learner Progress use `loadLearningEvidence` with `createCourseLearningState`/`createModuleLearningState`. Onboarding saves FI-006 directional observations through the distinct `starting_check_evidence` store. The Learn `QuickCheck` component is labelled “Not scored” and has no evidence callback; scored Practice is a different activity and intentionally persists `learning_evidence`. No new scoring algorithm, data schema or entitlement is introduced.

**Candidate assurance — exact-head rerun required after latest browser addition, not a completed R1-11 claim:** New `src/app/planner-r1c.test.tsx` covers a real Business 7132 course and question identity, starting-check directional persistence vs empty scored stream, stable planner/Progress/REV snapshot with no new scored evidence, the unscored Learn component's fixture-level contract, and validated scored Practice positive-control state. `tests/e2e/planner-r1c.spec.ts` covers starting-check UI submission with five stored directional answers and no scored answers, a synthetic return to Home/Plan/REV/Progress, navigation/reload and no invented topic coverage/readiness, plus preserved accepted Today commitment across directional-only reload. The synthetic account-state transition is for regression verification; it does not assert that first-use production routing skips the first useful revision requirement. Existing `tests/e2e/progress.spec.ts` covers scored Practice -> persisted evidence -> Progress increase, and existing R1a/R1b tests cover route identities and planner safety.

**Important assurance limit:** The checked-in Learn UI supports unscored Quick checks, but the inspected authored Business 7132 and Psychology 7182 Learn paths do not publish a `quick-check` block. The existing dev-only `/revision/learn-fixtures.html` renders the actual production `QuickCheck` component and already tests interactive answers/retry. New `planner-r1c.spec.ts` now completes a wrong answer, retries and answers correctly in that **existing dev-only Learn fixture**, then returns to a synthetic authenticated learner on Home/Plan/REV/Progress with the same accepted commitment, unchanged scored evidence, coverage and readiness. The fixture is not published course content, so this is a production-component browser boundary check rather than a fully published course learning journey. Do not add a fake shipped educational asset or overstate coverage. R1-11 must remain **Partial** if no assured, real, publishable unscored learning asset or equivalent valid production-surface proof can be exercised. Psychology 7182 option/asset checks remain in existing R1a fixtures; no syllabus data were manufactured.

### R1-01..R1-14 assessment and evidence scope (review correction, 14 October 2026)

**Verified existing baseline:** Revision CI [#38501428456](https://github.com/lhanson-dev/revision/actions/runs/38501428456) passed at `6f1671ef380d03df112132b547a0ab8053da4ee0` (1,346 unit passed/35 skipped; 610 browser passed/326 skipped; typecheck, lint, build, assurance plan, database/RLS and protected services). **The added R1-14 regression and this documentation revision are a new candidate** and need fresh exact-head CI before merge. These labels are acceptance-evidence assessments, not assertions that production users were tested.

| Case | Named test evidence | Contract assessment before refreshed CI |
| --- | --- | --- |
| R1-01 | `planner-r1a.test.ts`: shared Business two-paper de-duplication and distinct paper intentions | PASS (existing deterministic scope) |
| R1-02 | `planner-r1a.test.ts`: exam-day cutoff and later-paper carryover | PASS (existing deterministic scope) |
| R1-03 | `planner-r1a.test.ts`: earlier/later/archived dates and accepted-session inputs | PASS (existing deterministic scope) |
| R1-04 | `planner-r1a.test.ts`: multi-course state, invalid explicit/legacy scopes | PASS (existing deterministic scope) |
| R1-05 | `planner-r1a.test.ts`, `accepted-sessions.test.ts`, `planner-r1b.spec.ts`, `planner-r1c.spec.ts` | PASS (booked-minute and accepted identity regression) |
| R1-06 | `today-recommendations.test.ts`, `planner-r1b.spec.ts` | PASS (truthful unscheduled/empty-data behaviour) |
| R1-07 | `today-recommendations.test.ts`, `planner-r1b.spec.ts` | PASS (shared next recommendation, supported exact Start) |
| R1-08 | `today-recommendations.test.ts`, `planner-r1b.spec.ts` | PASS for approved local-day alternatives/dismissal; historical 'Not now' terminology interpreted through current authority |
| R1-09 | `planner-r1a.test.ts`: mapped Psychology 7182 paper options and exclusions | PASS (existing deterministic scope) |
| R1-10 | `planner-r1a.test.ts`, `planning.test.ts`, `today-recommendations.test.ts` | PASS (capacity, rest, unsupported duration) |
| R1-11 | `planner-r1c.test.tsx`, `planner-r1c.spec.ts`, `progress.spec.ts`, `learn-blocks.spec.ts` | **PARTIAL**: production Learn QuickCheck only appears in dev fixture; starting-check store is mocked and browser return uses synthetic onboarding completion; no published-course unscored Learn completion-to-replan proof |
| R1-12 | `planner-r1a.test.ts`, `today-recommendations.test.ts` | **PARTIAL for true zone-transition assurance**: local-calendar boundaries are deterministic, but suite does not independently exercise differing Europe/London timezone offsets during a real DST transition |
| R1-13 | `planner-r1a.spec.ts`, `planner-r1b.spec.ts`, `today-recommendations.test.ts` | PASS (partial failures/unsupported routes give honest outcomes) |
| R1-14 | `planner-r1a.test.ts`: new separate scored Business/Psychology comparison across earlier Business deadline, candidate reasons and date-safe schedule | **NEW CANDIDATE; exact-head CI pending**. Does not claim optimal cross-subject balance (R3). |

**R1-11 semantics:** The store-mock unit test proves serialization and that a separately supplied empty scored array produces a stable result; it does not itself pipe saved directional data into planner ingestion. The browser test proves stored observations, then uses a synthetic account-stage transition and mock backend; the unscored Learn interaction uses a dev-only fixture instead of an assured published course. The scored-positive-control test uses real approved course identities and the existing evidence engine; the separate `progress.spec.ts` browser journey covers scored Practice persistence and displayed coverage. These remain useful bounded tests, not a complete R1-11 end-to-end oracle.

**R1-12 semantics:** A date-only test passing near March/October boundaries is not a test that actually crosses a changing Europe/London offset; do not report the stronger assurance layer as executed. R1-12 timezone-transition precision can be completed in a targeted follow-up without changing planner algorithms.

**Documentation impact:** Narrow active authority-status wording corrected for previously merged #619, and the R1 backlog lifecycle/current implementation status separated from its historical preapproval snapshot. Assurance Coverage Register tracks R1-11 as Partial until appropriate CI, independent review and required published-content journey evidence. No ADR, schema or scoring change required. R2–R5 remain outside R1 and require their own DoR/Founder approval.

**Executed CI evidence for prior candidate head:** Revision CI [#38467737756](https://github.com/lhanson-dev/revision/actions/runs/38467737756) passed at `e7fe803b7123fa6e7afde5983425849301b010c9`: typecheck, lint, 1,344 passing unit tests (35 skipped), production build, 569 Playwright passing tests (324 skipped), and isolated database/RLS/protected services. The latest added dev-fixture-to-learner browser test and this documentation update require **fresh exact-head CI**; the earlier green run does not cover those changes. Production release is **not** claimed for PR #624. R1-11 remains Partial until a real published unscored Learn activity can be exercised or a separately authorised assurance disposition is recorded.

### R1c exact-head integration validation — 13 October 2026

Draft PR #624 was reconstructed against the approved Home #623 integration main `b5dfdd9d0611ec46818f804b4ed33f9c455d8def`; its seven intended changed files were verified relative to that parent without overwriting the newer Home implementation and authority updates. The resulting integrated candidate `25a39255ff042b8520bd7bcd3babec584c4b2f3d` completed [Revision CI #38476263924](https://github.com/lhanson-dev/revision/actions/runs/38476263924): assurance plan and secrets scan **PASS**, foundation quality **PASS**, typecheck/lint/build **PASS**, Vitest **1,346 passed / 35 skipped**, Playwright **610 passed / 326 skipped**, database/RLS/protected services **PASS**. All three R1c unit tests were run; the three new R1c browser cases include deliberate non-desktop skips where another suite provides responsive coverage. These are sandboxed fixture and isolated database test results, not evidence of real production users or a deployment of #624.

**Post-implementation evidence assessment (same implementing executor; independent PR review still required):** PASS for the bounded regression layer and current-main integration, **HOLD** for full R1-11 closure. The starting-check-only persisted observation and scored Practice positive-control paths are represented, and the real unscored Learn component was exercised in a dev-only fixture before Home/Plan/REV/Progress were revisited. Neither approved authored Business 7132 nor Psychology 7182 Learn currently publishes that unscored block, so the original R1-11 oracle's published-course completion-to-replan journey is not demonstrated. This is an assurance gap, **not** permission to invent course questions, amend mastery algorithms or promote R2 Ready. The issue #621 remains open. PR #624 remains draft pending specific Founder merge approval if released as a bounded partial-assurance increment; no R1-complete or R1c production-live status is claimed.

### Review correction and CI provenance — 14 October 2026

The material independent-review findings were (1) the previous R1-14 comparison lacked genuinely stronger scored evidence from a different subject, (2) the R1-11 mock-only unit test did not perform a production read-after-write replan, and (3) the matrix claimed pending CI after the baseline exact-head run passed. R1-14 now uses real approved Business/Psychology objective-question identities and keyed responses to test contrasting scored evidence, changing Business assessment urgency, attributable planner reasons, safe target dates and unchanged knowledge evidence. R1-11 remains **PARTIAL**, including unavailable published unscored Learn content, and R1-12 timezone-offset assurance remains explicitly **PARTIAL**. No new product behaviour, grading rules, R2 scope or educational-content authoring is introduced. The refreshed exact-head CI outcome must be linked on PR #624 before merge; existing passed baseline is referenced above and is not misrepresented as coverage of this new commit.

### FI-001 R1-12 actual London offset-transition regression candidate — 14 October 2026

After PR #624 merged and [production #38549354206](https://github.com/lhanson-dev/revision/actions/runs/38549354206) passed all path-to-live gates, the only remaining **calendar-specific** R1-12 limitation was that earlier date-key tests named DST dates without crossing a real UTC-offset change. The focused `src/app/planner-r1-dst.test.ts` test now explicitly switches the Node test runtime to `Europe/London` (restored after each case) and observes the **actual** 2026 spring-forward (GMT to BST, UTC offset 0 to -60 minutes) and autumn fall-back (BST to GMT, -60 to 0 minutes). It compares two instants an hour apart across each transition, including the repeated autumn 01:30 clock hour, and verifies stable local-day identity and exam-day distance, unchanged planner candidates, real Sunday/Monday capacity assignment, deterministic date-safe scheduling, same-day REV Not now persistence, expiry on local midnight and no work due on the actual exam date. It uses real Business 7132 course/topic registry identities and no fabricated scored evidence.

**Acceptance status:** R1-12's previously missing *offset-transition deterministic unit* layer is now covered by a new **candidate test**, subject to **new exact-head CI**; until that CI passes it must not be presented as verified. The unit test is not a live device/browser timezone matrix or actual production user evidence. R1-11 remains **PARTIAL**: existing dev-only Learn QuickCheck fixture and mocked/synthetic onboarding-to-replan cannot replace genuine published-course Learn assurance. Issue #621 remains open; no conditional acceptance, R1 full completion, R2 approval, algorithm change, curriculum authoring or production deployment is claimed. This is a documentation and test-only change; normative product authority and ADRs are unchanged.

### FI-001 R2a programme projection candidate — 14 October 2026

The Founder human-approved FI-001 R2 `Ready` following merge of definition PR #628 ([receipt](https://github.com/lhanson-dev/revision/pull/628#issuecomment-6170900923)), based on the already-approved full-exam-horizon planning authority and 12 frozen R2 test oracles. No R3 allocation tuning or FI-009–012 evidence/treatment scope was approved. The new `src/engine/planning/programme.ts` is a **pure, read-only R2a domain projection only**: one calendar-key week per visible week through the final valid, active, authorised exact-course assessment. It projects truthful assessment milestones and **supported course opportunity presence** only when backed by a scoped R1 candidate's actual assessment targets. It does not output dated activity appointments, accepted commitments, weekly allocation ratios, priorities, mastery, predicted grades, study minutes or a second scheduling engine. A real deadline on the first day of a week cannot create an exam-only supported opportunity that week. Invalid/archived/past/unknown-course dates are excluded; absent valid exams produce a truthful no-known-date result. Date arithmetic uses date-only UTC calculations after a caller provides local-today key, so DST's 23/25-hour days cannot shift milestone calendar dates.

`src/engine/planning/programme.test.ts` adds deterministic R2a fixture coverage for a 120-/365-/730-day horizon, supported shared Business paper carryover, unsupported Psychology option fail-closed, invalid/removed dates, actual per-paper deadline cutoff, DST date keys, stable ordering and immutable inputs. These are **candidate tests**, not verified CI or production release until the exact-head run passes and the Founder authorises a specific implementation PR merge. R2b Plan projection, UX, weekly meaningful prioritisation, capacity and accepted-session lazy I/O, and R2c Home/REV/browser integration are **not implemented** in this slice. The existing R1 60-day live forecast remains unchanged. Keep #621 R1-11 Partial; no learner-facing release claim is made from the R2a code alone.

### FI-001 R2b Plan weekly-horizon candidate — 14 October 2026

Following Founder-authorised PR #629 R2a merge `c227f91934cf7e078335adc19a5ae34b16897535` and successful [production path-to-live #38589514099](https://github.com/lhanson-dev/revision/actions/runs/38589514099), this **draft R2b implementation branch** integrates the pure programme projection into the canonical React `/revision/app/#/plan` route, in `PlanScreen.tsx` and the new `PlanProgrammeOutlook.tsx`. The existing route, management controls, Day/Week/Month, design-system components, course identity and student accepted-session actions remain canonical. This candidate adds a collapsed, accessible, navigable factual weekly outlook with real saved active-course assessment milestones through the final known exam, and opportunity presence only where R1 candidate target provenance supports it. No distant subject list is asserted as fixed study allocation, attainment, grade or booked appointment. Missing dates remain unknown and are explained without invented milestones. The UI addition awaits browser/visual/a11y assurance and Founder review.

A separate `plan-session-windows.ts` defines the rolling **14-day concrete task projection** and keeps an independent **60-day accepted-commitment lookahead** (matching pre-R2 accepted-topic preservation), plus a bounded visible week/month read. It never stretches one accepted-session query across an unviewed 120-/365-/730-day gap. `PlanScreen` reads the bounded commitment and visible windows independently and de-duplicates saved session IDs. The 60-day accepted lookahead is **not** 60 days of generated tasks. A failed near-term read fails closed for suggestions; a failed distant visible read is reported without suppressing valid near-term guidance. The Plan caller bounds R1-derived detailed task days to 14 through a new optional `buildPlannerSnapshot` argument; the original shared default remains 60 days, pending R2c shared guidance reconciliation. This R2b branch is not yet CI-approved, merged, deployed or Live. R1-11 remains Partial under #621; R3–R5 and FI-009–012 are excluded.


**R2b bounded weekly-capacity clarification (14 October 2026):** `plan-weekly-capacity.ts` reports the learner's actual saved recurring availability and any saved date-specific exceptions for relevant days of each visible programme week. Missing availability remains unknown; explicit zero remains zero. This is a coarse *available time* observation before saved commitments, not an allocated subject schedule, promise of feasibility, fabricated future appointment or new educational evidence. `PlanProgrammeOutlook` exposes the value with explicit uncertainty, and `plan-weekly-capacity.test.ts` covers shortened current/final weeks, a zero-time exception, unknown/invalid values, low availability and DST. The implementation is a PR candidate until exact-head CI, approval and production assurance; it does not enter R3 cross-course optimisation.

### FI-001 R2c shared guidance and weekly focus candidate — 14 October 2026

**Baseline:** Founder-approved PR #630 merged at `9d119f829fb22c7e9db9fb75b02b0b34aa8d78da` and completed [governed production path-to-live #38622989882](https://github.com/lhanson-dev/revision/actions/runs/38622989882), including deployed production smoke and durable `revision/path-to-live = success`. Thus R2b is Live as a *bounded learner Plan outlook*, not full R2 completion. This R2c change is a new implementation candidate on a governed branch, **not merged, CI-verified or deployed** until final evidence says otherwise.

Canonical routes: authenticated `/revision/app/#/home`, `#/plan` and the persistent Ask REV panel from `PlannerRuntime.tsx` → `PlannerHomeScreen.tsx`, `PlanScreen.tsx`, `PlannerRevScreen.tsx`. No retired static learner route is changed.

**One detailed horizon:** `plan-session-windows.ts` now defines the shared 14 calendar-day automatic detailed forecast and 60 calendar-date accepted-commitment lookahead. All three current learner surfaces supply the same bounded detailed horizon to the existing R1 `buildPlannerSnapshot()` and read the same inclusive near accepted-session dates. Previously Home/REV could derive 60 days of future tasks and read 61 dates while Plan derived 14 days and read 60. Existing activity ranking, exact Start routes, learner Not now/alternatives, accepted-session mutations, Supabase ownership and evidence semantics are unchanged.

**Distant visible-month safety:** Plan still reads a disjoint visible future week/month solely to display genuine accepted sessions; it now filters that distant range *out* before calculating the near-term shared next action. Merely browsing 730 days forward must not remove or reorder today's eligible subjects because of a distant saved booking. Failed near-term accepted reads still fail closed and a failed distant visible read remains a local warning. No programme-week appointment is persisted.

**Coarse weekly focus, not R3 optimisation:** `src/engine/planning/programme.ts` retains exact assessment milestones and evidence-backed R1 opportunity presence, and adds a read-only deterministic **closest still-eligible paper first** ordering of candidate-supported courses in each programme week. The weekly outlook names which course to consider first, the real paper date used for that ordering, and alternative supported courses. As assessments expire the shared topic remains eligible for a later paper where supported; unknown Psychology options are never introduced. This is exam-proximity context, **not** a balanced future timetable, fixed subject allocation, weighting algorithm, guaranteed useful minutes, grade/readiness increase or fairness optimisation. Longer-range capacity observations remain explicitly before accepted commitments, with uncertainty and zero handled truthfully. R3 allocation tuning and FI-009–012 remain outside authority.

**Assurance mapping:** R2-01/08/09 and responsive/a11y are exercised by R2b's 120/365/730-day `planner-r2b.spec.ts` and `plan-session-windows.test.ts`; R2-02/03/05/11 by real R1 `planner-r1a.test.ts`, R2a `programme.test.ts` and the new cross-paper priority assertions; R2-04/06 by existing accepted-session/database/RLS/browser tests, `plan-weekly-capacity.test.ts` and R2b failure isolation; R2-07 and near/distant window consistency by new `planner-r2c.spec.ts` and accepted-window unit tests plus R1b cross-route regressions; R2-10 by existing scored Practice/Progress and R1-11 directional-boundary regression. This is a *candidate mapping*, not a blanket 12/12 full-journey proof before exact-head CI and scenario review. Real-user production activity, independent selected Psychology Paper 3 browser coverage, a measured 730-day performance benchmark and R1-11's genuine published-course QuickCheck + authentic first-use save/read-back remain explicitly distinguishable from controlled fixtures; issue #621 is still Partial. No normative product amendment, schema, migration, entitlements or ADR is needed for this approved-scope implementation. CI, exact-head integration, Founder-specific merge approval, post-merge production deployment/smoke and assurance register status remain mandatory.


### FI-001 R2 weekly usefulness correction — implementation candidate (14 October 2026)

**Learner observation:** after PR #631 was deployed, the long-range Plan outlook showed roughly 35 weeks of near-identical course and upcoming-paper descriptions, without telling a student which actual syllabus topics to focus on. CI passing and factual milestones were not sufficient evidence of the accepted R2 product outcome. This is an **R2 acceptance defect**, not an expansion of R3 or a reason to claim educational efficacy.

**Canonical surface:** authenticated `/revision/app/#/plan` served by `PlannerRuntime.tsx` → `PlanScreen.tsx` → `PlanProgrammeOutlook.tsx`; the actual prior week-only model is `src/engine/planning/programme.ts`. No legacy/static path, scorer, evidence, assessment authoring, persistence/schema or REV conversation route is changed.

**Remediation candidate:** `src/engine/planning/weekly-focus.ts` decorates the R2a factual exam-week projection with up to one-to-three *topic-level* preparation focuses per week. The topic IDs and course/exam scope derive exclusively from the existing R1 `plannerCandidatesFromLearningState()` supported-asset bridge and verified assessment targets. For each course, the module reuses R1 `rankPlannerCandidate()` priority ranking and shows as-yet-unmentioned topics before explicitly identifying later supported repeats as **also suggested in an earlier week** (not proof that the learner studied the topic); no unsupported topic, unselected Psychology 7182 option or post-exam paper-specific suggestion is introduced. Time limits come from existing `knownProgrammeWeekMinutes()`: explicit zero => no topics, too-small availability => no falsely splittable 20/30-minute activity; unknown availability => provisional topics without capacity claims. With room for only one suggested topic, eligible courses are alternated week by week unless an actual exam is imminent (simple R2 no-starvation safeguard, **not** the unapproved R3 global balancing optimiser). The static outlook is a changing projection, not a guaranteed future allocation, dated session, coverage commitment or forecast learning outcome. All exact Start recommendations remain exclusively the unchanged short-range R1 planner.

**Experience:** Plan immediately shows the next three weeks with real course and topic names and minimal time context. The original full programme is still available in an accessible disclosure through the final known paper, including real exam milestones. Course/skill-focus copy is no longer repeated for every week. The chosen topics and opportunities recalculate when existing course/evidence/exam/availability inputs change; the client neither writes accepted sessions nor converts a weekly topic into mastery/readiness. Explanatory limitations are stated once, not pasted across 35 weekly rows.

**Assurance:** `weekly-focus.test.ts` exercises different topics across >30 weeks, deterministic reorder, selected course/topic provenance, true multi-paper cutoff, 0/15/30/45/120-minute capacity, unknown capacity, no-starvation and no mutation; `planner-r2-weekly-focus.spec.ts` checks actual authored Business 7132 topic text on the canonical browser Plan, responsive/a11y and zero-time truth. The original R2a/R2b/R2c suites, Home/REV exact next-action, selected Psychology 7182 topic scope and RLS/security remain required regression gates. CI and Founder-specific merge are still **pending**; until approved, this is NOT Live. Historical #631 delivery evidence remains historically true as a release, but its claim of full R2 weekly learner usefulness is explicitly corrected by this record. R1-11 remains Partial / #621. R3–R5 and FI-009–012 remain excluded. The existing R2 normative authority already requires useful, capacity-aware weekly priorities, so no new normative decision or ADR is introduced.


**R2 learner-value candidate refinements:** The topic list also identifies the supported source activity type (for example, Quick check, Flashcards or Exam question practice) so a weekly row contains more than a syllabus heading. In the already loaded near accepted-commitment window, `focusMinutesAfterKnownCommitments()` subtracts planned/done saved sessions, excludes skipped sessions and fails closed when the accepted read is unavailable; outside that bounded window, study time remains labelled provisional and no year-long session read is added. The presentation is explicitly non-booked and does not promise that a later-week activity type will remain the exact recommended Start after new evidence arrives.

## FI-001 programme-first vertical slice — implementation candidate (15 October 2026)

**Status:** In Progress on `feature/fi-001-programme-first-vertical-slice-20261015`; not Live or merged. Explicit Founder `Analyse → Ready` decision recorded on merged PR #633 (conversation approval, GitHub receipt comment [#6188330812](https://github.com/lhanson-dev/revision/pull/633#issuecomment-6188330812)). This is not merge authorisation for implementation.

**Canonical route:** existing React/Vite learner `/revision/app/#/plan`, with shared `PlannerHomeScreen` and `PlannerRevScreen` consumers. No legacy runtime, new scheduler backend, database migration or unapproved assessment generation.

**Candidate implementation:** `src/engine/planning/preparation.ts` derives bounded, explainable weekly knowledge/preparation objectives from valid actual paper targets, supported candidates, calibrated learner evidence inputs and saved realistic capacity. It uses per-paper eligibility (including later-paper shared work) and truthfully reports unserved opportunities; no automatic revisit solely because a previous UI displayed a topic. `src/app/planner-model.ts` joins that programme to the approved topic-knowledge engine and maps an unknown-evidence topic to its actual existing Learn page only when validated, exposing supported exact Start identity. The same programme's near-term objectives constrain the legacy tested daily packing/eligibility utility used by Plan, Home and REV; it does not permit the old independent weekly-focus rotation to determine priorities. The existing `PlanProgrammeOutlook` displays selected-month/week objectives, educational purpose, paper/evidence reasons, capacity and limitations with a whole-exam summary. Accepted sessions and separate bounded I/O remain unchanged.

**Limits:** a supported activity candidate is not exhaustive Course Truth; candidate durations are coarse, not a verified estimate of full syllabus workload. Paper-response/AO dependencies that do not have assured mapping/assets cannot be claimed satisfied. Baseline engine and legacy weekly-focus source stay as regression references pending controlled retirement. No FI-009/010/011/012 specialist implementation. A first successful test run is not completion of SV-01..13 or proof of educational results.

**Gates:** run deterministic/published-course fixtures, pre-paper/capacity/shared-paper/sensitivity tests, R1/R2 regression, actual Home/Plan/REV and phone/desktop accessibility/browser and exact Start, typecheck/lint/build, DB/RLS as applicable, exact-head CI and honest scenario assessment versus `fd856583`. Maintain `PLN-VALUE-01` **Uncovered/Partial** until all student-value cases and learner usability criteria pass, not merely new fixture tests. Production route/values remain unchanged until explicit Founder merge approval and governed release succeed.

### FI-001 programme-first Learn → valid check sequence (draft PR #637, 15 October 2026)

`preparationCandidatesFromLearningState` now distinguishes two supported, separately identified educational treatments for a genuinely untested topic where both an approved Learn page and an approved Practice opportunity exist: (a) an initial explanation in the actual published Learn page, and (b) an independent scored check **after** that introduction in the same derived preparation programme. The check is not a newly generated question or a claim that reading established understanding. Where there is already scoped scored evidence, the adapter avoids reflexively forcing the learner through introductory Learn merely because the Topic Knowledge sufficiency gate remains provisional. An existing verified exact exam-question recommendation is protected from a silent treatment substitution. Per-week objective ownership prevents detailed daily work from slipping into a later, unrelated week; genuine accepted learner commitments remain outside those derived tasks.

**Measured limitation / product gate still open:** A deferred Learn and check is not proof that the learner *completed* the foundational learning, and the current candidate-backed programme cannot yet demonstrate full per-paper obligation/AO/prerequisite coverage, reliable phase progression through the entire horizon, or meaningful late-period objectives once the initial supported opportunities have been allocated. The honest capacity/programme limitations shown in UI are not a substitute for that educational capability. The approved SV-01..13 learner scenarios and `PLN-VALUE-01` remain **PARTIAL/NOT ACCEPTED**, notwithstanding passing unit or security gates. Existing R1-11 authentic unscored Learn published-course assurance remains Partial under #621. Before any merge request, exercise actual supported Start/Home/Plan/REV and 13 scenario counterexamples; do not merely weaken old Quick Check or accepted-session regression assertions when the recommendation treatment changes.

**Cross-course scarce-capacity safeguard (draft PR #637, 15 October 2026):** The week-level allocator now inspects *known remaining pre-paper capacity* for each supported opportunity group before it picks among competing courses. Where one course has an attainable whole-activity deadline and another course's shorter eligible activity can still fit a subsequent pre-exam slot, it protects the former from being crowded out solely by the latter's closer paper. The comparison remains deterministic, respects date-only cutoffs, and never splits a 30-minute treatment into an incompatible 20-minute slot. An unknown future capacity does not authorise this preference. The objective carries a truthful reason identifying the time trade-off. A focused pure fixture checks this constrained Business-versus-Psychology allocation, candidate input-order stability, no unserved supported opportunities and actual deadline. This is a bounded heuristic over *supported opportunities*, not full syllabus workload proof, a guaranteed optimum, or SV-03/SV-05 full acceptance. Required scenario evaluation and held-out real-content usability remain open.

**CI diagnosis and correction (15 October 2026):** Head `808bb385` reached TypeScript/lint but failed three legacy planner-model unit cases (1,410 others passed) because those legitimately partial synthetic learner states have no Topic Knowledge object. The new requirement inventory assumed `state.topicKnowledge.topics` always existed. The inventory now reads it optionally and classifies absent evidence as `unknown` without generating a score; the existing tests plus a direct legacy-state requirement regression are the gate. The failed run is not a successful acceptance result. Follow-up head CI is required before any review conclusion.

**Paper-response requirement progression (PR #637 candidate, pending exact-head CI):** The same programme model now includes independently identified *published paper sections* (response format, mark demand, assessment date) from the governed AQA Business 7132 / Psychology 7182 exam-paper guides, separate from shared course topics and from the number of published questions. An exact permitted exam question is attributed to a section only where the approved module, exam/question ID, topic/option scope and section label all match; unlabelled or unmatched questions cannot be presented as proof that a response section is covered. Each section lists available and actually forecast section-matched practice candidates, plus AOs observed on those exact question assets (not a learner capability or a claim about all marks on the paper). Plan offers an optional disclosure of the real response formats, proposed practice and uncovered formats. The allocator carries verified section IDs on matched question opportunities, explains the response format, and, among equally pressured exam-practice opportunities for the same paper, prefers an unrepresented section to a duplicate section. It does not preempt evidence-appropriate learning or override deadlines/capacity/learner choices. Added source-backed three-paper/8-section Business tests, Psychology option rejection and a pure same-paper distinct-format priority fixture. This is **bounded verified section breadth**, not an exhaustive AO-by-skill evidence/learning prerequisite graph, real workload estimate, calibrated practice progression, or SV-01..13 educational acceptance. Do not refresh visual baselines without independent Founder-visible assessment.

**R2 responsive test selector correction (PR #637):** Adding the separately named paper/knowledge requirement disclosures made legacy selectors using `outlook.locator('summary')` ambiguous. `planner-r2b.spec.ts`, `planner-r2c.spec.ts` and `planner-r2-weekly-focus.spec.ts` now select the unchanged accessible *whole programme* disclosure by its exact visible name instead of accidentally clicking any new summary. This preserves the original substantive full-horizon/navigation invariant, and does not waive the two existing desktop visual-baseline differences. Exact-head CI required.

**Approved paper/topic requirement inventory (PR #637 candidate, not yet released):** The shared `buildLearnerPreparationProgramme()` now derives an ordered, deduplicated `requirements` list from each active, valid-dated assessment's assured `scopeTopicIds()` and the exact selected course, before any accepted-session candidate filtering. A shared Business knowledge topic appears once with all applicable paper deadlines; ambiguous or conflicting Psychology option scope fails closed. Each requirement records the existing governed Topic Knowledge classification (unknown/needs-work/provisional/supported), the IDs of valid current supported treatment opportunities, forecast-allocated treatment IDs, and any positive observation of an accepted session within the bounded session read. None of these fields asserts completion, exhaustive specification obligations, paper-skill sufficiency, or mastery. The Plan full-exam outlook includes an optional, accessible requirements/gaps disclosure and deliberately distinguishes saved work from demonstrated learning. The implementation does **not** convert candidate durations into true whole-syllabus workload; paper-specific skills and their confirmed AOs must still become first-class obligations before the 13 scenario acceptance gate can pass. Source-derived Business and Psychology option tests and accepted-session preservation tests have been added; exact-head CI and learner usability are pending.

**Exact Learn Start correction (draft PR #637):** Suggested `learn` work on Plan Day formerly opened the focused Practice overlay rather than navigating to the existing verified Learn page. Suggested Plan Start now shares Home's exact `learnRouteForTask` resolution; an unavailable page is not falsely started. The `Learn` treatment is named explicitly in the Plan task row, and responsive R1-13 browser assurance checks the *offered* treatment against the real Start destination. This is a route-integrity correction, not whole-programme educational acceptance or R1-11 closure. Exact-head CI is required.\n\n**CI record:** early PR #637 candidates passed TypeScript/lint/unit suites except two identified regressions (exact exam-question preserved and programme-wide constrained-capacity state restored); later candidates reached full responsive Playwright. The earlier failed browser runs revealed a new static Plan limitations block also marked as live `role=status` (duplicate status locator) and tests tied to the superseded topic-rotation/date/view contracts. The implementation fixes static semantics and migrates those test expectations to check real exact Start, educational objective explanations, and dynamic truthful workload. All subsequent head results require fresh exact-head evidence; this text is not a CI pass claim.


### FI-001 incomplete-setup correction (draft PR #637, 15 October 2026)

At the canonical `/revision/app/#/plan` route (`app/index.html` → `src/main.tsx` → `PlannerRuntime` → `PlanScreen`), a learner with active courses but no exam dates and/or no recurring study-time profile is **not** presented with seven empty Week rows and a misleading zero-time plan summary as the dominant screen. The existing Plan surface leads with one truthful missing-setup step: add dated exams first, otherwise set realistic study time. Its existing exams and study-time controls remain present, and a supported independent activity can still be started from Courses without a first scored check. Week remains the default **for configured learners**.

The calendar is never treated as invalid or erased: a visible learner-accepted session continues to appear in the Week/Day display regardless of missing setup; the student may explicitly reveal the calendar, navigate to an exam or open a `?view=`/`?date=` deep link. An unavailable accepted-session read is not converted into zero bookings or fictitious schedule capacity. No new persisted state, readiness score, artificial exam date, or scheduler has been added.

**Regression ownership:** `tests/e2e/empty-states.spec.ts`, `tests/e2e/interface-plan-progress.spec.ts`, and `tests/e2e/plan-screen-v22.spec.ts` assert the guided initial state, no empty/zero summary until the user requests it, setup actions, explicit navigation, and preservation of existing accepted sessions. Both desktop Plan light/dark protected digests are deliberately **not re-pinned** until new full-size captures are inspected and approved. The previous #38770327258 failed CI remains failed; the revised head requires fresh exact-head CI, source/visual judgement and final current-`main` integration. This targeted UX correction does **not** fulfil the 13 educational acceptance scenarios or change their pass policy.


### Founder-approved Plan baseline refresh — FI-001 PR #637 (16 October 2026)

The Founder explicitly approved **PR #637 Plan visual baselines only**, after reviewing the side-by-side Desktop Plan Light/Dark comparison. The approved updated digest pair is from exact-head CI run [38812328043](https://github.com/lhanson-dev/revision/actions/runs/38812328043) at `a80d709915db67e4ee2fe18a33720f7fda8efab4`, visual artifact `12009562571`: Light `0ce6b48485da0384b247be52f532a135a53cf738b4594e0c9b54deef8ce1b53a`, Dark `43e9bbf0b04ddf1ff68a92e8516c4031a76a4b924e6ca412e06e35504c0353b7`. No other protected digests are changed. This supersedes the earlier *pending visual approval* note above without changing historical evidence. The same prior run independently found three dark-theme test timeouts from an absent successful saved-session network fixture; the responsive test now explicitly provides an empty, successful read, preserving the real dark-theme assertions. The new PR head requires fresh exact-head CI, and visual acceptance does **not** establish educational acceptance, PR merge authorisation, or deployment.


### FI-001 batched regression and scenario-safety checkpoint (16 October 2026, draft PR #637)

**Batch execution discipline:** after approval of the two desktop Plan visual states, use a single atomic governed PR branch commit for cohesive test, provenance and documentation changes rather than five individual GitHub file pushes and five independent 15–20 minute responsive suites. Preserve the existing full exact-head CI (typecheck/lint/1,416+ unit tests, 3-viewport Playwright including exact screenshot contracts, build, DB/RLS, protected service and security). Run targeted validation where execution environment supports it, then **one full CI run at the batch head**; no suite is deleted, skipped or detached from the merge gate. This is an execution approach, not an unapproved change to the CI workflow or risk-selection authority.

**Visual flake root evidence:** the 16 October CI #38866205296 desktop Plan Dark first capture was SHA-256 \`2e47b5d25aa2082b7706f618ddfc5d11682d2c6f6404f4267aa4695b10f41671\`; its succeeding retry reproduced Founder-approved \`43e9bbf0b04ddf1ff68a92e8516c4031a76a4b924e6ca412e06e35504c0353b7\`. Both native 1440×900 PNG files were extracted and byte/pixel-checked; exactly **14/1,296,000** pixels differ, only in x293–296/y45–129 along minute text-edge rasterisation. No changed text, geometry, theme ownership or control state was identified. To remove this known runner anti-aliasing flake without erasing a protected regression, the Plan Dark exact SHA-256 allow-list accepts **only these two inspected renderings**; Light and the other protected 17 states remain unchanged, with no generic pixel tolerance. Approval scope is the same visually approved state; no new visual redesign or merge authority.

**One broader educational-safety batch:** \`src/app/planner-programme-scenario-safety.test.ts\` uses actual published Business AQA 7132 and Psychology 7182 course/paper adapters to probe ten bounded cases: SV-01,03,04,05,06,07,08,11,12,13. The common deterministic checks include actual paper-date cutoffs, positive useful explanations, unique allocated opportunity identities and known-week capacity. The cases additionally check real shared three-paper topic identity, distinct paper sections, low weekly availability, near exams, elapsed missed time not being mastery loss, completed *unscored* work not becoming evidence, shifted paper dates, impossible zero-time allocation, and separate missing date/capacity truth. These are not validated cross-route educational acceptance. SV-02,09,10 require real *scored evidence* longitudinal change and remain explicitly unproven here.

**Not closed:** approved SV-01..13 require, for *each*, the entire Month/Week/Day/Home/REV five-view trace against the same frozen current-main baseline, exact supported Start, authentic scored-evidence/adaptation paths, justified demand/AO/prerequisite sequencing, educational review and accessible real-student comprehension observation. The programme's supported-candidate-minute count still cannot stand for all course/paper workload. All scenario statuses and \`PLN-VALUE-01\` remain **PARTIAL/NOT ACCEPTED** regardless of these safety tests and green CI. Do not request Founder merge approval until remaining educational acceptance can be honestly demonstrated; do not silently weaken the established oracle.

### FI-001 main integration and scored-evidence scenario batch (16 October 2026)

The draft PR incorporates all 14 approved main commits since 931bee72, including parallel phone/tablet/desktop CI and updated assurance classification, without changing those approved workflow rules. This is a branch integration, not a merge into main.

Independent visual comparison of CI 38871171517 Plan Light initial/retry 1440x900 images with the Founder-reviewed image found identical words, controls, layout and theme roles; 1,580/1,296,000 pixels (0.1219%) differ in fine antialiasing/tone. Only the second inspected SHA-256 7d7c69d1b5241127511c4594bcdc64f2dbdfd6906586a4ff1cb78923f2258161 is accepted alongside the existing approved Light hash. No generic screenshot tolerance or changed UI state is authorised.

Real-course domain safety tests for SV-02, SV-09 and SV-10 now use schema-valid synthetic scored flashcards and multiple-choice results across two evidence families. A later observation of the same content IDs replaces previous results under the approved Topic Knowledge policy; weakness and improvement change planner evidence classification without erasing real paper/topic requirements. These are not real learner transactions or full five-view educational acceptance. The full 13-scenario student value and genuine syllabus/paper skill coverage gates remain outstanding.

### FI-001 genuine multi-course five-view browser trace candidate (16 October 2026)

Integrated the subsequent eight approved main commits at ff1722f (new Learn-local risk/CI selection controls, bounded docs-only classification and related tests/docs). FI-001 touches Plan, Home, REV and the domain planner, so full relevant responsive coverage remains required by the classifier; no engineering assurance reduction has been authorised for this change.

Added tests/e2e/planner-programme-five-view.spec.ts: authentic Business 7132 and Psychology 7182 paper module mappings from the published adapter registry, controlled and fixed network/clock student, and cross-route Home → Week → Month → Day/Start → REV checks for SV-01/SV-04 and SV-03. A third case changes real paper dates and reruns the same five-view trace to probe SV-11 eligibility, milestones and next-action consistency. Failures are actual test blockers, not permissions to relax the acceptance oracle.

These three browser journeys make cross-surface mismatches detectable, but no student-value verdict is asserted solely from them. The frozen SV-01..13 same-fixture approved current-main baseline comparison, evidence-change after valid learner scores, detailed paper format/AO/prerequisite evaluation and real human usability/comprehension still need independent evidence before merge. All existing test gates must pass again at the integrated head.


### FI-001 browser oracle runner compatibility repair — 16 October 2026

The exact-head CI run [38885376641](https://github.com/lhanson-dev/revision/actions/runs/38885376641) passed static/type/lint/unit/build, protected DB/RLS and secret assurance, but all three responsive browser jobs failed **before test execution** during Playwright test discovery. The new five-view test was importing `content-registry.ts`, whose `import.meta.glob` depends on Vite and cannot execute in Playwright's Node test loader. This is a test-harness compatibility error, not a failing learner flow. The browser spec now imports the same four published, schema-validated paper manifests directly (Business 7132 papers 1–3 and Psychology 7182 paper 1), derives real course IDs from those manifests and checks each specific module's published `available` status. No app runtime, curriculum truth, educational acceptance criteria or workflow selection was altered. Recheck the **new exact head** CI; any subsequent browser assertion failure must be treated separately rather than buried under the initial import error. All 13 five-view educational verdicts and human learner comprehension remain incomplete; the candidate is not merge-ready.

### FI-001 cross-route browser fixture correction (16 October 2026): CI #38890394039 passed static/unit/build and DB/RLS/security but aborted all three browser suites during test discovery. The manifest-import workaround still followed Psychology's shared course dependency into JSON modules; Node rejected a JSON import lacking an attribute. The new Playwright-only test fixture reads the published paper-manifest source files with Node fs and validates exact AQA Business 7132 papers 1-3 and Psychology 7182 paper 1 identities, statuses and paper numbers, without executing the content-import graph. The production registry and content validation remain untouched; existing unit/domain oracles still validate published adapters. This is fixture integrity rather than proof of educational benefit. Fresh exact-head CI is required; the 13 complete five-view educational verdicts and real-student comprehension remain outstanding.

### FI-001 revised visual-acceptance and unknown-input browser check (16 October 2026)

The previous fully green [CI #38893190109](https://github.com/lhanson-dev/revision/actions/runs/38893190109) passed all 7 jobs, 1,436 unit tests and three responsive browser suites, but Desktop Plan Light needed one retry. The first capture was SHA-256 `61e78740437207ebceb1c6c8485b5882b35030d819b24397832143848c7c8a94`. Its bytes **exactly matched** the first Founder-reviewed CI #38812328043 *retry* capture, retained in artifact #12009562571. Independent PNG comparison against the approved first-image digest `0ce6b48485da0384b247be52f532a135a53cf738b4594e0c9b54deef8ce1b53a` found exactly 14 pixels different, x293–296/y45–129, maximum channel delta 14; no new layout or text. The Plan Light guarded digest contract admits this **specific previously reviewed variant**, the original capture and the separate previously reviewed 1,580-pixel raster variant. It also waits two post-font animation frames and asserts the real guided setup (not a false 0/0 calendar) before capture. This preserves exact fail-closed hashing against any unknown Plan image and keeps all other 17 protected screenshot states unchanged. It is a bounded capture-stability mitigation, not a guarantee of zero further Chromium raster variation or a universal screenshot tolerance.

A controlled browser SV-13 journey now checks real no-date/no-availability behaviour through Home, Plan Week, Month, Day and REV, including a supported Home Start, truthful missing setup, no invented full-horizon or derived task, and absence of a fabricated future month date in the REV reply. It supplements existing real-course SV-01/03/04/11 end-to-end checks and 13 scenario-named domain boundary probes. Source/asset, exact Start, all 13 same-fixture baseline comparison, multi-subject educational fairness/phase progression and real-student comprehension remain separate unmet acceptance requirements. Canonical route is `/revision/app/#/plan` served through `PlannerRuntime` and `PlanScreen.tsx`; no production runtime or product authority changed.

The accompanying dated audit `audits/2026-10-16-fi001-educational-acceptance-checkpoint.md` records scenario-by-scenario evidence/omissions. A fresh exact-head CI result is required before this candidate can be called green, and its educational acceptance verdict remains HOLD.

### FI-001 evidence-led cross-course feasibility batch (16 October 2026)

CI [#38896618089](https://github.com/lhanson-dev/revision/actions/runs/38896618089) failed solely in browser assurance: the new SV-13 browser journey tried to click a suggested REV exam question when no exams were registered. `promptChips` intentionally omits that chip for unknown dates, while `classifyQuestion` and `answerExams` support a manually typed question and explicitly acknowledge missing dates. The repaired journey first asserts that the misleading chip is absent, then sends the same question through REV's actual input and checks its truthful no-date reply. This is a correctness improvement to acceptance testing, not new production behaviour.

The same run surfaced **two additional exact-hash first-attempt screenshot variants** (Desktop Learn Light and Course Overview Dark) that succeeded on retry. They were NOT approved or added to an allow-list; the existing visual gates remain exact. A two-requestAnimationFrame post-font paint wait is now consistently applied to Plan, Learn and Course Overview before their protected captures; this is a deterministic readiness step, not a content mask. Exact-head validation will confirm whether it mitigates the observed environmental raster variance.

The domain scenario oracle now requires **actual allocated supported objectives for both enrolled courses** in SV-03 and even in SV-05's single 30-minute slot/week across a long exam horizon, rather than passing merely because both course topics appear in requirements. It also checks that individual assigned activities fit that week's single opportunity and maintains date/known-capacity checks. These are defensible source-backed non-starvation requirements, not a mandated fixed weekly subject quota or proof of educational optimality. If CI shows a real failure, the allocation logic must be assessed/fixed rather than relaxing the oracle. No new evidence source, readiness claim, schema or persisted state. Canonical runtime remains /revision/app/#/plan and shared Home/REV snapshot.

Full 13-case baseline-vs-candidate five-view expert assessment and real-student comprehension remain outstanding; the PR remains HOLD.

### FI-001 scored-evidence browser integration and R1-11 transition gate (16 October 2026)

[CI #38908654724](https://github.com/lhanson-dev/revision/actions/runs/38908654724) finished red only in Desktop browser: 1,436 unit tests, phone/tablet responsive suites, DB/RLS and security passed. The lone desktop failure was the previously existing R1-11 *starting-check-only learner* case: clicking the first-use "Continue" button while it remained disabled during a question transition. The R1-11 test now follows the existing `student-first-use.spec.ts` stronger oracle: require enabled Continue and await an actual changed question before choosing the next one. No real behaviour or accessibility check is relaxed; failing transitions will continue to fail.

A new browser scenario `SV-02/SV-09/SV-10` sends valid, persisted-shaped scores through the same Supabase-read service as the learner runtime for **actual published AQA Business 7132** topic identities. It verifies that Plan's visible ten-topic knowledge requirements move from one needs-work/one supported, through two supported when the same-content observations improve, to one needs-work/one supported following new independent weak observations. Assertions also protect nine/eight untouched unknown topics, the whole-paper demand caveat and consistent current Home/Week/REV next-task identity. The fixture's scores are synthetic; no real learner transaction, source asset authenticity or observed human mastery is claimed. The full 13 five-view educational scenarios, known-paper skill progression and real-student comprehension remain unaccepted.

No production runtime, governance, evidence schema, CI policy or approved visual digests changed. Exact-head full validation of this batch is required. Canonical user surface remains `/revision/app/#/plan` via `PlanScreen.tsx` and shared Home/REV data.

### FI-001 current-main integration and scored-evidence re-read (16 October 2026)

The controlled SV-02/09/10 five-view browser oracle initially added independent scored observations and revisited the exact same `#/plan?view=month&date=2027-03-01` hash route. Playwright's same-route `page.goto` does not recreate React's in-memory learning state; the second stage therefore continued to show the previous *needs-work* status and failed on all three viewports in CI [#38909740946](https://github.com/lhanson-dev/revision/actions/runs/38909740946). The fixed oracle calls `page.reload()` when it already occupies that route and requires a subsequent actual `learning_evidence` GET before accepting any updated status. It still requires low→supported→low classification on the same published Business topic identities, unchanged unknown topics, preserved paper demands, and Home/Week/REV common next action. This tests adaptation **on the next learner session/reload**, not live push-updates within an already-mounted screen; do not overclaim continuous real-time replanning or persistence that does not exist.

The feature branch now also incorporates the eight additional approved main commits through `76816463`, including the tightly bounded Practice-only risk classifier and its selected-browser safety test, CI workflow and assurance documentation. PR #637 modifies planner and cross-route evidence logic: its risk classification remains full coverage, not a Practice-only selection. The shared PTL-04 row of the Assurance Coverage Register is updated to approved main wording while retaining the branch's FI-001 evidence and provenance. No product normative authority or runtime code is changed by this fix. Complete 13 scenario expert educational acceptance, same-fixture comparison and observed learner comprehension remain outstanding; draft PR remains HOLD.

### FI-001 visible unserved preparation opportunities and shard integration (16 October 2026)

The programme domain already tracked individual `unserved` supported activities but the learner Plan UI only showed their total as a generic capacity/eligibility constraint. For genuinely constrained learners this hid which required topics could not be given a preparation opportunity. In the **existing canonical Plan** `PlanProgrammeOutlook.tsx` now groups unallocated candidate opportunities by verified `courseId + topicId`, sorted by earliest real applicable paper, shows three named course/topic exclusions immediately, and exposes the rest in an accessible `details`. Per-group counts/minutes are explicitly described as *supported opportunities*, **not all syllabus demand, predicted preparation requirement or evidence of learning**. No forecast is secretly booked, no scores/readiness changed, no new content is assumed, and unknown availability is still distinguished from zero. The additional controlled SV-12 real-course browser journey verifies zero saved study time yields real constrained-paper context and truthful named omissions without suggesting assigned Day work. This tests an actual student-valued response to the low-time/impossible case rather than an internal model counter.

The same governed commit integrates the seven then-approved main commits through `05c324d1` to ensure browser assurance sharding and its contract tests are not regressed. New `main` PTL-04 row reconciled into the PR's historical coverage ledger; main's risk-based assurance documentation is preserved. CI must validate newly touched rendered Plan and all responsive browser cases. This is a candidate implementation, not an educational efficacy claim or full acceptance. The 13 frozen student-value scenarios still need same-fixture comparison and independent comprehensibility evidence.

### FI-001 E-01 verified-weak-topic teaching sequence and integrated screenshot contract (17 October 2026)

Educational desk review against the 13-case product oracle found a concrete gap: only zero-evidence topics received an assured published Learn→independent check path, while sufficiently demonstrated weakness produced only a check intent. In `preparationCandidatesFromLearningState`, a validated topic score under 0.55 now permits a published, exact Learn page as a **supported explanation before the subsequent check**, preserving the scored weakness rather than resetting `understanding` to `null`. The preparation objective explicitly says this revisits a demonstrated gap. Strong improvement suppresses the unneeded foundation reread. No new assets, evidence authority, scoring thresholds, exams, schema or algorithm outside the already Ready FI-001 scope were introduced. A real Business 7132 topic fixture now asserts weak Learn→check sequencing and post-improvement consequence; this is not proof of educational optimum, effective misconception correction or independent student gain.

Integration CI [#38971354659](https://github.com/lhanson-dev/revision/actions/runs/38971354659) failed only desktop Plan Light/Dark visual tests: the previous reconciliation incorrectly required `.pln-nav` in the approved guided setup state, where the calendar navigation is intentionally absent. The fixture now checks Plan title, **absence** of `.pln-nav`, genuine guided setup, no loading messages, no .pln-summary/.pln-weekview and exact already Founder-reviewed screenshot digest. The other six CI jobs passed. Fresh full exact-head CI is mandatory. Current runtime: `/revision/app/#/plan` canonical `PlanScreen.tsx`, with Home/REV consuming the same snapshot.

Product educational acceptance remains **PARTIAL/NOT ACCEPTED**. The detailed 13-row desk assessment and remaining same-fixture/human gates are in `audits/2026-10-16-fi001-educational-acceptance-checkpoint.md` and the Assurance Coverage Register. Neither CI nor source-level desk review alone authorises merging.

### FI-001 weak-topic scenario test typecheck correction (17 October 2026)

[CI #38986002132](https://github.com/lhanson-dev/revision/actions/runs/38986002132) failed at TypeScript typechecking in the new SV-02/09 Business test. The ISO date string passed to Vitest's numeric toBeGreaterThan matcher caused a TS2345 error; every Playwright webServer-dependent job subsequently failed to start, propagating to Foundation Quality. The test now compares lexically ordered YYYY-MM-DD keys and asserts the boolean, preserving the deadline requirement. No production code, accepted visual digest or normative product rule is modified. A fresh full exact-head CI is required; educational acceptance remains PARTIAL/NOT ACCEPTED.

### FI-001 accepted-session accessibility assertion correction (17 October 2026)

[CI #38987255138](https://github.com/lhanson-dev/revision/actions/runs/38987255138) passed 1,445 unit tests, TypeScript, build, DB/RLS/security and Desktop shard 2. Desktop shard 1, phone and tablet each failed the *same* Playwright accepted-session WCAG journey **before axe ran**, because `expect(locator('.home-v3-plan-row')).not.toContainText('Marketing')` requires a single locator match while programme-first Home now renders one actual accepted session and two valid suggestions. The underlying rendered rows contained Finance, Business exam work and Business Quick; no completed Marketing activity was present. Fix: retain the explicit single accepted-session count and completion summary, and require `locator('.home-v3-plan-row').filter({hasText:'Marketing'})` to have count zero over **all** rendered rows, then run the unchanged full automated A/AA axe scan. No product implementation or tests are removed; assertion remains strict across all supported viewports. Exact-head CI required to verify. Educational acceptance of thirteen scenarios remains Partial/Not Accepted and PR #637 stays draft, unmerged.

### FI-001 responsive accessibility target-size checkpoint (17 October 2026)

[CI #39010733770](https://github.com/lhanson-dev/revision/actions/runs/39010733770) passed 1,445 unit tests, all TypeScript/static/build, DB/RLS/security, desktop (both shards) and tablet. The prior accepted-session multirow correction passed all responsive viewports. The only failure was on phone in existing cross-course `accessibility.spec.ts` at **Practice flashcards**: axe reported a serious `target-size` violation for the `.breadcrumbs > button[type=button]` course-header button (once on each retry). Source inspection shows the existing shared course CSS has a genuine `min-width` and `min-height` of `--control-height-compact: 36px`, and the preceding course and Practice screens' WCAG scans passed. The activity starts in-page and may scroll the header button into a partly clipped viewport; actual clipping versus CSS regression was not demonstrated by the logs.

The affected test now returns to a stable top-of-page viewport and waits for loaded fonts/paint, then **independently asserts the actual visible breadcrumb bounding box is at least 24px in both dimensions** before running the *same* full axe WCAG A/AA scan. If the button genuinely cannot meet WCAG size, the test still fails; no exclusions, test skips, threshold relaxation or CSS changes were made. Exact-head CI is needed to test this explanation and cannot be considered green beforehand. Product normative authority unchanged, and the 13 educational acceptance scenarios remain PARTIAL/NOT ACCEPTED. No merge authorisation.


### FI-001 Topic Knowledge interpretation alignment — candidate correction (17 October 2026)

The programme previously applied a planning-only 55% boundary to mark topics as weak and to trigger explanation/repair, while the authoritative Topic Knowledge engine uses 50% for Nearly there and 75% for Got it. This disagreed with Progress for supported scores of 50–54%. The programme now imports the governed score boundaries rather than creating a second knowledge classification: below 50% is an evidence-backed weak area, 50–74% is developing/provisional for planning, and 75% or above is supported. These labels do **not** establish exam-response readiness or a grade. Unknown/insufficient evidence remains unknown, and the existing scored-evidence engine is unchanged.

A real AQA Business 7132 synthetic scored scenario verifies the six-distinct-item, two-family 50% boundary for the course requirement, treatment selection and programme objective. The test is a domain regression, **not** educational acceptance of SV-02/SV-10 or human usability proof. No new schema, activity, policy score, asset or external-assessment capture. Exact-head CI and all thirteen educational value reviews remain the gate; this is not merge approval.


### FI-001 evidence-to-candidate score ownership correction — draft PR #637 (17 October 2026)

The legacy candidate bridge calculated `understanding` by arithmetically averaging all usable scored observations, even when Topic Knowledge correctly reported insufficient distinct items/evidence families. Inside 21 days of a paper, a single correct application answer could therefore satisfy the bridge's near-exam exam-practice preference despite insufficient scored knowledge evidence. On PR #637, candidate understanding now reads the existing Topic Knowledge score or remains `null`; no second mastery estimator, altered scoring threshold or new evidence promotion is introduced. The planner reason code for weak evidence also references the established Medium (50%) boundary, rather than a competing 55% label. Verified exact paper practice still remains an available later preparation opportunity, and the candidate engine can still consider authentic practice when other supported rationale exists.

Scenario SV-09 gains a real Business question/topic near-paper controlled probe: one correct answer remains insufficient for an understanding percentage and cannot by itself trigger the score-based exam-practice branch. The previous 50% mixed-family fixture has a TypeScript literal-rating correction. This does not establish student-value acceptance, real student comprehension, or a full baseline comparison. Exact-head CI is required.


### FI-001 evidence-source scenario repair following exact-head CI #39015039513 (17 October 2026)

The new authoritative-understanding correction passed TypeScript but exposed **two obsolete R1 test assumptions**: one wrong Business quiz answer / three correct Psychology quizzes could previously stand in for verified 0% / 100% Topic Knowledge, and four correct Business quizzes alone could produce exam-question-first behaviour. The governed scorer actually requires six distinct content items across two evidence families before returning a knowledge score. The canonical R1-14 and R1-07 fixtures now use corroborating real-course recall/application observations (six distinct items) to test the same weak-vs-strong comparison and exact Home/Plan/REV exam-question Start. The responsive R1-07 timeout came from the same inadequate exam-practice fixture and expected a Start button that was no longer educationally justified, not demonstrated application breakage. Test assertions remain strict; no production evidence requirements are weakened. The exact-head run after these fixture updates is required before claiming success.


### FI-001 SV-05 indivisible daily-capacity correction — candidate in PR #637 (17 October 2026)

The programme allocation previously treated all available minutes in a week as a fungible pool: 10 minutes on Monday plus 10 on Tuesday could produce a 15-minute preparation objective that would not fit the Day scheduler. The programme-first allocation now consumes a temporary per-day capacity ledger from the same authorised saved Monday–Sunday profile, date exceptions and bounded accepted-session reads used by Plan. An objective is selected only when a whole supported activity fits on an eligible date **before the applicable paper**. The calculated date is a recomputed, non-persisted forecast and is used by the bounded Day projection for consistent action eligibility, not a student booking or distant exact appointment. Unknown near-term accepted sessions continue to block confidence; distant unsampled bookings remain explicitly provisional.

Focused real Business 7132 SV-05 cases cover split 10+10 minutes, added whole-activity time, same-week paper day exclusion and accepted-session reduction. This is a feasibility repair, not a new treatment duration, revised learning policy, or declaration that the full syllabus will fit. No normative authority change, storage/schema change, new feature or independent scheduler. Exact-head CI and full educational scenario acceptance remain outstanding.


### FI-001 common learner explanation provenance (17 October 2026, PR #637 candidate)

**Canonical route and runtime:** `/revision/app/` serves authenticated `PlannerRuntime`; the exact Today task is rendered on Home (`PlannerHomeScreen`), Plan (`PlanScreen`) and contextual REV (`PlannerRevScreen`) from the shared `buildPlannerSnapshot` → `PlannerItem` → `tasksFromPlanner` contract. The programme-first selection already contains an assessed `purpose` and `reason` identifying actual treatment, evidence uncertainty and named exam/deadline. Previously Today replaced this with the legacy independent candidate ranking reason and could therefore say only that evidence was low/assessment important, losing the *programme objective*.

The same selected programme objective now propagates its purpose and reason through the near-term planner candidate and exact scheduled item. Only a **programme-selected suggested task** gets that rationale; a **student-accepted appointment** still says the student chose it, and a no-exam/no-availability fallback remains explicitly unscheduled. Home and REV use the same unmodified reason, and Week/Month still show its originating objective. No score, scheduling heuristic, planned commitment, curriculum, new model invocation or persistent field changed. A real Business 7132 unit contract asserts the actual named paper/date and recommendation identity. The existing multi-paper/two-course/moved-date five-view browser path now requires the same exam-linked rationale to appear on Home and in REV after asking what to do today. This validates deterministic explanation wiring only: qualified educational judgement, accessible real-student comprehension and all thirteen baseline counterfactuals remain open. Exact-head CI required.

### FI-001 same-input previous-planner comparison — candidate 17 October 2026

Canonical learner routes remain the existing /revision/app/ Home, Plan, REV and Courses entry points; no runtime or screen is added. PR #637 now contains a separate path-filtered GitHub Actions workflow, .github/workflows/fi001-baseline-evidence.yml, to run the thirteen SV controlled *identical* fixtures on both the frozen previous approved planner fd8565838db8fc27cbf359fc86d846e9ab11fda5 and exact proposed PR head. It copies the same probe into each checkout, uses the respective committed dependency lockfile, fixes Europe/London date interpretation, verifies byte-identical test fixture and JSON input hashes, and retains raw baseline/candidate decisions plus a comparison JSON/Markdown report.

The probe uses actual published AQA Business 7132 / Psychology 7182 adapters and synthetic, sufficiently varied scored evidence. Before/after variants cover unknown knowledge, partial strengths, both courses, shared paper obligations, scarcity, late starts, missed time, additional completed and scored work, evidence setbacks, improvement, changed exams, impossible time and combinations of unknown setup. Records include bounded next-action identity, weekly objectives, paper relevance, confidence/status, unallocated supported opportunities and exam deadlines when the candidate can emit them. Baseline cannot emit programme-first objectives. An observed difference, increased task count or clean execution does not certify an educational benefit. The workflow deliberately does not extend the existing Foundation CI job or claim any SV case accepted.

Still required: expert educational adjudication of each comparison against course/paper/AO and candidate strategy, actual five-view and persisted event journeys in all required scenarios, real-student accessible comprehension and the established complete merge gates. No normative policy changed.


### FI-001 comparison fixture refinement and paper-AO provenance (17 October 2026)

The first successful dedicated comparison [run #39027380930](https://github.com/lhanson-dev/revision/actions/runs/39027380930) established cross-commit reproducibility for all thirteen fixtures; it was not educational acceptance. Inspection identified two coverage weaknesses in the **probe** rather than the product: its new learner was assigned six weekly days although the accepted SV-01 scenario specifies 3–4; its SV-05 sparse-capacity case did not yet exercise a saved zero-day exception. The probe now uses four explicitly available days (including the fixed reference day), and the same Monday off-day exception in SV-05 before and after the additional Wednesday opportunity. Time aggregates now match weekday values. The retained candidate output now includes source-derived paper response section IDs, verified AO labels, marks, exact-practice counts and unsupported requirements, enabling educational comparison beyond activity counts. These fixture corrections supersede the first run for final adjudication; exact-head CI and comparison artifacts must be rechecked. No planner scoring or policy change.

### FI-001 executed paper-response provenance boundary — 17 October 2026

The **refined exact-head** frozen-baseline [workflow #39027797610](https://github.com/lhanson-dev/revision/actions/runs/39027797610) ran the same approved SV-01 to SV-13 controlled inputs under frozen main and PR #637, with 3–4-day new-learner availability and a saved sparse-time exception; matching input hashes and full raw decision records were retained. The candidate outputs now record every published paper-response section, marks, format, question-assessment-objective labels, verified matching activity IDs, allocated matching activity IDs and unsupported obligations. These are source provenance observations, not an educational acceptance score.

**Significant Business 7132 asset limitation:** Eight source-derived paper sections (Paper 1 four; Paper 2 three; Paper 3 one) exist and the candidate forecast selects legitimate exact exam-question activities (23 in the unconstrained SV-01 programme). However **zero of the eight sections has any question with a verified exact section mapping**. The Business authored exam assets in content/business/aqa-a-level/paper-{1,2,3}/exam.ts contain source-aligned prompt prefixes and assessment-objective marks but do not expose the explicit sectionLabel property required by verifiedPaperResponseSection(). The guide at content/business/aqa-a-level/shared/exam-papers.ts uses paper-section labels; interpreting prompt prefixes as equivalent labels, especially Paper 2 and Paper 3, would be a new unapproved provenance inference. The deterministic planner correctly fails closed, records the 8 unmet sections in programme.constraints and Plan's Paper response formats details, and **does not** claim they have been covered by section-specific practice. This is not proof there is no useful exam practice; it is proof that **section-specific coverage cannot currently be verified**.

For Psychology 7182 Paper 1 in the compared mixed-course cases, four response sections have exact mapped practice but the matched selected question opportunities currently carry only AO1 in the retained section-specific mapping. This does not establish complete response/AO capability or readiness. Existing engine statements about wider paper-level AO questions are distinct from the section-matched coverage inventory.

**Next governed dependency:** Require content authority/Content Factory review of source-linked section labels for the published Business exams, including equivalence to official guide labels, source provenance, marks, choice groups, response formats and assurance tests. Do not infer section provenance from text, paper proximity or question marks inside the planner. If the asset change is beyond the approved FI-001 Ready scope, separately promote and obtain Founder approval under the applicable content workflow. Do not block already-authorised planner implementation on unapproved content amendments, but do not mark SV-04/SV-06/SV-12 or full educational acceptance as PASS while material paper-response verification is missing.

**Two different Quick check boundaries:** The approved unscored *Learn* QuickCheck and the scored HomeFocusedActivity question currently share similar learner-facing wording. The latter persists multiple-choice evidence to learning_evidence; the former is deliberately excluded from scored mastery/readiness. This may be a terminology/provenance ambiguity rather than permission to alter the scored-evidence policy. Review and disambiguate the student-facing treatment under existing educational and REV experience authority before claiming the evidence loop is comprehensible. No scoring or policy change is authorised by this observation.


### FI-001 scored Practice question / unscored Learn Quick check disambiguation (18 October 2026)

The Founder-approved learner evidence authority states that an unscored Learn Quick check does not change Topic Knowledge, Topics covered or exam readiness. The canonical Home/Plan/REV `quick-check` activity, however, uses `HomeFocusedActivity.checkQuestion()` to persist a valid scored `multiple_choice` Practice observation. Identically naming both experiences “Quick check” was a real student-facing provenance error. Existing scored planner activities are now **labelled “Practice question”** in shared Home and REV copy, Plan day/week activity labels, and their focused scored question activity. The focused activity explains explicitly that the answer is scored Practice evidence but that one result is not sufficient proof of understanding or exam readiness. The unscored embedded Learn QuickCheck retains its separate name, no `learning_evidence` write and unchanged governing semantics. Internal `activityType='quick-check'` is retained for persisted candidate/identity compatibility, and evidence recording, score engine, thresholds, routes, time estimates and commitments remain unchanged. The existing exact Home/Plan/REV E2E checks and a focused label/identity unit test have been updated. This is an FI-001 evidence-integrity explanation correction, not a new evidence system or policy. UI visual regression hashes must be reviewed if the label changes a protected screenshot; do not silently rebaseline.


### Scored activity rename: browser assurance boundary (18 October 2026)

The canonical Home/Plan/REV scored question display is intentionally “Practice question”; internal `quick-check` identity is unchanged. Existing route tests for R1c, R2c and Returning Home have been updated from the misleading old copy without relaxing the protected Start, evidence or shared recommendation contract. Exact-head CI #39116363394 showed expected approved-Home visual hashes changed with this text, which triggers Founder visual approval under existing governance. Do not repin the baseline automatically or treat changed hashes as a flaky browser failure. This is a presentation change, not a new planner/rating rule. The implementation and assurance remain candidate until the required approved visual evidence is incorporated.


### PR #637 — Founder-approved Home Practice-question visual baselines (18 October 2026)

The Founder explicitly approved the **four** Home protected visual changes (desktop and phone, light and dark) for the existing scored `quick-check` internal activity's learner-facing label **Practice question**, at reviewed exact PR head `2f9c286b52a2b54e1ae5948d1206547317a615cb`. The unscored Learn Quick check remains unchanged. The four new screenshot digests were taken from actual exact-head CI #39116844038 assertion logs and match independent CI #39116363394; no other visual digest, test mask, capture path, tolerance or fixture is changed. See `audits/2026-10-18-fi001-home-practice-visual-approval.md` for the exact old/new digest table, evidence and approval scope. Baseline approval does not waive educational completeness, content mapping assurance, CI rerun or the separate PR-specific Founder merge gate. The new visual assertions must pass at the resulting commit before claiming the visual gate closed.


### FI-001 candidate Business 7132 paper-response metadata repair (18 October 2026)

The existing original 7132 exam simulations had fully source-aligned question grouping but no explicit section metadata, so the programme failed closed on paper-specific section attribution. Draft PR #637 adds `sectionLabel`, `sectionTitle` and `sectionMarks` on 42 **existing authored questions** using the approved AQA 7132 exam guide's 8 response groups (Paper 1 15+35+25+25; Paper 2 33+33+34; Paper 3 100). New deterministic content checks confirm complete source-question mappings and exact marks. No authored question/marking text, AO allocation, ownership, planner scoring or activity route is changed. This unblocks source attribution; it does **not** prove the scheduler chooses a candidate from every section, complete AO coverage, exam-answer competence or content-accuracy review. The separately governed Content Accuracy Assurance Gate remains an acceptance requirement. Compare the exact next PR head's 13 scenarios and retained response-section evidence before assigning educational verdicts.

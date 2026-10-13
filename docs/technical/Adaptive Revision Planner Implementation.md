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

# WP2 — Student Lifecycle Experience and Assurance Audit
**Status:** Point-in-time implementation and test-evidence review — **not** product authority or a claim of live student usability sign-off  
**Baseline:** Approved `main` commit `25ab7914c1201429ad56acc2169118f3cd8b1dce` (after Founder-approved PR #590), 12 October 2026  
**Scope:** SL-01 new Student, SL-02 returning with incomplete context, SL-03 established returning Student  
**Owner:** Product and engineering; Founder retains approval of subsequent governed implementation PRs  
**Method:** Read active authority, canonical implementation, technical documentation, assurance register and source tests. No student account, database mutation, live production journey, accessibility-tool run or independent Playwright execution was performed for **this audit**. Existing test coverage describes assertions visible in current source, not a fresh runtime demonstration.  

## 1. Executive decision

**The lifecycle is structurally coherent; it is not yet end-to-end assured at every important interruption and recovery point.** Preserve the one canonical learner runtime, membership/evidence models, Plan ownership and recently shipped Home v3. Fix the known first-use weekly-time screen that conflicts with the newly approved contract. Close bounded evidence gaps rather than rewriting tests or changing the planner algorithm.

| Disposition | Finding / recommendation | Basis | Priority / owner |
| --- | --- | --- | --- |
| **KEEP** | Student choice, exact saved course selection, directional optional starting check, deterministic skip path and normal learning-evidence-before-feedback transition | `FirstUseBoundary.tsx`, `FirstUseGate.tsx`, `student-first-use-service.ts`; `tests/e2e/student-first-use.spec.ts` | Preserve, First use |
| **KEEP** | Optional known exam dates can already be supplied after a saved course and before starting check; save/skip independent of answering diagnostic questions | `OnboardingPlanSetup.tsx` lines 48–90, 116–139; existing browser test 377–434 | Preserve, strengthen assertions |
| **FIX** | Weekly study time is still an *additional first-use screen before useful revision*, contrary to approved D-01b. Move capacity setup to existing **Plan** after first value | `OnboardingPlanSetup.tsx` lines 38–44, 86–103, 142–171; `FirstUseGate.tsx` lines 527–535 | P1, bounded onboarding correction |
| **KEEP** | Plan already owns editable Monday–Sunday availability and assessment management; no new Plan data model is needed | `PlanScreen.tsx` lines 264–266, 335–345, 632–660; `planner-service.ts` | Preserve, Plan |
| **KEEP** | Home v3 is the approved canonical returning experience, with direct REV recommendation, Today's Plan/Exams/Progress/Courses/activities, owner-specific independent reads and truthful state | `PlannerHomeScreen.tsx`, `home-v3-model.ts`, `Returning Student Home Implementation.md`, `returning-home.spec.ts` | Preserve FI-023 scope |
| **FIX / verify** | The Home hero's `exam-question` Start still redirects to course-level Exam Prep without an exact paper/activity; ordinary quick-check Start is direct and tested | `PlannerHomeScreen.tsx` lines 243–249; `returning-home.spec.ts` lines 116–129 | P1 **separate FI-023 follow-up**. Do not invent paper IDs, repurpose onboarding, or weaken exact-task authority |
| **FIX — assurance only** | No dedicated browser coverage found for interrupted/reloaded starting check, interrupted saved first activity, failed ordinary learning-evidence write, or attempted completion without persisted evidence | Current `student-first-use.spec.ts` cases and `FirstUseGate.tsx` resume/save path | P1 targeted first-use browser scenarios |
| **FIX — assurance only** | New signup to Student first value is simulated by synthetic auth and REST route stubs; database browser persistence suite covers an established-account compatibility path, not the real new-account first-use transaction | `student-first-use.spec.ts` lines 34–100; `database-persistence.spec.ts` lines 15–67; existing `AUTH-01` qualification | P2 isolated real-service end-to-end first-use (no production user registration required) |
| **VERIFY** | Partial exam-date save failure may leave earlier inserts committed; retry repeats individual inserts. No demonstrated idempotency/recovery test in first-use browser suite | `OnboardingPlanSetup.tsx` lines 67–91 and `course-planner-service.ts` lines 4–39 (`insert`, not upsert) | P2 risk check during same bounded onboarding correction |
| **VERIFY** | Paper dates are linked to exact saved course and paper title but save `module_id: null` and default scope; review whether this is sufficient *durable paper identity* under the approved course/paper contract | `OnboardingPlanSetup.tsx` lines 48–55, 76–85; `course-planner-service.ts` lines 24–37; `home-v3-model.ts` | P2 semantics verification; do not introduce schema/identifier changes without scoped approval |
| **KEEP / qualify** | Home no-date/no-availability fallback, empty-course honesty and Home→Plan date editor exist; however a completed learning-and-next-recommendation loop and section-error recoveries are not all proven by one browser journey | `HomeSetupEmpty.tsx`, `PlannerHomeScreen.tsx`, `empty-states.spec.ts`, `returning-home.spec.ts` | Preserve; targeted cross-screen assurance within FI-023 |
| **KEEP** | Existing database/RLS, learning-evidence separation, course membership and accessibility suites protect critical invariants | `Assurance Coverage Register.md` JRN-02/04/06/07/08/09; DATA-01/02/04/05/07; A11Y-01 | Preserve; don't reopen security tests because a setup step moves |

**P1** means first follow-on correction/assurance slice, not a production incident classification. **P2** means targeted expansion after P1. `VERIFY` is unresolved evidence, not a proven defect. No claim is made that all tests execute in every CI configuration or that all accessible/usable states have been checked by real students.

## 2. Authority, runtime, data and REV/Progress boundaries

Governing product truth: `10-product-governance/Student Lifecycle Journey Contracts.md` v1.0 (SL-01/02/03), `Core User Journeys.md` GJ-01, `Adaptive Revision Planning.md`, `Returning Student Home Experience.md` v1.3, `20-brand-and-experience/REV Guidance and Conversation Pattern.md` and `40-evidence-and-trust/Claims and Progress Governance.md`. Test methodology: `50-engineering-standards/Testing & Assurance Standard.md`; coverage record: `90-governance-registers/Assurance Coverage Register.md`. UX/design authority remains separate and unchanged.

Canonical learner path is `app/index.html → src/main.tsx → AuthGate → FirstUseBoundary → FirstUseGate → PlannerRuntime` (`docs/technical/Student First-Use Onboarding Implementation.md`). `FirstUseBoundary` intentionally exempts pre-FI-021 established accounts; do not drop compatibility to make a new onboarding test pass.

| Surface/transition | Persistent writer and reader | Evidence/decision boundary |
| --- | --- | --- |
| Student route and resume stage | `account_experience_state` through `student-first-use-service.ts` | Lifecycle state, **not** learning progress |
| First exact course | `learner_courses` through shared course-membership service; then active programme projection | Scope for recommended work, **not** mastery; same identity as Courses |
| Optional exam dates | `revision_assessments` through `saveCourseAssessment`; Plan/Home read via `loadPlannerSetup` | Planning context; no starting-check prerequisite |
| Starting check | `starting_check_evidence` on each answered item, separate from normal evidence | Directional only, no readiness/mastery assertion |
| First ordinary activity | `learning_evidence` through `recordLearningEvidence`; feedback stage set **after** successful write | Valid result may inform learner state and deterministic priority |
| First-use completion | `account_experience_state.onboarding_completed_at` after feedback | Allows normal Home; cannot substitute for evidence |
| Home/Plan | Saved courses, actual assessments/availability/accepted sessions and learning states; deterministic recommendation and Plan models | REV explains, does not author planner rank; recommendation is distinct from accepted/finished sessions |
| Later weekly availability | `revision_availability_profiles` through existing Plan study-time editor | Calendar capacity, never evidence of work done |

Do not add a parallel onboarding database, separate date editor in Home, new REV priority engine or alternative course identity. No new product-policy decision is needed to remove the time screen: D-01b was Founder-approved and merged in PR #590. A subsequent **implementation PR** remains subject to normal governed readiness, tests and merge approval.

## 3. Journey-to-assurance matrix

**Status here describes the specific assertion on inspected source**, not replacement labels for the repository's broader assurance register. `Covered — stubbed browser` does not prove a live external sign-up.

| Contract assertion(s) | Observed code / existing test evidence | Specific status and gap | Proposed owner |
| --- | --- | --- | --- |
| SL01-A1 authentication/Student choice | `auth-entry.spec.ts` provider states; `student-first-use.spec.ts` Student selector | **Partial:** synthetic identity; real-new-account login→Student first value unproven end-to-end | Auth + First use |
| SL01-A2 exact course saved | `FirstUseGate.addCourses`, `learner-course-service`; `student-first-use.spec.ts` 212–236, 273–278 | **Covered — stubbed browser**; owner/RLS elsewhere. Preserve exact membership | First use |
| SL01-A2D date save before check; dates skip independently | `OnboardingPlanSetup` saving `revision_assessments`; `student-first-use.spec.ts` 377–434 selects one paper and asserts course/date/type | **Partial:** one date save before check proven in test; not full matrix of date skip/partial/save, later Plan edit, reload, failure/retry or durable module identity | First use + Plan |
| SL01-A2T no availability prompt before first value | `OnboardingPlanSetup` has `time` screen; `student-first-use.spec.ts` 227–233, 419–433 expect it | **Mismatch:** explicitly contrary to contract; must remove step and revise only affected tests | First use |
| SL01-A3 starting check directional and skip | `FirstUseGate` separate `startingEvidence`; `student-first-use.spec.ts` 237–297 complete five answers / skip route | **Partial:** complete and skip covered with stubs; interrupted/partial restore and non-inflation of mastery/readiness need targeted proof | First use + evidence |
| SL01-A4 exact useful work / saved normal evidence | `FirstUseGate` 450–476; browser test 260–277 verifies first flashcard and one learning-evidence row | **Covered — stubbed flashcard**; exact quick-check path and multi-course isolation not equivalent | First use |
| SL01-A5 evidence-save failure and first-use completion | `finishActivity` 469–483 saves first, feedback stage second; `continueToHome` 486–499 completes; browser test confirms success only | **Partial:** no failed-save/retry/browser-reload test, no attempt to complete with absent evidence | First use |
| SL01-A6 interruption, legacy account, unresolved saved course | Stage restored in `FirstUseGate` 193–283; missing catalogue item fails closed at 550–551; `FirstUseBoundary` cutover | **Partial:** source recovery logic exists; full browser interrupted starting check and activity restoration are not in inspected first-use spec. Optional date screen is in-memory and skipped on reload once membership is present | First use |
| SL02-A1 resume at correct incomplete step | `account_experience_state` and per-item saved starting evidence | **Partial:** case not exercised by dedicated browser assertion found; preserve answers and never replay completed course selection | First use |
| SL02-A2/A3 incomplete Plan + no false evidence | `PlanScreen` 264–266, 632–660; `PlannerHomeScreen` 188–218 and fallback task; `empty-states.spec.ts` 102–128; DB/RLS owner tests | **Covered structurally, partial full journey:** fallback and Plan editor exist; assert fresh first-value Student with no availability can actually Start and then edit Plan | Plan + Home |
| SL02-A4/A5 no saved course / stale course | `HomeSetupEmpty`, `empty-states.spec.ts` 137–153; DB `database-persistence.spec.ts` remove/re-add | **Covered for no course and membership restoration**; stale/unpublished saved course edge remains focused recovery assertion | First use/Courses |
| SL03-A1/A2 Home v1.3 structure, valid direct task, exact saved course | `PlannerHomeScreen` v3; `returning-home.spec.ts` 91–130; `home-v3-model.test.ts` | **Covered — one-course stubbed Home / model**; multi-course route and exam-question recommendation need proof/correction | Home FI-023 |
| SL03-A3/A4 evidence→feedback→revised next task; independent study | `HomeFocusedActivity`, `PlannerHomeScreen`, `CourseExperienceScreen`; Practice persistence tests | **Partial:** current v3 browser Start asserts arrival at quick-check, not completion, persisted result, new recommendation and Progress change in one cross-screen trace | Home/Practice |
| SL03-A5 missed day/adaptive no-debt | `rev-suggestions.ts`, shared `plan-model.ts`, `accepted-sessions.spec.ts` | **Partial for user journey:** deterministic/planner coverage exists, but a missed-session restart scenario is not established from reviewed Home browser tests | Planner + REV |
| SL03-A6/A7 Ask REV once, plan match, exams/progress/courses, independent failure | `returning-home.spec.ts` 91–175, `home-v3-model.test.ts` 15–55, `Home v1.3` technical docs | **Mostly covered at unit/stubbed browser layers**; verify individual Home section error recovery, multiple-course chooser and real action completion without retesting Home visual rollout | Home FI-023 |

### Existing registry interpretation — no silent reclassification

The active `Assurance Coverage Register.md` labels JRN-08 (first use) and JRN-09 (Home v3) as **Covered at their declared aggregate automated layers**, while AUTH-01 and JRN-03 remain **Partial**, and JRN-05 covers exam start only. That is **not proof** that every finer-grained SL assertion above has a browser scenario. This audit **does not downgrade those registered controls** based only on gaps inferred from a subset of suites; WP3 must update register status/evidence when new assertions execute and are accepted.

Existing Level-3/RLS/post-merge release evidence must be **retained**, not rebuilt or marked invalid because first-use screen sequencing changes.

## 4. Narrow WP3 recommendation and acceptance order

### Slice A — First-use sequencing to approved contract (P1; one bounded change PR)

**Change:** `OnboardingPlanSetup` remains the optional date collection step immediately after saving exact course, but drops the in-onboarding `time` branch and its `saveAvailabilityProfile` invocation. Both **Save known dates** and **Skip dates** should continue to course-ready and optional check/recommendation without another planning question. Leave `PlanStudyTimeCard` and `saveAvailabilityProfile` in the existing Plan owner, for later optional entry.

**Acceptance gate:** initial course→optional dates→optional check→first activity→feedback→Home, with and without dates; **zero** weekly-time prompt/requirement before the first activity; Home fallback when no availability; later Plan time entry persists, does not add learning evidence, and doesn't lock Home. Keep exact course identity, free journey, failure/recovery and accessibility semantics.

**Reconcile rather than rewrite:** update `tests/e2e/student-first-use.spec.ts` helpers expecting “Step 5 of 5”, one first-use date-save test, and the dated onboarding responsive/axe assertion. Reuse `tests/e2e/empty-states.spec.ts` and Plan tests; extend one explicit later-Plan-availability test only if existing coverage does not establish the transition. Keep screenshots on the C3-approved account/course surfaces stable except for directly affected optional-date state; obtain updated visual acceptance only for changed visible presentation.

**Documentation impact:** same PR must update `docs/technical/Student First-Use Onboarding Implementation.md` (currently omits the existing date/time screens entirely), relevant first-use screen-step copy and directly affected tests/feature docs, and the assurance register **only** if a proof status changes. Normative product authorities are already aligned by #590; do not edit them again without a real policy change. Avoid new backend or schema migration.

### Slice B — First-use interrupted/failure assurance (P1/P2; may accompany A if truly small)

Add targeted tests for: partial starting-check reload then correct next unanswered item; skip after partial without phantom answers; persisted activity stage reload; ordinary evidence save failure with answer retained and no onboarding completion; successful retry followed by one durable evidence entry; optional date save/skip and reload. Verify two accounts are owner-isolated through existing database RLS tests, not a fabricated browser-only security assertion.

One strong, controlled browser test per materially different recovery path is preferable to full test-suite duplication. Preserve real course membership and normal evidence stores.

### Slice C — Returning Home + multi-course boundaries (P2, owned by FI-023)

Home v3 is **Live**, not a candidate for another broad redesign. Add any demonstrably missing exact-task, multi-course and partial-failure assertions as a focused Home follow-up after checking existing FI-023 proof; if `exam-question` hero Start is confirmed to land on course-level Exam Prep rather than an exact supported task, design a bounded fix respecting no-fake-paper and direct-Start requirements. Do not mix this with first-use screen implementation.

### Slice D — Real-service/new-account confidence and observed usability (P2, separate assurance)

Establish a controlled isolated Supabase new-account journey from actual credential creation through first persisted learning outcome, or document the exact external provider constraint. Do not equate synthetic auth with tested production registration, and do not create real production accounts solely for this audit. Then observe a small protected-staging student sample for first-action clarity, optional dates, skipped check, pause/restart, Home navigation and missing availability; set numeric usability targets after a baseline.

## 5. Out-of-scope and unresolved matters

- This is **not** approval to modify REV ranking, planner horizons/weights, exam content, pricing, Psychology, public marketing, Admin or shared design tokens.
- Existing Home v3 work is already independently approved and Live. Do not create a second Home design or another accepted-session/completion algorithm.
- Paper-specific exam-date identity and partial-write retries are **investigations**, not grounds to create a new schema by default. If a durable paper identity cannot be met by the existing published course and assessment structures, raise a bounded design/authority decision.
- A proof not found in the inspected suites is **an evidence gap**, not necessarily a proven runtime defect. Search current detailed domain tests before adding duplicates.
- No changes to the current `Assurance Coverage Register.md` statuses are appropriate until new executable evidence, changed authority/control or verified defect status warrants it.
- No Founder action is required to accept this **audit as evidence**; any feature-level implementation governed by the Definition of Ready and **every PR merge** require the applicable explicit approvals.

## 6. Completion, ownership and traceability

**WP2 result:** Keep 5 high-value functioning boundaries; one definite approved-contract sequencing **Fix**; two focused first-use assurance **Fix** areas; one Home exact-activity **Fix/verify** owned by the existing FI-023 scope; date identity/retry **Verify** items. The contract-to-test matrix is the proposed WP3 tracker. Do not interpret the counts as exhaustive issue or test-failure totals.

**Documentation impact:** This point-in-time audit belongs under `audits/` and receives one discovery link from `INDEX.md`. The reviewed active normative documents remain correct; technical docs remain implementation evidence and must be updated with **the implementing correction**, not falsified early. Existing historical audits, assurance register and CI evidence are not rewritten.

**Evidence sources:** `10-product-governance/Student Lifecycle Journey Contracts.md`, `Core User Journeys.md`, `Adaptive Revision Planning.md`, `Returning Student Home Experience.md`, `20-brand-and-experience/REV Guidance and Conversation Pattern.md`, `50-engineering-standards/Testing & Assurance Standard.md`, `90-governance-registers/Assurance Coverage Register.md`, `docs/technical/Student First-Use Onboarding Implementation.md`, `docs/technical/Returning Student Home Implementation.md`, and the code/tests cited inline (all read from the pinned approved baseline). No new source of product authority is created.

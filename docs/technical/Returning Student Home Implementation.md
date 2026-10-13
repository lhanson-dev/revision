# Returning Student Home Implementation

**Status:** FI-023 Home v3 Live — verified production deployment after PR #601  
**Updated:** 2026-10-13  
**Normative authority:** `10-product-governance/Returning Student Home Experience.md` v1.3 (Founder approved, integrated through PR #595), `20-brand-and-experience/Learner Design System.md` v1.0, `20-brand-and-experience/REV Guidance and Conversation Pattern.md` v2.1, `40-evidence-and-trust/Claims and Progress Governance.md` and existing global navigation/Plan authority.

## Route, current-state boundary and entry

**Canonical signed-in target:** `/revision/app/#/home` in the GitHub Pages deployment.  
**Owner:** `app/index.html → src/main.tsx → AuthGate → FirstUseBoundary → PlannerRuntime → PlannerHomeScreen`.

FI-023 changed only that runtime's Home composition and bounded route handoffs. Historical `src/app/App.tsx` is not a second signed-in Home and remains an unrelated compatibility surface. There is no new route to a second Home, no second shell, no database migration, and no new model/inference API.

**Before FI-023:** `PlannerHomeScreen` rendered a separate welcome row, shared `RevSuggestionCard`, subject tiles, and an aside with next-exam/Plan summary, rather than the approved v3 hierarchy. Its setup/evidence `Promise.all` failed the whole Home when either dependency failed.

**Live FI-023 implementation:** `src/app/PlannerHomeScreen.tsx` composes exactly five areas:
1. REV hero, one next useful action and full-width Ask REV input;
2. Today's Plan and Your Exams (side by side desktop, stacked below 1160px);
3. Your Progress using the shared three measures;
4. Your Courses (saved-course Overview links);
5. quiet Learn, Practice, Exam Prep, Plan, Progress and Courses introductions with eligible-course selection.

The existing GJ-01/first-use gate remains ahead of Home. Accounts with no active courses retain `HomeSetupEmpty`, rather than a fabricated empty dashboard. Home on all tiers preserves the same substantive Free capability.

## Trusted data ownership

- **REV recommendation:** `rankSuggestions` and `pickSuggestion` in `rev-suggestions.ts`; `fallbackHomeTasks` provides a bounded evidence-backed fallback. `Not now` retains browser-session behaviour. No model invents priority.
- **Today:** `home-v3-model.ts` calls the same `createPlanDayBuilder` from `plan-model.ts` used by Plan, with the planner's `schedule`, accepted `PlannedSession` records, availability and locally dated assessments. Completed means only `PlannedSession.status === 'done'`. `homeTaskMatchesPlanRow` requires an exact course/topic/activity for derived tasks, or the exact original REV recommendation ID for accepted sessions whose stored activity type is coarser than flashcards/quick-check.
- **Start actions:** current `home-task.ts` and `HomeFocusedActivity` remain the source for REV focused work. A Home exam-question recommendation now resolves an existing, unrestricted single question in the student's exact active course and recommended topic through `resolveHomeExamQuestion`, then opens `HomeFocusedActivity → ExamSimulator` directly in untimed, one-question mode. The launcher selects a real module, exam and question ID; it never invents paper ownership or redirects to a generic Exam Prep page. Missing or restricted content produces a recoverable unavailable message and Back to Home, without an evidence write. The existing `ExamSimulator` owns written answer, marking guidance and self-assessed AO marks; evidence persists only after explicit Record this result. A stable ID is reused for failed-save retries, and submission is guarded while saving. Full timed mocks remain exclusive to normal Exam Prep navigation. Accepted session rows open their actual Learn, Practice topic or Exam Prep destination. A saved course never leads to a removed/out-of-programme course.
- **Exams:** `RevisionAssessment.assessmentType` distinguishes `mock` from `public_exam`; Home shows stored titles and real local calendar-day distances for active saved courses. The existing `PlanScreen` owns adding/removing dates through its Manage Exams overlay, now addressable by `planRoute({intent:'manage-exams'})`. No duplicate Home date editor or extra `paper` column exists.
- **Progress:** `progressMeasuresFor`, `readinessAcross` and `ProgressMeasures` are reused exactly as on learner-wide Progress; no blended percentage or predicted grade. Course tiles reuse saved programme identity and `buildCourseTiles`.
- **Ask REV:** Home submits the typed question once using `PlannerRuntime.openRev(draft, true)` and a one-shot `PlannerRevScreen` handoff after current context has loaded. It uses the existing contextual panel and safeguards. There is no second inline answer-preview system or new token spend per Home render.
- **Failures:** learning evidence, planner setup and accepted sessions load independently with section-specific retry. An unavailable accepted-session store does not invent an empty or completed day; the rest of Home is still accessible. A missing course uses the governed first-use recovery.

## Visual implementation ownership

All user-facing layout additions are in `src/app/home-v3.css`, imported by `src/main.tsx` after the current shared learner shell, with canonical semantic surface, action, type, radius, focus and subject tokens. `RevMark` delegates to the one `RevPresence` Living E; Home scopes only size and bloom, not an additional icon drawing. The shared `Button`, `ProgressMeasures`, `SubjectBadge`, `HueProgressBar` and `Icon` are reused. `book` and `paper` are newly registered shared glyphs.

The main layout follows approved breakpoints: >1160 desktop, 961–1160 laptop, 621–960 tablet, ≤620 phone, including a 320px minimum. Phone hero gives the Living E a 100px presence (84px ≤360), so the next useful action appears promptly. Light/Dark and reduced motion retain central ownership. Old `home-v2.css` is temporarily imported because GJ-01-compatible `HomeSetupEmpty` uses its setup selectors. Historical `returning-home.css` and `returning-home-fidelity.css` also contain styling used by existing focused/compatibility renderers; do not blindly remove them in this feature slice. Retire only proven orphaned owners in a later reconciled cleanup.

## Assurance and verified production release

**Implementation and assurance (12 October 2026):** PR #601's final exact head `e517b420ee3920df0797f2bc5376ccebb8a6aece` passed Revision CI #38251769839 with successful security/secret scan, TypeScript, lint, unit, production build, database/RLS and protected-service checks, responsive learner browser tests and Home Light/Dark visual baselines. The four phone/desktop Home screenshot hashes were separately approved by the Founder on 12 October 2026 and re-pinned from CI #38214052147 (retained artifact `11732295608`); no other surface hashes were repinned.

**Governed merge:** The Founder explicitly approved merge of PR #601. The exact-head machine-readable approval comment and `revision/founder-approval = success` were independently verified immediately before merge. PR #601 merged as `b405f52b21e61517e4ff16786b2513d93aef617b`.

**Production path-to-live:** GitHub Actions deployment #38254172559 for that exact merge commit completed **success**, including release lineage, production backend readiness, Pages build/deploy, canonical React-app and legacy-retirement production smoke, and publish of durable `revision/path-to-live = success`. The verified canonical learner route is `/revision/app/#/home` on the governed Pages deployment. This supports **FI-023 Live**, not merely merged or staged.

**Boundaries of evidence:** Production smoke proves the deployed canonical application and release checks, rather than individual personalised account journeys in production. The critical real-data boundaries, keyboard/responsive learner routes, one-submit contextual Ask REV and Plan persistence were tested using controlled unit/integration/browser fixtures. Continue ordinary monitoring and optional usability checks with real testers; do not claim direct production-user sign-off.

**Remaining non-blocking cleanup:** `home-v2.css` is retained because `HomeSetupEmpty` still uses its setup selectors. Historical `returning-home*.css` is retained for other consumers; removing either without independent reference checks could break unrelated surfaces. No new educational claims, score calculation or database schema is introduced by FI-023.

## Documentation impact

The Founder-approved Home v1.3 normative contract is unchanged. This file now records the verified Live implementation, alongside matching updates to `docs/features/home.md`, `docs/technical/Learner Design System Implementation Reconciliation.md`, the FI-023 feature-backlog entry and `90-governance-registers/Assurance Coverage Register.md`. The release follow-up is documentation-only: no learner code, historical prototype, earlier CI result, old decision or image evidence is rewritten.

## Focused exam-question Start correction (proposed PR, 13 October 2026)

- Scope: defect correction only; Home v3 layout, planner ranking, full-paper simulator entry and existing flashcard/quick-check starts are unchanged.
- Canonical path: `/revision/app/#/home → PlannerRuntime → PlannerHomeScreen → HomeFocusedActivity → ExamSimulator(autoStart='untimed', preferredQuestionId)`. No new route, database table or duplicated exam-marking workflow is required.
- Eligibility: the exact saved course and recommended topic must match a published `available` module. `listExams()` supplies real exams/questions. `restrictedPilot` exams are not eligible. All eligible papers within that one course may be considered for a shared syllabus; the first eligible paper's multi-mark question is preferred where available, otherwise the first matching published question. This is not a claim of unique paper/topic ownership or a new planner priority.
- Unsupported topics/courses render an honest unavailable state with Back to Home. Existing normal Exam Prep navigation remains available independently; a course-level landing is not counted as successful direct Start.
- Evidence: opening/closing is not completion. The student writes an answer, opens guidance, self-assesses AO marks and explicitly records. The existing `recordLearningEvidence` path and confidence constraints are reused, with a stable evidence ID across retries. After a saved exam result, returning to Home reloads the evidence and next recommendation; leaving an unsaved answer does not claim completion. The simulator does not launch a timed mock from this focused entry.
- Browser reload currently returns to Home rather than resuming an unsaved draft, consistent with the pre-existing transient Home-focused activity. Durable interrupted answer drafts remain outside this bounded fix.
- Assurance: `src/app/home-exam-question.test.ts` checks the exact saved-course/topic/module/question mapping and cross-course/restricted cases. `src/app/home-focused-exam.test.ts` covers focused rendering and the recoverable unsupported state. `tests/e2e/returning-home.spec.ts` now tests the complete exam-question Start → written response → guidance → AO self-mark → one evidence record → Home return path across the responsive browser projects, alongside its existing quick-check baseline. Exact-head CI results remain a merge prerequisite.
- Documentation impact: no normative authority or route specification changes; the previous WP2 audit is left unmodified. Assurance register must not be upgraded until exact-head evidence is green.

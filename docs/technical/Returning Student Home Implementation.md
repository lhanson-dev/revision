# Returning Student Home Implementation

**Status:** FI-023 Home v3 implementation candidate — draft PR #601, not yet merged or Live  
**Updated:** 2026-10-11  
**Normative authority:** `10-product-governance/Returning Student Home Experience.md` v1.3 (Founder approved, integrated through PR #595), `20-brand-and-experience/Learner Design System.md` v1.0, `20-brand-and-experience/REV Guidance and Conversation Pattern.md` v2.1, `40-evidence-and-trust/Claims and Progress Governance.md` and existing global navigation/Plan authority.

## Route, current-state boundary and entry

**Canonical signed-in target:** `/revision/app/#/home` in the GitHub Pages deployment.  
**Owner:** `app/index.html → src/main.tsx → AuthGate → FirstUseBoundary → PlannerRuntime → PlannerHomeScreen`.

FI-023 changes only that runtime's Home composition and bounded route handoffs. Historical `src/app/App.tsx` is not a second signed-in Home and remains an unrelated compatibility surface. There is no new route to a second Home, no second shell, no database migration, and no new model/inference API.

**Before FI-023:** `PlannerHomeScreen` rendered a separate welcome row, shared `RevSuggestionCard`, subject tiles, and an aside with next-exam/Plan summary, rather than the approved v3 hierarchy. Its setup/evidence `Promise.all` failed the whole Home when either dependency failed.

**Proposed FI-023 candidate:** `src/app/PlannerHomeScreen.tsx` composes exactly five areas:
1. REV hero, one next useful action and full-width Ask REV input;
2. Today's Plan and Your Exams (side by side desktop, stacked below 1160px);
3. Your Progress using the shared three measures;
4. Your Courses (saved-course Overview links);
5. quiet Learn, Practice, Exam Prep, Plan, Progress and Courses introductions with eligible-course selection.

The existing GJ-01/first-use gate remains ahead of Home. Accounts with no active courses retain `HomeSetupEmpty`, rather than a fabricated empty dashboard. Home on all tiers preserves the same substantive Free capability.

## Trusted data ownership

- **REV recommendation:** `rankSuggestions` and `pickSuggestion` in `rev-suggestions.ts`; `fallbackHomeTasks` provides a bounded evidence-backed fallback. `Not now` retains browser-session behaviour. No model invents priority.
- **Today:** `home-v3-model.ts` calls the same `createPlanDayBuilder` from `plan-model.ts` used by Plan, with the planner's `schedule`, accepted `PlannedSession` records, availability and locally dated assessments. Completed means only `PlannedSession.status === 'done'`. `homeTaskMatchesPlanRow` requires an exact course/topic/activity for derived tasks, or the exact original REV recommendation ID for accepted sessions whose stored activity type is coarser than flashcards/quick-check.
- **Start actions:** current `home-task.ts` and `HomeFocusedActivity` remain the source for REV focused work. A Home exam-question recommendation launches the eligible course's Exam Prep without making up a paper identity. Accepted session rows open their actual Learn, Practice topic or Exam Prep destination. A saved course never leads to a removed/out-of-programme course.
- **Exams:** `RevisionAssessment.assessmentType` distinguishes `mock` from `public_exam`; Home shows stored titles and real local calendar-day distances for active saved courses. The existing `PlanScreen` owns adding/removing dates through its Manage Exams overlay, now addressable by `planRoute({intent:'manage-exams'})`. No duplicate Home date editor or extra `paper` column exists.
- **Progress:** `progressMeasuresFor`, `readinessAcross` and `ProgressMeasures` are reused exactly as on learner-wide Progress; no blended percentage or predicted grade. Course tiles reuse saved programme identity and `buildCourseTiles`.
- **Ask REV:** Home submits the typed question once using `PlannerRuntime.openRev(draft, true)` and a one-shot `PlannerRevScreen` handoff after current context has loaded. It uses the existing contextual panel and safeguards. There is no second inline answer-preview system or new token spend per Home render.
- **Failures:** learning evidence, planner setup and accepted sessions load independently with section-specific retry. An unavailable accepted-session store does not invent an empty or completed day; the rest of Home is still accessible. A missing course uses the governed first-use recovery.

## Visual implementation ownership

All user-facing layout additions are in `src/app/home-v3.css`, imported by `src/main.tsx` after the current shared learner shell, with canonical semantic surface, action, type, radius, focus and subject tokens. `RevMark` delegates to the one `RevPresence` Living E; Home scopes only size and bloom, not an additional icon drawing. The shared `Button`, `ProgressMeasures`, `SubjectBadge`, `HueProgressBar` and `Icon` are reused. `book` and `paper` are newly registered shared glyphs.

The main layout follows approved breakpoints: >1160 desktop, 961–1160 laptop, 621–960 tablet, ≤620 phone, including a 320px minimum. Phone hero gives the Living E a 100px presence (84px ≤360), so the next useful action appears promptly. Light/Dark and reduced motion retain central ownership. Old `home-v2.css` is temporarily imported because GJ-01-compatible `HomeSetupEmpty` uses its setup selectors. Historical `returning-home.css` and `returning-home-fidelity.css` also contain styling used by existing focused/compatibility renderers; do not blindly remove them in this feature slice. Retire only proven orphaned owners in a later reconciled cleanup.

## Acceptance / assurance still required

The following are **implementation targets, not proven success** until exact-head checks and visual review:

- unit: daily Plan counts/actual Done, exact REV/Plan match and unrelated activity mismatch, exam grouping and course filtering, reloadable Plan exam-management intent;
- browser: authentic Home runtime, directed REV Start, no duplicate chat submission, saved course and chooser navigation, Plan rows and evidence persistence, mocks versus official exams, empty/partial-error states and Free journey;
- visual: 1440/1024/834/390/320 responsive cases in Light/Dark, four REV states and reduced motion, 44px targets, visible focus, no horizontal overflow and no unsupported Progress claims;
- exact-head CI: typecheck, lint, unit, build, database/security and targeted end-to-end;
- **Founder-approved Home v3 visual baselines (12 October 2026):** after reviewing phone/desktop Light/Dark captures, the Founder replied **“Approved”** to the Home v3 visual baseline approval request. Exact-head CI #38214052147 on `8dd3d96a8ae3d5ab8778081b2bcdf47f511af1cc` produced four stable original/retry viewport SHA-256 digests, recorded in `tests/e2e/interface-visual-regression.spec.ts`; retained artifact `11732295608`. This approval covers **only four Home v3 baseline images** and is explicitly **not a PR #601 merge approval**. Full-page Light/Dark captures and configured synthetic learner examples remain supporting visual evidence, never production records. Post-repin CI, specific PR merge approval, and verified path-to-live remain outstanding.

## Documentation impact

The product rule is already active Home v1.3; this document records the current PR candidate only. `docs/features/home.md`, `docs/technical/Learner Design System Implementation Reconciliation.md`, the FI-023 backlog record and `90-governance-registers/Assurance Coverage Register.md` are updated with this same implementation candidate. Actual production status must be recorded only after an approved merge and verified deployment/smoke. Historical Home prototype, screenshots, v1.2 decision and prior CI remain historical evidence and are not rewritten.

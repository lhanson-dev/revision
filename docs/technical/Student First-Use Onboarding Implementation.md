---
title: Student First-Use Onboarding Implementation
status: implementation
last_reviewed: 2026-10-12
---

# Purpose

Document the production implementation of FI-021 / GJ-01: the governed new-Student path from successful authentication to a genuinely useful first revision activity, useful feedback and meaningful Student Home.

This document describes the canonical implementation on approved `main`. WP3's date-only onboarding correction merged in **PR #605** (12 October 2026); the removed weekly-time screen is no longer present in `main`. An independently verified production deployment of that particular change has not been established in this document; merged code must not be confused with observed live behaviour. Product behaviour is governed by `10-product-governance/Student Lifecycle Journey Contracts.md` v1.0 (D-01/D-01b), `Authentication Experience.md`, `Core User Journeys.md`, `Adaptive Revision Planning.md`, `20-brand-and-experience/Product UX Principles.md` and the approved FI-021 Definition-of-Ready.

# Canonical runtime

FI-021 is implemented only at the canonical learner entry:

`/app/ → src/main.tsx → AuthGate → FirstUseBoundary → FirstUseGate → PlannerRuntime`

`AuthGate` remains responsible for authentication/session admission. `FirstUseBoundary` decides whether an authenticated account is an established pre-FI-021 account or is eligible for the new first-use journey. `FirstUseGate` owns the incomplete first-use journey. `PlannerRuntime` remains the one normal learner runtime.

No onboarding-only learner runtime, duplicate course identity, duplicate content model or duplicate learning-evidence model is introduced.

# Journey implemented

The enabled new-Student path is:

`successful account creation → experience choice → Student → save exact supported course → optional known exam-paper dates (save or skip) → Course added / Course ready → optional starting check → cautious recommendation → exact useful revision activity → useful feedback → Student Home → optional weekly study time in Plan`

The recovery path for a skipped or unavailable starting check is:

`first supported Course → optional exam-paper date skip → deterministic starter recommendation → exact useful revision activity → useful feedback → Student Home`

Normal Home is not rendered for an eligible new Student merely because authentication succeeded or a course was saved. The first-use state is completed only after normal learning evidence has been created by a useful activity and the feedback state has been reached. **Saving an exam date does not require starting-check completion or create learning evidence; weekly availability is not a first-use gate.**

# Existing-account compatibility

FI-021 must not unexpectedly re-onboard established accounts.

Two controls implement that rule:

1. migration `20260824222500_add_student_first_use_onboarding.sql` seeds every `auth.users` account already present when the migration runs as `student / complete`; and
2. `FirstUseBoundary` uses the fixed FI-021 cutover `2026-08-24T21:23:00.000Z` as an additional compatibility guard. Auth users created before that cutover continue straight to `PlannerRuntime` without acquiring a runtime dependency on `account_experience_state`.

The migration is the durable compatibility record. The app boundary is deliberate defence-in-depth and preserves existing browser/runtime behaviour if the compatibility row is temporarily unreadable.

Accounts created after the cutover do not receive a default primary experience. They enter the governed selector and fail closed into a recoverable first-use experience rather than silently bypassing onboarding if their new state cannot be loaded.

# Account experience state

`public.account_experience_state` is owner-scoped application routing state.

It records:

- `user_id`;
- the enabled `primary_experience` (`student` in this release);
- current onboarding stage;
- optional exact starter topic/activity needed for safe activity resume;
- completion timestamp; and
- created/updated timestamps.

It is explicitly not:

- administrator permission;
- authentication authority;
- Student-data authorization;
- payer/purchaser role;
- subscription entitlement; or
- a future Parent/Teacher permission grant.

The browser can select, insert and update only its own row under RLS. Parent and Teacher values are not accepted by the initial schema/browser policy.

# Course identity

First-course setup reuses FI-020 `learner_courses` and the published catalogue identity.

The UI resolves the exact supported course progressively. It asks only the qualification/subject/exam-board/course choices still required to remove ambiguity. When a level of the choice is unique it is shown as resolved rather than asking a redundant question.

Only one course is required before first value. Later course management remains the responsibility of normal Courses.

# Optional exam dates before first value (WP3 correction)

After saving the exact supported course, the canonical `FirstUseGate` displays the date-only `OnboardingPlanSetup` step **4 of 4**. Each published paper is labelled with its course, and students can save one or more known public-exam dates through the existing learner-owned `revision_assessments` service or **Skip for now**. Successful saving and skipping both invoke the same `finishPlanSetup` transition into durable `course_ready`; neither depends on or writes starting-check/ordinary learning evidence.

The previously offered **fifth** onboarding screen for Monday–Sunday study capacity was removed in merged PR #605. The existing `PlanScreen` study-time card remains the owner of recurring availability through `saveAvailabilityProfile`, available after first useful revision and feedback. Students without exam dates or weekly availability can still complete initial revision and reach useful Home with honest missing-plan guidance. No planner, evidence schema, assessment model, Home v3 component or subscription behaviour is changed.

**WP3 exam-date reliability:** The original date-only implementation inserted each selected paper separately with `module_id: null`; a later failure could leave a partial save and repeated submission could duplicate the first paper. The subsequent bounded candidate described below changes this specific write/retry path without altering what exam dates mean.

# Course-ready bridge

After the first membership is persisted, the journey presents the locked Course-ready hierarchy:

- accessible success icon plus `Course added` text;
- dominant `<Subject> is ready.` title;
- exact qualification/exam-board/specification identity;
- `Now let’s work out where to start.` explanation; and
- dominant `Find my starting point` action.

`Skip for now` is subordinate and routes to the governed deterministic starter path rather than generic Home.

# Starting-check evidence

FI-021 consumes the existing FI-006 foundation.

`starting_check_evidence` remains structurally separate from ordinary `learning_evidence`. The first-use UI records each answered sampled question immediately so interrupted checks can resume without inventing missing answers.

The recommendation uses the approved FI-006 rule:

1. earliest incorrectly sampled eligible topic in canonical course order;
2. otherwise earliest eligible topic without stronger normal learning evidence; and
3. otherwise the first eligible canonical course topic.

Starting-check answers do not themselves create coverage, mastery, readiness, grade or on-track claims.

# Recommendation and exact useful work

The recommendation explains its evidence strength and remains overridable.

For the recommended/chosen topic, the journey selects an existing supported starter activity:

- prefer an available flashcard review; otherwise
- use an available normal multiple-choice quick check, preferring a question not already used by the starting check.

The exact topic and activity type are persisted before entering the activity so reload/recovery can restore the same first useful task.

`Start revision` therefore terminates in work, not another discovery page or generic course Home.

# Normal learning evidence and feedback

The first useful activity creates ordinary governed learning evidence using the existing evidence service:

- flashcard self-rating → ordinary `flashcard` evidence; or
- normal question → ordinary `multiple_choice` evidence.

Only after that evidence saves successfully does the journey move to feedback.

Feedback uses cautious language appropriate to one result. It explains what happened and what Revision may do next without treating one flashcard/question as proof of mastery or readiness.

On `Continue`, onboarding is durably marked complete and the normal `#/home` route becomes active.

# Funnel telemetry and privacy

`public.student_first_use_events` records bounded operational/product funnel events needed to understand whether eligible Students reach first value.

The browser may insert only its own events and cannot read the event table.

General onboarding telemetry deliberately excludes raw answer content, selected-option/correct-option details and other educational responses. Those remain in their governed evidence tables.

Telemetry failure is best-effort and never blocks a Student from reaching useful revision.

# Free / Paid / Premium

No FI-021 step checks subscription state.

Primary experience, exact course context, starting evidence, recommendation, first useful revision and first-use completion are foundational behaviour and remain identical across Free, Paid and Premium. There is no upgrade prompt or paywall in this journey.

# Responsive, theme and accessibility treatment

The implementation consumes the central Calm Teal Interface System roles and extends the central Light/Dark token scope to `.first-use-shell`.

Important behaviours include:

- desktop role choices may use a three-column composition;
- tablet/phone role choices compact into shallow stacked rows;
- role icon and title remain on the same line;
- Parent/Teacher `Coming soon` is explicit and not colour-only;
- disabled semantics are available to keyboard/assistive technology;
- all primary controls meet the shared minimum control/touch target sizes;
- focus-visible uses the central focus ring;
- Course-ready explanation/CTA stack safely on constrained screens;
- no horizontal overflow is expected at governed phone/tablet/desktop widths; and
- reduced-motion preference is respected.

# Recovery rules

The journey preserves useful state rather than restarting unnecessarily:

- a saved membership with a stale `course` stage derives `course_ready`;
- answered starting-check questions are loaded and skipped on resume;
- a fully answered check with a stale check stage derives recommendation;
- partial/skip uses only observations that actually exist;
- no eligible starting-check questions routes to deterministic useful work;
- exact starter topic/activity is persisted before work so the activity can resume;
- persistence errors are surfaced rather than silently dropping the learner into an unscoped shell; and
- if a saved course/starter activity is no longer present in the published catalogue, Revision refuses to substitute a different course or invent evidence.

# Assurance

Original FI-021 PR #163 added scenario-mapped assurance for:

- new-account Student selection;
- Parent/Teacher unavailable state;
- first-course persistence using canonical FI-020 membership;
- Course-ready locked hierarchy;
- starting-check completion;
- starting-check skip fallback;
- direct recommendation-to-work transition;
- ordinary learning-evidence creation;
- useful feedback and transition into Home;
- bounded telemetry without raw-answer duplication;
- phone/tablet/desktop selector behaviour;
- Dark mode and horizontal-overflow checks;
- owner-scoped account-state/event RLS; and
- post-migration new accounts not being compatibility-seeded.

WP3 specifically updates the existing `tests/e2e/student-first-use.spec.ts` browser journeys: **four** setup steps rather than five, date save/skip reaching course-ready without any availability write or starting-check prerequisite, changed-date-step accessibility/responsiveness, and later Plan availability entry after a completed first activity with unchanged learning evidence. Existing first-use, Home v3, RLS and persistence suites remain controlling. CI and deployed-route evidence must be recorded after running; changing assertions alone is not proof of a passing build.

The full repository typecheck, lint, unit, build, responsive browser, migration replay, pgTAP, authenticated persistence and protected-service checks remain mandatory before merge readiness.

# Release boundary

This change adds database objects consumed by the browser and therefore relies on the repository's Production Backend Readiness gate.

The migration must replay successfully in isolated CI and the production database release contract must be ready before the Pages deployment is considered a successful governed release. The frontend is not considered production-complete merely because the PR merges.

# Documentation impact

FI-021 changes current implementation truth but does not redesign the already-approved GJ-01 product behaviour. Therefore:

- normative journey/authentication/UX authority remains unchanged;
- the FI-021 backlog/Definition-of-Ready record must move from `Ready` to `In Progress` when this implementation begins while preserving its historical Ready approval evidence;
- this technical document records how the accepted behaviour is implemented; and
- assurance/register status must not be promoted to Covered/Live until repeatable CI and production evidence actually exist.
## Historical C3 first-use presentation-only reconciliation (10 October 2026; preserved point-in-time)

The canonical `AuthGate → FirstUseBoundary → FirstUseGate` route is unchanged. Retired direct `--rv-*` roles in `first-use-v2.css` and `onboarding-v2.css` are replaced with central learner surface, text, control, display, focus and geometry roles, including course choices and currently offered Plan-setup controls. The four-state first-use/account model, account choice, saved-course persistence, optional exam dates, currently positioned weekly-time step, starting check, evidence and Home transition are unchanged. A narrow new stylesheet assurance and phone account-choice Light/Dark visual gates supplement existing journey and accessibility tests. Proposed journey-order changes in draft PR #590 are expressly out of scope until separately approved and implemented. No normative authority change in this migration.

## WP3 first-use sequencing correction (merged PR #605, 12 October 2026)

The source correction is confined to `src/app/OnboardingPlanSetup.tsx`, the four-step counter in `src/app/OnboardingCourseChoice.tsx`, first-use browser assertions and this technical document. The canonical route is unchanged. The outdated C3 paragraph immediately above records the *then-existing* optional weekly-time screen and former draft-PR #590 dependency; it is historical and superseded for current product intent by merged PR #590, the WP2 audit in PR #604 and the WP3 candidate described here.

**Documentation-impact decision:** Existing product authorities already specify optional known exam dates and post-first-value optional availability. No normative rewrite, index/register promotion, schema change or new ADR is needed for this small implementation correction. The active `Assurance Coverage Register.md` retains its existing JRN-08/07 and DATA-04 claims until new exact-head and production evidence has been verified. Do not claim this correction is Live from a PR branch or from passing tests alone.

## WP3 first-use interruption and evidence-save recovery assurance (merged PR #607, 12 October 2026)

The next narrow assurance slice adds **three browser regression scenarios** to the existing `tests/e2e/student-first-use.spec.ts` without changing production onboarding logic:

1. **Partially answered starting check → reload → continue at next unanswered item → Skip** retains the one durably saved sampled answer, records a partial-check transition, creates no ordinary learning evidence or completion, and restores the same recommendation after another reload.
2. **Saved first activity → reload → finish → feedback → reload** restores the exact starter topic/activity and feedback from the persisted learning result, then reaches Home without duplicate learning-evidence writes.
3. **First normal learning-evidence write fails → recover in place → retry** surfaces an error with the answer still available, leaves the account in `activity` without recorded learning evidence or onboarding completion, then accepts a successful retry and transitions through feedback to Home with exactly one saved evidence row.

All three use the **existing synthetic authenticated browser identity and controlled REST stores**. They are scenario evidence only, not proof of a real new-account identity-provider transaction, isolated real-service persistence, or deployed-route behaviour. Existing owner-scoped RLS and real database/CI tests remain separate; none are weakened or recast.

**Assurance status:** All three new scenarios passed exact-head Revision CI #38309650678 before Founder-approved merge PR #607. They remain simulated authenticated browser tests rather than real-provider or production-interaction proof. `90-governance-registers/Assurance Coverage Register.md` JRN-08 and DATA-07 remain at their previously evidenced layer, with no status promotion from source edits alone. No new normative rule, database migration, frontend route, assessment model, Home view or canonical user-facing behaviour is added.

**Documentation impact check:** Existing GJ-01, Student Lifecycle and evidence/UX/REV authorities already require safe recovery, so a product authority or ADR change is unnecessary for test-only assurance. This technical document is updated to record the scenario boundary; the WP2 point-in-time audit remains unchanged. More extensive authenticated real-service testing, exam-date retry/paper identity, and Home FI-023 exact exam-activity gaps remain deliberately separate.

## WP3 known paper-date save and retry correction (candidate branch, 12 October 2026)

**Canonical route:** `/revision/app/ → src/main.tsx → AuthGate → FirstUseBoundary → FirstUseGate → OnboardingPlanSetup`. The date entry screen remains optional, before the starting check and independent of learning evidence.

**Confirmed pre-fix problem:** Saving more than one known public-exam date used sequential independent `revision_assessments.insert` calls. If the second insert failed after the first succeeded, resubmitting repeated the first insert, producing duplicate active exam dates. The same code omitted `module_id` even though `revision_assessments.module_id` is already an existing nullable text field. This is a targeted existing-journey persistence defect, not a new feature or product policy.

**Candidate correction:** `saveKnownPaperDates` queries learner-owned, active public-exam assessments for each exact course before each paper write. It uses the catalogue's exact paper manifest ID as `module_id`; a pre-existing module-less public-exam row is recognised only by that course's exact paper title. When exactly one match exists, its row is preserved and either reused unchanged for the same date or updated by assessment ID and user ID. If multiple plausible rows exist, the operation fails with an instruction to review dates through Plan, rather than silently overwrite the wrong assessment. A failed existing-date read fails closed: the app never inserts blindly. The existing Plan → Manage exams public-paper save path now records the same exact module identity; generic mock/topic-test/other assessment semantics remain unchanged.

The approach prevents duplicates on normal sequential retries (including partial server commits) and allows legacy module-null dates to acquire durable paper identity on edit. It intentionally does **not** claim an atomic or cross-tab database uniqueness guarantee; simultaneous independent writes still need separate database-level design if evidence shows that risk warrants it. The module ID denotes **paper identity**, not proof that its content or questions assess only that module: AQA Business paper content may cover the full course. Existing course-level planner coverage semantics are preserved.

**Assurance:** The first-use browser suite tests two-paper partial-write failure then retry with no duplicate or premature learning evidence, existing module-less paper-date reconciliation, and previously tested single-paper save before starting check. These are synthetic browser/REST tests; exact-head CI, isolated real-service persistence and actual deployment must be verified separately before making stronger assurance claims.

**Documentation impact:** Existing SL01-A2D and Core User Journeys authority already require correct paper context and persistent optional dates, so no new normative decision, ADR or schema migration is needed. `90-governance-registers/Assurance Coverage Register.md` existing aggregate JRN-08 and DATA-04 layer claims are not promoted by source changes alone; WP2 remains intact as point-in-time evidence. Real-service first-use and Home exact-task follow-ups remain separate.

## WP3 isolated real-service new-account journey assurance (candidate, 12 October 2026)

**Purpose and canonical route:** Close the WP2 P2 evidence gap between mocked first-use browser flows and authenticated persisted new-account behaviour, using the established `/revision/app/` React route: `src/main.tsx → AuthGate → FirstUseBoundary → FirstUseGate → PlannerRuntime/Home`. This is assurance of current behaviour, not a new feature or a staging deployment.

**Execution:** `tests/e2e/first-use-real-service.spec.ts` runs only with `REVISION_BROWSER_DB_INTEGRATION=1`, and refuses a Supabase API URL outside local HTTP `127.0.0.1:54321`/`localhost:54321`. The pre-existing `database-assurance` job already starts isolated Supabase via `supabase start`, replays migrations and exports **local** public/browser and service-role credentials. Its browser step now runs this dedicated scenario alongside the established persisted-course/Practice journey; routine responsive browser CI skips the real-service test. The service-role key is used only in the Node test process for account teardown, never in the application bundle or Playwright page.

**What is actually exercised:** Real email/password `signUp` via the visible Revision Create Account form (local Supabase Auth; local CLI default email confirmation disabled), a newly created **post-FI-021** user, Student choice, exact AQA A-level Business 7132 membership, independently skippable exam dates and starting check, a real first flashcard with **one** persisted normal `learning_evidence` row, reload-safe feedback, owner-scoped first-use completion, and returning Home after another browser reload. An independently signed-in public-key Supabase client checks durable rows, preserves the distinction between planning context and educational evidence and confirms the absence of diagnostic evidence when the check was skipped. A privileged Node-only client deletes the disposable local test account (cascading its learner rows), including failure-path cleanup.

**Evidence boundary and limitations:** This test is stronger than fake JWT/REST responses or a pre-completed account; it performs actual local Auth and Data API transactions against migrations replayed in CI. It **does not** exercise Google OAuth, external email confirmation, production Supabase, a deployed staging host, or real students. Existing owner-isolation/RLS, account/provider readiness, and production-smoke coverage remain separate; this test does not replace or downgrade them. Its success is only established once exact-head Revision CI finishes green; changes to test source and this note alone cannot be reported as passing assurance.

**Documentation impact:** SL01-A1/A2/A3/A4/A5/A6, the Student Lifecycle contracts and existing GJ-01 authority already govern this behaviour. No new normative authority, frontend code, database migration, ADR or changed feature-readiness decision is required. The historic WP2 point-in-time audit is preserved. Review the assurance register's JRN-08/AUTH-01 evidence layer after successful CI rather than inventing production verification.

---
title: Student First-Use Onboarding Implementation
status: implementation
last_reviewed: 2026-08-24
---

# Purpose

Document the production implementation of FI-021 / GJ-01: the governed new-Student path from successful authentication to a genuinely useful first revision activity, useful feedback and meaningful Student Home.

This document describes current implementation truth. Product behaviour remains governed by `10-product-governance/Authentication Experience.md`, `10-product-governance/Core User Journeys.md`, `20-brand-and-experience/Product UX Principles.md` and the approved FI-021 Definition-of-Ready record.

# Canonical runtime

FI-021 is implemented only at the canonical learner entry:

`/app/ → src/main.tsx → AuthGate → FirstUseBoundary → FirstUseGate → PlannerRuntime`

`AuthGate` remains responsible for authentication/session admission. `FirstUseBoundary` decides whether an authenticated account is an established pre-FI-021 account or is eligible for the new first-use journey. `FirstUseGate` owns the incomplete first-use journey. `PlannerRuntime` remains the one normal learner runtime.

No onboarding-only learner runtime, duplicate course identity, duplicate content model or duplicate learning-evidence model is introduced.

# Journey implemented

The enabled new-Student path is:

`successful account creation → experience choice → Student → first supported Course → Course added / Course ready → starting check → cautious recommendation → exact useful revision activity → useful feedback → Student Home`

The recovery path for a skipped or unavailable starting check is:

`first supported Course → deterministic starter recommendation → exact useful revision activity → useful feedback → Student Home`

Normal Home is not rendered for an eligible new Student merely because authentication succeeded or a course was saved. The first-use state is completed only after normal learning evidence has been created by a useful activity and the feedback state has been reached.

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

PR #163 adds scenario-mapped assurance for:

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
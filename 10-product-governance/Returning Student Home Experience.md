---
title: "Returning Student Home Experience"
document_id: "revision-returning-student-home-experience"
document_type: "domain-authority"
authority: "product-governance"
status: "active"
version: "1.4"
owner: "Founder"
effective_date: "2026-10-13"
last_reviewed: "2026-10-13"
content_review_status: "founder-approved"
source_of_truth_for: ["returning Student Home hierarchy", "Home REV recommendation and plan relationship", "Home exams and progress orientation", "Home course and activity discovery", "Home experience assurance"]
depends_on: ["Core User Journeys", "Information Architecture", "Adaptive Revision Planning", "Product UX Principles", "Learner Design System", "Global Learner Navigation", "REV Guidance and Conversation Pattern", "Claims and Progress Governance", "Identity Asset Usage Rules"]
supersedes: ["Returning Student Home Experience v1.2 composition", "older Home rule placing the promoted recommendation separately inside Today's Plan, already overridden by REV Guidance and Conversation Pattern v2.1"]
---

> **Authority transition (verified):** The Founder approved FI-023 Definition of Ready on 10 October 2026, and Home v1.3 became the active product authority when PR #595 merged to `main`. Its implementation in PR #601 subsequently received specific Founder merge approval, merged 12 October 2026 and passed the governed production path-to-live verification. The consolidated Learner Design System and specialist authorities remain independently authoritative. This note records the effective transition; it does not modify the Home v1.3 behavioural rules.

# Returning Student Home Experience

## Purpose and authority boundary

Home is a returning Student's personalised command centre. It helps the learner quickly choose useful work, understand today's commitments, check approaching assessments, interpret limited learner-wide progress and find available study experiences. This expands the v1.2 Home composition that ended after Today's Plan, while retaining a single dominant REV recommendation and avoiding a second analytics or recommendation engine.

`20-brand-and-experience/Learner Design System.md` owns shared visual roles, spacing, responsive shell, type and component grammar. `REV Guidance and Conversation Pattern.md` owns REV behaviour, selection rules, voice and contextual conversation. `Global Learner Navigation.md` owns the four global destinations and course section hierarchy. `Claims and Progress Governance.md` owns educational-evidence and readiness meaning. This document owns only Home's screen purpose, content order and navigation/disclosure composition. It does not alter those specialist authorities.

The product contract and frozen Claude Home v3 visual handoff complement one another: the visual handoff specifies visual intent, not permission to add new backend schemas, evidence calculations or AI conversation modes.

## Student journey and screen-purpose contract

`return/login → meaningful Home orientation → choose recommended work or independently navigate → exact useful activity / Plan / Progress / course Overview / Exam Prep`.

- **Student intent:** "What should I do next? What is planned? How am I progressing? What exams are near? Where do I go?"
- **Primary action:** start one evidence-based, deterministic, learner-wide REV recommendation directly in its exact supported activity.
- **Alternative intents:** review or edit today's work, inspect assessment dates, see evidence-based Progress, open an active course, or select Learn/Practice/Exam Prep for an eligible course.
- **REV's job:** promote the next actionable item from Today's Plan where available, explain its factual reason, and enable contextual Ask REV without inventing a second recommendation engine.
- **Success:** the learner can identify a next useful action within seconds and independently reach a main product area without guessing a navigation path.
- **No-course boundary:** GJ-01/first-use remains responsible for first course choice and initial first value. Home must not bypass that journey.

## Home hierarchy

All devices retain this content order. The established global shell stays unchanged.

1. **REV hero — next useful action.** Large Deep Teal feature with canonical Living E and bright white/aqua atmospheric halo, correct compact `Powered by REV` identity, personal greeting, subject/topic/activity/duration, one truthful reason, direct Start, secondary Plan action and full-width contextual Ask REV input. Submitting that Home input sends the question **once** through the existing contextual Ask REV conversation pipeline and opens the shared conversation layer; no second Enter press, duplicate model invocation or invented inline answer preview. Visual greeting target: "Hey {first name}. Here’s what I’d do next." Ordinary loading must not simulate REV Thinking.
2. **Today's Plan and Your Exams.** Distinct, equally legible sections side by side only where the consolidated responsive canvas supports it; otherwise stack with Plan first. Today's Plan shows today's genuine activities, durations, honest completion state and link to Plan; Exams shows the next actual assessment and later records, with mocks clearly distinguished from official exams.
3. **Your Progress.** Compact plain-English learner-wide summary followed by the three existing, distinct governed measures: Topics covered, Understanding and Exam readiness (or honest insufficiency). Link to global Progress. Never add a competing "Needs work" priority list, blended score or grade prediction.
4. **Your Courses.** Compact recognition cards for active/saved courses, mark + name + qualification/board where available, truthful coverage and a direct route to each course Overview. The global Courses index remains the management destination.
5. **What do you want to do?** Quiet, practical introductions to Learn, Practice, Exam Prep, Plan, Progress and Courses, describing what each does. Contextual destinations use a bounded chooser of the learner's active eligible courses. Do not reproduce global navigation as another persistent shell.

No standalone "Topics that need work" block, extra dashboard widgets, punitive study streaks, decorative metrics or duplicate course navigation trees.

## REV and Today's Plan consistency

**Proposed v1.4 Founder clarification (13 October 2026): the hero promotes today's next actual planned activity.** The approved FI-001 planner's deterministic, capacity-aware ordered work for the learner's active programme determines Today's Plan. REV may explain that decision, not independently rank a different Home 'best task'. The plan may include explicit student-accepted commitments and derived recommendations; distinguish those honestly and do not silently convert one into the other.

- **Plan has actionable work:** the REV hero and **Up next** in Today's Plan identify the same exact next eligible item (course, topic, activity, and paper/question identity where the supported item requires it). Prefer actual persisted learner commitments at their known slot/order when they are due and actionable; do not ignore a learner's selected work in favour of an unrelated suggestion. Where no time-of-day or manual ordering is stored, use one deterministic declared priority/tie-break contract shared by Home, Plan and REV; **do not invent a clock appointment**.
- **Direct Start:** opens that supported activity, not a generic course/paper landing when a precise question/activity was promised. Quick checks, flashcards and real, eligible exam questions remain legitimate activity types; availability of a simple route may not be used to change educational priority.
- **Another option / Not now:** 'Suggest something else' advances to the next genuinely eligible *today* plan item, respecting student choice; 'Not now' hides that candidate for the current local day, does not edit the persisted schedule or claim completion. If there is no other actionable entry, say so and offer Plan/Ask REV instead of manufacturing more due work. A student-confirmed adjustment to plan preferences is handled through the existing governed workflow.
- **No actionable items today:** show genuine completed/rest/empty status without immediately fabricating a new booked activity. If genuinely missing planning inputs prevent calculating a meaningful calendar, an evidence-grounded supported fallback may be offered, explicitly labelled **Not on a plan yet**; it is not silently inserted into today's intended workload. If the calendar exists but has no tasks because the day is free, do not pose an unscheduled fallback as required work.
- **Partial/stale data:** do not claim a 'next planned' item if accepted sessions, eligibility or the current day have not loaded reliably; show bounded explanation/retry or an explicitly unplanned, safely supported action only where the governing fallback contract permits it.
- **Presentation:** keep the approved single large REV hero and smaller truthful Today's Plan summary; show one promoted item, not a duplicated reason card or second competing recommendation list. Keep explanatory Ask REV, relevant subject/course and the learner's independent navigation.
- **Assurance:** test plan-order agreement on Home/Plan/REV with accepted, derived, done, skipped, dismissed, zero-capacity, missing-dates, after-exam, unknown-options and exam-question exact Start. No independent 14/7 day Home rank is permitted. This is **R1b** integration work, not a redesign of Home v3 or an R1a-only planner engine patch.

## Exams

Use existing `RevisionAssessment` data, including `assessmentType` (e.g. `mock`, `public_exam`), recorded title, course identity, date and scope. New `kind` and `paper` database columns are **not** part of FI-023.

- Show the nearest actual upcoming eligible exam/assessment as next, including its kind; use the stored paper/component title when known.
- Distinguish later mock dates and official exam dates. Never conflate their proximity or imply that a mock is an official exam.
- Hide absent groups; when none exist, offer **Add exam dates** through the existing Plan owner.
- Dates and countdowns use local calendar days, neutral text and accessible labels, never learning-status yellow.
- **Edit dates** routes into the existing Plan exam-management experience. If a direct deep link to its manager does not yet exist, scope an addressable intent/reuse that owner instead of inventing a separate Home editor.
- Link into the selected course's Exam Prep only when the assessment resolves unambiguously to an active course and that section is supported; otherwise show an honest Plan/assessment-detail fallback.

## Progress and courses

Use the same active-course dataset, shared `progressMeasuresFor`, `ProgressMeasures`, `UnderstandingBar` and readiness contract as learner-wide Progress. Aggregate covered and total topic counts and understanding distributions only over distinct current course states and with the same filters as global Progress. Never claim an aggregate learner-wide readiness percentage or roll multiple course readiness values into a pseudo-grade. If readiness is unsupported, show **Not enough evidence yet**.

Course cards display existing course identity, not a new subject palette. Click/tap opens the canonical saved-course Overview, not an arbitrary default activity.

## Activity introductions and navigation

The six introductory descriptions are secondary orientation, not six competing primary CTAs. Learn, Practice and Exam Prep are **course-specific**, while Plan, Progress and Courses are learner-wide.

- For course-specific actions, show a keyboard-operable chooser scoped to the learner's active supported courses that offer the requested section.
- With exactly one eligible course, use a direct explicit action for that course. With none, explain the missing prerequisite and direct to Courses; do not show a broken link.
- For Plan, Progress and Courses, link directly using canonical route helpers.
- Accessible names, focus restoration, Escape dismissal and no duplicate global navigation tree are required.

## Required data, loading and unavailable states

Required: established returning Student; meaningful GJ-01 return; multiple courses; one eligible course; limited/no evidence; no plan/availability; no exam dates; mocks-only; official-exams-only; today complete; no REV candidate; full and partial loading; per-section recoverable error; authentic REV state changes; responsive Light/Dark and reduced motion.

- Render the REV identity/greeting immediately while Home data loads; use normal skeletons and an accessible loading announcement, not semantic REV Thinking.
- One failed Exams or Progress request must not erase otherwise usable Home/REV/Plan content. Provide a bounded section error and retry action.
- Do not infer completed session counts from mere recommendation or attendance. Only show `done` when durable completion evidence exists; if it does not, show the plan without a fabricated `1 of 3 done`.
- No unsupported claims, invented exam dates, invented readiness, simulated REV answers, guessed courses, or prototype/sample data in the shipped UI.
- Preserve the Free journey. Home's orientation, valid next task, basic plan, exam summary, progress and navigation remain useful on Free; no new tier gates are added.

## Responsive and visual requirements

Use the consolidated responsive shell and outer canvas; Home cannot fork the sidebar, tablet rail or phone tab bar. Preserve the REV hero as the dominant feature, with the full-width Ask REV row. On phone, the approved v3 visual reference shows a smaller Living E beside the greeting to expose the Start action early; use canonical Living E geometry and halo, not custom bars or state animation. Exact scale and layout must be validated against the approved shared component and responsive design authority rather than copied from prototype CSS.

Use central semantic colours, Manrope/Bricolage roles, canonical subject accents, shared controls, canonical radii (14px controls, 20px ordinary surfaces, 28px REV major feature), genuine Light/Dark themes, keyboard access and WCAG 2.2 AA expectations. No new `--rv-*` use or hard-coded page-local visual system.

## Definition of implementation acceptance

A governed Home v3 implementation must prove:

1. Correct main-route Home screen, preserving `AuthGate → FirstUseBoundary → PlannerRuntime → PlannerHomeScreen` and GJ-01.
2. Ordered hierarchy and section scanability across desktop/tablet/phone in Light and Dark from 320px with no horizontal scroll.
3. One truthful deterministic REV suggestion with exact activity launch; clear matching/unmatching Plan tags; no artificial plan duplicate or paper identity.
4. Honest plan completion, empty states and independent error recovery; no unsupported counts.
5. Accurate upcoming assessment types, dates, active-course navigation and useful dates-empty state.
6. Identical three-measure Progress semantics to global Progress, with evidence-threshold honesty.
7. Working course cards, available-section-only chooser, keyboard/Escape/focus behaviour, correct global navigation.
8. Shared Ask REV contextual conversation, actual Living E state transitions, reduced motion and no artificial completion/thinking state.
9. Bounded tests for changed logic, direct-activity journey, cross-page data consistency, accessibility, and Founder-reviewed responsive Light/Dark screenshot baselines.
10. Updated code/technical documentation, visual-test digests and assurance/coverage records in the implementing PR; no historical evidence rewriting.

## Documentation and approval

This contract is tracked as FI-023 (`10-product-governance/backlog/FI-023 Returning Student Home v3 Analysis.md`). The Founder expressly approved FI-023 as **Ready** on 10 October 2026. That is approval to develop the bounded Home v3 scope after this authority is integrated into approved `main`; it is **not** authorisation to merge this or any future PR. Every merge requires separate explicit Founder approval for its specific PR.

On implementation: update `docs/technical/Returning Student Home Implementation.md`, `docs/features/home.md`, the learner design reconciliation record, journey and visual assurance and any directly affected shared-component documentation. No new general Learner Design System, Navigation or Claims authority amendment is justified unless implementing review finds a *real* specialist-contract change; their existing rules are reused.

Historical Home v1.2 and Claude prototype evidence remain historical. Home v1.2 stays operative on `main` until this approved v1.3 authority is merged. Implementation work follows on a separate governed branch after that integration.


> **Revision history / pending change (13 October 2026):** v1.4 is proposed for Founder-governed merge following explicit feedback that REV must recommend what is next on today's plan. The earlier v1.3 distinct off-plan hero allowance above was superseded in the specific REV/Today's Plan relationship; all existing v1.3 visual hierarchy and historical implementation evidence remain unchanged. Do not claim implementation until R1b code, tests and release verification prove it.

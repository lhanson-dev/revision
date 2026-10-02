# Courses and Course Overview

**Status:** built in PR 7 (draft, awaiting Founder review).
**Authority:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md` (sections 1, 3, 9), `docs/design/learner-redesign-v2/guidelines/RESPONSIVE.md`.

## What the student sees

**Courses** (the list of the student's courses)
- Each course card has a solid panel in the **subject's colour** with the subject's **letter mark** (GCSE and A-level Business are both blue, with a B). The colour and mark come from the subject map, not from a per-screen palette.
- "Remove from my courses" is now a 48px control.

**Course Overview** (the first tab inside a course)
- A header panel in the subject colour with the subject badge, board and level, and the **exam date** (or "Not set").
- Under it, the **three progress measures side by side, never blended**:
  - **Topics covered**: "4 of 10", from topics the student has answered something in.
  - **Understanding**: a labelled bar, for example "1 got it · 1 nearly there · 1 needs work · 1 just started · 6 not started".
  - **Exam readiness**: the engine's value when it has one, with how it was worked out; otherwise "Not enough evidence yet" plus what would unlock it. Never a predicted grade.
- **Your path**: every topic with its status badge (icon and words: Got it, Nearly there, Needs work, Just started, Not started). Topics with little evidence are no longer dimmed, so the labels stay readable.
- **Weak spots**: topics marked Needs work, with the badge instead of a percentage.
- **REV's advice**: unchanged.
- On a phone the course tabs (Overview, Learn, Practice, Exam Prep, Progress) wrap onto a second row if they do not fit, instead of scrolling sideways.

## Fixed

- **Course overview scrolled sideways at 320px** (336px wide). The exam-date box could not shrink. It now wraps, and the entry that allowed this in `tests/e2e/horizontal-scroll.spec.ts` is removed.
- Course Overview no longer says "Building" for readiness, shows a topic "Good / Medium" label, or shows per-topic percentages.

## Data used

Existing data only: saved courses, learning evidence and the exam dates already stored. Status words come from `src/app/topic-status.ts` (the Founder-confirmed mapping from the engine's bands).

## Tests that cover it

- `src/app/topic-status.test.ts`: the label mapping and the Understanding counts.
- `tests/e2e/course-dark-theme.spec.ts`: the overview in dark, the three measures, the status words.
- `tests/e2e/horizontal-scroll.spec.ts`: every learner screen at 320 to 1440px, with no exceptions left.
- `tests/e2e/accessibility.spec.ts` (caught the dimmed-row contrast problem during this PR).

## Screenshots

Before and after in `docs/design/learner-redesign-v2/screenshots/pr-07/` for Courses and Course Overview: desktop, tablet, phone, phone dark, 320px, desktop dark. The test student has two Business courses and some answers on A-level Business (one topic each at Got it, Nearly there, Needs work and Just started).

## Not done here

- Topics covered and Understanding on the **Courses list cards** themselves. That needs the list to load the student's answers, which it does not do today. Left for a later pass.
- The Course Progress tab and the global Progress page (PR 11). The old colour palette in `home-view.ts` is still used by Progress until then.

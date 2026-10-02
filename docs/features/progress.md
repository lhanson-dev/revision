# Progress

**Status:** built in PR 11 (draft, awaiting Founder review).
**Authority:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md` (sections 1, 3 and 9).

## What the student sees

Both the global Progress page and each course's Progress tab (and each paper's Progress tab) now use the same measures and the same names.

1. **A plain sentence first**, before any numbers. For example "You've covered 1 of 10 topics. None are rated yet…", or for a brand-new student "You haven't answered anything yet. Start with Leadership and your progress will build here."
2. **One next action with its reason**, chosen by REV's rules (not a model): a button such as "Practise Leadership" and "Why: …". If there is nothing to suggest, no button is shown.
3. **Three separate measures, never blended:**
   - **Topics covered**: x of y, with a bar in the subject's colour.
   - **Understanding**: a stacked bar with words ("1 just started · 9 not started").
   - **Exam readiness**: the engine's value, or "Not enough evidence yet" with what would unlock it. No predicted grade.
4. **How this is worked out**: an optional note of three sentences.
5. **Global page:** one card per course with its subject colour and letter mark, the same three measures, and "Open <course> progress". Readiness across courses is never averaged: it says how many courses have enough evidence, and each course shows its own.
6. **Course tab:** a status badge (Got it, Nearly there, Needs work, Just started, Not started) for every topic, with its answer count.

Removed: the old "Scored activities" count, the averaged "% supported readiness", and the old fixed colour palette on course progress cards.

## Honest data

Everything comes from the student's saved answers and the readiness engine. A brand-new student sees zeros, "Not started" and "Not enough evidence yet". Nothing is invented.

## Code

- `src/app/progress-summary.ts` (pure logic, tested in `progress-summary.test.ts`), `src/app/ProgressIntro.tsx`, `ProgrammeProgressScreen.tsx`, `CourseExperienceScreen.tsx`, `progress-v2.css`.

## Tests

- Unit: `progress-summary.test.ts`.
- Browser: `tests/e2e/progress.spec.ts` (new student, course tab, after answering, no sideways scroll from 320px to 1440px, accessibility check); `interface-plan-progress.spec.ts` and `database-persistence.spec.ts` updated for the new layout.

## Not done here

Predicted grade (open item 1) and any saved exam answers or per-point feedback (need their own data migrations).

## Screenshots

`docs/design/learner-redesign-v2/screenshots/pr-11/`: before and after for global and course Progress, empty and after answering, desktop and phone. The `pr-10-tablet-*` pictures are the tablet timed-exam before/after for PR 10's visual baselines.

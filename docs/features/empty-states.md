# Empty states (PR 14)

**Status:** built in PR 14 (draft, awaiting Founder review).
**Authority:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md`, sections 8 (empty states) and 9 (honest data).

## What was checked

Every screen was opened as two kinds of student, on a phone and on a desktop:

1. **A brand-new student with one course and no answers** (Home, Plan, Courses, Course overview, Learn, Practice, Exam Prep, Course Progress, global Progress).
2. **A student with no course at all** (Home, Plan, Courses, Progress).

The rule is the Founder's: each screen shows its set-up state until that screen has real data, then switches to the real view. Nothing is invented to fill a gap.

## What changed

- **Home, "Your plan" card.** It used to say "A useful next step will appear here as Revision learns more", which told the student nothing. It now says what is actually missing, using only what is saved: no exam dates ("Add your exam dates and I'll start building your plan." with an **Add exam dates** button), then no study time ("Choose study times"), then, once both are set, "Nothing is planned yet." The button is 48px tall (it was a short text link). Logic: `planCardEmptyCopy` in `src/app/HomeSetupEmpty.tsx`.
- **Readiness with no answers** (Course overview). It used to say "include activities beyond flashcards" to someone who had answered nothing. It now says "You haven't answered anything here yet. Once you have, I'll show how ready you are." Once a student has answered something, the engine's own message is shown unchanged. The engine was not touched. Logic: `readinessFor` in `src/app/progress-summary.ts`; the course overview now uses it too.
- **Plan for a new student.** The two set-up steps (exam dates, weekly study time) come first. The long "Your plan adapts as you go" paragraph is behind "How does this work?" until the plan has been set up.

## Left alone on purpose

Screens that were already honest and clear: Home with no course (three-step set-up), Plan/Courses/Progress with no course, Course Progress and global Progress for a new student, Learn, Practice (Quick check), Exam Prep.

## Not built here

Empty states for features that have no data yet (saved Ask REV conversations, the retry queue carried across days, REV noticed) arrive with those features' own PRs.

## Checks

Unit tests for the two pieces of logic; `tests/e2e/empty-states.spec.ts` (phone, tablet, desktop: copy, 48px control, no sideways scroll, axe).
Screenshots: `docs/design/learner-redesign-v2/screenshots/pr-14/`.

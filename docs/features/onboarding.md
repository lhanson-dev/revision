# Onboarding: choosing courses

**Status:** built in PR 13 (draft, awaiting Founder review).
**Authority:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md` (section 4).

## What the student sees

After choosing "Student", the first-course screen is now **five steps, one question each**, with "Step n of 5" and a Back button:

1. **Level.** "What level are you studying?" Only levels that have at least one live course are offered, so a student is never offered something we cannot teach. AS sits under A-level ("Includes AS"). With one level available it is already chosen.
2. **Subjects.** "Which subjects do you study?" Several can be picked, each with its subject colour and letter mark, from the subjects that have a live course at that level.
3. **Exam board.** "Which exam board for each one?" For each chosen subject: the exam board, and AS or full A-level where both exist. A subject with only one way to study it is shown as chosen for them. Nothing is added until every subject has a course.

4. **Exam dates** (after the courses are added): one calendar date per exam paper, optional. Past days can't be picked.
5. **Weekly study time**: minutes per day with steppers (and an "Every day" stepper), optional.

Both of the last two can be skipped, and both can be changed any time on Plan ("Manage exams", "Plan settings"); the plan recalculates itself when they change (Lee, 2 Oct).

The course step ends with **"Add n courses"**. The first course drives the starting check and first recommendation exactly as before; any others are added too (an extra course that fails to save does not stop the student getting started, and can be added from Courses).

The rest of first use (starting check, first recommendation, first activity, feedback) is unchanged.

## Everything comes from the catalogue

Levels, subjects and boards are worked out from the live catalogue in `src/app/onboarding-choices.ts`, so a new course appears without a design change.

## Not built here

- **"Coming soon" requests** (a student can say they study a subject or board we do not offer yet, saved on their profile): needs the requests table in the data model proposal (section 4), which has not been approved or built. The screen only says that only ready courses are shown.
- **The catalogue in the database** (proposal section 3): the code catalogue still feeds the screen.
- **GCSE:** there is no live GCSE course yet, so the level step shows only A-level.

## Tests

- Unit: `onboarding-choices.test.ts`.
- Browser: `student-first-use.spec.ts` updated for the three steps, plus new tests: order and Back, a pick is required before adding, 320px to 1440px with no sideways scroll, accessibility check at each step.

## Screenshots

`docs/design/learner-redesign-v2/screenshots/pr-13/` (before and after, desktop and phone).

# Plan

**Status:** built in PR 6 (merged, #490); accepted sessions added in PR 8 (draft, awaiting Founder review).
**Authority:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md` (sections 1, 8, 9), `docs/design/learner-redesign-v2/data-model-proposal.md` (section 5), `10-product-governance/Adaptive Revision Planning.md`.

## What the student sees

- **Plan** opens on the **Week** view (Day and Month are one tap away). Today's column is highlighted.
- Each planned session is a **solid block in the subject's colour**, with the subject's letter mark and name, the topic, the activity and the minutes. Business is blue, not brand teal. A subject with no colour in the subject map yet gets a neutral colour and its first letter, never teal, yellow or coral.
- The **overview strip** shows the next exam (neutral text with a clock icon), the study time available this week and the plan status.
- **Manage exams** and **Plan settings** (weekly study time per day) are unchanged in what they do. The study-time plus and minus buttons are now 48px (they were 32px).
- On a phone or tablet the week becomes a day list, one day under the other. The page never scrolls sideways.
- The set-up empty states (no exams yet, no study time yet) are unchanged.

## Accepted sessions (PR 8)

Sessions the student puts on their plan are stored (table `learner_planned_sessions`, see `docs/technical/Learner Planned Sessions Implementation.md`) and shown on their day:

- Each is a block in the subject's colour with the subject mark, the topic, the activity and the minutes.
- A session that came from a REV suggestion carries a **REV pick** tag. A session the student added carries none.
- A **Done** session is shown in a plain surface with a **Done** tag (not faded, so the words stay readable).
- Each has an **Options** menu: **Start** (opens the course section), **Mark done** (or **Put back on plan**), **Move it** (choose another day), **Skip** and **Remove**.
- The derived plan works around them: an accepted session takes its minutes off that day's study time, and its topic is not suggested again elsewhere until it is done or skipped. Days still show the student's full study time.
- If the table cannot be read (for example it has not been applied to the database yet), Plan simply shows no accepted sessions and says nothing about it.

## What did not change, and why

- The plan is still **worked out fresh each time** from exam dates, study time and the student's evidence. Nothing about how topics are chosen has changed.
- **Not built, because the plan works in days, not time slots:** "REV picks the next free slot inside the student's study times" and not double-booking a slot. Study time is a number of minutes per day, so there are no slots to double-book.

## Data used

Existing data only: exam dates, weekly study time, learning evidence and the planner's own schedule. No new tables.

## Tests that cover it

- `src/app/subject-identity.test.ts`: known subjects use the subject map; unknown subjects get a neutral hue and a first letter.
- `tests/e2e/interface-plan-progress.spec.ts`: set-up state, default Week view, dark theme surfaces.
- `tests/e2e/horizontal-scroll.spec.ts` (Plan at 320 to 1440px), `accessibility.spec.ts`, `app-responsive.spec.ts`, `mobile-tabbar.spec.ts`.

## Screenshots

Before and after, same data (one Business course, an exam in 20 days, weekly study time set), in `docs/design/learner-redesign-v2/screenshots/pr-06/`: desktop, tablet, phone, phone dark, 320px and desktop dark.

## Not done here

- Everything listed above that needs the accepted-sessions table.
- The old colour palette in `home-view.ts` stays until Courses (PR 7) and Progress (PR 11) stop using it. Plan and Home no longer use it.

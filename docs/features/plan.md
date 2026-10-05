# Plan

**Status:** redesigned in Plan v2.2 (branch `plan-screen-v2.2`, awaiting Founder review). Earlier: PR 6 (#490), PR 8 (#495).
**Authority:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md` (sections 1, 8, 9), `docs/design/learner-redesign-v2/data-model-proposal.md` (section 5), `10-product-governance/Adaptive Revision Planning.md`.

## What the student sees (Plan redesign v2.2)

Source of truth: the Plan screen in the design package (`ui_kits/learner_app/PlanScreen.jsx`) and "v2.2 (Plan redesign)" in `CHANGES_v2.1.md`.

- **Header:** "Your week" (or Next week, Last week, "Week of 12 Oct"; "Your month" or the month name) and **Add session**. Under it: ‹ date label › (the label opens a mini calendar; "This week" or "This month" appears when away from now) and the **Day / Week / Month** switch. The view and date are kept in the address, for example `#/plan?view=week&date=2026-10-05`, so a reload or shared link lands in the same place. Plan opens on Day, today.
- **Summary card:** the period, time done of time planned, a percentage, a bar and a status in words with an icon (On track, Catching up, Finished, Coming up). It is time against plan, never a mastery percentage.
- **Day:** a seven-day strip (keyboard tabs: arrows, Home, End) with subject-colour dots, a tick when everything is done and a pill on exam days, then that day's sessions.
- **Week:** seven stacked days. Tapping a day opens it in Day view.
- **Month:** Monday-first grid with session dots; exam days are solid subject colour with the letter mark; days outside the month are muted; tapping a day opens it in Day view.
- **Rows:** letter mark, "Subject · Topic", and kind, length. Done rows are muted with a tick and "Done". Today, a REV pick has **Continue** and other sessions have **Start**. Exam rows are solid subject colour: "Exam day · in 17 days". Accepted sessions keep an **Options** menu: Start, Mark done (or Put back on plan), Move it, Skip, Remove.
- **Your exams:** the next exam in solid subject colour with a days countdown, the rest listed, and **Add exam date** (which also lets the student remove a date or add a mock or topic test).
- **Study time:** minutes per day, **Change study time** with 15-minute steppers (0 is Rest), **Save and re-plan**. Sessions already done never move.
- The side column sits beside the main column on wide screens and below it at 1100px and under (two cards side by side on tablet, one column on phone). The page never scrolls sideways.
- **Removed:** the REV suggests card, the weekly goal card, the "Your plan adapts as you go" explainer, the header "Ask REV anything" box and the old overview strip.

## Honest data

- Days show what is real: sessions the student accepted (including done ones, for past days), what the planner returns for the days ahead (it looks about two months ahead), and the student's exam dates. A day or week with none of these shows "Free. Nothing planned." or "Rest day. Nothing planned, on purpose." Nothing is invented for future weeks.
- If exam dates or study time are missing, a short note says what is missing and the two side cards are where to add it. Sessions the student adds themselves still show.
- If the sessions table cannot be read, Plan shows no accepted sessions, hides **Add session**, and says nothing about it.

## Accepted sessions

Sessions the student puts on their plan are stored (table `learner_planned_sessions`, see `docs/technical/Learner Planned Sessions Implementation.md`). A session that came from a REV suggestion carries a **REV pick** tag. The derived plan works around accepted sessions: one takes its minutes off that day's study time, and its topic is not suggested again until it is done or skipped.

## What did not change, and why

- The plan is still **worked out fresh each time** from exam dates, study time and the student's evidence. Nothing about how topics are chosen has changed.
- **Not built, because the plan works in days, not time slots:** "REV picks the next free slot inside the student's study times" and not double-booking a slot. Study time is a number of minutes per day, so there are no slots to double-book.

## Data used

Existing data only: exam dates (`revision_assessments`), weekly study time per weekday (`revision_availability_profiles`), accepted sessions, learning evidence and the planner's own schedule. No schema change.

## Tests that cover it

- `src/app/subject-identity.test.ts`: known subjects use the subject map; unknown subjects get a neutral hue and a first letter.
- `tests/e2e/plan-screen-v22.spec.ts`: the three views, address, keyboard (day strip and date picker), study time, add session, honest empty states, no sideways scroll at 1440/960/620/390/320, axe in light and dark.
- `src/app/plan-model.test.ts`, `src/app/plan-dates.test.ts`, `src/app/navigation.test.ts`.
- `tests/e2e/interface-plan-progress.spec.ts`: set-up state, dark theme surfaces.
- `tests/e2e/horizontal-scroll.spec.ts` (Plan at 320 to 1440px), `accessibility.spec.ts`, `app-responsive.spec.ts`, `mobile-tabbar.spec.ts`.

## Screenshots

Before and after, same data (one Business course, an exam in 20 days, weekly study time set), in `docs/design/learner-redesign-v2/screenshots/pr-06/`: desktop, tablet, phone, phone dark, 320px and desktop dark.

## Not done here

- Everything listed above that needs the accepted-sessions table.
- The old colour palette in `home-view.ts` stays until Courses (PR 7) and Progress (PR 11) stop using it. Plan and Home no longer use it.

# Home

**Status:** built in PR 5 (draft, awaiting Founder review).
**Authority:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md` (sections 1, 2, 3, 8, 9), `docs/design/learner-redesign-v2/data-model-proposal.md` (sections 8 and 11).

## What the student sees

1. **A greeting and today's date**, and an "Ask REV anything" button (opens the Ask REV pop-up).
2. **REV's suggestion**: a large card with one topic, how long it takes, and a line starting "Why:" that gives the reason from the student's own work. Three buttons: **Start**, **Suggest something else**, **Not now**.
3. **Your courses**: one card per course in the subject's colour with its letter mark. Each shows **Topics covered** ("3 of 10 topics covered") and **Understanding** (a labelled bar, e.g. "1 got it · 2 nearly there · 7 not started"). There is no single percentage.
4. **Next exam** (only if the student has set exam dates): the days to go as neutral text with a clock icon. It is not yellow, because yellow means Nearly there only.
5. **Your plan**: a one-line summary of what the planner has for today, or an honest line saying a next step will appear as Revision learns more.
6. A brand-new student with no courses still sees the existing **set-up empty state**.

## How REV chooses the topic (rules, never a model)

In order, using the engine's topic states (`src/app/rev-suggestions.ts`):

1. An exam within 14 days covers a topic marked **Needs work**.
2. A topic marked **Needs work**, then **Nearly there** (lowest score first).
3. A topic an upcoming exam covers that has not been studied for 7 days or more (or ever).
4. The next **not started** topic, in course order.

Each topic is offered once, under the first rule that fits. The reason shown is built from the real data behind that rule (the exam's name and days to go, the topic's status, or the number of days since the student last studied it). If nothing qualifies, no card is shown. The 14-day and 7-day windows are starting values to be tuned after testing (open item 3).

**Suggest something else** moves to the next candidate. When the student has been through them all it starts again, because they asked. **Not now** hides that suggestion until tomorrow. If everything has been put to one side the page says so ("That's all I'd suggest for today.") and offers the plan and Ask REV.

## Status labels

`src/app/topic-status.ts` turns the engine's band into the fixed words: good is **Got it**, medium is **Nearly there**, low is **Needs work**, and "not enough evidence" is **Just started** if the student has answered anything in the topic, otherwise **Not started**. No new thresholds.

## Data used

Existing data only: saved courses, learning evidence, exam dates and study times. "Not now" is kept in the browser for the current session only. Remembering it across devices needs the suggestion-events table in the data model proposal (agreed, its own migration PR). Until then, closing the browser brings the suggestion back.

## Rules as built

- Controls are 48px; the card's text links are 48px tall. Status is always icon plus text. The page never scrolls sideways (checked at 320 to 1440px).
- Subject colours come from tokens through `src/app/subject-palette.ts`; a subject with no entry yet gets a neutral hue and a first-letter mark.
- The Home card no longer shows a Learn, Practice, Exam Prep step list. A guided session needs the accepted-sessions data (Plan, PR 6).

## Tests that cover it

- `src/app/rev-suggestions.test.ts`: each of the four rules, the reasons, one entry per topic, skip, wrap-round, "Not now" until tomorrow, the rest state, and the course-tile counts.
- `src/app/topic-status.test.ts`: the label mapping.
- `tests/e2e/returning-home.spec.ts`: the card and its reason, Suggest something else, Not now until nothing is left (also after a reload), Topics covered and Understanding on the course card, no "% mastered", Start opens the quick check.
- `tests/e2e/horizontal-scroll.spec.ts`, `accessibility.spec.ts`, `app-responsive.spec.ts`.

## Screenshots

Before and after, same data, in `docs/design/learner-redesign-v2/screenshots/pr-05/`: desktop, tablet, phone, phone dark, 320px, desktop dark. The test student is brand new (one course, no answers), so these show the first-day state; the other rules are proved by the unit tests.

## Not done here

- Cross-device "Not now" and a record of suggestions shown (suggestion-events migration).
- "Add to plan" and guided session steps (Plan, PR 6).
- The sample-colour palette in `home-view.ts` stays for Plan, Courses and Progress until their PRs; Home no longer uses it.

## Add to plan (PR 8)

- REV's card has an **Add to Thursday** button (the day is the next one with enough study time left after sessions already on the plan; with no study time set it offers tomorrow). Pressing it saves a session on that day, marked as a REV suggestion, and says so in words: "Added Finance to Thursday. You can move it on Plan."
- A topic already on the plan is not suggested again until it is done or skipped.
- If the sessions table cannot be read yet, the button is not shown and nothing is said about it.
- The student can move, finish, skip or remove the session on Plan.

# Exam Prep: timed paper

**Status:** built in PR 10 (draft, awaiting Founder review).
**Authority:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md` (sections 1, 5 and 9), `docs/design/learner-redesign-v2/data-model-proposal.md` (section 7), `docs/features/shell-navigation.md` (focus mode).

## What the student sees in a timed paper

- **Question grid.** Every question is a numbered square showing its marks. It wraps onto more rows instead of scrolling sideways. Each square is at least 48px tall.
  - **Answered** shows a tick, **flagged** shows a flag and a dashed outline, **current** is dark. A key under the grid says so.
  - For screen readers each square says its state in words: "Question 3, 4 marks, answered, flagged for review, current question."
- **Flag for review.** A button on each question (pressed state announced) to mark it to come back to.
- **Before you finish.** Above the finish buttons: "Before you finish: not answered: question 3, 4. flagged: question 1."
- **Timer.** Low time (under 10 minutes) is coral with a clock icon and the words "Under 10 min". It was yellow with no words, and yellow means Nearly there only. It never makes the page scroll sideways at 320px.
- **Screen readers hear "Under 10 minutes left", then "Under 5", then "Under 1 minute"**, politely. The clock is no longer read out every second (it was a live region).
- Unchanged: the focus mode (no navigation, the "Leave Exam Prep" bar), Pause, and "Stop exam" with its confirmation.

## Not built, and why

These need data that does not exist yet:

- **Autosave and answers that survive a refresh or a closed tab.** Needs the exam-attempts and drafts tables (data model proposal, section 7). Flags and answers still live only in the page, as before.
- **A timer that keeps counting if the tab closes** (the clock is on the server). Needs the attempts table.
- **Saved submitted answers and per-point feedback** ("what you missed").
- **The examiner checklist** ("what examiners look for", ticking as the student writes). It needs the approved mark-scheme points, a checking step, and the release gate tested against real marked answers (decisions file section 5). Its on/off switch will be a code setting, off by default. Nothing about it is shown now.

Each table is its own migration PR needing your approval.

## Tests that cover it

- `src/app/exam-simulator-helpers.test.ts`: the time notices (they only change at 10, 5 and 1 minutes) and the plain-words question state.
- `tests/e2e/exam-session-controls.spec.ts`: the grid does not scroll sideways and is 48px or more; each state is in words; flag toggle; the pre-finish note; the clock is not a live region and notices are polite; the low-time state at 320px (icon, words, coral, no sideways overflow); an accessibility check with a flagged question. The earlier Pause and Stop tests still pass.

## Screenshots

Before and after in `docs/design/learner-redesign-v2/screenshots/pr-10/`: the timed paper, and the low-time state, at desktop, phone, phone dark, 320px and desktop dark.

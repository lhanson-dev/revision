# Practice: start screen, pop-up and feedback

**Status:** Practice v2.2, PR 1 of 5 (start screen and pop-up shell) is built on top of the PR 9 feedback bar and retry. Draft, awaiting Founder review.
**Authority:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md` (sections 1 and 7), `docs/design/learner-redesign-v2/data-model-proposal.md` (section 6). Visual source: the Practice redesign, option 1a Quick-fire.

## What the student sees

### The start screen (Practice tab)
- Eyebrow "PRACTICE · {topic}", the heading "Test what you know", then "Right now" with the topic's status badge, "Last practised …" and "Change topic". It names the topic, never the course.
- **Scored card.** Neutral chip "Counts towards Understanding and Exam readiness". "How many?" 5 / 10 / 15, each with "about 8 / 15 / 25 min". "Start {n} questions" and the time estimate. The number never promises more questions than the topic has: if the topic has fewer, the button says so and a note explains. A "What kind?" row of toggle pills (at least one stays on) appears only when the topic has more than one kind of question. Today every topic has multiple choice only, so the row is hidden; it appears when PR 2 and PR 3 add calculations and written answers.
- **Warm-up card.** Chip "Doesn’t count towards Exam readiness". Rows for Flashcards, Formulas and Case study, each with a real count, and only when there is content.
- **REV card** (deep). REV's existing recommendation reason for this topic. If there is none, no card is shown.
- Courses whose packs include a self-marked exam question keep it as one extra row under the Scored card.

### The pop-up
- Every exercise opens in a pop-up: `role="dialog"`, `aria-modal`, focus trapped, Esc or the close button leaves, focus goes back to the button that opened it. The backdrop is the new `--scrim` token over the whole page.
- Desktop: panel up to 900px wide, 40px/48px from the edges (28/24 on tablet). Phone: a full-height sheet from 40px down with rounded top corners.
- Top bar: close button (44px), subject letter mark, then the activity's bar. Questions: a segmented progress strip, "n of N", the topic name and its live status badge. Warm-ups: "{topic} · Warm-up · {activity}".
- **Closing keeps everything.** Each answer is saved as evidence the moment it is checked, so closing loses nothing. The start screen then shows "You have a session open" with **Carry on**. Starting again begins a fresh session.

### Questions in the pop-up (interim)
The question screen inside the pop-up is the existing flow in the new shell: pick an answer, "Check answer", then the feedback bar. PR 2 replaces it with the full v2.2 question screen (levels, "How sure are you?", calculations).

### Feedback bar and retry (from PR 9, unchanged)
- After each answer a bar slides up with an icon and words, the content's own explanation and one button, **Next question**. Right is teal, wrong is coral with "This will come back later in this session." Never error red, never yellow.
- A missed question comes back after at least 3 other questions, labelled "Another go at one you missed". If the session's own questions run out first, anything still waiting is asked before the session ends, so a session never ends with a miss unasked.
- Each answer, including a retry, is saved as normal evidence.

## What did not change, and why
- A missed question does not carry over to another day: the retry queue lives in the session (needs the retry-queue table, a separate migration PR).
- Flashcards, Formulas and Case study content is unchanged (flashcards get their new card in PR 4). They are warm-ups: they do not count towards Exam readiness.
- Learn Quick check (not scored) and Exam Prep are unchanged.

## Code
- `src/app/ui/practice/`: `PracticeStart`, `PracticeDialog` (and bar pieces), `practice.css`. Presentation only.
- `src/app/FocusedLearningWorkspace.tsx`: still owns evidence, retry and the recommendation logic.
- `src/app/practice-start.ts`: plain rules (lengths, time estimates, at-least-one-type, "Last practised").
- `src/app/topic-status.ts` `topicProgressFor`: each topic's status and last-practised time from saved evidence.
- `src/app/practice-retry.ts`: the 3-answer retry rule.

## Tests
- `practice-start.test.ts`, `topic-status.test.ts`, `practice-retry.test.ts`: the plain rules.
- `tests/e2e/practice-start.spec.ts`: start screen content, the question cap, dialog behaviour (focus trap, Esc, focus return), close-and-carry-on keeping saved answers, WCAG A/AA in light and dark, no sideways scroll at 1440/960/620/390/320.
- `tests/e2e/practice-feedback.spec.ts`: feedback tones and the retry journey.

## Screenshots
`docs/design/learner-redesign-v2/screenshots/practice-v2.2-pr1/` (`before/` and `after/`, 1440, 834 and 390, light and dark).

## Still to come (PRs 2 to 5)
Scored multiple choice and calculations with levels and confidence (2), written answers marked by REV (3), the flashcard turn-over card (4), the session summary (5).

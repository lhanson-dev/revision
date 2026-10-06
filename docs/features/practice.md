# Practice: start screen, pop-up and feedback

**Status:** Practice v2.2: PR 1 (start screen and pop-up) is merged; PR 2 (scored multiple choice) is in review.
**Authority:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md` (sections 1 and 7), `docs/design/learner-redesign-v2/data-model-proposal.md` (section 6). Visual source: the Practice redesign, option 1a Quick-fire.

## What the student sees

### The start screen (Practice tab)
- Eyebrow "PRACTICE · {topic}", the heading "Test what you know", then "Right now" with the topic's status badge, "Last practised …" and "Change topic". It names the topic, never the course.
- **Scored card.** Neutral chip "Counts towards Understanding and Exam readiness". "How many?" 5 / 10 / 15, each with "about 8 / 15 / 25 min". "Start {n} questions" and the time estimate. The number never promises more questions than the topic has: if the topic has fewer, the button says so and a note explains. A "What kind?" row of toggle pills (at least one stays on) appears only when the topic has more than one kind of question. Today every topic has multiple choice only, so the row is hidden; it appears once calculations and written answers are added.
- **Warm-up card.** Chip "Doesn’t count towards Exam readiness". Rows for Flashcards, Formulas and Case study, each with a real count, and only when there is content.
- **REV card** (deep). REV's existing recommendation reason for this topic. If there is none, no card is shown.
- Courses whose packs include a self-marked exam question keep it as one extra row under the Scored card.

### The pop-up
- Every exercise opens in a pop-up: `role="dialog"`, `aria-modal`, focus trapped, Esc or the close button leaves, focus goes back to the button that opened it. The backdrop is the new `--scrim` token over the whole page.
- Desktop: panel up to 900px wide, 40px/48px from the edges (28/24 on tablet). Phone: a full-height sheet from 40px down with rounded top corners.
- Top bar: close button (44px), subject letter mark, then the activity's bar. Questions: a segmented progress strip, "n of N", the topic name and its live status badge. Warm-ups: "{topic} · Warm-up · {activity}".
- **Closing keeps everything.** Each answer is saved as evidence the moment it is checked, so closing loses nothing. The start screen then shows "You have a session open" with **Carry on**. Starting again begins a fresh session.

### Scored questions (Practice v2.2, PR 2)

**Where the questions come from.** For each topic, the course pack's own multiple-choice questions plus the AQA 7132 question bank's multiple-choice questions for that spec section (spec section 3.N is the Nth topic). Bank questions carry a neutral "AQA-style practice" chip: they are Revision-authored, not AQA questions. A new session puts questions the student has not seen lately first.

**Level.** A session starts at Recall. Level comes from the question's AO tags (AO1 Recall, AO2 Apply, AO3 or AO4 Analyse; no tag counts as Apply). **Two right answers in a row step up one level; a wrong answer keeps the same level; the level never steps down.** The next question after a step-up says "Stepping up: you got the last 2 right."; after a miss, "Same level, so you can steady it." This is a plain rule, not a model's choice.

**The question screen** (820px column). The bar has the segmented strip (done in dark, current in teal, to come in grey), "n of N", the topic name, its live status, and "▲ up" or "▼ down" for one question after the status moves between Needs work, Nearly there and Got it. Then "QUESTION n", neutral chips for level and marks, the context on the subject tint with its data table, the prompt, and the answer options (letters A to D).

**"How sure are you?"** appears once an answer is picked: **Guessing**, **Fairly sure**, **Certain**. Choosing one checks the answer; there is no Check button. "Choosing one checks your answer."

**Feedback** is pinned at the bottom of the pop-up in a soft tint (never solid coral), with one action: "Next question", or "See how you did" on the last. No Learn or Ask REV links per question.
- Right: "Nice, that's the one." If it was a guess: "Right, but a guess" with "Right, but you guessed. I'll check this one again soon so it sticks."
- Wrong: "Not quite.", then "You picked B: why that option was tempting", then the explanation. Certain and wrong: "You were certain, so this is the one most worth fixing. I'll bring it back later." Otherwise: "I'll bring this back later."

**What comes back.** A miss comes back after at least 3 other questions. A right answer that was only a guess comes back too, once (so the "check again soon" line is true). A second go does not change the level. If a question is still waiting when the session's own questions have run out, it is asked before the session ends.

**Evidence.** Every checked answer is saved with its confidence as schema version 2 (see `docs/technical/Phase 5 Learning Evidence Service.md`). A right guess counts as half in readiness. A certain but wrong answer is a stronger gap through the recommendation: that topic goes first and REV's reason says so. The live status is whatever the existing readiness engine says after each saved answer; **no new formula**. The plan updates without a message. Rule: `10-product-governance/Adaptive Revision Planning.md` section 9.

**Not here yet.** Calculation questions need a `calculation` evidence source, which needs a small database migration (its own approved PR first). Written answers marked by REV are PR 3. The end-of-session screen is interim until the summary (PR 5).

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
- `src/app/practice-session.ts`: levels, the step-up rule, the next question, retries and the end of the session (pure, unit-tested).
- `src/app/practice-questions.ts`: turns the course pack and the AQA bank into one question shape.
- `src/app/ui/practice/PracticeQuestion.tsx`: the question screen. `src/app/ui/FeedbackBar.tsx`: the pinned feedback bar.

## Tests
- `practice-start.test.ts`, `topic-status.test.ts`, `practice-retry.test.ts`: the plain rules.
- `tests/e2e/practice-start.spec.ts`: start screen content, the question cap, dialog behaviour (focus trap, Esc, focus return), close-and-carry-on keeping saved answers, WCAG A/AA in light and dark, no sideways scroll at 1440/960/620/390/320.
- `src/app/practice-session.test.ts`, `practice-questions.test.ts`, `src/engine/evidence/answer-confidence.test.ts`: the level rule, the question pool, the evidence contract and what confidence changes.
- `tests/e2e/practice-feedback.spec.ts`: feedback tones, saved confidence, the retry journey and the level step-up.

## Screenshots
`docs/design/learner-redesign-v2/screenshots/practice-v2.2-pr1/` (`before/` and `after/`, 1440, 834 and 390, light and dark).

## Still to come (PRs 2 to 5)
Scored multiple choice and calculations with levels and confidence (2), written answers marked by REV (3), the flashcard turn-over card (4), the session summary (5).

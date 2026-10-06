# Practice: start screen, pop-up and feedback

**Status:** Practice v2.2: PR 1 (start screen and pop-up) and PR 2 (scored multiple choice) are merged; PR 3 (written answers, switched off until a marker is connected) is merged; PR 4 (flashcards that turn over) is in review.
**Authority:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md` (sections 1 and 7), `docs/design/learner-redesign-v2/data-model-proposal.md` (section 6). Visual source: the Practice redesign, option 1a Quick-fire.

## What the student sees

### The start screen (Practice tab)
- Eyebrow "PRACTICE · {topic}", the heading "Test what you know", then "Right now" with the topic's status badge, "Last practised …" and "Change topic". It names the topic, never the course.
- **Scored card.** Neutral chip "Counts towards Understanding and Exam readiness". "How many?" 5 / 10 / 15, each with "about 8 / 15 / 25 min". "Start {n} questions" and the time estimate. The number never promises more questions than the topic has: if the topic has fewer, the button says so and a note explains. A "What kind?" row of toggle pills (at least one stays on) appears only when the topic has more than one kind of question. It shows "Multiple choice" and "Calculations" for a topic that has calculation questions, and "Written answers" once a marker is connected.
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



### Written answers marked by REV (Practice v2.2, PR 3)

**Switched off until a marker is connected.** Revision has no model marker yet, and Assisted Exam Answer Marking (FI-007) is not Ready. So written questions are only offered when a marker is plugged in (`marker` prop on `FocusedLearningWorkspace`). In the live app none is, so students see exactly what they saw after PR 2: no "Written answers" kind, no marking. Nothing is faked. The screens, rules and evidence format are built and tested on a dev-only fixture page (`practice-fixtures.html`, a stand-in marker).

**Which questions.** Written points-scheme questions from the AQA 7132 bank, up to 6 marks (94 today). Levels-based questions stay in Exam Prep. Single-number "Calculate" questions are kept for calculations. When a marker is connected, "Written answers" appears as a kind on the start screen.

**The screen.** A text box and a teal "Ask REV to mark it", with "Marked against {n} mark points. You can challenge any mark." REV's thinking state ("REV is thinking: checking your answer against each mark point", always as words as well as motion). Then a deep card: "REV MARKED THIS", "{got} / {n}", one row per mark point (tick "Mark given", cross "Not in your answer yet"), one specific note on how to earn the missing mark, "Challenge a mark" and "Next question", and the footer "REV's marking is a guide, not an exam board mark."

**Checked before it is shown.** The marker is a model; its word is not taken as it comes. A mark point is only kept if the marker quotes words that are really in the answer and, where the mark scheme expects a number, an accepted number is in the answer (`src/app/rev-marking.ts`). Software can take a mark away, with a plain note; it never adds one. If the marker's output cannot be used, or REV is unavailable, the answer stays on screen, nothing is saved and the student can try again.

**Challenge a mark.** A box ("Which mark, and why do you think you got it?"), then "Send to REV". REV re-checks (same checks) and replies, either changing the mark or saying honestly why it stays. One challenge per answer.

**Evidence.** `exam_question` with `markingMethod: 'rev_assessed'`, schema version 2, carrying the model version and which mark points were given. **The answer text is not saved**; the challenge text (max 1,000 characters) and its outcome are. A challenge is saved as a new row that replaces the first (`supersedesEvidenceId`); readiness and status count only the latest. It is capped like self-marked work: never counted as independently marked, so confidence cannot be high. No database migration (`source` is unchanged; the new fields live in `payload`).

**In the session.** Full marks count as a right answer for the level; missing marks keep the level. A written answer is not asked again (REV's note says how to earn the missing mark).

**Before a real marker is connected** (each needs your decision; none is made here):
1. FI-007 reaches Ready: validated marking quality, cost and per-student allowance rules.
2. A server function calls the model (provider key, spend cap, which exact model; it is logged with every result).
3. The student's answer text goes to the model provider for marking. It is not stored by Revision, but sending it is a data-protection decision (students include under-18s).
4. How a challenge is rate-limited.

### Warm-up flashcards (Practice v2.2, PR 4)

**The pop-up.** Bar: "{topic} · Warm-up · Flashcards". In the body, "CARD n OF m" (one line, never wraps) and the neutral chip "Warm-up · doesn't count towards Exam readiness". Formulas and Case study use the same pop-up shell, header and warm-up label; their content is unchanged.

**The card turns over.** 3D turn (perspective 1400px, 520ms ease-out). A new card is a new element, so it never turns back; with reduced motion the card switches instantly. Height 360px (400px on a phone).
- Front: "QUESTION", the question in Bricolage 800 (34px, 26px on a phone), "Tap to turn it over"; the whole card is a button. A teal "Show answer" button sits below.
- Back: the subject tint, the question above a divider, then "ANSWER" and the answer (Bricolage 800, 30px, 24px on a phone). The face that is turned away is hidden from screen readers and the keyboard.

**"Did you know it?"** After the card turns: "Choose one, and the next card appears." (the last card says "Choose one to finish the warm-up."). Three equal pills, each with an icon and words and a status tint: **No** (coral), **Partly** (yellow), **Yes** (teal). Choosing one saves flashcard evidence (rating 0, 1 or 2, unchanged) and goes straight to the next card. The keyboard follows: onto "No" when the card turns, onto "Show answer" on the next card.

**A deck is a round of up to 12 cards**, ordered with the **No** cards first, then **Partly**, then cards not seen yet, then **Yes** (a plain rule in `src/app/practice-flashcards.ts`, from the student's saved ratings). The start row says "12 cards · 77 on this topic" when there are more.

**The end.** "You knew {yes} of {n}", tally pills (Yes, Partly, No), and a REV card ("I'll show the ones you weren't sure of first next time…", or an honest line if every card was known). Buttons: "Start the questions" (only when the topic has questions) and "Go through them again" (the next deck, ordered as above).

**At 320px** the warm-up chip may wrap inside the pop-up, because its label is longer than the screen is wide; everywhere else chips stay on one line.

### Calculation questions

A calculation is a single-number "Calculate…" question from the AQA 7132 bank (16 today). The student types the number; **software** checks it against the mark scheme's answer. REV is not involved and no AI runs, so calculations need no marker and are always offered where a topic has one.

- **The screen.** The same question screen as multiple choice (meta row, context and table, the prompt), with a box labelled "Your answer" and the unit beside it ("£", "£m", "%", "days"). "Show your working" is removed from the prompt, because only the final number is checked here; the hint says "Work it out, then type just the number. Your working is not marked here."
- **How sure are you?** appears once the box holds a number the checker can read. Choosing one checks the answer, exactly as for multiple choice.
- **What counts as right** (`src/app/practice-calculation.ts`). The number can be typed the way the exam writes it: "£24.2m", "24.2", "24.2 million" and "24,200,000" are the same answer; "12.5" and "12.5%" are the same. The only allowance is the last decimal place of the mark scheme's answer (12.5 accepts 12.45 to 12.55; 15,150 does not accept 15,157). The roundings the mark scheme itself accepts are also right (2.7 years for 2.67). A percentage typed as a fraction (0.125) is wrong. If no number can be read, it says so and nothing is saved.
- **Feedback.** Right: "Nice, that's the one." with the answer and the worked answer from the mark scheme. Wrong: "Not quite.", "You answered {typed}. The answer is {answer}.", the worked answer line by line, and the same certain-miss note. Misses come back later in the session like any other question; a right guess is asked once more.
- **Evidence.** A new source, `calculation` (schema version 2): `correct`, `enteredValue`, `expectedValue`, `unit`, optional `confidence`. It counts like a quick check: right is 100, a right guess is 50, wrong is 0, and it feeds the same "application" evidence family. A certain-but-wrong calculation moves its topic first in REV's recommendation like a multiple-choice one. There is no partial credit, because no marker awards marks. The migration only widens the allowed list of sources on `learning_evidence`; no rows, policies or grants change.
- **Summary.** Calculations count in "{n} of {m} right". "Go over these" says "You answered {typed}. The answer is {answer}." and shows the working.

**Known gap.** The admin operations metrics function counts quick checks by source `multiple_choice` only, so calculations are not in its "quick checks" count yet. It does not affect students.

### The session summary (Practice v2.2, PR 5)

When the last question of a session is done, the pop-up closes and the Practice tab shows a summary of how the session went (`src/app/practice-summary.ts` works it out, `src/app/ui/practice/PracticeSummary.tsx` shows it). Nothing in it is hard-coded: every line comes from the session's own answers and the topic's saved evidence.

- **Hero.** "SESSION DONE · {topic}" and "{right} of {n} right" (counted on the questions asked fresh, not retries). If there were written answers: "Plus {x} of {y} marks on the written answer."
- **Status card.** "{topic} · Understanding": the status at the start of the session, an arrow, and the status now (a larger badge). "Up from … to …", "Still …" or "Down from …", then "Based on this session and your earlier answers on this topic." Going from "Not started" to a first status is worded as "first evidence", not as a move.
- **Skills map.** One tile per specification item the questions test (up to 10): 5 across on desktop, 3 on tablet, 2 on a phone. Each tile has an icon, the status word and the skill name. Items in the topic that this session could have tested but did not are "Not tested yet" (neutral). Skill status is this session's answers only, using the same bands as the rest of the app (a right guess counts as 50%, a written answer is its marks fraction).
- **Go over these.** Every question missed on the first go, every right answer that was a guess, and every missed written mark point. Each has "Question n · {skill}", the reason ("You picked B: …", "You got this right, but you said you were guessing.", "A mark point is missing: …") and, where the question maps to a Learn page, "Read: {page title}".
- **REV suggests · {mins}.** One next step and why. A certain-but-wrong answer beats a missing written mark point, which beats moving on to the next topic; if none apply, "Practise {topic} again". "Start it" does it; "Not now" hides the card.
- **Two ways out.** "Practise again" (a new session) and "Back to Practice".

Skill names come from the AQA item list (reference only, never teaching copy) in `content/business/aqa-a-level/shared/spec-item-labels.json`, checked against the source list by `scripts/assurance/spec-item-labels.test.mjs`. New design token: `--type-hero-size`. New badge size: `lg`.

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
- `src/app/practice-flashcards.ts`: deck order, ratings and the tally. `src/app/ui/practice/PracticeFlashcard.tsx`: the card and the end screen.
- `src/app/rev-marking.ts`: the marker interface and the checks on its output. `src/app/ui/practice/PracticeWrittenQuestion.tsx`: the written answer screen. `src/practice-fixtures.tsx`: the dev-only fixture page.
- `src/app/ui/practice/PracticeQuestion.tsx`: the question screen. `src/app/ui/FeedbackBar.tsx`: the pinned feedback bar.

## Tests
- `practice-start.test.ts`, `topic-status.test.ts`, `practice-retry.test.ts`: the plain rules.
- `tests/e2e/practice-start.spec.ts`: start screen content, the question cap, dialog behaviour (focus trap, Esc, focus return), close-and-carry-on keeping saved answers, WCAG A/AA in light and dark, no sideways scroll at 1440/960/620/390/320.
- `src/app/practice-session.test.ts`, `practice-questions.test.ts`, `src/engine/evidence/answer-confidence.test.ts`: the level rule, the question pool, the evidence contract and what confidence changes.
- `src/app/practice-flashcards.test.ts`, `tests/e2e/practice-flashcards.spec.ts`: deck order and ratings; the turn, ratings saved as 0/1/2, reduced motion, the end screen, accessibility and no sideways scroll.
- `src/app/rev-marking.test.ts`, `src/engine/evidence/rev-marked-evidence.test.ts`: the checks on REV's output and the evidence contract. `tests/e2e/practice-written.spec.ts`: the written answer journeys on the fixture page.
- `src/app/practice-calculation.ts` and its test: reading what the student typed, units and what counts as right. `tests/e2e/practice-calculations.spec.ts`: the kind pill, the number box, right and wrong feedback, saved evidence, the summary, accessibility and no sideways scroll.
- `src/app/practice-summary.test.ts`, `tests/e2e/practice-summary.spec.ts`: the summary rules and the journeys (content, REV card, Practise again, Back, accessibility, no sideways scroll, tile columns).
- `tests/e2e/practice-feedback.spec.ts`: feedback tones, saved confidence, the retry journey and the level step-up.

## Screenshots
`docs/design/learner-redesign-v2/screenshots/practice-v2.2-pr1/` to `-pr5/` (`before/` and `after/`, 1440, 834 and 390, light and dark).

## Still to come
A real marker for written answers (see the open items under PR 3).

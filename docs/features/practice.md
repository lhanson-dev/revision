# Practice: feedback bar and retry

**Status:** built in PR 9 (draft, awaiting Founder review).
**Authority:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md` (sections 1 and 7), `docs/design/learner-redesign-v2/data-model-proposal.md` (section 6).

## What the student sees (Quick check in Practice)

- After each answer a **feedback bar** slides up (no movement if the student prefers reduced motion). It has an icon and words, the content's own explanation of why, and one button, **Next question**.
  - **Right:** teal, "Correct".
  - **Wrong:** coral, "Not quite", plus "This will come back later in this session."
  - Never error red, and never yellow (yellow means Nearly there only). The old wrong-answer block was a solid orange panel with a "Try again" button.
- The bar is announced to screen readers and sits above the phone tab bar.
- **A missed question comes back after at least 3 other questions.** It is labelled "Another go at one you missed". Getting it right clears it ("You've got it this time. That one is off your list."). Missing it again queues it again.
- Each answer, including a retry, is saved as normal evidence. A retry counts as a real answer, so topic status can reflect that the student has now got it.
- Switching topic starts a fresh queue.

## What did not change, and why

- **A missed question does not carry over to another day.** The retry queue lives in the session. Carrying it over needs the retry-queue table (data model proposal, section 6), its own migration PR needing approval. Until then the wording says "later in this session", because that is all that is true.
- Flashcards, formulas, case studies and exam questions are unchanged.
- The Learn Quick check (not scored, with its own Try again) is unchanged.

## How the queue works

`src/app/practice-retry.ts` holds the rule: a queued question is due after 3 more answers, the longest-waiting one first. The spacing is a plain rule, not a model's choice.

## Tests that cover it

- `src/app/practice-retry.test.ts`: the 3-answer gap, order, clearing, and re-queueing.
- `src/app/ui/learner-v2-components.test.tsx`: the bar's tones, icon and words, and that it never uses error or warning styling.
- `tests/e2e/practice-feedback.spec.ts`: wrong answer shows the coral bar with the explanation and note; the missed question returns after 3 others and is saved as a second answer; accessibility checks for both tones in light and dark.
- The Practice screens in `accessibility.spec.ts`, `horizontal-scroll.spec.ts` and the persistence spec still pass.

## Screenshots

Before and after in `docs/design/learner-redesign-v2/screenshots/pr-09/`: the question, a wrong answer and a right answer at desktop, phone, phone dark, 320px and desktop dark.

## Not done here

- Carrying missed questions to another day (needs the retry-queue table).
- Feedback bars for the other practice activities.

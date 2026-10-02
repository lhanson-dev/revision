# Ask REV

**Status:** built in PR 12 (draft, awaiting Founder review).
**Authority:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md` (section 2 and the addendum), `docs/design/learner-redesign-v2/data-model-proposal.md` (section 10).

## What the student sees

- **A pop-up over the page they are on.** On desktop and tablet it is a panel on the right; on a phone it fills the screen, and closing it returns to exactly where they were. There is **no separate Ask REV page** any more: the old "Expand" button is gone, and the old `#/rev` link opens the pop-up over Home.
- **REV's Living E** at the top shows its state: ready, listening (the student is typing), thinking, responding. Every state is also given in words to screen readers, and shown on screen when the student has reduced motion on.
- **A conversation** with "REV says" and "You said" labels for screen readers, a message box, **Send**, and quick questions (chips) built only from what is true for the student: "What should I do today?", "How am I doing in <their first course>?", and "When are my exams?" only if they have exam dates.
- A quiet line: "REV suggests; you decide. Nothing in your plan changes until you say so. This chat isn't saved after you close it."

## What REV can answer today (no model)

Answers are built by software from the student's own plan, results and exam dates (proposal 10.3, step 1). Nothing is invented.

| Question | Answer |
| --- | --- |
| What should I do today? | One topic chosen by REV's four rules, with its reason, and one button to go and do it |
| How am I doing in X? | The same sentence as the Progress screens ("You've covered 3 of 10 topics. So far: ...") |
| When are my exams? | The next three exam dates the student has set, with how many days away |
| "Focus more on X this week" | The existing plan-change flow: REV says what will change and waits for the student to confirm before anything is saved |

**Anything else:** REV says plainly "I can't answer that one yet", and what it can do. It never makes up an answer. Real answers to other questions need the server function, a model key and the approved-content search, which are not built (see below).

## Safeguarding (launch rule)

Every message is checked first by a plain-text screen. If a student says they are really struggling, REV replies with **fixed, vetted text**: kind, brief, suggests a teacher, parent or trusted adult, lists **Childline (0800 1111)** and **Shout (text SHOUT to 85258)**, and offers to carry on revising. If the message suggests danger, the reply leads with **999**. No model is involved, nothing is sent to a parent or school, and no plan change is offered. **The names and numbers are unverified: Lee or a safeguarding reviewer must check them before launch** (data model proposal 10.13). The screen is a starting list of phrases, to be extended and tested with the release gate (proposal 10.12).

## Not built here (and why)

- **Real model answers**, the cheap-model and strong-model steps, the daily cap and the cost log: need the server function, an Anthropic (or other) key as a server secret, the provider's data terms read, and Lee's approval of the REV function PR. Nothing is built until Lee approves it.
- **Approved-content answers** ("What is break-even?" from the Learn content): need the content-search step; Content Factory material is not yet published into the runtime.
- **"That's not what I meant"**: it only makes sense when there is a higher step to move up to, so it arrives with the model.
- **Saved conversations** (kept 12 months, deletable by the student): need the conversation tables. Today the chat lives only until the pop-up is closed, and says so.
- **"Stuck? Ask REV" carrying where the student is**: only useful once there is a model to use it.
- **Not available during a timed paper**: already true, because Exam Prep hides all navigation.

## Code

`src/app/rev-answers.ts` (pure logic, tested in `rev-answers.test.ts`), `PlannerRevScreen.tsx` (the conversation), `ask-rev-v2.css`, `PlannerRuntime.tsx` (the pop-up and the `#/rev` redirect).

## Tests

- Unit: `rev-answers.test.ts` (safeguarding screen and fixed text, question kinds, each answer, honest empty cases).
- Browser: `tests/e2e/ask-rev.spec.ts` (answer from data with reason and action, honest "can't yet", safeguarding replies, plan change waits for confirmation, no separate page, full screen on a phone at 320 and 390px, accessibility check). Existing Ask REV specs updated for the new message box label.

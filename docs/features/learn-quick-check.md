# Learn Quick check: the content block (PR 3)

**Status:** built in PR 3 (draft, awaiting Founder review). Content Factory change, with Lee's go (3 Oct 2026).
**Authority:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md`, section 6.

## What this adds

A new, optional block type in the Learn page format, `quick-check`, in `content/learn-schema.ts`:

| Field | Meaning |
| --- | --- |
| `question` | The question |
| `options` | Two to six answers, each with an `id` and `text` |
| `correctOptionId` | The `id` of the right answer (checked: it must be one of the options, and ids must be unique) |
| `explanation` | Why the right answer is right. Shown for right and wrong answers alike |

A Learn page can now hold a quick check anywhere among its blocks. On the page it shows as the existing Quick check card: dashed, neutral, tagged **Not scored**, instant feedback that says why, and "Try again" after a wrong answer.

## What it deliberately does not do

- **It is never evidence.** The block has no score, mark or evidence fields, and the card writes nothing (it has no answer callback). It never changes status, Topics covered or readiness.
- **It does not change any existing content.** No Learn page has a quick check yet, and existing pages still pass the schema unchanged. Adding quick checks to pages is Content Factory content work, done through its own process and review, not in this PR.
- **It does not change how the Content Factory generates content.** The generators have their own shapes and do not read this runtime schema.

## Where it shows

`src/app/LearnReadingWorkspace.tsx` draws the block with the shared `QuickCheck` component. Nothing is visible to a student until a page contains a quick-check block.

## Checks

- `content/learn-schema.test.ts`: accepts a good block; rejects fewer than two or more than six options, a correct id that is not an option, duplicate ids and a missing explanation; has no score fields; sits beside existing blocks; all existing Business Learn content is still valid and has no quick checks.
- `src/app/learn-quick-check.test.tsx`: on a Learn page the card shows "Quick check" and "Not scored", does not reveal the answer or explanation before answering, and keeps page order.

## Not built here

- Quick-check content for any course (the Content Factory decides which pages get one, and its reviewers check each).
- Saving or counting quick-check answers. If that is ever wanted, it is a separate Founder decision under Claims and Progress Governance.

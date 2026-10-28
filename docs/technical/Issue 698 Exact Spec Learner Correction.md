# Issue #698 — Business 7132 source-to-learner correction slice

This is an implementation note, not educational sign-off for either whole course.

## Exact source and rights
Business: user-supplied AQA 7132 PDF v2.0 (14 June 2023), SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`.
Psychology: user-supplied AQA 7182 PDF v1.4 (1 September 2025), SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`.
The binary hashes were independently checked against files accessible in the conversation on 28 October 2026. The version-bound metadata and structural paper/section references are in `research/specification-to-learner/aqa-2027-source-manifest.json`. Both PDFs remain `REFERENCE_ONLY`; their protected prose is not a generation corpus.

## Implemented learner-content correction
The existing Fast-Path node `bus-evi-008` is delivered through `content/business/aqa-a-level/shared/learn.ts` and the ordinary validated AQA 7132 content packs, not through a new site route.

- Learn: an original, fully numbered activity-on-arrow example demonstrates the zero-duration dummy and AND-join, forward/backward event times, total float and critical path; it then recalculates the network after a duration change.
- Practice: the existing construction item `p-construction-activity-on-arrow` now asks for all arrows, event times, float, and the critical path, rather than just a vague drawing description. The new `p-amend-activity-on-arrow` asks for a recalculated path and float after a changed activity duration.
- The new example uses event times `(0/0),(2/2),(5/6),(6/6),(8/8)`, original project duration 8 days, C float 1 day; after C rises to 5 days, times `(0/0),(2/2),(7/7),(7/7),(9/9)`, new project duration 9 days and B float 1 day. These are mathematical cross-check fixtures, not official AQA questions.
- Learner evidence caveat: existing Fast-Path question prompts are currently delivered as answer-reveal flashcards. The revised task makes the construction demand explicit, but **does not establish a graded diagram editor or automated drawing competency evidence**. Progress must not infer performance from revelation of the model response.

## Assurance and acceptance boundary
The original AQA PDF section 3.10.3 (physical PDF page 31) calls for understanding/interpreting network diagrams, amendment, critical path and total float. This slice directly addresses those four demands. The numerical routes and backward/forward formulae were independently recalculated during preparation; full repository CI and real-user browser acceptance have **not** been executed or verified in this connector session. Educational independence and appropriate qualified reviewer approval are not established by this document.

**Current outcome:** two targeted Business Learn/Practice corrections proposed for review, not live. No Psychology content or planner code changed. Remaining Issue #698 requirements, full atomic mapping, gap remediation, educational review, learner-site tests and release verification remain open. No provider spend incurred for this slice. Documentation impact: this current implementation evidence note; no changes to the governing Content Factory workflow or learning authority.

## Second targeted correction — AQA 7132 section 3.5.2, break-even charts

The exact Business PDF (physical page 20) requires constructing and interpreting a break-even chart, calculating break-even/contribution/margin-of-safety, and illustrating effects of changes in **price, output and cost** on the chart. The previously published `bus-fin-004` provided verbal chart reading and calculation prompts, but its Practice lacked a complete draw-to-scale chart from given figures and did not distinguish all three separate changes through plotted data.

The new **Revision-original** Learn worked example supplies fixed-cost, total-cost, total-revenue line coordinates, the intersection and margin of safety, and three separately recomputed cases. New Practice cards `construct-break-even-chart-from-data` and `amend-break-even-chart-price-cost-and-output` explicitly require the learner to plot / show coordinates and to reason about changed line slopes versus an output move. The original `bus-fin-004` practice and lesson IDs are unchanged. The new tasks remain shown through the existing answer-reveal flashcard path: this is **guided, self-checked, paper-based construction practice**, not an automated graph-scoring feature. Do not count card reveal as demonstrated graph ability.

Independent arithmetic fixtures checked for the original card: fixed costs £5,000, price £16, variable cost £6 -> contribution £10; break-even 500 whole sandwiches, output 650 -> revenue £10,400, total cost £8,900, contribution £6,500, profit £1,500, margin of safety 150. Alternatives: price £18 -> break-even 416⅔, at least 417 whole sandwiches; variable cost £8 -> break-even 625; output 700 with baseline assumptions -> break-even remains 500, margin of safety 200 and profit £2,000. These are not AQA-owned items.

## Regression checks

`npx vitest run scripts/assurance/issue-698-business-diagram-learning.test.ts` (included in ordinary `npm test`) checks original/revised calculations, exact PDF source metadata, explicit construction tasks and presence of the updated Learn pages and newly generated Practice cards in **all three real Business content packs**. The test asserts source-to-pack wiring and arithmetic, not independently graded construction, full specification completeness, learner persistence or site deployment. CI result and any fixing must be recorded against the exact PR head before merge.

## Documentation impact

This correction changes *current implementation* of two existing Learning Blueprint obligations. It does not alter the governed syllabus scope, Content Factory architecture, learner routes or policy; no new normative source is created. The ordinary technical implementation note is updated in the same branch. Keep historical artifacts unchanged.

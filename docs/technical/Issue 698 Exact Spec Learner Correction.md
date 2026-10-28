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

**Current outcome:** three targeted Business Learn/Practice corrections proposed for review, not live. No Psychology content or planner code changed. Remaining Issue #698 requirements, full atomic mapping, gap remediation, educational review, learner-site tests and release verification remain open. No provider spend incurred for this slice. Documentation impact: this current implementation evidence note; no changes to the governing Content Factory workflow or learning authority.

## Second targeted correction — AQA 7132 section 3.5.2, break-even charts

The exact Business PDF (physical page 20) requires constructing and interpreting a break-even chart, calculating break-even/contribution/margin-of-safety, and illustrating effects of changes in **price, output and cost** on the chart. The previously published `bus-fin-004` provided verbal chart reading and calculation prompts, but its Practice lacked a complete draw-to-scale chart from given figures and did not distinguish all three separate changes through plotted data.

The new **Revision-original** Learn worked example supplies fixed-cost, total-cost, total-revenue line coordinates, the intersection and margin of safety, and three separately recomputed cases. New Practice cards `construct-break-even-chart-from-data` and `amend-break-even-chart-price-cost-and-output` explicitly require the learner to plot / show coordinates and to reason about changed line slopes versus an output move. The original `bus-fin-004` practice and lesson IDs are unchanged. The new tasks remain shown through the existing answer-reveal flashcard path: this is **guided, self-checked, paper-based construction practice**, not an automated graph-scoring feature. Do not count card reveal as demonstrated graph ability.

Independent arithmetic fixtures checked for the original card: fixed costs £5,000, price £16, variable cost £6 -> contribution £10; break-even 500 whole sandwiches, output 650 -> revenue £10,400, total cost £8,900, contribution £6,500, profit £1,500, margin of safety 150. Alternatives: price £18 -> break-even 416⅔, at least 417 whole sandwiches; variable cost £8 -> break-even 625; output 700 with baseline assumptions -> break-even remains 500, margin of safety 200 and profit £2,000. These are not AQA-owned items.

## Regression checks

`npx vitest run scripts/assurance/issue-698-business-diagram-learning.test.ts` (included in ordinary `npm test`) checks original/revised calculations, exact PDF source metadata, explicit construction tasks and presence of the updated Learn pages and newly generated Practice cards in **all three real Business content packs**. The test asserts source-to-pack wiring and arithmetic, not independently graded construction, full specification completeness, learner persistence or site deployment. CI result and any fixing must be recorded against the exact PR head before merge.

## Documentation impact

This correction changes *current implementation* of two existing Learning Blueprint obligations. It does not alter the governed syllabus scope, Content Factory architecture, learner routes or policy; no new normative source is created. The ordinary technical implementation note is updated in the same branch. Keep historical artifacts unchanged.

## Third targeted correction — AQA 7132 section 3.5.2, rolling cash-flow forecasts

The exact Business PDF (physical page 20) requires constructing and analysing cash-flow forecasts, including the timing of cash inflows and outflows. The existing `bus-fin-005` already taught single-period closing cash and payables/receivables timing. It did not require the learner to construct and update a multi-month forecast with the prior period's closing cash carried into the next period, including a negative intermediate balance.

The Revision-original new Learn example models three months with opening £8,000, cash receipts £18,000/£12,000/£22,000, payments £20,000/£19,000/£14,000, net flows −£2,000/−£7,000/+£8,000, closing £6,000/−£1,000/£7,000. An independently recomputed £5,000 February receivable delay to March changes February closing to −£6,000 and March closing remains £7,000. Two new cards require the full forecast and amendment on paper; previous IDs are preserved. The cash timing examples do not assert that profit changes when a receipt date changes.

`npx vitest run scripts/assurance/issue-698-business-cashflow.test.ts` independently calculates the rolling balances and checks the new Learn page and Practice cards are exposed through all three regular Business packs. These remain model-reveal / self-check tasks; they are not graded proof of construction ability.

The financial correction adds no new product capability or publication policy. The canonical path remains `/revision/app/`, with Vite content discovery through `content/**/index.ts`, the ordinary adapter and published course packs. Full PDF requirement enumeration, the independent adversarial A1–A4 assurance, preservation/feedback in a real signed-in student session, all remaining content and Psychology are **outstanding**. This file must not be used as full-course acceptance evidence.

## Actual independently scoreable Practice supplement (Business 3.5)

The existing original Financial question bank is imported through `content/business/aqa-a-level/shared/fast-path-questions.ts` (glob `aqa-7132-3.5/questions/q*.json`), exposed in each canonical AQA 7132 pack and interpreted by `src/app/practice-questions.ts`. Its calculated and multiple-choice items can be scored with the existing Practice controls. This is separate from self-check flashcards.

Three new original, additive, **Limited-confidence pending independent assessment review** records:
- `aqa7132-3.5-q15`: one-mark contextual MCQ on revenue-line slope after a price rise; keyed B;
- `aqa7132-3.5-q16`: one-mark numerical break-even calculation after a variable-cost rise; independently checked 625 whole sandwiches, accepted by existing calculation response logic;
- `aqa7132-3.5-q17`: one-mark contextual cash-flow MCQ on delayed receivables; independently checked February closing cash −£6,000, keyed A.

These are ordinary Practice questions with actual response capture and software marking, not paper-only reveal cards. Their target-item bindings do not by themselves prove full 3.5 or whole-course coverage. `scripts/assurance/issue-698-business-diagram-learning.test.ts` now asserts the question records are accessible as scored Practice through **all three actual published AQA Business packs** and that keys/numerical answers are correct. No original historical question or run record was overwritten.

**Assurance hold:** Fresh-context independent A3 review and broader A-level exam authenticity verification are still necessary before publication, especially for scoring/rubric edge cases. This PR remains draft and does not grant itself a release PASS.

## Course-wide Business asset-linkage audit — executable, not declared coverage

`node scripts/assurance/aqa-7132-learner-crosswalk.mjs --write` enumerates all existing AQA Business 7132 named items from the current 344-item register and loads the actual published 79 Fast-Path lesson assets, self-check flashcards, 231 retained release-bank questions and 17 original 3.5 bank items (14 retained + 3 new). It links each exact `item_id` to its lesson/block, self-check card and the distinct question IDs offered by the existing bank. Where a question can be scored as an MCQ or one-number calculation, it is distinguished from written questions requiring a connected marker or unsupported question modes. It also returns source-section/page from the exact source PDF fingerprint manifest, by-section totals and explicit unlinked IDs.

The output `research/specification-to-learner/aqa-7132-learner-crosswalk.json` is generated only with `--write`; the ordinary `vitest` audit test validates real asset paths without storing a large, soon-stale result in version control. A semantic examiner must then evaluate each cited lesson/task and its required exam skill, including compound obligations; **no keyword match, ID link or count is an educational pass**. Existing authored notes and historical mocks without named-item IDs remain outside this structural counter, and missing links alone do not prove their absence.

The check does not use or distribute AQA PDF passages. It can run with no paid language-model calls. It is the whole-course **diagnostic entry point** for targeted remediation, not a claim of whole-course educational or production completion.

## Measured first whole-course structural output (CI run 40743708850)

The new crosswalk ran successfully in the GitHub CI test worker. Its machine results (against this PR's pre-label-fix content state) were: **344 named requirements**; **79 generated learning nodes**; **585 explanation blocks**; **684 self-check cards**; **248 structured bank questions**; all **344/344** named item IDs bound to at least one generated Learn block and to at least one Practice card or eligible question; **255/344** item IDs also bound to a bank item with either software-scored or marker-dependent written eligibility; **89** item IDs lacked that stronger bank evidence; **zero structural reference defects**.

The 248 bank items divide into 81 presently software-scored items (MCQ/single-number calculation), 97 points-based items that require the governed connected written marker, and 70 items not currently offered as scored Practice (for example an unsupported family or an uncalibrated levels rubric). Do **not** add those groups to make a percentage of demonstrated mastery: some written items may be unavailable when the marker is disconnected and some source items have multiple question links. Authored non-item-mapped content may also contribute valid practice not counted by this crosswalk.

By ten Business subject areas the linked named requirements / named requirements with supported scored-or-marker-dependent question links were: 3.1 32/28; 3.2 21/14; 3.3 42/35; 3.4 31/22; 3.5 35/18; 3.6 46/36; 3.7 53/38; 3.8 13/9; 3.9 41/37; 3.10 30/18. These are diagnostic **link counts**, not examiner-approved semantic coverage or demonstrated student competencies.

The first exact-head CI for this audit failed an existing source label assertion on three new scored question records. Their label was corrected to the established explicit `Revision-authored` pattern. The count and coverage diagnostic itself passed. Fresh CI is required on the updated exact head. Existing unreconciled visual-baseline failures on the AS-level synthetic fixture must be resolved or separately proven unrelated before any request for merge approval.

## Further targeted Business 3.5 scored Practice expansion — q18–q25

Following the first published-linkage diagnostic, eight additional fully original **one-mark, software-marked MCQs** were added to the existing AQA 7132 financial Practice ingestion path without altering the prior 245 question IDs or the existing q15–q17. Every new item is labelled `Revision-authored` and `Limited` pending independent educational review. The items address the specific source demands rather than being added simply to inflate volume:

| Question | Exact specification obligations | Independently checkable answer |
| --- | --- | --- |
| q18 | 3.5.1: cash flow versus profit; cash-flow objectives | B — credit sales can precede cash receipts |
| q19 | 3.5.2: variance analysis; favourable/adverse variances | B — £27,000 − £24,000 = £3,000 adverse cost variance |
| q20 | 3.5.3: debt factoring; advantages/disadvantages and choice of funding | A — accelerate receivables at a cost |
| q21 | 3.5.3: venture capital, crowdfunding, share capital | C — potential specialist advice and ownership dilution |
| q22 | 3.5.4: ways and difficulties of improving cash flow and profit | B — inventory clearance releases cash but can lower margins |
| q23 | 3.5.4: profit improvement and limitations | C — higher unit contribution may be offset by lower volume |
| q24 | 3.5.3: short-/long-term finance, overdrafts and loans | A — funding-maturity mismatch and withdrawal risk |
| q25 | 3.5.1: gross/operating/profit-for-year | C — £315,000 gross → £135,000 operating → £100,000 profit for year |

`scripts/assurance/issue-698-business-finance-scored.test.ts` asserts each new question is actually offered by the normal scored Practice question pool across all three published Business paper packs, has the expected keyed and explained response, carries its mapped requirement ID, and preserves additive IDs. The prior release-bank total becomes **256** (245 retained + 11 new from Issue #698). The original structural crosswalk is recomputed on every test run; its earlier 248-question CI result is a retained point-in-time finding, not a current total after these additions.

This does **not** validate real student answer persistence, provide a full examination-paper simulator, guarantee substantive coverage of every compound requirement, or replace independent educational review. No provider spend was incurred. The remaining course-quality and Psychology obligations on #698 are still open.

## 3.10.3 network analysis — scored Practice route, no new learner feature

Rechecking the exact user-provided AQA 7132 v2.0 PDF (physical page 31) confirms requirements for understanding/interpreting network diagrams, amendment, critical path and total float. In addition to the original network Learn example and self-check graph/diagram tasks, PR #699 now adds **three original standard scored Practice items** under `content-factory/slices/aqa-7132-3.10/questions/`:

- `aqa7132-3.10-q14` (software-scored one-mark MCQ): identify the critical path A–B–D and project duration 8 days from an explicit parallel AND dependency.
- `aqa7132-3.10-q15` (software-scored one-number calculation): total float = latest finish 18 − earliest start 11 − duration 5 = 2 days.
- `aqa7132-3.10-q16` (software-scored one-mark MCQ): after C increases from 3 to 5 days, identify revised critical path A–C–dummy–D, duration 9 days and B's total float of 1 day.

These do **not** automatically mark a student's diagram drawn on paper. The existing self-check construction task remains and is not falsely labelled as objectively graded construction. All questions remain `Limited` confidence until independent educational A3 review.

The existing standard `content/business/aqa-a-level/shared/fast-path-questions.ts` import has been generalized from **3.5 only** to the existing `aqa-7132-*/questions/q*.json` slices, with a fail-closed section/path consistency check. This is a content-ingestion amendment within the canonical `content/**/index.ts` pack and `/revision/app/` runtime; **not** a new student feature or second ingestion system. Original 245 accepted bank records retain their identity. The resulting total is **259 structured bank records**: 245 retained + eleven 3.5 additions + three 3.10 additions. `scripts/assurance/aqa-7132-learner-crosswalk.mjs` now enumerates every existing slice `questions/` directory, and the crosswalk and exact pack ingestion tests assert that the three new network items are discoverable, scored and correctly linked. Existing material and history are not replaced.

**Documentation impact:** Only current site-ingestion technical evidence changes; no normative policy, syllabus or Learning Blueprint behaviour is changed by adding suitably tagged original questions and generalizing file discovery. This document and deterministic assurance tests are committed in the same branch; historical evidence is preserved.

**Acceptance boundary:** Neither the modified content nor the 259-item bank has passed whole-course independent educational review, production deployment or signed-in learner-path verification. Remaining #698 work includes full Business semantic audit and remediation, true option-aware Psychology 7182 content and exam experience, and any unrelated visual baseline mismatch. Do not approve or merge PR #699 solely because the bank count increased.

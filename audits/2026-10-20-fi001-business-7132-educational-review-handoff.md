# FI-001 — Business 7132 original assessment and Psychology 7182 review handoff
**Prepared:** 20 October 2026 | **PR:** #637 | **Status:** INTERNAL SOURCE/KEY REVIEW ONLY — INDEPENDENT A3/A4 AND QUALIFIED EXAMINER SIGN-OFF NOT PERFORMED.
**Canonical runtime:** `/revision/app/` → saved course → Exam Prep; focused recommendations share exact content IDs.
**Exact review SHA:** Reviewer must enter the final candidate SHA from PR #637 before each signed decision. A changed affected content file invalidates its earlier sign-off.

## Permitted source and rights references
- AQA Business 7132 [specification at a glance](https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/specification-at-a-glance), [scheme of assessment](https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/scheme-of-assessment) and [assessment resources](https://www.aqa.org.uk/subjects/business/a-level/business-7132/assessment-resources).
- AQA Psychology 7182 [specification](https://www.aqa.org.uk/subjects/psychology/a-level/psychology-7182/specification), especially compulsory sections and the mutually exclusive three Paper 3 option groups.
- Approved repository source/provenance: `content/business/aqa-a-level/SOURCE_AND_COVERAGE.md` and shared `exam-papers.ts`; original 44 question entries in `paper-{1,2,3}/exam.ts`; the source-licensing register and `80-company-workflows/Content Accuracy Assurance Gate.md`.
- The original Revision question text may be provided to an authorised reviewer with source/rights approval. AQA specification and mark schemes are **reference links**, not permission to redistribute protected official paper content or introduce substantial text into an AI worker.

## Assured mechanical envelope, not educational approval
Paper 1: 15 one-mark MCQs + 35 compulsory short-answer marks + one 25-mark choice from Section C + one 25-mark choice from Section D = 100 attempted / 150 printed marks. 26 printed item entries, 24 attempted. Paper 2: 12 compulsory parts, three contexts and 33+33+34 marks. Paper 3: six compulsory integrated case items / 100 marks. These were checked for internally modelled totals, IDs, AO sums and selected arithmetic, **not** for externally calibrated responses.
The PR adds explicit answer keys to all 15 original Paper 1 MCQs and prevents an incorrect choice from obtaining positive self-awarded marks. It stores a correct/incorrect `multiple_choice` observation rather than manufactured `exam_question` self-marks. This is a correctness-control change, not a qualified AQA examiner check of the author-authored questions.
The original simulations are still labelled Revision-authored, not official AQA.

## Exact 44-entry A3 review ledger
| Batch | Exact items | Primary fresh-context challenge |
|---|---|---|
| Paper 1 objective | `p1-q01` through `p1-q15` (15) | Correct option and all three alternatives for each, plausible near-misses, specification relevance, unambiguous single right answer; confirm authored `correctOptionLabel` |
| Paper 1 short | `p1-q16` through `p1-q22` (7) | Break-even 12,000 units, ROCE 15%, expected net gain £50,000, valid method alternatives, command/mark/AO authenticity |
| Paper 1 Section C | `p1-q23-essay-a`, `p1-q23-essay-b` (2) | Real distinct 25-mark alternatives, Ansoff vs Porter, fair AO4 balance, nonexclusive justified conclusions |
| Paper 1 Section D | `p1-q24-essay-a`, `p1-q24-essay-b` (2) | Real distinct 25-mark alternatives, culture/change vs emergent strategy, balanced argument and full 25-mark levels |
| Paper 2 data response 1 | `p2-q01`–`p2-q04` (4) | SS 8% margin, sustainable supplier, utilisation 93%, 14-mark price recommendation; own correct case data |
| Paper 2 data response 2 | `p2-q05`–`p2-q08` (4) | MR 30% gearing, decentralisation, acquisition synergy, 14-mark acquisition trade-off; no mixed case assumptions |
| Paper 2 data response 3 | `p2-q09`–`p2-q12` (4) | AC £1.68m EV and £0.58m net gain, alliance/data use, competing strategic opportunities, 14-mark AO4 judgement |
| Paper 3 integrated case | `p3-q01`–`p3-q06` (6) | CM contextual analysis, 10% operating margin/15% ROCE/1.5 current ratio/37.5% gearing; supplied rather than derived payback, ARR, NPV; 16/20/24-mark judgements |
**Total:** 15+7+2+2+4+4+4+6 = 44.

### Specific adversarial prompts for reviewer
1. **MCQ discrimination:** Some alternatives, e.g. `p1-q04` (JIT vs 'luxury products'/'high gearing') and `p1-q10` (Handy's culture type vs 'JIT'/'matrix pricing'), are obviously unrelated to the tested concept. Flag whether those are educationally poor distractors, even if the authored correct answer is valid. These are provisional design-quality observations requiring reviewed correction, *not* erroneous key assertions.
2. **Writing calibration:** `p1-q23-essay-a/b`, `p1-q24-essay-a/b`; Paper 2 `p2-q04`, `p2-q08`, `p2-q12`; Paper 3 `p3-q03`–`p3-q06` require actually usable 0–full-mark levels and anchor examples, plausible opposing conclusions, evidence of contextual evaluation. Existing prose marking guidance must **not** be represented as a calibrated, examiner-valid mark scheme.
3. **Source validity:** Paper 2 uses one app stimulus field with *three independent businesses*. Challenge whether the context displayed during a focused exact Start is readable and clearly binds to its own item. Paper 3 investment figures are stated forecasts, not verifiable results derived from shown cash flow; keep that distinction explicit.
4. **AQA/Revision separation:** all items must be clearly presented as original exam-style practice. Do not infer official AO splits or grade predictions from internal metadata.
5. **Psychology 7182:** independently confirm compulsory topic identity and each actual selected one-of-three Paper 3 option group; test selected/unselected permutations and correct scoping, paper deadlines and cross-paper carryover. No unsupported option may enter planner or self-assessed evidence.

## A3/A4 item review record (one row for each exact item)
| Content ID | Exact git blob/SHA | AQA reference | Question/key/case verdict | Mark/AO/command verdict | Alternative valid response | Severity + rationale | Change PR/commit + retest | Independent reviewer |
|---|---|---|---|---|---|---|---|---|
| (copy 44 IDs above one by one) | | | PASS/FAIL | PASS/FAIL/NOT ASSURED | | blocking/material/minor/none | | |

**A4 output required:** fixed question version; item-appropriate marking points and/or levels-of-response descriptors (including AO allocation and marks), at least a strong, mid-range, weak and plausible alternative answer where judgement heavy; expected mark range; known ambiguity; disagreement/calibration record from professional review. A brief list of indicative points is not A4 assurance. The self-assessed mode is permitted only with appropriately limited educational evidence; never call it independent examination performance.

## Reviewer acceptance checklist / signatures
- [ ] Source/provenance and licensing verified for exact exported questions and references
- [ ] Every one of 44 items independently challenged and issue register retained
- [ ] All 15 MCQ correct keys and distractors reviewed and any material weaknesses fixed
- [ ] Both essay alternatives per section and AQA format reviewed
- [ ] Every arithmetic, case premise and assessment objective cross-checked
- [ ] Written rubric, level, anchor and legitimate alternative treatment calibrated
- [ ] Psychology valid option combinations independently confirmed
- [ ] Relevant changes rerun through exact affected content and full required CI
- [ ] Named independent educational specialist, expertise, date, exact SHA and approval (or HOLD) recorded

**Current qualified examiner review:** NOT DONE. **A3 independent fresh-context adversarial review:** NOT DONE. **A4 marking/anchor calibration:** NOT DONE. Until all required gates pass or the affected assessment use is safely excluded, do not claim full educational acceptance or an unsupervised real-use pilot.

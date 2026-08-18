# AQA A-level Business 7132 — Human Subject Review Pack

## Reviewer purpose

Revision is asking you to act as an independent subject specialist. Your job is to identify anything that could teach a student the wrong Business knowledge, calculation, exam habit or assessment expectation.

This is **not** a copy-editing exercise and it is not a request to approve AI-generated wording because it sounds plausible. Challenge it against current AQA authority and your professional subject/exam experience.

## Course under review

- Awarding body: AQA
- Qualification: Advanced Level GCE in Business
- Specification: 7132
- Cohort: students taking exams in 2027
- Components: Paper 1 Business 1, Paper 2 Business 2, Paper 3 Business 3
- Review repository/PR: `lhanson-dev/revision` PR #44
- Current product status at preparation: `preview`; not yet commercially benchmarked

AQA currently describes 7132 as the outgoing specification for cohorts taking exams in 2027. If that is no longer true when you review this pack, stop and flag the review as blocked.

## Official sources to use as authority

Start from the current AQA 7132 specification page:

- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification

Then use the linked current official pages for:

- specification at a glance / all three paper structures;
- subject-content overview;
- sections 3.1–3.10;
- scheme of assessment / AO1–AO4;
- quantitative-skills annex;
- assessment resources, specimen/past papers and mark schemes where appropriate;
- AQA Business command-word guidance.

Do not treat Revision, another revision website, a textbook or an AI answer as authority over AQA.

## What Revision currently contains

The three paper packs share one ten-area course layer:

1. What is Business?
2. Managers, Leadership & Decision Making
3. Marketing Management
4. Operational Management
5. Financial Management
6. Human Resource Management
7. Analysing the Strategic Position
8. Choosing Strategic Direction
9. Strategic Methods
10. Managing Strategic Change

Current shared content:

- 31 formula/calculation records;
- 22 cross-topic reasoning links;
- 100 flashcards;
- 50 quick-check MCQs;
- 25 quantitative/data drills;
- six guided cases;
- nine exam-technique guides.

Paper-specific content:

- one original 100-mark Paper 1 simulator;
- one original 100-mark Paper 2 simulator;
- one original 100-mark Paper 3 simulator.

All cases/questions/simulations are Revision-authored practice. They must not be treated as official AQA papers or mark schemes.

## Repository content inventory

### Evidence and assurance

- `SOURCE_AND_COVERAGE.md`
- `ASSURANCE_2026-08-18.md`
- `INDEPENDENT_REVIEW_BRIEF.md`
- `content.test.ts`

### Shared learner content

- `shared/topics.ts`
- `shared/learning.ts`
- `shared/flashcards.ts`
- `shared/questions.ts`
- `shared/quantitative.ts`
- `shared/network-practice.ts`
- `shared/cases.ts`
- `shared/exam-technique.ts`

### Paper 1

- `paper-1/manifest.ts`
- `paper-1/exam.ts`
- `paper-1/index.ts`

### Paper 2

- `paper-2/manifest.ts`
- `paper-2/exam.ts`
- `paper-2/index.ts`

### Paper 3

- `paper-3/manifest.ts`
- `paper-3/exam.ts`
- `paper-3/index.ts`

## Mandatory full-review areas

Please review in full:

- all ten topic/learning areas;
- all formulas and quantitative methods;
- all exam-technique guidance;
- all six guided cases and their guidance;
- all three full simulations and all associated marking guidance;
- paper metadata and paper-format claims.

For the 100 flashcards and 50 MCQs, a documented risk-based sample is acceptable initially, but your sample must include every topic and high-risk calculation/model area. If you find one material misconception or a repeated pattern, escalate that entire content class to full review.

## High-risk checks

### Curriculum correctness

Confirm that:

- every examinable concept is in the correct 7132 scope;
- no material 7132 requirement is omitted;
- no superseded AQA requirement is being taught because an older teaching resource still mentions it;
- A-level-only strategic topics are accurate and sufficiently explained.

### Financial and quantitative accuracy

Check especially:

- ROCE;
- current ratio;
- gearing;
- receivables days;
- payables days;
- inventory turnover;
- contribution, break-even and margin of safety;
- expected value and net gain;
- payback;
- ARR;
- NPV;
- index-number interpretation;
- network analysis, critical path and amendment of networks.

Recalculate examples rather than assuming the stored answer is right.

### Business models and theories

Check use of:

- Tannenbaum–Schmidt;
- Taylor, Maslow and Herzberg;
- Boston Matrix and product life cycle;
- Elkington Triple Bottom Line;
- Carroll CSR pyramid;
- Porter five forces;
- Ansoff matrix;
- Porter low cost / differentiation / focus;
- Lewin force-field analysis;
- Kotter and Schlesinger resistance/change approaches;
- Handy culture types;
- planned/emergent strategy and strategic drift.

Flag any place where a model is presented as a guaranteed rule rather than a framework whose value depends on context.

## Paper-specific review

### Paper 1

AQA’s headline structure is 15 MCQ marks, 35 short-answer marks and two 25-mark essay sections, each with a choice of one from two. Review whether the Revision simulator:

- reflects that structure without misleading the learner;
- uses plausible short-answer and essay demand;
- develops AO3/AO4 appropriately in longer questions;
- gives guidance that would improve genuine AQA performance rather than reward a formulaic essay template.

### Paper 2

AQA uses three compulsory data-response questions, approximately 33 marks each. Revision’s current exam engine has one stimulus field, so the simulation presents three clearly separated independent contexts inside that field.

Review whether:

- the three contexts feel genuinely separate;
- data is used meaningfully rather than decoratively;
- calculations/application/analysis/evaluation feel consistent with A-level demand;
- the current presentation limitation is sufficiently transparent and does not teach the wrong paper layout.

### Paper 3

AQA uses one compulsory case study followed by approximately six questions. Review whether the Revision simulator:

- rewards integrated/holistic Business thinking;
- has sufficient AO3/AO4 demand;
- uses the case evidence throughout;
- requires prioritisation and evidence-based judgement rather than generic evaluation.

## Previous assurance findings to target

The internal source-led review has already identified and addressed one material gap: network-analysis content originally lacked explicit practice in amending a network when activity timing changes. A dedicated amendment drill was added.

Known limitations still requiring external scrutiny:

1. Exact strategic financial-ratio conventions should be explicitly checked against appropriate AQA assessment/teaching evidence.
2. Paper 2’s three contexts share the current single-stimulus UI field; this is a product presentation approximation, not an exact paper replica.
3. There is currently one full simulator per paper. Assess whether the content is accurate and authentic; separately note whether you recommend more repetition before commercial benchmark status.

## Issue severity

Use:

- **Blocking** — qualification/course identity or source authority cannot be trusted; learner use should stop.
- **Material** — could teach an incorrect rule, calculation, exam expectation or materially misleading simplification.
- **Minor** — local wording/precision issue that does not materially misteach.
- **No issue** — optional, to evidence a specifically checked high-risk item.

## Issue log

| ID | Content/item | Severity | Finding | AQA/professional verification | Recommended correction | Resolution status |
|---|---|---|---|---|---|---|
| | | | | | | |

Add rows as required. Include enough detail for Revision to locate and fix the exact item.

## Reviewer sign-off

Reviewer name: ______________________________

Professional role / relevant experience: ______________________________

Date: ______________________________

Version / PR head reviewed: ______________________________

Areas reviewed in full: ______________________________

Areas sampled and sampling approach: ______________________________

Choose one final decision:

- [ ] **PASS** — no unresolved blocking/material findings.
- [ ] **CONDITIONAL PASS** — suitable for the stated use, with only documented non-critical limitations.
- [ ] **FAIL / HOLD** — blocking/material issues remain.

Would you recommend this pack as a commercial teaching benchmark after all listed corrections are made?

- [ ] Yes
- [ ] Not yet
- [ ] No

Key reasons / conditions:

____________________________________________________________________

____________________________________________________________________

____________________________________________________________________

## What happens after review

Revision will record every blocking/material finding, fix the content on a governed branch, rerun deterministic and structural assurance, and retain the review outcome as evidence. Historical review findings will not be rewritten to pretend they never occurred.
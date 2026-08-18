# AQA A-level Business 7132 — Content Accuracy Assurance Record

**Assurance date:** 2026-08-18  
**PR:** #44  
**Branch:** `content/aqa-a-level-business-7132`  
**Packs:** `business-aqa-a-level-7132-paper-1`, `business-aqa-a-level-7132-paper-2`, `business-aqa-a-level-7132-paper-3`  
**Governing control:** `80-company-workflows/Content Accuracy Assurance Gate.md`

## Current decision

**HOLD AT PREVIEW pending the mandatory fresh-context A2/A3 adversarial review and successful CI.**

The source-factual and deterministic checks recorded below support the content strongly enough to proceed to the independent review stage. They do **not** satisfy the independence rule by themselves because the same project working context generated much of the learner-facing material.

Do not change the three manifests from `preview` to `available` until:

1. a fresh review context receives the exact content, approved sources and coverage blueprint and returns the required issue register;
2. all blocking/material findings from that review are resolved;
3. CI completes successfully on the remediated head;
4. the final assurance record is appended with the independent review outcome.

Human subject-specialist review remains a separate later requirement before commercial benchmark status.

## A1 — source-factual verification

### Result: PASS for the source-factual scope checked

Primary authority used is recorded in `SOURCE_AND_COVERAGE.md` and is headed by the current AQA 7132 specification, subject-content pages, scheme of assessment and quantitative-skills annex.

Verified course facts include:

- AQA identifies 7132 as the outgoing A-level Business specification to continue using for cohorts taking exams in 2027;
- the course contains ten subject areas, 3.1 through 3.10;
- all three papers may assess all course content;
- Papers 1, 2 and 3 are each two hours, 100 marks and 33.3% of the qualification;
- Paper 1 contains 15 marks of MCQs, 35 marks of short answers and two 25-mark essay sections, each with a choice of one from two;
- Paper 2 contains three compulsory data-response questions worth approximately 33 marks each and each made up of three or four parts;
- Paper 3 contains one compulsory case study followed by approximately six questions;
- AQA requires quantitative skills including ratios, percentages, index interpretation, cost/revenue/profit/break-even and investment-appraisal outcomes, with at least 10% of overall A-level marks assessing quantitative skills;
- strategic-position content includes ROCE, current ratio, gearing, payables days, receivables days, inventory turnover, Porter’s five forces and payback/ARR/NPV;
- strategic-direction content includes Ansoff and Porter low-cost/differentiation/focus positioning;
- strategic-methods content includes scale, scope, synergy, overtrading, mergers/takeovers/ventures/franchising, integration, innovation, internationalisation and digital technology;
- strategic-change content includes Lewin, Kotter and Schlesinger, Handy, network analysis including amendment of network diagrams/critical path/total float, planned v emergent strategy, drift and contingency/crisis planning.

The first six topic areas are co-teachable foundations also present in the AS specification, while the A-level pack deliberately adds the four strategic areas rather than treating 7132 as merely a longer AS paper.

## Specification-coverage result

All ten official areas have an owned Revision topic and learner-facing coverage in the shared course layer.

A focused source challenge found one narrow omission during this pass: network analysis initially taught interpretation and critical path but did not explicitly practise **amendment of a network after timings change**, which AQA names directly. This has been remediated with `shared/network-practice.ts` and is included in all three paper packs.

No unresolved material curriculum omission has been identified in this source-led pass.

## A2 — derived educational explanation

### Current result: READY FOR INDEPENDENT REVIEW; NOT YET PASSED

The shared learner layer currently contains:

- 10 topic areas with plain-English learning points;
- 31 formula records;
- 22 cross-topic reasoning links;
- 100 active-recall flashcards;
- 50 quick-check MCQs;
- 25 quantitative/data drills including explicit network-amendment practice;
- 9 exam-technique/command-word guides.

Same-context checking has challenged the material for:

- drift outside 7132;
- false absolutes in Business interpretation;
- confusion between an analytical model and an automatic decision rule;
- outdated content visible in older AQA teaching resources;
- conflation of AQA requirements with general Business knowledge.

Notable safeguards in the content include:

- PED and YED are described as interpretation requirements rather than calculation requirements;
- ratios and investment-appraisal measures are repeatedly presented as evidence requiring context, not automatic good/bad thresholds;
- strategy models such as SWOT, Ansoff, Porter and force-field analysis are presented as decision frameworks, not predictors;
- the pack does not teach Kaplan and Norton or sensitivity analysis merely because older AQA teaching material still contains historical paragraphs explicitly labelled as relevant only to 2024;
- network-analysis practice avoids relying on the malformed total-float expression visible in one current web rendering and instead teaches the concept, critical path and a deterministic amendment exercise.

The mandatory fresh-context adversarial pass remains outstanding.

## A3 — original exam practice

### Current result: READY FOR INDEPENDENT REVIEW; NOT YET PASSED

The pack contains:

- six Revision-authored guided cases spanning manufacturing, services, small business, PLCs, UK/global contexts, technology, internationalisation, strategic change and capital investment;
- one original 100-mark simulation for each of Papers 1, 2 and 3;
- marking guidance labelled as Revision guidance rather than an official AQA mark scheme.

### Paper-structure checks

**Paper 1**
- 15 × 1-mark MCQs = 15 marks;
- short-answer section = 35 marks;
- Section C essay choice = 25 marks;
- Section D essay choice = 25 marks;
- total = 100 marks.

Stored Revision AO profile: AO1 30 / AO2 30 / AO3 21 / AO4 19.

**Paper 2**
- data-response block 1 = 33 marks;
- data-response block 2 = 33 marks;
- data-response block 3 = 34 marks;
- total = 100 marks.

Stored Revision AO profile: AO1 21 / AO2 30 / AO3 29 / AO4 20.

The current exam schema stores one `caseHtml`, so the three official-style independent data-response contexts are presented as three clearly separated stimulus blocks within that field. The learner-facing subtitle explicitly says this is an original AQA-aligned simulation and not an exact official paper-layout replica.

**Paper 3**
- six integrated case-study questions: 12 + 12 + 16 + 16 + 20 + 24 = 100 marks.

Stored Revision AO profile: AO1 20 / AO2 18 / AO3 31 / AO4 31, deliberately reflecting Paper 3’s stronger analysis/evaluation demand.

Revision AO allocations are internal design metadata and are not represented as official AQA per-question allocations.

## Deterministic verification

The following stored calculations were independently recomputed rather than trusted from generated prose.

### Quick checks / shared drills

- £680,000 − £612,000 = £68,000 profit;
- 8m shares × £2.75 = £22m market capitalisation;
- 0.7 × £140k + 0.3 × £20k = £104k expected value;
- £9m ÷ £60m × 100 = 15% market share;
- 42,000 ÷ 50,000 × 100 = 84% capacity utilisation;
- £360,000 ÷ 90,000 = £4 unit cost;
- £270,000 ÷ £18 = 15,000 units break-even;
- £22,000 + £74,000 − £81,000 = £15,000 closing cash;
- £2.4m ÷ £12m × 100 = 20% employee-cost percentage;
- £3m ÷ £20m × 100 = 15% ROCE;
- £4.8m ÷ £3.2m = 1.5:1 current ratio;
- £9m ÷ £30m × 100 = 30% gearing;
- £7.2m ÷ £48m × 100 = 15% market share;
- (£58m − £50m) ÷ £50m × 100 = 16% market growth;
- decision-tree expected value = £168,000 and net gain = £58,000;
- 2,160 ÷ 2,400 × 100 = 90% capacity utilisation;
- £525,000 ÷ 75,000 = £7 unit cost;
- £180,000 ÷ (£27 − £12) = 12,000 units break-even;
- 15,500 − 12,000 = 3,500-unit margin of safety;
- £18,000 + £62,000 − £75,000 = £5,000 closing cash;
- £840,000 ÷ £12m × 100 = 7% operating margin;
- 42 ÷ 280 × 100 = 15% labour turnover;
- £2.1m ÷ £8.4m × 100 = 25% employee-cost percentage;
- £2.4m ÷ £16m × 100 = 15% ROCE;
- £5.4m ÷ £3.6m = 1.5:1 current ratio;
- £7.5m ÷ £25m × 100 = 30% gearing;
- £2.4m ÷ £18m × 365 ≈ 48.7 receivables days;
- £1.6m ÷ £9.6m × 365 ≈ 60.8 payables days;
- £9.6m ÷ £1.2m = 8 inventory turns per year;
- payback example ≈ 2 years 7 months;
- ARR example = 12.5%;
- NPV example = £754,000 present value − £600,000 investment = +£154,000;
- network amendment: 18-day path + 7-day change = 25 days, overtaking the unchanged 23-day path;
- productivity comparison: 200 versus 250 units/employee = 25% higher for the second site.

### Simulator calculations

Paper 1:
- £192,000 ÷ (£40 − £24) = 12,000 units break-even;
- £3.6m ÷ £24m × 100 = 15% ROCE;
- decision-tree EV £140,000; net gain £50,000.

Paper 2:
- Solace operating margin = 8%;
- MetroRide gearing = 30%;
- Aster EV = £1.68m; net gain = £0.58m.

Paper 3:
- Cedar operating margin = 10%;
- ROCE = 15%;
- current ratio = 1.5:1;
- gearing = 37.5%.

No arithmetic contradiction was found in the checked learner-facing numerical content.

## Issue register

| ID | Class | Severity | Finding | Resolution |
|---|---|---|---|---|
| ALB-001 | A1/A2 | material before fix | Network coverage did not explicitly practise amendment of a network diagram/timings, although AQA 3.10 explicitly requires amendment. | Added `shared/network-practice.ts`, wired into all three packs and added structural count coverage. Resolved. |
| ALB-002 | A3 | minor/known limitation | Paper 2’s current Revision schema has one stimulus field while AQA Paper 2 uses three data-response questions. | Three independent stimuli are clearly separated inside the field and the simulation is explicitly labelled original/AQA-aligned, not an exact paper-layout replica. Accepted pilot limitation. |
| ALB-003 | A1/A2 | review focus | AQA’s current HTML specification names the required strategic ratios but does not expose formula definitions on that page. Revision uses the conventional 7132 Business formula set in its learner records. | Calculation examples are internally consistent; formula convention must be explicitly checked in the fresh-context/human review against appropriate AQA assessment/teaching evidence. Open review focus; not treated as a known contradiction. |
| ALB-004 | A2/A3 | blocking publication control | Same project context has generated and source-checked much of the material. Under the approved gate this cannot count as the final adversarial reviewer. | Keep packs `preview`. Run the mandatory fresh-context review and resolve all material findings before `available`. Open. |
| ALB-005 | CI | blocking publication control | Latest CI attempt failed inside `npm install` with npm internal error `Cannot read properties of null (reading 'edgesOut')` before typecheck/lint/tests/build. | Treat as no CI result, not a content failure or pass. A subsequent branch commit must trigger a clean rerun. Open until green. |

## Depth position

For the restricted pilot, the course now has broad specification coverage and varied practice across the full qualification. A deliberate residual depth limitation remains: there is currently **one full simulation per paper**. This is sufficient to validate the new A-level course structure, but additional full-paper variants and worked diagnostic responses should be considered before this pack becomes the mature commercial benchmark.

## Human review status

**Pending.** A qualified Business teacher/examiner/subject specialist must review the benchmark pack before Revision uses it to support broad commercial teaching-quality claims. The reviewer pack should focus particularly on:

- exact financial-ratio conventions;
- authenticity of Paper 1 essay, Paper 2 data-response and Paper 3 integrated-case demand;
- marking-guidance nuance;
- any Business simplification that could teach a wrong rule;
- whether one simulator per paper is sufficient before benchmark promotion.

## Revalidation triggers

Re-run this gate if:

- AQA changes or withdraws 7132 or the course is proposed for a cohort after 2027;
- material learner content is changed;
- the independent/human review identifies a systemic issue;
- Revision changes its assessment/feedback model;
- additional simulations are promoted into the assured pack.

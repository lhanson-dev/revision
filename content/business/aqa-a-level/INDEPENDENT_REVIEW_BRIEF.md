# AQA A-level Business 7132 — Fresh-Context Adversarial Review Brief

## Purpose

This brief is for the mandatory independent pilot reviewer required by `Content Accuracy Assurance Gate.md`.

The reviewer must operate in a **fresh context that did not generate this pack**. The objective is to find errors, not improve style.

## Review target

- Repository: `lhanson-dev/revision`
- PR: #44
- Branch: `content/aqa-a-level-business-7132`
- Qualification: AQA Advanced Level GCE in Business
- Specification: 7132
- Components: Paper 1, Paper 2, Paper 3
- Target cohort: exams in 2027

Read the current PR head, not an older commit. If the PR head changes during review, record the reviewed SHA and request re-review of changed learner-facing files.

## Mandatory authority

Use the current official AQA 7132 specification as primary authority. At minimum check:

1. specification landing page and current/outgoing status;
2. specification at a glance;
3. subject-content overview;
4. all ten subject-content sections 3.1–3.10;
5. scheme of assessment;
6. quantitative-skills annex;
7. official AQA command-word guidance;
8. official assessment/teaching resources where needed to verify formula conventions, paper demand or marking style.

Do not use general Business knowledge or a commercial revision site to override AQA.

## Learner-facing files to inspect

### Shared course layer

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

### Supporting evidence

- `SOURCE_AND_COVERAGE.md`
- `ASSURANCE_2026-08-18.md`
- `content.test.ts`

## A1 checks — source facts

Actively look for:

- a specification topic that is omitted, partly covered or moved into the wrong course area;
- material that belongs to a different AQA specification/version;
- outdated requirements accidentally retained from older AQA resources;
- wrong paper duration, marks, structure or compulsory/choice rules;
- incorrect model/theorist names or required subcomponents;
- incorrect claims about whether a skill must be calculated or only interpreted;
- incorrect financial-ratio or investment-appraisal formula conventions;
- any statement presented as an AQA requirement that AQA does not support.

## A2 checks — derived teaching/explanation

For every material topic group, sample and challenge learner wording for:

- factual distortion;
- misleading simplification;
- missing condition that changes the meaning;
- false certainty in a context-dependent Business judgement;
- a model presented as a guaranteed decision rule;
- terminology that would teach the learner the wrong exam habit;
- formula or ratio explanations inconsistent with AQA assessment convention.

High-risk review areas include:

- financial ratios and capital employed;
- investment appraisal;
- PED/YED requirements;
- Porter/Ansoff use;
- economies of scale/scope, synergy and overtrading;
- international entry/offshoring/reshoring;
- Kotter and Schlesinger;
- Handy cultures;
- network analysis and total float;
- planned/emergent strategy and strategic drift.

## A3 checks — original practice

Review all six guided cases and all three full simulations for:

- invented facts that are internally inconsistent;
- implausible numerical relationships;
- calculations whose stored answer/guidance is wrong;
- assessed concepts outside 7132;
- question demand inconsistent with the command word;
- marking guidance that invents an official AQA rule;
- paper structures that could mislead a learner about the real assessment;
- AO balance that is implausible for the paper even though Revision allocations are not official AQA allocations;
- weak or false application chains;
- evaluation guidance that rewards generic conclusions rather than evidence-based judgement.

Specific structure checks:

- Paper 1 must preserve 15 MCQ marks + 35 short-answer marks + two 25-mark essay choices;
- Paper 2 must represent three compulsory data-response questions totalling 100 marks and acknowledge the current one-stimulus-field UI limitation;
- Paper 3 should use one integrated compulsory case followed by approximately six questions and should have substantial AO3/AO4 demand.

## Deterministic recheck

Do not trust the previous arithmetic record. Independently recompute all numerical answers you encounter, especially:

- market share/growth/index interpretation;
- expected value/net gain;
- capacity/productivity/unit cost;
- contribution/break-even/margin of safety;
- cash flow/profitability;
- labour ratios;
- ROCE/current ratio/gearing/efficiency ratios;
- payback/ARR/NPV;
- simulator calculations;
- network path amendment;
- all exam mark totals and AO totals.

## Required issue register

Return a table with one row per finding:

| ID | Content/file/item | Severity | Type | Finding | Verification source/calculation | Required correction | Status |
|---|---|---|---|---|---|---|---|

Severity must be one of:

- `blocking` — course/paper identity, authority or safety of learner use is unreliable;
- `material` — could teach a wrong rule, produce a wrong answer or materially misrepresent assessment;
- `minor` — local wording/imprecision that does not materially misteach;
- `no issue` — use only where helpful to evidence a specifically checked high-risk item.

## Final reviewer decision

Choose exactly one:

- **PASS** — all applicable checks completed; no unresolved blocking/material findings.
- **CONDITIONAL PASS** — suitable for restricted pilot; only documented non-critical limitations remain.
- **FAIL / HOLD** — blocking/material issue remains or authority cannot be resolved.

State:

- exact PR head SHA reviewed;
- sources checked;
- scope sampled versus reviewed in full;
- all unresolved limitations;
- whether the reviewer recommends promotion from `preview` to `available` for the restricted pilot.

Do not approve commercial benchmark status. Human subject-specialist review is a separate gate.
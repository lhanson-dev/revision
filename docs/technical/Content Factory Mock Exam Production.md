# Content Factory Mock Exam Production

**Status:** deterministic planner implementation; no paid mock generation  
**Current implementation baseline:** branch from approved `main` after PR #517 and subsequent Psychology Course Truth merge  
**Pilot qualification:** AQA A-level Business 7132, 2027 outgoing specification

## Purpose

Implement the governed whole-paper layer between established Course Truth / Exam Truth and later Revision-authored mock generation.

The governing contract is `80-company-workflows/Content Factory Mock Exam Production.md`. This technical document describes the current implementation only; it does not redefine that authority.

## Existing dependencies

The Business pilot already owns deterministic Course Truth and Exam Truth materialisation, exact-course assurance and fingerprint reuse, the reusable Business Subject Foundation, the accepted Revision-authored question bank and the existing Exam Prep / `ExamSimulator` learner surface.

PR #517 added the pre-generation foundation:

- `content-factory/mock-exams/aqa-7132/MOCK_PROFILE.json`;
- `content-factory/mock-exams/aqa-7132/CALIBRATION.json`;
- provider-free profile validation; and
- the provider-free `Content Factory AQA Business 7132 Mock Profile` GitHub Action.

The Mock Profile separates published assessment invariants from calibration-only observations. AQA materials remain `REFERENCE_ONLY`; protected question wording, cases, datasets and mark-scheme prose are not reusable mock content.

## Deterministic mock-set planner

`scripts/content-factory/plan-aqa-business-7132-mock-set.mjs` materialises current Course Truth and Exam Truth, resolves the current Mock Profile and calibration metadata, and produces:

`.artifacts/content-factory-aqa-business-7132-mock-plan/mock-set-plan.json`

The plan is deterministic for the exact dependency fingerprints and records its own fingerprint. It makes no provider calls and leaves provider spend locked.

The initial three-paper structure is:

| Component | Planned structure | Attempted marks |
| --- | --- | ---: |
| 7132/1 | 15 MCQs; six Section B responses totalling 35; two 25-mark options in C and two in D, with one response required from each choice section | 100 |
| 7132/2 | Three coherent compulsory data-response sets using calibration-backed 35 / 31 / 34 mark shapes | 100 |
| 7132/3 | One coherent case with six linked questions using the calibration-backed 12 / 12 / 16 / 16 / 20 / 24 mark shape | 100 |

Paper 1 retains the important distinction between 150 printed marks and 100 attempted marks.

## AO planning

The planner allocates AO marks at slot level. Validation converts those marks into qualification percentage points using the 300-mark qualification denominator, because the AQA component AO ranges are qualification percentage-point contributions rather than percentages of each 100-mark paper.

For every permitted Paper 1 response path the current deterministic allocation is:

- AO1: 30 marks / 10 qualification percentage points;
- AO2: 30 marks / 10 qualification percentage points;
- AO3: 20 marks / 6.67 qualification percentage points;
- AO4: 20 marks / 6.67 qualification percentage points.

Paper 2 plans AO marks `21 / 30 / 28 / 21`; Paper 3 plans `18 / 18 / 32 / 32`. A representative complete response path therefore totals `69 / 78 / 80 / 73` marks across AO1-AO4, or approximately `23% / 26% / 26.67% / 24.33%`, all within the current Exam Truth overall ranges.

## Quantitative planning

Quantitative slots are selected only from Course Truth requirements with deterministic formula/metric evidence in the current projection rather than inferred from topic names.

The current representative set plans:

- Paper 1: 8 quantitative marks;
- Paper 2: 18 quantitative marks;
- Paper 3: 8 quantitative marks;
- total: 34 quantitative marks.

This is above the Mock Profile minimum of 30 marks for a representative 300-mark set.

## Coverage planning

The initial printed plan contains 41 structural slots and allocates one distinct primary Course Truth requirement to each slot. It therefore deliberately samples 41 of the 42 governed Course Truth requirements rather than forcing every requirement into one mock set.

Targets are assigned deterministically from the current Course Truth fingerprint. A target counts only when the later question directly demands it and it is necessary for full marks; a context-only mention does not count as assessed coverage.

Primary Course Truth targets are not repeated in the initial printed plan. This is stricter than the governing rule for the first set, while preserving the authority's ability to allow deliberate linkage, synoptic demand or quantitative progression in later plans.

## Context ownership

The plan records context ownership before generation:

- Paper 2: one fixed synthetic stimulus/dataset per data-response set;
- Paper 3: one fixed synthetic case/dataset for all six linked questions;
- Paper 1 essay options: independent synthetic contexts where a context is required.

Synthetic businesses and synthetic data remain the default rights-safe approach.

## Provider-free validator

`scripts/assurance/validate-aqa-business-7132-mock-plan.mjs` rebuilds the plan and fails closed unless it proves at least:

- exactly three required papers;
- 120 minutes and 100 attempted marks per paper;
- Paper 1 has exactly four permitted C/D response paths and every path independently reconciles to 100 marks;
- Paper 1 preserves 150 printed / 100 attempted marks;
- slot AO arithmetic reconciles exactly to tariffs;
- every Paper 1 response path and Papers 2/3 satisfy current component AO ranges;
- the representative complete set satisfies overall AO ranges;
- at least 30 quantitative marks are planned (currently 34);
- every printed slot has one Course Truth target and mapped Subject Foundation dependencies;
- no primary Course Truth target is repeated in the initial printed plan;
- Paper 2 and Paper 3 context ownership remains coherent; and
- provider calls remain zero and provider spend remains locked.

The GitHub Action `Content Factory AQA Business 7132 Mock Plan` runs the Mock Profile validator first and then this planner validator without an `OPENAI_API_KEY`.

## What this change does not do

This planner change does not:

- generate learner-facing questions, contexts or mark schemes;
- call an AI provider;
- reuse protected AQA assessment content;
- publish a mock;
- change Course Truth, Exam Truth or the Subject Foundation;
- alter learner navigation or create a new mock route; or
- unlock the US$8 mock-stage pilot spend.

The next governed step after this planner is merged and validated from approved `main` is a bounded generation / whole-paper assurance runner that consumes the exact plan fingerprint and retains spend evidence. That later runner must still stop before spend unless its required deterministic gate has passed.

## Documentation impact

Normative authority is unchanged: the planner implements the already-approved `Content Factory Mock Exam Production` workflow.

Technical documentation is updated because the repository now owns the deterministic paper-set planner and provider-free planner validation described above. No learner-facing runtime or route changes are introduced.

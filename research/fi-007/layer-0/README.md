# FI-007 Layer 0 Benchmark Execution

**Status:** research-only feasibility execution under `Analyse`  
**Feature:** FI-007 — Assisted / AI Exam-Answer Marking  
**Pilot:** AQA AS Business 7131 Paper 2  
**Production eligibility:** none

## Purpose

Execute the bounded Layer-0 marking experiment approved as analysis in PR #117 without creating a production learner marking service.

This folder is evidence gathering. It must not be imported by the learner runtime, used to make readiness/mastery claims, or treated as a validated marking capability.

## Locked experiment order

1. Freeze the nine Revision-owned transfer cases in `transfer-cases.json`.
2. Give the blinded marking pack plus answers to a competent independent human reference marker.
3. Record first-pass human judgements in a copy of `reference-marks.template.json` **before** model results are revealed.
4. Run the same frozen cases through candidate model/configuration routes.
5. Store each model run as an `evaluation-run` JSON file outside production code.
6. Score model results against the frozen human reference using `scripts/fi007-layer0/score-benchmark.mjs`.
7. Second-review boundary, unusual-valid, disputed or high-impact disagreement cases.
8. Record an initial architecture recommendation: `PROCEED`, `REWORK`, or `STOP / REFRAME`.

## Blinding rule

The reference marker receives:

- Harbour Home case context;
- exact question;
- mark allocation and AO allocation;
- governed marking guidance; and
- learner answer.

They must not receive:

- model/provider identity;
- model output;
- proposed expected mark;
- another marker's first-pass score; or
- the synthetic challenge-category labels used when the cases were authored.

The machine-readable fixture therefore intentionally omits those challenge labels.

## Human reference record

Create a working copy of `reference-marks.template.json` and complete:

- `referenceMark`;
- `referenceLevelOrBand` where applicable;
- `referenceAoJudgements` where practical;
- a concise `referenceReasoningSummary`;
- `secondReviewRequired`;
- second-review/adjudication fields where used; and
- marker role/provenance.

Do not commit personal names or unnecessary personal data. A role such as `AQA Business teacher`, `experienced AS Business marker`, or `independent subject specialist` is sufficient for the experiment record.

## Model-run contract

Every model route must receive materially equivalent academic context and return the same logical fields:

- provisional mark;
- maximum mark;
- level/band where applicable;
- credited evidence;
- missed/underdeveloped evidence;
- one to three improvement priorities;
- confidence state;
- review-required state;
- unsupported/fabricated-criterion flag; and
- concise rationale.

Run metadata must capture provider, exact model ID, reasoning configuration, prompt/contract version, input/output usage, latency and calculated cost where available.

## Absolute defect

A fabricated assessment criterion is a blocking configuration defect even if the numerical mark happens to match the reference.

## Current first execution target

The first external model run should establish the strong baseline on the nine frozen transfer cases. The approved shortlist currently treats `gpt-5.6-sol` as that ceiling candidate, followed by cheaper/routed candidates if the strong baseline is credible.

Provider/model availability, price and data-processing terms must be rechecked at the time of execution; this research folder does not approve a production provider.

## Commands

Score a completed evaluation run:

```bash
node scripts/fi007-layer0/score-benchmark.mjs \
  --references /path/to/reference-marks.json \
  --results /path/to/evaluation-run.json
```

The scorer refuses incomplete reference marks and duplicate/missing case IDs.

## Documentation impact

This branch records research execution only. No normative authority or production implementation changes are required at this stage. If Layer 0 produces an architecture/provider/confidence decision intended to govern the product, promote that decision through the appropriate product/technical authority and ADR before material implementation.

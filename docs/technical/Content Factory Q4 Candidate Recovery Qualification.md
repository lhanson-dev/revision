# Content Factory Q4 Candidate Recovery Qualification

## Status

This document records the focused provider-free Q4 recovery-topology proof added after Content Factory candidate-recovery implementation checkpoints 1–5.

The Content Factory remains **paused after Confirmation Pilot #20**. This proof does not restore Q1–Q7 qualification, authorize Q7 live-provider execution, restore Q8 eligibility, authorize another full-course confirmation, or publish learner content.

Active authority remains:

- `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0;
- `decisions/ADR-0019-content-factory-candidate-recovery.md`;
- `80-company-workflows/Content Accuracy Assurance Gate.md`;
- `80-company-workflows/Content Pack Source and Coverage Template.md`.

## Purpose

Post-Pilot #20 Q4 requires more than a deterministic full pipeline in which every generated candidate is valid.

The governed provider-free simulation must prove that the production topology can:

1. reject an ordinary bad Assessment Item candidate without dropping its required slot;
2. resample the same Assessment slot and accept a valid replacement within the governed two-candidate ceiling;
3. reject a bad Marking Pack candidate without invalidating or regenerating the accepted Assessment Item;
4. resample the same Marking Pack slot and accept a valid replacement;
5. reconcile mandatory Learn, Practice, Exam Prep and dependent Marking Pack obligations before `expert_review_ready`; and
6. fail closed when either a required Assessment slot or required Marking Pack slot exhausts bounded recovery.

The governing invariant is: **reject attempts, not requirements**.

## Executable proof

Primary fixture:

`src/content-factory/q4-deterministic-pipeline-fixture.ts`

Candidate-recovery regression:

`src/content-factory/q4-candidate-recovery-qualification.test.ts`

Existing deterministic Q4 regression remains:

`src/content-factory/q4-deterministic-pipeline-simulation.test.ts`

The candidate-recovery fixture uses the same production end-to-end entry point as the existing Q4 simulation. That path reaches the Assessment/Marking factory through `assessment-and-marking-with-coverage-reconciliation.ts`, so candidate recovery and required-coverage reconciliation are exercised through production orchestration rather than a test-only replacement loop.

No external model/provider call is made. Controlled fixture workers return deterministic `WorkerExecution` results with zero usage cost.

## Recovery-success scenario

The positive provider-free scenario deliberately injects:

- Assessment Item candidate 1 → recoverable `provider_contract_failure`;
- Assessment Item candidate 2 → accepted;
- Marking Pack candidate 1 → recoverable `provider_contract_failure`;
- Marking Pack candidate 2 → accepted.

The proof requires:

- exactly two Assessment candidate calls, numbered 1 and 2;
- exactly two Marking Pack candidate calls, numbered 1 and 2;
- rejected candidate runs to carry no accepted `outputRefs`;
- accepted candidate 2 runs to carry the accepted artifact reference;
- both Marking Pack attempts to receive the same frozen accepted Assessment Item wording;
- accepted Marking Pack coverage to exist for the markable Assessment Item;
- the final course manifest to contain required Learn, Practice, Assessment Item and Marking Pack references;
- the existing deterministic validation, independent review, bounded remediation, revalidation and re-review flow to remain intact; and
- final state `expert_review_ready` with zero provider spend.

This proves that ordinary rejected candidates can be converted into production scrap and replaced without converting the course into a blocker.

## Assessment-slot exhaustion scenario

A separate provider-free scenario deliberately rejects Assessment candidates 1 and 2 for the same mandatory slot.

The proof requires:

- exactly two durable candidate attempts;
- no candidate 3;
- no accepted Assessment Item artifact for the exhausted slot;
- no Marking Pack generation;
- no course-content-pack manifest;
- no expert-review package;
- no remediation/version-persistence side effect; and
- an explicit `generation candidate recovery exhausted` course blocker naming the required Assessment slot.

The course therefore cannot proceed by silently omitting the failed requirement.

## Marking-Pack-slot exhaustion scenario

A third provider-free scenario accepts the required Assessment Item and then deliberately rejects Marking Pack candidates 1 and 2.

The proof requires:

- the Assessment Item to be generated and accepted exactly once;
- both Marking Pack attempts to use that same frozen accepted Assessment Item;
- no candidate 3;
- no accepted Marking Pack or `markingPackCoverage` entry;
- the accepted Assessment Item to remain persisted;
- no course-content-pack manifest;
- no expert-review package; and
- an explicit `marking_pack candidate recovery exhausted` blocker naming the required Marking Pack slot.

A valid question therefore cannot be treated as course-complete without its required accepted Marking Pack.

## Qualification effect

This is focused executable evidence for the **post-Pilot #20 Q4 production recovery topology**.

It does **not** by itself transition the machine-readable qualification state or claim that Q1–Q7 have passed on the same approved head. In particular:

- Q1 ownership must still be re-evaluated for the candidate/slot model;
- Q2 must bind Pilot #20 into the permanent replay corpus without rewriting history;
- Q3 must exercise the expanded candidate-recovery adversarial matrix;
- Q5 must prove durable restart/reuse and dependency-aware invalidation under the new candidate state;
- Q6 must repeat the recovery topology under varied order/mutations without code changes;
- Q7 remains prohibited until Q1–Q6 pass on the governed current topology; and
- Q8 remains a separate Founder-governed eligibility transition after Q1–Q7.

The machine-readable `content-factory/reliability-qualification.json` therefore remains paused and is intentionally unchanged by this proof slice.

## Documentation impact

No normative authority change is required. The active Reliability Standard already requires provider-free Q4 bad-candidate injection and fail-closed recovery, while ADR-0019 already defines candidate-based manufacturing and the existing coverage authorities prohibit silent omission.

No historical pilot or qualification evidence is rewritten.

This document records only the current executable technical proof added to the governed implementation branch.

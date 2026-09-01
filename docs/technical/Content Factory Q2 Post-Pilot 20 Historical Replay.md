# Content Factory Q2 Post-Pilot 20 Historical Replay

## Status

Current Q2 evidence slice for the candidate-recovery architecture reset after Confirmation Pilot #20.

This evidence is provider-free and does not change `content-factory/reliability-qualification.json`, which remains `paused` until the governed qualification sequence is deliberately completed.

## Authority

- `80-company-workflows/Content Factory Reliability Qualification Standard.md`
- `decisions/ADR-0019-content-factory-candidate-recovery.md`

Historical evidence is read as evidence, not promoted into normative authority.

## Why this slice exists

The original Reliability v2 historical replay corpus covers Pilots #1-#18. Pilot #19 was subsequently requalified through its own immutable provider-free record. Confirmation Pilot #20 then exposed a new generic engineering/recovery class and explicitly reset Q2 with the requirement that Pilot #20 be included in the historical replay.

The Pilot #20 failure was not that the factory detected an invalid Assessment Item. Detection was correct. The generic failure was the combination of two production behaviours:

1. a parseable Assessment Item with more than one independent semantic defect could surface the first thrown defect as though it were the complete diagnostic set; and
2. a rejected Assessment Item candidate became an immediate course-level blocker instead of a bounded candidate-level recovery event.

The historical sequence was calculation-demand failure on q1, followed after the old single whole-artifact repair by interpretation-demand failure on q5. The full course blocked with no accepted markable Assessment Item.

## Evidence model

This slice does **not** edit:

- `content-factory/reliability-v2-b-historical-failure-corpus.json`;
- `content-factory/reliability-post-pilot19-requalification.json`; or
- `content-factory/reliability-pilot20-stop-loss-architecture-review.json`.

Instead it adds the current overlay:

`content-factory/reliability-post-pilot20-q2-historical-replay.json`

and executable regression:

`src/content-factory/q2-pilot20-candidate-recovery-replay.test.ts`

The old Pilots #1-#18 corpus therefore remains unchanged historical evidence, Pilot #19 remains unchanged, and the exact Pilot #20 provenance remains unchanged.

## Replay classification

The replay is deliberately classified as a **synthetic reproduction**.

The Pilot #20 stop-loss record retains exact run, head, artifact, spend, outcome and defect-class provenance, but this Q2 slice does not claim that the raw failed model candidate is retained and replayed byte-for-byte. The test constructs the smallest generic failure shape supported by that durable evidence and exercises it through current production boundaries.

This avoids upgrading historical evidence strength without evidence.

## Executable proof

### 1. Historical provenance binding

The regression verifies the immutable Pilot #20 record still identifies:

- Pilot `20`;
- workflow `33420994194`;
- job issue `#260`;
- approved historical main `b240ea9b6e2d56a644048c6085162c58429aef33`;
- artifact `9769262820` with its recorded SHA-256 digest;
- final state `blocked`; and
- defect class `assessment_candidate_recovery_and_complete_diagnostic_architecture_failure`.

It also verifies the legacy corpus still contains Pilots #1-#18 exactly and that the Pilot #19 Q2 requalification remains PASS without rewriting either source.

### 2. Complete multi-defect diagnostics

The regression constructs a parseable Assessment Item with two independent response-demand defects corresponding to the historical generic sequence:

- q1 claims calculation demand without a calculation command;
- q5 claims interpretation demand without an interpretation command.

The current `diagnoseStructuredAssessment()` boundary must return both `ASSESSMENT_RESPONSE_DEMAND_UNSUPPORTED` findings in one diagnostic set.

This directly protects the complete-diagnostic side of the Pilot #20 defect class.

### 3. Candidate rejection and replacement

The regression then uses the same production-path candidate-recovery harness used for Q4 qualification.

It proves:

- candidate 1 is rejected;
- rejected candidate 1 has no accepted output reference;
- the same required Assessment slot remains required;
- candidate 2 is generated for that same slot;
- candidate 2 can be accepted;
- dependent Marking Pack generation completes; and
- the production route reaches `expert_review_ready` without a course blocker.

The relevant invariant is:

**reject attempts, not requirements**.

### 4. Bounded exhaustion

A second replay rejects both permitted Assessment candidates and proves:

- there is no candidate 3;
- neither rejected candidate counts as an accepted Assessment artifact;
- no course content pack or expert review package is assembled with the slot missing; and
- the course becomes explicitly `blocked` against the exhausted required slot.

This distinguishes ordinary recoverable candidate scrap from genuine recovery exhaustion.

## Qualification effect

This slice supplies current provider-free Q2 evidence for the post-Pilot #20 candidate-recovery architecture.

It does **not** by itself:

- change the machine-readable global gate from `required_after_pilot20_architecture_reset`;
- establish Q3 adversarial breadth;
- establish Q6 repeated recovery stability;
- permit Q7 live-provider soak;
- permit Q8; or
- permit another full-course confirmation run.

Those transitions remain separate governed decisions/evidence slices.

## Documentation impact

No normative authority changes are required. The Reliability Qualification Standard already requires historical failure replay, preservation of historical evidence, candidate-recovery proof and fail-closed completeness.

This document and its machine-readable overlay record current qualification evidence only. Historical records are not rewritten and production implementation is unchanged.

# Content Factory Q3 Post-Pilot #20 Adversarial Requalification

## Status

Provider-free Q3 evidence for the post-Pilot #20 candidate-recovery architecture. This document is technical evidence, not a change to normative authority and not an authorization to run Q7, Q8 or a paid/full-course confirmation.

## Governing authority

- `80-company-workflows/Content Factory Reliability Qualification Standard.md`
- `decisions/ADR-0019-content-factory-candidate-recovery.md`

The Reliability Qualification Standard requires adversarial provider-free qualification across materially different subject/course shapes. ADR-0019 additionally requires the current candidate topology to prove that rejected attempts are replaceable at the smallest safe slot, accepted siblings survive, accepted dependencies freeze, and exhausted mandatory slots block rather than disappear.

## Why this evidence is needed

Revision already had two strong pre-reset Q3 assets:

1. `content-factory/reliability-q3-subject-shape-matrix.json` and `src/content-factory/q3-subject-shape-matrix.test.ts`, which run five synthetic subject shapes through the shared factory path on the happy path; and
2. `content-factory/reliability-v2-c-adversarial-mutation-matrix.json` and `src/content-factory/reliability-v2-c-adversarial-mutation-matrix.test.ts`, which stress malformed structure, reference defects, mixed demands, complete diagnostics, bounded repair and Marking Pack failure behaviour.

Those records pre-date the Pilot #20 architecture reset. They remain valid historical evidence and are deliberately not rewritten. The missing Q3 proof was that the five governed subject shapes still behave correctly when the current production Assessment/Marking candidate-recovery topology is stressed.

## New executable evidence

`src/content-factory/q3-post-pilot20-candidate-recovery-requalification.test.ts` consumes the same five governed shape definitions from `q3-subject-shape-fixtures.ts` and constructs their Assessment Blueprint, coverage, knowledge and completed Learn/Practice prerequisites in memory. It then calls the production `runAssessmentAndMarkingFactory()` implementation directly.

No provider endpoint is called. Controlled workers emit deterministic synthetic candidate content with zero usage cost and can inject recoverable `provider_contract_failure` results at selected Assessment or Marking Pack candidate numbers.

The machine-readable evidence record is:

`content-factory/reliability-post-pilot20-q3-adversarial-requalification.json`

## Governed subject shapes

The proof covers the existing five Q3 shapes without introducing a course-specific exception:

- quantitative business/economics;
- mathematics;
- science;
- essay/humanities; and
- language/prescribed-text style analysis.

The science fixture supplies two independent component/family Assessment slots. The language fixture supplies one shared Question Family across two components. These shapes are therefore used to test sibling isolation and shared-family dependency behaviour, not merely single-question success.

## Assertions

### Candidate replacement across all five shapes

For each shape, the first real Assessment target receives an injected Assessment candidate-1 rejection and an injected Marking Pack candidate-1 rejection. The production factory must:

- record candidate 1 as rejected with no accepted output;
- request candidate 2 for the same slot;
- accept candidate 2;
- never request candidate 3;
- preserve the two-candidate ceiling passed into the worker contract;
- finish the Assessment/Marking factory in `validating`;
- contain exactly one accepted Assessment Item and one accepted Marking Pack for every Blueprint target; and
- assemble one complete course-content-pack manifest.

### Accepted Assessment sibling survival

For the science shape, only the second Assessment slot is made to reject candidate 1. The first Assessment slot is accepted once and is not regenerated while the second slot advances to candidate 2. The completed shape still contains both accepted Assessment Items and both Marking Packs.

### Shared-family Marking Pack recovery and frozen question dependency

For the language shape, one Question Family is used across `paper-1` and `paper-2`. Marking Pack candidate 1 is rejected only for `paper-2`.

The proof requires:

- both Assessment Items to remain single accepted executions;
- the `paper-1` Marking Pack to remain accepted without regeneration;
- only the `paper-2` Marking Pack slot to advance from candidate 1 to candidate 2; and
- the accepted `paper-2` question wording to be byte-identical across both Marking Pack attempts.

This is the dependency-freezing behaviour required by ADR-0019.

### Exhausted mandatory slot fails closed

For the science second Assessment slot, candidates 1 and 2 are both rejected. The production factory must:

- enter `blocked`;
- create no candidate 3;
- retain the already accepted first Assessment sibling;
- accept no artifact for the exhausted second slot; and
- create no course-content-pack manifest.

This preserves the no-holes rule: rejected attempts may be discarded, but a mandatory curriculum/Assessment requirement cannot silently disappear.

## Relationship to Q4 and Q6

This Q3 slice deliberately proves **adversarial breadth** across different course and Assessment topologies. It does not duplicate Q4 or Q6.

Q4 remains the deterministic full-pipeline proof that injected bad Assessment and Marking Pack candidates can recover through the production path to `expert_review_ready`, or block on bounded exhaustion.

Q6 remains the repeated provider-free stability gate. Q6 must separately prove that recovery remains stable across repeated executions, varied mutation order and other governed repetition/permutation conditions. Passing this Q3 evidence does not imply Q6 PASS.

## Provider, spend and publication impact

- Provider calls: none.
- Paid course runs: none.
- Learner publication: none.
- Educational assurance thresholds: unchanged.
- `content-factory/reliability-qualification.json`: unchanged and still paused.
- Q7 eligibility: unchanged.
- Q8/full-course eligibility: unchanged.

## Documentation impact check

No normative authority changes are required. The Reliability Qualification Standard and ADR-0019 already require this behaviour. This change adds current technical and machine-readable evidence only; pre-reset evidence and historical pilot records remain unchanged.

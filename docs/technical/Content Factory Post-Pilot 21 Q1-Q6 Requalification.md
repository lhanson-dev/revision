# Content Factory Post-Pilot 21 Q1-Q6 Requalification

## Status

Provider-free Reliability v2 Q1-Q6 requalification for the corrected Confirmation Pilot #21 Assessment Item boundary.

This transition does **not** restore full-course eligibility. Q7 remains pending and a later separate Q8 transition remains required before a paid confirmation course can resume.

## Baseline

The requalification is based on approved `main` merge commit `df44194f7399dbfe5f6f4e5d7a1bfe311474bf11`, which contains the Pilot #21 question-wording ownership correction.

No provider call is required for Q1-Q6.

## Why Q1-Q6 were reopened

Confirmation Pilot #21 failed at Assessment Item generation because the provider was required to author both structured `subquestions[].wording` and a second top-level `questionWording`, while downstream validation required exact agreement between those representations.

The correction removes the duplicated provider-owned clerical field. Educational subquestion wording remains generative judgement. Revision composes top-level learner-visible `questionWording` deterministically from validated subquestions in governed order.

Because this was classified as a new generic engineering contract class, the active Reliability Qualification Standard requires the affected provider-free gates to be requalified before another bounded live-worker soak.

## Q1 — ownership inventory

The post-Pilot #20 ownership inventory remains historical evidence and is not rewritten.

`content-factory/reliability-pilot21-q1-ownership-addendum.json` forms the current composite inventory with that base. It supersedes only the changed Assessment Item statements:

- `subquestions[].wording` remains generative educational judgement;
- top-level `questionWording` is deterministically derived;
- duplicated `subquestions[].requirementIds` remain deterministically derived from validated coverage evidence;
- all unrelated worker boundaries inherit unchanged from the prior inventory.

## Q2 — historical replay

The immutable historical corpus remains intact. Pilot #21 is added as a permanent provider-free replay through:

- `content-factory/reliability-pilot21-question-wording-ownership-defect.json`;
- `src/content-factory/pilot21-question-wording-ownership.test.ts`;
- `src/content-factory/pilot21-q1-q5-requalification.test.ts`.

The replay injects a stale duplicate top-level wording that omits one structured subquestion. The provider-facing v9 schema discards the duplicate and the compiler reconstructs the final learner-visible wording from the validated subquestions.

## Q3 — five governed subject shapes

The corrected boundary is exercised provider-free across:

1. quantitative business/economics;
2. mathematics;
3. science;
4. essay/humanities;
5. language/prescribed text.

Each shape receives the same adversarial duplicate-representation condition and must produce deterministic top-level wording from the structured educational wording.

The existing adversarial mutation matrix and candidate-recovery matrix remain part of same-head CI.

## Q4 — deterministic full pipeline

The existing current provider-free deterministic pipeline simulations remain bound to this qualification. They must still demonstrate:

- complete diagnostics;
- bounded candidate recovery;
- fail-closed exhaustion;
- required-coverage reconciliation;
- accepted-work preservation;
- `expert_review_ready` as a reachable terminal state without provider calls.

## Q5 — restart, reuse and dependency invalidation

This is the gate most directly connected to the Founder requirement for incremental course generation.

Pilot #21 has 13 completed work units with 13 Learn and 13 Practice artifacts banked in its durable Issue #281 state. The failure boundary is Assessment Item generation.

The current dependency policy advances Assessment Item semantics to `3+output-integrity-v7`. `generateLearningCollateral` and `generatePracticeCollateral` are not in the Assessment Item dependency closure. Therefore an Assessment-only semantic correction does not invalidate those artifacts.

Assessment Items and genuine downstream dependants, including Marking Packs and independent review, are invalidated and must be regenerated or rerun as appropriate.

A resume may replay earlier stages to verify fingerprints and reconstruct orchestration state. That replay must not itself cause a provider call, new spend or replacement of unchanged valid Learn/Practice artifacts.

This means the intended next full-course action after Q7 and Q8 is to **resume Pilot #21 from its Assessment boundary**, not start a new course from zero.

## Q6 — repeated provider-free stability

The affected current Q2-Q5 suites are rerun three times under deterministic shuffle seeds `317`, `641` and `953`.

The repetition includes:

- the historical failure corpus;
- exact Pilot #21 duplicate-wording replay;
- the five-shape adversarial Assessment boundary;
- deterministic full-pipeline simulation;
- candidate recovery;
- dependency-aware resume and invalidation.

Any same-head failure keeps Q1-Q6 unqualified.

## Machine state after this transition

After exact-head CI and Founder-approved merge:

- Q1: PASS;
- Q2: PASS;
- Q3: PASS;
- Q4: PASS;
- Q5: PASS;
- Q6: PASS;
- Q7: PENDING;
- overall reliability status: `paused`;
- `livePilotEligible`: `false`;
- full-course resume: prohibited.

The only permitted paid reliability step is the bounded Q7 live-worker soak under the governed US$5 ceiling. Q7 must not assemble a full course or publish learner content.

## After Q7

If Q7 passes without a new generic engineering class, a separate Q8 PR may restore one confirmation-pilot eligibility.

Only after that Q8 transition should the existing Pilot #21 course be resumed. The desired path is:

`reuse source/course/blueprint/Learn/Practice -> Assessment Items -> Marking Packs -> A1-A4 assurance -> expert_review_ready -> human review`

A new failure must be classified at its actual boundary. Previously accepted upstream artifacts are invalidated only where the dependency graph proves they are affected.

## Documentation impact

No normative authority change is required. The active Reliability Qualification Standard already requires compiler-first ownership, dependency-aware restart/reuse, affected-gate requalification after a generic confirmation-pilot engineering failure, bounded Q7, and a separate Q8 transition.

Historical evidence is not rewritten. This document records the current technical qualification state and the intended Pilot #21 resume boundary.

# Content Factory Post-Pilot #20 Q1-Q6 Consolidation

## Status

Provider-free Q1-Q6 consolidation implemented for same-head CI assurance.

This transition moves the machine-readable reliability state from the Pilot #20 architecture-reset hold to the exact precondition required for a bounded Q7 live worker soak:

- Q1-Q6: `pass`;
- Q7: `pending`;
- overall qualification: `paused`;
- `livePilotEligible`: `false`;
- `qualifiedEvidence`: `null`.

It does **not** run Q7, spend provider budget, restore full-course confirmation eligibility or change educational assurance authority.

## Governing authority

- `80-company-workflows/Content Factory Reliability Qualification Standard.md`
- `decisions/ADR-0019-content-factory-candidate-recovery.md`
- `70-ai-operating-system/AI Agent Constitution.md`

The Reliability Standard permits the bounded Q7 worker soak only after Q1-Q6 PASS. It separately requires Q7 PASS and a Founder-approved Q8 transition before a full-course confirmation run may be re-enabled.

## Why consolidation is a separate step

The post-Pilot #20 recovery programme deliberately built evidence in small governed slices. Each slice proved one boundary while leaving `content-factory/reliability-qualification.json` unchanged so no individual PR could accidentally authorise live-provider work.

That evidence is now present on approved `main`:

### Q1 — compiler/worker ownership

Current evidence:

- `content-factory/reliability-contract-inventory.json`
- `tests/content-factory-q1-ownership-refresh.test.mjs`
- `docs/technical/Content Factory Q1 Contract Ownership Qualification.md`

The inventory classifies the candidate-recovery mechanics as Revision-owned: slot identity, candidate ordinal and ceiling, disposition, accepted-artifact freeze, exhaustion and required-coverage reconciliation. Educational semantic content remains generative judgement where appropriate.

### Q2 — historical failure replay

Current evidence:

- immutable Pilots #1-#18 historical corpus;
- post-Pilot #20 labelled synthetic replay;
- `src/content-factory/q2-pilot20-candidate-recovery-replay.test.ts`.

The Pilot #20 generic class is replayed as complete simultaneous diagnostics, same-slot candidate replacement and bounded exhaustion. Historical evidence is not rewritten.

### Q3 — adversarial subject-shape breadth

Current evidence:

- existing adversarial mutation matrix;
- post-Pilot #20 candidate-recovery requalification across all five governed subject shapes.

The current production Assessment/Marking topology proves replacement, sibling survival, shared-family behaviour, frozen accepted dependencies and explicit exhaustion without silent curriculum omission.

### Q4 — deterministic full-pipeline recovery

Current evidence:

- `src/content-factory/q4-deterministic-pipeline-simulation.test.ts`
- `src/content-factory/q4-candidate-recovery-qualification.test.ts`

The provider-free production route can reject and replace Assessment and Marking candidates, reconcile required coverage and reach `expert_review_ready`. Exhaustion blocks instead of assembling an incomplete course.

### Q5 — restart, reuse and dependency invalidation

Current evidence:

- `src/content-factory/q5-dependency-aware-resume.test.ts`
- `src/content-factory/q5-candidate-recovery-requalification.test.ts`

Accepted sibling work survives interruption and recovery. Exact terminal executions are reusable where valid, and semantic changes invalidate the affected stage plus genuine downstream dependants rather than unrelated Learn/Practice work.

### Q6 — repeated provider-free stability

Current evidence:

- `content-factory/reliability-post-pilot20-q6-repeated-recovery-stability.json`
- `src/content-factory/q6-post-pilot20-repeated-recovery-stability.test.ts`

The current Q2-Q5 topology repeats three times under deterministic shuffle seeds `211`, `463` and `887`, retaining the historical failure corpus and adversarial mutation matrix.

## Machine transition

`content-factory/reliability-qualification.json` changes only the provider-free gate state:

- Q1 `pass`
- Q2 `pass`
- Q3 `pass`
- Q4 `pass`
- Q5 `pass`
- Q6 `pass`
- Q7 `pending`

The overall status remains `paused` and full-course eligibility remains false.

The existing `.github/workflows/content-factory-live-worker-soak.yml` independently enforces those exact preconditions before a live worker soak can call the provider. It also requires the overall state to remain fail closed for full-course execution.

## Deliberately excluded from this transition

This change does not modify `content-factory/reliability-v2-e-live-worker-soak-request.json`.

Therefore merging this transition does not trigger the Q7 workflow and does not create provider spend. A later governed Q7 request can be reviewed separately with its live-provider scope visible to the Founder.

The bounded Q7 envelope remains:

- at least 20 live worker outputs;
- all five governed subject shapes;
- high-risk Assessment Item and Marking Pack boundaries;
- production compilers/validators/bounded repair;
- no full-course assembly;
- no learner publication;
- maximum governed soak spend US$5.

## Q7 failure rule

Q7 is sampling real provider variability, not proving that every sample must be accepted.

A genuine educational candidate rejected correctly by the existing assurance boundary is not automatically a reliability failure. A newly exposed generic engineering/contract class is a reliability failure and returns the affected Q1-Q6 gates to requalification before another soak.

## Q8 remains separate

Even after a successful Q7 soak, full-course confirmation remains prohibited until a separate governed PR changes the qualification state to `qualified` under Q8.

The next full-course run remains a confirmation pilot, not a debugging mechanism.

## Documentation impact

No normative authority changes are required. This document records current implementation/qualification state under the existing Reliability Standard and ADR-0019.

Historical Pilot #19, Pilot #20 and earlier Q7 evidence remain unchanged.

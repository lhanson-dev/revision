# Content Factory Reliability Qualification Harness

## Status

The Content Factory has completed the post-Confirmation-Pilot #20 Reliability v2.0 requalification sequence.

- Q1–Q6 provider-free candidate-recovery qualification: **PASS**.
- Q7 candidate-aware bounded live-worker soak attempt 6: **PASS**.
- Q8 confirmation-pilot eligibility transition: **eligible after this governed change reaches `main`**.
- Machine state after Q8: **`qualified`**.
- `livePilotEligible` after Q8: **`true`**.
- Next paid run class: **one bounded `confirmation_pilot`**.
- Q8 itself performs **no provider call, course assembly or learner publication**.
- Content Factory maturity remains **not achieved**.

Active authority: `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0.

Cost authority: `60-business-operations/Content Factory Bootstrap Cost Strategy.md`.

Current machine-readable state: `content-factory/reliability-qualification.json`.

Current Q8 record: `content-factory/reliability-v2-f-q8-eligibility-003.json`.

Current Q7 PASS record: `content-factory/reliability-v2-e-q7-live-soak-evidence-006.json`.

Current provider-free Q1–Q6 record: `content-factory/reliability-post-pilot20-q1-q6-consolidation.json`.

Architecture decision: `decisions/ADR-0019-content-factory-candidate-recovery.md`.

No educational assurance requirement is lowered by qualification. `80-company-workflows/Content Accuracy Assurance Gate.md` remains the authority for trusted learner content.

## What Q8 changes

Q8 is a repository-state transition, not a production run.

After the Q8 change is exact-head assured, Founder-approved and merged, the machine-readable qualification record may state:

- `status: qualified`;
- `livePilotEligible: true`;
- Q1–Q7 all `pass`;
- `qualifiedEvidence` bound to the approved post-Pilot #20 provider-free and Q7 evidence;
- `nextPaidRunClass: confirmation_pilot`.

The Q8 record must also prove that the transition itself used no provider calls and triggered no full-course execution, course assembly or learner publication.

A later confirmation pilot remains an explicit paid execution. Q8 does not dispatch it automatically.

## Post-Pilot #20 qualification evidence

### Q1–Q6

The post-Pilot #20 provider-free qualification binds the current candidate-recovery topology to the governed Q1–Q6 gates.

Canonical evidence:

`content-factory/reliability-post-pilot20-q1-q6-consolidation.json`

The provider-free evidence preserves the historical failure corpus and replays the Pilot #20 recovery defect without rewriting the historical records that caused the stop-loss.

### Q7 candidate-aware bounded live soak

The decisive post-Pilot #20 Q7 evidence is attempt 006:

- approved `main`: `e74e04613c8d9fa8d7eba617bb839ef368d26029`;
- workflow run: `33554413877` / run #21;
- artifact ID: `9818944889`;
- artifact digest: `sha256:43be3553cf21db5892efbfab888c0211f7a02944408a631d228d06fd8955a30b`;
- 20/20 governed samples accepted;
- all five governed subject shapes covered;
- Assessment Item: 10/10 accepted;
- Marking Pack: 10/10 accepted;
- 31 provider calls completely classified;
- 10 targeted repairs;
- 1 fresh candidate resample;
- 0 infrastructure incidents;
- 0 engineering-boundary breaches;
- known provider spend: US$0.404658 against the US$5 soak ceiling;
- no course assembly;
- no learner publication.

The candidate-aware evidence distinguished targeted repair from fresh candidate resampling rather than inferring repair count from total provider calls.

One science Assessment Item sample exercised:

`initial generation → targeted repair → fresh candidate resample → accepted`

That recovery completed without engineering intervention.

Classification:

`q7_pass_no_new_generic_engineering_contract_class`

Attempt 005 remains preserved as instrumentation-limited historical evidence and is not retroactively promoted.

## Production reliability model

The production reliability objective remains:

`deterministic production slot → generated candidate → complete diagnostics → accept or reject → bounded automatic resampling/recovery → freeze accepted artifact → dependent generation/assurance → expert_review_ready`

Core invariants:

1. A provider response is a candidate, not canonical content.
2. Rejected candidates do not satisfy required curriculum or dependent-artifact slots.
3. Recovery is bounded by candidate, repair, retry and spend limits.
4. Accepted sibling artifacts remain frozen during recovery.
5. Marking Pack recovery preserves the accepted Assessment Item.
6. Required coverage is reconciled before course-pack acceptance.
7. Recovery exhaustion or unrecoverable state fails closed.
8. Educational assurance remains independent from manufacturing reliability.

The detailed candidate-recovery architecture is governed by ADR-0019 and implemented through the current Assessment Item, Marking Pack and coverage-reconciliation boundaries.

## Confirmation-pilot preflight

Paid full-course execution is guarded by:

`scripts/content-factory-live-pilot-qualification.mjs`

The preflight requires:

- `status === "qualified"`;
- `livePilotEligible === true`;
- every `requiredGate` to be represented in `qualifiedEvidence.passedGates`;
- a non-null `qualifiedEvidence` record.

The live-pilot workflow runs this preflight before the paid adapter execution and has no `continue-on-error` bypass.

The Q8 state binds the next confirmation pilot to:

- eligibility record `content-factory/reliability-v2-f-q8-eligibility-003.json`;
- provider-free record `content-factory/reliability-post-pilot20-q1-q6-consolidation.json`;
- Q7 pass record `content-factory/reliability-v2-e-q7-live-soak-evidence-006.json`;
- Q7 attempt 6 / workflow `33554413877`;
- all Q1–Q7 gates PASS.

## Stop-loss remains active

Qualification is not maturity and does not guarantee a successful confirmation course.

A later confirmation pilot must still fail closed for:

- a new generic engineering/provider-contract class;
- exhausted recovery or spend controls;
- unrecoverable infrastructure state;
- material educational findings;
- source-rights or coverage blockers;
- failed independent/expert assurance.

A new generic engineering contract class returns global qualification to `paused` and restarts the affected Reliability v2 gates under the active standard.

## Cost and publication controls

Q8 makes no paid model call.

The next confirmation pilot remains subject to the governed per-course ceiling and normal cost logging.

Source-rights, independent review, expert review, content accuracy assurance and publication controls are unchanged.

`qualified` means the governed production reliability gates permit one confirmation-pilot execution. It does not mean learner publication is approved.

## Historical continuity

The repository preserves earlier Q7 and Q8 records as historical evidence, including the post-Pilot #19 qualification and the Pilot #20 stop-loss record.

Q8 does not rewrite those records. It appends the new post-Pilot #20 eligibility decision and updates the current machine-readable state.

Git history and the immutable evidence records retain the detailed qualification and recovery sequence that led to the current state.

## Maturity

Content Factory maturity remains governed separately.

The maturity criterion remains three consecutive materially different real courses reaching `expert_review_ready` without engineering or worker-contract correction between runs.

Q8 therefore restores confirmation-pilot eligibility only. It does not declare maturity, educational correctness or publication readiness.

## Documentation impact

This Q8 transition changes implementation state, not normative authority.

- Reliability Standard v2.0: unchanged.
- Bootstrap Cost Strategy: unchanged.
- ADR-0019: unchanged.
- Machine-readable qualification state: updated.
- Q8 evidence record: appended.
- This technical harness: updated to current post-Pilot #20 Q1–Q8 state.
- Historical evidence: preserved unchanged.

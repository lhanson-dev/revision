# Content Factory Reliability Qualification Harness

## Status

The Content Factory remains **paused for full-course live execution**.

Reliability v2 progressed through:

- V2-A — compiler-first Marking Pack hardening and complete diagnostics;
- V2-B — historical failure replay corpus;
- V2-C — adversarial provider-free mutation matrix;
- V2-D — provider-free Q1–Q6 qualification;
- V2-E — bounded Q7 live-worker soak.

The first completed Q7 live soak ran on approved `main` `69d7abb7d3236616b687cbed480e7584ceb69fc9` as workflow run `33265434110` / run number `16`. It executed all 20 governed samples and uploaded evidence, but it exposed a new generic Assessment Item provider-contract class. Q7 therefore did not pass.

Durable classified evidence:

- `content-factory/reliability-v2-e-q7-live-soak-evidence.json`

Current machine-readable state intentionally reopens Q1–Q6 to `pending`, keeps Q7 `pending`, keeps `status: paused`, keeps `qualifiedEvidence: null` and keeps `livePilotEligible: false`.

The active governing authority is `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0. A separate Q8 eligibility transition remains unavailable until corrected Q1–Q6 evidence and a later Q7 PASS exist.

## Historical trigger and evidence preservation

Confirmation Pilot #18 remains the historical trigger for Reliability v2 and is not rewritten:

- approved content head: `ed3bd4c4a50dd723da38952a41ff9bad084ad68d`;
- workflow run: `33239396439` / run number `18`;
- durable job: Issue `#234`;
- failure class: generic Marking Pack operational-rubric provider-contract weakness after targeted repair;
- cumulative provider spend: `US$1.253632`;
- nothing was published.

V2-D also remains historical evidence that Q1–Q6 passed on its then-current exact implementation head. The Q7 live result does not rewrite that fact; it proves that the earlier provider-free evidence was not sufficient to qualify current live-provider robustness and therefore must be rerun after the newly exposed Assessment Item correction.

## Reliability v2 objective

The factory should behave like a compiler boundary around variable model output:

`model educational judgement → compiler-owned structure → complete deterministic diagnostics → at most one targeted repair → whole-artifact revalidation → valid artifact or fail closed`

The target is not perfect first-pass model output. The target is that expected model variability does not require an engineer to change TypeScript, schemas or prompts between ordinary courses.

## Qualification sequence

### V2-A — complete-diagnostic validation and compiler ownership — complete

V2-A removed the known Pilot #18 serial-defect Marking Pack behavior and moved mechanically constructible Marking Pack structure into Revision-owned compilation where educational meaning allowed.

Technical record: `docs/technical/Content Factory Reliability v2-A Marking Pack Compiler.md`.

### V2-B — historical failure replay corpus — complete historically, must be extended

The permanent corpus records Pilots #1–#18 reusable contract classes using exact historical output where lawfully retained and labelled synthetic reproductions where exact output is unavailable.

Q7 has now created an additional reusable Assessment Item contract class. The live-soak artifact retained the durable failure signature and sample evidence but not the raw provider candidate. The Q2 correction must therefore add a clearly labelled synthetic reproduction of the observed omission pattern; it must not claim exact provider-output replay.

Technical record: `docs/technical/Content Factory Reliability v2-B Historical Failure Replay Corpus.md`.

### V2-C — adversarial mutation matrix — complete historically, must be extended

The provider-free matrix covers all five governed subject shapes and a range of near-boundary/simultaneous defects.

The next correction must add Assessment Item adversarial cases for omitted and simultaneous subquestion-level:

- `maxMark`;
- `requirementIds`;
- `coverageEvidence` / locator structure;

across all five subject shapes, including cases that prove the corrected boundary enters complete diagnostics/bounded repair or fails closed at the intended point.

Technical record: `docs/technical/Content Factory Reliability v2-C Adversarial Mutation Matrix.md`.

### V2-D — provider-free Q1–Q6 qualification — previous PASS, now reopened

V2-D previously established Q1–Q6 PASS with three governed repetitions under varied seeds/order.

The completed Q7 soak exposed a new generic contract class, so the active qualification record reopens Q1–Q6 to `pending` rather than treating V2-D as current qualifying evidence.

The corrected requalification must cover:

- Q1 — Assessment Item field ownership and repair boundary;
- Q2 — synthetic replay of the Q7 defect signature;
- Q3 — five-shape adversarial variants;
- Q4 — corrected deterministic full-pipeline simulation;
- Q5 — dependency-aware invalidation for the Assessment Item contract/compiler change;
- Q6 — repeated provider-free stability with varied governed seeds/order.

Historical machine-readable record: `content-factory/reliability-v2-d-provider-free-qualification.json`.

### V2-E — bounded live worker soak — completed, Q7 not passed

The canonical runtime is:

- `.github/workflows/content-factory-live-worker-soak.yml`;
- `src/content-factory/live-worker-soak.integration.test.ts`.

The runner supports manual `workflow_dispatch` plus a narrowly scoped push trigger only when `content-factory/reliability-v2-e-live-worker-soak-request.json` changes on `main`.

Execution history:

1. PR #240 merged the runner at `ba9d5e5fee0ae33bfac22f393f50faad4e8cb4f7`.
2. PR #241 added the governed request-file fallback at `ef2b72bf83d31b66c15bee5480e33c21acfa580b` after GitHub did not expose the manual control.
3. Run `33264051185` failed before job creation because inline Node heredocs were invalid YAML; it used zero provider calls and zero spend.
4. PR #242 corrected the workflow YAML and merged at `69d7abb7d3236616b687cbed480e7584ceb69fc9`.
5. Run `33265434110` executed the real Q7 soak and uploaded artifact `9718558827`.

The governed live set was exactly 20 outputs:

- all five subject shapes;
- 10 Assessment Item samples;
- 10 Marking Pack samples;
- production `createOpenAIModelAssistedWorkers` compiler/validator/repair code;
- transport retries disabled;
- no full-course assembly;
- no learner publication;
- hard US$5 spend ceiling.

Observed result:

- 20 executed;
- 13 accepted;
- 7 controlled fail-closed;
- 0 infrastructure incidents;
- 0 escaped boundary exceptions;
- 9 targeted repairs observed;
- Assessment Item: 3/10 accepted;
- Marking Pack: 10/10 accepted;
- known measured cost: US$0.423906;
- unpriced sample count: 0.

The seven Assessment Item failures appeared across all five governed subject shapes and repeatedly omitted required subquestion-level `maxMark`, `requirementIds` and/or `coverageEvidence` structure. The candidates failed provider/worker schema validation before the existing validator-directed Assessment Item targeted-repair stage could run.

This is classified as:

`assessment_subquestion_required_structure_omission_before_targeted_repair`

It is a new generic engineering/provider-contract class, not a set of subject-specific educational findings. Under the Reliability Standard, Q7 cannot pass and the affected Q1–Q6 gates must be rerun before another soak.

Technical record: `docs/technical/Content Factory Reliability v2-E Live Worker Soak.md`.

Durable evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence.json`.

### V2-F — Q8 eligibility transition — blocked

V2-F is not yet eligible.

Only after corrected Q1–Q6 PASS and a later Q7 PASS may a separate governed PR restore:

- `status: qualified`;
- `livePilotEligible: true`;
- exact qualification evidence binding;
- next paid run class `confirmation_pilot`.

Pilot #19 must not run before that transition merges.

## Assessment Item ownership finding

The Q7 defect does not mean all Assessment Item marks/references should automatically be model-owned or compiler-owned.

Current production already treats governed top-level target fields differently from subquestion educational structure. When an Assessment Item policy exists, Revision omits top-level `componentId`, `questionFamilyId`, `requirementIds`, `format` and `maxMark` from the provider output contract and injects those values deterministically after provider validation.

The failed values are within generated subquestions. The next Q1 review must deliberately classify each part using the v2 ownership model:

- mechanically derivable skeleton/identity/clerical representation should move to compiler ownership where educational meaning is preserved;
- educational allocation or evidence meaning that genuinely requires model judgement may remain generative;
- parseable repair-eligible omissions must be able to reach complete diagnostics and the one bounded targeted repair rather than failing before repair where that can be done safely;
- genuinely unsafe/unparseable output remains fail closed.

The correction must be generic across courses and subject shapes. It must not encode wording that only makes the current synthetic fixtures pass.

## Cost review after first completed v2 soak

The Bootstrap Cost Strategy requires a review after the first completed v2 live-worker soak.

Observed:

- ceiling: US$5;
- known measured usage: US$0.423906;
- utilisation: 8.47812%;
- sample coverage: complete 20/20;
- no unpriced samples.

Decision: **retain the US$5 Q7 ceiling**. No authority change is required because the evidence supports the existing guardrail rather than changing it.

## Current machine-readable state

`content-factory/reliability-qualification.json` remains fail closed:

- `status: paused`;
- Q1–Q6: `pending` after the Q7 generic contract failure;
- Q7: `pending` / not passed;
- `q7FailureEvidence: content-factory/reliability-v2-e-q7-live-soak-evidence.json`;
- previous V2-D provider-free evidence retained for historical traceability;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

The full-course qualification preflight therefore continues to stop before any live course provider call.

## Next corrective work

The next governed PR should be implementation-focused and must not itself perform a paid Q7 run. It should:

1. correct the reusable Assessment Item boundary;
2. update Q1 ownership evidence;
3. add the Q7 defect to Q2 as a labelled synthetic reproduction;
4. add five-shape Q3 adversarial variants;
5. update Q4/Q5 evidence for the corrected semantics;
6. rerun Q6 provider-free stability;
7. produce a new exact-head provider-free qualification record.

Only after that provider-free correction is merged may a new bounded Q7 request be made.

## Documentation impact

No normative authority changes are required. The Reliability Qualification Standard v2.0 and Bootstrap Cost Strategy already define the required response to this result.

The technical harness, V2-E technical record, machine-readable qualification state, execution plan and durable Q7 evidence are updated together. Historical Pilot records and prior V2 evidence remain historically accurate and are not rewritten.

No learner-facing product behavior changes. `INDEX.md` does not require a new entry because this harness remains the existing indexed technical source for Content Factory reliability qualification.

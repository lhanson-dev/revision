# Content Factory Reliability Qualification Harness

## Status

The Content Factory remains **paused for full-course live execution**.

Reliability v2 progressed through:

- V2-A — compiler-first Marking Pack hardening and complete diagnostics;
- V2-B — historical failure replay corpus;
- V2-C — adversarial provider-free mutation matrix;
- V2-D — provider-free Q1–Q6 qualification;
- V2-E — bounded Q7 live-worker soak.

The first completed Q7 live soak ran on approved `main` `69d7abb7d3236616b687cbed480e7584ceb69fc9` as workflow run `33265434110` / run number `16`. It executed all 20 governed samples and uploaded evidence, but exposed a new generic Assessment Item provider-contract class. Q7 therefore did not pass.

That Assessment Item boundary has now been corrected in the governed post-Q7 reliability change. The corrected implementation adds a dedicated compiler boundary that admits the parseable omission class far enough to collect complete diagnostics, permits at most one validator-directed repair, then strictly recompiles and revalidates the entire Assessment Item. The correction is generic across course shapes and does not weaken the shared provider client.

Current provider-free evidence is:

- `content-factory/reliability-post-q7-assessment-item-requalification.json`;
- `content-factory/reliability-q7-assessment-item-contract-defect.json`.

The current machine-readable state records **Q1–Q6 PASS again**, keeps Q7 `pending`, keeps `status: paused`, keeps `qualifiedEvidence: null` and keeps `livePilotEligible: false`.

A fresh bounded Q7 live-worker soak is therefore the next reliability activity after this correction reaches approved `main`. It must be requested separately. This correction PR does not itself trigger paid provider execution.

The active governing authority is `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0. A separate Q8 eligibility transition remains unavailable until a later Q7 PASS exists.

## Historical trigger and evidence preservation

Confirmation Pilot #18 remains the historical trigger for Reliability v2 and is not rewritten:

- approved content head: `ed3bd4c4a50dd723da38952a41ff9bad084ad68d`;
- workflow run: `33239396439` / run number `18`;
- durable job: Issue `#234`;
- failure class: generic Marking Pack operational-rubric provider-contract weakness after targeted repair;
- cumulative provider spend: `US$1.253632`;
- nothing was published.

The original V2-D record also remains historical evidence that Q1–Q6 passed on its then-current implementation. The first Q7 result does not rewrite that fact. Instead, Q7 exposed a new live-provider contract class, which correctly reopened the affected gates. The new post-Q7 record is append-only current evidence that the corrected Assessment Item boundary has now requalified Q1–Q6 provider-free.

## Reliability v2 objective

The factory should behave like a compiler boundary around variable model output:

`model educational judgement → compiler-owned structure → complete deterministic diagnostics → at most one targeted repair → whole-artifact revalidation → valid artifact or fail closed`

The target is not perfect first-pass model output. The target is that expected model variability does not require an engineer to change TypeScript, schemas or prompts between ordinary courses.

## Qualification sequence

### V2-A — complete-diagnostic validation and compiler ownership — complete

V2-A removed the known Pilot #18 serial-defect Marking Pack behavior and moved mechanically constructible Marking Pack structure into Revision-owned compilation where educational meaning allowed.

Technical record: `docs/technical/Content Factory Reliability v2-A Marking Pack Compiler.md`.

### V2-B — historical failure replay corpus — complete and extended

The permanent corpus records Pilots #1–#18 reusable contract classes using exact historical output where lawfully retained and labelled synthetic reproductions where exact output is unavailable.

Q7 added one additional reusable Assessment Item class. Because the live-soak artifact retained the durable failure signature and sample evidence but not the raw provider candidate, the post-Q7 evidence adds a clearly labelled synthetic reproduction rather than falsely claiming verbatim provider-output replay.

Current Q2 evidence proves that the reproduced omission class now reaches the intended complete-diagnostic and bounded-repair boundary and is either fully recompiled/revalidated or truthfully rejected after the single repair.

Technical record: `docs/technical/Content Factory Reliability v2-B Historical Failure Replay Corpus.md`.

### V2-C — adversarial mutation matrix — complete and extended

The provider-free matrix covers all five governed subject shapes and near-boundary/simultaneous defects.

The post-Q7 requalification extends Assessment Item coverage for omitted and simultaneous subquestion-level:

- `maxMark`;
- `requirementIds`;
- `coverageEvidence` and required locator structure.

It exercises all five governed subject shapes, valid repaired output, simultaneous omissions, and repair-failure/fail-closed behavior.

Technical record: `docs/technical/Content Factory Reliability v2-C Adversarial Mutation Matrix.md`.

### V2-D / post-Q7 provider-free Q1–Q6 qualification — PASS

V2-D historically established Q1–Q6 PASS with three governed repetitions under varied seeds/order.

The first Q7 soak exposed the additional Assessment Item class and correctly reopened Q1–Q6. The new current evidence is:

`content-factory/reliability-post-q7-assessment-item-requalification.json`

It records:

- **Q1 PASS** — top-level governed Assessment Item target fields remain deterministically derived; subquestion mark allocation and requirement/evidence mapping are classified as targeted-repair eligible because fabricating those values would invent educational judgement; remaining defects after one repair fail closed;
- **Q2 PASS** — the Q7 omission class is retained as a labelled synthetic reproduction and replayed through the corrected boundary;
- **Q3 PASS** — five subject shapes exercise missing and simultaneous subquestion structure, successful repair and fail-closed repair failure;
- **Q4 PASS** — the corrected Assessment Item boundary composes with the deterministic full pipeline reaching `expert_review_ready` without provider calls or publication;
- **Q5 PASS** — Assessment Item durable semantics advance to `2+output-integrity-v3`, invalidating Assessment Item outputs and genuine downstream dependants while leaving unrelated Learn/Practice outputs reusable;
- **Q6 PASS** — the corrected five-shape boundary and deterministic pipeline are repeated three times provider-free under varied governed ordering.

Historical V2-D evidence remains unchanged and is no longer used as the current provider-free qualification pointer.

### V2-E — bounded live worker soak — first run completed, Q7 pending

The canonical runtime remains:

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

This remains classified historically as:

`assessment_subquestion_required_structure_omission_before_targeted_repair`

It was a new generic engineering/provider-contract class, not a set of subject-specific educational findings. That historical failure is retained even though the reusable boundary has now been corrected provider-free.

A new Q7 soak must run on the corrected approved-main implementation before Q7 can become PASS.

Technical record: `docs/technical/Content Factory Reliability v2-E Live Worker Soak.md`.

Durable first-run evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence.json`.

### V2-F — Q8 eligibility transition — blocked

V2-F is not yet eligible.

Only after a later Q7 PASS may a separate governed PR restore:

- `status: qualified`;
- `livePilotEligible: true`;
- exact qualification evidence binding;
- next paid run class `confirmation_pilot`.

Pilot #19 must not run before that transition merges.

## Corrected Assessment Item ownership and compiler boundary

The Q7 defect did not justify making all Assessment Item marks/references compiler-owned.

Top-level governed target fields remain deterministic when an Assessment Item policy exists. Revision constructs top-level `componentId`, `questionFamilyId`, `requirementIds`, `format` and `maxMark` from governed inputs rather than asking the provider to duplicate them.

Subquestion `maxMark`, requirement allocation and coverage-evidence mapping can encode educational judgement. The post-Q7 correction therefore does **not** invent those values. Instead it:

1. accepts only a bounded parseable candidate shape at the Assessment Item-specific provider/compiler boundary;
2. normalizes semantically empty optional units without fabricating required content;
3. collects the complete actionable subquestion defect set;
4. permits one validator-directed repair when the defect is repair eligible;
5. compiles top-level deterministic fields;
6. strictly revalidates the entire final Assessment Item;
7. fails closed if any required educational/contract defect remains.

The shared OpenAI structured-worker client remains strict and unchanged for other workers. Marking Pack keeps its existing compiler-first v2 boundary.

This is a generic course-agnostic correction rather than a fixture- or Business-specific prompt patch.

## Cost review after first completed v2 soak

The Bootstrap Cost Strategy requires a review after the first completed v2 live-worker soak.

Observed:

- ceiling: US$5;
- known measured usage: US$0.423906;
- utilisation: 8.47812%;
- sample coverage: complete 20/20;
- no unpriced samples.

Decision: **retain the US$5 Q7 ceiling**. No authority change is required because the evidence supports the existing guardrail rather than changing it.

The post-Q7 correction and Q1–Q6 requalification use zero provider calls and therefore add no paid reliability spend.

## Current machine-readable state

`content-factory/reliability-qualification.json` remains fail closed for full-course execution:

- `status: paused`;
- Q1–Q6: `pass` on the post-Q7 provider-free requalification;
- Q7: `pending`;
- current provider-free evidence: `content-factory/reliability-post-q7-assessment-item-requalification.json`;
- historical first-Q7 failure evidence retained at `content-factory/reliability-v2-e-q7-live-soak-evidence.json`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

The full-course qualification preflight therefore continues to stop before any live course provider call.

The Q7 live-worker-soak preflight can become eligible only when this state is present on approved `main`. A new Q7 request remains a separate governed action and is deliberately not included in the Assessment Item correction PR.

## Next work

After the Assessment Item correction and provider-free requalification merge to approved `main`:

1. create a fresh governed Q7 bounded-live-worker-soak request without changing the US$5 safety envelope;
2. run the same production Assessment Item and Marking Pack boundaries across the five governed subject shapes;
3. retain per-sample provider/model/contract/repair/cost evidence;
4. classify any controlled educational fail-closed result separately from generic engineering contract failure;
5. if Q7 passes, record Q7 PASS in a short governed evidence PR while keeping overall status paused;
6. only then create the separate V2-F/Q8 eligibility PR.

No full-course confirmation pilot should run before Q8 merges.

## Documentation impact

No normative authority changes are required. The Reliability Qualification Standard v2.0 and Bootstrap Cost Strategy already define the required response to the first Q7 result.

This technical harness and the V2-E technical record are updated because the implementation/evidence state changed materially. The machine-readable qualification state and tests are updated in the same governed PR. Historical Pilot records, the original V2-D evidence and first-Q7 evidence remain historically accurate and are not rewritten.

No learner-facing product behavior changes. `INDEX.md` does not require a new entry because this harness remains the existing indexed technical source for Content Factory reliability qualification.

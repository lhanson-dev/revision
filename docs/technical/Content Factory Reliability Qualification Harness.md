# Content Factory Reliability Qualification Harness

## Status

The Content Factory reliability gate is **qualified after the post-Pilot-17 provider-free Q1–Q6 requalification and this separate Q7 eligibility transition**.

The governed sequence is now:

1. post-Pilot-16 Q1–Q6 requalification and a separate Q7 transition made approved `main` `f9a9cde3e98faca3b1e17b5d575d4282677f06cc` eligible for Confirmation Pilot #17;
2. Pilot #17 ran as workflow `33221401966` with durable job Issue `#230` and failed closed during assessment-item generation because an optional `context.dataPoints[0].unit` was supplied as an empty string;
3. PR #231 corrected the generic assessment-item provider boundary and merged as approved `main` `d5fe9e8bc2eee82f0236711361739abe129e782a`;
4. because that correction changed a previously qualified contract boundary, paid execution was deliberately returned to `paused`;
5. PR #232 merged the fresh provider-free Q1–Q6 requalification evidence onto approved `main` `519aee37d796791cdca302e0d77b0da2c25f1b74`;
6. this separate Q7 transition changes the global `content-factory/reliability-qualification.json` to `qualified` and `livePilotEligible: true`, binding eligibility to the Q1–Q6 evidence already merged on approved `main`.

The next paid end-to-end run is therefore eligible only as a **fresh confirmation pilot**. Qualification does not imply educational correctness, publication approval or awarding-body endorsement.

The governing authority remains `80-company-workflows/Content Factory Reliability Qualification Standard.md`. No normative rule is changed by this status transition.

## Pilot #17 historical evidence

Pilot #17 remains historical evidence and is not rewritten:

- approved content head: `f9a9cde3e98faca3b1e17b5d575d4282677f06cc`;
- workflow run: `33221401966` / run number `17`;
- durable job: Issue `#230`;
- final state: `blocked` from `generating`;
- exact failure class: `provider_contract_failure` at `context.dataPoints[0].unit`;
- cumulative observed provider spend: `US$0.670242`;
- remaining course budget: `US$19.329758`;
- retries: `0`;
- human interventions: `0`;
- executed workers: `37`;
- reused workers: `0`;
- independent educational review was not reached;
- nothing was published.

This was a generic provider-representation contract defect, not an educational `fail_hold` and not an infrastructure/provider-availability incident.

## Corrected provider boundary

The assessment-item schema defines `context.dataPoints[].unit` as optional. The corrected live provider boundary therefore treats a semantically empty optional representation as absence rather than educational content:

- `unit: ""` → omit `unit`;
- whitespace-only `unit` → omit `unit`;
- omitted `unit` → remain omitted;
- non-empty units such as `%`, `£`, `kg` and `£000` → preserve exactly;
- non-string `unit` values → leave untouched so the strict schema rejects them;
- blank required `label` or `value` → leave untouched so the strict schema rejects them;
- all other assessment-item content → unchanged.

This correction is **deterministically derived normalization** of an optional mechanical representation. It does not invent educational meaning and does not justify another provider call.

The normalizer is scoped to the assessment-item structured-output request. Other Content Factory worker responses are not passed through this rule.

## Durable dependency semantics

The changed worker boundary advanced:

`generateAssessmentItem: 2+output-integrity-v1 → 2+output-integrity-v2`

The dependency-aware cache therefore treats pre-v2 assessment-item executions as incompatible with the corrected boundary. Genuine downstream dependants such as Marking Pack generation and independent review are invalidated, while unrelated Learn and Practice outputs remain reusable where their dependency closure is unchanged.

Issue #230 remains a blocked historical job. Provider-contract failures are not part of the operational/infrastructure resume path, so it is not resumed under the corrected implementation.

## Qualification evidence model

Historical evidence is layered rather than rewritten:

- `content-factory/reliability-contract-inventory.json` through `content-factory/reliability-q6-repeated-stability.json` remain the original Q1–Q6 qualification records;
- `content-factory/reliability-post-pilot16-requalification.json` remains the provider-free evidence for the implementation that enabled Pilot #17;
- Pilot #16 workflow/Issue #226 remains historical educational `fail_hold` evidence;
- Pilot #17 workflow `33221401966` / Issue #230 remains historical provider-contract failure evidence;
- `content-factory/reliability-post-pilot17-requalification.json` is the provider-free Q1–Q6 overlay for corrected approved implementation `d5fe9e8bc2eee82f0236711361739abe129e782a`, merged to approved `main` by PR #232;
- approved evidence-bearing `main` for the Q7 transition is `519aee37d796791cdca302e0d77b0da2c25f1b74`;
- `content-factory/reliability-qualification.json` remains the current global paid-pilot eligibility record consumed by the live preflight.

The post-Pilot-17 requalification record deliberately contains:

- `providerCallsUsed: false`;
- `paidPilotEligible: false`;
- `globalQualificationRequiredState: paused`.

Those values remain historically and semantically correct. Q1–Q6 prove reliability evidence only. This separate Q7 status transition is the governed permission step that restores paid confirmation eligibility.

## Q1 — worker-contract inventory

The post-Pilot-17 overlay classifies the changed assessment-item fields using the governed ownership vocabulary:

- optional `context.dataPoints[].unit` absence representation → **deterministically derived**;
- non-empty unit content → **generative judgement**, preserved as provider-authored structured context;
- required data-point `label` and `value` validity → **fail closed** when structurally invalid.

No Business-specific or quantitative-course-specific exception is introduced.

Primary executable evidence:

- `src/content-factory/openai-assessment-item-provider-normalizer.ts`;
- `src/content-factory/openai-assessment-item-provider-normalizer.test.ts`;
- `src/content-factory/durable-worker-dependencies.ts`;
- `src/content-factory/post-pilot17-requalification.test.ts`.

## Q2 — provider-free contract matrix

The corrected boundary is challenged provider-free for:

- omitted optional units;
- empty optional units;
- whitespace-only optional units;
- legitimate `%`, `£`, `kg` and composite display units;
- blank required values;
- invalid non-string units;
- valid first-pass output with no extra provider call;
- continued deterministic injection of governed assessment target fields outside provider authorship.

The strict assessment schema remains the authority for genuinely invalid output. Normalization is not a general repair mechanism.

## Q3 — subject-shape matrix

The same five governed course shapes remain required:

- quantitative/business/economics;
- mathematics;
- science;
- essay/humanities;
- language/prescribed-text.

All five continue through the shared provider-free contract-integration pipeline to `expert_review_ready`.

The post-Pilot-17 overlay additionally probes the optional-unit boundary with materially different representations:

- quantitative data with a semantically empty optional unit;
- a science measurement with a legitimate unit;
- context-free mathematics with no context object;
- humanities and language/text contexts with no fabricated unit metadata.

This proves process compatibility only. It does not constitute factual, pedagogical or awarding-body approval.

## Q4 — deterministic pipeline simulation

The full provider-free simulation traverses:

`requested → identified → sourced → mapped → generating → validating → independent_review → remediation when applicable → expert_review_ready`

with no external provider calls and no publication side effect.

The post-Pilot-17 requalification composes that simulation with the corrected assessment boundary by first passing a synthetic assessment response carrying an empty optional unit through `normaliseAssessmentItemOptionalUnits` and the same strict assessment-item worker schema. The resulting normalized item is valid without weakening downstream validation, after which the full deterministic pipeline reaches `expert_review_ready`.

## Q5 — restart, reuse and dependency-aware invalidation

Qualification continues to use:

`method + exact input fingerprint + transitive worker-contract dependency fingerprint`

rather than Git head alone.

The current evidence proves:

- `generateAssessmentItem` uses `2+output-integrity-v2`;
- the assessment-item dependency closure does not acquire unrelated Learn or Practice dependencies;
- Marking Pack and independent review do depend on assessment-item output and therefore invalidate when that semantic boundary changes;
- unchanged compatible work remains reusable;
- the Q5 durable-resume suite continues to prove truthful spend/retry provenance after reuse.

## Q6 — repeated qualification stability

The governed repetition count is **3**.

The current Q6 suite repeats:

- five subject-shape pipelines per repetition → `15` subject-shape pipeline runs;
- one deterministic full-pipeline simulation per repetition → `3` deterministic pipeline runs;
- one complete restart/reuse scenario set per repetition → `3` restart/reuse scenario sets.

The post-Pilot-17 boundary regressions are part of the same exact-head unit/qualification suite. All requalification evidence is provider-free.

A single successful live-provider response is not used as reliability qualification evidence.

## Q7 — paid confirmation eligibility

Q7 remains deliberately separate from Q1–Q6 evidence generation.

The live-pilot execution sequence remains:

`workflow_dispatch → checkout/install → reliability qualification preflight → only if qualified: paid live pilot`

This Q7 transition changes the global record to:

- `status: qualified`;
- `livePilotEligible: true`;
- `qualifiedEvidence.qualificationEvidenceMainSha: 519aee37d796791cdca302e0d77b0da2c25f1b74`;
- `qualifiedEvidence.requalificationRecord: content-factory/reliability-post-pilot17-requalification.json`;
- `qualifiedEvidence.providerCallsUsed: false`;
- all Q1–Q6 gates in `passedGates`;
- Q6 repetition count `3`;
- next paid run class `confirmation_pilot`.

The executable Q7 regression proves the same fail-closed preflight used by the live workflow accepts this state, while the workflow still places the preflight before the paid live-adapter step and exposes no bypass.

This status transition does **not** execute provider calls. It only makes a future manually initiated paid confirmation pilot eligible to proceed past preflight.

A future confirmation pilot remains subject to:

- source-rights and provenance controls;
- the US$20 per-course ceiling;
- deterministic validation;
- independent educational review;
- expert/human review authority;
- the Content Accuracy Assurance Gate;
- publication governance.

If another live pilot exposes a new generic reliability defect, the failure remains fail-closed and must be handled under the active Reliability Qualification Standard rather than by repeated unchanged paid reruns.

## Documentation impact

This Q7 transition updates current implementation state only:

- updates `content-factory/reliability-qualification.json` from paused to qualified with evidence bound to approved `main` `519aee37d796791cdca302e0d77b0da2c25f1b74`;
- updates `src/content-factory/q7-qualification-status.test.ts` so the actual live-pilot preflight must accept the qualified state and historical Pilot #17 evidence remains unchanged;
- updates this indexed technical qualification record.

It does **not** alter the active Reliability Qualification Standard, product behaviour, educational authority, live-pilot workflow ordering or historical Pilot #10–#17 evidence.

No `INDEX.md` update is required because this file is already the indexed technical source for the Content Factory reliability qualification harness.

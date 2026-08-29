# Content Factory Reliability Qualification Harness

## Status

The Content Factory reliability gate remains **paused after Confirmation Pilot #17**, while the corrected assessment-item boundary has now been put through a fresh provider-free Q1–Q6 requalification.

The sequence is:

1. post-Pilot-16 Q1–Q6 requalification and a separate Q7 transition made approved `main` `f9a9cde3e98faca3b1e17b5d575d4282677f06cc` eligible for Confirmation Pilot #17;
2. Pilot #17 ran as workflow `33221401966` with durable job Issue `#230` and failed closed during assessment-item generation because an optional `context.dataPoints[0].unit` was supplied as an empty string;
3. PR #231 corrected the generic assessment-item provider boundary and merged as approved `main` `d5fe9e8bc2eee82f0236711361739abe129e782a`;
4. because that correction changed a previously qualified contract boundary, paid execution was deliberately returned to `paused`;
5. `content-factory/reliability-post-pilot17-requalification.json` now records the fresh provider-free Q1–Q6 evidence for that corrected implementation;
6. the global `content-factory/reliability-qualification.json` remains paused and must not be changed to `qualified` in the same requalification change.

A further paid confirmation pilot is not eligible until a **separate governed Q7-style status transition** is exact-head assured, explicitly Founder-approved and merged.

The governing authority remains `80-company-workflows/Content Factory Reliability Qualification Standard.md`. No normative rule is changed by this technical requalification.

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

The assessment-item schema already defines `context.dataPoints[].unit` as optional. The corrected live provider boundary therefore treats a semantically empty optional representation as absence rather than educational content:

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

The changed worker boundary advances:

`generateAssessmentItem: 2+output-integrity-v1 → 2+output-integrity-v2`

The dependency-aware cache therefore treats pre-v2 assessment-item executions as incompatible with the corrected boundary. Genuine downstream dependants such as Marking Pack generation and independent review are invalidated, while unrelated Learn and Practice outputs remain reusable where their dependency closure is unchanged.

Issue #230 remains a blocked historical job. Provider-contract failures are not part of the operational/infrastructure resume path, so it is not resumed under the corrected implementation.

## Qualification evidence model

Historical evidence is layered rather than rewritten:

- `content-factory/reliability-contract-inventory.json` through `content-factory/reliability-q6-repeated-stability.json` remain the original Q1–Q6 qualification records;
- `content-factory/reliability-post-pilot16-requalification.json` remains the provider-free evidence for the implementation that enabled Pilot #17;
- Pilot #16 workflow/Issue #226 remains historical educational `fail_hold` evidence;
- Pilot #17 workflow `33221401966` / Issue #230 remains historical provider-contract failure evidence;
- `content-factory/reliability-post-pilot17-requalification.json` is the current provider-free Q1–Q6 overlay for corrected approved `main` `d5fe9e8bc2eee82f0236711361739abe129e782a`;
- `content-factory/reliability-qualification.json` remains the current global paid-pilot eligibility record consumed by the live preflight.

The post-Pilot-17 requalification record deliberately contains:

- `providerCallsUsed: false`;
- `paidPilotEligible: false`;
- `globalQualificationRequiredState: paused`.

Passing Q1–Q6 therefore proves reliability evidence only. It does not itself authorize external model spend.

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

The existing full provider-free simulation continues to traverse:

`requested → identified → sourced → mapped → generating → validating → independent_review → remediation when applicable → expert_review_ready`

with no external provider calls and no publication side effect.

The post-Pilot-17 requalification composes that simulation with the corrected assessment boundary by first passing a synthetic assessment response carrying an empty optional unit through `normaliseAssessmentItemOptionalUnits` and the same strict assessment-item worker schema. The resulting normalized item is valid without weakening downstream validation, after which the full deterministic pipeline still reaches `expert_review_ready`.

## Q5 — restart, reuse and dependency-aware invalidation

Qualification continues to use:

`method + exact input fingerprint + transitive worker-contract dependency fingerprint`

rather than Git head alone.

The current evidence proves:

- `generateAssessmentItem` now uses `2+output-integrity-v2`;
- the assessment-item dependency closure does not acquire unrelated Learn or Practice dependencies;
- Marking Pack and independent review do depend on assessment-item output and therefore invalidate when that semantic boundary changes;
- unchanged compatible work remains reusable;
- the existing Q5 durable-resume suite continues to prove truthful spend/retry provenance after reuse.

## Q6 — repeated qualification stability

The governed repetition count remains **3**.

The current Q6 suite repeats:

- five subject-shape pipelines per repetition → `15` subject-shape pipeline runs;
- one deterministic full-pipeline simulation per repetition → `3` deterministic pipeline runs;
- one complete restart/reuse scenario set per repetition → `3` restart/reuse scenario sets.

The post-Pilot-17 boundary regressions are part of the same exact-head unit/qualification suite. All requalification evidence is provider-free.

A single successful live-provider response is not used as reliability qualification evidence.

## Q7 — paid confirmation eligibility

Q7 remains deliberately separate.

The live-pilot execution sequence remains:

`workflow_dispatch → checkout/install → reliability qualification preflight → only if qualified: paid live pilot`

While `content-factory/reliability-qualification.json` is `paused`, a new live pilot must fail before external model calls. There is no workflow-input or environment-variable bypass.

Restoring paid eligibility requires, in order:

1. corrected implementation on approved `main`;
2. provider-free Q1–Q6 requalification on the corrected implementation;
3. this requalification evidence merged to approved `main`;
4. a separate governed Q7-style status PR changing the global record to `qualified` / `livePilotEligible: true` only when the approved evidence supports it;
5. exact-head assurance and explicit Founder approval for that status PR;
6. only then, a fresh paid confirmation pilot.

Reliability qualification is not educational correctness, publication approval or awarding-body endorsement. Any future confirmation pilot remains subject to source rights, the US$20 course ceiling, deterministic validation, independent educational review, expert/human review authority, the Content Accuracy Assurance Gate and publication governance.

## Documentation impact

This requalification change updates current implementation evidence only:

- adds `content-factory/reliability-post-pilot17-requalification.json`;
- adds `src/content-factory/post-pilot17-requalification.test.ts`;
- updates this indexed technical qualification record.

It does **not** alter the active Reliability Qualification Standard, product behavior, educational authority or historical Pilot #10–#17 evidence.

No `INDEX.md` update is required because this file is already the indexed technical source for the Content Factory reliability qualification harness.

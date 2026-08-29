# Content Factory Reliability Qualification Harness

## Status

The Content Factory reliability gate is **paused after Confirmation Pilot #17**.

The post-Pilot-16 provider-free Q1–Q6 requalification and separate Q7 status transition correctly made approved `main` `f9a9cde3e98faca3b1e17b5d575d4282677f06cc` eligible for a fresh confirmation pilot. Confirmation Pilot #17 then ran as workflow `33221401966` with durable job Issue `#230`.

The qualification preflight passed. The paid pipeline progressed through source/alignment work, all Learn/Practice work units, Assessment Blueprint generation, Question Family generation and one successful assessment item. A later assessment-item provider response supplied an optional `context.dataPoints[0].unit` as an empty string. The strict assessment-item contract requires an optional unit either to be omitted or, when present, to contain a non-empty value. The worker therefore failed closed during `generating` before independent educational review.

Pilot #17 evidence records:

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
- no independent-review, expert-review or publication stage was reached.

This is not an educational `fail_hold` like Pilot #16 and it is not an infrastructure/provider-availability failure. It is a generic provider-representation contract defect. The historical Pilot #17 run, workflow evidence and Issue #230 remain unchanged.

The current remediation deliberately returns `content-factory/reliability-qualification.json` to:

- `status: paused`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

A further paid pilot must not run until the corrected assessment-item boundary has passed provider-free requalification and a separate governed Q7-style status transition restores eligibility.

The governing standard is unchanged. This document records current implementation and qualification evidence; it does not replace `80-company-workflows/Content Factory Reliability Qualification Standard.md`.

## Pilot #17 correction

The defect is narrower than the assessment-item educational contract itself. `context.dataPoints[].unit` is already optional. A unitless quantity is therefore valid, but a provider may encode the absence of a unit either by omitting the field or, as Pilot #17 demonstrated, by returning an empty/whitespace-only string.

The corrected live provider boundary now applies one deterministic normalization before the existing strict domain schema consumes assessment-item output:

- `unit: ""` → omit `unit`;
- whitespace-only `unit` → omit `unit`;
- non-empty units such as `%`, `£`, `kg` or `£000` → preserve exactly;
- non-string unit values → unchanged and therefore rejected by the existing schema;
- required data-point `label` and `value` fields → unchanged and still fail closed when blank;
- all other assessment-item fields → unchanged.

This is classified as **deterministically derived normalization** of an optional mechanical representation. It does not alter educational meaning and does not justify an extra provider call.

The normalization is scoped to the `content-factory.assessment-item` structured-output request rather than to every provider response. Other worker contracts retain their existing behavior.

## Durable dependency semantics

Pilot #17 changes the effective assessment-item worker boundary, so `generateAssessmentItem` advances from:

`2+output-integrity-v1`

to:

`2+output-integrity-v2`

The existing dependency graph then invalidates genuine downstream dependants, including Marking Pack generation and independent review, while preserving unrelated compatible stages such as identity, source discovery, Course Knowledge Model, Learn and Practice when their own dependency fingerprints remain unchanged.

Issue #230 is a historical blocked confirmation-pilot job and is not treated as resumable by the live runner. Provider-contract failures are deliberately excluded from the operational/infrastructure resume path. A future paid confirmation run must therefore be a fresh governed job after requalification.

## Qualification evidence model

Historical qualification evidence is not rewritten.

The evidence layers remain:

- original Q1–Q6 qualification records: historical evidence for the first qualified implementation;
- `content-factory/reliability-post-pilot16-requalification.json`: historical provider-free evidence for the implementation that enabled Pilot #17;
- Pilot #16 workflow/Issue #226: historical educational `fail_hold` evidence;
- Pilot #17 workflow `33221401966` / Issue #230: historical provider-contract failure evidence;
- `content-factory/reliability-qualification.json`: current global paid-pilot eligibility consumed by the live-pilot preflight.

The current global record is paused because the implementation being corrected is no longer identical to the implementation proven by the post-Pilot-16 Q1–Q6 evidence.

## Q1 — worker-contract inventory

The existing historical inventory remains intact. The next provider-free requalification must explicitly layer the Pilot #17 ownership rule onto the assessment-item boundary:

- optional `context.dataPoints[].unit` absence representation → **deterministically derived normalization**;
- non-empty unit content → preserved provider-authored structured context;
- required `context.dataPoints[].label` and `.value` → **fail closed** when structurally invalid;
- assessment-item educational wording, context and question design → **generative judgement** subject to the existing assessment-integrity and educational-assurance gates.

No Business-specific rule is introduced.

## Q2 — provider-free contract matrix

Provider-free regressions for the corrected boundary must prove at minimum:

- an omitted optional unit remains valid;
- empty and whitespace-only optional units normalize to absence;
- legitimate non-empty units including `%`, `£`, `kg` and composite display units remain unchanged;
- a blank required data-point value still fails closed;
- non-string invalid units still fail closed under the existing schema;
- normalization causes no second provider call;
- governed assessment target fields continue to be injected deterministically and remain outside provider authorship.

These tests use synthetic/generic assessment content and do not claim Business-specific educational approval.

## Q3 — subject-shape matrix

The five required course shapes remain:

- quantitative/business/economics;
- mathematics;
- science;
- essay/humanities;
- language/prescribed-text.

The next requalification must ensure the optional-unit normalization does not assume that all assessment contexts are quantitative or require units. In particular, unitless data and context-free assessment items must continue to pass without fabricated metadata.

Synthetic fixtures prove process compatibility only. They do not constitute factual, pedagogical or awarding-body approval.

## Q4 — deterministic pipeline simulation

The provider-free full-pipeline simulation must continue to traverse:

`requested → identified → sourced → mapped → generating → validating → independent_review → remediation when applicable → expert_review_ready`

without paid provider calls.

The corrected simulation must include at least one assessment-item response carrying a semantically empty optional unit and prove that the deterministic boundary normalizes it without weakening later assessment validation or publication controls.

## Q5 — restart, reuse and dependency-aware invalidation

Semantic worker-cache compatibility continues to use:

`method + exact input fingerprint + transitive worker-contract dependency fingerprint`

rather than Git head alone.

The next requalification must prove that `generateAssessmentItem` `output-integrity-v2` invalidates assessment items and genuine downstream dependants while unrelated Learn/Practice artifacts remain reusable where their dependency closure is unchanged. Spend and retry provenance must remain truthful after reuse.

## Q6 — repeated qualification stability

A single unit regression is not sufficient to restore qualification. The applicable provider-free qualification suites must pass repeatedly against the corrected assessment-item semantic boundary, including the five subject shapes, deterministic pipeline simulation and restart/reuse scenarios required by the Reliability Qualification Standard.

The technical requalification record must state the exact approved implementation head, repetition count and evidence. Provider calls must remain zero during requalification.

## Q7 — paid confirmation eligibility

Pilot #17 demonstrated that the post-Pilot-16 Q7 transition was correctly enforced: the live workflow passed its qualification preflight only after the prior evidence and Founder-approved status transition were on approved `main`.

Pilot #17 also exposed a new generic contract class. The current remediation therefore re-pauses Q7 eligibility. The live-pilot workflow remains fail closed:

`workflow_dispatch → checkout/install → reliability qualification preflight → only if qualified: paid live pilot`

There is no workflow input or environment-variable bypass. While the global status is paused, a newly dispatched paid pilot must fail before external model calls.

Restoring paid eligibility again requires:

1. corrected implementation merged to approved `main`;
2. provider-free requalification of the corrected boundary and its affected Q1–Q6 evidence;
3. a separate governed Q7-style status transition with exact-head assurance and explicit Founder merge approval;
4. only then, a fresh paid confirmation pilot.

Any future confirmation pilot remains subject to source-rights, the US$20 per-course ceiling, deterministic validation, independent educational review, expert/human review authority, the Content Accuracy Assurance Gate and publication governance.

Reliability qualification does not constitute educational correctness, awarding-body endorsement or publication approval.

## Documentation impact

This Pilot #17 remediation updates:

- the live OpenAI compatibility boundary to normalize semantically empty optional assessment-item units;
- provider-free assessment-item regression coverage;
- assessment-item durable dependency semantics;
- `content-factory/reliability-qualification.json` to re-pause paid execution;
- `src/content-factory/q7-qualification-status.test.ts` to prove the fail-closed pause;
- this indexed technical qualification record.

No normative authority change is required. The active Reliability Qualification Standard already requires generic contract correction, provider-free requalification after a defect and a separate governed Q7 transition before renewed paid eligibility.

No `INDEX.md` change is required because this file is already the indexed implementation source for Content Factory reliability qualification. Historical Pilot #10–#17 evidence and prior qualification records remain historical evidence and are not rewritten.

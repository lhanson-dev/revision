# Content Factory Reliability Qualification Harness

## Status

Course-agnostic Content Factory reliability qualification is active. Paid end-to-end live pilots remain paused by `content-factory/reliability-qualification.json`.

The governing rule is `80-company-workflows/Content Factory Reliability Qualification Standard.md`. This document records implementation and qualification evidence; it does not replace that authority.

Approved `main` reviewed for this Q4 increment is `50b7d47054f9535c2d3cc62a1063cea35e89adfc`, which includes Q1 reconciliation, the completed Q2 provider-free contract matrix and the merged Q3 subject-shape matrix.

Current gate position on this branch:

- **Q1 — PASS:** worker-contract ownership is inventoried and the two previously identified generic blockers are retained as resolved evidence.
- **Q2 — PASS:** material provider boundaries have provider-free contract evidence with no open Q2 gap.
- **Q3 — PASS:** all five governed subject/course shapes use the same controlled contract-integration pipeline to `expert_review_ready`.
- **Q4 — PASS on this branch:** one complete provider-free course build traverses the governed pipeline, receives material independent-review findings, performs targeted remediation, persists a corrected head, revalidates, independently re-reviews and packages only for expert review.
- **Q5–Q6 — not yet complete.**
- **Overall qualification — paused.**
- **Paid confirmation pilot — not eligible.**

Q1–Q4 PASS do not authorize another paid pilot. Only after Q1–Q6 pass may a separate governed, Founder-approved qualification PR change the overall machine-readable status to `qualified` and `livePilotEligible: true`.

## Why the calibration method changed

Pilot #15 ran from approved `main` commit `7df79c28ae0f72610cbb28f9c01f366f85aa2c0d` as workflow run `33149356421` and durable Issue `#209`.

It stopped from `mapped` with:

`Practice work unit marketing-research evidence for data interpretation is not an exact excerpt from the generated learner content`

Pilot #10 had already moved Learn and Practice exact evidence to bounded locators resolved deterministically by Revision. Reappearance of the failure class demonstrated that repeated whole-course paid pilots were lower-value evidence than systematic provider-free qualification.

Historical Pilot #10–#15 evidence remains unchanged.

## Live-pilot boundary

Approved `main` contains a fail-closed preflight before any paid live-pilot model call:

`workflow_dispatch → checkout/install → reliability qualification preflight → only if qualified: paid live pilot`

There is no workflow input or environment-variable bypass. `content-factory/reliability-qualification.json` deliberately remains:

- `status: paused`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

## Q1 — worker-contract inventory

`content-factory/reliability-contract-inventory.json` inventories the generic material boundaries for Course Knowledge Model, Learning Blueprint, Learn generation, Practice generation, Assessment Blueprint, Question Family generation, assessment-item generation, Marking Pack generation, deterministic validation, independent review, remediation and expert-review package assembly.

Every mechanically checked representation is classified under the governed ownership vocabulary: generative judgement, deterministic derivation, bounded locator/reference, targeted repair eligible, or fail closed.

The inventory records `status: complete` and `q1Pass: true`. Current blockers are empty. The two previously identified blocker IDs remain retained as `resolvedBlockers` so reconciliation is auditable rather than erased.

### Q1-PRACTICE-EVIDENCE-PATH — resolved

The Practice evidence contract remains a bounded locator/reference contract. The provider identifies a supported Practice mode, one-based activity index and allowed evidence field; Revision resolves the exact generated string.

The downstream defect was representation handling: validation searched a JSON-serialized representation, so quotes and line breaks could differ from the already-resolved learner-content string. Validation now recursively inspects actual generated string leaves.

Provider-free evidence in `src/content-factory/q2-practice-evidence-contract.test.ts` covers supported Practice modes and fields, invalid locations, paraphrase rejection and quoted/multiline exact evidence.

### Q1-MARKING-PACK-DUPLICATE-AO-ARITHMETIC — resolved

Structured Marking Packs no longer ask the provider to author aggregate AO arithmetic that Revision can derive from validated subquestion allocations.

Educational AO judgement remains at subquestion level; Revision derives the structured aggregate; provider-authored duplicate structured aggregate arithmetic fails closed.

Provider-free evidence is in `src/content-factory/q2-marking-pack-ao-contract.test.ts` and `src/content-factory/openai-assessment-integrity-compiler.ts`.

## Q2 — provider-free contract matrix

The Q2 machine-readable record is `content-factory/reliability-q2-contract-matrix.json` and records `q2Pass: true` with `paidPilotEligible: false`.

All Q1 material boundaries are represented. Evidence covers valid first-pass behaviour, malformed output, invalid or duplicate references, bounded locators, exact-evidence handling, totals/cross-references, demand mismatch and targeted repair where applicable.

Direct or deterministic Q2 evidence covers:

- Course Knowledge Model contract compilation;
- Learning Blueprint compilation;
- Learn and Practice generation evidence contracts;
- Assessment Blueprint compilation;
- Question Family compilation;
- assessment-item integrity and bounded repair;
- structured Marking Pack AO derivation;
- independent-review binding and decision semantics;
- targeted remediation exact-scope validation;
- deterministic validation and expert-review package assembly.

Valid provider outputs are proven not to require an unnecessary extra provider call. Mechanically invalid output fails closed at the earliest knowable boundary.

## Q3 — subject-shape matrix

The Q3 machine-readable record is `content-factory/reliability-q3-subject-shape-matrix.json`.

The executable fixture harness is `src/content-factory/q3-subject-shape-fixtures.ts`, with regression evidence in `src/content-factory/q3-subject-shape-matrix.test.ts`.

Every Q3 fixture uses the same production contract-integration orchestration entry point:

`runRequestedContentFactoryToExpertReviewReady`

from `src/content-factory/end-to-end-proof.ts`.

Only the synthetic course shape and controlled worker outputs vary. Orchestration, schemas, artifact stores, source-rights checks, learning/assessment factories, deterministic validation, independent review and expert-review packaging remain shared.

The five governed shapes are:

1. **quantitative / business / economics** — formula-driven requirement, quantitative Practice and numeric assessment context;
2. **mathematics** — formula-driven learning and context-free calculation;
3. **science** — formula plus conceptual requirements, mixed course/component learning scope and experimental-observation context across compulsory components;
4. **essay / humanities** — non-quantitative argument, retrieval/application Practice and synthetic source context;
5. **language / prescribed-text** — non-quantitative text analysis, flashcard/application Practice, a synthetic extract and a Question Family reused across components.

For every shape the tests prove the shared contract-integration path reaches `expert_review_ready`, controlled provider executions have zero spend/retries, no fixture needs human intervention, fixture-specific learning modes are exercised through the shared Learning/Practice contracts, generated markable items receive Marking Pack coverage, and expert-review packaging remains bound to the fixture commit.

The Q3 fixtures contain invented educational content. They are process-compatibility evidence only, not factual, pedagogical or assessment-quality approval. Q3 also does not claim live-adapter proof.

## Q4 — deterministic full-pipeline simulation

The Q4 machine-readable record is `content-factory/reliability-q4-deterministic-pipeline-simulation.json`.

The executable simulation harness is `src/content-factory/q4-deterministic-pipeline-fixture.ts`, with regression evidence in `src/content-factory/q4-deterministic-pipeline-simulation.test.ts`.

Q4 deliberately uses controlled/stored responses and the same `runRequestedContentFactoryToExpertReviewReady` production contract-integration entry point. No external model or source-provider call is made.

The simulation records this state trace:

`requested → identified → sourced → mapped → generating → validating → independent_review → remediation → validating → independent_review → expert_review_packaging → expert_review_ready`

The trace is evidenced at the actual guarded worker/artifact boundaries: source discovery can only run after `identified`; structured evidence after `sourced`; Learning Blueprint planning from `mapped`; generation after `generating`; validation-report writes from `validating`; independent-review workers from `independent_review`; remediation workers from `remediation`; and expert-review package writes from `expert_review_packaging`. The final parsed job must be exactly `expert_review_ready`.

### Deterministic validation boundary

The first generated course pack receives a deterministic PASS tied to the initial synthetic head before independent review is permitted.

The first independent review deliberately returns two material findings:

- one Learn finding tied to the single affected learning work unit;
- one assessment-item finding requiring clearer exact question wording.

After remediation, the corrected content is persisted as one new synthetic head. Deterministic validation runs again against that corrected head and content fingerprint before a second independent review is allowed.

The test requires two PASS validation reports tied respectively to the initial and corrected heads, with different content fingerprints after the correction.

### Targeted remediation and dependent invalidation

The Learn remediation preserves governed identity/provenance and the required exact evidence string while adding only the bounded clarification. The corresponding Practice artifact is not regenerated or replaced.

The assessment-item remediation preserves governed assessment identity/provenance while changing only the permitted demand wording. Because the Marking Pack is genuinely dependent on exact question wording, the correction also rebuilds that Marking Pack. Unrelated Question Family, Learn/Practice and blueprint artifacts are retained.

The remediation record must therefore contain exactly the two targeted replacements, with a dependent old/new Marking Pack reference only on the assessment-item replacement.

The latest course-content-pack manifest must prove:

- original affected Learn ref replaced;
- original unaffected Practice ref retained;
- original assessment-item ref replaced;
- original dependent Marking Pack ref replaced;
- original Question Family ref retained.

This is Q4 correctness evidence for the exercised remediation graph. Broader restart/reuse and semantic dependency invalidation remain Q5.

### Independent-review separation

The first and second independent reviews use distinct fresh contexts. The final independent review must be PASS against the corrected head and the exact post-remediation deterministic content fingerprint.

The expert-review package must bind its deterministic-validation and independent-review evidence to the same corrected head.

### No learner-publication side effect

Q4 terminates at `expert_review_ready`.

The latest manifest remains `publicationStatus: factory_generated_unassured`. No expert-review submission is produced, no human-review state is entered, and the simulation does not execute publication CI, merge/deployment or learner-publication transitions.

This proves the reliability simulation itself cannot silently convert generated content into learner-visible content.

### Q4 limitations

Q4 proves provider-free orchestration behaviour, not educational correctness. It does not prove live external adapter behaviour. It does not satisfy Q5 restart/reuse qualification or Q6 repeated-stability qualification.

## Q5 — restart, reuse and dependency-aware invalidation

Q5 remains required.

Qualification must prove that interruption, correction or worker-contract change does not regenerate unaffected successful work. Evidence must cover:

- reuse of unchanged completed executions across an allowed resume;
- dependency-aware invalidation rather than universal implementation-head invalidation;
- a Practice compiler change not invalidating unrelated Course Knowledge Model or Learn output;
- an assessment compiler change not invalidating unrelated Learn/Practice output;
- source/coverage changes invalidating all genuinely affected downstream output;
- truthful spend/retry provenance after reuse or remediation.

Existing durable-resume tests are useful implementation evidence but Q5 requires an explicit governed qualification record tying those behaviours together against the current dependency model.

## Q6 — repeated qualification stability

Q6 remains required.

A single green deterministic run is insufficient. Final evidence must record repeated Q3 subject-shape and Q4 pipeline passes on the same implementation head, including repetition count, fixtures, worker coverage, restart/reuse scenarios and known limitations.

## Overall qualification and paid confirmation

`content-factory/reliability-qualification.json` deliberately remains unchanged.

After Q5 and Q6 also pass, a separate governed qualification PR may set the overall status to `qualified` and `livePilotEligible: true`. That PR requires exact-head assurance and explicit Founder approval before another paid end-to-end course run is permitted.

The next paid run will be a confirmation pilot, not the primary debugging mechanism.

## Documentation impact

This Q4 increment adds current provider-free deterministic pipeline-simulation evidence. It does not change normative policy, learner-facing behaviour, production runtime logic or paid-pilot eligibility.

Updated together:

- `content-factory/reliability-q4-deterministic-pipeline-simulation.json`;
- `src/content-factory/q4-deterministic-pipeline-fixture.ts`;
- `src/content-factory/q4-deterministic-pipeline-simulation.test.ts`;
- this technical qualification record.

No change is required to the active Reliability Qualification Standard because it already defines Q4 and the required stage/remediation/no-publication evidence. No `INDEX.md` change is required because the indexed qualification-harness source of truth remains this document. Historical Pilot #10–#15 evidence remains unchanged. Overall reliability status and paid-pilot eligibility remain deliberately paused.

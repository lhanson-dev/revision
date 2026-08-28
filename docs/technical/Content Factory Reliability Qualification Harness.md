# Content Factory Reliability Qualification Harness

## Status

Course-agnostic Content Factory reliability qualification is active. Paid end-to-end live pilots remain paused by `content-factory/reliability-qualification.json`.

The governing rule is `80-company-workflows/Content Factory Reliability Qualification Standard.md`. This document records implementation and qualification evidence; it does not replace that authority.

Approved `main` reviewed for this Q3 increment is `d71d175ccef06fbfa9a9197de32e721578e69852`, which includes the Q1 reconciliation from PR #220 and the completed Q2 provider-free contract matrix from PR #219.

Current gate position on this branch:

- **Q1 — PASS:** the worker-contract ownership inventory is complete and its two previously identified generic blockers have provider-free remediation evidence.
- **Q2 — PASS:** every material worker boundary is evidence-mapped or remediation-evidenced with no open Q2 contract gap.
- **Q3 — PASS on this branch:** all five governed subject/course shapes run through the same controlled contract-integration pipeline to `expert_review_ready`.
- **Q4–Q6 — not yet complete.**
- **Overall qualification — paused.**
- **Paid confirmation pilot — not eligible.**

Q1–Q3 PASS do not authorize another paid pilot. Only after Q1–Q6 pass may a separate governed, Founder-approved qualification PR change the overall machine-readable status to `qualified` and `livePilotEligible: true`.

## Why the calibration method changed

Pilot #15 ran from approved `main` commit `7df79c28ae0f72610cbb28f9c01f366f85aa2c0d` as workflow run `33149356421` and durable Issue `#209`.

It stopped from `mapped` with:

`Practice work unit marketing-research evidence for data interpretation is not an exact excerpt from the generated learner content`

Pilot #10 had already moved Learn and Practice exact evidence to bounded locators resolved deterministically by Revision. Reappearance of the failure class demonstrated that repeated whole-course paid pilots were lower-value evidence than systematic provider-free qualification.

Historical pilot evidence remains unchanged.

## Live-pilot boundary

Approved `main` contains a fail-closed preflight before any paid live-pilot model call:

`workflow_dispatch → checkout/install → reliability qualification preflight → only if qualified: paid live pilot`

There is no workflow input or environment-variable bypass. Paid pilots remain ineligible while `content-factory/reliability-qualification.json` is `paused`.

## Q1 — worker-contract inventory

`content-factory/reliability-contract-inventory.json` inventories the generic material boundaries for Course Knowledge Model, Learning Blueprint, Learn generation, Practice generation, Assessment Blueprint, Question Family generation, assessment-item generation, Marking Pack generation, deterministic validation, independent review, remediation and expert-review package assembly.

Every mechanically checked representation is classified under the governed ownership vocabulary: generative judgement, deterministic derivation, bounded locator/reference, targeted repair eligible, or fail closed.

The inventory records `status: complete` and `q1Pass: true`. Current blockers are empty. The two previously identified blocker IDs remain retained as `resolvedBlockers` with their provider-free evidence so the reconciliation is auditable rather than erased.

### Q1-PRACTICE-EVIDENCE-PATH — resolved

The Practice evidence contract remains a bounded locator/reference contract. The provider identifies a supported Practice mode, one-based activity index and allowed evidence field; Revision resolves the exact generated string.

The defect was downstream representation handling: exact-evidence validation searched a JSON-serialized transport representation, so quotes and line breaks could be escaped differently from the already-resolved exact learner-content string. Validation now recursively inspects actual generated string leaves.

Provider-free evidence in `src/content-factory/q2-practice-evidence-contract.test.ts` covers all five supported Practice modes, all four bounded evidence fields, invalid locations, paraphrase rejection, and quoted/multiline exact evidence.

### Q1-MARKING-PACK-DUPLICATE-AO-ARITHMETIC — resolved

Structured Marking Packs no longer ask the provider to author an aggregate AO allocation that Revision can derive from lower-level validated subquestion allocations.

For structured items, educational AO-allocation judgement remains at subquestion level; each subquestion allocation must reconcile to its governed marks and known objectives; Revision derives the aggregate; and provider-authored structured aggregate arithmetic fails closed.

Provider-free evidence is in `src/content-factory/q2-marking-pack-ao-contract.test.ts` and `src/content-factory/openai-assessment-integrity-compiler.ts`.

## Q2 — provider-free contract matrix

The Q2 machine-readable record is `content-factory/reliability-q2-contract-matrix.json` and records `q2Pass: true` with `paidPilotEligible: false`.

All Q1 worker boundaries appear exactly once. The matrix records direct or supporting provider-free evidence for valid first-pass behaviour, malformed output, invalid or duplicate references, bounded locators, exact-evidence handling, totals/cross-references, demand mismatch and targeted repair where applicable.

Completed direct or deterministic boundaries include:

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

Valid direct provider outputs are proven not to require an unnecessary extra provider call. Malformed or mechanically invalid responses fail closed at the earliest knowable boundary.

## Q3 — subject-shape matrix

The Q3 machine-readable record is `content-factory/reliability-q3-subject-shape-matrix.json`.

The executable fixture harness is `src/content-factory/q3-subject-shape-fixtures.ts`, with regression evidence in `src/content-factory/q3-subject-shape-matrix.test.ts`.

Every Q3 fixture uses the same production contract-integration orchestration entry point:

`runRequestedContentFactoryToExpertReviewReady`

from `src/content-factory/end-to-end-proof.ts`.

Only the synthetic course shape and controlled worker outputs vary. The orchestration, schemas, artifact stores, source-rights checks, learning/assessment factories, deterministic validation, independent review and expert-review packaging path remain shared.

The five governed shapes are:

1. **quantitative / business / economics** — formula-driven requirement, quantitative Practice mode and a numeric assessment context;
2. **mathematics** — formula-driven learning and context-free calculation rather than a case/business scenario;
3. **science** — formula plus conceptual requirements, mixed course/component learning scope, and an experimental-observation context across two compulsory components;
4. **essay / humanities** — non-quantitative argument, retrieval/application Practice and a synthetic source context;
5. **language / prescribed-text** — non-quantitative text analysis, flashcard/application Practice, a synthetic extract and one Question Family reused across two components.

For every shape the test proves:

- the same contract-integration pipeline reaches `expert_review_ready`;
- controlled workers make no external source/model-provider call and report zero usage cost;
- worker retries remain zero;
- no fixture requires human intervention;
- fixture-specific governed learning modes survive into the generated work units;
- every generated markable assessment item receives Marking Pack coverage;
- expert-review packaging remains bound to the fixture's reviewed commit value.

The Q3 fixtures deliberately contain invented educational content. They are process-compatibility evidence only and are **not** factual, pedagogical or assessment-quality approval. The language fixture uses an invented extract and does not copy a real prescribed text.

Q3 also does not claim live-adapter proof. The controlled-worker route exists specifically to remove external provider behaviour and spend from this gate so subject-shape compatibility can be isolated.

## Q4 — deterministic pipeline simulation

Q4 remains required even though the Q3 subject fixtures use the end-to-end contract-integration harness.

Q4 must explicitly prove the governed stage sequence:

`requested → identified → sourced → mapped → generating → validating → independent_review → remediation when applicable → expert_review_ready`

and must verify:

- every required stage transition;
- deterministic validation at the intended boundary;
- at least one targeted remediation against the smallest affected work unit;
- correct dependent-stage invalidation;
- independent-review separation before and after remediation;
- expert-review package assembly;
- no learner publication side effect.

Q3's happy-path subject compatibility must not be used as a substitute for those Q4 failure/remediation assertions.

## Q5 — restart, reuse and dependency-aware invalidation

Qualification must prove that local interruption, correction or worker-contract change does not regenerate unaffected successful work.

Evidence must cover reuse of unchanged completed executions, dependency-aware invalidation, source/coverage invalidation, and truthful spend/retry provenance after reuse or remediation.

## Q6 — repeated qualification stability

A single green deterministic run is insufficient. Final evidence must record repeated Q3 subject-shape and Q4 pipeline passes on the same implementation head, including repetition count, fixtures, worker coverage, restart/reuse scenarios and known limitations.

## Overall qualification and paid confirmation

`content-factory/reliability-qualification.json` deliberately remains unchanged:

- `status: paused`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

After Q4–Q6 also pass, a separate governed qualification PR may set the overall status to `qualified`. That PR requires exact-head assurance and explicit Founder approval before another paid end-to-end course run is permitted.

The next paid run will be a confirmation pilot, not the primary debugging mechanism.

## Documentation impact

This Q3 increment adds current provider-free qualification evidence and test-only synthetic fixture support. It does not change normative policy, learner-facing behaviour, production runtime logic or paid-pilot eligibility.

Updated together:

- the Q3 machine-readable subject-shape matrix;
- the executable Q3 synthetic fixture harness;
- the Q3 regression test;
- this technical qualification record.

No change is required to the active Reliability Qualification Standard because it already requires these five course shapes and explicitly permits synthetic provider-free fixtures. No `INDEX.md` change is required because no source-of-truth location or precedence changes. Historical Pilot #10–#15 evidence remains unchanged. The overall reliability status and paid-pilot eligibility remain deliberately paused.

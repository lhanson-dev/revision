# Content Factory Reliability Qualification Harness

## Status

Course-agnostic Content Factory reliability qualification is active. Paid end-to-end live pilots remain paused by `content-factory/reliability-qualification.json`.

The governing rule is `80-company-workflows/Content Factory Reliability Qualification Standard.md`. This document records implementation and qualification evidence; it does not replace that authority.

Approved `main` reviewed for this Q1 reconciliation is `0e9e7bb7c85ddbc72965a056a84c5d2c864e0659`, which includes the completed Q2 provider-free contract matrix from PR #219.

Current gate position:

- **Q1 — PASS:** the worker-contract ownership inventory is complete and its two previously identified generic blockers have provider-free remediation evidence.
- **Q2 — PASS:** every material worker boundary is evidence-mapped or remediation-evidenced with no open Q2 contract gap.
- **Q3–Q6 — not yet complete.**
- **Overall qualification — paused.**
- **Paid confirmation pilot — not eligible.**

Q1 and Q2 PASS do not authorize another paid pilot. Only after Q1–Q6 pass may a separate governed, Founder-approved qualification PR change the overall machine-readable status to `qualified` and `livePilotEligible: true`.

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

`content-factory/reliability-contract-inventory.json` inventories the generic material boundaries for:

- Course Knowledge Model;
- Learning Blueprint;
- Learn generation;
- Practice generation;
- Assessment Blueprint;
- Question Family generation;
- assessment-item generation;
- Marking Pack generation;
- deterministic validation;
- independent review;
- remediation;
- expert-review package assembly.

Every mechanically checked representation is classified under the governed ownership vocabulary: generative judgement, deterministic derivation, bounded locator/reference, targeted repair eligible, or fail closed.

The inventory now records `status: complete` and `q1Pass: true` against approved `main` `0e9e7bb7c85ddbc72965a056a84c5d2c864e0659`. Current blockers are empty. The two previously identified blocker IDs remain retained as `resolvedBlockers` with their provider-free evidence so the reconciliation is auditable rather than erased.

### Q1-PRACTICE-EVIDENCE-PATH — resolved

The Practice evidence contract remains a bounded locator/reference contract. The provider identifies a supported Practice mode, one-based activity index and allowed evidence field; Revision resolves the exact generated string.

The defect was downstream representation handling: exact-evidence validation searched `JSON.stringify(searchableContent)`, so quotes and line breaks could be escaped differently from the already-resolved exact learner-content string. Validation now recursively inspects actual generated string leaves.

Provider-free evidence in `src/content-factory/q2-practice-evidence-contract.test.ts` proves:

- all five supported Practice modes;
- all four bounded evidence fields;
- invalid mode/index/field fails closed;
- paraphrased evidence fails closed;
- quoted and multiline exact evidence survives downstream validation.

This closes the Q1 ownership blocker without changing the ownership classification.

### Q1-MARKING-PACK-DUPLICATE-AO-ARITHMETIC — resolved

Structured Marking Packs no longer ask the provider to author an aggregate AO allocation that Revision can derive from the lower-level validated subquestion allocations.

For structured items:

- educational AO-allocation judgement remains at subquestion level;
- each subquestion allocation must reconcile to its governed marks and known objectives;
- Revision deterministically derives the aggregate AO allocation;
- provider-authored structured aggregate arithmetic fails closed.

Provider-free evidence is in `src/content-factory/q2-marking-pack-ao-contract.test.ts` and the structured compiler path in `src/content-factory/openai-assessment-integrity-compiler.ts`.

Unstructured Marking Packs retain the existing aggregate contract where there is no lower-level structured representation from which to derive the total.

This closes the duplicated deterministic-authorship blocker while preserving educational judgement where it belongs.

## Q2 — provider-free contract matrix

The Q2 machine-readable record is `content-factory/reliability-q2-contract-matrix.json` and records `q2Pass: true` with `paidPilotEligible: false`.

All Q1 worker boundaries appear exactly once. The matrix records direct or supporting provider-free evidence for valid first-pass behaviour, malformed output, invalid or duplicate references, bounded locators, exact-evidence handling, totals/cross-references, demand mismatch and targeted repair where applicable.

The completed direct provider boundaries include:

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

Next, the same generic contract/pipeline harness must be exercised across fixtures representing:

- quantitative/business/economics;
- mathematics;
- science;
- essay/humanities;
- language or prescribed-text content.

The fixtures prove process compatibility only. They do not constitute educational correctness evidence.

## Q4 — deterministic pipeline simulation

A provider-free complete simulation must traverse:

`requested → identified → sourced → mapped → generating → validating → independent_review → remediation when applicable → expert_review_ready`

It must prove every stage transition, intended deterministic validation, smallest-scope remediation, dependent invalidation, independent-review separation, expert-review package assembly and no learner publication side effect.

## Q5 — restart, reuse and dependency-aware invalidation

Qualification must prove that local interruption, correction or worker-contract change does not regenerate unaffected successful work.

Evidence must cover reuse of unchanged completed executions, dependency-aware invalidation, source/coverage invalidation, and truthful spend/retry provenance after reuse or remediation.

## Q6 — repeated qualification stability

A single green deterministic run is insufficient. Final evidence must record repeated subject-shape and pipeline passes on the same implementation head, including the repetition count, fixtures, worker coverage, restart/reuse scenarios and known limitations.

## Overall qualification and paid confirmation

`content-factory/reliability-qualification.json` deliberately remains unchanged:

- `status: paused`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

After Q3–Q6 also pass, a separate governed qualification PR may set the overall status to `qualified`. That PR requires exact-head assurance and explicit Founder approval before another paid end-to-end course run is permitted.

The next paid run will be a confirmation pilot, not the primary debugging mechanism.

## Documentation impact

This reconciliation changes current qualification evidence, not normative policy or production runtime behaviour.

Updated together:

- the Q1 machine-readable worker-contract inventory;
- the Q1 inventory regression test;
- this technical qualification record.

No change is required to the active Reliability Qualification Standard because it already defines the applicable ownership and Q1/Q2 gate rules. No `INDEX.md` change is required because no source-of-truth location or precedence changes. Historical Pilot #10–#15 evidence is unchanged. The overall reliability status and paid-pilot eligibility remain deliberately paused.

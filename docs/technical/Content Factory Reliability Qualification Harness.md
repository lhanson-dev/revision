# Content Factory Reliability Qualification Harness

## Status

Course-agnostic Content Factory reliability qualification is active. Paid end-to-end live pilots remain paused by `content-factory/reliability-qualification.json`.

The governing rule is `80-company-workflows/Content Factory Reliability Qualification Standard.md`. This document records current implementation and qualification evidence; it does not replace that authority.

Production-verified `main` before this Q2 increment is `f37e8cf9d2471582026093367ecac5ccaf474754`. Q1 produced the complete worker-contract ownership inventory and exposed two generic blockers. Q2 is being delivered as short, provider-free increments rather than another paid whole-course probe.

## Why the calibration method changed

Pilot #15 ran from approved `main` commit `7df79c28ae0f72610cbb28f9c01f366f85aa2c0d` as workflow run `33149356421` and durable Issue `#209`.

It stopped from `mapped` with:

`Practice work unit marketing-research evidence for data interpretation is not an exact excerpt from the generated learner content`

Pilot #10 had already moved Learn and Practice exact evidence to bounded locators resolved deterministically by Revision. Reappearance of the failure class demonstrated that repeated whole-course paid pilots were lower-value evidence than systematic provider-free qualification.

Historical pilot evidence remains unchanged.

## Live-pilot boundary

Approved `main` contains a fail-closed preflight before any paid live-pilot model call:

`workflow_dispatch → checkout/install → reliability qualification preflight → only if qualified: paid live pilot`

There is no workflow input or environment-variable bypass. Paid pilots remain ineligible until Q1–Q6 pass and a Founder-approved qualification PR changes the machine-readable status to `qualified`.

## Course-agnostic worker inventory

`content-factory/reliability-contract-inventory.json` inventories the material generic boundaries for:

1. Course Knowledge Model;
2. Learning Blueprint;
3. Learn generation;
4. Practice generation;
5. Assessment Blueprint;
6. Question Family generation;
7. assessment-item generation;
8. Marking Pack generation;
9. deterministic validation;
10. independent review;
11. remediation;
12. expert-review package assembly.

Every mechanically checked representation is classified under the governed ownership vocabulary: generative judgement, deterministic derivation, bounded locator/reference, targeted repair eligible, or fail closed.

Q1 remains recorded as `complete_with_blockers`, not PASS. Q2 remediation evidence is tracked separately in `content-factory/reliability-q2-contract-matrix.json` until the complete provider-free matrix is ready to reconcile the inventory and gate state.

## Q2 provider-free contract matrix

The Q2 machine-readable progress record is:

`content-factory/reliability-q2-contract-matrix.json`

Q2 must eventually cover every material worker boundary with valid and adversarial provider-free cases required by the Reliability Qualification Standard. This increment deliberately closes one generic defect class only; it does not mark Q2 PASS.

### Practice evidence-path remediation

The Q1 blocker `Q1-PRACTICE-EVIDENCE-PATH` has now been reproduced at the reusable validation boundary.

The bounded locator path itself was correct:

`provider Practice location → mode + one-based activity index + allowed field → Revision resolves exact generated string`

The downstream teaching-point validator then searched for that string inside:

`JSON.stringify(searchableContent)`

That introduced a representation mismatch. Valid generated strings containing JSON-sensitive characters, including quotation marks and line breaks, are escaped by serialization. A locator-resolved exact string could therefore be rejected even though it came directly from the generated learner-content field.

The validator now recursively inspects the actual string leaves in generated content and checks the evidence excerpt against those strings. It no longer treats a serialized JSON transport representation as learner content.

This is course-agnostic and applies equally to Learn and Practice content. It also prevents an apparent excerpt being manufactured by concatenation across separate fields.

Provider-free regression evidence covers:

- all five supported Practice modes: retrieval, flashcard, short answer, application and quantitative;
- all four bounded evidence fields: prompt, expected response, explanation and improvement action;
- exact strings containing quotes and line breaks;
- invalid activity indexes;
- invalid modes and fields;
- paraphrased evidence rejection;
- no fuzzy matching;
- existing adapter tests covering all 31 non-empty Practice-mode combinations and one provider call for valid output.

The synthetic fixtures are intentionally generic and make no claim about educational subject accuracy.

### Remaining Q1 blocker: Marking Pack aggregate AO arithmetic

`Q1-MARKING-PACK-DUPLICATE-AO-ARITHMETIC` remains unresolved in this increment.

Current Marking Pack validation still accepts provider-authored aggregate `assessmentObjectiveAllocation` and checks the aggregate arithmetic. Where structured subquestion guidance already contains the underlying allocations, Revision should derive the aggregate deterministically and validate genuine educational allocation choices at the lower-level guidance boundary.

That remediation is the next short Q2 increment. It must preserve strict mark/AO reconciliation and must not weaken the Content Accuracy Assurance Gate.

## Existing provider-contract evidence reused by Q2

The provider-free suite already contains useful generic evidence that Q2 can reuse rather than duplicate, including:

- strict Practice schemas for all 31 non-empty combinations of the five Practice modes;
- deterministic injection of activity IDs and modes;
- bounded Learn/Practice evidence locators;
- fail-closed invalid locator behaviour;
- assessment response-demand validation with one bounded repair path;
- failure after the permitted repair;
- independent-review structured-contract tests.

Q2 will inventory these tests against the exact worker matrix and add missing adversarial cases instead of rewriting working assurance.

## Subject-shape matrix — Q3

After Q2, the same generic contracts must be exercised across quantitative/business/economics, mathematics, science, essay/humanities, and language or prescribed-text fixtures. Those fixtures prove process compatibility only, not educational correctness.

## Deterministic pipeline simulation — Q4

A provider-free complete simulation must traverse:

`requested → identified → sourced → mapped → generating → validating → independent_review → remediation when applicable → expert_review_ready`

It must prove strict validation, smallest-scope remediation, dependent invalidation, independent-review separation, expert-review packaging and no learner publication.

## Restart, reuse and invalidation — Q5

Qualification must prove dependency-aware reuse so that unrelated successful work is not regenerated after a local contract or implementation change. Practice changes must not automatically invalidate unrelated Learn or Course Knowledge Model artifacts; assessment changes must not regenerate unrelated teaching content; source/coverage changes must invalidate genuine dependants; spend and retry provenance must remain truthful.

## Repeated stability — Q6

A single synthetic green run is insufficient. Final qualification evidence must state the exact implementation head, commands, fixtures, worker coverage, repetition count, restart/reuse scenarios and known limitations.

Only then may a governed PR set `content-factory/reliability-qualification.json` to `qualified` and `livePilotEligible: true`.

## Documentation impact

This Q2 increment changes implementation truth, not the normative reliability standard. The existing standard already requires exact evidence to use bounded locators and provider-free adversarial qualification.

This increment therefore updates the implementation validator, provider-free regressions, the Q2 machine-readable progress record, and this technical harness. It deliberately does not change the normative standard, historical Pilot #15 evidence, the overall qualification status, or paid-pilot eligibility.

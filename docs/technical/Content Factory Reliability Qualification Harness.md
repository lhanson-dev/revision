# Content Factory Reliability Qualification Harness

## Status

Course-agnostic Content Factory reliability qualification is active. Paid end-to-end live pilots remain paused by `content-factory/reliability-qualification.json`.

The governing rule is `80-company-workflows/Content Factory Reliability Qualification Standard.md`. This document records current implementation and qualification evidence; it does not replace that authority.

Production-verified `main` before this Q2 increment is `85bfac90901238c38ad724fc3048abce5c441b6c`. Q1 produced the complete worker-contract ownership inventory and exposed two generic blockers. Both blocker classes now have provider-free Q2 remediation evidence, but Q2 remains incomplete across the wider worker matrix and no qualification PASS is claimed.

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

Q1 remains recorded as `complete_with_blockers`, not PASS, until the machine-readable inventory is deliberately reconciled against completed Q2 evidence. Q2 remediation evidence is tracked separately in `content-factory/reliability-q2-contract-matrix.json` while the full provider-free matrix is still incomplete.

## Q2 provider-free contract matrix

The Q2 machine-readable progress record is:

`content-factory/reliability-q2-contract-matrix.json`

Q2 must eventually cover every material worker boundary with valid and adversarial provider-free cases required by the Reliability Qualification Standard. The current short increments close identified generic defect classes without pretending that the whole Q2 gate has passed.

### Practice evidence-path remediation

The Q1 blocker `Q1-PRACTICE-EVIDENCE-PATH` has been reproduced at the reusable validation boundary.

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

### Marking Pack aggregate AO remediation

The Q1 blocker `Q1-MARKING-PACK-DUPLICATE-AO-ARITHMETIC` is now remediated at the structured provider/compiler boundary.

Previously, a structured Marking Pack could ask the model to author both:

- AO allocations for each subquestion; and
- the aggregate AO allocation for the whole assessment item.

Revision then mechanically checked the aggregate even though it could be calculated from the already-generated subquestion allocations. That was duplicated model authorship of deterministic arithmetic.

For structured items, the Marking Pack compiler contract now requires the provider to leave top-level `assessmentObjectiveAllocation` empty. The provider retains genuine educational judgement at the subquestion level: which permitted assessment objectives receive which marks. Revision then:

1. validates that every subquestion is guided exactly once;
2. validates each guidance mark value against the governed subquestion;
3. validates rewarded demands against the learner-facing task;
4. validates each subquestion AO allocation totals its exact mark value and uses only permitted objectives;
5. sums those validated allocations deterministically into the final aggregate AO allocation;
6. passes that Revision-derived aggregate into downstream Marking Pack validation and assembly.

A provider that tries to supply structured aggregate AO arithmetic now fails closed instead of competing with Revision's deterministic derivation. Valid structured output still uses one provider call. Unstructured Marking Packs retain their existing aggregate allocation contract because there is no lower-level subquestion representation from which the educational allocation can be derived without losing judgement.

Provider-free evidence is in `src/content-factory/q2-marking-pack-ao-contract.test.ts`. The synthetic fixture is science-shaped to reinforce that the correction is not Business-specific.

## Existing provider-contract evidence reused by Q2

The provider-free suite already contains useful generic evidence that Q2 can reuse rather than duplicate, including:

- strict Practice schemas for all 31 non-empty combinations of the five Practice modes;
- deterministic injection of activity IDs and modes;
- bounded Learn/Practice evidence locators;
- fail-closed invalid locator behaviour;
- assessment response-demand validation with one bounded repair path;
- failure after the permitted repair;
- independent-review structured-contract tests.

The next Q2 work is to inventory these tests against the exact remaining worker boundaries and add missing adversarial cases. Paid whole-course probing remains paused.

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

This Q2 increment changes implementation truth, not the normative Reliability Qualification Standard. The active standard already requires deterministic ownership of mechanically derivable mark/AO totals and course-agnostic provider-free qualification.

This increment therefore updates the structured Marking Pack compiler, provider-free regression evidence, the Q2 machine-readable progress record, and this technical harness. It deliberately does not change the normative standard, historical pilot evidence, the overall qualification status, or paid-pilot eligibility.

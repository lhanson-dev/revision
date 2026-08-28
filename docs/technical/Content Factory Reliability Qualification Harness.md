# Content Factory Reliability Qualification Harness

## Status

Course-agnostic Content Factory reliability qualification is active. Paid end-to-end live pilots remain paused by `content-factory/reliability-qualification.json`.

The governing rule is `80-company-workflows/Content Factory Reliability Qualification Standard.md`. This document records current implementation and qualification evidence; it does not replace that authority.

Production-verified `main` before this Q2 increment is `dff54ca9f22e4e574535a3ac7f7d8287c8204f90`. Q1 produced the complete worker-contract ownership inventory and exposed two generic blockers. Both blocker classes now have provider-free Q2 remediation evidence. The Q2 boundary map is active; this increment closes the direct Course Knowledge Model gap while Q2 as a whole remains incomplete and no qualification PASS is claimed.

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

Q1 remains recorded as `complete_with_blockers`, not PASS, until the machine-readable inventory is deliberately reconciled against completed Q2 evidence. Q2 remediation and evidence-mapping progress is tracked separately in `content-factory/reliability-q2-contract-matrix.json` while the full provider-free matrix is still incomplete.

## Q2 provider-free contract matrix

The Q2 machine-readable progress record is:

`content-factory/reliability-q2-contract-matrix.json`

The matrix is a complete boundary map rather than a list of `pending_matrix` placeholders. Every Q1 worker boundary appears exactly once and records current evidence, proven provider-free behaviour and any remaining adversarial gap.

`src/content-factory/q2-contract-matrix.test.ts` machine-enforces that the matrix covers the same worker set as Q1, contains no placeholder state, carries evidence and coverage for every boundary, and cannot claim Q2 PASS or paid-pilot eligibility while any gap remains.

This evidence mapping is intentionally conservative. Existing pipeline or integration tests are not treated as direct provider-contract evidence when they only use mocked workers.

### Course Knowledge Model direct contract

The Course Knowledge Model gap is now closed at the direct model-assisted compiler boundary.

The base provider schema already enforced the required structural fields and unknown prerequisite/related-node references, while the downstream intake pipeline enforced source-rights and Board Alignment compatibility. The direct adapter, however, could still report a provider execution as successful before downstream orchestration rejected a duplicated node identity, invented source/alignment reference or wrong job binding.

The final model-assisted worker factory now layers `openai-course-knowledge-compiler.ts` over the existing assessment and Learning Blueprint hardening. For successful provider output it validates, before returning success:

- the exact Content Factory job binding;
- unique knowledge-node IDs;
- unique source and Board Alignment references within each node;
- source references against the governed curriculum sources supplied to the worker, with requirement-specific source scope for requirement-owned nodes;
- Board Alignment references against the exact component, assessment-objective and assessment-requirement IDs supplied to the worker.

The compiler does not replace educational authorship. Summaries, formulas, misconceptions, contexts, depth and evidence types remain model-authored judgement inside the governed schema. The change only moves mechanically knowable identity/reference checks to the direct worker boundary so invalid output fails immediately rather than being treated as a successful provider execution first.

Provider-free regression evidence is in `src/content-factory/q2-course-knowledge-contract.test.ts`. The fixture is science-shaped and proves:

- valid first-pass output uses exactly one provider call;
- a malformed node fails closed without retry;
- duplicate node IDs fail closed;
- invented source or Board Alignment references fail closed;
- an incorrect job binding fails closed.

This is a generic contract change and does not depend on a Business course.

### Practice evidence-path remediation

The Q1 blocker `Q1-PRACTICE-EVIDENCE-PATH` has been reproduced at the reusable validation boundary.

The bounded locator path itself was correct:

`provider Practice location → mode + one-based activity index + allowed field → Revision resolves exact generated string`

The downstream teaching-point validator then searched for that string inside `JSON.stringify(searchableContent)`, which escaped learner strings containing JSON-sensitive characters. The validator now recursively inspects actual generated string leaves and therefore validates the learner representation rather than a serialized transport representation.

Provider-free regression evidence covers all five supported Practice modes, all four bounded evidence fields, exact strings containing quotes and line breaks, invalid locations, paraphrase rejection, no fuzzy matching and one provider call for valid adapter output.

### Marking Pack aggregate AO remediation

The Q1 blocker `Q1-MARKING-PACK-DUPLICATE-AO-ARITHMETIC` is remediated at the structured provider/compiler boundary.

For structured items, the Marking Pack provider leaves top-level `assessmentObjectiveAllocation` empty. Educational AO allocation judgement remains at subquestion level; Revision validates each subquestion and deterministically derives the aggregate allocation before downstream validation. Provider-authored structured aggregate arithmetic fails closed. Unstructured Marking Packs retain their existing aggregate contract where no lower-level deterministic representation exists.

Provider-free evidence is in `src/content-factory/q2-marking-pack-ao-contract.test.ts` using a science-shaped fixture.

## Q2 evidence mapping result

After this increment, Course Knowledge Model joins Learning Blueprint, Learn generation, assessment-item generation, deterministic validation and expert-review package assembly as mapped boundaries with no current Q2 gap. Practice generation and structured Marking Pack generation remain remediation-evidenced.

Four explicit direct-contract gap groups remain:

- Assessment Blueprint deterministic Board Alignment facts and invalid references;
- Question Family missing/duplicate/unexpected IDs, component/objective references and mark-range bounds on a non-Business fixture;
- independent-review malformed/missing/unknown artifact-reference cases on a non-Business fixture;
- direct remediation contract scope, malformed output and unknown-target failures.

These should be closed in further small provider-free PRs. No paid whole-course probing is needed.

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

This increment changes implementation truth at the Course Knowledge Model provider boundary and updates the technical qualification evidence. It does not change the normative Reliability Qualification Standard: the standard already requires course-agnostic provider-free fail-closed reference validation.

The implementation, direct provider-free regression, Q2 machine-readable matrix and this technical harness are updated together. Historical pilot evidence, the overall reliability qualification status, paid-pilot eligibility and the Q1 historical inventory are deliberately unchanged.

# Content Factory Reliability Qualification Harness

## Status

Course-agnostic Content Factory reliability qualification is active. Paid end-to-end live pilots remain paused by `content-factory/reliability-qualification.json`.

The governing rule is `80-company-workflows/Content Factory Reliability Qualification Standard.md`. This document records current implementation and qualification evidence; it does not replace that authority.

Production-verified `main` before this Q2 increment is `6648a9f8e49b8260ded9fc92ac8288472c8ea4ed`. Q1 produced the complete worker-contract ownership inventory and exposed two generic blockers. Both blocker classes now have provider-free Q2 remediation evidence. The Q2 boundary map is active; this increment closes the direct Assessment Blueprint gap while Q2 as a whole remains incomplete and no qualification PASS is claimed.

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

The Course Knowledge Model gap is closed at the direct model-assisted compiler boundary.

The direct adapter validates the exact job binding, unique knowledge-node IDs, source references against governed curriculum sources, and Board Alignment references against the supplied component/objective/assessment-requirement IDs before returning provider success.

Provider-free regression evidence is in `src/content-factory/q2-course-knowledge-contract.test.ts` using a science-shaped fixture. This is a generic contract change and does not depend on a Business course.

### Assessment Blueprint direct contract

The Assessment Blueprint gap is now closed at the direct model-assisted compiler boundary.

The existing provider schema constrains the Blueprint shape and downstream factory validation binds persisted output to the exact Board Alignment artifact. This increment adds direct boundary validation before provider success is accepted for the mechanically checkable fields supplied to the worker:

- exact Content Factory job binding;
- deterministic Blueprint fingerprint derived from governed component, objective and assessment-requirement inputs;
- exact component coverage with unique component IDs;
- at least one unique Question Family ID per component;
- component mark totals and timings matching governed component facts;
- exact assessment-objective IDs and governed weightings;
- command-demand component references resolving only to governed components, without duplicate references.

The provider retains generative judgement over Question Family planning, component constraints, command/cognitive-demand design, quantitative and synoptic planning, and evidence expectations. The compiler does not introduce subject-specific assumptions.

Provider-free regression evidence is in `src/content-factory/q2-assessment-blueprint-contract.test.ts`. The fixture is language-shaped and proves valid first-pass output uses exactly one provider call; malformed output, mark/timing drift, AO-weighting drift, invalid command-demand references and deterministic binding mismatches all fail closed without provider retry.

The persisted Board Alignment fingerprint remains independently validated by the assessment factory before downstream Question Family and item generation, so the direct compiler and downstream artifact binding remain separate controls.

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

After this increment, Course Knowledge Model and Assessment Blueprint join Learning Blueprint, Learn generation, assessment-item generation, deterministic validation and expert-review package assembly as mapped boundaries with no current Q2 gap. Practice generation and structured Marking Pack generation remain remediation-evidenced.

Three explicit direct-contract gap groups remain:

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

This increment changes implementation truth at the Assessment Blueprint provider boundary and updates the technical qualification evidence. It does not change the normative Reliability Qualification Standard: the active standard already requires course-agnostic provider-free contract validation and fail-closed handling of inconsistent totals and cross-references.

The implementation, direct provider-free regression, Q2 machine-readable matrix and this technical harness are updated together. Historical pilot evidence, the overall reliability qualification status, paid-pilot eligibility and the Q1 historical inventory are deliberately unchanged.

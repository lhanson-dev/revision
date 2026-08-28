# Content Factory Reliability Qualification Harness

## Status

Course-agnostic Content Factory reliability qualification is active. Paid end-to-end live pilots remain paused by `content-factory/reliability-qualification.json`.

The governing rule is `80-company-workflows/Content Factory Reliability Qualification Standard.md`. This document records current implementation and qualification evidence; it does not replace that authority.

Production-verified `main` before this Q2 completion increment is `90344fc18fbbb3e517f5e9b38c8a68443295dbdc`. Q1 produced the complete worker-contract ownership inventory and exposed two generic blockers. Both blocker classes have provider-free Q2 remediation evidence. The Q2 boundary map is now complete on this branch: every material worker boundary is either evidence-mapped or remediation-evidenced with no open Q2 contract gap. This is a Q2 PASS claim only; it is not an overall reliability qualification PASS and does not make paid pilots eligible.

## Why the calibration method changed

Pilot #15 ran from approved `main` commit `7df79c28ae0f72610cbb28f9c01f366f85aa2c0d` as workflow run `33149356421` and durable Issue `#209`.

It stopped from `mapped` with:

`Practice work unit marketing-research evidence for data interpretation is not an exact excerpt from the generated learner content`

Pilot #10 had already moved Learn and Practice exact evidence to bounded locators resolved deterministically by Revision. Reappearance of the failure class demonstrated that repeated whole-course paid pilots were lower-value evidence than systematic provider-free qualification.

Historical pilot evidence remains unchanged.

## Live-pilot boundary

Approved `main` contains a fail-closed preflight before any paid live-pilot model call:

`workflow_dispatch → checkout/install → reliability qualification preflight → only if qualified: paid live pilot`

There is no workflow input or environment-variable bypass. Paid pilots remain ineligible until Q1–Q6 pass and a Founder-approved qualification PR changes the machine-readable overall status to `qualified`.

## Course-agnostic worker inventory

`content-factory/reliability-contract-inventory.json` inventories the material generic boundaries for Course Knowledge Model, Learning Blueprint, Learn generation, Practice generation, Assessment Blueprint, Question Family generation, assessment-item generation, Marking Pack generation, deterministic validation, independent review, remediation and expert-review package assembly.

Every mechanically checked representation is classified under the governed ownership vocabulary: generative judgement, deterministic derivation, bounded locator/reference, targeted repair eligible, or fail closed.

Q1 remains recorded as `complete_with_blockers`, not PASS, until the machine-readable inventory is deliberately reconciled against the completed Q2 evidence. That reconciliation is intentionally not folded into this final Q2 direct-contract increment.

## Q2 provider-free contract matrix

The Q2 machine-readable record is `content-factory/reliability-q2-contract-matrix.json`.

Every Q1 worker boundary appears exactly once and records direct or supporting provider-free evidence and proven behaviour. The matrix now has no `gap_identified` boundary and records `q2Pass: true` while deliberately keeping `paidPilotEligible: false`.

`src/content-factory/q2-contract-matrix.test.ts` machine-enforces that the matrix covers the same worker set as Q1, contains no placeholder state, carries evidence and coverage for every boundary, and can claim Q2 PASS only when every boundary is complete and gap-free. It separately prevents Q2 completion from being confused with overall paid-pilot eligibility.

This evidence mapping is intentionally conservative. Existing pipeline or integration tests are not treated as direct provider-contract evidence when they only use mocked workers.

### Course Knowledge Model direct contract

The Course Knowledge Model gap is closed at the direct model-assisted compiler boundary.

The direct adapter validates the exact job binding, unique knowledge-node IDs, source references against governed curriculum sources, and Board Alignment references against the supplied component/objective/assessment-requirement IDs before returning provider success.

Provider-free regression evidence is in `src/content-factory/q2-course-knowledge-contract.test.ts` using a science-shaped fixture. This is a generic contract change and does not depend on a Business course.

### Assessment Blueprint direct contract

The Assessment Blueprint gap is closed at the direct model-assisted compiler boundary.

The direct compiler validates exact job and deterministic Blueprint fingerprint bindings, exact component coverage, unique Question Family IDs, component marks and timings, exact assessment-objective IDs and weightings, and governed command-demand component references before provider success is accepted.

The provider retains generative judgement over Question Family planning, component constraints, command/cognitive-demand design, quantitative and synoptic planning, and evidence expectations. Provider-free regression evidence is in `src/content-factory/q2-assessment-blueprint-contract.test.ts` using a language-shaped fixture.

### Question Family direct contract

The Question Family gap is closed at the direct model-assisted compiler boundary.

The provider remains responsible for educational assessment-family design: title, skill profile, response shape, context requirements, application/analysis/evaluation demands and common failure modes. Revision directly validates the mechanically governed references and bounds before a successful provider execution is accepted.

Provider-free regression evidence is in `src/content-factory/q2-question-family-contract.test.ts`. The fixture is humanities-shaped and proves valid first-pass output uses exactly one provider call; malformed output, missing/duplicate/unexpected IDs, invalid component scope, unknown objective references and excessive mark ranges fail closed without provider retry.

### Independent review direct contract

The independent-review gap is closed at the direct model-assisted compiler boundary.

The reviewer remains responsible for fresh-context educational and assessment judgement. Revision owns the mechanically governed review binding and scope:

- `workUnitId` is not provider-authored; Revision derives it from the referenced governed artifact when that artifact belongs to a work unit;
- every finding must carry the required structured evidence and correction fields;
- finding identifiers must be unique;
- each finding `artifactRef` must resolve to the exact governed artifact index supplied for review;
- `reviewedCommit` and `contentFingerprint` must exactly match the governed review input;
- blocking/material findings require `fail_hold`, and open minor findings cannot be reported as `pass`.

Provider-free regression evidence is in `src/content-factory/q2-independent-review-contract.test.ts` using a History-shaped fixture. It proves a valid first-pass review uses exactly one provider call and derives the work-unit scope deterministically. Missing evidence, unknown artifact references, duplicate finding IDs, review-binding drift and understated decision metadata all fail closed without provider retry.

The existing assurance pipeline continues to persist the validated independent-review report before any remediation step, preserving separation between review judgement and correction.

### Targeted remediation direct contract

The final Q2 direct-contract gap is closed by `src/content-factory/openai-remediation-compiler.ts` and `src/content-factory/q2-remediation-contract.test.ts`.

The provider remains responsible for the educational correction itself, but Revision now validates the mechanically governed remediation boundary before a successful provider execution is accepted by the live adapter:

- the resolved finding IDs must exactly equal the findings assigned to the target;
- assigned finding artifact references must match the exact governed remediation target;
- Learn and Practice corrections cannot change immutable work-unit, knowledge-model or source provenance;
- Learn and Practice corrections cannot invent a dependent Marking Pack;
- Marking Pack corrections preserve governed question identity, provenance and calibration constraints;
- assessment-item corrections preserve governed identity/provenance and must carry the exact dependent Marking Pack scope required by the corrected question;
- malformed or scope-expanding provider output is converted to a provider-contract failure without a provider retry.

The direct provider-free fixture is mathematics-shaped. A valid targeted correction uses exactly one provider call; malformed output, an unassigned finding, a finding bound to another artifact, changed work-unit identity and invented dependent scope fail closed.

The downstream assurance/remediation orchestration remains authoritative for bundle-wide relationships, versioning, persistence, revalidation and independent re-review. The direct compiler therefore closes the earliest mechanically knowable provider-boundary failures without duplicating the full orchestration layer.

### Practice evidence-path remediation

The Q1 blocker `Q1-PRACTICE-EVIDENCE-PATH` was reproduced at the reusable validation boundary. The downstream teaching-point validator now recursively inspects actual generated string leaves rather than a JSON-serialized transport representation, preserving exact learner-content evidence through quotes and line breaks.

Provider-free regression evidence covers all five supported Practice modes, all four bounded evidence fields, invalid locations, paraphrase rejection and one provider call for valid adapter output.

### Marking Pack aggregate AO remediation

The Q1 blocker `Q1-MARKING-PACK-DUPLICATE-AO-ARITHMETIC` is remediated at the structured provider/compiler boundary.

For structured items, educational AO allocation judgement remains at subquestion level; Revision validates each subquestion and deterministically derives the aggregate allocation before downstream validation. Provider-authored structured aggregate arithmetic fails closed. Unstructured Marking Packs retain their existing aggregate contract where no lower-level deterministic representation exists.

Provider-free evidence is in `src/content-factory/q2-marking-pack-ao-contract.test.ts` using a science-shaped fixture.

## Q2 result

Q2 is complete on this branch. All twelve governed worker boundaries are represented in the matrix, no Q2 contract gap remains, and the matrix records `q2Pass: true`.

This does **not** authorize another paid pilot. The overall reliability qualification remains paused because:

- Q1 must be deliberately reconciled against the two completed Q2 blocker remediations;
- Q3 subject-shape matrix remains to be completed;
- Q4 deterministic full-pipeline simulation remains to be completed;
- Q5 restart/reuse/dependency-aware invalidation remains to be completed;
- Q6 repeated qualification stability remains to be completed;
- only after Q1–Q6 pass may a separate governed qualification PR set `content-factory/reliability-qualification.json` to `qualified` and enable the paid confirmation pilot.

## Subject-shape matrix — Q3

The same generic contracts must next be exercised across quantitative/business/economics, mathematics, science, essay/humanities, and language or prescribed-text fixtures. Those fixtures prove process compatibility only, not educational correctness.

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

This increment changes implementation truth at the targeted-remediation provider boundary and completes the Q2 machine-readable evidence record. It does not change the normative Reliability Qualification Standard: the active standard already requires course-agnostic provider-free contract validation, exact references, smallest-scope remediation and fail-closed handling of malformed or inconsistent provider output.

The implementation, direct provider-free regression, production compatibility export, Q2 machine-readable matrix and this technical harness are updated together. Historical pilot evidence, the overall reliability qualification status, paid-pilot eligibility and the Q1 historical inventory are deliberately unchanged. No authority index change is required because no normative source-of-truth location or precedence has changed.

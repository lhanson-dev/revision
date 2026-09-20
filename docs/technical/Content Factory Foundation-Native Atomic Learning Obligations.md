# Content Factory Foundation-Native Atomic Learning Obligations

**Status:** Current implementation contract after ADR-0027 / PR #354  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Course Learning Blueprint Amendment.md`; `docs/technical/Content Factory Foundation-Native Internal Learning Assets.md`; ADR-0027

## Purpose

Define the deterministic atomic-obligation safeguard used by `course-learning-blueprint-v2` between exact Course Truth and Foundation-native Learn/Practice generation.

The safeguard exists because node-level treatment/capability evidence is necessary but not sufficient. A Course Truth node can contain several distinct formulas, misconceptions, application contexts or evidence demands. One generated worked example, correction or application activity must not silently satisfy all of those structured facts.

## Deterministic derivation

For every exact Course Knowledge Model node in a v2 work unit, `deriveFoundationCourseLearningAtomicTeachingPoints` creates node-bound generation obligations for:

- the node summary;
- every explicit formula or quantitative procedure;
- every explicit misconception;
- every governed application context; and
- every structured evidence demand.

The derived label retains the exact node ID. This means identical-looking facts on two different nodes remain separate obligations.

These labels are assurance metadata derived mechanically from Foundation truth. They do not add curriculum truth and do not need to appear verbatim in learner-facing prose.

Legacy-v1 planning is unchanged. Atomic expansion applies only when the work unit is planned through `course-learning-blueprint-v2`.

## Provider evidence placement

The existing provider coverage-evidence resolver remains the exact-location boundary. When a teaching-point label is an atomic v2 obligation, the resolver applies additional deterministic placement rules before accepting the provider evidence.

### Learn

- Course Truth summary obligations must resolve to the explanation body (`section_explanation` or `section_key_point`).
- Formula/procedure obligations must resolve inside a worked example.
- Misconception obligations must resolve to an explicit misconception correction.
- Other atomic facts still require exact coverage evidence through the normal teaching-point contract.

### Practice

Every atomic obligation must resolve to an **active learner task field**: `prompt` or `expectedResponse`. Passive `explanation` or `improvementAction` evidence cannot satisfy the obligation.

Additional mode ownership applies where the structured fact itself determines the activity form:

- formula/quantitative procedure → `quantitative`;
- governed application context → `application`;
- misconception diagnosis → `retrieval`;
- quantitative/calculation evidence demand → `quantitative`;
- construction/procedure evidence demand → `short_answer`;
- graph/data/framework/context/evaluation/synoptic evidence demand → `application`;
- comparison/analysis/causal/process/exam-response evidence demand → `short_answer`.

Evidence demands that do not mechanically imply one of those modes retain the active-task requirement without inventing a mode from free-form prose.

## Provider instruction / validator alignment

Provider contract v5 must tell the generation worker the same deterministic evidence-placement rules that the post-generation resolver enforces.

The provider instructions therefore derive atomic evidence guidance from `foundation-course-learning-atomic-obligations.ts`, the same implementation boundary that performs the fail-closed validation. In particular:

- Learn explicitly tells the provider that Course Truth summaries belong in section explanation/key-point fields, formulas/procedures in worked-example fields, and misconceptions in explicit misconception corrections;
- Practice explicitly tells the provider that atomic evidence must use an active `prompt` or `expectedResponse`, never passive `explanation` or `improvementAction` fields;
- Practice tells the provider the deterministic formula, context and misconception mode ownership; and
- deterministic evidence-demand mode assignments for the exact work unit are included in the generation instruction.

Generic provider guidance cannot broaden these atomic rules. This prevents a structurally valid provider response from being asked to choose evidence locations that the resolver will deterministically reject.

## Relationship to provider contract v5

Atomic obligations operate alongside the existing v5 node-level proof:

1. the planner derives node classifications, Learn treatments and Practice capabilities;
2. it also expands exact structured Course Truth facts into node-bound atomic required teaching points;
3. provider contract v5 requires exact coverage evidence for every required teaching point;
4. provider contract v5 separately requires exact `(nodeId, Learn treatment)` and `(nodeId, Practice capability)` evidence;
5. the evidence resolver rejects atomic facts placed in passive or incompatible locations; and
6. fresh-context independent review still judges whether the resulting content is educationally and factually sufficient.

The intended proof chain is:

`structured Course Truth fact → exact node → required treatment/capability → exact generated-content evidence location`.

No deterministic check substitutes for semantic independent review.

## Regression protection

The implementation includes regression coverage proving that:

- two nodes with identical-looking structured facts produce separate node-bound obligations;
- a non-Business science node produces the same qualification-neutral derivation behaviour;
- formula and misconception Learn evidence fails closed when placed outside the required educational structure;
- application, misconception and quantitative Practice evidence fails closed when passive or placed in the wrong mode;
- provider-v5 Learn instructions expose the exact atomic Learn placement restrictions enforced by the resolver;
- provider-v5 Practice instructions expose the active-field rule plus deterministic atomic mode ownership; and
- correctly placed atomic evidence is accepted.

The non-Business fixture is an implementation regression only. It does not satisfy the wider governed multi-subject portability proof required before general qualification.

## Historical and assurance boundary

The retained Business generation run `35468029336` and fail-hold assurance run `35504427790` remain immutable legacy evidence. They are not reinterpreted under the atomic v2 contract.

### First v2/v5 Business generation attempt — provider-guidance fail-hold

After PR #354 became Live, a new Business generation was triggered from the unchanged retained Foundation fingerprint `1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`.

Run `35529282623` executed on merged-main commit `cbb36d46b3291e57c766834299e4a526c46b9e42`. Exact source and AI-assured Foundation validation succeeded before generation. The first Learn work unit, `foundation-course-wide-business-context`, then failed closed because provider contract v5 returned the course-wide atomic Course Truth summary at a location that did not satisfy the deterministic Learn evidence-placement rule.

The retained failure artifact is:

- artifact ID `10610951512`;
- digest `sha256:d46fb219c8c17486a80b3407cf2397115ab3e76264f15b51678d723fe42f00a2`;
- generation implementation commit `cbb36d46b3291e57c766834299e4a526c46b9e42`;
- provider contract version `5`;
- one provider generation call;
- reported response cost `$0.034234`;
- learner asset count `0`; and
- overall status `fail_hold`.

This was not a Foundation truth failure. The provider-v5 instruction required exact `coverageEvidence` but did not state the stricter atomic evidence-placement rules later enforced by the resolver. The Practice instruction also generically permitted `explanation` / `improvementAction` evidence even though atomic Practice validation correctly rejects those passive fields.

The failed run is immutable proof evidence and must not be reclassified or overwritten. The remediation aligns provider guidance to the existing deterministic validator; it does not relax the atomic rules or alter the Foundation.

After the remediation is merged and Live, the next Business proof must be a new generation run with new provider contexts from the same unchanged retained Foundation, followed by deterministic and fresh-context independent asset assurance against that exact new bundle.

The historical 16 findings are not considered resolved until a regenerated bundle passes the governed assurance sequence.

## Release boundary

This safeguard changes planning and generation acceptance only. It does not approve the Foundation, assure learner assets or make content publication eligible. Existing qualified-human Foundation approval and derived-asset release gates remain unchanged.

# Content Factory Foundation-Native Atomic Learning Obligations

**Status:** Proposed implementation contract with ADR-0027 / PR #354  
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
- application, misconception and quantitative Practice evidence fails closed when passive or placed in the wrong mode; and
- correctly placed atomic evidence is accepted.

The non-Business fixture is an implementation regression only. It does not satisfy the wider governed multi-subject portability proof required before general qualification.

## Historical and assurance boundary

The retained Business generation run `35468029336` and fail-hold assurance run `35504427790` remain immutable legacy evidence. They are not reinterpreted under the atomic v2 contract.

After ADR-0027 / PR #354 is accepted, the next Business proof must generate a new bundle from the unchanged retained Foundation using `course-learning-blueprint-v2`, then run deterministic and fresh-context independent asset assurance against that exact new bundle.

The historical 16 findings are not considered resolved until the regenerated bundle passes the governed assurance sequence.

## Release boundary

This safeguard changes planning and generation acceptance only. It does not approve the Foundation, assure learner assets or make content publication eligible. Existing qualified-human Foundation approval and derived-asset release gates remain unchanged.

# Content Factory Course Learning Blueprint Planner

**Status:** Implementing in PR #353  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Course Learning Blueprint Amendment.md`; ADR-0027  
**Scope:** Foundation-native Learn/Practice planning and regeneration only

## Purpose

Record the first implementation of the governed Course Learning Blueprint between an exact Foundation and Foundation-native Learn/Practice generation.

This implementation responds to retained Business internal-learning assurance run `35504427790`, which reached valid fresh-context educational review and returned `fail_hold` despite a correct Foundation/provenance chain. The result showed that the legacy planner's coarse explanation/retrieval/formula/application rules were insufficient to guarantee that all structured educational obligations were actually taught and practised.

## Current implementation boundary

`src/content-factory/course-learning-blueprint.ts` derives one versioned node plan from each exact Course Knowledge Model node.

The planner uses only structured Foundation fields:

- node kind;
- formulas;
- misconceptions;
- application contexts;
- evidence types; and
- the Course Truth summary as a retained teaching obligation.

It does not classify nodes by scanning generated learner content and does not add Business-specific topic rules.

`src/content-factory/foundation-internal-learning-assets.ts` groups those node plans through the existing deterministic Foundation revision-area work units. New plans identify themselves as:

`planningModel: course_learning_blueprint_v1`

Legacy work-unit parsing remains supported as `legacy_v1` so retained historical bundles can still be read. Deterministic assurance reconstructs the current plan, which means an old legacy bundle does not silently qualify under the new Blueprint contract.

## Deterministic classification

Blueprint v1 supports mechanically defensible classification from the current Course Knowledge Model shape.

Examples:

- `concept` from concept node kind;
- `procedure_skill` from skill node kind;
- `formula_quantitative` from formula node kind, formula presence or calculation/quantitative evidence demand;
- `application_context` from structured application contexts or contextual/application evidence demand;
- `misconception_risk` from explicit misconceptions;
- `comparison_discrimination` from comparison/comparative evidence demand;
- `relationship_causal` from causal/interrelationship evidence demand;
- `model_framework` from framework evidence demand;
- `analysis_reasoning` from analysis/diagnosis evidence demand;
- `evaluation_judgement` from evaluation/judgement/decision evidence demand; and
- `synoptic_connection` from cross-functional/synoptic evidence demand.

Blueprint classifications that cannot be defended from the current structured Foundation are not guessed. Later schema evolution can make additional characteristics explicit.

## Treatment selection

Every node receives a core explanation and active retrieval route.

The planner then mechanically adds treatments such as:

- worked examples for quantitative nodes;
- procedure modelling for skill nodes;
- structured comparison for comparison/discrimination;
- causal chains for causal relationships;
- framework application for model/framework nodes;
- modelled reasoning for analysis;
- justified judgement for evaluation;
- explicit misconception repair; and
- synoptic connection treatment where the structured evidence requires it.

Existing worker modes remain the execution buckets for this first migration slice. Quantitative requirements create quantitative Practice; higher-order/contextual requirements create application Practice; constructed short-answer Practice is added when a higher-order requirement lacks an application context.

## Derived teaching-point expansion

The most important implementation change is that generation no longer receives only the broad Foundation `skillsOrKnowledge` string for the revision area.

Each node now adds explicit required teaching points for:

1. its Course Truth summary;
2. every formula or quantitative procedure;
3. every misconception to diagnose and repair;
4. every required application context; and
5. every declared evidence demand.

Each derived label also carries the exact node ID in assurance metadata. This prevents two different nodes with the same context or evidence description from satisfying one another accidentally. The node marker is metadata only and is not required in learner-facing prose.

These points enter the existing strict Learn/Practice provider contract. The provider must return exact coverage evidence for every required point, and the downstream validator resolves that evidence into the exact generated learner field.

This is intended to prevent a broad requirement such as “quantitative skills” from passing generation while individual structured contexts such as ratios, graphs or investment appraisal silently disappear.

## Node-specific treatment evidence gate

`src/content-factory/course-learning-blueprint-evidence.ts` adds a deterministic gate after provider evidence has been resolved into exact generated fields.

The gate checks the selected treatment against the same Course Truth node that caused it to be selected rather than merely checking that a mode exists somewhere in the wider revision-area work unit.

For Practice:

- every node must have active prompt/expected-answer evidence in every Practice mode selected for that node;
- formula/procedure obligations must be actively exercised in quantitative Practice;
- every governed application context must be actively exercised in application Practice; and
- misconception obligations must appear in an active task rather than being confined to feedback/explanation text.

For Learn:

- every node must be evidenced in the explanation body;
- nodes requiring worked examples/procedure modelling must have node-specific evidence in a worked example;
- formula/procedure obligations must be evidenced inside a worked example; and
- governed misconceptions must be evidenced inside explicit misconception corrections.

The existing provider contract already returns structured locations and Revision resolves those locations into the complete referenced generated field before this gate runs. The stricter Blueprint validation therefore does not require provider metadata strings to appear in student-facing text and does not replace independent educational review.

## Relationship to the retained Business findings

The new planner targets the systemic failure modes from run `35504427790` without hard-coding the 15 remediation work-unit names.

Examples:

- a quantitative evidence demand now triggers quantitative Practice even when the node has no explicit formula string;
- a calculation for one node cannot make a different quantitative node pass;
- every formula becomes an explicit generation obligation and must be worked through in Learn and calculated in Practice;
- every structured application context becomes an explicit obligation and must be exercised in application Practice rather than optional inspiration;
- every misconception becomes an explicit repair and diagnostic obligation; and
- comparison, analysis and evaluation metadata change the learning treatment instead of being left entirely to provider discretion.

The retained failed content is not edited in place.

## Regeneration and assurance sequence

After PR #353 is merged through the normal Founder gate, the governed Business remediation proof should:

1. use the unchanged retained AI-assured AQA A-level Business 7132 — 2027 Foundation;
2. generate a new Foundation-native Learn/Practice bundle using `course_learning_blueprint_v1`;
3. retain fresh generation contexts and the exact Foundation/Candidate fingerprints;
4. require every generated work unit to pass the node-specific Blueprint treatment evidence gate;
5. run deterministic asset assurance against the new plan;
6. run fresh-context independent educational review of every work unit;
7. inspect whether the 16 prior findings are actually absent rather than assuming the planner change fixed them; and
8. if findings remain, remediate the smallest affected Blueprint/asset scope according to the governing remediation rule.

The previous generation run `35468029336` and assurance run `35504427790` remain immutable historical evidence.

## Release boundary

Nothing in this planner changes the release gate.

Learn and Practice remain pre-production and `pending` until asset assurance passes. Learner publication remains false until the exact Foundation later receives qualified-human approval and all derived-asset release controls pass.

## Known limitations / next proof

Blueprint v1 deliberately uses the structured metadata already present in the Foundation. It does not yet add new Foundation fields for every canonical learning classification, nor does it replace independent educational review with deterministic rules.

The immediate proof is the Business regeneration/re-assurance cycle. A materially different subject must still be used for the fuller portability proof before the Blueprint implementation is treated as generally qualified for multi-subject production.

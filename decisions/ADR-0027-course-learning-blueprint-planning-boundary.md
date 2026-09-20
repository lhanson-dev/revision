# ADR-0027 — Course Learning Blueprint planning boundary

**Status:** Proposed for Founder approval with the implementing PR  
**Date:** 20 September 2026  
**Decision owner:** Founder / Product / Educational Content / Content Factory  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Course Learning Blueprint Amendment.md`; `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`

## Context

Retained AQA A-level Business 7132 — 2027 internal-learning assurance run `35504427790` reached genuine fresh-context educational review after all Foundation identity, provenance and provider-contract checks passed. The result was `fail_hold` with 16 open findings across 15 work units, concentrated in Practice.

The failure pattern was not primarily a Foundation-provenance failure. The retained bundle had been produced by the older Foundation-native planner, whose deterministic obligations were deliberately simple: explanation and retrieval for every work unit, worked example and quantitative Practice when a formula string existed, and application Practice when application contexts existed.

That contract proved controlled generation from the exact Foundation, but it could still treat broad teaching-point coverage as sufficient while omitting specific calculations, contexts, misconceptions or higher-order evidence demands. Examples exposed by the retained assurance include missing negative-correlation Practice, capacity calculation, budget/cash-flow construction, break-even-chart work, labour-productivity calculation and ratio Practice.

The approved Course Learning Blueprint authority requires treatment selection to be requirement-driven and mechanically owned by the system where the Foundation already contains enough structured evidence.

## Decision

Introduce a deterministic Course Learning Blueprint planning boundary between Foundation Course Truth and Foundation-native Learn/Practice generation.

The first version:

1. derives node classifications only from structured Course Knowledge Model fields and governed evidence metadata, not from generated learner content;
2. selects mandatory Learn treatments and active Practice modes mechanically from those classifications;
3. promotes every structured Course Truth summary, formula/procedure, misconception, application context and evidence demand into the work unit's required teaching-point contract;
4. continues to use the existing strict provider schema and downstream teaching-point evidence validator, so those derived obligations cannot be silently omitted from generation metadata;
5. retains the existing Foundation fingerprint, Candidate identity, Coverage Model fingerprint, Course Knowledge Model fingerprint, source references and fresh-context controls unchanged;
6. identifies new work units with `planningModel = course_learning_blueprint_v1` and retains legacy-plan parsing for historical evidence;
7. reconstructs the same deterministic plan during asset assurance, so a retained legacy bundle cannot accidentally be treated as if it satisfied the new Blueprint contract; and
8. remains qualification-agnostic: classification and treatment rules operate on structured educational characteristics rather than Business-specific topic names.

## Classification boundary

The current Course Knowledge Model does not yet carry the full canonical Blueprint classification taxonomy as explicit fields. Version 1 therefore derives only classifications that are mechanically defensible from existing structured metadata.

Examples include:

- `concept` from node kind;
- `procedure_skill` from skill node kind;
- `formula_quantitative` from formula node kind, explicit formulas or quantitative/calculation evidence demands;
- `application_context` from governed application contexts or contextual/application evidence demands;
- `misconception_risk` from explicit misconceptions;
- comparison, causal, model/framework, analysis/reasoning, evaluation/judgement and synoptic classifications from the corresponding structured evidence-demand labels.

The planner must not guess a classification merely because a word appears in free-form learner prose. Unsupported classifications remain a future Foundation/Blueprint-schema evolution rather than a hidden model inference.

## Atomic derived obligations

A broad Foundation curriculum requirement can legitimately contain several structured sub-obligations. To reduce the risk that one broad evidence location masks missing educational work, Blueprint v1 expands each node into required teaching points for:

- the node's Course Truth summary;
- every explicit formula or quantitative procedure;
- every explicit misconception;
- every governed application context; and
- every declared evidence demand.

These are derived planning obligations, not new curriculum truth. They are mechanically traceable to the exact Course Knowledge Model and must not introduce subject content that is absent from the Foundation.

## Historical evidence and regeneration

The successful retained generation run `35468029336` and failed assurance run `35504427790` remain historical evidence of the legacy planning contract. They are not rewritten.

Because the deterministic plan has changed, the correct remediation path is to regenerate affected learner assets from the unchanged Foundation using `course_learning_blueprint_v1`, then run deterministic and fresh-context independent asset assurance again. The implementation must not mutate the old retained bundle in place.

## Human and release boundaries

This decision does not approve the Foundation, assure regenerated assets or make learner publication eligible. Qualified-human Foundation approval remains required before publication, and fresh-context asset assurance remains required before derived assets can pass.

## Portability boundary

A non-Business fixture is included to prove that the derivation mechanism is not hard-coded to Business vocabulary. That is an implementation portability check only; it is not sufficient by itself to declare the complete multi-subject Course Learning Blueprint generally qualified. The wider portability proof required by product/workflow authority remains outstanding.

## Consequences

The Content Factory now has a stronger deterministic translation layer between curriculum truth and learner content. Generative workers still own wording, examples and questions, but they no longer receive only a broad revision-area instruction when the Foundation already exposes more specific formulas, contexts, misconceptions and evidence demands.

Provider output may become larger and slightly more expensive because more obligations must be evidenced. This is an intentional quality trade-off within the existing Content Factory quality-first bootstrap policy; live proof cost and output-size telemetry must be checked before the planner is promoted beyond the Business remediation proof.

## Documentation impact

`docs/technical/Content Factory Course Learning Blueprint Planner.md` records the implementation boundary and Business remediation path. Existing retained generation and failed-assurance records remain historical. The already-approved Course Learning Blueprint authority and workflow amendment remain normative and are not weakened by this ADR.

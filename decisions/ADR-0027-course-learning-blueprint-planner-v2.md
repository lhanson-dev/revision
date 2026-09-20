# ADR-0027 — Course Learning Blueprint planner v2

**Status:** Proposed for Founder approval with the implementing PR  
**Date:** 20 September 2026  
**Decision owner:** Founder / Product / Content Factory  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Course Learning Blueprint Amendment.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`

## Context

The retained AQA A-level Business 7132 — 2027 Learn/Practice generation proof was produced by the original Foundation-native deterministic planner. That planner grouped Foundation requirements by revision area and selected:

- explanation + retrieval for every work unit;
- worked example + quantitative practice when a Course Knowledge Model node contained a formula; and
- application practice when a node contained an application context.

Fresh-context asset assurance run `35504427790` completed all 49 independent work-unit reviews and correctly returned `fail_hold`. It retained 16 findings across 15 remediation targets. The pattern included missing construction practice, graph/chart practice, quantitative work where the node carried quantitative evidence but no stored formula, contextual evaluation, framework/diagnostic application and other treatment gaps.

Those findings demonstrate that the original planner contract is too coarse for the approved Course Learning Blueprint. They do not justify rewriting the retained generated bundle or its historical assurance evidence.

## Decision

Introduce a versioned deterministic Course Learning Blueprint planning contract for new Foundation-native Learn/Practice generation.

### `legacy-v1`

The historical planner remains available solely so retained v1 bundles can be reconstructed and assured against the exact planning rules that created them. Existing retained bundle fingerprints and prior proof evidence are not mutated.

### `course-learning-blueprint-v2`

New Foundation-native generation uses a deterministic learning-design object on every work unit. It derives classifications, Learn treatments and Practice capabilities from structured Course Knowledge Model metadata, including:

- node kind;
- formula presence;
- misconceptions;
- application contexts; and
- structured evidence types such as calculation, construction, interpretation, framework application, analysis, evaluation and diagnosis.

The planner then maps those obligations onto the existing bounded generation modes. Generative workers remain responsible for wording, examples, activities and feedback; they do not decide whether a governed treatment obligation exists.

The implementation is qualification-neutral. It does not hard-code Business topics, requirement IDs or asset templates.

## Compatibility and provenance

The aggregate internal-learning bundle remains schema version 1 for compatibility, but gains an explicit optional `planningContractVersion`.

Absence of that field means the retained historical `legacy-v1` planner. New generation writes `course-learning-blueprint-v2` explicitly and each v2 work-unit plan retains its deterministic learning-design metadata.

Deterministic asset assurance reconstructs the planner version declared by the bundle before comparing the expected and retained work-unit plans. This preserves exact historical replay while preventing a v2 bundle from being assured against legacy rules.

## Assurance consequences

A planner-contract change materially invalidates downstream learner-asset assurance for newly regenerated content. Therefore:

1. the retained run `35504427790` remains historical fail-hold evidence;
2. the retained generation run `35468029336` is not re-labelled or rewritten;
3. Business assets produced under v2 must be generated as a new retained bundle with new generation contexts;
4. deterministic and fresh-context independent asset assurance must run again on that exact new bundle; and
5. if v2 exposes missing or incorrect Course Truth rather than an asset-planning defect, the Foundation must be reopened through its governed Candidate/version process rather than inventing missing truth downstream.

## Scope boundary

This decision implements the first governed planner migration. It does not claim that the planner is generally qualified for all subjects.

The workflow authority still requires a portability proof using at least one materially different qualification before Revision treats the planner as generally proven for multi-subject production.

Exam Prep remains a separate future factory combining Course Truth, Exam Truth and Course Learning Blueprint obligations.

## Documentation impact

`docs/technical/Content Factory Foundation-Native Internal Learning Assets.md` is updated to describe the planner-version boundary and retained fail-hold evidence. The existing `INDEX.md` already locates the governing Course Learning Blueprint, workflow amendment and Content Factory technical contract, so no authority-location change is required for this implementation ADR. The existing Course Learning Blueprint and workflow amendment remain the normative design authority; this ADR records how the current runtime implements that approved decision.

# ADR-0023 — Foundation curriculum and exam coverage reconciliation

**Status:** Proposed for Founder approval with the implementing PR  
**Date:** 5 September 2026  
**Decision owner:** Founder / Content Factory  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`

## Context

Human review of the AQA A-level Business Foundation exposed a specific assurance failure.

Revision's governing model already required complete Course Truth and complete Exam Truth before qualified-human Foundation approval. The new Foundation implementation nevertheless proved completeness only against the requirement set already present inside its governed semantic seed.

That created a self-consistency loop:

`semantic seed → coverage model → Course Truth → deterministic assurance → independent review → human approval pack`

If the semantic seed omitted an applicable specification requirement, the downstream controls could still pass because they proved that Revision had represented everything in the seed, not that the seed represented everything in the applicable curriculum.

The independent review used the supplied Foundation artifacts and rights-safe source metadata rather than a separately verified complete specification reconciliation. The qualified-human review package likewise contained the exact generated Foundation artifacts but no explicit source-led map demonstrating that every curriculum and exam requirement had been captured.

For AQA Business this was particularly avoidable because an earlier repository source-and-coverage record already described a substantially fuller curriculum scope. That earlier evidence was not carried forward as an enforced completeness input to the Foundation-native pipeline.

## Decision

Foundation completeness will be proved through two explicit source-led reconciliations before approval:

1. **Curriculum Coverage Map** — the applicable curriculum hierarchy and lowest-level requirements mapped to Course Truth.
2. **Exam Coverage Map** — the applicable paper/component, assessment and marking requirements mapped to Exam Truth.

The acceptance condition is:

> zero applicable curriculum requirements unmapped to Course Truth, and zero applicable exam/marking requirements unmapped to Exam Truth.

The number of areas, topics, subtopics, semantic nodes or assessment requirements is determined by the authoritative course and cohort. No fixed count is a completeness target.

## Curriculum model

The normal curriculum structure is:

`area → topic → subtopic / explicit requirement → Course Truth`

The specification may use different levels, so the implementation must permit the hierarchy to vary by course.

A parent topic cannot be marked complete merely because some content exists beneath it. Every applicable lowest-level requirement must be represented and traceable.

## Exam model

The normal assessment structure is:

`qualification → paper/component → assessment/marking requirement → Exam Truth`

The map includes all applicable facts and rules needed to understand how the course is examined, including component structure, marks/timing/weighting, assessment objectives and demands, quantitative or other assessment requirements, response expectations, marking/rubric principles and explicit calibration boundaries.

Externally governed numeric facts remain deterministic controls. Unsupported constituent precision must not be invented.

## Assurance boundary

The two maps are upstream assurance inputs, not outputs inferred from generated Foundation content.

Deterministic assurance must prove that:

- every captured curriculum leaf maps to Course Truth;
- every captured exam/marking requirement maps to Exam Truth;
- mappings resolve to the exact retained Foundation artifacts; and
- no applicable requirement is silently omitted.

Independent review must receive enough source-led reconciliation evidence to challenge whether the requirement universe itself is sufficient, rather than reviewing only Revision's internally generated artifacts.

Qualified-human approval packaging must include the same curriculum and exam reconciliation evidence so the reviewer can inspect both completeness and educational/assessment quality.

## AQA A-level Business consequence

The retained AQA 7132 / 2027 Foundation proof and its human-review package remain historical evidence of the previous implementation state. They are not retroactively rewritten.

Before another AQA 7132 Foundation can proceed to qualified-human approval:

1. establish the complete cohort-correct curriculum hierarchy from governed sources;
2. establish the complete cohort-correct exam/marking requirement set;
3. reconcile both against the existing Foundation seed/artifacts;
4. correct omissions or contradictions exposed by that reconciliation;
5. compile a fresh Foundation Candidate and fingerprint; and
6. rerun deterministic assurance, independent review and qualified-human review using the new reconciliation evidence.

The obligation or node count may change. That is an output of correct coverage, not the goal.

## Deliberately excluded

This decision does not govern the quantity of Learn, Practice or Exam Prep material. Those learner-facing factories have not started in the current Foundation workstream and are outside this remediation.

It also does not replace qualified educational/assessment judgement with a mechanical checklist. The maps prove explicit coverage; human experts still judge interpretation, depth, emphasis, authenticity and marking quality.

## Historical records

ADR-0021 and previous Foundation proof artifacts remain historically true about what that implementation generated and assured. They must not be rewritten to imply the new reconciliation boundary existed at that time.

## Documentation impact

This decision is implemented with:

- `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`;
- reusable deterministic source-to-Foundation coverage reconciliation code and tests;
- current Foundation technical documentation describing the two-map boundary; and
- updates to Foundation assurance/review packaging so the maps become part of the reviewed evidence set.

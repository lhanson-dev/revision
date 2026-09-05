# ADR-0023 — Requirement-led Content Factory coverage

**Status:** Proposed for Founder approval with the implementing PR  
**Date:** 5 September 2026  
**Decision owner:** Founder / Content Factory  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`

## Context

Human review of the AQA A-level Business content exposed a control failure that fixed-volume and seed-internal checks could not detect. The system could prove that a generated Foundation contained the exact canonical nodes derived from its governed semantic seed while still failing to prove that the seed itself represented every applicable curriculum and exam obligation.

The legacy Business content pack also asserted fixed produced quantities — for example formula, flashcard and question counts — alongside a claim of complete curriculum coverage. Those quantities can detect accidental implementation drift, but they cannot establish educational completeness.

The failure mode is structural: if the input requirement universe is incomplete, a perfectly deterministic compiler can produce a perfectly reconciled but incomplete Foundation.

## Decision

Content Factory completeness becomes **requirement-led rather than quota-led**.

For an exact course/cohort, the factory must establish a source-led curriculum/exam obligation universe and reconcile the Foundation to it before coverage may be called complete.

The acceptance condition is:

> every applicable obligation is represented and mapped; zero applicable obligations remain unmapped.

There is no target number of obligations, Course Truth nodes or learner assets. Their counts are outputs of the curriculum, assessment model and educational need.

A requirement may map to one semantic item or several. A semantic item may support one or more source-led obligations where that relationship is explicit and valid. The decomposition depth follows the semantics, not a numeric target.

## Numeric facts versus production quotas

The decision does not prohibit numbers.

Externally governed numeric facts remain deterministic controls, including where applicable:

- paper/component marks;
- timings;
- weightings;
- verified question counts or approximate paper shape;
- official quantitative-assessment minimums; and
- other explicit curriculum/assessment numeric requirements.

By contrast, generated-content quantities are not completeness controls. Examples include numbers of notes, formulas, knowledge nodes, flashcards, questions, drills, cases or mocks.

Generated counts may remain as telemetry, regression diagnostics or cost/capacity evidence.

## Compiler boundary

A reusable deterministic requirement-led coverage guard is introduced before downstream semantic completeness can be trusted.

It validates that:

- obligation IDs and semantic item IDs are unique;
- every obligation maps to existing governed semantic content;
- every declared mapping resolves;
- semantic content is reconciled to an obligation or deliberately marked supplemental; and
- missing mappings fail closed with the obligation ID exposed.

This guard does **not** discover the curriculum by itself. Each course profile still needs an evidence-governed obligation ledger or equivalent source-led contract. A ledger derived only by copying the current semantic seed would reproduce the original failure and is not sufficient.

## AQA A-level Business consequence

The existing AQA 7132 / 2027 semantic seed and prior retained proofs remain historical evidence. Their fixed node count is not a future acceptance target.

Before another AQA 7132 Foundation can be claimed curriculum-complete, the profile must establish and reconcile a source-led obligation ledger that includes the applicable curriculum and exam scope. Known human-review examples such as full marketing-mix scope, required strategic financial methods/ratios and assessment interpretation boundaries must be represented because the source requires them, not because a target count is being increased.

Any resulting change in obligation or node count is expected and is not itself a defect.

## Learner-asset consequence

Learn, Practice and Exam Prep factories inherit the same principle.

- Learn produces enough material to teach all applicable approved Course Truth.
- Practice produces enough valid evidence opportunities to cover the required knowledge/skills with suitable breadth, variation and difficulty.
- Exam Prep produces enough material to prepare for all applicable Exam Truth and Course Truth demands.

No asset factory is complete merely because a configured quantity has been generated.

## Assurance consequence

Deterministic assurance should distinguish three questions:

1. **Requirement-universe completeness** — have all applicable source-led obligations been captured?
2. **Foundation reconciliation** — does each captured obligation map to governed Course Truth/Exam Truth?
3. **Asset coverage** — do downstream assets adequately cover the approved Foundation obligations for their educational purpose?

Internal reconciliation cannot substitute for the first question.

Qualified human review remains required for educational accuracy, depth, emphasis and assessment authenticity, but should not be relied upon as the primary detector of machine-readable omissions that source-led reconciliation can prevent.

## Historical records

ADR-0021 remains historically correct that the then-current proof retained 82 canonical atomic obligations. That number describes that implementation state; it is not a continuing target and must not be used to judge future completeness.

Historical proof artifacts and review records are not rewritten.

## Documentation impact

This decision is implemented with:

- `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`;
- `src/content-factory/requirement-led-coverage.ts` and its regression tests;
- removal of fixed generated-asset quantities from Business completeness assertions; and
- an update to current Foundation compilation technical documentation describing the new fail-closed boundary and the remaining course-profile ledger responsibility.

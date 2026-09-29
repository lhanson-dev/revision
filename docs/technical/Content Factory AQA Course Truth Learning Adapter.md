# Content Factory AQA Course Truth Learning Adapter

**Status:** Bounded implementation evidence on PR #424  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Course Learning Blueprint Amendment.md`; `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `70-ai-operating-system/AI Agent Constitution.md`  
**Scope:** AQA A-level Business 7132 — 2027 controlled Content Factory trial

## Purpose

Record the transitional compatibility boundary between the new governed AQA Course Truth projection and the existing Foundation-native Learn/Practice runtime.

The current learner planner consumes the historical `foundationCoverageModelSchema` plus `courseKnowledgeModelSchema`. PR #424 materialises Course Truth and Exam Truth from the reassured Business Subject Foundation, but those outputs are not natively consumed by the existing planner. Without an explicit compatibility boundary, Course Truth could become retained evidence that is detached from the learner-production path.

## Decision

PR #424 adds `scripts/assurance/materialise-aqa-business-7132-learning-adapter.mjs` as a bounded, deterministic adapter.

The adapter:

- requires the exact retained AQA Course Truth projection and exact Business v0.7 Foundation fingerprint;
- projects the 42 governed AQA Course Truth requirements into the existing Foundation coverage schema;
- includes only the canonical Business Foundation nodes referenced by those exact-course requirements rather than all 81 subject nodes;
- preserves canonical Foundation node identities through explicit deterministic alias maps because the legacy schema permits only lowercase identifiers;
- projects learning-shaping Foundation fields needed by Course Learning Blueprint v2, including node kind, explanation, formulas/procedures, misconceptions, application contexts, prerequisites, related nodes and evidence types;
- retains promotion-eligible Subject Foundation source provenance through explicit source aliases;
- keeps Course Truth requirement identity in `boardAlignmentRefs` and coverage requirements;
- fingerprints the compatibility objects deterministically; and
- sets `learnerAssetRegenerationAllowed=false`.

The resulting artifact is **not** a second Course Truth or Subject Foundation. It is a compatibility representation for the current runtime only. Canonical Subject Foundation nodes, Course Truth and Exam Truth remain the governing content objects.

## Runtime proof

`src/content-factory/aqa-course-truth-learning-adapter.test.ts` materialises the exact T6/T7 evidence and adapter, then:

1. parses the adapter coverage object with the existing `foundationCoverageModelSchema`;
2. parses the knowledge object with the existing `courseKnowledgeModelSchema`;
3. feeds both into `planFoundationInternalLearningWorkUnits(..., { plannerVersion: 2 })`;
4. proves all 42 governed AQA requirements produce v2 learning plans;
5. proves the planner's node set exactly matches the Course Truth-selected Foundation-node subset;
6. proves every legacy node identifier maps back to a canonical Foundation node ID; and
7. specifically proves the reassured `BUS-FIN-008` share-market depth reaches the runtime knowledge model, including market-capitalisation teaching and calculation.

The dedicated PR workflow runs this proof before retaining the T6/T7 evidence bundle.

## Safety and release boundary

This adapter does not generate learner content and does not reopen or reinterpret prior Learn/Practice bundles. It does not confer asset assurance, Foundation approval or publication authority.

The T8 exact-course assurance gate remains next. Learner regeneration remains blocked until the governed exact-course sequence permits it.

If exact-course assurance later identifies a defect in Course Truth or reusable Business knowledge, the defect must be remediated in the governing Course Truth / Subject Foundation layer and the adapter regenerated. The adapter must never be patched as an independent source of curriculum truth.

## Migration boundary

The adapter is transitional technical debt. The preferred future state is for the learner-production planner to consume governed Subject Foundation + Course Truth objects natively, eliminating the legacy `courseKnowledgeModel` compatibility projection.

That migration should be handled as a separate governed architecture change because it affects a durable Content Factory runtime boundary. It must preserve existing planner-version replay, provenance, assurance and release controls.

## Documentation impact

No normative authority changes are introduced by this adapter. It implements the already-approved Course Truth → Course Learning Blueprint sequence using a bounded compatibility layer and therefore does not require a new governance amendment.

A future removal of the adapter or native Course Truth runtime migration may require an ADR update because it would change the durable learner-production interface.

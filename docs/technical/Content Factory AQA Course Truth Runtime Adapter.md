# Content Factory AQA Course Truth Runtime Adapter

**Status:** Bounded implementation evidence on PR #424  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Course Learning Blueprint Amendment.md`; `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `70-ai-operating-system/AI Agent Constitution.md`  
**Scope:** AQA A-level Business 7132 — 2027 controlled Content Factory trial

## Purpose

Record the transitional compatibility boundary between the governed AQA Course Truth / Exam Truth projection and the existing Foundation-native Content Factory runtime.

The current learner-production path still consumes historical runtime contracts including Board Alignment, Foundation Coverage, Course Knowledge Model and Assessment Blueprint-compatible structures. PR #424 materialises Course Truth and Exam Truth from the reassured Business Subject Foundation, but those governed objects are not yet native inputs to the current planner. Without an explicit adapter, Course Truth could become retained evidence detached from the learner-production path.

## Decision

PR #424 uses one bounded deterministic adapter: `scripts/assurance/materialise-aqa-business-7132-runtime-adapter.mjs`.

The adapter:

- requires the exact retained AQA Course Truth and Exam Truth projections and exact Business v0.7 Foundation fingerprint;
- projects the 42 governed AQA Course Truth requirements into the current Foundation coverage contract;
- includes only canonical Business Foundation nodes referenced by those exact-course requirements rather than all 81 reusable subject nodes;
- preserves canonical Foundation identities through a deterministic runtime-node crosswalk because historical schemas permit only lowercase identifiers;
- projects learning-shaping Foundation fields needed by Course Learning Blueprint v2, including node kind, explanation, formulas/procedures, misconceptions, application contexts, prerequisites, related nodes and evidence types;
- preserves canonical per-node promotion-source lineage in the adapter crosswalk rather than treating runtime source aliases as new truth;
- builds Board Alignment and Assessment Blueprint compatibility structures only from stable Exam Truth facts and deliberately does not invent question-family quantitative mark allocation;
- preserves the T8 exact-course assurance gate; and
- sets learner regeneration and publication permission to false.

The adapter is **not** a second Course Truth, Exam Truth or Subject Foundation. It is a compatibility representation for the current runtime only. Canonical Subject Foundation nodes, Course Truth and Exam Truth remain the governing content objects.

## Runtime proof

`scripts/assurance/aqa-course-truth-runtime-adapter.test.ts` materialises the exact T6/T7 evidence and runtime adapter, then:

1. parses Board Alignment with the existing `boardAlignmentSchema`;
2. parses coverage with the existing `foundationCoverageModelSchema`;
3. parses Course Knowledge with the existing `courseKnowledgeModelSchema`;
4. parses Assessment Blueprint compatibility with the existing `foundationAssessmentBlueprintSchema`;
5. feeds the exact-course coverage and knowledge model into `planFoundationInternalLearningWorkUnits(..., { plannerVersion: 2 })`;
6. proves all 42 governed AQA requirements produce v2 learning plans;
7. proves the planner node set exactly matches the Course Truth-selected Foundation-node subset;
8. proves every runtime node maps back to a canonical Subject Foundation node; and
9. specifically proves the reassured `BUS-FIN-008` share-market depth reaches the runtime knowledge model, including market-capitalisation teaching and calculation.

The proof is intentionally outside the app `src` TypeScript boundary because it is a Node-side assurance/integration check, not browser/runtime application code. The dedicated PR workflow runs the deterministic T6/T7 proof, materialises the runtime adapter, executes this current-runtime schema/planner proof and only then retains the evidence bundle.

## Safety and release boundary

The adapter does not generate learner content and does not reopen or reinterpret historical Learn/Practice bundles. It does not confer asset assurance, Foundation approval, expert approval or publication authority.

T8 exact-course assurance remains the next governed gate. Learner regeneration remains blocked until that sequence explicitly permits progression.

If exact-course assurance identifies a defect in Course Truth, Exam Truth or reusable Business knowledge, the defect must be remediated in the governing layer and the adapter regenerated. The adapter must never be patched as an independent source of curriculum or assessment truth.

## Migration boundary

The adapter is transitional technical debt. The preferred future state is for learner-production planning to consume governed Subject Foundation + Course Truth + Exam Truth objects natively, eliminating the historical compatibility projection.

That migration should be handled as a separate governed architecture change because it changes a durable Content Factory runtime interface. It must preserve planner-version replay, provenance, assurance and release controls.

## Documentation impact

No normative authority change is introduced by this adapter. It implements the already-approved Subject Foundation → Course Truth / Exam Truth → Course Learning Blueprint sequence through a bounded compatibility layer, so no new governance amendment is required for PR #424.

A future removal of the adapter or native Course Truth runtime migration may require an ADR and technical-contract update because it would change the durable learner-production interface.

# Content Factory v2 — Expert Review Ready Amendment

**Status:** Founder-approved authority amendment — approved 25 August 2026; course/evidence strategy clarification approved 3 September 2026 pending governed merge  
**Owner:** Founder / Product / Content Operations  
**Purpose:** Extend the approved Content Factory so an ordinary course request can be automated from intake through a complete, independently assured package that is ready for qualified subject-expert verification.

## Outcome

The normal Founder interaction should become:

`request exact course → automated factory execution → blocker only when genuinely required → expert_review_ready → qualified expert review → remediation/revalidation → Founder-approved publication`

The Founder should not have to coordinate prompts, generation contexts, individual collateral types, marking-pack construction, assurance retries or review-document assembly.

## Foundational production principle

The Content Factory must treat learner assets as **derived outputs**, not as the course source of truth.

Before high-volume Learn, Practice or Exam Prep collateral is generated, the factory must establish two trusted foundations:

1. **Course Truth** — the complete governed model of what the learner must know and be able to do, represented through exact identity, Board Alignment, specification coverage and the Course Knowledge Model.
2. **Exam Truth** — the governed model of how that knowledge and skill is assessed, represented through the Assessment Blueprint, Question Families, component structure, command/cognitive demand, timing/mark constraints and marking behaviour.

Course Truth and Exam Truth are siblings derived from approved sources. Generated mock exams, questions or learner collateral must never become curriculum authority merely because they were generated first.

The resulting learner outputs are:

- **Learn** — teach and explain Course Truth;
- **Practice** — retrieve, test, apply and improve Course Truth while generating evidence;
- **Exam Prep** — apply Course Truth according to Exam Truth through technique, targeted exam questions, timed work, trusted mocks and the Exam Simulator.

## Human-intervention principle

Automation should proceed without human interruption whenever current authority, approved source-use policy and deterministic state are sufficient.

The factory should stop for human input only when one of these gates is genuinely required:

1. **course-option resolution** — an option/tier/text/pathway cannot be reliably inferred;
2. **source-rights resolution** — licence/use classification is ambiguous or requires a legal/policy decision;
3. **qualified expert assurance** — benchmark credibility requires subject/assessment expertise;
4. **Founder Definition-of-Ready approval** — required before material implementation of this v2 capability;
5. **Founder merge approval** — required for every governed PR under current repository authority.

AI review and automated validation do not replace the qualified-human benchmark gate.

## Canonical v2 production flow

1. course request / official identity pointer;
2. exact course identity and cohort resolution;
3. source discovery and source-rights classification;
4. permitted curriculum/subject authority compilation;
5. structured Board Alignment compilation;
6. structured specification/coverage map;
7. Course Knowledge Model — complete Course Truth;
8. Assessment Blueprint;
9. reusable Question Family / assessment-archetype contracts — complete Exam Truth;
10. Learning Blueprint / work-unit planning using Course Truth and relevant Exam Truth;
11. Revision-authored Learn collateral;
12. Revision-authored Practice collateral;
13. Revision-authored Exam Prep questions, cases, timed sets and representative mock/simulation assets;
14. structured Marking Packs for every markable written item;
15. deterministic validation;
16. independent fresh-context educational/assessment review;
17. targeted remediation and affected-stage revalidation;
18. portable expert review package and machine-readable review contract;
19. `expert_review_ready`;
20. qualified expert review;
21. remediation/revalidation of expert findings where required;
22. benchmark/publication decision through normal governed PR and release controls.

This sequencing does not require assessment collateral to be generated before learning collateral. It requires the **assessment model** to be known before collateral generation so both learning and assessment outputs derive from the same trusted foundations.

## Required first-class artifacts

### Source Licence Register
Machine-readable source identity, educational role, use classification, permission basis, AI-input permission, attribution/restrictions, currency and revalidation metadata. Governed by `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`.

### Board Alignment
Structured qualification-specific facts that map reusable curriculum/subject truth to the exact awarding body/specification/component without treating copied awarding-body prose as reusable content.

At minimum, where applicable:
- awarding body and specification identity;
- cohort validity;
- compulsory/optional components;
- component scope;
- marks/duration/weighting;
- assessment objectives/skills;
- quantitative or other published assessment requirements;
- approved source references and verification status.

### Course Knowledge Model — Course Truth
A reusable subject/course representation that can support multiple learner capabilities rather than acting as a collection of notes.

For each knowledge/skill node, where applicable:
- stable requirement/concept ID;
- plain-language concept/skill summary;
- prerequisites and relationships;
- formulas/quantitative rules;
- common misconceptions;
- application contexts;
- difficulty/depth indicators;
- curriculum/source references;
- board/component mappings;
- learner evidence types that can validly test it.

The intended scope must cover every material examinable curriculum requirement. Generated volume cannot compensate for a missing node or requirement.

### Assessment Blueprint — Exam Truth
Qualification/course-level assessment contract containing, where applicable:
- assessment objectives and weightings;
- component structure;
- question/response families;
- command/cognitive demands;
- mark/timing constraints;
- quantitative/synoptic requirements;
- evidence and evaluation expectations;
- rules needed to generate authentic but Revision-owned assessment material.

### Question Family
Reusable assessment archetype describing a validated question type independently of any one generated question.

A Question Family may define:
- intended skill/AO profile;
- context requirements;
- mark range;
- valid response shape;
- application/analysis/evaluation expectations;
- common failure modes;
- compatible Marking Pack template;
- specialist calibration status.

Together, the Assessment Blueprint and validated Question Families form the operational Exam Truth needed before representative exam assets can be trusted.

### Learning Blueprint
For each coherent requirement or skill cluster, define which learning and practice modes are educationally appropriate before generating collateral.

The system must not force every topic into identical notes/flashcard/MCQ shapes and must not use arbitrary asset quotas as a substitute for coverage.

Each Practice type should cover the full relevant scope that the format can **validly assess**. If the learner prefers one technique, such as flashcards, that technique should provide comprehensive coverage of the knowledge it is capable of testing; it must not be treated as evidence for skills the format cannot validly assess.

Asset quantity is therefore an output of curriculum and assessment coverage. A topic may legitimately require tens or hundreds of retrieval items depending on its content.

### Learner evidence mapping

Every scored Practice and Exam Prep asset should map to the Course Knowledge Model nodes and applicable assessment demand it tests.

This allows performance from different Practice techniques to update the same learner evidence model while retaining the evidence semantics of the activity type.

The factory must support the learner-facing distinction defined in product/evidence authority:

- `Reviewed` records meaningful exposure to Learn material and is a secondary orientation signal;
- `Exam Readiness` is the primary demonstrated-performance signal and is updated from validated Practice and Exam Prep evidence;
- Learn completion does not directly create Exam Readiness;
- unreviewed Learn content must not create an artificial penalty when stronger evidence already demonstrates the relevant knowledge/skill.

### Representative Practice and Exam Prep

Practice question volume should be driven by curriculum/skill coverage and useful variation rather than a universal fixed count.

Full mock examinations and Exam Simulator papers are a higher-assurance asset class than ordinary practice questions. A representative mock must be validated as a whole against Exam Truth, including applicable component structure, marks, timing, question-family mix, command/cognitive demand, coverage, difficulty and marking behaviour.

Revision should prefer a smaller bank of trusted, representative mocks over a larger bank of weakly calibrated papers. Additional variants may be scaled only while preserving the same assurance standard.

### Marking Pack
Every written assessment item eligible for governed assisted marking must have a structured Marking Pack appropriate to its assessment model.

As applicable it contains:
- question identity and exact Revision-owned wording/context;
- maximum mark;
- concepts/requirements assessed;
- AO/skill allocation;
- rubric/level descriptors;
- application requirements;
- analysis/evaluation requirements;
- valid reasoning routes and alternative legitimate arguments;
- indicative content that is non-exhaustive where the model requires judgement;
- misconceptions/invalid reasoning;
- anchor responses with expected marks/ranges where calibrated;
- diagnostic feedback rules;
- improvement actions;
- ambiguity/confidence rules;
- provenance/version/calibration status.

A Marking Pack is an internal governed assessment contract. The learner-facing experience should reveal only the useful level of detail required by current product authority.

### Expert Review Contract
Portable review pack plus machine-readable findings schema so a qualified reviewer can return item-level issues with severity, type, required correction and decision. Expert remediation should reopen only affected work units where safe.

## Factory lifecycle amendment

The existing job lifecycle remains valid but v2 adds an explicit pre-human benchmark state:

`... independent_review → remediation (if required) → expert_review_packaging → expert_review_ready → human_review → benchmark_approved`

A job may enter `expert_review_ready` only when:
- exact course identity is resolved;
- all material sources have an approved source-use classification;
- Course Truth coverage is complete for the intended scope;
- Exam Truth is complete for the applicable components and assessment modes;
- required Learn/Practice/Exam Prep artifacts are present according to the Learning Blueprint;
- required representative mock/simulation assets meet the applicable whole-assessment contract;
- Marking Packs exist for all assessment items represented as markable;
- learner-evidence mappings are complete for scored Practice and Exam Prep assets;
- deterministic validation is green;
- no blocking/material independent-review findings remain;
- the portable expert package is tied to the exact reviewed content version;
- known limitations are explicitly recorded.

`expert_review_ready` does not mean benchmark-approved or commercially endorsed.

## Worker model additions

The orchestrator should support bounded versioned workers for:

- identity;
- source discovery;
- source-rights classification under approved reusable rules;
- Board Alignment;
- coverage compilation;
- Course Knowledge Model compilation;
- Assessment Blueprint compilation;
- Question Family generation/instantiation;
- Learning Blueprint planning;
- learning collateral generation;
- practice generation;
- exam-prep / representative mock generation;
- Marking Pack generation;
- evidence-map validation;
- deterministic validation;
- independent review;
- targeted remediation;
- expert-review packaging/import.

Workers must return schema-valid structured outputs or a blocker. Free-form prose is not a durable factory contract.

## AI/model-use principle

Use AI only for work that benefits from interpretation, synthesis, pedagogical transformation, scenario generation, assessment reasoning or adversarial challenge.

Use deterministic code for deterministic tasks, including coverage/reference checks, arithmetic, IDs, answer-key validity, mark/AO totals, case-data consistency where computable, required-field completeness, evidence mappings and lifecycle gating.

Model/provider selection is replaceable implementation detail. Worker contracts, source permissions, educational authority and assurance gates are not model-specific.

## Marking scalability principle

Marking quality should be built around reusable assessment contracts rather than expensive unconstrained reasoning on every learner answer.

Where educationally valid:

`Assessment Blueprint → validated Question Family → Revision-owned question → question-specific Marking Pack → learner answer interpretation`

Qualified expert calibration should focus first on high-value question/marking families and representative anchor answers. The factory may then use risk-based sampling and evaluation to monitor generated variants without requiring manual authoring of every item.

## Assurance and credibility

Before a course becomes Revision's commercial benchmark, qualified subject review remains mandatory under the existing content accuracy/workflow authority.

For assessment/marking capabilities, expert review should specifically inspect:
- authenticity of question demand;
- appropriateness of mark allocations/rubric logic;
- legitimate alternative reasoning routes;
- common misconceptions;
- anchor-response judgements;
- whole-mock representativeness where applicable; and
- whether Revision's marking behaviour would teach an incorrect exam habit.

Where automated marking is used, a separate validation programme must benchmark Revision's marks/feedback against independently marked human responses before strong reliability claims are made.

## Enterprise/repeatability requirements

The v2 factory must remain:
- stateful outside chat memory;
- restartable/idempotent;
- provenance-rich;
- cost observable;
- model/provider replaceable;
- capable of bounded parallel generation;
- capable of batch course intake after single-course reliability is proven;
- fail-closed on source, identity, assurance and lifecycle ambiguity;
- governed through branches/PRs with explicit Founder merge approval.

## Implementation increments

Implementation should use short governed PRs:

1. **Authority/contracts** — this amendment, licensing/provenance standard, aligned intake/workflow/template rules.
2. **Schemas/state machine** — new artifact schemas, source-rights states and `expert_review_ready` lifecycle support.
3. **Course Truth** — identity, rights-safe source register, Board Alignment, coverage and Course Knowledge Model.
4. **Exam Truth** — Assessment Blueprint and Question Families before collateral generation.
5. **Learning/practice factory** — Learning Blueprint, Learn/Practice collateral and curriculum-node evidence mappings.
6. **Exam Prep factory** — original exam questions, timed sets, representative mocks/simulations and Marking Packs.
7. **Assurance/remediation** — deterministic validation, fresh-context review, targeted invalidation/remediation and whole-mock representativeness checks.
8. **Expert handoff** — export/import contract, Admin status, `expert_review_ready` state.
9. **Scale proof** — materially different qualification shapes, then batch/concurrency/spend controls.

Material implementation begins only after the complete applicable Definition of Ready is recorded and explicitly approved by the Founder.

## Documentation impact

This clarification changes the normative Content Factory sequencing and asset/evidence contract. It requires aligned updates to the source/coverage template, content production/assurance workflow, technical Content Factory architecture/implementation plan and learner evidence authorities. Historical assurance records must not be rewritten.
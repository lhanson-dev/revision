# Content Factory Course Learning Blueprint Amendment

**Status:** Active workflow authority — approved and merged in PR #351  
**Owner:** Founder / Product / Content Operations  
**Purpose:** Insert the governed Course Learning Blueprint between Approved Course Foundation and learner-asset planning.

## Governing relationship

This amendment operates with:

- `10-product-governance/Course Learning Blueprint.md`;
- `80-company-workflows/Content Factory Foundation and Asset Production Model.md`;
- `80-company-workflows/Content Accuracy Assurance Gate.md`; and
- the current Foundation-native technical implementation records.

Where the existing Foundation and Asset Production Model says approved Foundation assets may proceed into Learn, Practice and Exam Prep production, this amendment clarifies that **asset planning must first derive and assure the Course Learning Blueprint required by product authority**.

It does not reopen Course Truth or Exam Truth, and it does not weaken the Foundation approval gate.

## Revised production chain

The normal course-production sequence becomes:

`exact course request → Course Truth + Exam Truth → foundation assurance → foundation approval → Course Learning Blueprint derivation → blueprint assurance → Learn / Practice / Exam Prep asset planning → asset generation → asset assurance → publication`

The Course Learning Blueprint is a **derived planning artifact**, not a new source of curriculum truth.

## Preconditions

A learner-asset production job must not treat generative workers as responsible for choosing the educational coverage/treatment of a course.

Before generation begins, the job must have:

1. the exact eligible Approved Course Foundation version/fingerprint required by the applicable release stage;
2. complete Course Truth / Course Knowledge Model inputs for the intended scope;
3. complete Exam Truth for any Exam Prep planning in scope;
4. the Course Learning Blueprint schema/rule version;
5. deterministic learning-node classifications/treatment obligations where mechanically derivable; and
6. retained provenance from every blueprint work unit back to the Foundation nodes it covers.

Pre-production/internal generation may continue to use the existing governed Foundation state rules where explicitly permitted by current technical authority, but it must not imply that the blueprint or learner assets are release eligible before the existing human/Foundation gates are satisfied.

## Blueprint derivation

For each canonical knowledge/skill node, or a deliberately grouped work unit whose node-level obligations remain traceable, the planner must determine:

- the learning classifications that apply;
- mandatory Learn treatments;
- valid Practice evidence modes;
- required scaffolding/worked-example behaviour;
- misconception treatment;
- application/context requirements;
- quantitative/visual requirements;
- synoptic/mixed-practice relationships; and
- Exam Prep links where Exam Truth requires them.

The planner must apply the deterministic rules in `Course Learning Blueprint.md` before any generative worker decides wording, examples or presentation.

## Model responsibility boundary

### Deterministic/system responsibility

Where rules are mechanically provable, the system owns:

- node/work-unit coverage;
- classification from governed structured metadata;
- mandatory treatment selection;
- required Practice evidence modes;
- required worked-example/scaffolding flags;
- required misconception diagnostics;
- required quantitative treatment;
- required synoptic/mixed-practice links;
- Exam Truth linkage; and
- completeness/cross-reference checks.

### Generative-worker responsibility

A bounded generative worker may create learner-facing material for an already-selected treatment, for example:

- explanation wording;
- examples and scenarios;
- worked-example narration;
- questions/prompts;
- distractors;
- feedback/explanations;
- diagram specifications; and
- contextual variations.

The worker must not silently remove a required treatment, invent curriculum requirements or reinterpret Exam Truth.

### Independent-review responsibility

Fresh-context review should challenge whether:

- the selected treatment genuinely teaches/tests the intended node;
- scaffolding is appropriate to the complexity of the task;
- simplification has become distortion;
- examples/contexts are misleading;
- a Practice mode claims evidence it cannot validly provide;
- feedback teaches the correct principle/habit;
- mixed Practice actually tests selection/discrimination rather than random variety; and
- the assembled learning journey is coherent rather than a pile of valid but disconnected objects.

## Blueprint assurance gate

Before learner-asset generation, deterministic assurance should prove at minimum:

1. every in-scope Foundation node is represented exactly as required;
2. each material node has an adequate Learn treatment unless explicitly governed otherwise;
3. each material node has at least one valid active Practice route;
4. classification-triggered mandatory treatments are present;
5. formula/quantitative nodes receive the required calculation/interpretation treatment;
6. procedure/complex-reasoning nodes receive modelling/scaffolding where required;
7. known misconception obligations are represented;
8. higher-order/synoptic demands are not reduced to recall;
9. Practice evidence scope is declared and valid;
10. Exam Prep obligations reference approved Exam Truth;
11. no fixed asset quota has introduced unjustified required content; and
12. every blueprint output retains exact Foundation provenance.

A blueprint-assurance failure must fail-hold generation for the affected scope rather than allowing a generative worker to improvise around the missing treatment.

## Grouping and content-volume rule

The Content Factory should continue to group related Foundation nodes into coherent learner work units where educationally useful.

The blueprint must not force one page/card per node.

Likewise, it must not generate a fixed number of objects merely because a template expects them. Volume remains coverage/evidence driven.

The production target is the smallest sufficient set of coherent assets that adequately teaches and tests the approved requirements.

## Learn Factory amendment

The Learn Factory should derive its plan from `learnTreatments[]` rather than applying only a universal explanation template.

A work unit may therefore require a combination such as:

- core explanation;
- structured comparison;
- process/relationship visual;
- worked example;
- misconception repair; and
- synoptic connection.

These are learning obligations, not mandatory UI-card types. Assembly may combine them into a coherent reading/explanation experience.

## Practice Factory amendment

The Practice Factory should derive valid activity/evidence modes from the blueprint rather than assuming retrieval alone is sufficient.

Every Practice item must retain:

- underlying knowledge/skill node IDs;
- activity/evidence mode;
- intended evidence scope;
- difficulty/demand where governed;
- blueprint version/fingerprint; and
- Foundation provenance.

Practice generation must support later mixed/spaced/repair use without changing the academic identity of the underlying nodes.

## Exam Prep Factory amendment

Exam Prep planning must combine:

- Course Truth;
- Exam Truth; and
- the learning obligations/evidence pathways represented by the Course Learning Blueprint.

Exam Prep should therefore be able to identify the gap between `student knows the concept` and `student can perform the assessed response`, and provide the required model → guided → independent progression where appropriate.

## Learner evidence and progress

This amendment does not change the evidence semantics in `Claims and Progress Governance.md` or `Product System Model.md`.

In particular:

- Learn exposure may contribute to Reviewed;
- unscored learning prompts do not automatically create readiness evidence;
- Practice contributes only evidence that the activity can validly demonstrate;
- Exam Prep retains stronger assessment relevance where authentic; and
- no learner must complete every blueprint treatment merely to satisfy a progress bar when stronger evidence already demonstrates the intended outcome.

## Business reference proof

The first implementation/proof should use the exact retained AQA A-level Business 7132 — 2027 Foundation.

The proof should demonstrate at least four materially different learning-treatment families:

1. concept/comparison/evaluation — e.g. leadership styles;
2. quantitative/procedure/judgement — e.g. decision trees or investment appraisal;
3. model/application/evaluation — e.g. Ansoff or Porter frameworks; and
4. cross-topic/synoptic reasoning — a case requiring more than one functional/strategic area.

The proof must show that one deterministic planner can select different treatments from the different Foundation characteristics without hard-coding Business-specific asset templates.

## Portability proof

Success on Business is insufficient to claim a generic Course Learning Blueprint implementation.

Before the planner is treated as generally qualified for multi-subject production, run it against at least one materially different qualification whose learning demands differ substantially from Business, such as a mathematical/scientific, language, historical or practical subject.

The purpose is to expose hidden Business assumptions in the classification/treatment rules.

## Remediation rule

If an asset review exposes a defect in generated wording/example/question while the blueprint is sound, remediate the smallest safe asset scope and rerun affected assurance.

If review shows that the **blueprint treatment selection itself is educationally wrong or incomplete**, remediate/reassure the blueprint and invalidate affected downstream assets.

If the defect comes from missing/incorrect Course Truth or Exam Truth, reopen the Foundation through its governed versioning process rather than patching the blueprint around incorrect truth.

## Implementation migration

The retained Foundation-native internal learning planner used a simpler historical contract:

- explanation + retrieval for every work unit;
- worked example + quantitative practice when formula knowledge exists; and
- application practice when application contexts exist.

That remains historical implementation evidence and must remain reconstructable for retained bundles.

The implementation migration must:

1. preserve the existing proven Foundation binding, work-unit traceability, fresh-context review and release controls;
2. introduce a versioned Course Learning Blueprint representation;
3. move mandatory treatment selection out of generative workers and into deterministic planning;
4. expand Learn/Practice worker contracts to consume the selected treatments;
5. update deterministic asset assurance to verify treatment obligations;
6. prove Business reference cases; and
7. prove portability on a materially different subject before the new planner is treated as generally qualified for multi-subject production.

## Documentation impact

`INDEX.md` identifies:

- `10-product-governance/Course Learning Blueprint.md` as the product authority for course learning design; and
- this amendment as the workflow rule connecting that authority to Content Factory asset production.

Implementation changes must update the relevant technical Content Factory documentation and create/update ADRs when the blueprint becomes or changes a durable architecture boundary/schema.

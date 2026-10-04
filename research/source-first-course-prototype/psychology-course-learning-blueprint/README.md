# AQA A-level Psychology 7182 — Course Learning Blueprint

**Status:** Experimental Course Learning Blueprint candidate  
**Prototype:** Source-First Course Prototype  
**Course:** AQA A-level Psychology 7182, revised specification, first A-level exams Summer 2027  
**Derived from:** completed Psychology Course Truth + completed Psychology Exam Truth

## Purpose

This directory records step 3 of the active Psychology restricted-student-pilot run: the learning-design projection between approved experimental truth and learner-asset production.

The Blueprint does not add curriculum or assessment truth. It determines how the 118 source-traceable Course Truth requirements must be taught, practised and connected to authentic assessment under `10-product-governance/Course Learning Blueprint.md`.

## Planning unit

Each of the 118 Course Truth requirement records is a traceable Blueprint planning unit. This preserves exact requirement coverage without forcing one learner page, card or activity per requirement.

Later asset assembly may combine related planning units into coherent teaching pages or practice sets when node-level provenance and evidence scope remain recoverable.

The deterministic projector is implemented in:

`scripts/content/derive-psychology-course-learning-blueprint.ts`

It reads the current Psychology Course Truth topic shards and Exam Truth assessment blueprint and returns one projected learning unit per requirement plus bounded course-level exam-skill units.

## Deterministic treatment model

Every material requirement receives:

- a coherent Learn explanation obligation;
- at least one active Practice route;
- the real AQA paper/component placement derived from Exam Truth;
- application practice because AO2 is a whole-qualification assessment demand;
- explicit evidence-scope declarations; and
- provenance back to the exact Course Truth requirement.

Additional treatments are selected mechanically from the structured Course Truth fields and bounded content signals:

- definitions/core concepts → `fact_term` / `concept`, definition-in-context, retrieval and examples;
- comparisons/distinctions → structured comparison and discrimination practice;
- relationships/mechanisms → reasoning-chain teaching and practice;
- models/theories/approaches → `model_framework` treatment;
- procedures/research design → modelling, guided/faded support and independent performance;
- quantitative/data requirements → independently checkable worked examples, guided/faded practice, calculation and interpretation;
- evaluation/limitations → analysis/evaluation practice rather than recall-only evidence;
- misconceptions/boundaries → explicit repair plus diagnostic practice;
- Issues and Debates / explicit cross-topic signals → synoptic connections and mixed selection practice; and
- purposeful visuals only where process, biological structure or quantitative/data relationships materially justify them.

These rules select learning obligations. They do not impose fixed asset counts or UI-card quotas.

## Exam Prep bridge

Requirement units retain their real paper/section or Paper 3 option-group identity without duplicating Course Truth.

Separate course-level exam-skill units cover:

1. paper/component and Paper 3 option orientation;
2. command/demand selection;
3. extended constructed responses;
4. research-method transfer across all three papers;
5. data/mathematical handling; and
6. synoptic Paper 3 reasoning.

Exam Prep progression follows model/annotation → guided or faded response where useful → independent authentic Revision-owned response → timed/whole-paper use where justified.

No fixed future-paper essay count, historical command sequence or copied AQA question/mark-scheme prose is introduced.

## Evidence boundary

Learn exposure may support `Reviewed` only. It cannot establish Understanding or Exam Readiness merely because material was opened or completed.

Practice evidence is limited to the capability the activity can actually demonstrate, such as recall, contextual application, quantitative execution, reasoning, evaluation or misconception discrimination.

Exam Prep may generate stronger assessment-relevant evidence only where the eventual activity and marking contract justify it.

## Accessibility and media

The Blueprint records default accessibility obligations rather than treating accessibility as an asset-generation afterthought. Purposeful visuals require meaningful text alternatives; colour cannot carry educational meaning alone; media requires appropriate captions/transcripts/controls; and mobile assembly must preserve the learning sequence.

## Assurance boundary

`scripts/assurance/psychology-course-learning-blueprint.test.ts` deterministically proves, against the current truth layers, that:

- all 118 Course Truth requirements project exactly once;
- no unknown/missing requirement is hidden by grouping;
- every projected unit has Learn and active Practice obligations;
- classification-triggered mandatory treatments are present;
- misconception, procedure, quantitative and synoptic rules are enforced;
- Practice evidence scope is explicit;
- every requirement links to the correct Exam Truth paper/component scope;
- exam-skill units preserve current Exam Truth constraints and rights boundaries;
- Learn cannot claim readiness evidence; and
- learner-facing/publication readiness remains false.

Fresh independent educational and assessment assurance remains a later step-6 publication gate. Blueprint completion does not authorise learner publication.

## Economics

This derivation uses deterministic repository logic over already-completed truth layers. No paid AI/provider generation and no paid source/licence spend are required for this Blueprint step.

## Documentation impact

This is experimental research evidence under the already-approved Source-First exception. It does not change normative product/company authority, production Content Factory authority or learner-runtime technical documentation.

## Next governed step

After this Blueprint is assured and merged, proceed to step 4: produce the complete Psychology learner assets required for the restricted pilot, using these selected Learn, Practice and Exam Prep obligations rather than allowing asset-generation workers to choose or omit educational coverage.
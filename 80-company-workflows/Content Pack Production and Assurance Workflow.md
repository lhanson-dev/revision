# Content Pack Production and Assurance Workflow

## Trigger
Any new Revision subject, qualification, specification, paper, component or substantial learning-content pack intended to enter the learner catalogue.

## Purpose
Create new educational content quickly enough for an early-stage product while preserving curriculum fidelity, source provenance, lawful source use, assessment accuracy and a repeatable publication gate.

This workflow governs the production path from identifying a learner's course through to an `available` content pack. It does not make third-party revision material, public accessibility or AI-generated wording an educational or licensing authority.

For orchestrated production, `Content Factory Operating Model.md` owns operational state. For v2 automation through qualified-expert handoff, `Content Factory v2 Expert Review Ready Amendment.md` adds the Course Knowledge Model, Assessment Blueprint, Question Families, Marking Packs and `expert_review_ready` gate.

## Governing principles

1. **Identify the exact course before writing content.** Confirm subject, qualification, exam board, specification code and relevant paper/component.
2. **Separate educational authority from permission to use a source.** A source can be authoritative without being licensed for AI ingestion, copying, adaptation or commercial reuse.
3. **Pass the source-rights gate before generative use.** Apply `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`; `UNKNOWN` or material ambiguity blocks downstream generation.
4. **Build coverage before volume.** Create a structured coverage blueprint before generating large quantities of notes, flashcards or questions.
5. **Preserve provenance.** Material claims, alignment facts, assessment structure and substantial content areas must remain traceable to approved source records.
6. **AI may explain, transform and generate only from permitted inputs.** AI does not create curriculum authority or licensing permission.
7. **Active recall and assessment must be deliberate.** A pack is not complete merely because notes exist.
8. **Use deterministic checks for deterministic facts.** Arithmetic, references, IDs, mark totals and other mechanically provable rules should not rely only on linguistic review.
9. **Keep generation and final AI assurance independent.** The same generation context cannot be the final reviewer of its own content.
10. **Do not expose unfinished packs as complete.** Use `planned`, `preview` and `available` deliberately.
11. **Publish through a governed branch and PR.** Every merge into `main` requires explicit Founder approval.
12. **Qualified human review remains the commercial benchmark gate.** `expert_review_ready` means ready to review, not benchmark-approved.

## Source authority and source-use model

Educational authority and source-use permission are separate decisions.

### Educational authority order
Use the strongest current authority appropriate to the claim, normally:

1. open, public-domain or appropriately licensed statutory/regulatory curriculum and qualification authority;
2. awarding-body material as an identity/alignment authority where permitted by the source-use classification;
3. other deliberately approved primary educational sources required by the course;
4. reputable secondary sources only as supplementary evidence or teaching support.

Secondary material must not silently override stronger primary authority.

### Source-use classification
Every material source must be recorded as one of:

- `OPEN`;
- `REVISION_OWNED`;
- `LICENSED`;
- `REFERENCE_ONLY`;
- `PROHIBITED`;
- `UNKNOWN` while unresolved.

Only source material whose recorded permission permits the intended operation may enter an AI context. `REFERENCE_ONLY` material may inform a deliberately approved factual/alignment process but substantial protected source prose must not be passed into downstream generative workers unless an explicit licence permits it. `PROHIBITED` and `UNKNOWN` material must not enter generation.

Do not evade a restrictive classification by automatically paraphrasing the source first.

If authoritative sources conflict, appear outdated, or leave a material curriculum, assessment or rights ambiguity, stop and resolve the issue before the affected stage can complete.

## Stage 1 — Identify the course precisely

Record at minimum:

- subject;
- qualification level;
- awarding organisation;
- specification code or identifier;
- relevant paper/component/area;
- cohort/exam-series validity where time-sensitive;
- compulsory and optional components;
- learner-specific choices that affect scope.

Do not start full production from a vague label such as “A-level Spanish” or “GCSE Maths”.

## Stage 2 — Create the Source Licence Register

Before substantial generation, create the pack/job source record required by the Educational Content Source Licensing and Provenance Standard.

For each material source record at minimum:

- source identity/title and issuer;
- URL/reference and version/date where available;
- educational role / claim group governed;
- source-use classification;
- permission/licence basis or approved reusable policy rule;
- whether source text may enter AI context;
- whether derived commercial content may be produced;
- attribution requirements;
- restrictions, expiry or revalidation conditions;
- date checked and checker/method provenance;
- source fingerprint where practical.

Do not copy substantial copyrighted source passages into the repository merely to prove provenance.

## Stage 3 — Build Board Alignment and coverage before generation

For v2 jobs, separate reusable subject/curriculum truth from qualification-specific Board Alignment.

Board Alignment contains approved structured facts such as:

- qualification/specification identity;
- cohort validity;
- compulsory/optional components;
- component scope;
- marks, duration and weighting where applicable;
- assessment objectives/skills and other approved assessment requirements;
- source references and verification status.

Then build the structured coverage blueprint.

For each examinable requirement/skill, record enough information to answer:

- stable requirement/concept ID;
- what requirement or skill is in scope;
- which Revision topic/area owns it;
- learner knowledge/skill required;
- component scope;
- assessment relevance where established;
- Learn / Practice / Exam Prep / evidence needs;
- source/alignment references;
- coverage state: complete, partial, deferred or not applicable.

Coverage is the completeness contract for downstream generation. Generated volume cannot compensate for missing coverage.

Preserve authentic subject structure rather than forcing every course into a Business-shaped topic model.

## Stage 4 — Build the Course Knowledge Model and Learning Blueprint

For v2 production, compile reusable knowledge/skill nodes before large-scale collateral generation. As applicable capture:

- stable concept/requirement ID;
- plain-language concept/skill summary;
- prerequisites and relationships;
- formulas/quantitative rules;
- common misconceptions;
- application contexts;
- depth/difficulty indicators;
- curriculum/source references;
- Board Alignment/component mappings;
- valid learner evidence types.

Then create a Learning Blueprint that deliberately selects appropriate learning modes for each coherent requirement or skill cluster. Do not require identical notes, flashcards and MCQs for every topic when they are educationally inappropriate.

## Stage 5 — Produce the typed learner content

Create the pack under the governed `content/**/index.ts` architecture and current schema.

Where educationally meaningful, the pack may include:

- learner explanation / Learn sections;
- topic relationships;
- formulas and worked examples;
- flashcards / retrieval prompts;
- quick checks / multiple-choice questions;
- application/case practice;
- data/calculation drills;
- exam technique;
- original exam-style questions and simulations;
- progress/evidence-generating activities.

Learner-facing explanations, examples, cases, questions, simulations and feedback should normally be Revision-authored from permitted curriculum truth and approved structured alignment facts unless a specific licence deliberately permits another use.

Do not manufacture empty capabilities merely to fill a schema.

## Stage 6 — Build the Assessment Blueprint, Question Families and Marking Packs

Where the course includes written or exam-style assessment, define the assessment model before generating high-volume questions.

### Assessment Blueprint
As applicable define:

- assessment objectives/skills and weightings;
- paper/component structure;
- question/response families;
- command/cognitive demands;
- mark and timing constraints;
- quantitative/synoptic requirements;
- evidence/evaluation expectations;
- rules needed to generate authentic but Revision-owned assessment material.

### Question Families
Use reusable assessment archetypes where valid. Each family may define:

- intended skill/AO profile;
- context requirements;
- compatible mark range;
- expected response shape;
- application/analysis/evaluation requirements;
- common failure modes;
- compatible Marking Pack template;
- expert-calibration status.

### Original questions and simulations
Questions, cases and simulations generated by Revision must:

- test in-scope concepts/skills;
- be internally coherent;
- comply with the approved Assessment Blueprint;
- be labelled original / exam-style / aligned as appropriate;
- never be represented as official awarding-body questions.

### Marking Packs
Every written assessment item represented as eligible for governed assisted marking must have a structured Marking Pack appropriate to its assessment model, including as applicable:

- exact Revision-owned question/context and maximum mark;
- concepts/requirements and AO/skill allocation;
- rubric/level descriptors;
- application, analysis and evaluation requirements;
- valid reasoning routes and alternative legitimate arguments;
- non-exhaustive indicative content where judgement is required;
- misconceptions/invalid reasoning;
- anchor responses with expected marks/ranges where calibrated;
- diagnostic feedback and improvement actions;
- ambiguity/confidence rules;
- provenance, version and calibration status.

Protected third-party mark-scheme text must not enter a marking worker unless the Source Licence Register explicitly permits that use.

## Stage 7 — Automated educational and structural assurance

Before a pack can become `available` or `expert_review_ready`, perform all applicable controls in `Content Accuracy Assurance Gate.md`.

### Deterministic assurance
Use code/tests for checks including, where applicable:

- schema validity;
- unique IDs and valid references;
- coverage completeness;
- formulas, arithmetic, percentages, ratios and units;
- answer-key consistency;
- question/section/exam mark totals;
- stored AO totals;
- duration/mark metadata;
- internal consistency of invented case data;
- required Marking Pack fields and references.

### Independent educational/assessment challenge
Run a fresh context/worker that did not generate the reviewed material. Review for:

- factual and curriculum accuracy;
- source/alignment fidelity;
- pedagogical distortion or misleading simplification;
- authentic assessment demand;
- invalid assumptions or case data;
- marking rules that reject legitimate reasoning or teach an incorrect habit;
- unsupported claims or false certainty.

Return a machine-readable issue register. Blocking/material findings trigger targeted remediation and affected-stage revalidation rather than broad regeneration.

Schema/build success alone is not evidence that educational content is correct.

## Stage 8 — Pilot publication and `expert_review_ready`

Learner publication status remains:

- `planned` — identified but not ready;
- `preview` — under construction/assurance and excluded from ordinary learner catalogue;
- `available` — approved for learner use under the publication gate.

For restricted founder/family pilot use, a pack may become `available` when:

- course identity is confirmed;
- source-use classifications are approved;
- intended coverage is complete;
- applicable automated assurance passes;
- no unresolved blocking/material findings remain;
- limitations are explicit;
- CI passes on the exact intended head;
- explicit Founder approval is given for the PR merge.

For Content Factory v2, a job may become `expert_review_ready` only when the conditions in `Content Factory v2 Expert Review Ready Amendment.md` are met, including complete required artifacts, green deterministic assurance, no unresolved blocking/material independent-review findings, complete Marking Packs for markable written items, and an exact-version portable expert package.

`expert_review_ready` is an operational assurance state, not learner publication status and not benchmark approval.

## Stage 9 — Post-publication verification

After deployment, verify where applicable that:

- the intended pack appears in the canonical `/app/` catalogue;
- subject/course/paper projection is correct;
- supported capabilities appear without misleading empty surfaces;
- evidence records against correct module/topic IDs;
- Progress and REV consume the correct catalogue/evidence structure;
- no subject-specific React route/page was required for an ordinary pack addition.

If an ordinary subject requires hard-coded learner navigation or a legacy route workaround, treat that as an architectural defect.

## Stage 10 — Qualified expert review and commercial benchmark gate

Before a subject pack is treated as a commercial teaching benchmark, relied on for broader public teaching/marking claims, or used as the quality template for scaled content production, it must receive qualified human subject review.

The reviewer must receive a portable review pack tied to the exact reviewed content version. It must include:

- reviewer brief and decision instructions;
- exact course identity and content version/commit;
- Source Licence Register and source/reference links;
- Board Alignment and coverage summary;
- substantive learner-facing content in readable form;
- substantial cases, questions, simulations and exam technique;
- Assessment Blueprint and relevant Question Families;
- Marking Packs and anchor/calibration material in scope;
- prior automated/adversarial findings that help target risk;
- known limitations;
- a structured issue log and PASS / CONDITIONAL PASS / FAIL-HOLD decision.

The reviewer should not need GitHub access.

Do not reproduce substantial protected awarding-body material merely for reviewer convenience. Link/reference authority instead unless the recorded licence permits inclusion.

For assessment/marking review, the expert must specifically assess authenticity of demand, mark/rubric logic, legitimate alternative reasoning, misconceptions, anchor judgements and whether Revision marking behaviour would teach incorrect exam habits.

Expert findings should be machine-readable so affected work units can be remediated and revalidated without rebuilding unrelated content.

Commercial benchmark approval requires:

- no unresolved blocking/material human-review findings;
- required remediation and revalidation complete;
- final human review retained/indexed;
- explicit Founder approval for any governed PR that promotes benchmark status or changes product claims on that evidence.

Human review is a quality gate, not a claim of perfection.

## Minimum PR record for a new pack

Every new-pack PR should state:

- exact course identity and scope;
- pack ID/path;
- Source Licence Register and coverage/Board Alignment references;
- current learner publication status;
- applicable automated assurance completed;
- structural tests/build results;
- known limitations/deferred coverage;
- schema/shared-engine changes, if any;
- documentation impact;
- canonical learner route/runtime verification where learner behaviour changes;
- expert/human review status where applicable;
- portable review-export version/commit where review is requested.

## Fast pilot mode

For a restricted early pilot, keep the process rigorous but proportionate:

**Identify → source-rights gate → Board Alignment / coverage → typed pack → Content Accuracy Assurance Gate → CI → preview check → Founder-approved `available` merge → production smoke.**

Human subject review remains mandatory before treating a pack as a commercial benchmark or using it to support broader teaching/marking-quality claims.

Do not skip identity, source-rights verification, coverage mapping or educational assurance in the name of speed.

## Scaling

At scale, use the Content Factory rather than conversational coordination. The system should accumulate reusable subject knowledge models, teaching blueprints, assessment/question-family contracts, Marking Pack templates, deterministic validators, calibrated anchors and source-use policy rules.

Batch/concurrency may be introduced only after single-course repeatability is proven across materially different qualification shapes. Human review should move toward risk-based, high-leverage calibration and representative sampling without removing the benchmark gate.
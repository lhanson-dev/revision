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
5. **Build Course Truth and Exam Truth before high-volume collateral.** Course Truth defines what the learner must know/do; Exam Truth defines how that knowledge/skill is assessed. Learn, Practice and Exam Prep assets derive from these foundations rather than becoming authority themselves.
6. **Preserve provenance.** Material claims, alignment facts, assessment structure and substantial content areas must remain traceable to approved source records.
7. **AI may explain, transform and generate only from permitted inputs.** AI does not create curriculum authority or licensing permission.
8. **Active recall and assessment must be deliberate.** A pack is not complete merely because notes exist.
9. **Asset quantity follows educational coverage.** Do not use universal flashcard, quiz or practice-question quotas as a substitute for curriculum/skill completeness.
10. **Use deterministic checks for deterministic facts.** Arithmetic, references, IDs, mark totals and other mechanically provable rules should not rely only on linguistic review.
11. **Keep generation and final AI assurance independent.** The same generation context cannot be the final reviewer of its own content.
12. **Do not expose unfinished packs as complete.** Use `planned`, `preview` and `available` deliberately.
13. **Publish through a governed branch and PR.** Every merge into `main` requires explicit Founder approval.
14. **Qualified human review remains the commercial benchmark gate.** `expert_review_ready` means ready to review, not benchmark-approved.

## Course Truth, Exam Truth and learner outputs

For v2 and later production, use this conceptual structure:

```text
approved sources
  → exact identity + source rights
  → Course Truth
      - Board Alignment
      - coverage map
      - Course Knowledge Model
  + Exam Truth
      - Assessment Blueprint
      - Question Families
  → Learning Blueprint / work-unit plan
  → Learn + Practice + Exam Prep assets
  → Marking Packs + learner-evidence mapping
  → assurance / expert calibration
```

Course Truth and Exam Truth are sibling foundations. A generated mock exam or practice question must not be used to redefine curriculum scope. Exam Truth may shape the depth and type of Learn/Practice activity required, but generated assessment collateral is not curriculum authority.

The learner-facing outputs are:

- **Learn** — explanations, notes, worked examples, visual material, formulas, misconceptions, relationships and other appropriate teaching/revision formats;
- **Practice** — flashcards, retrieval, quizzes, calculations, application/case work, topic or mixed tests, practice questions and other validated techniques;
- **Exam Prep** — exam technique, targeted exam questions, timed work, representative full mocks/components and the Exam Simulator where supported.

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

## Stage 4 — Build the Course Knowledge Model (Course Truth)

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

Course Truth must be complete for the intended scope before high-volume collateral is considered complete.

## Stage 5 — Build the Assessment Blueprint and Question Families (Exam Truth)

Where the course includes exam-style assessment, define the assessment model before high-volume learner collateral generation.

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

The Assessment Blueprint and validated Question Families form Exam Truth. They shape learner collateral but do not become curriculum authority.

## Stage 6 — Build the Learning Blueprint and work-unit plan

Using Course Truth plus relevant Exam Truth, deliberately select appropriate learner modes for each coherent requirement or skill cluster.

Do not require identical notes, flashcards and MCQs for every topic when they are educationally inappropriate.

For Practice assets:

- each format should cover the full relevant curriculum scope that the format can validly assess;
- one format must not be treated as evidence for skills it cannot test;
- the learner should not need to complete every available Practice format to demonstrate knowledge;
- asset quantity should emerge from coverage and useful variation rather than a universal fixed target.

For example, a topic with extensive factual/retrieval scope may legitimately need hundreds of flashcards, while another may need far fewer. The correctness test is coverage and educational utility, not quota compliance.

## Stage 7 — Produce typed Learn, Practice and Exam Prep content

Create the pack under the governed content architecture and current schema/contract.

Where educationally meaningful, the pack may include:

### Learn
- learner explanations / Learn sections;
- topic relationships;
- formulas and worked examples;
- visual material;
- misconceptions and explanatory support.

### Practice
- flashcards / retrieval prompts;
- quick checks / multiple-choice questions;
- application/case practice;
- data/calculation drills;
- topic/mixed tests;
- original practice questions.

### Exam Prep
- exam technique;
- targeted exam-style questions;
- timed sets/sections;
- representative full mock papers/components;
- Exam Simulator assets where supported.

Learner-facing explanations, examples, cases, questions, simulations and feedback should normally be Revision-authored from permitted curriculum truth and approved structured alignment facts unless a specific licence deliberately permits another use.

Do not manufacture empty capabilities merely to fill a schema.

## Stage 8 — Build Marking Packs and learner-evidence mappings

### Original questions and simulations
Questions, cases and simulations generated by Revision must:

- test in-scope concepts/skills;
- be internally coherent;
- comply with the approved Assessment Blueprint;
- be labelled original / exam-style / aligned as appropriate;
- never be represented as official awarding-body questions.

### Representative full mocks

A full mock/simulation is a higher-assurance asset class than an ordinary practice question. It must be validated as a whole against Exam Truth, including as applicable:

- component structure;
- marks and duration;
- curriculum/skill coverage profile;
- question-family and command/cognitive-demand mix;
- assessment-objective profile;
- difficulty/representativeness;
- marking-pack completeness.

Revision should prefer a smaller bank of trusted representative mocks over a larger bank of weakly calibrated papers.

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

### Learner-evidence mapping

Every scored Practice and Exam Prep asset should map to the relevant Course Knowledge Model nodes and applicable assessment demand.

The mapping must preserve learner-facing evidence semantics:

- `Reviewed` is a secondary content-exposure signal associated with meaningful Learn encounter;
- Learn completion does not directly create Exam Readiness;
- validated Practice and Exam Prep performance may update Exam Readiness only for the knowledge/skills the activity can genuinely assess;
- stronger, broader and more exam-representative evidence should normally carry more weight than passive or narrow evidence;
- unreviewed Learn content must not create an artificial readiness penalty where stronger evidence already demonstrates the intended outcome.

## Stage 9 — Automated educational and structural assurance

Before a pack can become `available` or `expert_review_ready`, perform all applicable controls in `Content Accuracy Assurance Gate.md`.

### Deterministic assurance
Use code/tests for checks including, where applicable:

- schema validity;
- unique IDs and valid references;
- Course Truth coverage completeness;
- Exam Truth completeness;
- Learning Blueprint coverage;
- learner-evidence mapping validity;
- formulas, arithmetic, percentages, ratios and units;
- answer-key consistency;
- question/section/exam mark totals;
- stored AO totals;
- duration/mark metadata;
- whole-mock structural/coverage/demand consistency;
- internal consistency of invented case data;
- required Marking Pack fields and references.

### Independent educational/assessment challenge
Run a fresh context/worker that did not generate the reviewed material. Review for:

- factual and curriculum accuracy;
- source/alignment fidelity;
- pedagogical distortion or misleading simplification;
- authentic assessment demand;
- invalid assumptions or case data;
- representative full-mock quality where applicable;
- marking rules that reject legitimate reasoning or teach an incorrect habit;
- unsupported claims or false certainty.

Return a machine-readable issue register. Blocking/material findings trigger targeted remediation and affected-stage revalidation rather than broad regeneration.

Schema/build success alone is not evidence that educational content is correct.

## Stage 10 — Pilot publication and `expert_review_ready`

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

For Content Factory v2, a job may become `expert_review_ready` only when the conditions in `Content Factory v2 Expert Review Ready Amendment.md` are met, including complete Course Truth, applicable Exam Truth, required learner assets/evidence mappings, green deterministic assurance, no unresolved blocking/material independent-review findings, complete Marking Packs for markable written items, and an exact-version portable expert package.

`expert_review_ready` is an operational assurance state, not learner publication status and not benchmark approval.

## Stage 11 — Post-publication verification

After deployment, verify where applicable that:

- the intended pack appears in the canonical `/app/` catalogue;
- subject/course/paper projection is correct;
- supported capabilities appear without misleading empty surfaces;
- Reviewed and performance evidence record against correct academic IDs;
- Progress and REV consume the correct catalogue/evidence structure;
- no subject-specific React route/page was required for an ordinary pack addition.

If an ordinary subject requires hard-coded learner navigation or a legacy route workaround, treat that as an architectural defect.

## Stage 12 — Qualified expert review and commercial benchmark gate

Before a subject pack is treated as a commercial teaching benchmark, relied on for broader public teaching/marking claims, or used as the quality template for scaled content production, it must receive qualified human subject review.

The reviewer must receive a portable review pack tied to the exact reviewed content version. It must include:

- reviewer brief and decision instructions;
- exact course identity and content version/commit;
- Source Licence Register and source/reference links;
- Board Alignment and Course Truth coverage summary;
- Assessment Blueprint / Exam Truth and relevant Question Families;
- substantive learner-facing Learn and Practice content;
- representative cases, questions, simulations and exam technique;
- trusted full mocks where in scope;
- Marking Packs and anchor/calibration material in scope;
- prior automated/adversarial findings that help target risk;
- known limitations;
- a structured issue log and PASS / CONDITIONAL PASS / FAIL-HOLD decision.

The reviewer should not need GitHub access.

Do not reproduce substantial protected awarding-body material merely for reviewer convenience. Link/reference authority instead unless the recorded licence permits inclusion.

For assessment/marking review, the expert must specifically assess authenticity of demand, whole-paper representativeness, mark/rubric logic, legitimate alternative reasoning, misconceptions, anchor judgements and whether Revision marking behaviour would teach incorrect exam habits.

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
- Source Licence Register and Course Truth / Exam Truth references;
- current learner publication status;
- generated artifact counts by class as descriptive output, not quality targets;
- applicable automated assurance completed;
- representative mock assurance status where applicable;
- structural tests/build results;
- known limitations/deferred coverage;
- schema/shared-engine changes, if any;
- documentation impact;
- canonical learner route/runtime verification where learner behaviour changes;
- expert/human review status where applicable;
- portable review-export version/commit where review is requested.

## Fast pilot mode

For a restricted early pilot, keep the process rigorous but proportionate:

**Identify → source-rights gate → Board Alignment / Course Truth → Exam Truth where applicable → Learning Blueprint → typed learner assets → Content Accuracy Assurance Gate → CI → preview check → Founder-approved `available` merge → production smoke.**

Human subject review remains mandatory before treating a pack as a commercial benchmark or using it to support broader teaching/marking-quality claims.

Do not skip identity, source-rights verification, Course Truth coverage, applicable Exam Truth or educational assurance in the name of speed.

## Scaling

At scale, use the Content Factory rather than conversational coordination. The system should accumulate reusable Course Knowledge Models, teaching blueprints, Assessment Blueprints, question-family contracts, Marking Pack templates, learner-evidence mappings, deterministic validators, calibrated anchors and source-use policy rules.

Batch/concurrency may be introduced only after single-course repeatability is proven across materially different qualification shapes. Human review should move toward risk-based, high-leverage calibration and representative sampling without removing the benchmark gate.

## Documentation impact

The 3 September 2026 strategy clarification changes the production sequence and makes Course Truth + Exam Truth prerequisites for high-volume collateral. It also establishes coverage-driven asset volume, trusted full mocks as a higher-assurance class and explicit Reviewed/Exam Readiness evidence mapping. Technical Content Factory documentation and templates must remain aligned. Historical assurance evidence must not be rewritten.
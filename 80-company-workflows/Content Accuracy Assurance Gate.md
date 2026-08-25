# Content Accuracy Assurance Gate

## Purpose
Revision teaches students. A content pack must therefore be assured for factual, curriculum, pedagogical and assessment accuracy before it is treated as trusted learner-facing content.

This gate supplements `Content Pack Production and Assurance Workflow.md`, `Content Factory Operating Model.md` and the v2 Expert Review Ready amendment. Schema validation, build success and a same-context AI review are necessary controls but are not sufficient evidence that educational content is correct.

## Core rule
No new or materially changed learner-facing content may be promoted to `available`, reach `expert_review_ready`, or be treated as the benchmark for future packs unless it passes all applicable controls in this gate.

The objective is not to guarantee zero errors. The objective is to make every material educational claim source-traceable, rights-safe, independently challenged, mechanically checked where possible, and reviewable when uncertainty remains.

## Gate 0 — source rights and provenance

Before material source content is supplied to generative or review workers, apply `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`.

Required controls:

- every material source has a Source Licence Register entry;
- source-use classification and permission basis are recorded;
- AI-input permission and derived-commercial-use permission are explicit where applicable;
- `REFERENCE_ONLY` material is not passed as substantial protected prose into downstream generative workers unless specifically licensed;
- `PROHIBITED` and `UNKNOWN` material is excluded from generation;
- source-rights ambiguity becomes a blocker rather than an AI/legal guess.

A source can be authoritative while still being unavailable for generative reuse.

## Assurance classes

### A1 — source-factual and alignment content
Examples include definitions, formulas, curriculum requirements, qualification identity, component structure, assessment objectives and other claims that can be checked against approved authority.

Required controls:

- map each material claim or coherent claim group to approved source/alignment records;
- verify that learner-facing wording preserves the underlying fact/meaning without copying protected prose where not permitted;
- record ambiguity instead of resolving it by invention;
- prevent secondary material from silently overriding stronger authority;
- distinguish reusable curriculum/subject truth from structured Board Alignment where v2 applies.

### A2 — derived educational explanation
Examples include plain-English explanations, worked examples, flashcards, memory prompts, misconceptions and topic connections.

Required controls:

- verify underlying A1 facts first;
- generate only from inputs permitted by the Source Licence Register;
- run a fresh-context adversarial review asked to identify factual distortion, oversimplification, omitted conditions, misleading certainty and curriculum drift;
- resolve every blocking/material finding before publication or `expert_review_ready`;
- keep non-material style suggestions separate from accuracy findings.

### A3 — original assessment and exam practice
Examples include Revision-authored cases, exam-style questions, simulations, marking guidance, model/anchor responses and diagnostic feedback.

Required controls:

- confirm every assessed concept/skill is in scope for the exact qualification/component;
- confirm invented scenario facts are internally coherent and educationally plausible;
- independently recompute every calculation and quantitative conclusion;
- confirm marks, timing, question structure and intended assessment demand are compatible with the approved Assessment Blueprint;
- confirm Question Family constraints where a family/archetype is used;
- label Revision-authored practice as original / exam-style / aligned, never as official awarding-body content;
- run a fresh-context adversarial review focused on hidden factual errors, invalid assumptions, implausible case data and misleading assessment demand.

### A4 — Marking Pack and marking-behaviour assurance
Every written assessment item represented as eligible for governed assisted marking must have a structured Marking Pack.

Required controls, as applicable:

- exact question/context and maximum mark are stable and versioned;
- assessed concepts/requirements and AO/skill allocation match the Assessment Blueprint;
- rubric/level descriptors and mark logic are internally coherent;
- application, analysis and evaluation expectations match the question demand;
- legitimate alternative reasoning routes are not wrongly excluded;
- indicative content is treated as non-exhaustive where professional judgement is required;
- misconceptions/invalid reasoning are distinguished from merely unusual valid answers;
- anchor responses have expected marks/ranges and calibration status where used;
- diagnostic feedback and improvement actions teach the correct rule/habit;
- ambiguity/confidence rules prevent false precision where marking reliability is borderline;
- no protected third-party mark-scheme text has entered the marking worker unless explicitly permitted by the Source Licence Register.

A Marking Pack can reduce runtime AI reasoning and improve consistency, but it still requires interpretation and calibration for judgement-heavy answers.

## Independence rule
The same generation context must not be treated as the final reviewer of its own output.

The independent review context receives only material that is permitted for that worker plus:

- exact content/version under review;
- approved Source Licence Register / structured source references;
- Board Alignment and coverage map;
- Assessment Blueprint / Question Family / Marking Pack data where applicable;
- deterministic verification output;
- instructions to find and classify errors rather than improve prose.

The review must return a machine-readable issue register containing at least:

- item/content ID;
- severity (`blocking`, `material`, `minor`, `no issue`);
- issue type;
- evidence/source/calculation used to verify the finding;
- recommended correction;
- affected artifact/work unit;
- resolution status.

A second AI review reduces risk but is not equivalent to qualified professional educational review.

## Deterministic verification
Where a claim or contract can be checked mechanically, do not rely on linguistic review alone.

Automated/scripted checks should cover where applicable:

- schema validity;
- IDs, references and required-field completeness;
- coverage-map completeness;
- arithmetic in questions, examples and marking guidance;
- percentages, ratios, units and formula application;
- totals and subtotals;
- answer-key consistency;
- question/section/exam mark totals;
- assessment-objective totals stored by Revision;
- duration/mark metadata;
- internal consistency of case facts;
- Assessment Blueprint / Question Family constraint compliance where computable;
- Marking Pack presence and cross-references for every item represented as markable;
- duplicate or contradictory structured answers/rules.

A deterministic pass proves only what the check covers.

## Targeted remediation and revalidation
Blocking/material findings must create explicit remediation work against the smallest safe affected scope.

After correction:

- rerun affected deterministic checks;
- invalidate and rerun dependent independent review where necessary;
- preserve earlier assurance evidence rather than rewriting history;
- do not regenerate unrelated content merely to clear one issue.

A material source, Board Alignment, Assessment Blueprint, Question Family, Marking Pack or worker-contract change must invalidate affected downstream assurance deliberately.

## Human subject-review threshold
Before Revision is positioned beyond a limited restricted pilot as a serious commercial teaching product, each benchmark subject pack must receive review by a suitably qualified human subject specialist.

Human review should prioritise:

- factual correctness and subject nuance;
- curriculum/qualification alignment;
- pedagogy and misleading simplifications;
- authenticity of exam demand;
- appropriateness of assessment and Marking Pack logic;
- legitimate alternative reasoning routes;
- common misconceptions;
- anchor/calibration judgements;
- whether Revision marking behaviour would teach a learner the wrong rule or exam habit.

For v2, automated assurance should prepare one portable `expert_review_ready` package so the expert verifies rather than builds the course.

## Publication / readiness decisions
A content change is:

- **PASS** when all applicable source-rights, source/alignment, adversarial and deterministic checks pass and no blocking/material findings remain;
- **CONDITIONAL PASS** only where the applicable publication authority deliberately permits a restricted pilot with a documented non-critical limitation;
- **FAIL / HOLD** when any blocking/material accuracy issue remains, course identity is uncertain, source rights are unresolved, required authority is missing, or review cannot distinguish fact from generated assumption.

`available` content must not silently carry FAIL/HOLD.

A v2 job may enter `expert_review_ready` only when all applicable automated controls are PASS, the portable expert package is tied to the exact reviewed version, and known limitations are explicit. This state is not benchmark approval.

## Required assurance record
Each new or materially changed pack must retain an assurance record containing:

- exact pack/version/commit reviewed;
- source and source-rights records checked/date;
- Board Alignment / coverage versions where applicable;
- content classes reviewed (A1/A2/A3/A4);
- deterministic checks/results;
- independent reviewer method/context;
- issue register and resolutions;
- Assessment Blueprint / Question Family / Marking Pack versions where applicable;
- human reviewer details/status where applicable;
- final PASS / CONDITIONAL PASS / FAIL-HOLD decision;
- known limitations and revalidation triggers.

Historical assurance records must not be rewritten after later fixes. Add remediation/revalidation evidence.

## Revalidation triggers
Re-run the applicable gate when:

- curriculum, qualification or assessment authority changes;
- source terms/licences or permitted AI-use basis materially change;
- Board Alignment changes materially;
- learner-facing content changes materially;
- a defect reveals that an assurance control was insufficient;
- a pack is reused for a later cohort where currency is uncertain;
- a human reviewer identifies a systemic issue;
- Revision materially changes generation, question-family, Marking Pack or marking behaviour;
- a material worker contract/model-input design changes in a way that invalidates prior quality evidence.

## Product claims
Revision may describe assured material as `built to`, `aligned with`, or `mapped to` a qualification only when the retained evidence supports that claim.

Do not describe Revision-authored content as official awarding-body content unless it genuinely is official content used under an appropriate permission basis.

Do not imply awarding-body endorsement without evidence. Do not promise `100% error-free` content or marking. Reliability claims about automated marking require separate benchmark evidence against independently marked human responses.
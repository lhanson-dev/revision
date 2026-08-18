# Content Accuracy Assurance Gate

## Purpose
Revision teaches students. A content pack must therefore be assured for factual, curriculum and assessment accuracy before it is treated as trusted learner-facing content.

This gate supplements the Content Pack Production and Assurance Workflow. Schema validation, build success and a same-context AI review are necessary controls but are not sufficient evidence that educational content is correct.

## Core rule
No new or materially changed learner-facing content may be promoted to `available`, or treated as the benchmark for future packs, unless it passes all applicable controls in this gate.

The objective is not to claim that Revision can guarantee zero errors. The objective is to make every material educational claim source-traceable, independently challenged, mechanically checked where possible, and reviewable when uncertainty remains.

## Assurance classes

### A1 — source-factual content
Examples include definitions, formulas, syllabus requirements, paper structure, assessment objectives, prescribed content and other claims that can be checked directly against approved primary educational authority.

Required controls:
- map each material claim or coherent claim group to an approved source record;
- verify that the learner-facing wording preserves the meaning of the source;
- record any ambiguity rather than resolving it by invention;
- do not use secondary revision material to override primary authority.

### A2 — derived educational explanation
Examples include plain-English explanations, worked examples, flashcards, memory prompts and topic links that transform or explain A1 material.

Required controls:
- verify the underlying A1 facts first;
- perform a fresh-context adversarial review that is given the approved sources and asked to identify factual distortion, oversimplification, omitted conditions, misleading certainty and curriculum drift;
- resolve every material finding before publication;
- record non-material style suggestions separately so assurance is not confused with copy editing.

### A3 — original exam practice
Examples include Revision-authored cases, exam-style questions, simulations, marking guidance, model answers and diagnostic feedback.

Required controls:
- confirm every assessed concept is in scope for the learner's exact specification/component;
- confirm invented scenario facts are internally coherent and educationally plausible;
- independently recompute every calculation and quantitative conclusion;
- confirm marks, timing, question structure and intended assessment demand are compatible with the official assessment model;
- review marking guidance against approved assessment principles and ensure it does not invent an official mark scheme;
- label Revision-authored practice as original / exam-style / aligned, never as official awarding-body content;
- run a fresh-context adversarial review focused on hidden factual errors, invalid assumptions, misleading marking rules and implausible case data.

## Independence rule
The same generation context must not be treated as the final reviewer of its own output.

For pilot operation, acceptable independent challenge is a fresh review context that receives:
- the exact content to review;
- the approved primary sources or source extracts/references;
- the coverage blueprint;
- an instruction to find and classify errors rather than improve prose.

The review must return an issue register with at least:
- item/content ID;
- severity (`blocking`, `material`, `minor`, `no issue`);
- issue type;
- source or calculation used to verify the finding;
- recommended correction;
- resolution status.

A second AI review reduces risk but is not equivalent to independent professional educational review.

## Deterministic verification
Where a claim can be checked mechanically, do not rely on linguistic review alone.

Automated or scripted checks should be added where proportionate for:
- arithmetic in questions, worked examples and marking guidance;
- percentages, ratios, index-number interpretation and units;
- formula application;
- totals and subtotals;
- question-mark totals and exam totals;
- assessment-objective totals where Revision stores them;
- duration/mark metadata;
- internal consistency of case facts;
- duplicate or contradictory answer keys.

A deterministic pass proves only what the check covers. It does not prove pedagogical or factual correctness outside that scope.

## Human subject-review threshold
Before Revision is positioned beyond a limited founder/family pilot as a serious commercial teaching product, each benchmark subject pack must receive review by a suitably qualified human subject specialist, such as an experienced teacher, tutor, examiner or equivalent subject expert.

Human review should prioritise:
- factual correctness and subject nuance;
- authenticity of exam demand;
- appropriateness of marking guidance;
- common misconceptions and misleading simplifications;
- whether the content would teach a learner the wrong rule or habit.

For the current pilot, lack of human review must be recorded as an assurance limitation rather than hidden.

## Publication decisions
A content change is:

- **PASS** when all applicable source, adversarial and deterministic checks pass and there are no unresolved blocking/material findings;
- **CONDITIONAL PASS** when the content is suitable for restricted pilot use but a documented non-critical assurance limitation remains;
- **FAIL / HOLD** when any blocking or material accuracy issue is unresolved, course identity is uncertain, primary authority is missing, or the review cannot distinguish fact from generated assumption.

`available` content must not silently carry a FAIL/HOLD status.

## Required assurance record
Each new or materially changed content pack must retain an assurance record alongside the pack or in an indexed evidence location. The record should contain:
- exact pack/version/commit reviewed;
- approved sources checked and date checked;
- content classes reviewed (A1/A2/A3);
- deterministic checks performed and results;
- adversarial reviewer method/context;
- issue register and resolutions;
- human reviewer details/status where applicable;
- final PASS / CONDITIONAL PASS / FAIL decision;
- known limitations and revalidation trigger.

Historical assurance records must not be rewritten after later fixes. Add a new remediation/revalidation record so the audit trail remains honest.

## Revalidation triggers
Re-run the gate when:
- the awarding body changes the specification, assessment model or prescribed material;
- a material learner-facing content set changes;
- a defect reveals that an existing assurance control was insufficient;
- a pack is reused for a later cohort where specification currency is uncertain;
- a human reviewer identifies a systemic issue;
- Revision materially changes how it generates or marks practice.

## Product claims
Revision may describe assured material as, for example, `built to`, `aligned with`, or `mapped to` the relevant specification when the evidence supports that claim.

Do not describe Revision-authored content as `official` awarding-body content unless it genuinely is official content used under an appropriate legal/licensing basis.

Do not promise `100% error-free` content. The trust promise is a documented assurance process, traceability, correction and appropriate restraint.
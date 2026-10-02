# AQA Psychology 7182 — Source-First Course Truth

**Status:** Experimental working Course Truth for the authorised restricted-student-pilot continuation  
**Authority:** `80-company-workflows/Source-First Course Prototype Experimental Exception.md`  
**Run contract:** `../AQA-PSYCHOLOGY-7182-STUDENT-PILOT-RUN.md`

## Purpose

This directory is the working **Course Truth** layer for AQA A-level Psychology 7182. It converts the stable 118-requirement AQA alignment inventory into independently authored, source-traceable Psychology knowledge and skill records suitable for later Exam Truth, learning design and learner-asset production.

It is not learner-facing copy and it is not a production `foundation_approved` state.

## Separation of roles

Each record deliberately separates:

- **board alignment** — compact requirement scope derived from AQA `REFERENCE_ONLY` material;
- **subject truth** — independently structured Psychology knowledge supported by `OPEN`, `REVISION_OWNED` or appropriately `LICENSED` evidence;
- **Revision synthesis** — explicit relationships, cautions or teaching structures authored by Revision from supported facts; and
- **readiness** — whether the requirement is source-complete enough for Course Truth and whether downstream learner assets may safely depend on it.

AQA wording is not reusable teaching corpus.

## Requirement record shape

A Course Truth requirement should contain, where educationally relevant:

- stable `requirementId`;
- topic/group placement;
- rights-safe board-alignment summary and official alignment source;
- definitions/core concepts;
- theories/models and named research/evidence;
- relationships, mechanisms and causal links;
- methods/quantitative skills where applicable;
- evaluation, limitations and responsible-interpretation cautions;
- common misconceptions or boundary conditions;
- dependencies/cross-topic links;
- source evidence with classification/licence and the claim areas supported;
- explicit Revision-authored synthesis notes; and
- readiness/blocker state.

Fields that do not apply should be empty rather than padded with invented material.

## Completion rule

A requirement is `course_truth_ready` only when:

1. its material AQA scope is represented;
2. the required subject truth is supported by permitted evidence;
3. no material source-rights ambiguity remains;
4. any Revision synthesis is identified as synthesis rather than source quotation/finding; and
5. no known material subject-truth gap remains for the intended pilot.

Topic shards may be added incrementally. The course is **not complete** until the manifest reports all 118 requirements as `course_truth_ready` and the run contract's independent assurance has passed.

## Current starting position

The predecessor proof remains historical evidence. The student-pilot continuation starts from:

- 118 / 118 named requirements reviewed;
- after targeted continuation closure, 58 covered candidates, 60 partials and 0 outright gaps;
- 118 / 118 requirements with some reusable source support;
- £0 paid source/licence spend recorded to date; and
- no permission to treat source coverage alone as Course Truth completion.

The first retained shards reuse the already source-complete Social Influence and Forensic Psychology transformations, plus the newly closed Prochaska requirement, rather than regenerating those subjects from scratch.

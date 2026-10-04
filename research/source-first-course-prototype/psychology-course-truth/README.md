# AQA Psychology 7182 — Source-First Course Truth

**Status:** Experimental Course Truth candidate coverage complete; whole-course independent assurance pending  
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

Topic shards may be added incrementally. The course is **not complete** until the manifest reports all 118 requirements as `course_truth_ready` and the run contract's whole-course independent assurance has passed.

## Current continuation position

The predecessor proof remains historical evidence. After targeted continuation addenda 05 through 22 and completion of the Research Methods shard on 4 October 2026:

- 118 / 118 named requirements have reusable source support;
- the live source-review baseline is **118 covered candidates, 0 partials and 0 gaps**;
- 118 / 118 requirements are represented in requirement-level records marked `course_truth_ready`;
- all 17 named topic shards are `topic_complete_candidate`;
- Research Methods is 34 / 34 Course Truth-ready and is internally organised into the three bounded continuation slices: design/data collection, scientific process/reporting and data/statistics;
- known material subject-truth gaps: 0;
- known material rights blockers: 0;
- paid source/licence spend: £0;
- paid provider spend recorded for the continuation closures: £0; and
- `courseTruthComplete` remains **false** until whole-course structural, provenance and independent educational assurance has passed.

These retained shards reuse predecessor evidence and add targeted rights-clear evidence only where a real depth or rights residual remained. They do not regenerate already-supported subject knowledge from scratch.

## Immediate assurance gate

The next task is whole-course assurance of the exact 118-requirement candidate. At minimum this must confirm:

1. every stable requirement ID appears exactly once in the Course Truth topic shards;
2. every requirement marked `course_truth_ready` has non-empty material subject truth and traceable permitted evidence;
3. AQA and other reference-only material remains alignment/reference evidence rather than reusable teaching corpus;
4. topic and manifest counts reconcile exactly to the stable scope;
5. no unsupported causal, statistical, clinical or methodological overclaim has been introduced during transformation; and
6. an independent educational review finds no material omission that would make the candidate unsafe as the truth layer for downstream Exam Truth and learner-asset work.

Any assurance finding must be remediated in the candidate/evidence layer before `courseTruthComplete` is set true.

# AQA Psychology 7182 — Source-First Course Truth

**Status:** Experimental Course Truth complete; later production-level independent educational/assessment assurance still pending  
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

Course Truth is complete when all 118 in-scope requirements are `course_truth_ready`, there are no known material subject-truth or source-rights blockers, and the bounded structural/provenance reconciliation passes.

The active continuation run places fresh independent educational and assessment assurance at the later production-level assurance stage before restricted-pilot publication. Course Truth completion therefore does **not** imply that independent assurance has passed, that learner assets are approved, or that the course may be published.

## Current continuation position

The predecessor proof remains historical evidence. After targeted continuation addenda 05 through 22, completion of the Research Methods shard, whole-course reconciliation and two provenance remediations on 4 October 2026:

- 118 / 118 named requirements have reusable source support;
- the live source-review baseline is **118 covered candidates, 0 partials and 0 gaps**;
- 118 / 118 requirements are represented in requirement-level records marked `course_truth_ready`;
- all 17 named topic shards reconcile exactly to the stable 118-requirement scope;
- Research Methods is 34 / 34 Course Truth-ready and is internally organised into the three bounded continuation slices: design/data collection, scientific process/reporting and data/statistics;
- known material subject-truth gaps: 0;
- known material rights blockers: 0;
- paid source/licence spend: £0;
- paid provider spend recorded for the continuation closures: £0;
- `courseTruthComplete` is **true**;
- `wholeCourseIndependentAssurancePassed` remains **false** because that later publication-stage gate has not yet been run; and
- learner-facing readiness remains false.

Two material provenance-record defects were found during internal challenge and remediated before Course Truth completion: one stale ShareAlike licence version in Research Methods and five vague retained licence labels in Forensic Psychology. The deterministic assurance now pins those rechecked licences and rejects vague licence placeholders.

These retained shards reuse predecessor evidence and add targeted rights-clear evidence only where a real depth or rights residual remained. They do not regenerate already-supported subject knowledge from scratch.

## Next task

Proceed to **Exam Truth**, as required by step 2 of the active continuation run. Build the assessment model needed to generate authentic Revision-owned Exam Prep and assessment assets for AQA 7182, including paper/component structure, duration, marks, AO weighting/ranges, research-method and mathematical requirements, compulsory/optional relationships, command and cognitive-demand patterns, question/response families, source/data/scenario demands, extended-response expectations, timing/whole-paper constraints and rules for representative Revision-authored questions and mocks.

Official AQA assessment material may be used as structured `REFERENCE_ONLY` alignment authority. It must not be converted into reusable teaching or assessment corpus.

Fresh independent educational and assessment assurance remains mandatory before restricted-pilot publication under the active continuation run and applicable publication assurance authorities.

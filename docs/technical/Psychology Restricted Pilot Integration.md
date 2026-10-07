# Psychology 7182 Restricted-Pilot Integration

## Status

Implementation in progress on `feat/psychology-restricted-pilot-shipping-2026-10-07`.

This document records the production integration boundary for AQA A-level Psychology 7182. It does not change the governing Source-First pilot authority or FI-007 product authority.

## Objective

Get the complete, trustworthy Psychology course into the canonical learner application as soon as the existing restricted-pilot assurance gate permits, without making reliable assisted written-answer marking a prerequisite for course availability.

The course still targets the full intended learner journey:

`Overview → Learn → Practice → Exam Prep → Progress`

The course is not considered finished when content first appears on the site. Assisted written-answer marking is the immediate second milestone.

## Phase 1 — trusted course on the site

The production content pack projects the completed Psychology Course Truth into the ordinary content registry.

It contains:

- 17 topics;
- 118 Course Truth requirements;
- one learner Learn page for every requirement;
- retrieval flashcards and objective checks across the 118 requirements;
- Research Methods data drills;
- Psychology exam-technique guidance;
- three 120-minute / 96-mark Revision-authored representative papers;
- the exact current Paper 3 option-group structure;
- a Psychology Exam Prep paper guide using AO1–AO3.

The three paper modules share one learner course so Course Truth is not duplicated across papers.

### Written-answer boundary in Phase 1

Written Exam Prep and mock questions remain available.

Until FI-007 Psychology marking is independently validated:

- written answers are not REV-marked;
- self-marked exam evidence must remain labelled `self_assessed`;
- self-assessed evidence must not create examiner-like certainty or high-confidence readiness by itself;
- no Psychology Marking Pack is represented as calibrated production marking truth.

This is a marking-capability boundary, not a content-depth reduction.

## Phase 2 — finish Psychology assisted marking

Phase 2 starts immediately after Phase 1 reaches the restricted learner site.

Do not start another subject in place of this work.

The next milestone is to take the existing Psychology Step 5 Marking Pack candidates through the FI-007 readiness path:

1. select the supported Psychology written-question catalogue;
2. remediate prompt/rubric semantic defects found by independent assurance;
3. build genuine calibration anchors from independently judged responses rather than fabricated anchors;
4. validate exact marks / ranges / abstention behaviour;
5. prove marker reproducibility and confidence controls;
6. connect the validated `WrittenAnswerMarker` implementation to Psychology Practice / Exam Prep;
7. enable evidence only at the confidence level authorised by Claims and Progress governance;
8. verify improve-and-resubmit and check-this-mark behaviour;
9. run restricted-pilot marking verification.

Phase 2 is complete only when Psychology written answers can be marked under FI-007 without false precision and the resulting evidence semantics are authorised.

## Publication gate

The production manifests remain `preview` while final whole-course educational and assessment assurance is outstanding.

Promotion to `available` requires the governed restricted-pilot gate:

- deterministic content/schema/coverage checks pass;
- rights and provenance remain clean;
- fresh whole-course educational challenge has zero unresolved BLOCKING or MATERIAL findings;
- fresh assessment/authenticity challenge for the learner-visible exam material has zero unresolved BLOCKING or MATERIAL findings;
- canonical learner routes are verified with a restricted test account;
- Founder explicitly approves the exact merge.

## Implementation notes

The learner runtime already supports the Phase 1 boundary:

- written Practice is only offered for REV marking when a real `WrittenAnswerMarker` is connected;
- the Exam Simulator supports self-marked written mocks and labels their evidence `self_assessed`;
- the content registry discovers normal `content/**/index.ts` packs automatically.

The only generic exam-runtime addition required for Psychology is support for a choice option containing several questions, needed for whole-topic Paper 3 option sections.

## Documentation impact

This is production technical documentation only.

No normative product or assurance authority is changed.

The governing pilot run remains `research/source-first-course-prototype/AQA-PSYCHOLOGY-7182-STUDENT-PILOT-RUN.md`, and FI-007 remains governed by `10-product-governance/Assisted Exam Answer Marking.md`.

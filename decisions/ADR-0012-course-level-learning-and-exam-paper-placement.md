# ADR-0012 — Course-level learning and exam-paper placement

**Status:** Accepted  
**Date:** 2026-08-18

## Context

Revision's typed content model currently publishes content packs with paper/component identifiers. After AQA A-level Business 7132 was added, Papers 1, 2 and 3 each referenced the same course-wide learning content because AQA can assess the full syllabus on all three papers.

The learner shell treated each published pack as an independent learning module. That exposed the same topics, flashcards, quick checks and practice three times and could also cause global progress and REV to interpret the same syllabus as three separate evidence scopes.

AQA AS Business 7131 has the same structural issue: both papers can assess all six AS content areas. The repository currently contains an assured Paper 2 pack only, but those six content areas are course content rather than a Paper 2-owned syllabus.

## Decision

The learner shell will distinguish the **storage/content-pack boundary** from the **learner-facing academic boundary**.

When all published paper/component packs in a course expose the same learning content:

- the shell creates one course-level learning scope;
- Overview, Learn, general Practice and Progress are presented once for the course;
- evidence recorded under any paper module in that course contributes to the course-level topic/evidence picture;
- global Progress and REV count that shared syllabus once; and
- paper/component selection appears inside Exam Prep for targeted written questions and timed/full simulations.

Paper/module IDs remain valid for paper-specific exam evidence, provenance and compatibility.

If components genuinely contain different syllabus content, the shell retains component-level Learn/Practice/Progress rather than forcing course-level consolidation.

## Implementation approach

The current implementation detects identical learning payloads generically in `src/app/catalogue-model.ts`. It does not hard-code Business or assume that every qualification shares content across papers.

Course routes are introduced beneath the canonical learner app:

`#/subjects/:subjectId/courses/:courseId/:section`

Existing module routes remain supported. A module route belonging to a shared-learning course resolves to the course-level learner experience so recent links do not expose duplicate syllabuses.

The content schema is not replaced in this change. It may continue to use paper-oriented packs internally while the learner shell derives the correct academic presentation.

## Consequences

Positive consequences:

- learners see each shared syllabus once;
- topic counts and evidence coverage are no longer inflated by the number of exam papers;
- REV does not recommend the same unevidenced topic separately for multiple papers;
- paper-specific exam preparation remains clearly available;
- AS and A-level Business follow the same academic rule; and
- future subjects can choose course-level or component-level presentation from their actual specification structure.

Trade-offs:

- the shell temporarily infers shared learning by comparing validated learning payloads rather than using an explicit schema field;
- AS Business still has only an assured Paper 2 exam pack, so Exam Prep cannot show Paper 1 until that pack is produced and assured; and
- a future content-model revision may make course-owned content explicit rather than deriving it from paper packs.

## Documentation impact

This decision is governed by `10-product-governance/Course Content and Assessment Component Placement.md` and implemented/documented in the current learner-shell technical documentation. Historical content assurance records remain unchanged because the assured learner content itself is not being rewritten by this structural change.
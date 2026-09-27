# ADR-0028 — Subject Knowledge Foundation and exact-course projection

**Status:** Proposed for Founder approval  
**Date:** 27 September 2026  
**Decision owner:** Founder  
**Applies to:** Content Factory subject knowledge, course mapping, Course Truth, Exam Truth, learner-asset reuse and course scaling

## Context

Revision's active Content Factory architecture correctly established Course Truth and Exam Truth before learner assets and introduced exact-course assurance gates.

However, the normal model still establishes subject knowledge primarily inside each exact course. That risks repeated research, generation and assurance when adding another exam board or specification in the same subject.

The Founder has clarified two simultaneous requirements:

1. Revision must scale quickly to additional courses after the first Business course is approved.
2. Revision must teach genuine subject understanding and real-world use, not only coach students to pass an exam.

The Founder also clarified that when an exam-board reconciliation reveals missing or insufficient subject knowledge, the reusable subject knowledge should become more comprehensive rather than patching only the board-specific course.

## Decision

Revision will introduce a reusable **Subject Knowledge Foundation** upstream of exact Course Truth.

The target dependency model is:

```text
Subject Knowledge Foundation
        |
        +--> exact Specification Mapping / required depth
        |
        +--> exact Exam Truth
        |
        v
Approved / AI-assured exact Course Foundation
        |
        v
Course Learning Blueprint
        |
        +--> Learn
        +--> Practice
        +--> Exam Prep
```

Course Truth remains the exact governed model for a qualification/specification/cohort, but it should normally be projected from reusable subject nodes plus exact specification requirements rather than duplicating the underlying educational truth.

Exam Truth must exist before final Course Learning Blueprint derivation because assessment demand affects the capabilities Learn and Practice must develop. Exam Truth does not define or limit the educational meaning of subject knowledge.

## Subject-foundation expansion rule

When a new or changed specification reveals a content issue:

- reuse sufficient existing subject knowledge unchanged;
- expand insufficient shared subject knowledge in the Subject Knowledge Foundation;
- add genuinely missing shared knowledge to the Subject Knowledge Foundation;
- keep board-specific structure and assessment facts in Specification Mapping, Board Alignment or Exam Truth.

This prevents exam-board forks from becoming competing versions of subject truth.

## Reuse and invalidation

Approved/assured unchanged subject nodes are reusable across exact courses.

A new course must not rerun full subject creation merely because the awarding body differs.

Material changes to an existing shared node trigger dependency analysis for every course and learner asset that uses it. A new node used only by a new course must not invalidate unrelated courses.

## Educational principle

Revision will distinguish:

- **Subject Truth** — genuine understanding of the subject at the supported qualification-family level;
- **Course Truth** — what this exact specification requires the learner to know and be able to do; and
- **Exam Truth** — how that knowledge/capability must be demonstrated in the exact assessment.

Learn should build coherent understanding. Practice should retrieve, apply, reason with and deepen that understanding. Exam Prep should translate that understanding into performance under exact assessment conditions.

The exam is a required performance constraint, not the maximum boundary of worthwhile understanding.

## Existing Business work

Existing AQA Business artifacts are not discarded.

They must be reconciled into one of:

- reusable Subject Knowledge Foundation evidence/content;
- AQA specification mapping;
- AQA Exam Truth;
- reusable or course-specific learner assets; or
- historical evidence only.

No artifact is automatically promoted because it passed an earlier pipeline; no valid artifact should be regenerated solely because the orchestration model changed.

## Consequences

Positive:

- adding another Business board can focus on mapping, deltas and Exam Truth;
- shared educational corrections propagate deliberately across affected courses;
- unchanged knowledge avoids unnecessary regeneration/review;
- Learn and Practice may be reused where dependencies genuinely match;
- the subject knowledge asset becomes stronger as new legitimate specifications expose gaps;
- the exact-course publication guarantee remains intact.

Costs and risks:

- a new durable subject-level identity/version boundary is required;
- specification mappings become first-class governed dependencies;
- existing Business artifacts need controlled reconciliation;
- over-generalising the Subject Knowledge Foundation could create an unbounded encyclopedia or force inappropriate common structure across subjects;
- reuse rules must be dependency-based rather than title-based similarity.

## Guardrail against premature abstraction

The Subject Knowledge Foundation is bounded to the qualifications Revision deliberately serves. It is not required to model the entire academic discipline.

Business is the first trial. The next Business exam board must prove reuse. A later materially different subject must prove the machinery is not Business-specific.

## Relationship to existing decisions

ADR-0020 remains valid for Foundation-gated staged asset production except where it assumes subject knowledge is established only within an exact course.

ADR-0024 remains valid for `ai_assured` controlled internal production and qualified-human `foundation_approved` publication eligibility.

ADR-0027 and the Course Learning Blueprint remain valid for learning-treatment planning; their input Course Truth should now be traceable to reusable subject knowledge plus exact specification mapping.

## Documentation impact

This ADR is implemented normatively by `80-company-workflows/Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`.

Technical implementation/trial sequencing is documented in `docs/technical/Content Factory Subject Foundation Trial.md`.

Historical ADRs and retained Content Factory evidence remain unchanged.
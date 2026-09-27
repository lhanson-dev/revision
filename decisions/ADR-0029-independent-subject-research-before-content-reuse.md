# ADR-0029 — Independent subject research before content reuse

**Status:** Proposed; accepted on Founder-approved merge  
**Date:** 27 September 2026

## Context

ADR-0028 introduced a reusable Subject Knowledge Foundation upstream of exact Course Truth so later exam boards can reuse unchanged subject knowledge.

The first Business implementation already has substantial AQA 7132 Course Truth, learner content and assurance evidence. Reusing that work is desirable, but using it as the starting definition of generic Business creates anchoring risk: an AQA-shaped model could be relabelled as subject truth while carrying forward specification-specific organisation and any earlier omissions.

An exact-course assurance pass answers whether the modeled AQA Foundation is internally and externally credible for that course. It does not independently prove that the modeled knowledge set is the best comprehensive board-independent Business subject universe.

## Decision

For the first governed course in a new subject family, Revision will establish a fresh independent subject-research baseline before existing course-derived content may be promoted into reusable Subject Knowledge Foundation truth.

The baseline will:

- use fresh permitted external subject evidence;
- be created without inspecting Revision's existing course content/taxonomy or using an exam-board specification as its organising outline;
- be sealed before exam-board comparison;
- then receive a post-seal breadth challenge against current relevant official specifications; and
- provide the benchmark against which existing Revision content is reconciled.

Existing content and prior assurance are preserved as evidence and reuse candidates. They are not discarded and are not automatically grandfathered into the new subject layer.

Later exam boards reuse the resulting assured Subject Knowledge Foundation and normally perform mapping/delta work rather than rerunning the complete independent subject baseline.

## Consequences

### Positive

- reduces first-board anchoring risk;
- gives an independent way to detect subject gaps before scaling to additional boards;
- separates subject completeness evidence from specification completeness evidence;
- preserves prior investment through explicit reconciliation and targeted reuse;
- makes the second-board scalability test more meaningful; and
- strengthens genuine subject understanding beyond exam coaching.

### Cost / risk

- adds one substantial research step when establishing a new subject family;
- requires careful source-rights handling and freshness;
- can over-expand scope if the qualification-family boundary is not enforced; and
- requires reconciliation work before prior exact-course content can become shared subject truth.

These costs are accepted because the baseline is intended to be created once per subject family and reused across later courses.

## Rejected alternatives

### Promote the existing AQA CKM directly and fill gaps only when later boards expose them

Rejected because it makes the first specification the de facto generic subject model and can institutionalise omissions or board-specific organisation.

### Build a universal all-level Business encyclopedia first

Rejected as unbounded and disproportionate. The initial foundation remains scoped to the supported UK Level 3 / A-level Business family.

### Rerun full independent research for every new Business exam board

Rejected because it destroys the principal reuse benefit of the Subject Knowledge Foundation model. Later courses should trigger targeted subject expansion only where genuine deltas are found.

## Relationship to previous decisions

This ADR refines ADR-0028. It does not reverse the reusable Subject Knowledge Foundation decision or weaken exact-course Course Truth / Exam Truth assurance.

Historical AQA Foundation, learning-asset and remediation evidence remains historically true.
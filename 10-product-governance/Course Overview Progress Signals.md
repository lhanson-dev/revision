---
title: "Course Overview Progress Signals"
document_id: "revision-course-overview-progress-signals"
document_type: "product-authority"
authority: "product-governance"
status: "active"
version: "1.1"
owner: "Founder"
effective_date: "2026-09-22"
last_reviewed: "2026-09-22"
content_review_status: "founder-approved"
source_of_truth_for: ["Course Overview progress panel", "Topic Knowledge learner-facing meaning", "Course Overview Exam Readiness and Topic Knowledge hierarchy", "subject-level Topic Knowledge roll-up"]
depends_on: ["Course Learning Blueprint", "REV Guidance and Conversation Pattern", "Claims and Progress Governance", "Product UX Principles", "Product System Model"]
supersedes: ["Course Learning Blueprint Overview wording that specifies Reviewed plus Exam Readiness as the concise Overview progress pair", "Course Overview Progress Signals v1.0 Topics Secure terminology"]
---
# Course Overview Progress Signals

## Purpose

Define the Founder-approved progress signals shown alongside REV guidance on the learner Course Overview.

The Course Overview is a decision surface, not a full progress dashboard. It should give the learner a concise answer to two different questions:

1. **How strong does my demonstrated exam performance currently look?**
2. **How well does the evidence currently say I know and can use the course topics?**

Those questions are represented by **Exam Readiness** and **Topic Knowledge**.

## Governing decision

The Course Overview progress pair is:

- **Exam Readiness**; and
- **Topic Knowledge**.

`Topic Knowledge` is the learner-facing name for Revision's evidence-backed understanding / knowledge-and-application judgement. It deliberately replaces the earlier `Topics Secure` terminology because `Secure` is less plain and can be misread as a technical or permanent classification.

`Reviewed` remains a legitimate secondary content-exposure signal elsewhere in the product, especially the dedicated Progress experience. A separate evidence-breadth/observation measure may also be useful deeper in Progress, but neither is the primary knowledge-progress signal on Course Overview.

## Exam Readiness

Exam Readiness remains the demonstrated-performance judgement governed by the existing evidence/readiness rules.

Where there is not yet enough varied qualifying evidence, the Overview should use a plain state such as **Building** rather than manufacture a percentage.

Exam Readiness answers how well the learner currently appears able to perform under the relevant exam demands, not how much content they have opened or completed.

## Topic Knowledge

Topic Knowledge answers the learner question:

> **How well do I currently know this topic?**

The preferred learner-facing bands are:

- **Low**;
- **Medium**; and
- **Good**.

These bands describe demonstrated knowledge and application from valid learner-performance evidence. They are not a count of content viewed, activities attempted or evidence merely observed.

The exact numerical boundaries, weighting and evidence sufficiency rules may be refined as Revision calibrates the model. Changing those mechanics does not require changing the learner-facing concept, provided the resulting judgement continues to satisfy the evidence and claims rules in this authority.

### Evidence sufficiency and performance

A topic-level judgement must consider both:

1. **Evidence sufficiency** — whether there is enough relevant, varied and representative learner-performance evidence to support a meaningful judgement; and
2. **Demonstrated performance** — what that evidence says about the learner's ability to recall, understand and use the relevant knowledge and skills.

One incidental scored result is not enough to justify a strong topic-level judgement. Repeated success in one narrow activity type must not prove broader skills that the activity cannot validly assess.

Where evidence is too limited to support Low / Medium / Good responsibly, the product should use a plain insufficient-evidence state rather than manufacture certainty.

### What does not improve Topic Knowledge by itself

Topic Knowledge must not improve merely because the learner:

- opened or viewed Learn content;
- completed passive reading or viewing;
- spent time on the topic;
- encountered it in navigation;
- attempted an activity without demonstrating the underlying knowledge or skill;
- completed only a starting/diagnostic check whose provenance is deliberately excluded from ongoing progress evidence; or
- repeatedly used an activity type that does not validly assess the material claim being made.

Weak or incorrect performance is still useful evidence because it helps Revision understand what needs attention, but it should not be converted into a positive knowledge claim merely because evidence now exists.

### Topic Knowledge is current, not permanent

Topic Knowledge is a current evidence-based judgement. Newer, broader or contradictory evidence may move a topic between bands in either direction.

The learner should never have to complete every available Practice format simply to improve the status. Alternative validated routes may establish the same underlying knowledge or skill where they provide suitable evidence.

### Topic Knowledge is not evidence confidence

Do not label this metric `Topic Confidence`.

Revision separately needs to represent **confidence in the evidence behind a judgement**. A learner could currently have a Good Topic Knowledge judgement while Revision still has limited confidence in that judgement because the evidence is narrow, old or inconsistent.

Learner-facing wording should keep these concepts distinct:

- **Topic Knowledge** — how well the available evidence says the learner knows and can use the material;
- **Evidence confidence** — how strong, broad, recent and reliable the evidence behind that judgement is.

### Topic Knowledge is distinct from Exam Readiness

Topic Knowledge and Exam Readiness are deliberately related but not identical.

- **Topic Knowledge** shows how well the learner appears to know and use the underlying subject material.
- **Exam Readiness** shows how well that knowledge and skill appears likely to transfer into performance under the relevant exam demands.

A learner may therefore have several Good topics while still needing exam-technique, timing or authentic-paper practice. Conversely, strong exam-style performance on a limited part of the course must not imply uniformly Good knowledge across the whole subject.

## Subject-level roll-up

The same Topic Knowledge model should roll up transparently from topics to the subject/course level.

The preferred summary is a distribution rather than a pseudo-precise average, for example:

- `6 topics Good`;
- `3 topics Medium`;
- `1 topic Low`.

This lets the learner see overall progress and remaining weak areas without implying that a single percentage precisely represents subject knowledge.

A future aggregate score may be introduced only if evidence and calibration justify it. It must not replace the transparent underlying topic picture merely for visual simplicity.

## Calibration rule

The exact band boundaries, weighting, recency treatment and evidence requirements are evidence and implementation questions. They must be deliberately calibrated and assured against the governed course/evidence model rather than invented solely to make the UI display convenient labels.

The first implementation may use a deliberately simple calibrated model and evolve it later, provided:

- the learner-facing meaning remains truthful;
- evidence breadth and validity are respected;
- passive activity is not mistaken for knowledge;
- uncertainty is not hidden; and
- later changes remain backward-explainable and assured.

## Course Overview placement

On desktop, the progress pair should appear as a distinct secondary panel on the **right-hand side of the REV guidance header/feature area**.

The hierarchy is:

`REV recommendation + reason + action | progress panel`

followed by the shared conversational route:

`Got something else on your mind? → Ask REV anything…`

The progress panel is supporting context. It must not compete visually with the recommended next action.

On tablet and phone, the same information may stack beneath the recommendation and above the conversational route while preserving the same semantic order.

## Relationship to the dedicated Progress section

The Overview uses only concise orientation signals.

The dedicated Progress section remains responsible for deeper interpretation including topic-level Topic Knowledge, Reviewed/content exposure, evidence breadth and confidence, change over time and explanation of what the learner should do next.

Progress across a whole subject/course should reuse the same Topic Knowledge bands and roll-up logic rather than create a competing measure with different semantics.

## Documentation impact

Version 1.1 records the Founder decision of 22 September 2026 to replace `Topics Secure` with the plainer **Topic Knowledge** model, using learner-facing Low / Medium / Good bands and a transparent subject-level distribution.

This is a terminology and product-model refinement, not permission to weaken the evidence standard. Implementation must still prove that Topic Knowledge is based on demonstrated knowledge/application rather than page views, completion or simple evidence presence.

The precise mechanics may be calibrated and improved later without reopening the learner-facing concept, provided the governing evidence semantics remain intact. Historical evidence and earlier design records remain unchanged.

---
title: "Course Overview Progress Signals"
document_id: "revision-course-overview-progress-signals"
document_type: "product-authority"
authority: "product-governance"
status: "active"
version: "1.0"
owner: "Founder"
effective_date: "2026-09-22"
last_reviewed: "2026-09-22"
content_review_status: "founder-approved"
source_of_truth_for: ["Course Overview progress panel", "Evidence Coverage learner-facing meaning", "Course Overview Exam Readiness and Evidence Coverage hierarchy"]
depends_on: ["Course Learning Blueprint", "REV Guidance and Conversation Pattern", "Claims and Progress Governance", "Product UX Principles"]
supersedes: ["Course Learning Blueprint Overview wording that specifies Reviewed plus Exam Readiness as the concise Overview progress pair"]
---
# Course Overview Progress Signals

## Purpose

Define the Founder-approved progress signals shown alongside REV guidance on the learner Course Overview.

The Course Overview is a decision surface, not a full progress dashboard. It should give the learner a concise answer to two different questions:

1. **How strong does my demonstrated exam performance currently look?**
2. **Across how much of this course has Revision actually observed assessed work rather than just content exposure?**

Those questions are represented by **Exam Readiness** and **Evidence Coverage**.

## Governing decision

The Course Overview progress pair is:

- **Exam Readiness**; and
- **Evidence Coverage**.

`Reviewed` remains a legitimate secondary content-exposure signal elsewhere in the product, especially the dedicated Progress experience. It is not the primary coverage signal in the Course Overview progress panel.

This deliberately supersedes the earlier Course Learning Blueprint wording that described the Overview pair as Reviewed plus Exam Readiness.

## Exam Readiness

Exam Readiness remains the demonstrated-performance judgement governed by the existing evidence/readiness rules.

Where there is not yet enough varied qualifying evidence, the Overview should use a plain state such as **Building** rather than manufacture a percentage.

Exam Readiness answers how well the learner currently appears able to perform, not how much content they have opened or completed.

## Evidence Coverage

Evidence Coverage is an **assessed-evidence breadth** signal.

It answers:

> **Across how many course topics does Revision have qualifying scored evidence from the learner's active work?**

A display such as `10 / 10 topics` therefore means Revision has seen qualifying assessed work across all ten topics. It does **not** mean all ten topics are strong, mastered or exam ready.

This distinction is intentional. `Evidence Coverage 10 / 10` can legitimately coexist with `Exam Readiness: Building` when every topic has some qualifying assessed evidence but the evidence is not yet sufficiently varied or substantial for the readiness model to publish a supported readiness score.

### What counts

A topic counts toward Evidence Coverage when Revision holds at least one **qualifying scored learning-evidence result** for that topic from active Practice or Exam Prep work under the governed evidence model.

The qualifying result must represent actual learner performance rather than mere exposure. The implementation should reuse the same accepted scored evidence/provenance rules used by learner readiness rather than creating a page-view or completion proxy.

### What does not count

Evidence Coverage must not increase merely because the learner:

- opened or viewed Learn content;
- completed passive reading or viewing;
- spent time on a topic;
- encountered a topic in navigation; or
- completed a starting/diagnostic check whose provenance is deliberately excluded from ongoing learner evidence.

### Breadth is not strength

Evidence Coverage and Exam Readiness must remain distinct.

Evidence Coverage answers **where Revision has assessed evidence**. Exam Readiness answers **what that evidence supports about likely performance**.

Weak or incorrect performance can therefore still make a topic evidence-covered: it is useful evidence that Revision has observed the learner on that topic. The weak result should reduce readiness and influence the next recommendation rather than making the topic disappear from coverage.

Conversely, a learner may perform strongly in a small number of topics while Evidence Coverage remains low because Revision has not yet observed assessed work across the rest of the course.

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

The dedicated Progress section remains responsible for deeper interpretation including topic-level evidence, Reviewed/content-exposure state, evidence confidence, change over time and explanation of what the learner should do next.

## Documentation impact

This authority records the Founder decision of 22 September 2026 to use Evidence Coverage, rather than content Reviewed, as the Course Overview breadth signal and to position the progress pair separately from the proactive REV recommendation on desktop.

Implementation must update the current technical documentation and assurance so Evidence Coverage cannot silently regress into a page-view or completion metric or be mistaken for mastery/readiness. Historical evidence and earlier design records remain unchanged.
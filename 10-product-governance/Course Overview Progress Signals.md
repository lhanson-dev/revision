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
source_of_truth_for: ["Course Overview progress panel", "Topics Secure learner-facing meaning", "Course Overview Exam Readiness and Topics Secure hierarchy"]
depends_on: ["Course Learning Blueprint", "REV Guidance and Conversation Pattern", "Claims and Progress Governance", "Product UX Principles", "Product System Model"]
supersedes: ["Course Learning Blueprint Overview wording that specifies Reviewed plus Exam Readiness as the concise Overview progress pair"]
---
# Course Overview Progress Signals

## Purpose

Define the Founder-approved progress signals shown alongside REV guidance on the learner Course Overview.

The Course Overview is a decision surface, not a full progress dashboard. It should give the learner a concise answer to two different questions:

1. **How strong does my demonstrated exam performance currently look?**
2. **Across how much of this course does the evidence currently support that I know and can use the material?**

Those questions are represented by **Exam Readiness** and **Topics Secure**.

## Governing decision

The Course Overview progress pair is:

- **Exam Readiness**; and
- **Topics Secure**.

`Reviewed` remains a legitimate secondary content-exposure signal elsewhere in the product, especially the dedicated Progress experience. A separate evidence-breadth/observation measure may also be useful deeper in Progress, but neither is the primary knowledge-progress signal on Course Overview.

This deliberately supersedes the earlier Course Learning Blueprint wording that described the Overview pair as Reviewed plus Exam Readiness.

## Exam Readiness

Exam Readiness remains the demonstrated-performance judgement governed by the existing evidence/readiness rules.

Where there is not yet enough varied qualifying evidence, the Overview should use a plain state such as **Building** rather than manufacture a percentage.

Exam Readiness answers how well the learner currently appears able to perform under the relevant exam demands, not how much content they have opened or completed.

## Topics Secure

Topics Secure is a **demonstrated-knowledge breadth** signal.

It answers:

> **Across how many course topics does the available evidence currently support a positive judgement that the learner knows and can use the material?**

A display such as `10 / 10 topics` means all ten topics currently meet Revision's governed evidence standard for being secure. It must not mean merely that the learner has opened the topic, attempted something, or produced one scored result.

`10 / 10 topics secure` is therefore a materially stronger claim than `evidence seen in 10 / 10 topics`.

It does not mean the learner has answered every question correctly, can never weaken later, or is guaranteed a particular exam result. It means the accumulated evidence for every topic is currently strong enough to support the learner-facing judgement **secure**.

### What a topic must demonstrate

A topic may count as Secure only when both of these are true:

1. **Evidence sufficiency** — there is enough qualifying, varied and relevant learner-performance evidence to support a meaningful topic-level judgement; and
2. **Performance sufficiency** — the demonstrated performance meets the governed standard for secure knowledge/application for that topic.

The product must not turn evidence presence into achievement. A weak result is useful evidence, but it does not make the topic Secure merely because Revision has now observed the learner doing work there.

### Evidence quality and breadth

The Secure judgement should use the same underlying curriculum/evidence model that powers learner intelligence rather than a cosmetic completion counter.

Evidence may come from validated Practice and Exam Prep activity where that activity can genuinely demonstrate the relevant knowledge or skill. The evidence set should reflect the topic's governed learning and assessment demands; repeated success in one narrow format must not prove a broader skill that the format cannot validly assess.

For example, repeated flashcard success may strongly support recall but cannot by itself establish secure applied reasoning or extended evaluation where those are material demands of the topic.

### What does not count as Secure

A topic must not become Secure merely because the learner:

- opened or viewed Learn content;
- completed passive reading or viewing;
- spent time on the topic;
- encountered it in navigation;
- completed one incidental scored item;
- completed only a starting/diagnostic check whose provenance is deliberately excluded from ongoing progress evidence; or
- repeatedly used an activity type that does not validly assess the material claim being made.

### Secure is evidence-based, not permanent

Topics Secure is a current judgement, not a permanent badge.

New evidence may strengthen, weaken or overturn an earlier Secure state. Older evidence may also become less persuasive when recency matters. If a topic is no longer sufficiently supported, the count may decrease and the product should explain why constructively.

The learner should never have to complete every available Practice format simply to make the number rise. Alternative validated routes may establish the same underlying knowledge or skill where they provide equivalent evidence.

### Secure is distinct from Exam Readiness

Topics Secure and Exam Readiness are deliberately related but not identical.

- **Topics Secure** shows the breadth of the course for which Revision currently has sufficiently strong evidence of knowledge/application.
- **Exam Readiness** shows how well the learner appears able to turn that knowledge and skill into performance under the relevant exam demands.

A learner can therefore have many Secure topics while still needing exam-technique, timing or authentic-paper practice. Conversely, strong performance on a limited part of the course must not imply that the whole course is Secure.

## Threshold and calibration rule

The exact performance threshold, weighting and evidence requirements for `Secure` are evidence and implementation questions. They must be deliberately calibrated and assured against the governed course/evidence model rather than invented solely to make the UI display a convenient count.

Until that rule is implemented and validated, the product must not relabel a simple `topics with evidence` count as `Topics Secure`.

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

The dedicated Progress section remains responsible for deeper interpretation including topic-level Secure/developing/insufficient-evidence state, Reviewed/content exposure, evidence breadth and confidence, change over time and explanation of what the learner should do next.

## Documentation impact

This authority records the Founder decision of 22 September 2026 to make the Course Overview breadth signal a demonstrated-knowledge measure rather than an activity/evidence-observation measure, and to position that signal separately from the proactive REV recommendation on desktop.

Implementation must update the current technical documentation and assurance so `Topics Secure` cannot silently regress into a page-view, completion or `has any evidence` counter. Historical evidence and earlier design records remain unchanged.

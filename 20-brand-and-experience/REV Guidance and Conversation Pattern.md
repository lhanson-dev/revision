---
title: "REV Guidance and Conversation Pattern"
document_id: "revision-rev-guidance-and-conversation-pattern"
document_type: "domain-authority"
authority: "brand-and-experience"
status: "active"
version: "1.0"
owner: "Founder"
effective_date: "2026-09-22"
last_reviewed: "2026-09-22"
content_review_status: "founder-approved"
source_of_truth_for: ["REV-led decision surfaces", "proactive REV guidance and reactive Ask REV pattern", "REV feature-header identity treatment", "Powered by REV use on governed REV-led decision surfaces", "inline Ask REV use on governed REV-led decision surfaces", "REV recommendation scope by screen context"]
depends_on: ["Product Strategy", "Product UX Principles", "Visual Brand System", "Identity Asset Usage Rules", "Global Learner Navigation", "Returning Student Home Experience", "Course Learning Blueprint"]
supersedes: ["Identity Asset Usage Rules limitation of Powered by REV to the Returning Student Home hero", "Global Learner Navigation wording treating the prominent inline Ask REV input as Home-specific", "Returning Student Home ordering that separates the promoted first task from the REV feature moment"]
---
# REV Guidance and Conversation Pattern

## Purpose

Define the Founder-approved interaction pattern for learner screens where REV is intentionally presented as a prominent decision-support presence.

REV must support two different learner intents without forcing the learner to choose between separate product experiences:

1. **REV leads** — Revision uses governed learner evidence, planning and course context to suggest the most useful next action and explain why.
2. **The student leads** — the learner can immediately ask REV about something else through the existing contextual conversation experience.

The pattern is designed to make REV feel consistent across the product while preserving different page jobs and recommendation scopes.

## Core principle

On a governed REV-led decision surface, REV should answer both questions within one coherent feature moment:

> **What do you think I should do next?**

and

> **What if I have something else on my mind?**

These are complementary interaction paths, not competing cards or separate assistants.

The first path is **proactive guidance**. The second path is **reactive conversation**.

## Canonical feature structure

A REV-led decision surface should normally contain, in this order where the available space and screen job allow:

1. the canonical **Living E** at an appropriate feature scale using the approved soft atmospheric halo and genuine semantic state behaviour;
2. the governed **Powered by REV** compact attribution;
3. one clear REV recommendation or next-step statement;
4. one concise evidence-based reason for the recommendation;
5. concise progress/readiness context where it materially helps the learner understand the recommendation;
6. one dominant action to start the recommended task; and
7. a visually separated conversational route such as **Got something else on your mind?** with an **Ask REV anything…** input.

The conversational input must open the same contextual REV conversation layer already governed by Global Learner Navigation. It must not create a second chat implementation, separate memory, separate identity or duplicate REV workspace.

## Proactive guidance rules

REV recommendations must come from governed deterministic or otherwise approved recommendation/planning logic. A prominent REV treatment does not permit unconstrained generative judgement to replace the underlying recommendation model.

The recommendation must:

- identify one most useful next action rather than presenting several equal priorities;
- include enough reason text to make the suggestion credible;
- use learner evidence, course state, plan state or other governed context truthfully;
- match the strength of the evidence available;
- avoid fabricated weakness, precision, assessment dates, readiness claims or certainty;
- route directly to the useful next activity where the implementation can identify it safely; and
- retain learner agency through the Ask REV path and normal navigation.

## Conversation rules

The Ask REV path exists for the learner who does not want to follow the current recommendation, wants an explanation, has a different revision need or simply wants to ask something else.

The pattern should use plain learner-facing language. Preferred framing includes:

- `Got something else on your mind?`
- `Ask REV anything…`
- `Want to work on something else? Ask REV.`

Do not frame the conversation path as an exception, override or failure to follow the recommendation.

Where the screen already has a persistent Ask REV shell action, the inline input remains valid because it serves a different purpose: it makes the REV-led decision moment immediately conversational. The persistent action continues to guarantee global availability.

## Identity and visual consistency

REV-led decision surfaces use the existing REV identity system rather than inventing local treatments.

They must use:

- the canonical three-bar **Living E**;
- the approved Resting / Listening / Thinking / Responding / Completed state model where those states are genuine;
- the soft glow/halo language from the current REV system;
- Manrope and the Calm Teal role-token system;
- the governed compact **Powered by REV** treatment; and
- the same Light/Dark identity logic as the wider learner product.

The exact feature scale may vary by page. Home may be larger than Course Overview. Consistency means the same identity grammar and interaction language, not identical page composition.

No mascot, face, robot, character, orb identity or locally reconstructed `Powered by REV` treatment may be introduced.

## Approved use of Powered by REV

`Powered by REV` is approved for **governed REV-led decision surfaces**, not only the Returning Student Home hero.

Its purpose is to identify a feature area as an active REV guidance/conversation moment. It remains secondary to the Living E and the learner-facing message.

Approved current uses are:

- Returning Student Home REV feature area; and
- Course Overview REV guidance feature area.

Future uses on Learn, Practice, Exam Prep, Progress or other learner screens require the screen to have a genuine REV-led decision job. Do not apply the attribution to every page, card or generic AI-assisted element merely for consistency.

## Recommendation scope by screen

The same pattern uses different context boundaries depending on the learner's location.

### Home

Home uses **learner-wide scope**.

REV should select the most useful next task from the learner's active programme, including all active subjects/courses and relevant planned work, using the governed planner/recommendation model.

The Home REV feature area should therefore make one best next task immediately available, explain why it matters, and provide the Ask REV alternative in the same feature moment.

Today's revision plan remains useful beneath the REV feature area, but it should provide plan context and the remaining intended work rather than needlessly duplicating the complete promoted first-task presentation already shown by REV.

### Course Overview

Course Overview uses **course scope**.

REV should recommend the most useful next action inside the selected course, using course-level evidence and approved course recommendation logic. It should explain the reason, show concise relevant progress/readiness context, provide the start action, and then offer the generic Ask REV path.

The conversation layer should receive the current course context automatically so the learner does not need to restate which course they are viewing.

### Narrower learning surfaces

Learn, Practice, Exam Prep and Progress may use the same two-intent model when REV is deliberately made a prominent decision-support feature, but the page's primary job must remain dominant.

For example:

- Learn remains explanation-led;
- Practice remains task/feedback-led;
- Exam Prep remains performance-led; and
- Progress remains interpretation/action-led.

The pattern must not turn every screen into the same REV hero.

## Responsive behaviour

The two learner intents must remain clear at phone, tablet and desktop sizes.

On constrained screens the hierarchy should normally remain:

`REV identity → recommendation/reason → start action → Ask REV input`

Progress context may compress or move beneath the recommendation, but it must not push the useful action below unnecessary decorative content.

The existing persistent tablet/mobile Ask REV dock remains governed and should not be duplicated as a second persistent control inside the feature area.

## Accessibility and motion

- Resting motion must remain subtle and low-amplitude.
- Reduced-motion preferences must keep the Living E recognisable and the halo visible without unnecessary movement.
- The recommendation and Ask REV input must remain keyboard accessible.
- Visual hierarchy must not depend on colour alone.
- Focus, touch-target and contrast rules from the Interface System and WCAG 2.2 AA baseline remain applicable.

## Documentation impact

This authority records the Founder-approved decision of 22 September 2026 to standardise REV-led decision surfaces around two complementary intents: **REV recommends** and **Ask REV**.

It deliberately expands `Powered by REV` and prominent inline Ask REV use beyond the Returning Student Home hero to governed REV-led decision surfaces. Existing identity geometry, Living E motion semantics, persistent Ask REV navigation and recommendation/evidence truth rules remain unchanged.

Implementation changes to Home and Course Overview must update their relevant technical documentation and visual assurance baselines in the same governed change. Historical prototypes and prior design evidence remain historically accurate and must not be rewritten.

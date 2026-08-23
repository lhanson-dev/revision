---
title: "Product UX Principles"
document_id: "revision-product-ux-principles"
document_type: "domain-authority"
authority: "brand-and-experience"
status: "active"
version: "0.5"
owner: "Founder"
effective_date: "2026-08-17"
last_reviewed: "2026-08-23"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["learner experience principles"]
depends_on: ["Tone of Voice Framework", "Emotional Experience Principles"]
supersedes: null
---
# Product UX Principles

## Make the useful action obvious
Every important learner screen should have a clear hierarchy. The student should be able to scan the page and understand the primary useful action quickly.

Do not make the learner decode a dense dashboard, deep menu or long introduction before they can start.

## Don't make me think
Revision should minimise interpretation work that stands between a learner's intent and useful action.

On a material learner screen, the learner should be able to understand within seconds:

- where they are;
- what this screen is for;
- what matters most now; and
- what useful action they can take next.

Do not rely on the learner to infer hierarchy from several equally prominent cards, buttons or metrics. If the intended next action matters, make it visually and verbally obvious.

Clarity does not require removing learner control. A recommended path may be strongly prioritised while legitimate alternatives remain available as secondary actions.

## One screen, one dominant job
Every material screen should have one dominant product job within its user journey.

Before designing or materially revising a screen, identify:

- the user's immediate goal;
- the job the screen must perform;
- the information needed to make the next decision;
- the primary call to action;
- legitimate secondary actions; and
- the success condition and next state.

If several unrelated actions all appear primary, the hierarchy is unresolved.

## Design journeys, not isolated pages
A screen is part of an end-to-end user journey. Its quality cannot be judged only as a static page.

Experience design must consider:

- how the user arrived;
- what context Revision already knows;
- what the user is trying to achieve;
- what information or decision is required now;
- what should happen next; and
- whether the transition preserves momentum and context.

Avoid forcing the learner back through navigation, setup or repeated explanation when Revision can take them directly to the next useful state.

## Consistency without sameness
Revision should feel like one coherent product without making every screen look structurally identical.

Shared typography, colour roles, spacing, controls, icons, assets, accessibility and interaction patterns come from the approved Interface System. Page composition, information density and visual rhythm should reflect the job of the experience.

For example:

- Home should orient and create momentum;
- Learn should prioritise reading, explanation and comprehension;
- Practice should prioritise the task, response and feedback;
- Plan should prioritise choices and commitments;
- Progress should prioritise interpretation and next action;
- Exam Prep and Exam Simulator should feel focused and performance-oriented; and
- Admin may use higher information density while retaining the same foundations.

Do not create visual variety through local design-system forks. Do not create consistency by turning every experience into the same grid of bordered cards.

## Explain before asking
Every section or exercise must briefly explain what it is, why it matters and what the learner is aiming to achieve.

Explanatory copy should not become a barrier before obvious actions. Give the learner the minimum orientation needed to act confidently, then provide deeper explanation progressively where useful.

## Explain after measuring
Every result, score, readiness indicator or recommendation must explain in simple language:
- what the result means
- the evidence used
- how confident Revision is where relevant
- why a recommendation was made
- what the learner should do next

## Design for scanning
Learner-facing content should use:
- strong headings and hierarchy
- short sections and paragraphs
- concise lists where useful
- action-oriented labels
- progressive disclosure for secondary detail

Do not remove useful depth merely to make a page shorter. Keep the primary path concise and make deeper explanation available when the learner wants or needs it.

## Break complexity into manageable steps
Complex setup, explanation or decision journeys should be divided into clear stages rather than presented as one large task.

Collect information progressively where possible. Do not ask the student to configure more than is needed to reach the next useful outcome.

## Completion rule
A learner-facing capability is not complete merely because it functions technically. It is complete only when its purpose, expected outcome, result and next action can be understood without technical knowledge.

A screen is not complete merely because it conforms to visual tokens. It must also perform its intended journey job with clear content hierarchy and an obvious next action.

## Responsive and mobile-first experience
Revision is a multi-device learner product. Core learner journeys must be fully usable on mobile phones, tablets and laptop/desktop screens.

Responsive design is a product requirement, not a visual enhancement. Design from constrained screens upward rather than treating mobile as a late retrofit.

All learner-facing capabilities must therefore:
- adapt layout, navigation, typography, controls, tables, forms, charts and exam interactions to the available screen size
- remain usable with touch as well as pointer/keyboard input
- avoid horizontal scrolling for ordinary page content
- preserve readable text and appropriately sized interactive targets
- keep essential actions, explanations, results and progress information available across supported device sizes
- support both portrait and landscape layouts where the journey reasonably requires it, especially tablet and exam experiences
- avoid desktop-only interactions such as hover-dependent controls

A capability that works on laptop but is materially harder or incomplete on mobile or tablet is not complete.

## Performance supports engagement
Learner journeys should feel responsive. Avoid unnecessary heavy media, autoplay, animation or interaction that delays the student reaching useful work.

Rich media is justified when it improves learning or engagement enough to warrant the cost. Performance and clarity should not be sacrificed merely to make the interface look more impressive.

## Accessibility and neurodiversity
Revision should target WCAG 2.2 AA as the baseline for learner-facing experiences and should be designed for a diverse student population rather than an assumed average learner.

At minimum:
- do not use colour alone to communicate status
- maintain readable typography and sufficient contrast
- support keyboard navigation and logical focus order
- provide captions and transcripts for relevant audio/video
- avoid flashing or unnecessarily distracting motion
- use clear, literal language where possible
- allow non-essential motion to be reduced or skipped
- test significant journeys with disabled and neurodivergent learners as the product matures

Specific accessibility implementation requirements may be governed separately as the product develops.

## Commercial discovery and upgrade behaviour
Revision may expose stronger Paid or Premium capability to Free/lower-tier learners where doing so helps them understand the product and the additional value available.

Upgrade desire should be earned through clear additional value, not manufactured frustration.

Where a learner encounters a tier boundary:
- make the current entitlement state understandable rather than allowing a locked feature to masquerade as available
- explain the additional learner benefit in context, not merely the plan name or a padlock
- prefer upgrade prompts at moments where the stronger capability is genuinely relevant to the learner's current goal
- preserve work already completed and avoid making the learner repeat or lose activity simply because an entitlement boundary was reached
- use previews, examples or bounded demonstrations where they help the learner understand the stronger experience
- make the route to compare plans or upgrade simple without overwhelming the learning journey
- keep upgrade prompts proportionate rather than turning ordinary study into a stream of sales interruptions

Do not use:
- false scarcity or manipulative countdowns
- exam-anxiety exploitation or messages implying payment is necessary to avoid failure
- shame, guilt or pressure about the learner or parent not paying
- misleading enabled-looking controls that reveal a paywall only after unnecessary work
- repeated blocking prompts designed primarily to wear the learner down
- artificial degradation of evidence, progress, safety, accessibility or educational accuracy by subscription status

Free must remain a coherent and genuinely useful learner experience. Paid and Premium should feel desirable because they provide materially stronger value, depth, intelligence, personalisation, scale or convenience.

## Interaction should have a purpose
Use quizzes, progress feedback, motion, rewards and other interactive elements when they improve understanding, motivation or momentum.

Do not use addictive mechanics, manipulative countdowns, forced sharing or visual noise simply to increase engagement metrics.

## Design rules
- Reduce cognitive load.
- Keep navigation recognisable and avoid unnecessary depth.
- Make progress transparent rather than mysterious.
- Prefer useful guidance over dashboards full of unexplained numbers.
- Keep secondary detail available without competing with the main action.
- Avoid experiences that feel childish, institutional or needlessly formal.
- Optimise journeys for seconds-to-understanding and seconds-to-useful-action.
- Use the shared design system for coherence, not as a reason to make different product jobs look the same.

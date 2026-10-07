---
title: "REV Guidance and Conversation Pattern"
document_id: "revision-rev-guidance-and-conversation-pattern"
document_type: "domain-authority"
authority: "brand-and-experience"
status: "active"
version: "2.1"
owner: "Founder"
effective_date: "2026-10-07"
last_reviewed: "2026-10-07"
content_review_status: "founder-approved"
source_of_truth_for: ["REV-led decision surfaces", "proactive REV guidance and reactive Ask REV pattern", "primary learner-header Ask REV conversation strip", "REV feature-header identity treatment", "Powered by REV use on governed REV-led decision surfaces", "inline Ask REV use on learner headers", "REV recommendation scope by screen context", "REV's jobs, voice and suggestion rules", "REV answering questions", "REV safeguarding launch rule"]
depends_on: ["Product Strategy", "Product UX Principles", "Learner Design System", "Identity Asset Usage Rules", "Global Learner Navigation", "Returning Student Home Experience", "Course Learning Blueprint", "Claims and Progress Governance"]
supersedes: ["Identity Asset Usage Rules limitation of Powered by REV to the Returning Student Home hero", "Global Learner Navigation wording treating the prominent inline Ask REV input as Home-specific", "Returning Student Home ordering that separates the promoted first task from the REV feature moment", "REV Guidance and Conversation Pattern v1.0 limitation of the prominent inline Ask REV treatment to REV-led decision surfaces", "REV Guidance and Conversation Pattern v1.1 Topics Secure terminology", "REV Guidance and Conversation Pattern v1.2 Topic Knowledge progress pair on REV-led headers", "REV Guidance and Conversation Pattern v1.2 five-state REV model in the learner app (Completed state)"]
---
# REV Guidance and Conversation Pattern

## Purpose

Define the Founder-approved interaction pattern for learner screens where REV is intentionally presented as a prominent decision-support presence, and the shared conversational treatment used consistently across primary learner page headers.

Revision supports two different learner intents:

1. **REV leads** — Revision uses governed learner evidence, planning and course context to suggest the most useful next action and explain why where the screen has a genuine recommendation job.
2. **The student leads** — the learner can immediately ask REV about something else through the existing contextual conversation experience.

The pattern is designed to make REV feel consistent across the product while preserving different page jobs and recommendation scopes.

## Authority relationship

This document owns REV's learner behaviour, recommendation/conversation pattern, scope and voice. `Learner Design System.md` owns REV's learner visual treatment: Deep Teal + Living E, the four-state learner model, motion constraints and REV surface geometry. `Identity Asset Usage Rules.md` owns exact identity asset geometry.

## Core principle

Revision separates two related patterns that must not be confused:

- a **shared conversational header route** that lets the student ask REV something else from primary learner pages; and
- a **selective proactive REV recommendation** shown only where REV has a genuine decision-support job and governed recommendation logic.

This means all primary learner page headers can feel consistently conversational without turning every page into the same REV hero.

Where proactive guidance is present, REV should answer both questions within one coherent feature moment:

> **What do you think I should do next?**

and

> **What if I have something else on my mind?**

The first path is **proactive guidance**. The second path is **reactive conversation**.

## REV's three jobs

Founder decision, 1 October 2026. REV has three jobs:

1. **Suggest** what to do next, based on the student's progress, and always say why.
2. **Answer** questions whenever the student asks.
3. **Coach**: be a positive, motivating presence.

## Who REV is

- REV feels like **an older student who got top marks in these subjects**, not a teacher.
- **Relatable, not try-hard:** everyday words, contractions, short sentences. No slang that dates quickly.
- **Encouraging and honest:** celebrates real progress with specifics, never gives empty praise, and frames weak areas as the next thing to sort.
- **Shares the shortcuts:** memory tricks, what examiners look for, how to structure answers.
- **Calm about exams.**
- **Never pretends to be human.** REV never claims to have sat exams, been to school or had personal experiences.

| A teacher would say | REV says |
| --- | --- |
| You should revise break-even before your examination. | Break-even's on Paper 1 and it's worth nailing. Want to do 10 minutes on it now? |
| Your answer lacked sufficient evaluation. | Good analysis. To get the top marks, finish with a judgement: which factor matters most, and why? |
| Well done on completing the task. | That's your best score on finance yet. You're getting this. |

These examples show voice only. Real REV copy is built from the student's real data; never show these example topics or scores to a student unless they are true for that student. The voice rules are also in `Tone of Voice Framework.md`.

## Suggestion rules

- **Every REV card includes a reason taken from real data.** No reason, no card: show the screen's empty state instead.
- **The topic is chosen by rules, not by a language model.** A model may only reword the reason.
- Priority order, using the progress statuses (Got it, Nearly there, Needs work, Just started, Not started) from `Claims and Progress Governance.md`:
  1. An exam within **14 days** covers a topic marked Needs work.
  2. A topic marked Needs work, then Nearly there.
  3. A topic with an exam coming that has not been studied for **7 or more days**.
  4. The next unstarted topic in course order.
- The 14-day and 7-day windows are starting values, to be tuned after testing (open item, Founder to decide).
- **Suggest something else** moves to the next candidate. **Not now** hides that suggestion until tomorrow. The same topic is not suggested twice in a day unless the student asks.
- The recommendation logic that already exists in the planner must be reconciled with this order when the Home screen is rebuilt; the order above governs the learner-facing result.

## Answering questions

- REV answers questions **for real from launch**. There are no canned or fake replies anywhere.
- REV helps with anything the student asks, not only their courses. Questions about their courses are answered from the **approved course content**, using the context of what the student is reading or practising.
- REV **never answers a scored or timed exam question for the student**, and never writes assessed coursework. It helps them work it out.
- When REV is not sure, it says so rather than guessing.
- Answers suit a teenage audience.

## Safeguarding (launch rule)

- If a student says they are really struggling, REV replies kindly and briefly, suggests talking to a teacher, parent or another trusted adult, points to UK support such as Childline and Shout, then offers to carry on with their revision.
- REV is not a support service. It does not counsel or hold long conversations about wellbeing.
- If a student may be in immediate danger, REV gives emergency help (999) straight away.
- **Alerting a parent or school is not part of launch.** It needs a full safeguarding review first (open item, Founder).

## Deferred: "REV noticed"

"REV noticed" pattern cards are out for launch. The session and answer history is kept so they can come back later with a higher evidence bar than five data points (open item, Founder).

## Where and how Ask REV appears

Founder decision, 1 October 2026: Ask REV is a **pop-up conversation** over the current page, and takes over the full screen on phones. There is no separate Ask REV page. See `Global Learner Navigation.md`.

Ask REV is **a real model, used efficiently.** Questions the app can answer from the student's own data or from approved course content should be answered that way, without a paid model call; a model is used when judgement, explanation or coaching is needed. The detailed approach is in the learner v2 data model proposal (`docs/design/learner-redesign-v2/data-model-proposal.md`) and is a proposal until approved. The "no canned or fake replies" rule is unchanged: free answers must be built only from real data and approved content.

## Shared primary learner-header conversation strip

The compact conversational treatment is a shared learner-header pattern.

Primary learner page headers should provide a visually consistent route using language such as:

**Got something else on your mind?**

with the existing:

**Ask REV anything…**

input.

The conversation strip:

- must open the existing contextual REV conversation layer;
- must carry the current page/course/topic context where available;
- must not create a second chat implementation, memory store, identity or workspace;
- should remain visually secondary to the page's dominant job;
- should reuse the approved Calm Teal, Manrope and REV identity language (display headings use Bricolage Grotesque per `Learner Design System.md`); and
- may be compact on pages where a full proactive REV recommendation is not appropriate.

`Primary learner page header` means the main orientation/header region for a material learner destination. It does not mean every subsection heading, card title, modal, exam question, task panel or administrative surface.

The shared conversation strip is intentionally broader than the proactive recommendation pattern.

## Canonical proactive REV feature structure

A REV-led decision surface should normally contain, in this order where the available space and screen job allow:

1. the canonical **Living E** at an appropriate feature scale using the approved soft atmospheric halo and genuine semantic state behaviour;
2. the governed **Powered by REV** compact attribution;
3. one clear REV recommendation or next-step statement;
4. one concise evidence-based reason for the recommendation;
5. concise progress/readiness context where it materially helps the learner understand the recommendation;
6. one dominant action to start the recommended task; and
7. the shared visually separated **Got something else on your mind?** / **Ask REV anything…** conversation strip.

The conversational input must open the same contextual REV conversation layer already governed by Global Learner Navigation.

## Proactive guidance rules

REV recommendations must come from governed deterministic or otherwise approved recommendation/planning logic (see Suggestion rules above). A prominent REV treatment does not permit unconstrained generative judgement to replace the underlying recommendation model.

The recommendation must:

- identify one most useful next action rather than presenting several equal priorities;
- include enough reason text to make the suggestion credible;
- use learner evidence, course state, plan state or other governed context truthfully;
- match the strength of the evidence available;
- avoid fabricated weakness, precision, assessment dates, readiness claims or certainty;
- route directly to the useful next activity where the implementation can identify it safely; and
- retain learner agency through the Ask REV path and normal navigation.

## Progress context on REV-led headers

Progress context is supporting evidence for the learner, not part of the recommendation sentence itself.

Where a REV-led header includes progress signals, desktop should normally separate them into a distinct secondary region to the **right of the proactive recommendation** rather than embedding the metrics inside the recommendation copy.

The desktop hierarchy should therefore read as:

`REV recommendation + reason + action | concise progress panel`

with the shared conversational strip beneath.

On constrained screens the progress region may stack beneath the recommendation and above the Ask REV strip.

Progress context on REV-led headers uses the governed measures from `Claims and Progress Governance.md`: **Topics covered**, **Understanding** and **Exam readiness**, kept separate and never blended into one percentage. Exam readiness is an engine-produced value or "Not enough evidence yet"; REV-led headers never show a predicted grade.

The earlier Course Overview pair of Exam Readiness and Topic Knowledge (Low / Medium / Good) is superseded by these three measures. `Claims and Progress Governance.md` owns their current meaning; `Course Overview Progress Signals.md` is retained only as superseded history after the learner-design reconciliation.

## Conversation rules

The Ask REV path exists for the learner who does not want to follow the current recommendation, wants an explanation, has a different revision need or simply wants to ask something else.

The pattern should use plain learner-facing language. Preferred framing includes:

- `Got something else on your mind?`
- `Ask REV anything…`
- `Want to work on something else? Ask REV.`

`Got something else on your mind?` is the preferred standard treatment for primary learner page headers unless the local page job requires a clearer equivalent.

Do not frame the conversation path as an exception, override or failure to follow the recommendation.

Where the screen already has a persistent Ask REV shell action, the inline input remains valid because it serves a different purpose: it makes the page context immediately conversational. The persistent action continues to guarantee global availability.

## Identity and visual consistency

REV-led decision surfaces and shared learner-header conversation treatments use the existing REV identity system rather than inventing local treatments.

They must use:

- the canonical three-bar **Living E** where the feature composition includes REV presence;
- the learner-app REV state model (Waiting, Listening, Thinking, Responding) where those states are genuine, as set out in `Learner Design System.md`. Waiting is the Resting state; the Completed state is not used in the learner app;
- the soft glow/halo language from the current REV system;
- Manrope (body) and the Calm Teal role-token system, with Bricolage Grotesque for display headings;
- the governed compact **Powered by REV** treatment on proactive REV-led decision surfaces; and
- the same Light/Dark identity logic as the wider learner product.

The exact feature scale may vary by page. Home may be larger than Course Overview. A compact conversation-only header treatment does not need to reproduce the full Living E hero. Consistency means the same identity grammar and interaction language, not identical page composition.

No mascot, face, robot, character, orb identity or locally reconstructed `Powered by REV` treatment may be introduced.

## Approved use of Powered by REV

`Powered by REV` is approved for **governed REV-led decision surfaces**. It is not required on every compact learner-header conversation strip.

Its purpose is to identify a feature area as an active REV guidance/conversation moment. It remains secondary to the Living E and the learner-facing message.

Approved current uses are:

- Returning Student Home REV feature area; and
- Course Overview REV guidance feature area.

Future uses on Learn, Practice, Exam Prep, Progress or other learner screens require the screen to have a genuine proactive REV-led decision job. Do not apply the attribution to every page, card or generic AI-assisted element merely for consistency.

## Recommendation scope by screen

The same proactive pattern uses different context boundaries depending on the learner's location.

### Home

Home uses **learner-wide scope**.

REV should select the most useful next task from the learner's active programme, including all active subjects/courses and relevant planned work, using the governed planner/recommendation model.

The Home REV feature area should therefore make one best next task immediately available, explain why it matters, and provide the shared Ask REV conversation strip in the same feature moment.

Today's revision plan remains useful beneath the REV feature area, but it should provide plan context and the remaining intended work rather than needlessly duplicating the complete promoted first-task presentation already shown by REV.

### Course Overview

Course Overview uses **course scope**.

REV should recommend the most useful next action inside the selected course, using course-level evidence and approved course recommendation logic. It should explain the reason and provide the direct start action.

On desktop, Course Overview should keep the recommendation dominant on the left and show the concise three-measure progress panel (Topics covered, Understanding, Exam readiness) separately on the right. Roll-ups must be transparent rather than inventing a competing score.

The shared `Got something else on your mind?` / `Ask REV anything…` strip sits beneath the decision area.

The conversation layer should receive the current course context automatically so the learner does not need to restate which course they are viewing.

### Narrower learning surfaces

Learn, Practice, Exam Prep and Progress should use the shared primary learner-header conversation strip while preserving their own page job.

They may also use the proactive two-intent model when REV is deliberately made a prominent decision-support feature, but proactive guidance is not mandatory merely because the conversation strip is present.

For example:

- Learn remains explanation-led;
- Practice remains task/feedback-led;
- Exam Prep remains performance-led; and
- Progress remains interpretation/action-led.

The pattern must not turn every screen into the same REV hero.

## Responsive behaviour

The student-led conversation route must remain immediately available at phone, tablet and desktop sizes.

For proactive REV-led surfaces, constrained-screen hierarchy should normally remain:

`REV identity → recommendation/reason → start action → concise progress → Ask REV input`

where local composition may move progress before the action if that improves comprehension without weakening the primary path.

The existing persistent tablet/mobile Ask REV dock remains governed and should not be duplicated as a second persistent control inside the feature area.

## Accessibility and motion

- Resting motion must remain subtle and low-amplitude.
- Reduced-motion preferences must keep the Living E recognisable and the halo visible without unnecessary movement.
- Recommendation actions and Ask REV inputs must remain keyboard accessible.
- Visual hierarchy must not depend on colour alone.
- Focus, touch-target and contrast rules from the Interface System and WCAG 2.2 AA baseline remain applicable.

## Documentation impact

Version 2.0 records the Founder decisions of 1 October 2026 for the learner redesign v2.1 (effective on merge of the design-system v2.1 PR; full record in `docs/design/decisions/2026-10-01-learner-redesign-v2.md`):

- REV's three jobs, who REV is (with the teacher-versus-REV examples), the suggestion rules, answering questions and the safeguarding launch rule are added.
- "REV noticed" is deferred for launch.
- The Course Overview Exam Readiness plus Topic Knowledge pair is replaced by the three measures. This also supersedes the 22 September 2026 Topic Knowledge terminology below.
- The Completed Living E state is not used in the learner app.

Open items for the Founder: the 14-day and 7-day suggestion windows, the safeguarding review before any parent or school alerts, and the "REV noticed" evidence bar.

Version 1.2 records the Founder-approved decision of 22 September 2026 to use **Topic Knowledge** rather than `Topics Secure` as the plain learner-facing knowledge-progress concept. Topic Knowledge uses Low / Medium / Good topic bands, remains distinct from evidence confidence and Exam Readiness, and can roll up transparently to subject/course progress.

Version 1.1 standardised `Got something else on your mind?` / `Ask REV anything…` as a compact shared treatment across primary learner page headers while keeping proactive REV recommendations selective and context-specific, and separated concise progress signals from proactive recommendation copy on desktop REV-led headers.

Implementation changes must update their relevant technical documentation and visual assurance baselines in the same governed change. Historical prototypes and prior design evidence remain historically accurate and must not be rewritten.


## Documentation impact — learner design reconciliation

Version 2.1 keeps REV behaviour and voice here while delegating learner visual treatment to `Learner Design System.md` and current progress semantics to `Claims and Progress Governance.md`. No recommendation, safeguarding or conversation rule changes.

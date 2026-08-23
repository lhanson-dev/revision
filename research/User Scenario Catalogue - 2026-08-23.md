# User Scenario Catalogue — 23 August 2026

**Status:** Analysis / journey-design input — not normative authority  
**Programme:** Issue #141 — journey-led full-site content and design review  
**Purpose:** Define the stable user-scenario catalogue that will organise journey mapping, prototype review and future regression assurance.  
**Relationship to existing analysis:** This catalogue is the scenario-first organising layer for `research/Journey Experience Analysis - 2026-08-23.md`. The existing screen-purpose analysis remains supporting detail; scenarios are the primary unit for deciding what a user is trying to achieve before screens are designed.

## Canonical user terminology

Revision has three core user/customer experience types:

1. **Student** — the study and revision experience being built first.
2. **Parent** — a core future parent/supporter experience.
3. **Teacher** — a core future teacher experience.

**Student** is the canonical term for the person using Revision's study product. Do not maintain a parallel `learner` synonym internally for the same entity. Existing authority and technical terminology that predates this decision must be migrated deliberately before implementation rather than becoming a permanent second vocabulary.

The account model should be capable of routing:

`Account → Student | Parent | Teacher → experience-specific shell and journeys`

Experience type is distinct from payer, linked-supporter, Admin and future teacher/school permission roles.

## Why scenarios are the primary design unit

Revision should be designed around a real user situation and intended outcome, not around a list of pages.

The working sequence is:

`real user situation → scenario → ideal journey → screens → content/actions → prototype → implementation → automated assurance`

Screens are outputs of scenarios. Regression tests are also outputs of scenarios.

A scenario describes a meaningful user job such as:

> **I have opened Revision and want it to tell me what would be most useful to do now.**

It does not describe a technical state such as `API returns 503`. Technical failures, loading states, empty states and other exceptions sit underneath the relevant scenario and will be catalogued in a later recovery/exception pass.

## Catalogue rules

1. **Start with happy paths.** This first catalogue records legitimate user goals when the product behaves normally.
2. **Use stable IDs.** Scenario IDs should remain stable so journey design, PRs, analytics and automated assurance can refer to the same product contract.
3. **Do not make every state a scenario.** Error, loading, empty, permission and degraded states normally belong beneath a scenario unless they create a materially different user job.
4. **Scenarios do not approve features.** A scenario may describe governed target behaviour for a feature that is not yet `Ready`; the feature lifecycle and Definition of Ready still control implementation.
5. **Happy path does not mean one forced path.** Student agency remains valid. Where choosing an alternative is itself a common legitimate goal, it may have its own scenario.
6. **Assurance maps back to scenarios.** A scenario may later be evidenced through browser, integration, unit, accessibility, responsive and production-smoke layers as appropriate to risk.

# Scenario families

## NS — New Student / first value

| ID | User scenario | Successful outcome |
| --- | --- | --- |
| **NS-01** | **I’ve just found Revision and want to start revising.** | Student understands enough of the proposition, creates/enters an account and reaches useful setup quickly. |
| **NS-02** | **I want Revision to know what course I study.** | First supported course is correctly identified and saved to the Student’s programme. |
| **NS-03** | **I want Revision to work out where I should start.** | Student completes an appropriate short starting check and receives an appropriately cautious initial recommendation. |
| **NS-04** | **I want to do my first useful piece of revision.** | Student completes useful work, receives meaningful feedback and understands what to do next. |

## RS — Returning Student / Home

| ID | User scenario | Successful outcome |
| --- | --- | --- |
| **RS-01** | **I’ve opened Revision and want it to tell me what would be most useful to do now.** | Home gives one clear, evidence-appropriate recommendation and the Student can start it directly. |
| **RS-02** | **I was already doing something useful and want to carry on.** | Student resumes meaningful unfinished work without reconstructing context. |
| **RS-03** | **I know what I want to revise and want to choose it myself.** | Student chooses different work and Revision respects that agency while retaining the wider programme context. |

## CR — Courses / Student programme control

| ID | User scenario | Successful outcome |
| --- | --- | --- |
| **CR-01** | **I want to see the courses I study and choose one.** | Student sees their saved programme and opens the exact course they want. |
| **CR-02** | **I want to add another course I study.** | Student identifies and adds another supported course without repeating onboarding. |
| **CR-03** | **I’ve opened a course and want to know what would be most useful here.** | Course Overview provides a contextual recommendation and direct route to useful work. |
| **CR-04** | **I’ve opened a course and already know how I want to revise it.** | Student directly chooses Learn, Practice, Exam Prep or Progress. |

## PL — Plan / adaptive revision programme

| ID | User scenario | Successful outcome |
| --- | --- | --- |
| **PL-01** | **I have an exam, mock or test coming up and want Revision to know about it.** | Assessment date, type and appropriate scope become planning context. |
| **PL-02** | **I want Revision to know how much revision time I realistically have.** | Student records realistic normal availability without creating a detailed timetable. |
| **PL-03** | **I want to know what I should do today.** | Student sees an achievable current workload and can start useful planned work directly. |
| **PL-04** | **I want to see what my revision programme currently looks like.** | Student understands Today, near-term and upcoming priorities without interpreting them as fixed commitments. |
| **PL-05** | **My available revision time has changed and I want my plan to reflect reality.** | Student updates availability and the plan recalculates appropriately. |
| **PL-06** | **I want to focus more on something specific for a while.** | Student discusses the preference with REV, understands important trade-offs and the short-term plan adapts appropriately. |

## LN — Learn

| ID | User scenario | Successful outcome |
| --- | --- | --- |
| **LN-01** | **Revision has recommended something I need to understand.** | Student reaches the correct learning content and understands/revisits the concept. |
| **LN-02** | **I know which topic I want to learn or revisit.** | Student selects the topic and reaches relevant learning material directly. |
| **LN-03** | **I think I understand this and want to test myself.** | Student moves naturally from Learn into relevant Practice without losing course/topic context. |

## PR — Practice / feedback / improvement

| ID | User scenario | Successful outcome |
| --- | --- | --- |
| **PR-01** | **I want Revision to choose useful practice for me.** | Student starts an evidence-appropriate recommended practice activity. |
| **PR-02** | **I want to choose my own practice.** | Student selects an appropriate topic/activity and starts it. |
| **PR-03** | **I’ve completed some practice and want to understand how I did.** | Feedback explains what happened, why it matters and what to do next rather than ending at a score. |
| **PR-04** | **My practice has exposed a weakness and I want to improve it.** | Student moves directly into the relevant explanation or targeted follow-up and retains context. |

## EX — Exam preparation / Exam Simulator

| ID | User scenario | Successful outcome |
| --- | --- | --- |
| **EX-01** | **I want to practise the areas most likely to improve my exam performance.** | Student starts appropriate targeted exam-question work. |
| **EX-02** | **I want to practise working under time pressure.** | Student completes an appropriate timed activity and receives useful feedback. |
| **EX-03** | **I want help improving how I answer exam questions.** | Student gets relevant exam-technique guidance and applies it in practice. |
| **EX-04** | **I want to practise a realistic exam.** | Student enters Exam Simulator, completes the intended exam experience and receives an appropriate result/readiness next action. |

## PG — Progress / readiness

| ID | User scenario | Successful outcome |
| --- | --- | --- |
| **PG-01** | **I want to know how I’m doing overall.** | Student understands the important programme-wide picture without diagnosing a dashboard themselves. |
| **PG-02** | **I want to understand how I’m doing in a particular course or topic.** | Student drills from programme to course/component/topic while retaining evidence meaning. |
| **PG-03** | **Progress is showing something I need to work on and I want to act on it.** | Student moves directly from insight into the appropriate Learn, Practice or Exam Prep action. |
| **PG-04** | **I want to understand how ready I am for an upcoming exam.** | Student sees evidence-grounded readiness, appropriate uncertainty and a useful next step. |

## RV — REV

| ID | User scenario | Successful outcome |
| --- | --- | --- |
| **RV-01** | **I don’t know what to revise and want to ask REV.** | REV uses the Student’s wider programme context to recommend a useful action and explain why. |
| **RV-02** | **I want to know why Revision is recommending something.** | REV explains the material evidence/reason without exposing opaque internal scoring. |
| **RV-03** | **I’m stuck on something I’m learning or got wrong.** | REV understands the current context and provides useful explanation/scaffolding. |
| **RV-04** | **I want to change what I’m focusing on.** | REV discusses the Student’s preference, keeps the wider picture visible and can route them into the agreed work. |

# Account and commercial scenarios

These scenarios are legitimate product-design inputs, but FI-002 remains governed by its own lifecycle. Their presence in this catalogue does not authorise unresolved checkout, verification, entitlement or billing implementation.

## AC — Account / preferences

| ID | User scenario | Successful outcome |
| --- | --- | --- |
| **AC-01** | **I want to view or change my basic account/settings.** | Student reaches a compact utility surface and makes the intended change. |
| **AC-02** | **I want to control how Revision communicates with me.** | Student understands and changes the relevant implemented communication/preferences settings. |

## SU — Subscription / upgrade

| ID | User scenario | Successful outcome |
| --- | --- | --- |
| **SU-01** | **I want to understand which Revision plan I currently have.** | Current plan and meaningful entitlements are clear. |
| **SU-02** | **I’ve seen a stronger capability and want to understand what an upgrade would give me.** | Student sees the benefit, current entitlement and route to compare plans without losing study context. |
| **SU-03** | **I’m an adult Student and want to upgrade my own Revision account.** | Adult Student chooses an approved plan/purchase path and receives the appropriate entitlement. |
| **SU-04** | **I pay for Revision and want to manage the subscription.** | Billing customer understands and manages the subscription without affecting Student work/evidence. |

# Parent / supporter scenarios

These scenarios remain subject to FI-002 relationship, trust, legal/privacy and entitlement readiness. Payment alone must not create Student-data permission.

## PS — Parent / supporter

| ID | User scenario | Successful outcome |
| --- | --- | --- |
| **PS-01** | **I’m a Student and want to link a parent/supporter.** | Student initiates the approved secure relationship path and the adult accepts it. |
| **PS-02** | **I’m an adult and want to buy Revision for a Student.** | Adult funds the Student through the approved commercial path, Student accepts the relationship as required, and entitlement/permissions remain correctly separated. |
| **PS-03** | **I’m a linked supporter and want reassurance that revision is going in the right direction.** | Supporter sees permitted high-level engagement/progress information. |
| **PS-04** | **I have Premium supporter access and want deeper guidance about how I can help.** | Supporter receives richer trends/interpretation without receiving private Student material. |
| **PS-05** | **I’m a Student and want to understand who is linked to me and what they can see.** | Student clearly understands the active supporter relationship and permission boundary. |

# Assisted exam-answer marking scenarios

FI-007 remains subject to its own Definition of Ready. These scenarios describe the approved intended Student job and do not grant implementation approval.

## AM — Assisted marking

| ID | User scenario | Successful outcome |
| --- | --- | --- |
| **AM-01** | **I’ve written an exam answer and want Revision to mark it.** | Supported typed answer is preserved, governed marking runs, and Student receives a truthful provisional result plus useful feedback. |
| **AM-02** | **I want to improve my answer using the feedback.** | Original attempt remains preserved; Student improves and resubmits, then understands what changed and why it is stronger. |
| **AM-03** | **I want Revision to check a mark I’m unsure about.** | Deliberate review occurs without silently overwriting history or presenting false certainty. |

# Admin / operational scenarios

Admin scenarios are intentionally operational rather than Student-style. They may use denser information architecture where that better supports the job.

## AD — Admin / operations

| ID | User scenario | Successful outcome |
| --- | --- | --- |
| **AD-01** | **I want a quick view of whether Revision is operating normally.** | Admin sees the high-level operations position and anything requiring attention. |
| **AD-02** | **I want to understand whether production, path-to-live and critical journeys are properly assured.** | Founder Assurance provides truthful current evidence, including Partial/Unknown rather than false green states. |
| **AD-03** | **I want to understand Student adoption and learning activity at an aggregate level.** | Admin views approved aggregate user/activity information without accessing private Student data. |
| **AD-04** | **I want to understand whether the adaptive planner is operating correctly.** | Admin sees relevant planner operational/assurance signals. |
| **AD-05** | **I want to add or manage supported content through the governed content process.** | Admin starts the appropriate Content Factory/content-operation flow rather than bypassing governance. |

# Catalogue size and boundary

This first happy-path catalogue contains **54 scenarios**:

- 35 core Student scenarios;
- 6 account/commercial scenarios;
- 5 parent/supporter scenarios;
- 3 assisted-marking scenarios; and
- 5 Admin/operational scenarios.

Teacher/class scenarios are not active in this catalogue because teacher functionality is a deliberate future product experience rather than part of the initial Student release. Referral and other later commercial ideas are also excluded until they become sufficiently governed product work.

# Golden journeys

The 54 scenarios are the coverage catalogue, not 54 separate Founder design workshops.

Golden journeys group related scenarios into a smaller number of end-to-end experiences that establish the main behavioural and visual product patterns. Founder review should focus on these journeys and on material differences in their variants.

## Proposed golden-journey set

| Golden journey | User job | Principal scenario coverage |
| --- | --- | --- |
| **GJ-01 — First ever use → first useful revision** | “I’ve found Revision; help me get to useful revision quickly.” | NS-01, NS-02, NS-03, NS-04 |
| **GJ-02 — Returning Student → recommended work** | “I have revision to do; tell me the best use of my time and get me into it.” | RS-01, PL-03, CR-03, PR-01, PR-03 |
| **GJ-03 — Student chooses their own work** | “I know what I want to revise; let me get there directly.” | RS-03, CR-01, CR-04, LN-02, PR-02 |
| **GJ-04 — Learn → Practice → Feedback → Improve** | “Help me understand something, test it, learn from the result and improve.” | LN-01, LN-03, PR-03, PR-04 |
| **GJ-05 — Plan → start useful work** | “Show me the current programme and let me act, not manage a timetable.” | PL-01, PL-02, PL-03, PL-04, PL-05, PL-06 |
| **GJ-06 — Progress → understand → act** | “Tell me how I’m doing and turn that insight into useful work.” | PG-01, PG-02, PG-03, PG-04 |
| **GJ-07 — Exam preparation → realistic performance practice** | “Help me prepare for the actual exam.” | EX-01, EX-02, EX-03, EX-04 |
| **GJ-08 — Ask REV in context** | “Help me without making me explain where I am or what I was doing.” | RV-01, RV-02, RV-03, RV-04 |
| **GJ-09 — Course control and contextual launch** | “Let me manage my programme and enter the right revision mode.” | CR-01, CR-02, CR-03, CR-04 |
| **GJ-10 — Encounter paid capability → understand value** | “Tell me what more I would get without disrupting my current useful experience.” | SU-01, SU-02, SU-03, SU-04 |
| **GJ-11 — Parent/supporter reassurance** | “Help me support the Student without surveilling them.” | PS-01, PS-02, PS-03, PS-04, PS-05 |
| **GJ-12 — Admin → understand product health and act** | “Tell me whether Revision is healthy and what needs attention.” | AD-01, AD-02, AD-03, AD-04, AD-05 |

Assisted marking (`AM-01`–`AM-03`) should be treated as a feature-specific golden journey when FI-007 reaches the appropriate lifecycle point rather than expanding the initial journey-review wave now.

# Wave 1 — Founder design focus

The first design wave should deliberately cover only three golden journeys. Together they establish activation, the recurring daily proposition and the core learning loop.

## GJ-01 — First ever use → first useful revision

**User situation:** A new Student has found Revision and wants to see whether it is useful.

**What this journey must prove:**

- account entry does not become a configuration barrier;
- the Student can tell Revision what they study without understanding internal academic structure;
- Revision can establish enough evidence/context to make a sensible first recommendation without overclaiming certainty;
- the Student reaches real revision quickly; and
- first feedback creates momentum rather than ending onboarding at a score or dashboard.

**Primary scenarios:** NS-01, NS-02, NS-03, NS-04.

**Next analysis output:** map the exact screen sequence and user actions before designing copy/components.

## GJ-02 — Returning Student → recommended work

**User situation:** A returning Student has decided to revise but does not want to plan the session themselves.

**What this journey must prove:**

- Home quickly answers what matters and what to do next;
- recommendation and resume behaviour have a deliberate hierarchy rather than competing equal cards;
- the Student can trust the recommendation with minimal explanation;
- starting recommended work does not require rediscovering it through navigation; and
- activity feedback returns to the wider adaptive loop.

**Primary scenarios:** RS-01, PL-03, CR-03, PR-01, PR-03.

**Next analysis output:** map the screen/action flow and explicitly resolve recommendation-versus-resume arbitration.

## GJ-04 — Learn → Practice → Feedback → Improve

**User situation:** A Student needs to understand something, test it, learn from the result and improve a weakness without losing context.

**What this journey must prove:**

- Learn feels like a coherent explanation/reading canvas rather than a grid of cards;
- Practice makes the task dominant;
- movement from Learn to Practice preserves course/topic context;
- feedback explains meaning before detail;
- weakness leads directly to useful improvement rather than another navigation decision; and
- REV can help contextually without undermining assessment integrity.

**Primary scenarios:** LN-01, LN-03, PR-03, PR-04.

**Next analysis output:** map the full screen/action loop including the route from feedback into targeted improvement and re-practice.

# How Founder review should work

For each golden journey, the design analysis should bring the Founder:

1. the user situation and intended successful outcome;
2. the shortest recommended end-to-end flow;
3. the screens/states required by that flow;
4. the material branch points or alternatives;
5. the small number of decisions that genuinely change the product experience; and
6. a recommendation for each decision rather than returning the design problem to the Founder.

Founder review should normally be `agree / challenge / change`, not a requirement to design each screen from scratch.

# Relationship to prototype and assurance

Once a golden journey flow is agreed:

1. map content hierarchy and actions on each screen;
2. create a clickable prototype of the complete journey rather than isolated screens;
3. use the prototype to judge comprehension, continuity and hierarchy;
4. promote any required product behaviour changes into the correct normative authority;
5. implement the governed journey when lifecycle/readiness rules permit; and
6. map automated assurance back to the scenario IDs.

A scenario can produce multiple assurance layers. For example, a Practice scenario may require browser assurance for the Student flow, integration assurance for evidence persistence, unit assurance for deterministic interpretation logic and responsive/accessibility checks for the critical screen states.

The Assurance Coverage Register should eventually reference these scenario IDs where that improves traceability. Raw test counts are not a substitute for scenario coverage.

# Later passes

After the happy-path/golden-journey pass, create two further scenario/state passes.

## Pass 2 — legitimate alternatives

Examples include:

- skip an optional starting check;
- deliberately choose different work from a recommendation;
- change course or topic;
- change short-term planning preference; and
- use a lower-tier alternative instead of upgrading.

Some of these are already represented by happy-path scenario IDs where Student choice is itself a normal user job. The pass should identify any remaining material branches rather than duplicate existing scenarios.

## Pass 3 — recovery / degraded / exception states

Examples include:

- authentication/provider failure;
- unsupported or ambiguous course;
- network/service failure;
- persistence failure while protecting Student work;
- insufficient/low evidence;
- marking failure or low-confidence marking;
- payment/entitlement failure;
- stale/unknown operational evidence;
- permission denial; and
- safe recovery after interrupted activity.

These should be mapped underneath the relevant scenario IDs wherever possible.

# Documentation impact

This catalogue is research/analysis only. It does not amend normative product, experience, commercial, trust or engineering authority and does not change any feature lifecycle state.

It should be used to reshape the journey programme around scenarios before screens. Existing research in PR #139 that predates the Student terminology decision should be normalised before the analysis is treated as complete. PR #138 remains the proposed normative vehicle for the journey-led review workflow and strengthened UX principles.

Future material product-behaviour decisions identified by a scenario review must be promoted into the relevant active authority before or with implementation. Future implementation must update technical documentation and assurance ownership as required by the AI Agent Constitution, Governed Implementation Workflow and Testing & Assurance Standard.

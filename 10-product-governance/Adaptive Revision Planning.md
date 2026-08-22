# Adaptive Revision Planning

**Status:** Draft authority candidate — v0.3 proposal pending governed merge  
**Owner:** Product  
**Purpose:** Define the governed product behaviour for Revision's adaptive revision planner and its relationship with REV, Home, Progress, Courses and learner choice.  
**Source decision:** FI-001 Intelligent Exam Calendar / Adaptive Revision Planner. Founder-approved product direction captured 2026-08-19. FI-020 learner-course programme context approved Ready 2026-08-22.  
**Authority relationship:** This is the specific product authority for adaptive planning. Global navigation mechanics are governed more specifically by `Global Learner Navigation.md`; this document remains authoritative for planner behaviour and the way REV explains and negotiates the plan.

## Product outcome

Revision should turn assessment dates, realistic available time, the learner's active saved courses and evolving learning evidence into a continuously adapting revision programme.

The learner should normally be able to answer:

- What matters most today?
- Why is Revision recommending it?
- What does the wider plan currently look like?
- What happens if I choose something different?
- How am I doing across my active courses?

The plan is Revision's current best forecast, not a fixed timetable or a debt ledger.

## Core operating principle

> **Revision recommends clearly. The student chooses freely. Revision listens, explains and recalculates from reality.**

The product should remove planning burden without removing learner agency.

## 1. Inputs

Planning may use, where known and relevant:

- the learner's active saved course set, including subject, qualification, specification and assessment scope;
- assessment date and relative importance;
- realistic normal weekday and weekend revision capacity;
- individual availability exceptions;
- specification coverage;
- understanding/mastery evidence;
- exam-readiness evidence;
- evidence confidence and consistency;
- recent revision activity and reliable completion evidence;
- meaningful self-reported external revision;
- the learner's deliberate short-term priorities; and
- competing needs across other active courses and assessments.

At learner-wide scope, the planner must not treat every published catalogue course as part of the learner's programme. FI-020 course membership is programme context, not learning evidence.

A learner must not be forced through a large diagnostic before the planner can become useful. Revision may begin with incomplete evidence, say when its picture is limited, and personalise progressively as stronger evidence is created.

## 2. Assessment setup

Assessment setup should stay simple.

- Public examinations should use known course/specification structure and scope where authoritative data exists.
- Mocks should normally support broad course, paper or component scope.
- Topic tests should begin with a small number of high-level course areas and progressively disclose deeper topic selection only when useful.

The learner should not have to select from an unnecessarily long syllabus list merely to add an assessment.

## 3. Availability

Revision asks for **realistically available revision time**, not aspirational study hours.

The default model should support:

- normal weekday capacity;
- normal weekend-day capacity; and
- date-specific exceptions where normal availability does not apply.

The default plan is a flexible workload for a day, not an exact clock-based timetable. Exact scheduling may be introduced later as an optional mode if evidence shows it is useful.

## 4. Deterministic and explainable planner intelligence

The underlying planner should use deterministic, testable product logic. A large language model must not be the authority that calculates the learner's priority order or daily schedule.

Exact weighting and thresholds are evidence and implementation questions, but the system may consider:

- assessment proximity and importance;
- specification coverage;
- evidence-backed weakness or strength;
- exam readiness;
- evidence confidence;
- remaining useful workload;
- realistic remaining capacity;
- recent activity and actual learner choices; and
- competing active-course priorities.

Internal weighting must not be presented as false-precision learner scores.

REV interprets and explains material decisions in natural language. It does not replace the planner calculation.

## 5. Recommendations must be understandable

A recommendation should have one or more human-understandable reasons. Appropriate reasons include:

- little or weak evidence for an important area;
- recent or repeated evidence of weakness;
- an assessment being closer or more important;
- known assessment weighting or broader mark opportunity;
- the learner already being relatively strong elsewhere;
- exam-style practice becoming more useful as an assessment approaches;
- a prerequisite gap blocking other progress; or
- an activity being a realistic improvement opportunity in the time available.

Revision may explain **mark opportunity** where this is grounded in known assessment structure. It must not promise that a task will produce a specific number of extra marks unless evidence and claims governance genuinely support that precision.

A learner-wide recommendation must resolve to an active saved course. Removing a course from the learner's programme prevents it from influencing new learner-wide recommendations without deleting historical evidence.

## 6. Today and the wider plan

Home owns the immediate question: **What should I do now?**

Home should include:

- REV's concise learner-wide recommendation or guidance; and
- a smaller **Today's plan** summary that shows the current day's planned workload and links to Plan.

Plan is a primary learner destination and shows the wider adaptive programme across the learner's active courses.

The Plan experience should default to a chronological model rather than a traditional calendar grid:

- **Today** — specific and actionable;
- **Next few days** — reasonably specific;
- **Later this week** — broader priorities;
- **Upcoming** — assessments, workload outlook and broader future priorities.

Precision should deliberately decline further into the future. The UI must communicate that the plan will adapt as revision happens, evidence changes and exams get closer.

A calendar-style representation may be offered later, but it must not redefine the product as a generic calendar or homework manager.

## 7. Recalculation

The planner should recalculate when meaningful information changes and perform a quiet daily check to decide whether the current plan still makes sense.

Meaningful triggers include:

- a course being added to or removed from the learner's active programme;
- new learning or assessment evidence;
- reliable completion or meaningful engagement evidence;
- assessment date, scope or importance changes;
- availability changes;
- meaningful self-reported external revision;
- material learner choices or negotiated priorities; and
- other state changes that can materially alter the priority calculation.

The planner should not churn after every minor interaction.

Recalculation and communication are separate. The engine may update silently while REV surfaces or explains only changes that are materially useful to the learner.

## 8. Missed work is information, not debt

Revision must not require learners to move missed recommendations to another day.

If planned work is not completed, that fact becomes new context. The planner decides again what matters most using the learner's latest state and remaining time.

There should be no punitive backlog, streak debt or failure state created merely because a previous recommendation was not followed.

## 9. Activity state and reconciliation

Where possible, Revision should infer useful activity state from reliable in-product evidence.

The product should distinguish:

1. recommendation offered;
2. activity started;
3. meaningfully engaged; and
4. completed.

A navigation click is not completion where the activity has a meaningful completion event.

At useful return points, REV may use lightweight reconciliation:

- if high-confidence evidence already exists, confirm it only where useful and ask whether anything else was done;
- if little evidence exists, ask a simple question about revision since the learner was last seen; and
- after a longer absence, ask about the period since the last visit rather than interrogating every missed day.

External self-report is useful planning context but is lower-confidence evidence and must not directly create mastery or readiness claims.

## 10. Learner choice and negotiated priorities

The learner can always choose different work from Revision's recommendation.

REV should also support natural conversations such as:

- "I want to focus more on Spanish this week.";
- "Can we do more essay practice for a few days?"; or
- "I want to work on this topic instead."

REV should listen, discuss and advise rather than blindly accept or refuse.

A learner preference may legitimately change short-term allocation and sequencing. For example, a heavier week in one active course may be reasonable if another is currently stronger and can be brought forward later.

Before applying a material preference, REV should explain relevant whole-programme consequences. The learner should remain able to see how the choice affects competing active courses, assessments, coverage and remaining capacity.

> **REV listens and adapts, but keeps the whole picture visible.**

A preference is planning context. It does not improve objective mastery or readiness by itself.

## 11. Insufficient capacity

If realistic remaining availability is no longer sufficient to cover all meaningful work before an assessment, Revision should enter a calm **priority mode**.

Insufficient time is a planning condition, not a learner failure.

The planner should shift from broad coverage to maximising the value of the remaining time. It should favour, where appropriate:

- important weak or under-covered areas;
- high-value gaps with realistic improvement potential;
- exam-readiness activity when the assessment is close;
- work supported by stronger evidence of need; and
- a sensible balance across competing assessments and active courses.

It should deprioritise already-strong material, low-value repetition and superficial coverage where those uses of time are less valuable.

Learner-facing language must remain calm, factual and action-oriented. Avoid shame, blame, artificial urgency, panic-inducing countdowns and generic labels such as `failed`, `bad`, `behind` or `at risk` merely because capacity is constrained.

A neutral Plan state such as **Prioritising** may be used if UX validation supports it.

Where a modest increase in availability would materially improve the outlook, REV may make a specific optional suggestion and explain what that time would unlock. If the learner cannot or does not want to add time, Revision continues to optimise the time the learner does have without judgement.

The intended learner outcome is:

> **I know what matters most now, I have a realistic plan for the time I have, and I can still make useful progress.**

## 12. REV experience

REV is a living, context-aware coaching presence, not a menu of AI functions and not primarily a peer navigation destination.

The ordinary access pattern is persistent **Ask REV** from the learner's current screen. Opening Ask REV should feel closer to **How can I help?** than to a dashboard or blank generic chatbot.

REV may use approved context including the learner's active saved courses, current plan, assessments, recent activity, progress evidence, confidence, current course/subject/topic, current activity or feedback and bounded conversational context.

It should use context quietly. It should not recite everything it knows about the learner.

Suggested prompts may be dynamic conversation starters, but natural text/conversation remains primary.

Opening Ask REV from Home, Plan, Progress, Courses or an activity should preserve the current context so the learner does not need to explain where they came from. Desktop should normally preserve the underlying screen while a substantial conversation panel opens; tablet/mobile should use an appropriate sheet or overlay. A full REV workspace may still be offered for longer conversations.

## 13. Proactive support and notifications

REV should be proactive primarily inside the product.

It may surface contextual guidance when there is a materially useful reason, including a meaningful priority change, assessment context, evidence change, capacity constraint or genuine improvement.

External push/email communication should be selective, useful and learner-controlled. It must not become attendance policing, streak pressure or guilt-based re-engagement.

A daily push such as `Your plan for today is ready` should not be assumed during first-run setup. Revision should first demonstrate planner value and then invite the learner to opt in.

Email should normally be lower-frequency and suited to broader-value communication such as a weekly outlook or important assessment summary.

## 14. Primary learner navigation

The governed learner-wide destinations are:

**Home | Plan | Progress | Courses**

The persistent global learner action is **Ask REV**.

On desktop, the four destinations and the prominent Ask REV action are exposed through the governed left learner rail. When Courses is active, the learner's saved courses appear directly beneath it and only the selected course expands into its applicable focused sections.

On tablet/mobile, there is **no persistent multi-item bottom navigation bar**. The learner uses the governed top-left menu/drawer for Home, Plan, Progress and Courses, while the persistent bottom **Ask REV** dock remains the only persistent bottom learner action.

The REV treatment must remain accessible, calm and purposeful rather than decorative AI theatre.

Home remains the default signed-in destination.

Profile, settings, subscription/account utilities, help and privacy remain secondary to the learner-wide jobs and follow the progressive-disclosure account model governed by `Global Learner Navigation.md`.

## 15. MVP boundary

The first implementation must prove the core adaptive loop rather than every possible planning feature.

### Required for MVP

- add and edit assessments with date, type and simple scope;
- capture realistic normal availability and date exceptions;
- deterministic cross-course priority calculation across the learner's active programme;
- today's recommendation and today's plan on Home;
- dedicated Plan page with adaptive chronological view;
- event-triggered replanning plus quiet daily reconciliation;
- clear recommendation reason codes / explanations;
- learner ability to choose different work;
- lightweight REV negotiation of short-term priorities;
- recommendation-to-activity linking and reliable activity-state events;
- lightweight external revision reconciliation;
- insufficient-capacity / priority-mode behaviour;
- persistent context-aware Ask REV entry and planning explanation;
- desktop left-rail navigation plus tablet/mobile menu/drawer and persistent Ask REV dock;
- minimum viable product analytics and Founder/Admin health signals; and
- accessible loading, empty, unavailable, low-evidence and error states.

FI-020 learner-course membership is foundational programme context for these planner behaviours and must be used once that feature is implemented; the planner must not fall back to treating the complete published catalogue as the learner's programme.

### Deliberately not an MVP dependency

- exact active-study-time inference;
- generic calendar integration;
- exact clock scheduling;
- automatic ingestion of every official exam date;
- sophisticated long-term grade forecasting;
- high-frequency push programmes;
- detailed manual revision logging; or
- using an LLM to calculate schedules.

These may be developed later if evidence supports them.

## 16. Commercial packaging recommendation

Packaging must preserve a genuinely useful Free experience while giving paid tiers materially stronger value. Exact prices, final plan names and entitlement mechanics remain governed through commercial/subscription authority.

Learner course membership itself is foundational product truth and is **not** tier-gated by FI-020.

### Free — prove the core value

Recommended Free capability:

- manage supported active courses;
- add assessments and basic availability;
- receive a useful today recommendation;
- basic adaptive planning;
- view today's plan and a limited wider-plan outlook;
- basic evidence-led prioritisation and replanning;
- lightweight REV explanation of why something is recommended.

Free must be capable of helping a learner make real revision progress. It must not be a deliberately broken demo.

### Level 1 — actively manage the revision programme

Recommended Level 1 value:

- full multi-course / multi-assessment adaptive planning;
- full week and wider-plan visibility;
- richer evidence-led prioritisation;
- full automatic replanning;
- stronger planning explanations and confidence/readiness integration;
- useful planner notifications/preferences; and
- greater scale/depth than Free.

### Level 2 — fullest intelligent coaching experience

Recommended Level 2 value:

- the fullest REV conversational coaching around the plan;
- deeper negotiated priority conversations;
- advanced personalised explanation and coaching;
- premium AI-intensive support and advanced contextual guidance; and
- other premium tutor capabilities defined with FI-003 REV and FI-002 entitlements.

Do not create arbitrary limits solely to frustrate Free. Final entitlement boundaries should be decided with FI-002 so planner packaging and the wider subscription model remain coherent.

## 17. Measurement contract

Primary hypothesis:

> When Revision turns exams, available time and learning evidence into a continuously adapting plan while keeping today's action simple, students spend less effort deciding what to revise and more of their useful revision effort on work likely to improve readiness.

### Adoption

Measure, with denominators:

- eligible learners who add an assessment;
- learners who add realistic availability;
- learners who receive an actionable plan; and
- learners who open Plan after receiving guidance.

### Useful engagement

Measure:

- recommendation offered → started → meaningfully engaged → completed;
- recommendation acceptance versus deliberate alternative choice;
- plan-driven starts;
- learner-negotiated priority changes;
- useful re-entry after inactivity; and
- frequency/reason for replanning.

Raw plan generation is not a success metric by itself.

### Student value / outcome

Assess:

- whether revision increasingly reaches evidence-backed priority areas;
- change in coverage/mastery/readiness where the evidence model supports it;
- recovery after disrupted revision or inactivity;
- improvement in confidence calibration over time; and
- whether constrained-time learners continue to complete useful high-priority work.

Time spent alone is not learning evidence.

### Guardrails

Monitor:

- recommendations/plans referencing courses outside the learner's active set;
- impossible or pathological plans;
- repeated plan churn;
- false completion;
- unexplained recommendation changes;
- recommendation concentration that starves another active course without an understandable reason;
- notification opt-out / complaint patterns;
- excessive AI cost;
- accessibility failures; and
- learner-facing claims stronger than their evidence.

## 18. Founder/Admin assurance

Admin should answer:

- Is the planner operational and generating plans successfully?
- How many eligible learners have active plans?
- Are today's plans actionable?
- Are recommendations restricted to each learner's active course set?
- Are recommendations being started and completed?
- How often do learners deliberately choose something else?
- Why is the engine replanning?
- How often is priority mode triggered?
- Are there overloaded/impossible plan states?
- Are recommendations concentrated unexpectedly by course/subject/topic?
- Are there scheduler/recalculation failures?
- Are plan engagement and learning evidence moving together or diverging?
- What is planner/REV cost to serve?

Founder views should favour trends, denominators and actionable exceptions rather than vanity totals.

Operational failures and materially bad planning states should be capable of surfacing through the wider Assurance/System Health model with appropriate severity.

## 19. Trust, privacy, accessibility and safety

Implementation must comply with the existing evidence, claims, privacy and safeguarding authorities.

Specific requirements include:

- treat learner-course membership as private learner programme context and enforce authenticated ownership;
- collect scheduling and behaviour data only where it creates clear product value;
- make communication preferences controllable;
- treat REV conversations as private student data;
- never convert course membership, activity time or self-report directly into mastery/readiness proof;
- ensure claim strength matches evidence strength;
- avoid manipulative urgency, shame and dark patterns;
- keep the full planner and navigation operable by keyboard and assistive technology;
- ensure the persistent Ask REV action has a clear accessible name and usable touch target at every breakpoint;
- make chronology, priority and status understandable without relying only on colour;
- support reduced-motion preferences where REV presence or navigation uses animation;
- keep plan changes understandable for learners with cognitive or attention-related accessibility needs; and
- provide usable fallback behaviour when planner or AI services are unavailable.

Detailed legal, age-related notification/consent and data-retention requirements must be verified against current authoritative UK guidance before production reliance, as required by the Privacy and Student Data Principles.

## 20. Implementation boundary

This authority defines what the product should do. It does not itself prove that the current runtime implements it.

Before implementation begins, the Governed Implementation Workflow and AI Agent Constitution require the implementation team to prove the canonical learner route, runtime and entry point and to classify any duplicate/legacy surfaces.

Implementation evidence must then be recorded in code and relevant technical documentation without redefining this product authority.

# FI-001 — Adaptive Revision Planner Product Definition

**Status:** Exploring — Founder decisions captured; not yet promoted to normative product authority  
**Feature:** FI-001 Intelligent Exam Calendar / Adaptive Revision Planner  
**Owner:** Product  
**Captured:** 2026-08-19  
**Purpose:** Maintain the current agreed product definition while FI-001 is being worked through before promotion and implementation.

> This record captures approved product decisions but does not itself override normative authority. Once the product definition is complete, approved behaviour must be promoted into the appropriate product, experience, trust and commercial authorities before implementation.

## Product intent

Revision should turn exam dates, realistic available time and evolving learning evidence into a continuously adapting revision plan. Its primary job is to remove the planning burden from the student and answer what is most useful to do now while preserving student choice.

The plan is not a fixed timetable. It is Revision's current best view of how the learner can use the time remaining, and it should update as reality changes.

## Approved decisions

### D1 — Adaptive plan underneath; simple daily experience

Use a hybrid model: a continuously adaptive plan exists underneath the product, while the primary learner experience remains a simple answer to what should be done today. Week, future and wider-plan detail is progressively disclosed.

### D2 — Realistic availability, not aspirational hours

Capture a realistic normal weekday revision capacity, a realistic normal weekend-day capacity, and individual-day exceptions where needed. Availability is an input to guidance, not a generic calendar-management feature.

### D3 — Assessment scope must stay simple

Collect assessment type, date and scope without requiring students to manage long topic lists. Public-exam scope should be inferred/pre-populated where authoritative course structure supports it. Mocks should offer broad course/paper choices. Topic tests should begin with a small number of high-level course areas and disclose deeper detail only when needed.

### D4 — Flexible daily workload by default

The default plan is a flexible workload for the day rather than exact clock slots. Exact scheduling may be offered as an optional mode later for learners who want it.

### D5 — Missed work is new information, not debt

Revision never shames a learner for missing planned work. Life changes and students may not have enough time to cover everything. The system should recalculate from current reality and prioritise the work most likely to improve the learner's position with the time remaining.

If the available time is genuinely insufficient, Revision should say so calmly and prioritise rather than present an impossible plan as achievable. Optional extra-time suggestions may be made where a modest increase in availability would materially improve the outlook, but they must not become pressure or punishment.

### D6 — Revision recommends; the student chooses; Revision recalculates

The student does not need a `move to another day` workflow. Revision recommends what it thinks is most useful, but the learner remains free to choose any subject/topic/activity. What the learner actually does becomes input to the next recalculation.

The overall plan is therefore a living prioritisation model rather than a set of tasks the learner must manually reschedule.

### D7 — Start useful with incomplete evidence

Do not require a diagnostic before creating value. Initial planning may use exam dates, assessment scope, realistic availability, initial confidence and other light context. Revision should communicate when its evidence is limited and become progressively more personalised as real learning evidence accumulates.

### D8 — Infer completion wherever reliable

Most recommended activities should deep-link directly into the relevant Revision activity. The product should distinguish recommendation offered, activity started, meaningful engagement and reliable completion. Where the product has a trustworthy completion state, it should record completion automatically rather than make the learner maintain a to-do list.

External/off-platform revision can be captured through lightweight self-report when useful.

### D9 — Lightweight reconciliation, only when useful

REV may ask a short return question to reconcile recent activity, but should infer first and ask only when the answer materially improves guidance. If Revision already has high-confidence activity evidence, ask only whether anything else was done. If evidence is weak, ask a simple question about revision since the learner was last seen. Do not interrogate every missed day or create a manual revision diary.

### D10 — Show the wider plan with declining future precision

Students should be able to see the wider plan, but it must be presented as Revision's current forecast rather than a fixed commitment. Today can be specific, the next few days reasonably specific, later periods broader, and longer-term future planning deliberately less precise.

### D11 — Home owns today; Plan is a primary global destination

Home owns the immediate daily experience and should show REV's primary guidance plus a smaller `Today's plan` summary card linking to the full Plan experience.

The intended primary learner navigation is:

1. Home
2. Plan
3. REV
4. Progress
5. Subjects

Account, profile, settings, help, subject management and similar utilities belong in the secondary/burger menu rather than primary navigation.

This is an intentional proposed change to the current Information Architecture authority, which presently defines Home / Subjects / Progress / REV. The normative IA must be updated as part of FI-001 promotion before implementation.

### D12 — Plan defaults to an adaptive chronological view

The primary Plan view should not be defined by a traditional fixed calendar grid. It should foreground the adaptive chronological plan: today, near-term work, this week and broader upcoming priorities. A calendar-style view may be explored as an optional representation later.

### D13 — REV is the visually prominent centre action on mobile

On mobile, primary navigation should be persistently anchored at the bottom and use five destinations in this order:

**Home | Plan | REV | Progress | Subjects**

REV should occupy the centre position and receive distinctive visual prominence, for example a modest raised treatment and differentiated visual emphasis. The interaction pattern may take inspiration from established raised-centre mobile navigation, but should use Revision's own visual system rather than copying another product's styling or colours.

The treatment must remain accessible, calm and purposeful. REV's prominence exists because it is a core differentiating capability, not as decorative AI theatre.

Home remains the default signed-in destination. The prominent REV control opens the dedicated REV coaching space rather than acting as a generic create/add button.

### D14 — REV opens as a living conversational coach

Tapping the central REV action opens the dedicated REV page with the learner's current context already available. It must not open as a blank generic chatbot and must not lead with a dashboard of static links or information cards.

The primary impression should be that REV is present, aware and ready to respond. The page should feel closer to an active `How can I help?` conversation than to a menu.

REV may use current context such as:

- today's recommended work and current adaptive plan;
- upcoming assessments and time remaining;
- recent revision activity and reliable completion evidence;
- current subject/course/topic context where the learner arrived from one;
- coverage, understanding/mastery and exam-readiness evidence;
- recent mistakes or weak areas where relevant;
- learner confidence and other approved learner context; and
- recent bounded conversational context where useful.

REV should use that context to shape a concise opening interaction. For example, it may acknowledge what is happening now, ask what the learner needs, or offer one or two contextually relevant prompts. It should not dump the learner's data back at them or present a long list of capabilities.

The interaction should support natural requests such as:

- help me understand this;
- what should I do next?;
- why is this in my plan?;
- I'm stuck;
- quiz me on this;
- how am I doing?; or
- I don't have as much time as I thought.

Suggested prompts may be used as lightweight conversation starters, but the text input/conversation remains primary. Prompts should be dynamic and context-sensitive rather than a permanent menu of canned actions.

REV should feel like the same continuing coach wherever it is used in the product. Moving from Home, Plan, Progress, Subjects or an activity into the REV page should preserve relevant context rather than forcing the learner to explain where they came from.

### D15 — Proactive support must be useful, restrained and learner-controlled

REV should be proactive primarily inside the product. When the learner opens Revision, REV may surface a concise contextual message when there is a materially useful reason, such as a changed priority, a newly relevant exam context, a meaningful improvement, or a plan adjustment.

External contact such as push notifications or email should be selective and event-driven rather than used as attendance policing or engagement pressure. Appropriate reasons may include:

- today's plan is ready;
- a material change in evidence has changed priorities;
- an assessment is approaching and the current plan has meaningfully changed;
- the learner's available time is no longer sufficient to cover everything and a prioritisation update is useful;
- a modest optional increase in available study time would materially improve the plan; or
- the learner has been away long enough that a gentle re-entry prompt is likely to help.

REV must not use guilt, streak pressure, shaming or artificial urgency. It should not send messages such as `you are falling behind`, `you missed yesterday`, `don't break your streak`, or countdown-style pressure that treats non-use as failure.

Most algorithmic recalculation should remain silent. A notification is justified only when communicating the change is likely to help the learner act or understand what matters.

Students should have meaningful control over optional proactive communications. A simple preference model may later distinguish levels such as important-only, helpful reminders and off, subject to final UX and legal review.

A default daily push such as `Your plan for today is ready` should not be assumed during first-run setup. Revision should first demonstrate planner value inside the product, then invite the learner to opt in to a daily or similar reminder if they want it.

Email should be lower-frequency and better suited to broader-value communication such as a weekly outlook or meaningful upcoming-assessment summary rather than daily nagging.

REV's proactive presence must remain consistent with safeguarding and privacy authority: it may be attentive and responsive, but it must not imply emotional dependency, say that it `missed` the learner, or position returning to REV as a substitute for human emotional support.

### D16 — Deterministic, explainable planner intelligence

The planner and replanning engine should use deterministic, testable product logic rather than rely on a large language model to generate the learner's schedule or priority order.

The engine may consider factors such as:

- exam or assessment proximity;
- assessment scope and relative importance;
- current specification coverage;
- understanding/mastery evidence;
- exam-readiness evidence;
- evidence confidence and consistency;
- remaining workload;
- realistic available revision time;
- recent revision activity and actual learner choices; and
- competing priorities across other subjects.

Exact weighting, thresholds and heuristics are implementation/evidence questions and should be iterated through testing and observed outcomes. They should not be presented to the learner as false-precision scores.

REV's role is to interpret and explain material planning decisions in natural language, not to own the deterministic scheduling calculation. This separation is required for consistency, cost control, testability, observability and trust.

A learner should be able to understand the important reason behind a recommendation without seeing internal mathematical detail. For example, REV may explain that one subject has moved forward because its assessment is closer and the learner currently has weaker evidence there.

## Confirmed navigation responsibility model

- **Home** — answers `What matters now?` and `What should I do today?`. It is the default signed-in destination, contains REV's concise learner-wide recommendation, and shows a smaller `Today's plan` summary linking to Plan. It must remain focused rather than becoming a dense dashboard.
- **Plan** — answers `What does my current revision programme look like?`. It shows the living adaptive plan across today, the next few days, this week and upcoming assessments, with declining precision further into the future. It supports availability/exam context and explains material changes without becoming a fixed task manager.
- **REV** — answers `How can you help me right now?`. It opens the context-aware conversational coaching space described in D14 and supports explanation, guidance, planning discussion and learning help.
- **Progress** — answers `How am I doing, and what needs attention?`. It presents evidence-backed coverage, understanding/mastery, exam readiness and relevant subjective confidence signals, with clear routes into useful next actions rather than dashboard-only analytics.
- **Subjects** — answers `What do I want to work on?`. It provides learner-led browsing across subjects, specifications, papers/components, topics and activities regardless of the current recommendation, preserving student agency.
- **Secondary menu** — contains profile, account, settings, help, subject management, privacy and other utilities that do not represent primary learner jobs.

## Related future capability

FI-005 Study-Time Measurement / Active Engagement Telemetry is deliberately not an FI-001 MVP dependency. The planner should capture reliable activity states in MVP, while more sophisticated estimated active-time inference is assessed separately.

## Documentation impact before implementation

Once the remaining product definition is agreed, promotion should update at minimum:

- `10-product-governance/Scope and Capability Taxonomy.md`;
- `10-product-governance/Product System Model.md`;
- `10-product-governance/Core User Journeys.md`;
- `10-product-governance/Information Architecture.md`;
- applicable `20-brand-and-experience/` authority for mobile navigation, REV prominence and non-shaming planner language;
- applicable privacy/trust authority for learner scheduling and behavioural data;
- commercial packaging authority for Free / Level 1 / Level 2 entitlements;
- KPI/Admin measurement definition;
- technical architecture and implementation documentation; and
- canonical learner route/runtime verification under the Governed Implementation Workflow.

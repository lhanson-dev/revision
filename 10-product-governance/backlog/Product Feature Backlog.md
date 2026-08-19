# Product Feature Backlog

**Document type:** register  
**Authority:** non-authoritative product-management backlog  
**Status:** active register  
**Owner:** Product  
**Purpose:** Canonical inventory of candidate product features, their current product-management status, and the evidence needed before promotion into approved product authority.

## Status model

Use the following lifecycle consistently:

- **Idea** — captured but not yet assessed in depth.
- **Exploring** — value, evidence, feasibility, dependencies or risks are being investigated.
- **Candidate** — strong enough to be considered for prioritisation and possible promotion into approved product scope.
- **Approved** — Founder-approved product direction; the relevant normative product authority must be updated before implementation proceeds as governed scope.
- **Planned** — approved and sequenced for implementation.
- **Building** — implementation is actively in progress on a governed branch/PR.
- **Live** — implementation evidence confirms the feature is available on the canonical product runtime.
- **Parked** — potentially useful, but not currently worth pursuing.
- **Rejected** — deliberately not pursuing; retain the rationale.
- **Retired** — previously live/approved but deliberately withdrawn or superseded.

A status in this register must not be used to bypass repository authority. In particular, **Idea, Exploring and Candidate are not approved scope**, and **Live must not be asserted without implementation evidence**.

## Prioritisation dimensions

When an item is assessed, consider:

- student problem severity;
- strategic fit with Revision's core product loop;
- likely student value and educational value;
- evidence/learning value generated for personalisation;
- differentiation and defensibility;
- adoption, engagement and retention potential;
- commercial value where relevant;
- implementation complexity;
- operating, AI/token and content cost;
- dependencies and sequencing;
- accessibility, safety, privacy and trust risks; and
- opportunity cost versus stronger alternatives.

---

## FI-001 — Intelligent Exam Calendar / Adaptive Revision Planner

**Status:** Approved  
**Captured:** 2026-08-19  
**Capability fit:** Guide; Progress and Readiness  
**Approved authority:** `10-product-governance/Adaptive Revision Planning.md`  
**Initial assessment:** Founder-approved product direction; high strategic value; promoted into normative product authority; runtime implementation has not yet started

### Student problem

Students often know they need to revise but struggle to turn multiple subjects, topics, deadlines and limited available time into a realistic plan. Static revision timetables quickly become obsolete when work is missed, progress changes or an exam gets close.

### Proposed capability

Allow a student to record upcoming assessments for each subject, including class or mid-term tests, mocks and final examinations, together with the amount of study time they can realistically commit each day or week.

Revision would create a calm, realistic study plan that determines what subjects and topics to work on and when.

The plan should use relevant learning evidence rather than simply divide available time evenly. Inputs may include:

- exam/assessment date;
- assessment importance;
- available study time;
- specification/syllabus coverage;
- current topic mastery and weaknesses;
- previous performance and evidence quality;
- remaining workload; and
- recent study activity.

### Adaptive behaviour

The differentiating behaviour is continuous replanning rather than generation of a one-off timetable.

If a student misses planned work, Revision should recalculate the remaining schedule without creating unnecessary guilt or presenting the missed session as failure.

If there is no longer enough available time to cover everything before an assessment, Revision should explicitly prioritise the work most likely to improve readiness using the student's progress evidence, rather than pretending the original plan remains achievable.

As new evidence is created through study, quizzes, exam questions or other activity, the plan should be capable of changing priorities accordingly.

### REV role

REV should be able to explain important planning decisions in simple language, for example why a weaker high-value topic has been brought forward or why already-strong material has been deprioritised.

Desired loop:

`exam dates → plan → study → learning evidence → updated mastery/readiness → reprioritisation → adaptive plan`

### Guardrails

The feature should not become a generic calendar or homework-management system.

It should avoid:

- filling every available hour simply because time exists;
- punitive red-state or streak mechanics for missed study;
- creating guilt when plans change;
- false precision about likely grades or outcomes;
- optimising solely for syllabus completion when evidence indicates a different priority; and
- presenting an impossible plan as achievable when available time is insufficient.

The experience should remain calm, supportive, realistic and useful under pressure.

### Dependencies / questions to assess

- reliable mapping between subjects, topics/specification coverage and assessment scope;
- student evidence/mastery model of sufficient quality to drive prioritisation;
- representation of assessment importance and scope;
- scheduling/replanning algorithm and constraints;
- interaction model between the planner and REV;
- notification/reminder strategy without becoming noisy or anxiety-inducing;
- accessibility of calendar and timetable views;
- treatment of incomplete or low-confidence learning evidence; and
- whether official exam-board dates can later be pre-populated while still supporting school-specific tests and mocks.

### Promotion impact

FI-001 has been promoted into `10-product-governance/Adaptive Revision Planning.md`. The approved authority also requires alignment of the wider product model, information architecture, experience, trust, measurement and technical implementation documentation as implementation proceeds.

Before runtime implementation begins, the Governed Implementation Workflow must prove the canonical learner route/runtime and the implementation must remain consistent with the approved authority.

---

## FI-002 — Subscription Plans / Feature Entitlements and Upgrade Journey

**Status:** Idea  
**Captured:** 2026-08-19  
**Capability fit:** Commercial capability evolution; cross-cutting product entitlement layer  
**Authority context:** Free, paid and premium tiers are already anticipated in `Scope and Capability Taxonomy.md`; exact entitlements, pricing and boundaries remain deliberately undefined.  
**Initial assessment:** High commercial importance; strategically necessary for monetisation; must preserve strong free-product value

### User and business problem

Revision needs a sustainable paid model without making the free experience feel broken, misleading or unusable.

Students should be able to start using Revision for free, understand the value of the product and make meaningful progress before being asked to pay. At the same time, paid plans need to provide clear, desirable additional value that is visible enough to motivate upgrading.

### Proposed capability

Introduce a subscription and entitlement system that understands the current user's plan and consistently determines which features, limits and benefits they can use.

The product should support multiple plan levels rather than a single free/paid switch, with exact plan names, prices and entitlements governed separately.

The app should:

- know the authenticated user's current subscription plan and entitlement state;
- apply that entitlement state consistently across all relevant surfaces and APIs;
- show the broader Revision product and its premium capabilities to free users rather than hiding the existence of paid features;
- clearly distinguish available features from features requiring an upgrade;
- when a user intentionally tries to use a locked capability, explain the benefit and present an appropriate upgrade journey;
- unlock the correct capabilities promptly after a successful plan change;
- handle downgrade, cancellation, expiry, failed payment and entitlement refresh states safely; and
- give the user a clear place to understand their current plan and available upgrades.

### Product principle

**Free must feel genuinely useful. Paid must feel materially better.**

The free product should be capable of proving Revision's core value and helping a student make real revision progress. Upgrade pressure should come from seeing meaningful additional benefits, not from deliberately crippling basic use after acquisition.

### Premium discovery / locked-feature behaviour

Premium features should remain discoverable in the interface where that improves understanding of the product.

A locked feature should not masquerade as available. Its state should be understandable before or at the point of interaction.

When a free or lower-tier user reaches a locked feature, the upgrade experience should explain:

- what the capability does;
- why it may be useful to this student;
- which plan unlocks it; and
- a simple route to compare or upgrade plans.

Upgrade prompts should be contextual rather than constant. Revision should avoid filling the learning experience with repeated paywalls, banners or manipulative urgency.

### Entitlement model

The technical design should favour capability/entitlement checks over scattered hard-coded plan-name checks.

Conceptually:

`user → subscription state → plan → entitlements/limits → product capability access`

This should allow plan packaging to change later without requiring entitlement logic to be rewritten throughout the application.

### Guardrails

The feature should avoid:

- making the free tier a non-functional demo;
- unexpectedly blocking an activity the student reasonably believed was free;
- hiding all premium functionality so students cannot understand upgrade value;
- deceptive countdowns, false scarcity or manipulative upgrade mechanics;
- entitlement enforcement only in the UI while protected server/API actions remain callable;
- tying educational truth, scores or readiness claims to payment status; and
- making cancellation or plan management deliberately difficult.

### Dependencies / questions to assess

- approved pricing and packaging strategy;
- exact free/paid/premium entitlement matrix;
- payment/subscription provider and billing architecture;
- account model, including who purchases when a parent pays for a student's plan;
- upgrade/downgrade/cancellation lifecycle;
- trials, referral-earned access and promotional entitlement handling;
- server-side entitlement enforcement and caching strategy;
- analytics for upgrade exposure, intent, conversion and churn;
- treatment of AI/token-intensive features and usage allowances; and
- consumer/subscription legal requirements applicable to the chosen commercial model.

### Promotion impact

If approved, this requires dedicated product/commercial authority defining pricing, plans and entitlements rather than embedding those rules only in implementation.

Review and update at minimum:

- `10-product-governance/Scope and Capability Taxonomy.md`;
- new product-facing plan/entitlement authority under `10-product-governance/`;
- relevant `60-business-operations/` commercial authority;
- `10-product-governance/Core User Journeys.md` for upgrade and plan-management journeys;
- relevant experience authority for paywall/locked-feature behaviour;
- privacy/security requirements for billing/account data; and
- technical architecture and implementation documentation.

---

## FI-003 — Full REV Intelligent AI Tutor

**Status:** Candidate  
**Captured:** 2026-08-19  
**Capability fit:** Understand; Guide; Learn; Practise and Test; Prepare for the Exam; Progress and Readiness  
**Authority context:** REV / the AI tutor is already approved as a core part of Revision's product system and first serious product version. This backlog item captures the fuller product capability required to realise that approved direction rather than proposing whether an AI tutor should exist.  
**Initial assessment:** Very high strategic value; central differentiator; likely major retention and premium-value driver; implementation must be cost-controlled and evidence-grounded

### Student problem

Students often need help at the exact point they become confused, stuck, unsure what to revise next or uncertain about what an exam question is asking. Static content and generic chatbots do not have enough context about the learner to provide consistently useful guidance.

Revision's opportunity is for REV to behave as an intelligent tutor that understands the student's subjects, specification, progress, strengths, weaknesses, recent work and upcoming exam context, then uses that context throughout the product.

### Proposed capability

Deliver REV as a persistent, context-aware AI tutor integrated into Revision rather than a standalone generic chat window.

REV should be able to support both direct student questions and proactive guidance.

Examples include:

- explaining a concept when the student says they do not understand it;
- answering questions in the context of the correct qualification, exam board and specification;
- helping a student understand why an answer lost marks;
- giving hints or scaffolding without immediately supplying the answer when learning would benefit from retrieval or reasoning;
- recommending what to revise next using the student's wider evidence picture;
- recognising patterns of weakness across activity rather than reacting only to the latest result;
- connecting progress, upcoming exams and available study time to useful guidance;
- helping with exam technique and answer structure;
- checking understanding conversationally;
- moving naturally between explanation, questioning, practice and recommendation; and
- remembering appropriate learning context over time so the student does not need to repeatedly explain their situation.

### REV should feel embedded in Revision

REV should not behave like an external chatbot bolted onto the app.

It should be capable of understanding the surface and activity the student is currently using, for example a topic, quiz result, exam question, revision plan or progress view, and respond using that context where appropriate.

The experience should make sophisticated intelligence feel simple to the student.

### Proactive intelligence

REV should not wait for every interaction to start with a student prompt.

Where the evidence is strong enough, REV should be able to surface concise, useful interventions such as:

- a recommended next task;
- a warning that an important area remains under-covered;
- recognition that a student has improved enough to shift priority elsewhere;
- a suggestion to move from learning content into exam practice; or
- an adjustment to the student's revision plan because time or evidence has changed.

Proactivity should be useful and restrained, not noisy.

### Memory and learner context

REV should use structured learner context wherever possible rather than relying on unbounded conversational history.

Relevant context may include:

- enrolled subjects, qualification and exam board;
- specification/topic structure;
- coverage state;
- mastery/understanding evidence;
- exam-readiness evidence;
- recent assessments and mistakes;
- identified strengths and weaknesses;
- upcoming assessments and revision-plan priorities;
- student preferences that materially improve learning support; and
- recent conversational context where needed.

This context should be permissioned, explainable where appropriate and governed by Revision's privacy rules.

### Cost-efficient AI architecture principle

A full REV experience should not imply sending the student's entire history and content corpus to a large model on every interaction.

Implementation should minimise AI cost through approaches such as:

- deterministic product logic for tasks that do not need generative reasoning;
- structured learner-state summaries;
- retrieval of only the relevant specification/content/evidence context;
- routing different tasks to appropriately capable/cost-effective models;
- bounded conversation summaries rather than unlimited raw transcript replay;
- caching/reuse where safe;
- precomputed recommendations where appropriate; and
- product-level usage controls that preserve usefulness rather than arbitrary conversation interruption.

The exact architecture remains an engineering decision, but cost efficiency is a product requirement because unrestricted token consumption would undermine the viability of the tutor.

### Conversational modes

REV should ultimately support natural typed conversation and may support spoken conversation where it creates genuine student value and is commercially/technically viable.

Voice should be considered an interaction mode for the same tutor and learner model, not a separate intelligence.

### Guardrails

REV should avoid:

- pretending to know facts about the student that are not supported by data;
- inventing specification or subject content when an authoritative source should be used;
- giving false certainty about grades or exam outcomes;
- completing assessed work in ways that undermine learning or applicable educational integrity rules;
- producing so much explanation that the student becomes more overwhelmed;
- creating dependency by discouraging independent thinking;
- treating one poor result as proof the student is weak overall;
- unsafe or inappropriate behaviour for young users; and
- exposing private learner information unnecessarily to AI providers or other users.

### Dependencies / questions to assess

- structured learner/evidence model maturity;
- authoritative curriculum/content retrieval layer;
- tutor orchestration and model-routing architecture;
- prompt/policy/version governance;
- conversation and learner-memory design;
- safety, safeguarding and privacy controls for users aged 14–18;
- evaluation framework for answer quality, educational usefulness and hallucination risk;
- token/cost budgets and paid-tier allowances;
- latency expectations;
- voice architecture if pursued;
- observability and auditability of AI interactions; and
- fallback behaviour when REV lacks sufficient evidence or confidence.

### Relationship to FI-001 and FI-002

REV is likely to be the intelligence that explains and interacts with the adaptive revision planner in FI-001.

FI-002 may use differentiated REV allowances or premium REV capabilities as part of plan packaging, but the free tier should still expose enough REV value to demonstrate why the intelligent tutor matters. Packaging must not redefine the educational behaviour or truthfulness of REV.

### Promotion / implementation impact

Because the AI tutor already exists in approved product direction, this item should be used to define and sequence the **full implementation** rather than to re-approve the existence of REV.

Before material implementation, review/update at minimum:

- `10-product-governance/Product System Model.md` where fuller behavioural authority is required;
- `10-product-governance/Core User Journeys.md`;
- relevant REV/experience authority under `20-brand-and-experience/`;
- AI, privacy, safeguarding, evidence and educational-integrity authority;
- target system architecture and dedicated REV technical design documentation; and
- assurance/evaluation standards for AI tutoring quality.

---

## FI-004 — Student Confidence Tracking / Confidence Calibration

**Status:** Idea  
**Captured:** 2026-08-19  
**Capability fit:** Progress and Readiness; Guide  
**Initial assessment:** High measurement and student-value potential; lightweight to capture; must remain distinct from objective readiness

### Student problem

Students do not experience revision only as scores and coverage. They also experience uncertainty about whether they are prepared, and that feeling can materially affect how manageable revision feels.

A student may be objectively improving while still feeling unprepared, or may feel confident despite weak evidence. Revision currently needs a structured way to understand this subjective dimension without confusing it with learning evidence.

### Proposed capability

Capture a student's self-reported confidence about a subject assessment or exam when the relevant subject/assessment context is first established, then invite them to refresh that confidence at sensible intervals or meaningful milestones.

The interaction should be extremely lightweight and use stable wording and a consistent scale so change over time is interpretable.

The system should retain confidence observations as time-series data attached to the relevant subject / assessment context.

### Intended value

Confidence data should support:

- helping the student see how their feeling changes through revision;
- allowing REV to give justified reassurance where evidence is stronger than the student's confidence suggests;
- identifying possible overconfidence where the student's feeling is materially stronger than available learning/readiness evidence;
- understanding whether Revision users become more confident as they prepare;
- adding a subjective student-outcome measure alongside behavioural and learning metrics; and
- creating a potentially valuable product-impact measure for external communication when evidence and claims governance support it.

### Confidence is not readiness

Self-reported confidence must not be presented as mastery, readiness or predicted attainment.

Revision should explicitly preserve the distinction between:

- **how prepared I feel**; and
- **what my revision evidence currently suggests**.

The relationship between those signals may itself be useful.

### MVP hypothesis

A useful MVP could:

1. ask for an initial confidence rating when a student establishes a relevant subject/exam context;
2. persist the response with timestamp and context;
3. ask for a refresh after meaningful elapsed time or revision milestones rather than repeatedly interrupting the learner;
4. show the student simple confidence movement over time where it is useful; and
5. make baseline/latest/change and response-rate measures available for product analytics and Founder/Admin reporting.

Exact scale, prompting cadence and learner-facing visualisation require product design before implementation.

### Measurement relationship

This feature should implement the confidence measures defined in `60-business-operations/Product KPI Framework.md`, including analysis of confidence change and eventual calibration against evidence-backed readiness.

### Guardrails

The feature should avoid:

- implying that confidence proves exam preparedness;
- pressuring a student to report higher confidence;
- asking so often that the prompt becomes noise;
- treating declining confidence as failure;
- creating anxiety through excessive comparison between feeling and performance;
- diagnosing emotional or mental-health conditions; and
- making marketing claims from weak, biased or non-representative samples.

### Dependencies / questions to assess

- stable student-facing question and response scale;
- when baseline is captured: subject enrolment, assessment creation, or both;
- appropriate refresh triggers/cadence;
- relationship to the adaptive revision planner and REV;
- minimum evidence needed before showing confidence/readiness calibration to a student;
- analytics event/data model;
- privacy and safeguarding treatment of subjective learner data; and
- claims-evidence threshold before confidence improvement is used externally.

### Promotion impact

If approved, review and update at minimum:

- `10-product-governance/Product System Model.md`;
- `10-product-governance/Core User Journeys.md` where confidence capture becomes part of setup/progress journeys;
- applicable UX, privacy, safeguarding and claims authority;
- `60-business-operations/Product KPI Framework.md` if measurement rules mature; and
- technical implementation and analytics documentation.

---

## FI-005 — Study-Time Measurement / Active Engagement Telemetry

**Status:** Idea  
**Captured:** 2026-08-19  
**Capability fit:** Understand; Progress and Readiness; product analytics  
**Initial assessment:** Potentially high measurement value; not required for the adaptive-planner MVP; accuracy and privacy need deliberate design

### Opportunity

Revision may benefit from understanding not only which learning activities a student starts and completes, but approximately how much **active revision time** they spend on those activities.

This could improve:

- planner estimates and future workload recommendations;
- understanding of how much study effort different activities require in practice;
- product metrics describing useful revision time rather than raw visits;
- analysis of the relationship between revision effort and learning outcomes; and
- future REV guidance where actual effort materially differs from planned effort.

### Why this is not a simple timer

Elapsed time between opening and completing an activity is not automatically active study time. A learner may:

- leave the browser tab open;
- switch apps or tabs;
- take a break;
- leave the device unattended;
- read or think without generating interaction; or
- resume an activity later.

Revision must therefore avoid presenting raw elapsed time as precise study time.

### Candidate approach

A later implementation could combine signals such as:

- recommendation click-through / activity start timestamp;
- meaningful interaction events within the activity;
- activity completion timestamp;
- page/tab visibility where technically and legally appropriate;
- inactivity thresholds and pause/resume inference; and
- optional learner correction where a material discrepancy matters.

The resulting measure should be described as **estimated active time** unless and until evidence supports a stronger interpretation.

### Measurement principles

The feature should distinguish at minimum:

- activity offered;
- activity opened/started;
- activity meaningfully engaged with;
- activity completed; and
- estimated active time.

A click must not be treated as completion, and a long elapsed session must not automatically be treated as long productive study.

### Product use

Study-time data should only be surfaced to students where it is genuinely helpful. It must not create surveillance, guilt, streak pressure or a simplistic message that more minutes always means better revision.

The strongest use may be behind the scenes: improving planning assumptions, product analytics and REV's understanding of realistic workload.

### Packaging hypothesis

The underlying telemetry should not be artificially restricted by subscription tier if it is needed for safe, accurate product operation and measurement.

If learner-facing insights based on study-time data later become a feature, packaging across Free / Level 1 / Level 2 should be assessed separately through the feature-definition process rather than assumed now.

### Dependencies / questions to assess

- technically reliable start/completion states for activity types;
- inactivity and visibility semantics across desktop/mobile browsers;
- acceptable accuracy threshold and validation method;
- privacy/data-minimisation implications for behavioural telemetry;
- whether estimated active time materially improves planner quality;
- analytics event model and retention policy;
- distinction between in-product activity and revision completed elsewhere; and
- UX wording that communicates estimation rather than false precision.

### Promotion impact

If promoted, review and update at minimum:

- `60-business-operations/Product KPI Framework.md`;
- relevant product/REV authority where time changes recommendation behaviour;
- privacy and student-data authority;
- observability/analytics technical documentation; and
- planner implementation documentation if the estimate becomes a scheduling input.

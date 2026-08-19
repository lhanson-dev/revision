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

**Status:** Idea  
**Captured:** 2026-08-19  
**Capability fit:** Guide; Progress and Readiness  
**Initial assessment:** High potential value; strong strategic alignment; not yet prioritised

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

If approved, review and update at minimum:

- `10-product-governance/Scope and Capability Taxonomy.md`;
- `10-product-governance/Core User Journeys.md`;
- `10-product-governance/Product System Model.md` where relevant;
- applicable experience authority if new planning interaction principles are required;
- applicable privacy/trust authority if scheduling or student-behaviour data introduces new considerations; and
- technical architecture/implementation documentation when implementation begins.

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

## FI-004 — Initial Subject Diagnostic and Periodic Knowledge Check-in

**Status:** Candidate  
**Captured:** 2026-08-19  
**Capability fit:** Understand; Guide; Practise and Test; Progress and Readiness  
**Authority context:** Baseline and diagnostic assessment are already part of the approved `Understand` capability, and the core setup journey already expects Revision to establish baseline context progressively. This item defines a concrete diagnostic experience and evidence-handling model rather than proposing whether diagnostics should exist.  
**Initial assessment:** High strategic value; creates an early evidence baseline for personalisation; implementation must prevent shallow diagnostic evidence from overstating mastery or progress

### Student problem

When a student first adds a subject, Revision may know their qualification, exam board and specification but still know almost nothing about what they personally understand.

Without an initial evidence point, early recommendations risk being generic or based mainly on syllabus structure rather than the student's actual strengths and weaknesses.

At the same time, a short broad quiz cannot provide enough evidence to conclude that a student has mastered a topic simply because they answered one or two sampled questions correctly.

### Proposed capability

When a student starts a subject for the first time, Revision should ask them to complete a short diagnostic quiz designed to establish a **broad initial picture** of their knowledge across the relevant subject/specification.

The diagnostic should sample across important areas rather than deeply testing every topic. Its purpose is to identify useful starting signals such as:

- areas that may need earlier attention;
- areas that appear relatively stronger and may need less immediate focus;
- major knowledge gaps or misconceptions worth checking further; and
- areas where Revision currently has too little evidence to make a useful judgement.

The result should immediately improve early recommendations while remaining explicitly provisional.

### First-subject experience

The diagnostic should fit naturally into the first-use journey after the academic context is known.

A likely flow is:

`add subject → confirm qualification/exam board/specification → explain the purpose of the quick diagnostic → complete broad diagnostic → receive a simple starting summary → receive a useful recommended next action`

The experience should explain that the quiz is there to help Revision understand where to start, not to give the student a grade or judge their overall ability.

It should be short enough that it does not become a large onboarding barrier. If the student cannot complete it, the system should degrade gracefully and build its learner model from later evidence rather than inventing a baseline.

### Evidence weighting and progress protection

**Diagnostic evidence should influence prioritisation before it is strong enough to influence strong progress claims.**

The initial diagnostic is broad but shallow. Evidence from it should therefore begin with lower confidence than repeated topic-level assessment or exam-relevant performance.

The model should distinguish between:

- **directional diagnostic evidence** — useful for deciding what to investigate or prioritise next;
- **corroborated understanding evidence** — enough repeated or sufficiently deep evidence to support stronger understanding claims; and
- **exam-readiness evidence** — evidence from exam-relevant tasks capable of supporting readiness judgements.

A small number of correct diagnostic answers may create a tentative signal that an area is probably stronger, but **must not automatically mark that area proficient, mastered, complete or exam-ready**.

Similarly, one incorrect sampled question should not permanently label a student weak. It should increase the priority of checking or revisiting that area, with later evidence able to confirm or overturn the initial signal.

### Progress-stat behaviour

The diagnostic should not distort headline progress simply because it samples many areas quickly.

In particular:

- answering a sampled question should not automatically count the whole topic as covered;
- one or two correct answers should not establish topic mastery/proficiency;
- broad diagnostic success should not produce a large artificial jump in overall progress;
- diagnostic evidence should carry an explicit confidence/evidence-strength concept behind the scenes;
- later, stronger evidence should be able to supersede the diagnostic signal; and
- progress/readiness UI should use cautious language where the diagnostic is the main evidence source.

The system should prefer states such as **early evidence**, **possible strength**, **possible focus area** or equivalent plain-language treatment over definitive mastery labels when evidence is still shallow.

Exact thresholds and weighting should be validated as an evidence-model decision rather than chosen solely to make the progress UI look responsive.

### Periodic knowledge check-ins

Revision may repeat a similar broad diagnostic periodically as a **check-in activity** once a student has been using a subject for some time.

A check-in can help detect:

- knowledge that has strengthened;
- areas that may have been forgotten;
- gaps that normal self-selected activity has not exposed;
- whether previous weak-area priorities are still justified; and
- whether the student's broader evidence picture has become stale or uneven.

Check-ins should not simply repeat on an arbitrary frequent schedule. Useful triggers may include elapsed time, stale evidence, major changes in the revision plan, long gaps in a subject, or a need to refresh the broad picture before an important assessment.

Repeated check-ins should create additional evidence, but should not allow repeated shallow quizzes to accumulate mechanically into false mastery. Evidence quality, breadth, recency and corroboration should matter more than raw attempt count.

### REV role

REV should use diagnostic results constructively to explain the starting point and next action.

For example, REV may say that early answers suggest a topic deserves checking first, while making it clear that Revision is still learning about the student.

REV should not make definitive statements about ability from a small diagnostic sample.

### Diagnostic design principles

The diagnostic should:

- sample across the relevant specification rather than only the first topics in sequence;
- use questions with clear curriculum mapping so evidence can be attributed correctly;
- include enough breadth to improve prioritisation without attempting to prove mastery;
- avoid making the student feel that poor baseline performance is a failure;
- provide useful feedback where appropriate without turning the diagnostic into a long teaching session;
- record uncertainty explicitly when the evidence is insufficient; and
- be accessible and fast to complete on mobile as well as larger screens.

### Dependencies / questions to assess

- specification-to-question mapping and diagnostic question-bank coverage;
- sampling strategy across subject/topic areas;
- initial diagnostic length and acceptable completion burden;
- evidence-strength/confidence model;
- how diagnostic evidence contributes to recommendation scoring without inflating progress;
- how repeated check-ins interact with existing evidence and recency;
- whether question difficulty should adapt during the diagnostic;
- handling of skipped, guessed or low-confidence answers where relevant;
- learner-facing language for provisional signals;
- analytics/evaluation showing whether the diagnostic actually improves recommendation quality; and
- assurance that diagnostic outcomes remain consistent with `Claims and Progress Governance.md`.

### Relationship to other backlog items

FI-004 should provide early learner evidence that improves the adaptive planning logic in FI-001 and the personalised guidance available to REV in FI-003.

The diagnostic itself should remain an educational/evidence capability. If commercial packaging later differentiates diagnostic depth or frequency under FI-002, payment status must not change the truthfulness or evidence standards used for progress and mastery claims.

### Promotion / implementation impact

Because baseline/diagnostic assessment already exists in approved product direction, this item should be used to define and sequence its concrete implementation.

Before material implementation, review/update at minimum:

- `10-product-governance/Core User Journeys.md` for the first-subject baseline/check-in journey;
- `10-product-governance/Product System Model.md` for diagnostic evidence strength and learner-state updates;
- `40-evidence-and-trust/Claims and Progress Governance.md` if more explicit diagnostic evidence rules or thresholds are needed;
- applicable assessment/content standards for diagnostic question quality and curriculum coverage;
- technical documentation for the learner evidence model and diagnostic engine; and
- assurance/evaluation coverage proving that shallow diagnostic evidence cannot falsely create mastery, proficiency or readiness states.

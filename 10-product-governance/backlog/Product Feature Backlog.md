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

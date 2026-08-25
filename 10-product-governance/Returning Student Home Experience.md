---
title: "Returning Student Home Experience"
document_id: "revision-returning-student-home-experience"
document_type: "domain-authority"
authority: "product-governance"
status: "active"
version: "1.0"
owner: "Founder"
effective_date: "2026-08-24"
last_reviewed: "2026-08-24"
content_review_status: "founder-approved"
source_of_truth_for: ["returning Student Home hierarchy", "Returning Student Home screen-purpose contract", "Home REV hero", "Today's revision plan composition", "Home recommendation launch behaviour"]
depends_on: ["Core User Journeys", "Information Architecture", "Adaptive Revision Planning", "Product UX Principles", "Visual Brand System", "Global Learner Navigation"]
supersedes: ["Core User Journeys returning-student example requiring course-open then mode selection", "Information Architecture Home clause describing Today's plan as necessarily smaller than REV guidance", "Adaptive Revision Planning clause describing Today's plan as necessarily smaller than the Home recommendation"]
---
# Returning Student Home Experience

## Purpose

Define the Founder-approved screen contract and composition for the default returning Student Home experience.

This authority specialises the general Home and Returning Student rules in `Core User Journeys.md`, `Information Architecture.md` and `Adaptive Revision Planning.md`. Where those documents describe an older Returning Student path or require Today's plan to be visually smaller than the recommendation, this document is the more specific current authority.

## Journey

The Returning Student journey is:

`return / login → Home orientation → REV presence → today's revision plan → promoted first task → exact useful activity`

The central learner question remains:

> **I've opened Revision. What is the most useful thing for me to do right now?**

Home must also make the rest of today's intended revision visible without forcing the learner to interpret a dense dashboard.

## Screen-purpose contract

- **User goal:** quickly understand what to do today and start useful revision.
- **Screen job:** orient the learner, make REV feel immediately available, and turn the adaptive plan into an obvious executable first action.
- **Immediate understanding:** REV is available; today's plan is clear; one activity is the best place to start.
- **Primary CTA:** start the promoted first activity directly.
- **Secondary actions:** Ask REV naturally through the hero input; open the full Plan; navigate through normal learner navigation.
- **Essential content:** REV hero, today's total workload, promoted first task, remaining planned activities and enough reason text to make the first task credible.
- **Progressive detail:** the full adaptive programme belongs in Plan rather than being expanded on Home.
- **REV role:** prominent, living and conversational; explain, coach and respond using learner-wide context without replacing deterministic planner logic.
- **Success condition:** the learner can understand today's priority within seconds and enter the exact recommended useful activity in one action.
- **Next state:** the exact supported Learn, Practice or Exam Prep activity selected by the governed planner/recommendation logic.

## Locked Home hierarchy

### 1. REV hero

REV is the major feature moment at the top of Home.

The hero must:

- give the Living E substantial scale and breathing room;
- use the approved soft, atmospheric Living E halo and genuine semantic state motion;
- preserve Light and Dark quality;
- present a personalised greeting such as `Hi {first name}, what shall we do today?`;
- provide the main `Ask REV anything…` input;
- avoid decorative prompt-button clutter beneath the input by default; and
- avoid visible idle-status copy such as `REV is ready` where the visual presence already communicates availability.

REV may use a compact approved identity lock-up such as `Powered by REV` only where a canonical governed identity treatment exists. Production must not invent an ad-hoc wordmark asset.

REV is visually prominent without becoming sci-fi, neon or a mascot.

### 2. Today's revision plan

Immediately below the REV hero, Home presents **Today's revision plan**.

The plan should state the day's intended workload concisely, for example total minutes and number of activities, and provide a route to the full Plan.

The plan is one coherent section, not a grid of unrelated dashboard cards.

### 3. Promoted first task

The first task is visually promoted within Today's revision plan rather than presented as a disconnected recommendation widget.

It should show:

- topic/activity title;
- unambiguous course/subject identity;
- activity mode where useful;
- expected duration where useful;
- one concise evidence-based reason for its priority; and
- one dominant action-labelled CTA.

A separate `Why this first?` control is not required on Home when the concise priority reason is already visible.

The primary CTA must route directly to the exact supported activity. It must not merely open a generic course homepage and require the learner to rediscover the recommendation.

### 4. Remaining activities today

The other planned activities for the day appear alongside or beneath the promoted first task according to responsive space.

They should be visibly subordinate to the first task while remaining easy to scan.

Home does not need a `Choose something else` control inside the plan. Learner agency is already preserved through the full Plan, Courses, normal navigation and Ask REV.

### 5. End of current Home composition

No additional dashboard tiles or speculative lower modules are required after Today's revision plan in the current approved composition.

Future Home modules require their own justified screen job and deliberate design approval rather than being added to fill space.

## Responsive behaviour

The hierarchy is identical across desktop, tablet and phone:

`REV hero → Today's revision plan → promoted first task → remaining planned activities`

Desktop may place the first task and remaining activities side-by-side. Tablet/phone may stack them, with the promoted first task first.

On constrained screens:

- REV remains a meaningful hero rather than collapsing into a generic icon;
- the Ask REV field remains easy to reach;
- the first task and primary CTA remain visible without excessive scrolling;
- remaining activities follow in plan order; and
- the governed persistent Ask REV mobile/tablet action remains available.

All interactions must preserve keyboard usability, visible focus, touch targets, reduced-motion support and WCAG 2.2 AA expectations.

## Planning and evidence rules

The planner remains deterministic and testable. REV explains planning decisions; it does not calculate the priority order through unconstrained LLM judgement.

Home must remain useful with incomplete learner evidence. Missing target grade, full timetable, assessment setup or revision availability must not automatically make useful Home behaviour impossible when a credible deterministic next activity can still be selected.

Recommendation language must match evidence strength and avoid invented weakness, false precision or unsupported grade/readiness claims.

## Free product rule

Returning Student Home, REV orientation, today's useful plan and the ability to start the promoted useful activity must remain coherent and useful on Free. Parent, Teacher, School or paid subscription functionality must not become dependencies for this core Student journey.

## Assurance expectations

Implementation should cover at minimum:

- first meaningful Home entry after GJ-01;
- established returning Student;
- one active course and multiple active courses;
- limited evidence / deterministic fallback;
- direct promoted-task-to-exact-activity routing;
- full Plan route;
- genuine REV resting/listening/thinking/responding states;
- reduced motion;
- Light and Dark;
- phone, tablet and desktop hierarchy;
- keyboard/focus behaviour; and
- Free entitlement behaviour.

## Documentation impact

This authority records the Founder-approved Returning Student Home design direction agreed 24 August 2026. Implementation must update the current Home technical documentation when production behaviour changes. Historical GJ-01 design/research evidence remains historical and must not be rewritten.

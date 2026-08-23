# Journey Experience Analysis — 23 August 2026

**Status:** Superseded supporting analysis pending terminology normalisation  
**Baseline:** current approved `main` at `31d844a9ec0a699e4de35af7cb6cbb7ff9ee0530`  
**Programme:** Issue #141 — journey-led full-site content and design review  
**Purpose:** Preserve the original screen-first supporting analysis while the programme moves to the scenario-first Student terminology model.

## Current interpretation

This document was created before the Founder decisions on 23 August 2026 that:

1. Revision should organise account entry around three core experience types — **Student, Parent and Teacher**;
2. **Student** is the canonical term for the person using Revision's study product; and
3. Revision should not use `learner` internally and `student` externally for the same entity.

The original analysis used `learner` extensively and was organised primarily around programme tasks/screens. Rather than continue to extend that vocabulary and structure, the current organising sources in this PR are now:

- `research/Student Terminology Decision - 2026-08-23.md` — canonical Student terminology and three-experience-type direction;
- `research/User Scenario Catalogue - 2026-08-23.md` — stable scenario IDs, scenario families and golden journeys; and
- `research/GJ-01 First Ever Use Journey Map - 2026-08-23.md` — the first detailed Student golden journey.

## Retained design conclusions

The following conclusions from the original screen-first analysis remain useful inputs to the scenario-led work:

> **Shared foundation. Distinct job. Explicit hierarchy. Obvious next action. Continuous journey.**

Every material screen should make four things clear within seconds:

1. **Where am I?**
2. **What is this screen for?**
3. **What matters most now?**
4. **What useful thing should I do next?**

The shared Interface System should make Revision coherent, but composition must follow the user job. Home, Learn, Practice, Plan, Progress, Exam Simulator, Parent, Teacher and Admin experiences should not collapse into one generic card-grid template.

## Content hierarchy contract

Before visual layout is discussed, every material screen should assign its content to four levels:

1. **Orient and act** — context, purpose, strongest useful action and essential state.
2. **Reason and evidence** — minimum explanation needed to trust or complete the action.
3. **Legitimate alternatives** — useful Student choice that remains available without competing with the intended path.
4. **Deeper detail on demand** — evidence history, analytics, extended explanation, settings or other detail that should not delay the primary task.

If Level 3 or Level 4 content is visually louder than Level 1, the hierarchy has failed.

## CTA contract

A material screen should normally have one dominant CTA representing the most useful next action for the primary user intent.

Secondary actions preserve autonomy and recovery but remain visually subordinate.

Navigation is not a substitute for a next action. If Revision already knows the next useful destination, route the Student directly there rather than making them rediscover it through the hierarchy.

Inside ordinary study, commercial discovery must remain contextual and proportionate. Upgrade is primary only on a genuine commercial decision surface.

## Experience archetypes retained for later journey mapping

| Surface | Dominant archetype | What should dominate | What to avoid |
| --- | --- | --- | --- |
| Authentication | Minimal gateway | quickest secure route into Revision | marketing page around the form |
| Experience selection | Routing decision | Student / Parent / Teacher choice | persona questionnaire |
| Student Home | Conversational launchpad | orientation, one useful recommendation/resume action, REV | dashboard of equal cards/metrics |
| Courses | Programme selector | Student’s saved courses, Add Course, direct entry | catalogue complexity before saved courses |
| Add Course | Guided selector | exact course identification with minimal decisions | whole catalogue dumped into one screen |
| Course Overview | Course launchpad | context + strongest next action + focused modes | repeating global dashboard information |
| Learn | Reading / explanation canvas | comprehension, examples and contextual help | nested-card chrome and competing controls |
| Practice | Task workspace | question/task, response, task state | activity-picker dominance after work starts |
| Feedback | Interpretation + next action | what happened, why, what next | score-only endpoint |
| Plan | Decision / commitment workspace | current programme, today’s executable work, realistic adjustment | planning controls without a start path |
| Progress | Evidence narrative | interpretation, uncertainty, priority and action | analytics dashboard requiring Student diagnosis |
| Exam Prep | Performance preparation hub | readiness, targeted exam work, practice choice | generic learning-card repetition |
| Exam Simulator | Focus workspace | exam content, time and exam controls | unrelated global actions or tutor access during timed work |
| REV | Contextual conversation | current context, explanation, recommendation, routing | detached generic chatbot |
| Account / Settings | Compact utility workspace | identity/preferences/account action | full product-dashboard treatment |
| Plan comparison / subscription | Commercial decision workspace | value differences, current state, clear purchase/manage path | anxiety, lock clutter, feature spreadsheet overload |
| Parent | Reassurance/support summary | approved Student progress direction and useful support | surveillance detail |
| Teacher | Future intervention/insight workspace | future governed class/student insight | school LMS assumptions before scope is governed |
| Admin | Operational console | status, exceptions, actions, evidence | Student-style low-density cards everywhere |

## Cross-journey continuity rules retained

1. **Preserve context through transitions.** Course, component, topic, activity, evidence and plan context should carry forward where relevant.
2. **Recommendations terminate in work.** A recommendation is incomplete if its CTA opens another navigation page that makes the Student find the activity again.
3. **Feedback terminates in a useful next action.** Scores, readiness signals and plan changes are not endpoints.
4. **Empty states are journey states.** Explain what is missing, why it matters and the best next action.
5. **Loading preserves hierarchy.** Loading should not cause the primary action or meaning to jump unpredictably.
6. **Errors protect work and momentum.** State what happened, whether work is safe and how to recover into the journey.
7. **Responsive design preserves priority.** Phone/tablet/desktop adaptation must not change the Level 1–4 hierarchy.
8. **Accessibility preserves the same journey.** Keyboard and assistive-technology users must reach the same primary action and complete the same flow.
9. **Light and Dark are the same product.** Theme may alter surfaces and contrast, not semantics or priority.

## Review questions retained for each scenario screen

When a golden journey is mapped into screens, answer:

1. What has the user just done?
2. What are they trying to achieve now?
3. What does Revision already know that must not be requested again?
4. What should be understood in the first few seconds?
5. What is the single strongest useful next action?
6. What content is Level 1, Level 2, Level 3 and Level 4?
7. What legitimate alternatives must remain available?
8. What does REV add here — and what should REV avoid?
9. What makes this composition appropriate to this job rather than a reused page template?
10. What happens on first use, no data, low evidence, loading, error, completed and recovery states?
11. What changes on phone, tablet and desktop without changing priority?
12. How is keyboard/focus/accessibility behaviour assured?
13. What evidence proves the user can complete the intended scenario?
14. Does any conclusion require a normative product/UX authority change before implementation?

## Definition of a ready journey brief

A golden journey should enter governed implementation only when its review has produced:

- end-to-end user intent and entry conditions;
- shortest credible path to value;
- material screen/state inventory;
- screen-purpose contract for each material state;
- Level 1–4 content hierarchy;
- primary and secondary CTA decisions;
- REV context/role decision;
- first-use/empty/low-evidence/loading/error/completion/recovery behaviour;
- responsive and accessibility expectations;
- explicit product-authority changes, if any, approved through the correct governance path;
- implementation boundary and canonical route/runtime identified;
- assurance evidence required to prove the journey; and
- documentation-impact check.

## Governance / documentation impact

This file is supporting research only and is intentionally no longer the primary organising model for the journey programme. It does not amend normative authority.

The scenario catalogue and golden-journey maps should drive future analysis. Product-behaviour or terminology changes identified there must be promoted into the relevant numbered authority before implementation. Historical evidence is not rewritten merely to modernise terminology.

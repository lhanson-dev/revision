---
title: "REV Responsive Access Pattern"
document_id: "revision-rev-responsive-access-pattern"
document_type: "domain-authority"
authority: "brand-and-experience"
status: "active"
version: "1.0"
owner: "Founder"
effective_date: "2026-08-21"
last_reviewed: "2026-08-21"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["desktop REV access", "mobile REV navigation placement", "contextual REV panel", "responsive REV entry pattern"]
depends_on: ["Revision Brand System", "Information Architecture", "Product UX Principles"]
supersedes_scope: ["Revision Brand System v0.9 desktop REV top-navigation wording", "Information Architecture v0.5 desktop REV top-navigation wording"]
---
# REV Responsive Access Pattern

## Purpose

Define how learners reach REV across desktop, tablet and mobile while preserving the approved Living E identity and the principle that REV is one context-aware assistant relationship.

This rule specialises the Revision Brand System and Information Architecture. It does not change REV's visual identity, motion states, evidence rules or conversational boundaries.

## Desktop

REV does **not** appear in the persistent desktop top navigation.

Desktop top navigation contains:

- Home;
- Plan;
- Progress; and
- Subjects.

A floating **Ask REV** control remains available at the right-hand side of the learner experience outside Admin.

Opening Ask REV:

- keeps the current learner screen in place;
- opens a contained right-side chat panel rather than navigating away;
- identifies the screen/context the learner is currently viewing;
- passes known subject/course/component context into REV where available;
- lets the learner close the conversation and continue without losing their place; and
- uses the Living E as the REV identity cue without turning the control into decorative AI theatre.

The floating control is an interaction layer, not a fifth desktop navigation tab.

A dedicated REV route may remain available for deep links or future full-screen conversation needs, but it is not the default desktop entry pattern.

## Mobile and supported tablet widths

Mobile and supported tablet widths retain the persistent five-item bottom navigation:

1. Home
2. Plan
3. REV
4. Progress
5. Subjects

REV remains the centre destination and may use the approved raised Living E treatment.

This difference is intentional: desktop has sufficient space to keep the current work visible alongside a contextual conversation, whereas mobile benefits from a dedicated REV destination.

## Context behaviour

REV context is inherited from the screen the learner is on where the implementation can determine it reliably.

At minimum:

- Home, Plan, Progress and Subjects provide learner-wide context;
- Subject Home provides the selected subject context;
- course/component screens provide their subject plus focused-section context; and
- a learner should not need to restate an already-known subject merely to ask a contextual question.

Context must not be fabricated. Where the implementation cannot determine a reliable scope, REV should ask rather than pretend.

## Home greeting

The Home greeting uses the signed-in learner's actual first name:

`Hey {first name}, what shall we do today?`

Names used in design concepts, screenshots or test fixtures are examples only and must never become hard-coded learner copy.

## Accessibility and interaction

The floating desktop control and panel must:

- have an accessible Ask REV label;
- remain keyboard reachable;
- provide a clear close action and Escape-key dismissal;
- preserve visible focus;
- avoid horizontal page overflow;
- respect reduced-motion preferences; and
- not block the learner from continuing their primary task unnecessarily.

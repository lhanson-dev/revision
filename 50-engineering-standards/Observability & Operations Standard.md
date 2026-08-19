---
title: "Observability & Operations Standard"
document_id: "revision-observability-operations"
document_type: "standard"
authority: "engineering"
status: "active"
version: "0.2"
owner: "Founder"
effective_date: "2026-08-17"
last_reviewed: "2026-08-19"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["system health", "operational visibility"]
depends_on: ["ADR-0010"]
supersedes: null
---
# Observability & Operations Standard

## Principle
Important failures should be detected and surfaced automatically wherever practical.

## Protected operational view
The role-gated Admin capability inside the canonical `/app/` runtime should provide a high-level Founder operations view with drill-down detail.

The initial view should surface, where supported by actual evidence:
- overall system health;
- authentication health;
- progress/data health;
- learner-app reachability;
- deployment/smoke-test health;
- real learner usage statistics;
- learning-system activity;
- Content Operations / Content Factory state; and
- actionable warnings or critical issues.

The dashboard should answer high-level operational questions quickly. Detailed evidence belongs behind the relevant Users, Activity, System Health or Content Operations view rather than crowding the landing page.

## Rules
- Test/synthetic data is excluded from live learner statistics by default.
- Admin activity is excluded from learner-engagement statistics by default.
- Health statuses use plain language: **Healthy**, **Attention needed** and **Unknown**.
- Missing evidence is **Unknown**, never Healthy.
- A headline metric must state or make clear what evidence it measures. Do not label recorded learning evidence as general app activity when session/page-view telemetry does not exist.
- Heterogeneous learning evidence must not be combined into a misleading global performance score.
- Operational details should explain evidence, impact and action, not expose unnecessary technical jargon.
- Aggregate operational statistics are preferred where individual learner identity or private content is not required.
- Failed progress saves preserve work and retry safely.
- Browser clients must not receive privileged operational credentials merely to render Admin statistics.

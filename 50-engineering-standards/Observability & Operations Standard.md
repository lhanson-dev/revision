---
title: "Observability & Operations Standard"
document_id: "revision-observability-operations"
document_type: "standard"
authority: "engineering"
status: "active"
version: "0.3"
owner: "Founder"
effective_date: "2026-08-17"
last_reviewed: "2026-08-19"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["system health", "operational visibility", "founder assurance visibility"]
depends_on: ["ADR-0010"]
supersedes: null
---
# Observability & Operations Standard

## Principle
Important failures should be detected and surfaced automatically wherever practical.

Operational confidence must come from current evidence. A green label is not permitted where the evidence source, freshness or covered control is unknown.

## Protected operational view
The role-gated Admin capability inside the canonical `/app/` runtime should provide a high-level Founder operations and assurance view with drill-down detail.

The initial view should surface, where supported by actual evidence:
- overall system health;
- production availability;
- path-to-live/CI and deployment health;
- authentication health;
- progress/data health;
- learner-app reachability;
- real learner usage statistics;
- learning-system activity;
- Content Operations / Content Factory state;
- critical journey/control assurance coverage;
- open P0/P1/P2 defects; and
- actionable warnings or critical issues.

The dashboard should answer high-level operational questions quickly. Detailed evidence belongs behind the relevant Users, Activity, System Health, Assurance or Content Operations view rather than crowding the landing page.

## Founder assurance presentation
Admin should expose a dedicated **Assurance** detail view rather than folding all assurance into one generic System Health list.

The Founder-facing model should separate five questions:

1. **Is production live?** — current reachability and production artifact/smoke evidence.
2. **Can changes get safely to live?** — latest required CI, merge/deployment and post-deployment evidence.
3. **Are critical user journeys covered?** — current journey/control matrix, by required assurance layer.
4. **Are database/security controls covered?** — explicit status for data ownership, persistence, privileged boundaries and other declared controls.
5. **Are there known serious defects?** — open P0/P1/P2 counts and drill-down records.

A compact Founder assurance summary may show:
- Production: Healthy / Attention needed / Unknown;
- Path to live: Healthy / Attention needed / Unknown;
- Critical journey coverage: Covered / Partial / Uncovered / Unknown counts;
- Data & security coverage: Covered / Partial / Uncovered / Unknown counts;
- Defects: P0 / P1 / P2 open counts;
- latest evidence time and relevant commit/deployment identifier.

The overall Admin status must not hide domain disagreement. For example, production may be Healthy while assurance coverage remains Partial.

## Evidence freshness
Operational evidence must carry or derive a timestamp. The UI should display freshness for evidence that can become stale.

A stale or unavailable external signal must degrade to **Unknown** rather than continue showing the last successful state as current. Exact staleness thresholds should be defined per evidence source during implementation; they should reflect how often that signal is expected to change.

## Defect visibility
P0/P1/P2 classification follows the Testing & Assurance Standard.

- Any open P0 forces overall assurance to **Attention needed** and must appear at the top of Founder attention.
- Any open P1 forces the affected domain to **Attention needed**.
- P2 appears in counts and affected-domain drill-down but does not automatically make unrelated domains unhealthy.
- Closed defects remain historical evidence and should not remain in current open counts.

Defect records should link to the affected journey/control and fix/verification evidence where available.

## Rules
- Test/synthetic data is excluded from live learner statistics by default.
- Admin activity is excluded from learner-engagement statistics by default.
- Health statuses use plain language: **Healthy**, **Attention needed** and **Unknown**.
- Missing evidence is **Unknown**, never Healthy.
- Coverage states use **Covered**, **Partial**, **Uncovered** and **Unknown** and must not be converted into a misleading percentage without a declared denominator.
- A headline metric must state or make clear what evidence it measures. Do not label recorded learning evidence as general app activity when session/page-view telemetry does not exist.
- Heterogeneous learning evidence must not be combined into a misleading global performance score.
- Operational details should explain evidence, impact and action, not expose unnecessary technical jargon.
- Aggregate operational statistics are preferred where individual learner identity or private content is not required.
- Failed progress saves preserve work and retry safely.
- Browser clients must not receive privileged operational credentials merely to render Admin statistics.
- Current implementation coverage must be distinguished from target coverage; planned tests do not count as Covered.

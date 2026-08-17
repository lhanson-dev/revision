---
title: "Observability & Operations Standard"
document_id: "revision-observability-operations"
document_type: "standard"
authority: "engineering"
status: "active"
version: "0.1"
owner: "Founder"
effective_date: "2026-08-17"
last_reviewed: "2026-08-17"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["system health", "operational visibility"]
depends_on: ["ADR-0010"]
supersedes: null
---
# Observability & Operations Standard

## Principle
Important failures should be detected and surfaced automatically wherever practical.

## Initial operational view
A protected `/admin` area should surface:
- overall system health
- authentication health
- progress/data health
- deployment/smoke-test health
- real-user usage statistics
- learning-system health
- actionable warnings/critical issues

## Rules
- Test/synthetic data is excluded from live statistics by default.
- Health statuses use plain language such as Healthy, Attention needed and Unknown.
- Missing evidence is Unknown, never Healthy.
- Operational details should explain impact and action, not expose unnecessary technical jargon.
- Failed progress saves preserve work and retry safely.

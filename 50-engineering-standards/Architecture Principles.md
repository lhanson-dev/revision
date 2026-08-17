---
title: "Architecture Principles"
document_id: "revision-architecture-principles"
document_type: "standard"
authority: "engineering"
status: "active"
version: "0.1"
owner: "Founder"
effective_date: "2026-08-17"
last_reviewed: "2026-08-17"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["software architecture principles"]
depends_on: ["ADR-0001", "ADR-0002", "ADR-0003", "ADR-0004"]
supersedes: null
---
# Architecture Principles

## Approved direction
Revision is one reusable learning platform, not a collection of separate subject applications.

## Boundaries
- `app`: routing, screens and learner interaction.
- `engine`: learning, recall, assessment, progress, recommendations and exams.
- `services`: auth, persistence and external/platform integration.
- `content`: subject/qualification/paper material and configuration.

## Rules
- Subject knowledge must not be embedded in shared engine code.
- Content must not contain UI implementation behaviour.
- New subject-specific behaviour should become a reusable capability where practical.
- Domain/scoring logic should be testable independently of React.
- Platform services must expose clear interfaces rather than being called ad hoc throughout components.
- Architecture should remain proportional: new layers/services require a demonstrated need.

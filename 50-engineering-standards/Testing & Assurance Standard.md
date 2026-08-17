---
title: "Testing & Assurance Standard"
document_id: "revision-testing-assurance"
document_type: "standard"
authority: "engineering"
status: "draft"
version: "0.1"
owner: "Founder"
effective_date: null
last_reviewed: null
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["automated assurance", "test risk classification"]
depends_on: ["ADR-0006", "ADR-0007", "ADR-0009"]
supersedes: null
---
# Testing & Assurance Standard

## Principle
Automation is the default source of regression confidence. Manual testing is reserved for targeted usability and exploratory judgement.

## Required layers
- schema/content validation
- TypeScript/type checks
- lint/code-quality checks
- unit tests for engine/domain rules
- integration tests for important boundaries
- Playwright browser tests for core journeys
- automated accessibility checks where practical
- production build validation
- post-deployment smoke checks

## Risk-based CI
Low-risk changes run lightweight relevant checks. Medium-risk changes run targeted behavioural checks. High-risk changes to auth, data, progress, readiness, exams, migrations or shared engine run the full regression suite.

## Test data
Automated tests use dedicated test identities and synthetic data. Test activity is excluded from live metrics/reporting by default.

## Learner clarity
Where structurally possible, validation must require learner-facing activities/results to provide the explanatory content needed to state what the activity is, why it matters, what the learner should achieve, how results are derived, and what to do next.

---
title: "Testing & Assurance Standard"
document_id: "revision-testing-assurance"
document_type: "standard"
authority: "engineering"
status: "active"
version: "0.2"
owner: "Founder"
effective_date: "2026-08-17"
last_reviewed: "2026-08-17"
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
- responsive viewport checks for learner-facing core journeys
- production build validation
- post-deployment smoke checks

## Responsive assurance
Core learner journeys must be assured on representative mobile, tablet and laptop/desktop viewport classes.

At minimum, automated browser coverage should verify that critical journeys:
- remain navigable and functionally complete at representative phone, tablet and desktop widths
- do not introduce unintended horizontal page scrolling
- keep primary controls and explanatory/result content visible and operable
- support touch-sized interaction targets and do not rely on hover-only behaviour
- preserve exam, assessment, progress and subject-selection functionality across device classes

Major learner-facing layout changes should include targeted responsive Playwright coverage. Manual device testing may supplement this for usability judgement, but it does not replace automated viewport regression checks.

## Risk-based CI
Low-risk changes run lightweight relevant checks. Medium-risk changes run targeted behavioural checks. High-risk changes to auth, data, progress, readiness, exams, migrations or shared engine run the full regression suite.

Any learner-facing change that materially alters layout, navigation, forms, assessment interactions, exam experience or progress presentation must include responsive regression coverage appropriate to its risk.

## Test data
Automated tests use dedicated test identities and synthetic data. Test activity is excluded from live metrics/reporting by default.

## Learner clarity
Where structurally possible, validation must require learner-facing activities/results to provide the explanatory content needed to state what the activity is, why it matters, what the learner should achieve, how results are derived, and what to do next.

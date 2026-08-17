# ADR-0006 — Automation-first assurance

Status: Draft pending merge
Date: 2026-08-17

## Decision
Revision will automate assurance as far as practical. Manual testing is a targeted usability/exploratory activity, not the primary regression gate.

## Consequences
Automated assurance covers content validation, type checking, unit tests, integration tests, browser journeys, accessibility checks and production builds according to change risk.

Critical learning, progress, auth, data, scoring and exam behaviour require stronger automated coverage than low-risk visual/copy changes.

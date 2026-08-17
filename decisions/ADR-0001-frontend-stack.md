# ADR-0001 — Frontend stack

Status: Draft pending merge
Date: 2026-08-17

## Decision
Revision will use React + TypeScript + Vite for the application frontend. TypeScript strict checking is the default. No full-stack framework is introduced without a demonstrated need.

## Why
Revision needs a reusable application structure, strong contracts for learning/content data, and reliable automated testing without unnecessary server complexity.

## Consequences
- React owns learner-facing UI and interaction.
- Core learning-domain logic must remain separable from React components.
- Vite produces the deployable static build.
- Additional major frontend libraries require a clear requirement and review.

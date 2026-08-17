# ADR-0003 — Content schema and validation

Status: Draft pending merge
Date: 2026-08-17

## Decision
Learning content will initially be authored in TypeScript and validated against shared Zod schemas.

## Why
Content needs strong, automated contracts before Revision expands to many subjects and papers.

## Consequences
- Every content pack must pass schema and consistency validation before release.
- Content must describe learning material, not UI behaviour.
- Content stays version-controlled in GitHub initially.
- The schema is a versioned interface between content and the learning engine.

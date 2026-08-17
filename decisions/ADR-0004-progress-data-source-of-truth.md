# ADR-0004 — Progress data source of truth

Status: Draft pending merge
Date: 2026-08-17

## Decision
Supabase is the canonical persisted store for authenticated learner progress. Browser storage may support working state, cache and recovery, but is not an equal source of truth.

## Why
A single persisted authority is required for reliable multi-device progress and future analytics.

## Consequences
- Progress data should become structured and versionable rather than one permanently opaque state blob.
- Failed saves must preserve work locally and retry safely.
- Stale local state must not silently overwrite newer cloud state.

# Phase 1 Foundation Implementation

## Status
Implementation in progress. This document describes the first safe migration step, not the completed product refactor.

## Purpose
Introduce the approved React + TypeScript + Vite toolchain and automated CI without replacing the currently published learner experience before the new build/deployment path is proven.

## Implemented in this phase
- root Node/package configuration for the future Revision application
- strict TypeScript project configuration
- Vite + React build configuration
- a non-production `foundation.html` entry point
- explicit `app`, `engine`, `services` and `content` architecture boundaries
- Vitest baseline
- ESLint baseline
- GitHub Actions checks for typecheck, lint, unit tests and production build

## Production boundary
The existing root `index.html`, subject routes, authentication behaviour and Supabase integration remain unchanged in this phase. GitHub Pages continues to publish the current site until the new compiled deployment path is explicitly approved and enabled.

## Next steps
1. prove this CI/build foundation on the pull request
2. inspect and baseline the existing Supabase schema, RLS, auth and learner data
3. introduce the shared content schema and content-pack structure
4. migrate current Business Paper 2 behaviour into the shared engine incrementally
5. cut over the production entry point only after equivalent core journeys are automated and passing

## Catalogue compatibility
The planned subject catalogue will consume content-pack manifest metadata rather than hard-coded subject screens. The catalogue itself is deliberately not implemented in Phase 1.

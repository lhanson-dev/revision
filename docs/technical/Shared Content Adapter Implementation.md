# Shared Content Adapter Implementation

## Status

Implementation evidence for the refactor. This document does not replace the Product Source of Truth or engineering standards.

## Purpose

Create the first reusable boundary between subject content packs and the Revision application/learning engine.

The boundary must allow future subjects, qualifications, exam boards and papers to plug into Revision without adding subject-specific conditionals to shared application code.

## Implemented boundary

`contentPackSchema` validates a complete pack as one unit. It checks:

- manifest and topic definitions agree;
- referenced topic IDs exist in the manifest;
- IDs are unique within each content collection;
- multiple-choice answer indexes are valid;
- exam question marks equal AO allocations;
- exam question totals equal exam totals;
- the primary exam duration and marks agree with manifest paper metadata.

Topic IDs are generic slugs rather than a Business-specific enum. Subject-specific topic sets belong to each content manifest.

`createLearningContentAdapter(pack)` exposes shared read operations for:

- catalogue metadata;
- ordered topics;
- formulas and topic links;
- flashcards;
- quick-check questions;
- case studies;
- data drills;
- exams.

`contentRegistry` is the application-level registry of installed content packs. The future Subject Catalogue can read the same registry/manifest metadata used by the learning experience rather than maintaining a separate hard-coded subject list.

## Current proof

AQA AS Business Paper 2 is the first registered pack.

The non-production React foundation reads its catalogue entry through the registry. Tests also construct a synthetic Maths pack with an `algebra` topic to prove that the shared adapter is not coupled to Business topic identifiers.

## Production boundary

There is no learner-facing production cutover in this slice.

The existing static route under `subjects/business/aqa-as/paper-2/` remains the production implementation. The new React foundation consumes the pack only through `foundation.html` until later parity work is approved.

## Next slice

Build reusable learning-engine operations on top of the adapter, beginning with deterministic recall/assessment selection and progress evidence contracts. Do not copy rendering or Business-specific rules into the engine.

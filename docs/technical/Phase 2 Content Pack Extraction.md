# Phase 2 Content Pack Extraction

Document type: implementation evidence  
Status: active  
Version: 0.1  
Owner: Engineering  
Effective date: 2026-08-17  
Last reviewed: 2026-08-17

## Purpose
Record the first extraction of learner content from the static AQA AS Business Paper 2 prototype into the approved typed content-pack architecture.

## Scope
This phase creates a shadow content pack at `content/business/aqa-as/paper-2/` and a shared schema at `content/schema.ts`.

The extracted pack includes:
- catalogue-ready subject / qualification / exam-board / paper metadata
- six topic areas and learning sections
- formula set
- topic-linking explanations
- existing flashcards plus the specification-completion flashcards previously injected by `v2.js`
- existing quick-check questions plus the specification-completion questions previously injected by `v2.js`
- NorthPeak Bikes guided case study
- quantitative/data drills
- Harbour Home 90-minute / 80-mark simulator, including AO1–AO4 allocations and marking guidance

## Source boundary
The extraction is grounded in the current prototype files:
- `subjects/business/aqa-as/paper-2/data-core.js`
- `subjects/business/aqa-as/paper-2/data-recall.js`
- `subjects/business/aqa-as/paper-2/data-test.js`
- content constants inside `subjects/business/aqa-as/paper-2/v2.js`

UI rendering, timers, progress calculations, readiness weighting, persistence and self-marking behaviour remain application/engine concerns and are not moved into content.

## Validation
The content pack is now included in TypeScript typechecking and ESLint.

Zod schemas validate content shape and invariants including:
- valid topic identifiers
- non-empty required fields
- valid multiple-choice answer indexes
- exam question AO totals equal question marks
- exam question totals equal the paper total

Vitest checks:
- catalogue identity and paper metadata
- all six topic references
- unique identifiers by content family
- minimum extracted content coverage
- topic-reference integrity
- the existing simulator mark profile `3, 3, 4, 9, 9, 16, 16, 20`
- the 80-mark total
- retention of the seven-question NorthPeak case study

## Production boundary
The production learner experience is unchanged in this phase.

The existing static `subjects/.../paper-2` files remain the runtime source until the shared React learning engine consumes the typed pack and parity is proven. No existing prototype file is deleted in this phase.

## Catalogue compatibility
The manifest deliberately separates catalogue metadata from learner-specific state. A future catalogue can discover:
`Subject → Qualification → Exam Board → Paper`
without hard-coded subject screens.

`My Revision` remains learner-specific persisted state and is not part of the content pack.

## Next step
After this extraction passes CI and Founder approval, the next implementation slice should build the first shared content adapter / learning-engine boundary that reads this typed pack while leaving the current production route intact until parity tests pass.

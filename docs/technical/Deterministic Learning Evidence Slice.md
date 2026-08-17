---
title: Deterministic Learning Evidence Slice
status: implementation
last_reviewed: 2026-08-17
---

# Purpose

Introduce reusable learning-engine operations that select recall and multiple-choice content deterministically and record raw learner evidence without yet calculating readiness or mastery.

# Implemented

- Seeded deterministic flashcard selection.
- Seeded deterministic multiple-choice selection.
- Topic-filtered selection.
- Balanced diagnostics with a fixed number of questions per topic.
- A shared learning-engine facade over the content adapter.
- Versioned evidence contracts for flashcards, multiple choice, exam questions and full exam attempts.
- Zod validation for evidence records and impossible mark values.
- A raw percentage helper for comparable reporting only; it is not a readiness calculation.

# Design boundary

Selection, evidence collection and readiness are separate concerns.

Selection answers: what should the learner see?
Evidence answers: what did the learner demonstrate?
Readiness will later answer: what does the accumulated evidence imply, with what confidence?

No click, page view or elapsed study time becomes mastery evidence by itself.

# Production boundary

This slice is not wired into the current production Business Paper 2 route. Existing learner progress, Supabase persistence and readiness logic remain unchanged until a later parity-tested cutover.

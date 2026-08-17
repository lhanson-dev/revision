# Phase 4 — Readiness, confidence and evidence persistence

## Purpose
Introduce the first explicit interpretation layer over learner evidence and define the additive storage model needed to persist that evidence safely.

## Separation of concerns
- Selection decides what the learner sees.
- Evidence records what the learner demonstrated.
- Readiness interprets performance evidence.
- Confidence expresses how much evidence supports the readiness result.
- Persistence stores immutable evidence facts; it does not calculate readiness in SQL.

## Readiness v1
A precise readiness score is withheld until there are at least six scored evidence items across at least two evidence families and at least one family beyond recall.

Evidence families are:
- recall — flashcards
- application — multiple choice
- exam — exam-question marks
- simulation — full exam attempts

When a score is allowed, Revision calculates a mean within each represented evidence family and then averages those family means. This prevents large volumes of low-value repeated recall activity from dominating stronger assessment evidence.

## Confidence v1
Confidence is separate from performance. It increases with evidence volume, family diversity and recent evidence. Evidence older than 60 days can still contribute to performance but caps confidence at low until fresher evidence is collected.

The v1 thresholds are deliberately conservative and must remain explainable. They are policy values, not claims of statistical certainty, and can be revised through evidence/research without changing persisted evidence facts.

## Paper readiness
Paper readiness is withheld until every topic in the paper has enough evidence for its own topic readiness result. Paper score is the equal average of topic results; paper confidence is capped by the least-supported topic.

## Persistence model
`public.learning_evidence` is additive to `public.revision_progress`.

The new table is append-only for authenticated learners:
- learners may insert their own evidence
- learners may read their own evidence
- browser clients may not update or delete evidence
- `user_id` is indexed with module/topic and occurrence time for expected reads
- RLS ownership uses `(select auth.uid()) = user_id`
- `anon` has no table privileges
- `authenticated` receives explicit SELECT and INSERT grants

The full validated evidence object is retained in `payload`, while the main query dimensions are duplicated into typed columns for efficient filtering and indexing.

## Migration boundary
This PR commits the migration artifact but does not apply it to the live Supabase project. Existing learner progress, auth and production routes are unchanged until Founder-approved database execution.

## Current Supabase compatibility note
Supabase has changed Data API auto-exposure behaviour for newly created tables in 2026. This migration therefore uses explicit grants and RLS instead of assuming a public-schema table is automatically available to the browser client.

## Next step
After Founder approval:
1. apply the migration to the Revision Supabase project;
2. verify table structure, grants, RLS policies and zero impact to existing `revision_progress` rows;
3. wire the `/app/` progress service to insert/read structured evidence;
4. surface readiness/confidence explanations in the React learner experience only after persistence is proven.

# ADR-0032 — Proposed Single Exam-Backwards Preparation Programme

**Status:** Proposed; pending Founder review and explicit merge/Ready decision. **Date:** 15 October 2026. **Baseline:** `fd8565838db8fc27cbf359fc86d846e9ab11fda5`.

## Context

Existing Product Strategy and Adaptive Revision Planning require an evidence-aware full-exam coherent programme. Current FI-001 R1 ranks and packs supported candidates, R2 builds a factual horizon and a separate weekly-focus display rotates candidates. The shipped result lacks curriculum obligation, pedagogical treatment, planned progression, feasible cross-subject workload and paper-skill strategy. R2 readiness intentionally deferred these to R3 and later FI-009–012. No separate independent engine is permitted.

## Proposed decision

Unify the programme as one deterministic read-only decision pipeline from approved curriculum/paper obligations, existing validated learner evidence, realistic capacity, eligible treatment opportunities and paper dates to a versioned whole-exam programme, weekly objectives and linked near-term actions. Reuse R1 exact Start, hard date and asset scope gates, accepted commitments, Supabase owner data and evidence engine. Retire the independent `weekly-focus.ts` rotation as priority authority after a new programme engine is proven. Do not redefine mastery/readiness, invent skills/options, generate unchecked assessments or schedule FI-009–012 specialist modes without separate approved readiness.

## Alternatives rejected

- Extend R2 weekly rotation or vary its visible 1–3 candidate cap: gives variety without explaining educational need or feasibility.
- Expand all exact daily appointments to full year: false precision and unnecessary accepted-session reads.
- Independent generative REV planner: duplicate authority, unpredictability, unsupported readiness/evidence and higher cost.
- Wait for every FI-009–012 capability before any useful programme: unnecessarily defers value achievable with existing approved assets and explicit coverage limitations.

## Consequences, evidence and decision gate

Requires a meaningful allocation/treatment refactor and end-to-end student-value acceptance, plus new phase-sensitive programme decision trace. Exact schema changes should be avoided unless independently justified. Performance, validity of source skills/AO mappings and unsupported assessment assets are explicit risks. Proposed architecture and 13 student cases document this; not accepted by this proposal alone. **No production implementation until Founder has approved the proposed FI-001 reset Definition of Ready.** Update the accepted ADR/technical implementation after authorised code delivery. Historical R1/R2 records remain unchanged.

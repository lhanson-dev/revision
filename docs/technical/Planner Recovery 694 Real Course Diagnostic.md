# Issue #694 — real-course horizon diagnostic

**Status:** non-production diagnostic candidate; no scheduling behaviour changed.
**Canonical route:** `/revision/app/#/plan`, React/Vite PlanScreen; Home/REV consume the same preparation decision.
**Normative source:** `10-product-governance/Adaptive Revision Planning.md`.
**Evidence:** `src/app/planner-recovery-694.test.ts` using published catalogue adapters for Business 7132 and Psychology 7182.

## Falsifiable finding
The current preparation allocator assigns each supported candidate ID at most once through the whole exam horizon, then removes it from the outstanding set. No scored learning or additional supported assessment opportunity is inferred solely from spare time. Therefore some future weeks can have spare capacity and no allocated objectives. The new fixture explicitly detects this condition using the current real published adapters, recorded paper dates and 45/60-minute availability, and separately ensures the 14-day executable schedule never exceeds capacity.

This is a **diagnostic** that describes current code, not a passing product-acceptance assertion. The number of empty weeks, individual educational omissions and an actual signed-in learner account's outcome remain to be evaluated. A future change removing sparse weeks must replace this diagnostic with an evidence-backed acceptance test rather than simply disabling the check.

## Distinct remaining gates
1. Run exact-head CI and inspect this diagnostic's actual results; do not claim it passed until observed.
2. Review the real course's supplied Learn/Practice/Exam Prep opportunity coverage, candidate depletion and paper-specific limits.
3. Specify permitted pedagogical re-check and retrieval cadence based on genuine supported assets and evidence; never invent a fixed-repeat debt cycle.
4. Where the proposed work goes beyond FI-001's approved R2 Ready boundaries, complete the Definition-of-Ready and explicit Founder approval before implementing product behaviour.
5. Run authenticated browser/database acceptance for exam date changes, accepted sessions, progress updates, Week/Home/REV consistency and multi-course balance.

## Documentation impact
No new normative rule. This candidate adds regression/diagnostic evidence plus technical explanation; retain existing authority and historical audits unchanged.

## 29 October 2026 — P0, genuinely empty Plan despite known configured data

The Founder reported no visible planned activities on canonical `/revision/app/#/plan` after #695 (future-week objectives) and #696 (sparse-horizon diagnostics) deployed. Issue #694 was reopened; neither previous PR proves learner acceptance.

A read-only production **aggregate** query (no account identities or answer text) found one learner with four future assessments against AQA Business 7132 and Psychology 7182, correctly matching course membership, whole-course `scope={}`, `module_id=NULL`, and 225 known weekly minutes (45 minutes on five days). No accepted/manual sessions exist in the `learner_planned_sessions` table; this is compatible with derived auto-planned recommendations and is not a reason to show none. The configured learner has 84 past learning evidence events. There are also additional learner accounts with course membership but no full planner configuration. **These facts do not establish which authenticated account or Plan date/view the Founder was using.**

The app's `PlanScreen` displays detailed automatic suggestions from a 14-day snapshot; more distant weeks display provisional supported objectives. If loading assessments/evidence fails, the screen resets learning state; if near-term accepted-session loading fails, the detailed snapshot is disabled. The first reproducibility gate therefore must distinguish missing setup, returned data/error, real candidate scarcity and the browser display path rather than invent sessions or assume every calendar day needs a task.

PR #702 adds a published real-course synthetic regression using matching whole-course assessments and availability, plus a second scenario with accumulated *synthetic* evidence. It also adds an isolated **real Auth/PostgREST browser journey** (not intercepted requests) that creates a disposable ordinary learner, persists both courses, future exams and study capacity, checks that Week shows at least one actual suggested activity, reloads and verifies persistence, then removes the account. The runner rejects production Supabase URLs. This does **not** independently reproduce the Founder's own signed-in state, guarantee educational sufficiency through the last exam, or authorise a speculative scheduling fix.

**Acceptance remains P0 OPEN** until a real user's current Week page visibly shows supported scheduled activities (or a truthful, evidenced missing-input explanation), following week/day and progress changes remain coherent, long-horizon future objectives are meaningful, and actual browser data-load errors have not been hidden as an empty calendar. Any behavioural fix needs specific Founder-approved PR merge and live release verification. Broader assessment accuracy remains a separate educational acceptance gate.

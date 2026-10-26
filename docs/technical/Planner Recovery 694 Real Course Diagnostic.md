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

# Authority Conflict Register

## Status
Legacy Light Adoption conflicts are retained for traceability. ACR-004 is resolved by the approved brand/learner-design authority; unrelated legacy conflicts remain outside this reconciliation.

| ID | Topic | Conflicting / uncertain positions | Status | Resolution owner |
|---|---|---|---|---|
| ACR-001 | Mandatory authentication | Code requires sign-in; no approved product authority yet states whether authentication must always be mandatory | OPEN — unresolved intent, not yet a contradiction | Founder |
| ACR-002 | Cloud progress sync | Implementation provides Supabase-backed sync; no approved authority yet defines whether cloud sync is core/optional | OPEN | Founder |
| ACR-003 | Exam-readiness score/recommendations | Implementation and README describe evidence-aware readiness; approved methodology, customer promise and evidence boundary are not yet defined | OPEN | Founder |
| ACR-004 | Visual identity | Early implementation had no approved brand/visual authority | **RESOLVED 2026-10-07** — company-wide identity is governed by `20-brand-and-experience/Visual Brand System.md`; learner visual/interaction design is governed by `20-brand-and-experience/Learner Design System.md` | Founder |

## Rule
Do not silently close these items by copying current implementation into authority. Each is a decision to resolve during substantive product/brand governance.
## ACR-005 — FI-001 minimum meaningful programme versus bounded R2/R3 readiness

**Status: OPEN — scope/readiness reconciliation, not contradiction between active product visions. Founder decision required.** Normative `Product Strategy.md`, `Adaptive Revision Planning.md`, `Product System Model.md` and `Course Learning Blueprint.md` require programme-led exam-backwards preparation. Human-approved R2 Ready after PR #628 expressly excluded cross-course allocation optimisation (R3), improved learning treatment selection and newly scheduled FI-009–012 checks. Released R2/#632 display logic does not meet the broader learner-value requirement. Proposed FI-001 programme-first reset changes the *minimum meaningful release scope* and must complete a new Definition of Ready and Founder decision; it must not be misrepresented as already covered by R2 approval, nor automatically elevate FI-009–012. **Owner:** Founder / Product. **Resolution path:** review governance proposal PR, merge only with explicit approval, then separately approve or reject new FI-001 reset Ready. This entry is a recorded delivery-scope tension and pending amendment, not evidence that old authority was silently superseded.

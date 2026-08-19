# Defect Register

**Status:** Active current-state register  
**Defect register version:** 1  
**Last triaged:** 2026-08-19  
**Purpose:** Durable source for known P0/P1/P2 defects surfaced through Founder Assurance. This register implements the defect evidence/lifecycle requirements in `50-engineering-standards/Testing & Assurance Standard.md`.

## Rules

- Record known P0/P1/P2 defects here using the severity definitions in the Testing & Assurance Standard.
- Severity is based on user/business impact, not implementation difficulty.
- A record remains open until its status is `Closed` and verification/closure evidence is recorded.
- `Fix in review` is still open for Founder Assurance counting.
- P0/P1 must not be silently downgraded or closed without evidence that the affected control/journey is restored.
- Lower-severity cosmetic/minor maintenance findings may be tracked elsewhere and do not enter Founder P0/P1/P2 counts.
- A valid empty register after deliberate triage means zero **known** open P0/P1/P2 defects; it does not claim that undiscovered defects cannot exist.
- Update this register in the governed fix PR when a known defect changes state. Historical incidents/audits remain historical evidence and must not be rewritten.

## Current defects

| Defect ID | Severity | Affected journey / control | Observed evidence | Status | Owner / next action | Fix PR | Verification / closure evidence |
|---|---|---|---|---|---|---|---|
| DEF-2026-001 | P2 | A11Y-01; signed-in global navigation/account drawer | Axe WCAG A/AA CI run #339 found serious `aria-hidden-focus`: the closed `.menu-drawer` remained keyboard-focusable on phone, tablet and desktop | Fix in review | Engineering — make the closed drawer inert; require expanded accessibility regression to pass before closure | #66 | Pending exact-head CI after fix |

## Triage note — 2026-08-19

The foundation stabilisation review established this register as Revision's durable P0/P1/P2 source. At creation, DEF-2026-001 is the only known open P0/P1/P2 defect from the current stabilisation work. The register will be reconciled again before PR #66 is ready for Founder merge approval.

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
| DEF-2026-001 | P2 | A11Y-01; signed-in global and learner-runtime account/menu drawers | Axe WCAG A/AA CI run #339 found serious `aria-hidden-focus` on the closed `.menu-drawer`; expanded run #359 confirmed the same issue on `.menu-drawer` and `.runtime-menu-drawer` across phone, tablet and desktop | Fix in review | Engineering — conditionally render both drawers only while open so closed focusable controls are absent from the DOM; require the expanded accessibility journey to pass before closure | #66 | Pending exact-head CI after both drawer fixes |
| DEF-2026-002 | P2 | A11Y-01; learner-runtime desktop primary navigation | Expanded axe CI run #367 found serious `color-contrast` failures for inactive Home, Plan and Progress controls on the white runtime desktop header during Practice | Fix in review | Engineering — align runtime desktop navigation with the approved white-header deep-ink/indigo treatment and WCAG 2.2 AA contrast requirement | #66 | Pending exact-head expanded accessibility CI after contrast fix |

## Triage note — 2026-08-19

The foundation stabilisation review established this register as Revision's durable P0/P1/P2 source. Two known P2 accessibility defects are currently in review on PR #66. DEF-2026-001 covers the shared hidden-drawer interaction defect; DEF-2026-002 is recorded separately because the desktop-navigation contrast failure has a different root cause and corrective action. Both remain open until exact-head automated accessibility evidence verifies the relevant fixes.

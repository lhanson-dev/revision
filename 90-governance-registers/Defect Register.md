# Defect Register

**Status:** Active current-state register  
**Defect register version:** 1  
**Last triaged:** 2026-08-21  
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
| DEF-2026-001 | P2 | A11Y-01; signed-in global and learner-runtime account/menu drawers | Axe WCAG A/AA CI run #339 found serious `aria-hidden-focus` on the closed `.menu-drawer`; expanded run #359 confirmed the same issue on `.menu-drawer` and `.runtime-menu-drawer` across phone, tablet and desktop | Closed | Engineering — both drawers now render only while open, so closed focusable controls are absent from the DOM | #66 | Revision CI #381 on PR #66 head `ec11bbd596e475d597331510136babe1b1124c4c` passed the expanded phone/tablet/desktop WCAG A/AA browser suite |
| DEF-2026-002 | P2 | A11Y-01; learner-runtime desktop primary navigation | Expanded axe CI run #367 found serious `color-contrast` failures for inactive Home, Plan and Progress controls on the white runtime desktop header during Practice | Closed | Engineering — runtime desktop navigation now uses the approved high-contrast deep-ink/indigo treatment | #66 | Revision CI #381 on PR #66 head `ec11bbd596e475d597331510136babe1b1124c4c` passed the expanded phone/tablet/desktop WCAG A/AA browser suite |
| DEF-2026-003 | P1 | PTL-02 / PTL-03; governed path from approved `main` changes to production | `main` commit `d960c950f4620dd469888a1174af582524706ec2` had `revision/path-to-live = failure`; Pages run `32432017259` failed governed release lineage because PR #84 had no Founder approval marker for exact head `754077b40c7ca6fac40117629b97d576285fdc58`, so backend readiness, build, deploy and production smoke were skipped. Recent merged PRs #75, #77, #81 and #82 also had terminal path-to-live failure. | Closed | Engineering / AI operating system — approval evidence handoff repaired; one-time governed recovery checkpoint established; continue using the exact-head Founder marker sequence prospectively | #85 | PR #85 exact head `077b3f36eb1b32b01ab55aac35ce41e7e36ca9e2` passed Revision CI #536. Founder approval marker was then persisted and verified before exact-head merge. Merge commit `f5e2b312c4187fb550a63a1b92a5de431077e7d3` completed Pages run `32456337760`: governed lineage, production backend readiness, build, deploy, production smoke and durable `revision/path-to-live = success` all passed. |

## Triage note — 2026-08-19

The foundation stabilisation review established this register as Revision's durable P0/P1/P2 source. DEF-2026-001 and DEF-2026-002 were both discovered by the new automated accessibility gate, corrected in PR #66 and closed only after exact-head Revision CI #381 passed the complete responsive WCAG A/AA journey across phone, tablet and desktop.

## Triage note — 2026-08-21

A full path-to-live assurance review found the production release chain unhealthy while an older safe deployment remained available. This matched the Testing & Assurance Standard's P1 example for an unhealthy production deployment with an older safe version still available, so DEF-2026-003 was opened.

PR #85 repaired the approval-to-GitHub evidence handoff and introduced a one-time, explicitly documented release-lineage recovery checkpoint rather than fabricating historical approval evidence. After exact-head CI and Founder approval evidence were verified, PR #85 merged as `f5e2b312c4187fb550a63a1b92a5de431077e7d3`. Production run `32456337760` then passed governed lineage, backend readiness, build, deployment, production smoke and durable path-to-live status publication. DEF-2026-003 is therefore closed with zero known open P0/P1/P2 defects at this triage point.

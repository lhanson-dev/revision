# FI-002 — Subscription Tier Placement Follow-up

**Document type:** product-management follow-up / implementation reminder  
**Authority:** non-authoritative FI-002 backlog input  
**Feature:** FI-002 — Subscription Plans / Feature Entitlements and Upgrade Journey  
**Captured:** 2026-08-23  
**Source:** Founder Design Acceptance discussion originally recorded on superseded PR #127  
**Lifecycle relationship:** FI-002 remains `Analyse`; this record does not grant `Ready` or implementation approval.

## Purpose

Preserve one useful FI-002 experience proposal from the superseded 22 August Design Acceptance review so it is explicitly reconsidered during subscription implementation rather than being lost when PR #127 is closed.

## Founder proposal to carry forward

When Revision has a truthful production subscription/entitlement source, the compact authenticated learner account treatment should consider showing the learner's **current subscription tier directly beneath the learner name**.

Working conceptual labels remain **Free / Paid / Premium** until customer-facing plan names are separately approved.

The intent is to make current-plan visibility immediate and low-friction rather than forcing the learner to open a deeper account or billing screen merely to understand their current tier.

## Why this belongs with FI-002

Approved FI-002 authority already requires **current-plan visibility**, but the exact learner-facing placement is not yet governed. Current Global Learner Navigation authority defines the compact account control as avatar/initial plus learner name only.

Therefore this follow-up is an FI-002 design input, not permission to change the production shell now.

## Implementation pickup requirement

Before FI-002 is recommended `Ready`, and again when its learner-facing subscription experience is implemented, explicitly disposition this proposal:

- decide whether current tier should appear beneath the learner name in the compact account control;
- confirm the treatment against the then-current Global Learner Navigation and account experience authority;
- use actual subscription/entitlement state rather than hard-coded, inferred or simulated paid status;
- ensure Free, Paid and Premium/customer-facing names come from the governed commercial model rather than local UI constants;
- preserve accessible hierarchy and responsive behaviour in desktop and tablet/mobile account treatments; and
- if the permanent shell treatment changes what navigation/account authority says should be true, amend that authority in the same governed change before implementation.

If analysis concludes another placement gives materially better clarity, the proposal may be rejected or superseded deliberately, but it must not disappear by omission.

## Relationship to PR #127 and PR #131

PR #127 originally recorded this placement proposal during the first Design Acceptance review. The review itself was superseded by merged PR #131, while the Courses proposal was separately governed/delivered through PRs #129/#130 and the surviving technical-documentation correction is explicitly retained by PR #131 DAR-006.

PR #131 did not preserve this specific subscription-tier placement proposal. This follow-up therefore carries only that surviving FI-002 input forward so PR #127 can be closed without losing it.

## Documentation-impact check

This file changes no normative product, navigation, commercial or technical authority and changes no implementation. It is supporting backlog evidence for an already-active FI-002 feature.

When the placement is eventually approved, rejected or superseded through FI-002, update the applicable normative authority and implementation documentation rather than rewriting the historical Design Acceptance audits.
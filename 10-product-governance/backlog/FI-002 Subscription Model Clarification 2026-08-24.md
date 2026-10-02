# FI-002 — Subscription Model Clarification — 24 August 2026

**Document type:** product-management analysis increment  
**Authority:** non-authoritative Definition-of-Ready analysis  
**Feature:** FI-002  
**Lifecycle state:** Analyse  
**Owner:** Product / Founder  
**Implementation status:** Not started — this record does not grant `Ready` approval.

## Purpose

Record the Founder-approved direction developed on 24 August 2026 so FI-002 can continue without blocking the initial Student solution and without losing the agreed Parent and Teacher/School commercial architecture.

The normative proposal is captured in `10-product-governance/Subscription Plans and Entitlements v0.5 Amendment.md`.

## Agreed clarification

### 1. Student-first independence

FI-002 must not become a dependency for proving the initial Student experience.

The Student product must remain fully testable on Free with the core Student persona and no Parent, Teacher or School relationship.

Subscription architecture should be designed so later entitlement controls can be introduced without forcing the Student journey to wait for billing, Parent or Teacher/School implementation.

### 2. Clear entitlement differences

Every material Free / Paid / Premium difference must be expressed as either:

- a named capability; or
- a defined user-meaningful allowance.

Vague entitlement language such as `deeper`, `richer`, `more` or `advanced` is not sufficient on its own.

Premium must still contain at least one qualitatively different capability and must not be only Paid with larger numeric limits.

### 3. Numeric limits remain adjustable

Exact allowance values should be approved later from value, usage, cost and conversion evidence.

The entitlement architecture must allow those values to change through governed configuration/authority updates without redesigning each underlying product feature.

### 4. User and payer model

The canonical user types are Student, Parent and Teacher.

School is an organisation.

Payer is a commercial responsibility that may belong to an eligible adult Student, Parent, Teacher or School depending on the commercial route.

### 5. Independent consumer and education routes

Student/Parent and Teacher/School are independent commercial routes.

A Student may use Free independently, receive a Parent-funded Student subscription, or later receive School-funded entitlements. A Student must not require both routes.

Teacher/School adoption must not depend on asking Parents to pay for Student capability needed for ordinary Teacher/School participation.

### 6. Parent direction

A linked Parent should have a useful Free Parent view.

Where a Parent pays, the Parent funds the Student subscription rather than buying a conceptually separate Parent subscription. The linked Parent experience can then gain clearly named capabilities associated with the Student tier.

This is a material change from the earlier Paid/Premium-only Parent-dashboard assumption and therefore requires the proposed v0.5 authority amendment before it becomes main-branch authority.

### 7. Teacher/School direction

Teacher Free should prove the Teacher value proposition with one active class.

Teacher Paid should unlock multiple active classes plus named on-demand REV analysis capabilities.

Teacher Premium should add a qualitatively different proactive REV teaching-support capability, not merely higher limits.

A School is a separate organisation/payer route and may later fund Teacher/School capability and separately approved Student entitlements.

## FI-002 scope boundary

FI-002 remains the reusable entitlement/billing platform. It should not absorb the full Parent or Teacher/School product definitions.

Separate product workstreams own:

- Parent linking and Parent experience; and
- Teacher/School insight and teaching-support capability.

FI-002 must support their future entitlement needs without making either a prerequisite for the initial Student product.

## Readiness impact

This increment improves the commercial architecture but does not resolve all FI-002 Definition-of-Ready blockers.

Remaining work includes exact Student capability/allowance choices, approved numeric limits where evidence is sufficient, purchaser/legal mechanics, measurement, billing-provider implementation, assurance and production lifecycle handling.

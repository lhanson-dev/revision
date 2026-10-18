# FI-022 — Parent Experience and Linking

**Document type:** product-management feature record  
**Authority:** non-authoritative backlog material  
**Feature:** FI-022  
**Lifecycle state:** To Do  
**Captured:** 24 August 2026  
**Owner:** Product / Founder  
**Implementation status:** Not started  
**Authority context:** `10-product-governance/Subscription Plans and Entitlements v0.5 Amendment.md`

## Product decision

Founder direction on 24 August 2026 establishes that a Parent experience belongs in Revision as a separate product workstream and should not block the initial Student solution.

This records the human `New → To Do` decision. It does not constitute `Analyse → Ready` approval or permission to implement.

## Parent job

Help a Parent understand whether a linked Student is using Revision, how things are broadly going and where support may be useful without turning Revision into surveillance.

## Core direction

- Parent is one of Revision's three user types: Student, Parent and Teacher.
- A Parent may be a Payer, but `Parent` and `Payer` are not synonyms.
- A linked Parent should receive a useful Free Parent view.
- The Parent does not primarily purchase a separate Parent subscription; where a Parent pays, they fund the linked Student's Student subscription.
- The Student receives the corresponding Student entitlement.
- Parent Paid/Premium differences should be associated with the linked Student tier and defined as named capabilities or explicit allowances.
- Payment must not buy deeper access to private Student material merely because a higher tier is purchased.

## Linking routes to define

The feature must support at least:

1. **Student-led linking** — Student invites Parent → Parent creates/signs into Parent account → relationship accepted → Parent view becomes available according to the approved rules.
2. **Parent-led linking/purchase** — Parent creates account and may fund a Student subscription → invites Student → Student creates their own full Student account → Student completes canonical Student onboarding → Student accepts link → Student entitlement and Parent relationship become active.

The Parent must never create a reduced or substitute Student identity that bypasses Student account creation and onboarding.

## Subscription direction

The exact Parent entitlement matrix remains to be defined through Definition of Ready, but the feature must follow the subscription clarity principle:

- every tier difference is a named capability or defined allowance;
- Free is independently useful;
- Paid removes a meaningful constraint or unlocks a clear repeat-use Parent capability; and
- Premium must include a materially different capability, not merely more of the same.

Candidate directions for analysis include:

- **Free:** useful high-level linked Student view;
- **Paid-linked Student:** defined reporting/notification capabilities; and
- **Premium-linked Student:** separately named REV-supported Parent guidance capability where commercially and operationally viable.

Exact limits are deliberately not approved by this record and may be changed later through governed commercial decisions.

## Privacy boundary

The Parent feature must not automatically expose:

- Student REV conversation transcripts;
- private Student notes;
- raw individual answers or submitted work;
- detailed click-by-click activity surveillance; or
- safeguarding-sensitive information.

The Student must be able to see who is linked and understand what the Parent can and cannot see.

## Student-first sequencing rule

FI-022 must not block agreement, implementation or testing of the initial Student experience. The core Student flow must remain fully testable on Free with no Parent account or Parent link.

## Definition-of-Ready areas

Before `Ready`, resolve at minimum:

- exact Free Parent view;
- Paid and Premium named capabilities/allowances;
- linking, acceptance, expiry, recovery and unlinking UX;
- Parent-led purchase and Student entitlement activation;
- Student transparency and privacy/safeguarding rules;
- age/legal requirements;
- measurement and Parent-value hypothesis;
- assurance and abuse/access tests;
- technical relationship/data model; and
- documentation changes to journeys, authentication, privacy and subscription authority.

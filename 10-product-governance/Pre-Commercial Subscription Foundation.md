# Pre-Commercial Subscription Foundation

**Status:** Approved active authority  
**Owner:** Product / Founder  
**Feature:** FI-022 — Learner Plan State Foundation  
**Purpose:** Define the deliberately minimal subscription-plan capability Revision needs while the core Student product is being built and tested, before real billing, paywalls and upgrade enforcement are introduced through FI-002.

## Founder direction

Founder direction on 24 August 2026 establishes a deliberate sequencing rule:

- Revision needs the **concept and durable state of subscription tiers now**;
- a newly registered Student should begin on **Free**;
- a permitted Founder/Admin operation should be able to assign a Student one of the three conceptual tiers: **Free, Paid or Premium**;
- during core Student-product development and testing, **Free receives the same currently implemented learner-facing product access as Paid and Premium**;
- Stripe/payment integration, real paid purchase, paywalls, locked capabilities and the production upgrade journey are deferred until the core Student product is implemented; and
- the later FI-002 commercial implementation will make the approved tier differences real without requiring Revision to retrofit plan identity into every feature.

This is a pre-commercial foundation, not an early commercial launch.

## Relationship to existing subscription authority

`Subscription Plans and Entitlements.md` remains the product authority for Revision's approved long-term Free / Paid / Premium value ladder and FI-002 commercial model. `Pricing and Billing Policy.md` remains the source of truth for the already approved launch price points and billing cadence. `Subscription Billing Architecture.md` remains the approved target Stripe boundary for the later billing implementation.

Those sources describe a broader FI-002 MVP than Revision should implement while the core Student product is still being established. This document resolves the sequencing conflict created by the 24 August Founder direction:

- **FI-022 now:** establish trustworthy learner plan identity and controlled manual assignment only;
- **FI-002 later:** implement real package entitlements, upgrade discovery, purchase/billing, lifecycle handling, payer/supporter relationships and commercial operation.

FI-022 does not mark FI-002 Ready, does not reduce FI-002's eventual responsibilities, and does not change approved launch prices or the future Stripe provider decision.

## Approved conceptual tiers

The internal tier identifiers are:

- `free`
- `paid`
- `premium`

These identifiers represent the approved conceptual tier architecture. They do **not** approve final customer-facing plan names.

## Registration default

Every new Student account must resolve to a durable **Free** learner plan unless a later governed commercial flow has valid authority to establish another tier.

For FI-022, registration itself must not ask the Student to choose a paid tier, collect payment information or interrupt GJ-01 with a commercial decision.

Existing Student accounts introduced before FI-022 should receive a bounded compatibility default of Free rather than being left without a plan state.

## Pre-commercial all-access rule

While Revision is testing and completing the core Student product, plan tier must **not restrict any currently implemented core learner-facing capability**.

| Learner capability currently implemented | Free | Paid | Premium |
|---|---|---|---|
| Core Student product access | Full | Full | Full |
| Educational truth / evidence / progress semantics | Identical | Identical | Identical |
| Safety and accessibility | Identical | Identical | Identical |

The temporary mapping is:

`free | paid | premium → current core Student capability set`

The plan state is real; differentiated entitlements are not yet active.

This temporary rule must not be mistaken for final commercial packaging. FI-002 will later replace the all-access mapping with the governed package-to-entitlement model once the core Student product and commercial implementation are ready.

## Plan state is not educational evidence or permission

Learner plan state is commercial/account context only. It must not become:

- learning evidence;
- mastery, proficiency or readiness evidence;
- a score or grade input;
- Student/Parent/Teacher primary-experience routing;
- administrator authorization;
- payer identity;
- linked-supporter permission; or
- permission to view another person's learner data.

Changing a tier must never rewrite legitimate learner work or educational evidence.

## Data and trust boundary

The canonical plan state must be **server-controlled durable application data**. It must not rely on browser-local state or user-editable authentication metadata.

The implementation uses a dedicated learner-plan state boundary rather than overloading `public.profiles`, whose responsibility remains server-owned account classification such as test-user and administrator state.

Conceptually:

```text
Authenticated Student
       |
       v
Durable learner plan state
  free | paid | premium
       |
       v
Central plan / entitlement resolver
       |
       v
Pre-commercial mapping: full current Student access
```

The later FI-002 billing projection must be able to become an authoritative input to this resolver without requiring educational features to adopt scattered plan-name checks.

## Manual Founder/Admin assignment

FI-022 provides a protected operational mechanism through which an authorised Founder/Admin can assign a Student to Free, Paid or Premium for testing and product-development purposes.

Requirements:

- ordinary learners cannot assign or elevate their own tier;
- a browser-visible control is not sufficient authorization by itself;
- the write must pass through an authenticated server-controlled Admin boundary;
- the target Student and requested tier must be validated;
- the assignment must record sufficient audit information to explain who changed the tier and when; and
- changing tier must not grant Admin rights, supporter rights or other unrelated permissions.

This manual operation is a testing/operations capability. It is not a substitute for the future payer/checkout flow.

## Missing or invalid state

A missing or invalid learner plan is an integrity condition and must be surfaced to Founder/Admin assurance.

During the pre-commercial all-access phase, a state-resolution failure must not strand a legitimate Student behind a false paywall. The safe learner-facing fallback is Free/full-current-core access while the integrity issue is reported for remediation.

This fail-safe is specific to the temporary phase where Free itself has full core access. FI-002 must deliberately revisit failure behaviour before differentiated paid entitlements become active.

## Centralisation rule

FI-022 must not introduce feature-specific code such as:

```text
if plan == "premium" ...
```

throughout learning features merely to prove tier state exists.

The implementation exposes one deliberate plan/entitlement resolution boundary. For the current phase all three plans resolve equivalently. Later FI-002 may change package mappings and allowances behind that boundary.

## Learner experience

FI-022 is almost invisible to the Student:

- registration defaults the Student to Free without adding a commercial onboarding step;
- GJ-01 remains focused on first useful revision;
- no Stripe checkout, pricing modal, upgrade prompt or locked-feature state is introduced by FI-022; and
- the learner may see their current tier later where useful, but plan-management UX is not required to prove this foundation.

## Measurement and Founder assurance

The foundation requires operational integrity evidence rather than a commercial conversion funnel.

Founder/Admin assurance must be able to establish at minimum:

- that new Students receive Free plan state;
- population by Free / Paid / Premium where useful for testing;
- whether any Student lacks valid plan state;
- whether manual assignments succeed/fail; and
- who performed a material manual assignment where audit is required.

Commercial funnel events such as upgrade intent, checkout conversion, churn or payment failure belong to FI-002 and are deliberately excluded here.

## Deliberate exclusions

FI-022 does **not** implement or approve:

- Stripe API integration;
- checkout or payment collection;
- card storage or payment-method handling;
- real subscription contracts or invoices;
- billing cadence selection;
- paid renewal, cancellation, failed-payment, grace or refund behaviour;
- payer accounts or supporter relationships;
- parent/supporter dashboards;
- capability locks or paywalls;
- differentiated quantitative allowances;
- learner-facing upgrade prompts;
- plan-comparison or pricing UI;
- trials, discounts, coupons or promotions; or
- final customer-facing tier names.

These remain governed by FI-002 and its associated product, commercial, privacy, journey and technical authority.

## Sunset / supersession rule

The pre-commercial all-access rule is intentionally temporary.

Before Revision activates real differentiated paid access, FI-002 must be Ready and its governed implementation must explicitly replace or supersede:

- the all-tiers-full-access mapping;
- manual assignment as the primary way a learner reaches Paid/Premium;
- the temporary missing-state fail-safe where differentiated entitlement security requires a stronger failure mode; and
- any testing-only operational assumptions introduced by FI-022.

Historical evidence that Free had full access during development must not be rewritten after commercial launch.

## Implementation status and documentation impact

PR #157 integrated this authority into approved `main` on 24 August 2026. FI-022 implementation is governed separately through PR #159.

The production backend dependency was enabled on 24 August 2026 using migration `20260824165737_add_learner_plan_state` and the protected `learner-plan-operations` function. Production availability of the governed application change remains dependent on PR #159 merge and successful `revision/path-to-live` evidence.

Current technical implementation evidence lives in `docs/technical/Learner Plan State Implementation.md`. The backend-readiness contract and assurance coverage must remain aligned with the implementation. This authority does not change approved launch pricing or the later Stripe billing target.

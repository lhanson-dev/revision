# ADR-0014 — Stripe subscription billing architecture

**Status:** Accepted  
**Date:** 2026-08-21

## Context

FI-002 requires a subscription provider and billing architecture that can support Revision's Founder-approved Free / Paid / Premium model, monthly and annual billing, adult payer accounts, learner entitlements and separately permissioned supporter access.

The product authority deliberately separates three concepts:

- the **learner**, who owns learning work and educational evidence;
- the **billing customer / payer**, who owns the commercial subscription relationship; and
- the **linked supporter**, who may receive separately governed access to the parent/supporter dashboard.

The billing provider therefore cannot become the authorization source for learner information. Payment may fund an entitlement, but it must not imply supporter permission.

Revision's current application and data stack is React, TypeScript and Supabase. Engineering authority requires external/platform integrations to sit behind clear service interfaces, privileged credentials to remain server-side, RLS to protect learner-owned data and auth/ownership controls to be tested.

The approved launch prices also create a constrained commercial envelope. The provider choice should therefore minimise unnecessary transaction overhead for the initial UK launch while leaving a credible route to reduce international tax/compliance burden if Revision later expands materially outside the UK.

## Decision

Use **Stripe Payments + Stripe Billing** for the initial UK FI-002 subscription architecture.

Revision will remain the merchant for the direct UK launch model. Initial purchase should use **Stripe-hosted Checkout**, and ordinary payer subscription management/cancellation should use the **Stripe Billing Customer Portal** where it can satisfy the governed Revision experience and legal requirements.

Stripe is the external source of financial-transaction and provider-subscription truth. Revision will maintain a server-controlled local projection of the billing state required to resolve entitlements and operate the product.

The conceptual flow is:

`adult payer → Stripe Customer → Stripe Subscription`

`Stripe subscription event → verified server-side webhook boundary → local subscription projection → entitlement resolution → learner capability`

The supporter permission path remains separate:

`learner ↔ governed supporter relationship → supporter authorization`

A Stripe Customer, payment, invoice or subscription identifier must never by itself authorize access to learner progress, REV interactions, private work or the parent/supporter dashboard.

## Provider boundary

For FI-002 MVP:

- Stripe Payments and Stripe Billing are the approved provider services;
- Stripe-hosted Checkout is the preferred initial checkout surface;
- Stripe Billing Customer Portal is the preferred payer self-service billing surface;
- card/payment credentials are held by Stripe rather than Revision;
- Stripe secret keys and webhook secrets remain server-side only;
- provider calls must sit behind a Revision service boundary rather than being scattered through UI components; and
- the learner entitlement system consumes a verified local subscription projection rather than treating browser state or direct Stripe responses as authority.

The exact Supabase table schema, Edge Function names, status mapping, cache design and production configuration remain Definition-of-Ready and implementation work.

## Billing-event integrity

The implementation design must support:

- cryptographic verification of Stripe webhook signatures;
- idempotent event processing using durable provider event identity;
- safe handling of duplicate, delayed and out-of-order events;
- a durable processing/audit record for material billing transitions;
- explicit mapping from provider subscription state to Revision's local commercial state;
- periodic reconciliation with Stripe so a lost webhook cannot leave a stale entitlement indefinitely;
- fail-safe handling where billing state is ambiguous or verification fails; and
- assurance that downgrade, cancellation, expiry or payment failure never deletes learner work or rewrites educational evidence.

Exact lifecycle semantics for retries, grace periods, refunds, cooling-off, upgrade/downgrade timing and renewal notices remain separately unresolved FI-002 work.

## Data-minimisation and authorization consequence

Revision should send Stripe only the information needed to operate the payer's commercial relationship. Private learner educational information is not payment data and must not be transmitted merely because a learner is funded by that payer.

Billing identifiers, supporter-relationship identifiers and learner identifiers must remain conceptually distinct even where one person holds multiple roles.

RLS and server-side authorization remain responsible for Revision-owned learner and supporter data. Stripe cannot substitute for those controls.

## Internationalisation option

Stripe Managed Payments may be considered later as a selective merchant-of-record route for supported non-UK markets or products where international tax, fraud, dispute and transaction-compliance burden justifies the additional provider cost and operating trade-offs.

This ADR does **not** approve Managed Payments for the UK launch and does not require Revision to use it in any future market. Any material change in merchant-of-record model, provider responsibility or customer-facing pricing remains a separately governed decision.

## Commercial and tax consequence

Provider implementation must preserve the Founder-approved customer-facing prices in `60-business-operations/Pricing and Billing Policy.md`. Provider fees or tax mechanics must not silently alter those prices.

For FI-002 unit-economics analysis, the approved prices should be stress-tested on a VAT-inclusive basis using the prevailing standard UK VAT rate as a conservative planning scenario. This is a modelling assumption, not a legal determination that Revision is currently VAT-registered or that every transaction has a particular tax treatment.

Actual VAT registration, product tax classification, invoice wording, Stripe Tax/Managed Payments configuration and accounting treatment require current legal/accounting validation before production reliance.

## Alternatives considered

### Paddle / merchant-of-record first

A merchant-of-record provider can reduce indirect-tax and transaction-compliance operating burden, but it introduces materially higher provider cost and gives the provider a broader role in the customer transaction than Revision currently needs for a UK-first launch.

It remains a credible future alternative if Revision's international operating burden later outweighs the cost/control trade-off.

### Stripe Managed Payments from launch

Managed Payments can reduce merchant-of-record complexity within the Stripe ecosystem, but using that model from the UK launch would add cost and responsibility transfer before Revision has demonstrated the need. The direct Stripe model is therefore preferred initially.

### Custom payment handling

Rejected. Revision should not store or directly handle card credentials when hosted, established payment infrastructure is available.

## Consequences

Positive consequences:

- provider choice is resolved for FI-002 analysis;
- the architecture fits the existing React/Supabase service-boundary model;
- payer billing can be separated cleanly from learner/supporter authorization;
- hosted checkout and portal surfaces reduce payment-data exposure and initial operational complexity;
- local entitlement state can be made resilient to webhook loss through reconciliation; and
- Revision retains a plausible future Stripe-native merchant-of-record path for international expansion.

Trade-offs and remaining work:

- Revision remains responsible for the UK merchant relationship and associated legal/tax/accounting obligations under the direct model;
- hosted provider surfaces still require experience, accessibility and legal review before production use;
- exact local schema and lifecycle mappings remain unresolved;
- provider pricing and capabilities must be revalidated before implementation because they can change; and
- FI-002 remains `Analyse` until the remaining Definition-of-Ready decisions and assurance contract are resolved.

## Documentation impact

This decision is documented in `docs/technical/Subscription Billing Architecture.md`, reflected in `docs/technical/Technology Stack.md`, linked from `INDEX.md` and recorded in the FI-002 analysis record.

No production Stripe account configuration, Supabase schema, webhook handler, checkout code, entitlement code or `Analyse → Ready` transition is approved by this ADR.

# Subscription Billing Architecture

**Status:** Approved target architecture for FI-002 analysis — not implemented  
**Decision:** `decisions/ADR-0014-stripe-subscription-billing-architecture.md`  
**Feature:** FI-002  
**Provider:** Stripe Payments + Stripe Billing for the initial UK launch

## Purpose

Describe the approved technical boundary for subscription billing while FI-002 remains in `Analyse`.

This document does not describe current production billing behaviour. Revision does not yet have a production subscription implementation, and material implementation must not begin until FI-002 reaches explicit human-approved `Ready`.

## Governing product model

Billing must implement, not redefine, the approved product authorities:

- `10-product-governance/Subscription Plans and Entitlements.md` governs tier, entitlement and learner/payer/supporter policy;
- `60-business-operations/Pricing and Billing Policy.md` governs launch prices, billing cadence, trial baseline and price presentation;
- `40-evidence-and-trust/Privacy and Student Data Principles.md` governs learner-data boundaries; and
- `50-engineering-standards/Security Standard.md` governs credential, RLS and authorization controls.

The critical identity rule is:

**billing responsibility is not learner-data permission.**

A payer may fund a learner's subscription without receiving supporter access. A supporter may receive governed parent/supporter access only through a valid supporter relationship and the relevant entitlement.

## Approved provider boundary

### Initial UK launch

Use:

- Stripe Payments;
- Stripe Billing;
- Stripe-hosted Checkout for initial subscription purchase where it satisfies the final governed journey;
- Stripe Billing Customer Portal for ordinary payer billing management/cancellation where it satisfies the final governed journey; and
- server-side Stripe API/webhook integration behind a Revision service boundary.

Revision remains the merchant in this launch model.

### Future option

Stripe Managed Payments may be evaluated later as a selective merchant-of-record option for supported international markets/products. It is not part of FI-002 MVP and does not change the approved UK launch model.

## Responsibility model

### Stripe owns external financial truth

Stripe is authoritative for provider-side facts such as:

- Stripe Customer identity;
- payment method state;
- successful/failed payment transactions;
- Stripe Subscription identity and provider lifecycle state;
- invoices and provider billing records; and
- provider-generated billing events.

Revision must not duplicate raw card/payment credentials.

### Revision owns product entitlement truth

Revision owns the application-side interpretation required to decide what the learner may use. That interpretation is derived from verified billing evidence plus Revision's own package/entitlement rules.

The application should therefore use a local, server-controlled subscription projection rather than querying Stripe ad hoc from learner UI components.

Conceptually:

```text
Adult payer
   |
   v
Stripe Customer
   |
   v
Stripe Subscription
   |
   | signed provider events + reconciliation
   v
Revision billing service boundary
   |
   v
Local subscription projection
   |
   v
Package / entitlement resolution
   |
   v
Learner capability access
```

Supporter permission remains a parallel Revision-owned authorization path:

```text
Learner <---- governed supporter relationship ----> Supporter account
                           |
                           v
                 Parent/supporter authorization
```

The two paths may reference the same adult account but must not collapse into one permission model.

## Service boundary

Stripe integration belongs in Revision's `services` / external-platform boundary, consistent with `50-engineering-standards/Architecture Principles.md`.

Production implementation should expose deliberate application interfaces for operations such as:

- create checkout session;
- create or locate payer billing customer;
- create customer-portal session;
- consume/verify provider events;
- reconcile provider subscription state;
- resolve the local subscription projection; and
- translate local subscription state into entitlement inputs.

Exact function/module names are not approved by this document.

The learner-facing React application must not contain Stripe secret credentials or use privileged provider APIs directly.

## Checkout architecture

Initial purchase should prefer Stripe-hosted Checkout because it reduces the amount of payment-sensitive UI and card-data handling Revision must operate directly.

Before implementation, the final checkout journey must still resolve:

- adult payer declaration/age-assurance implementation;
- exact legal and renewal wording;
- learner-led versus adult-led handoff state;
- successful/cancelled checkout return routes;
- VAT/tax display requirements;
- accessibility and mobile behaviour;
- duplicate/retried checkout handling; and
- safe recovery where payment succeeds but the local entitlement projection is delayed.

A successful browser redirect is not sufficient evidence to grant entitlement. Entitlement should derive from verified server-side billing state.

## Customer portal architecture

The Stripe Billing Customer Portal is the preferred starting point for payer self-service management of:

- payment methods;
- billing history/invoices where applicable;
- cancellation; and
- supported subscription-management actions.

Revision must still provide its own application view of material subscription state where required by the product journey, including current tier, cadence, renewal state and next material billing event.

Portal capabilities and configuration must be revalidated at implementation time. Revision must not expose an action through the portal if it conflicts with the final governed upgrade/downgrade/refund/cancellation policy.

## Webhook trust boundary

Stripe webhooks are untrusted inbound network requests until verified.

The implementation must:

1. receive the original request body at a server-side endpoint;
2. verify the Stripe signature using a server-held webhook secret;
3. reject invalid or unverifiable events;
4. persist enough durable event identity/state to make processing idempotent;
5. process duplicate events without duplicating commercial effects;
6. tolerate delayed and out-of-order delivery;
7. update the local subscription projection through deterministic state-transition logic; and
8. record material failures for operational assurance.

A provider event must not write learner educational evidence.

## Reconciliation

Webhooks are the fast update path, not the only correctness mechanism.

Revision should periodically reconcile material active/recent subscription state with Stripe so that:

- a missed webhook cannot leave an entitlement permanently stale;
- ambiguous local/provider mismatches can be surfaced;
- cancellation/expiry/payment-recovery state can be repaired deterministically; and
- Founder/Admin assurance can distinguish healthy state from unresolved billing drift.

Exact reconciliation frequency, scope and implementation remain unresolved until the lifecycle model and expected scale are known.

## Local data responsibilities

FI-002 implementation will require a local commercial data model, but the exact schema is not approved yet.

The eventual model must be capable of representing separately:

- Revision payer/account identity;
- external Stripe Customer identity;
- external subscription identity;
- purchased commercial package/price identity;
- provider lifecycle state and relevant effective dates;
- Revision's derived entitlement-effective state;
- durable provider-event processing identity/status;
- reconciliation status/errors; and
- the separate learner-supporter relationship and its authorization state.

Do not use Stripe Customer ID, subscription ID or payment status as the primary key for learner authorization.

Database and RLS design must preserve the approved learner/payer/supporter separation.

## Entitlement refresh and cache boundary

The entitlement system must be able to reflect material billing changes promptly without trusting only browser-local state.

The detailed refresh/caching design remains unresolved, but implementation must ensure:

- server-side protected capabilities evaluate effective entitlement;
- stale caches have bounded lifetime or explicit invalidation after material transitions;
- upgrade/downgrade/cancel/payment-failure changes cannot remain silently stale indefinitely; and
- payer/supporter relationship changes invalidate supporter access independently of the billing cache.

## Payment lifecycle boundary

This architecture establishes the provider and event plumbing but does not yet approve the business semantics for every provider state.

Before FI-002 is `Ready`, Revision must define explicit behaviour for at least:

- initial subscription activation;
- upgrade;
- downgrade;
- cancellation at period end;
- cancellation/termination effective immediately where legally/operationally applicable;
- expiry;
- payment failure;
- retry and grace state;
- payment recovery;
- refund/cooling-off;
- chargeback/dispute consequence where relevant; and
- provider/customer mismatch recovery.

The provider's default behaviour must not silently become Revision product policy.

## Security and privacy

Non-negotiable controls include:

- Stripe secret/API keys and webhook secrets stored only in server-side secret configuration;
- no secret provider credentials committed to Git or shipped to the browser;
- no raw card data stored in Supabase;
- least-privilege provider credentials where supported;
- no unnecessary learner educational information sent to Stripe;
- logs/telemetry must not expose secrets, payment credentials or unnecessary sensitive learner information;
- Supabase RLS/authorization governs Revision-owned learner/supporter data; and
- automated tests must prove relevant auth/ownership boundaries before production implementation can be considered complete.

## Commercial configuration

The initial architecture must be capable of representing the four Founder-approved paid price/cadence combinations:

- Paid monthly — £6.99/month;
- Paid annual — £59.99/year;
- Premium monthly — £12.99/month; and
- Premium annual — £109.99/year.

The exact Stripe Product/Price object structure and identifiers are implementation configuration, not authority. They must map unambiguously to Revision's stable internal package/entitlement model rather than encouraging plan-name conditionals throughout the application.

## VAT and tax planning boundary

The direct UK Stripe model leaves Revision responsible for determining and operating the applicable tax/accounting treatment.

The approved price points must not be silently changed by provider/tax implementation.

For unit-economics analysis, Revision should stress-test the approved consumer prices as VAT-inclusive at the prevailing standard UK VAT rate. This is deliberately conservative planning and is not evidence that Revision is currently VAT-registered or a substitute for legal/accounting advice.

Before production checkout, current VAT registration status, tax classification, invoice requirements and any Stripe Tax configuration must be validated.

## Operational assurance requirements

Before FI-002 can become `Ready`, the detailed assurance contract should define how Founder/Admin can detect at least:

- webhook verification/processing failures;
- repeated or dead-lettered billing events;
- provider/local subscription drift;
- entitlement state that does not match verified billing state;
- delayed entitlement activation after successful payment;
- failed payment/retry/grace populations;
- cancellation/renewal anomalies;
- payer/learner/supporter identity mismatches;
- supporter access continuing after relationship revocation; and
- material provider availability/configuration failures.

Thresholds, dashboards and alerting remain unresolved.

## Test obligations created by this architecture

The final implementation assurance plan must include, proportionate to the approved lifecycle design:

- valid and invalid webhook signatures;
- duplicate event replay;
- out-of-order event delivery;
- delayed/lost webhook repaired by reconciliation;
- checkout success without immediate local projection;
- local projection without valid provider evidence must fail safely;
- cancellation/downgrade preserves learner work;
- entitlement bypass attempts against server-side protected capability;
- payer without supporter permission cannot read learner dashboard data;
- supporter permission removal revokes learner-dashboard access even if the payer subscription remains active;
- stale entitlement/supporter cache behaviour;
- RLS/authorization boundary tests; and
- provider outage/recovery paths.

## Implementation status

No production billing implementation exists or is authorized by this document.

FI-002 remains `Analyse`. This target architecture becomes an implementation input only after the remaining Definition-of-Ready work is completed and the Founder explicitly approves `Analyse → Ready`.

## Documentation maintenance

Material changes to provider, merchant-of-record model, payment trust boundary, local/provider source-of-truth relationship or billing-to-entitlement architecture require a governed ADR/technical-document update.

Implementation changes must update this document and `docs/technical/Technology Stack.md` where the implemented stack changes. Historical ADRs must not be rewritten to conceal later architectural change.

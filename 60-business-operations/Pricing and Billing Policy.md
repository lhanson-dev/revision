---
title: "Revision Pricing and Billing Policy"
document_id: "revision-pricing-and-billing-policy"
document_type: "domain-authority"
authority: "business-operations"
status: "active"
version: "1.1"
owner: "Founder"
effective_date: "2026-08-21"
last_reviewed: "2026-08-21"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["FI-002 launch consumer prices", "subscription billing cadence", "subscription trial baseline", "consumer pricing presentation rules"]
depends_on: ["Subscription Plans and Entitlements", "Product UX Principles", "Product KPI Framework", "Privacy and Student Data Principles"]
supersedes: null
---
# Pricing and Billing Policy

## Purpose

Define the Founder-approved initial UK consumer pricing and billing policy for FI-002 without allowing pricing implementation to redefine the product value ladder, learner-data permissions or educational truth.

This authority governs the approved launch price points and billing cadence. Product tier capability and entitlement rules remain governed by `10-product-governance/Subscription Plans and Entitlements.md`.

## Approved launch price points

Founder decision on 21 August 2026:

`Approve FI-002 launch pricing and billing cadence`

The approved initial UK consumer price points are:

| Tier | Monthly | Annual | Annual equivalent |
|---|---:|---:|---:|
| Free | £0 | £0 | £0 |
| Paid | £6.99/month | £59.99/year | approximately £5.00/month / 16.4p/day |
| Premium | £12.99/month | £109.99/year | approximately £9.17/month / 30.1p/day |

The annual equivalent is an explanatory comparison, not the amount charged each month. The annual product is billed as one annual payment.

`Paid` and `Premium` remain conceptual tier labels until customer-facing plan names are separately approved. This authority approves the prices attached to those governed tier concepts, not final naming.

## Billing cadence

The FI-002 MVP should offer only:

- monthly billing; and
- annual billing paid upfront.

Three-month, four-month, termly, seasonal or other additional billing periods are outside the launch policy unless separately approved.

The annual option may be described as **Best value** where that statement remains accurate against the concurrently available monthly price.

The annual option must not be deceptively preselected or presented in a way that obscures the longer financial commitment.

## Consumer price presentation

Revision may lead visually with the annual daily equivalent because it can make the longer-term value easier to understand, provided the actual amount charged and billing period are equally clear and immediately available in the same pricing context.

An acceptable hierarchy may therefore use patterns such as:

**16p a day**  
Paid  
**£59.99 billed annually**

or:

**30p a day**  
Premium  
**£109.99 billed annually**

The equivalent daily or monthly figure must not:

- imply that the customer is charged daily or monthly when the chosen product is billed annually;
- be materially more prominent while the actual charge is hidden, remote or difficult to understand;
- conceal auto-renewal;
- conceal the billing period; or
- turn price framing into a misleading comparison.

Monthly pricing must remain available as the clear flexible alternative.

## Trial policy for FI-002 MVP

FI-002 should **not** launch with a card-required, auto-converting subscription trial.

Revision already has a governed Free tier intended to demonstrate genuine product value. Contextual previews, examples or bounded demonstrations may also explain higher-tier value where permitted by product authority.

This decision does not prohibit every future trial or demonstration mechanism. A future paid-tier trial, introductory offer or auto-converting trial requires a separate governed commercial decision covering learner value, conversion evidence, consumer transparency, operational complexity and applicable legal requirements.

## Renewal and cancellation baseline

Monthly and annual subscriptions may auto-renew only where that renewal is clearly disclosed before purchase and remains understandable during subscription management.

The launch design must support the following policy outcomes:

- cancellation is available online through a straightforward subscription-management route;
- cancellation does not delete legitimate learner work or educational evidence;
- where a subscription is cancelled for the end of the current paid period, the customer retains the corresponding paid entitlement until that paid period ends unless a separately governed refund or termination rule requires otherwise;
- annual subscribers receive a clear pre-renewal reminder before the next annual charge; and
- the billing customer can understand current tier, amount, billing cadence, renewal state and next material billing event.

Exact statutory wording, reminder timing, cooling-off/refund mechanics, failed-payment retries, grace periods and provider-specific lifecycle handling remain Definition-of-Ready work and must be validated against current applicable UK requirements before production implementation.

## Customer-facing price integrity

The values in this authority are the approved consumer price points for launch analysis and implementation design.

Exact VAT/tax registration, accounting and provider treatment remain operational and technical work. Those details must not silently change the customer-facing totals approved here. If tax or provider constraints require a different consumer price, that is a new Founder pricing decision rather than an implementation detail.

Do not add hidden mandatory fees at checkout that make the actual consumer charge materially different from the price communicated in the plan proposition.

## Commercial sustainability and AI allowances

These price points create the commercial envelope within which Paid and Premium must operate.

Founder decision on 21 August 2026 separately approved the internal FI-002 AI/REV cost envelope and cost-weighted allowance principle. The source of truth for those guardrails is `60-business-operations/AI Cost and Allowance Policy.md`.

That policy intentionally does **not** create a public message/day quota or approve an AI provider/model. Exact learner-facing REV/AI usage limits remain feature-specific Definition-of-Ready work, particularly for FI-003.

Commercial sustainability must still consider the combined effect of:

- payment/billing fees;
- applicable tax treatment;
- infrastructure and data costs;
- model/AI inference cost by material capability;
- expected support/refund/failure cost;
- expected monthly versus annual mix;
- realistic usage distributions rather than only averages; and
- sufficient margin headroom for sustainable operation.

Premium should not be launched merely because a Premium price now exists or because it has a larger AI cost envelope. The separate product rule remains that Premium requires a genuinely qualitative higher-tier learner proposition.

## Price and offer changes

Future changes to the approved consumer price points, available billing cadences or auto-converting trial policy require a governed commercial decision and PR.

This v1.1 authority does not yet decide:

- final customer-facing plan names;
- introductory discounts, coupons, referrals or promotional pricing;
- grandfathering or migration rules for future price changes;
- family or multi-learner pricing;
- gift subscriptions;
- exact refund/cooling-off policy;
- exact failed-payment retry or grace-period rules; or
- provider-specific tax and billing configuration.

## Measurement and Founder assurance

Pricing should be assessed using the governed tier funnel and not conversion alone.

Founder assurance should eventually make it possible to understand, where applicable:

- monthly versus annual plan selection;
- proposition view → checkout start → successful conversion;
- conversion by tier and cadence;
- failed checkout/payment rate;
- renewal, cancellation, downgrade and churn;
- annual renewal success/failure;
- use and retention of newly unlocked value;
- Free-tier engagement and retention;
- cost-to-serve and contribution by tier/cadence; and
- trust, complaints or abandonment signals caused by pricing or renewal presentation.

AI/REV variable-cost assurance must additionally follow `AI Cost and Allowance Policy.md` rather than being inferred from conversion or gross subscription revenue alone.

Concrete event names, dashboards and thresholds remain FI-002 Definition-of-Ready work.

## Documentation-impact rule

Material changes to launch prices, billing cadence, trial policy or consumer pricing-presentation rules must update this authority through a governed PR.

Changes to AI/REV cost envelopes or the cost-weighted allowance principle belong in `AI Cost and Allowance Policy.md`. Changes to what each tier provides belong in `10-product-governance/Subscription Plans and Entitlements.md`. Provider, schema and billing-runtime implementation detail belongs in `docs/technical/` and ADRs once approved. Historical analysis and evidence must not be rewritten to make later prices or cost rules appear to have been earlier policy.

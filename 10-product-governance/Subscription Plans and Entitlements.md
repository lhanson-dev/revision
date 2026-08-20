# Subscription Plans and Entitlements

**Status:** Draft authority candidate — v0.2  
**Owner:** Product / Founder  
**Purpose:** Define Revision's governed product policy for subscription tiers, entitlement behaviour and the minimum commercial capability required by FI-002.  
**Source decision:** FI-002 Subscription Plans / Feature Entitlements and Upgrade Journey. Founder-approved value ladder, entitlement policy, MVP boundary and tiered parent-dashboard model captured 2026-08-20.  
**Authority relationship:** This is the specific product authority for subscription-tier and entitlement behaviour. Exact prices, customer-facing plan names, numeric usage allowances, billing-provider selection, contracting-age policy and detailed purchaser/account architecture remain unresolved Definition-of-Ready decisions and are not approved by this document.

## Product outcome

Revision should support a sustainable paid model while preserving a genuinely useful Free product and keeping educational truth independent from payment status.

The commercial system should make it easy for a learner to understand:

- what they can use now;
- what stronger capability is available at a higher tier;
- why that additional capability may be useful in the learner's current context;
- which tier provides it; and
- how to compare or change plans without losing their existing learning work.

Where a parent or other approved payer funds a learner's subscription, Revision should also create legitimate value for that payer through a bounded parent/payer experience that supports reassurance and useful support rather than surveillance.

The entitlement system should allow packaging to evolve without scattering hard-coded plan checks throughout educational product logic.

## Governing value ladder

The product is designed around three conceptual tiers:

### Free — useful core intelligent Revision

**Job:** Let a learner experience Revision's real proposition, become organised and make meaningful revision progress without paying.

Free must demonstrate the central Revision loop rather than operate as a broken demo or content teaser.

### Paid — complete self-service Revision

**Job:** Provide the complete serious self-service revision system for a learner who wants to use Revision repeatedly as their main revision product.

Paid should materially increase usable depth, breadth, scale and convenience without repeatedly interrupting ordinary study with artificial restrictions.

Where a valid linked parent/payer relationship exists, Paid should also include a basic parent dashboard that answers whether the learner is engaging, making progress and broadly on track without exposing private learner interactions.

### Premium — deepest personalised REV / AI experience

**Job:** Provide the fullest personal-tutor-style Revision experience where greater intelligence, personalisation and higher variable cost create a defensible qualitative step up.

Premium must not exist merely as "Paid with larger limits". It should be actively sold only when separately approved capabilities give it a genuinely stronger proposition.

Where a valid linked parent/payer relationship exists, Premium should provide richer interpretation, trends and support guidance from the approved parent-visible dataset. Premium must not create a commercial right to progressively more private learner data.

The commercial ladder is therefore:

**Free proves that Revision understands and guides me.**  
**Paid gives me the complete system to revise properly and gives a linked parent/payer basic reassurance.**  
**Premium gives me the deepest personalised REV/AI support and gives a linked parent/payer richer support insight.**

## Cross-tier foundations that must remain correct

Payment status must not be used to degrade the foundations needed for a coherent and trustworthy learning product.

The following must remain correct across all tiers:

- educational truth and answer correctness;
- marks and scoring semantics;
- learning-evidence meaning and confidence;
- progress and readiness calculations;
- safeguarding behaviour;
- accessibility requirements;
- preservation of legitimate learner work and evidence; and
- core account/data behaviour required for the product to operate safely and coherently.

A higher tier may provide additional capability, depth, scale, intelligence, personalisation or convenience, but it must not manufacture stronger-looking educational evidence merely because the learner has paid.

## Entitlement policy by capability family

The policy-level entitlement model is:

| Capability family | Free | Paid | Premium |
|---|---|---|---|
| Account, qualification, subject and specification setup | Full core operation | Full | Full |
| Core adaptive planning and today-focused guidance | Full core | Full | Full |
| Progress, evidence and readiness truth | Full | Full | Full |
| Safety, accessibility and preservation of learner work | Identical required behaviour | Identical required behaviour | Identical required behaviour |
| REV presence and basic guidance | Genuinely useful core | Deeper / greater use where approved | Deepest tutor-style experience where approved |
| Core learning content | Meaningful usable depth | Full approved breadth/depth | Full approved breadth/depth |
| Routine learning and practice modes | Meaningful usable amount | Full serious self-service use | Full |
| Exam-style practice and exam preparation | Bounded but genuinely useful | Full approved self-service use | Full |
| Exam Simulator | Genuine limited access sufficient to demonstrate value | Full approved use | Full |
| Separately approved high-variable-cost AI capability | Preview, example or bounded genuine allowance where sensible | Material useful allowance where commercially sustainable | Highest approved depth/allowance and personalisation |
| Linked parent/payer dashboard | Not applicable without a paid linked relationship | Basic reassurance and high-level progress/support view | Richer trends, interpretation and support guidance from the same approved parent-visible data boundary |

This table defines policy, not final numeric limits or an entitlement catalogue for unapproved future features.

A future feature must still pass its own Definition of Ready and explicitly map its approved Free / Paid / Premium behaviour into this entitlement system. FI-002 does not approve another feature merely by naming a capability family that could contain it.

## Subject breadth must not be the core Free paywall

Revision's differentiation depends on understanding and guiding the learner across their wider revision picture.

Free should therefore not be reduced to a one-subject product merely to create upgrade pressure. Subject breadth must remain sufficient for Free to demonstrate the cross-subject/adaptive proposition.

Commercial differentiation should instead come primarily from additional content depth, usable scale, convenience, personalisation, intelligence and higher-cost capability.

## Deterministic core versus high-variable-cost capability

Relatively low-marginal-cost deterministic product capability is generally a weaker basis for Premium differentiation than genuinely higher-value, higher-variable-cost intelligence.

Revision should therefore avoid artificially crippling planning, progress or evidence truth to create a Premium proposition.

Where separately approved AI or other variable-cost capability creates meaningful learner value, entitlement and quantitative allowances may be used to keep the product commercially sustainable.

Exact allowance values must be determined from learner value, conversion behaviour and cost-to-serve rather than arbitrary round numbers.

## Entitlement architecture principle

The product should use capability and allowance entitlements rather than scattered hard-coded plan-name checks.

Conceptually:

`learner/account → subscription state → package → entitlements and allowances → capability access`

Where a parent or payer is linked, the commercial/account model must also distinguish the payer's subscription relationship from the learner's educational-data ownership and permissions.

Conceptually:

`payer relationship → subscription → learner entitlement`

must remain separate from:

`learner → learning evidence / activity / REV interactions → governed learner-data permissions`.

The model must support both:

- boolean entitlement decisions, where a capability is available or unavailable; and
- quantitative allowances, where a learner may use an approved capability up to a governed limit.

Packaging should be able to evolve without rewriting educational feature logic across the application.

Where an entitlement protects a server/API operation, enforcement must exist at the relevant trust boundary. UI locking alone is not sufficient.

## Contextual discovery and upgrade behaviour

Higher-tier capability should remain discoverable where it is naturally relevant to the learner's current goal.

A tier boundary should follow this pattern:

1. expose the stronger capability in context;
2. explain the additional learner benefit;
3. clearly show that the learner's current tier does not include the full capability;
4. use a preview, example or bounded demonstration where that materially improves understanding;
5. provide a simple route to compare plans or follow the appropriate purchaser journey; and
6. preserve an obvious route back to the useful current-tier experience.

Revision must not drive conversion through false scarcity, manipulative countdowns, exam-anxiety exploitation, shame, guilt, repeated blocking prompts, misleading enabled-looking controls or deliberate degradation of Free.

REV may explain an entitlement boundary when context requires it, but the trusted tutor relationship must not become a persistent sales channel.

## Tiered parent/payer dashboard policy

Founder decision on 20 August 2026 establishes a parent/payer dashboard as part of the Paid and Premium value proposition where a valid linked parent/payer relationship exists.

The purpose is to help a payer support the learner and understand whether the paid service is creating useful value. It is not to create surveillance of the learner.

### Paid parent/payer experience

Paid should provide a basic dashboard capable of showing, where evidence supports it:

- subscription and billing status relevant to the payer;
- upcoming assessments or exams that are already part of the learner's approved academic context;
- a high-level indication of whether the learner is engaging with Revision;
- overall progress and a simple subject-level progress overview;
- whether the learner appears broadly on track or whether an area needs attention, with appropriate uncertainty where evidence is incomplete; and
- a concise periodic summary that helps the parent understand whether support may be useful.

The Paid parent proposition is reassurance: **I can see that Revision is being used and whether things broadly appear to be moving in the right direction.**

### Premium parent/payer experience

Premium may provide richer interpretation from the same approved parent-visible data boundary, including:

- subject-level trends over time;
- changing priorities and areas that may need support;
- progress/readiness trajectory and plain-language interpretation where evidence supports it;
- more useful context on why a subject or area needs attention;
- personalised suggestions for how the parent can support without taking over the learner's revision; and
- more intelligent proactive summaries or alerts when a meaningful change genuinely warrants attention.

The Premium parent proposition is support insight: **I understand where things are improving, where support may help and what I can usefully do.**

### Parent-data boundary

Paying more must buy better interpretation, synthesis, trends and support guidance, not progressively deeper access to private learner information.

The following are outside automatic parent/payer visibility in both Paid and Premium unless a separate future governance decision explicitly changes the data-sharing model with appropriate privacy, safeguarding and legal authority:

- REV conversation transcripts or private tutor interactions;
- individual learner answers or raw submitted work;
- private learner notes;
- detailed click-by-click or timestamp-by-timestamp activity surveillance;
- safeguarding-sensitive information; and
- other private learner data not necessary for the approved high-level support purpose.

The learner must be told clearly, in age-appropriate language, what a linked parent/payer can see. The product must not imply that payment itself grants ownership of the learner's educational data.

Exact consent, relationship-verification, age and legal mechanisms remain Definition-of-Ready work and must be validated against current applicable UK requirements before production implementation.

## FI-002 MVP boundary

The FI-002 MVP is the reusable commercial and entitlement layer required to make governed tiering operable.

It should establish:

- subscription/account state sufficient to determine entitlement status;
- package-to-entitlement mapping;
- support for boolean entitlements and quantitative allowances;
- consistent capability access decisions across relevant product surfaces;
- current-plan visibility;
- clear locked/unlocked states;
- contextual upgrade discovery and a plan-comparison route;
- secure server/API enforcement where a protected operation requires it;
- entitlement refresh after a plan or subscription-state change;
- safe handling of upgrade, downgrade, cancellation, expiry and failed-payment states;
- preservation of existing learner work and learning evidence across entitlement changes;
- a linked parent/payer relationship model sufficient to support the approved Paid parent dashboard where the subscription is funded by a parent/payer;
- the basic Paid parent/payer dashboard and its governed parent-visible data boundary;
- architecture capable of supporting the richer Premium parent/payer experience without making private learner data a commercial entitlement;
- commercial analytics events needed for the approved measurement funnel; and
- Founder/Admin visibility sufficient to identify entitlement, lifecycle, parent-linking and conversion-health problems.

FI-002 should create the reusable platform through which separately governed learner features can later declare and consume entitlements. It should not encode feature packaging through duplicated plan-name conditionals.

## Deliberate MVP exclusions

The following are not required to prove FI-002's initial hypothesis and should not enlarge the first implementation unless a later governed decision promotes them:

- referral reward mechanics;
- coupons and complex promotions;
- elaborate trial variants;
- family-plan packaging beyond the single linked parent/payer relationship required for the approved dashboard;
- multiple-parent/guardian household management;
- gift subscriptions;
- sophisticated promotional pricing;
- detailed parent surveillance or access to private learner interactions; and
- speculative entitlement rules for features that have not completed their own product governance.

The underlying entitlement architecture should avoid making these future capabilities unnecessarily difficult, but FI-002 MVP should not build them pre-emptively.

## Premium launch rule

The entitlement architecture should support Free, Paid and Premium from the outset because those are the approved conceptual tiers.

That does not require Revision to commercially launch all three tiers at the same time.

Premium should be actively sold only when at least one separately approved capability gives it a genuinely qualitative value difference, particularly deeper tutor-style intelligence, personalisation or another defensible high-value/high-cost capability. Richer parent insight may strengthen the Premium proposition but should not be the sole justification for Premium if the learner-side experience remains materially identical to Paid.

If that qualitative difference is not ready, the architecture may support Premium without forcing a weak customer proposition into market.

## Subscription lifecycle principles

Entitlement state must remain understandable and recoverable through subscription changes.

At minimum:

- a successful upgrade should unlock the correct entitlement promptly;
- downgrade or cancellation must not delete legitimate learner work or rewrite learning evidence;
- cancellation-at-period-end must distinguish current access from future expiry;
- expired or failed-payment states must produce an explicit, recoverable entitlement state rather than ambiguous partial access;
- entitlement refresh/caching must not leave a learner indefinitely in the wrong tier;
- parent/payer dashboard access must follow the valid subscription and relationship state rather than persist indefinitely after the relationship or entitlement ends; and
- commercial lifecycle failure must not corrupt educational evidence or core account integrity.

Detailed grace periods, retry behaviour, relationship-recovery behaviour and billing-provider event handling remain technical/commercial Definition-of-Ready work.

## Measurement requirement

The entitlement system must support the governed tier funnel where relevant:

`eligible → higher-tier value exposed → upgrade intent → proposition viewed → converted → unlocked benefit used → retained`

Success must not be assessed from conversion alone.

Measurement should also cover, where material:

- Free engagement and retention;
- abandonment/frustration around entitlement boundaries;
- upgrade-prompt frequency and dismissal;
- first and repeat use of unlocked learner capability;
- activation and repeat use of the linked parent/payer dashboard;
- usefulness of parent summaries or support guidance without encouraging surveillance;
- downgrade/churn patterns;
- support or trust problems caused by packaging or parent visibility;
- entitlement, parent-linking and lifecycle operational failures; and
- tier-level cost-to-serve where material.

## Decisions deliberately not made by this authority

This v0.2 authority does not yet define:

- exact customer-facing plan names;
- exact prices or billing cadence;
- exact numeric allowances;
- payment/subscription provider;
- final contracting-age rule;
- detailed student versus purchaser/payer account relationship and verification flow;
- age-specific purchase calls-to-action;
- trial policy;
- referral or promotional entitlement mechanics;
- detailed billing retry/grace-period rules;
- detailed Premium parent-dashboard information design beyond the governed data boundary; or
- the technical data schema and provider-integration design.

These remain FI-002 Definition-of-Ready work and require current commercial, technical, privacy/trust and legal analysis before implementation approval.

## Documentation-impact rule

Material future changes to the tier jobs, cross-tier foundations, entitlement policy, contextual upgrade behaviour, parent/payer visibility or FI-002 MVP boundary must update this authority through a governed PR.

Exact pricing/commercial terms should be governed in the appropriate `60-business-operations/` authority once decided. Technical implementation detail belongs in `docs/technical/` and ADRs once the provider/data architecture is approved.
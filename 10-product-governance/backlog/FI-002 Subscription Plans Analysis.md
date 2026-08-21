# FI-002 — Subscription Plans / Feature Entitlements and Upgrade Journey — Analysis Record

**Document type:** product-management working record  
**Authority:** non-authoritative Definition-of-Ready analysis  
**Feature:** FI-002  
**Lifecycle state:** Analyse  
**Analysis started:** 2026-08-20  
**Owner:** Product / Founder  
**Implementation status:** Not started — material production implementation is prohibited until explicit human-approved `Ready` status.

## Lifecycle evidence

On 20 August 2026, the Founder explicitly approved:

`Approve FI-002 to To Do`

This records the required human `New → To Do` product decision: subscription plans, feature entitlements and an upgrade journey belong in Revision.

The Founder subsequently authorised the governed FI-002 analysis branch and lifecycle commit:

`Authorise FI-002 analysis branch and lifecycle commit`

Definition-of-Ready analysis is therefore active and FI-002 is in `Analyse`. This does **not** constitute approval of pricing, implementation, billing-provider selection or the later `Analyse → Ready` gate.

## Governing context

Current product authority already establishes that Revision is designed to operate across Free, Paid and Premium tiers and that commercial differentiation must preserve genuine standalone Free value.

The governing commercial principle remains:

**Free proves the value. Paid compounds the value. Premium maximises the value.**

FI-002 exists to make that model operable through a coherent entitlement and upgrade system. It is commercial infrastructure rather than an educational differentiator in its own right.

## Product problem

Revision needs a sustainable commercial model without turning the Free experience into a broken demo or allowing subscription logic to distort educational truth.

The system must let a learner:

- use Revision meaningfully for free;
- understand stronger Paid/Premium capability where it is relevant;
- clearly understand whether a capability is available on their current tier;
- discover why a higher-tier capability may be valuable;
- follow an appropriate route to compare plans or upgrade; and
- retain their learning work and evidence if their entitlement changes.

The business must be able to change packaging over time without rebuilding scattered plan checks throughout the application.

## Agreed experience decision — contextual visibility

Founder decision, 20 August 2026:

**Locked capabilities should remain viewable within the context in which they are useful, while clearly showing when an upgrade is required.**

The product should not hide Paid/Premium capabilities from lower-tier learners merely because they cannot currently use them. Discoverability is part of communicating the broader product value.

A tier boundary must be understandable before or at the relevant interaction. A locked capability must not masquerade as fully available.

Where appropriate, the product may use previews, examples or bounded demonstrations so the learner can understand the stronger experience before deciding whether to explore an upgrade.

## Agreed conversion approach — value selling, not pressure selling

Founder direction, 20 August 2026: Revision should use tried-and-tested selling/conversion techniques to communicate the value of higher tiers.

The intended pattern is contextual and consultative:

1. **Relevance** — expose the stronger capability naturally while the learner is pursuing a goal it can genuinely help with.
2. **Benefit** — explain the learner outcome rather than relying on a feature name or padlock.
3. **Contrast** — make the current-tier value and the additional higher-tier value easy to compare without depicting Free as worthless.
4. **Demonstration** — use a preview, example or bounded demonstration where it materially improves understanding of the additional value.
5. **Reason to upgrade** — connect the stronger capability to the current learner need without exploiting weakness or anxiety.
6. **Clear proposition** — identify the tier required and provide transparent access to the relevant plan proposition.
7. **Low-friction choice** — make it simple to view plans or follow the appropriate purchaser journey while preserving an obvious route back to the useful Free experience.

Revision may test benefit framing, value anchoring, contrast, credible proof, progressive disclosure and contextual timing where these remain truthful and proportionate.

## Commercial and child-user guardrails

Revision's primary product user is a student, including younger learners. Commercial optimisation must therefore remain subordinate to the learner's welfare, trust and educational experience.

The conversion system must not:

- exploit exam anxiety or imply that payment is necessary to avoid failure;
- use a learner's weakness, low score, poor readiness signal or emotional vulnerability as pressure to purchase;
- shame or guilt a learner or parent for remaining on Free;
- use false scarcity, deceptive urgency or manipulative countdowns;
- repeatedly interrupt ordinary study in order to wear the learner down;
- hide completed work or destroy learner evidence after downgrade;
- degrade educational truth, evidence quality, progress semantics, safety or accessibility by payment status; or
- allow REV to become a persistent salesperson inside the learning relationship.

Detailed purchase calls-to-action and the student-versus-payer journey remain Definition-of-Ready work and must be checked against current applicable UK consumer, advertising, privacy and child-design requirements before production approval.

## Entitlement design principle

The implementation should favour capability/entitlement checks rather than scattered hard-coded plan-name checks.

Conceptually:

`learner/account → subscription state → plan/package → entitlements and allowances → capability access`

The product should be able to change packaging without rewriting educational feature logic across the application.

Entitlement enforcement must exist at every relevant trust boundary. UI locking alone is not sufficient where a protected server/API operation can still be called directly.

## Evidence boundary

Subscription state is commercial/account evidence, not learning evidence.

Payment or entitlement status must not alter:

- whether an answer is correct;
- a mark or score;
- mastery/understanding evidence semantics;
- readiness calculations or confidence in those calculations;
- safeguarding behaviour;
- accessibility requirements; or
- educational truth.

A higher tier may provide additional capability, depth, intelligence, personalisation, convenience or scale, but it may not manufacture stronger-looking educational evidence merely because the learner has paid.

## REV role — current recommendation

REV may explain an entitlement boundary or the learner benefit of a stronger capability when context requires it, but should not become the primary conversion mechanism or repeatedly initiate sales prompts.

The default commercial interaction should be product UX, not conversational pressure from a tutor relationship that the learner is expected to trust.

## Founder-approved value-ladder architecture

Founder decision, 20 August 2026:

`Approve FI-002 value ladder and authorise analysis commit`

The approved packaging architecture for continued FI-002 analysis is:

### Free — useful core intelligent Revision

**Job:** Let a learner experience Revision's actual proposition, become organised and make meaningful revision progress without paying.

Free should prove that Revision can understand the learner's academic context, provide useful evidence-aware guidance and support the core revision loop. It must not be reduced to a content teaser or a one-subject demo that cannot demonstrate the cross-subject/adaptive proposition.

Core educational truth, progress/evidence semantics, safeguarding and accessibility remain fully correct on Free.

Where a higher-cost or higher-value capability is strategically important to understanding Revision's differentiation, Free may receive a bounded genuine allowance, example, preview or demonstration rather than necessarily receiving zero access.

### Paid — complete self-service Revision

**Job:** Provide the complete serious revision system for a learner who wants to use Revision repeatedly as their main revision product.

Paid should materially expand usable depth, scale and convenience beyond Free. The learner should be able to revise seriously across the product without repeatedly encountering artificial restrictions.

The Paid proposition is primarily **powerful revision software**: a comprehensive self-service system that combines planning, learning, practice, exam preparation and progress with materially broader access than Free.

### Premium — deepest personalised REV / AI experience

**Job:** Provide the fullest personal-tutor-style Revision experience where greater intelligence, personalisation and higher variable cost create a defensible step up.

Premium should not merely mean "Paid but unlimited". It should provide a qualitatively stronger proposition centred on deeper REV/AI support and other genuinely high-value/high-cost personalised capabilities where approved through their own product governance.

The intended conceptual distinction is:

**Paid = powerful revision software.**  
**Premium = powerful revision software + substantially deeper personal tutoring intelligence.**

### Cross-tier rule

The commercial ladder therefore becomes:

**Free proves that Revision understands and guides me.**  
**Paid gives me the complete system to revise properly.**  
**Premium gives me the deepest personalised REV/AI support.**

This is an approved product-packaging architecture for FI-002 analysis. It does **not** yet approve an exact feature entitlement matrix, usage allowance, plan name, price, billing cadence or inclusion of any unapproved future feature.

## Packaging implications to test next

The approved architecture creates several design consequences that now need to be resolved rather than rediscovered during development:

- basic adaptive guidance and evidence truth cannot be paywalled so heavily that Free stops demonstrating Revision's central proposition;
- deterministic, relatively low-marginal-cost capability is generally a weaker basis for Premium differentiation than genuinely higher-value/high-variable-cost intelligence;
- high-cost AI capabilities are strong candidates for entitlement/allowance differentiation, but exact allowances must be based on learner value, conversion behaviour and unit economics rather than arbitrary round numbers;
- Premium requires a qualitatively stronger value proposition, not merely larger numeric limits everywhere;
- locked higher-tier value should remain discoverable in its natural learner context;
- the entitlement model must support both boolean capability access and quantitative allowances where justified; and
- packaging for FI-003 and other future AI-intensive features must be decided through their own governed feature definitions and then mapped into FI-002 entitlements rather than pre-approved here by implication.

## Preliminary Definition-of-Ready position

- Student problem and target user — **PASS**
- Strategic case — **PASS**
- User-value hypothesis — **PASS**
- Experience and simplicity — **PARTIAL**; contextual visibility and value-selling principle agreed, detailed interaction/recovery states remain
- Evidence / intelligence model — **PARTIAL**; commercial/learning evidence separation agreed, data model remains
- REV role — **PARTIAL**; restrained commercial role agreed, detailed behaviours remain
- MVP boundary — **BLOCKED**
- Free / Paid / Premium value ladder — **PARTIAL**; tier architecture and jobs approved, exact entitlement/allowance matrix and cost sustainability remain
- Upgrade / conversion hypothesis — **PARTIAL**; contextual consultative pattern and tier proposition agreed, purchaser journey remains
- Measurement contract — **BLOCKED**
- Admin / Founder assurance — **BLOCKED**
- Risk / trust / accessibility — **PARTIAL**
- Technical feasibility and dependencies — **PASS in principle**; React/Supabase architecture can support the model, provider/data design remains
- Test and assurance approach — **BLOCKED**
- Documentation / authority impact — **IDENTIFIED, not completed**
- Blocking decisions resolved — **NO**
- Human Definition-of-Ready approval — **NOT REQUESTED / NOT GRANTED**

## Material unresolved decisions

The analysis must still resolve at minimum:

- exact capability/allowance entitlement matrix within the approved Free / Paid / Premium architecture;
- pricing and billing cadence;
- whether plan names remain Free / Paid / Premium or use customer-facing names;
- MVP subscription/billing scope versus later promotional/referral capability;
- payment/subscription provider;
- student account versus purchaser/payer relationship, especially parent-paid plans;
- age-appropriate purchase and upgrade calls-to-action;
- trial policy, if any;
- AI/REV allowances and cost-to-serve controls;
- upgrade, downgrade, cancellation, expiry and failed-payment behaviour;
- entitlement refresh/caching and server-side enforcement;
- data model and billing-data privacy boundary;
- analytics and funnel measurement;
- Founder/Admin commercial and operational assurance;
- test strategy, including entitlement bypass, downgrade and billing-event failure modes; and
- current UK legal/regulatory requirements applicable to the chosen commercial model.

## Documentation and authority impact

Before FI-002 may become `Ready`, the governed change is expected to establish or update at least:

- dedicated product authority for plan/entitlement behaviour under `10-product-governance/`;
- commercial pricing/packaging authority under `60-business-operations/` where appropriate;
- `10-product-governance/Scope and Capability Taxonomy.md` if exact global commercial boundaries are promoted;
- `10-product-governance/Core User Journeys.md` for upgrade and plan-management journeys;
- `20-brand-and-experience/Product UX Principles.md` only if analysis produces a material rule not already represented there;
- applicable privacy/security/trust authority for billing/account data;
- technical architecture/implementation documentation once a provider and data model are approved; and
- backlog/lifecycle evidence linking the final authority and explicit human `Ready` decision.

Historical research and audits must not be rewritten to make them appear authoritative.

## Documentation-impact check for this analysis increment

This increment records the Founder-approved three-tier value-ladder architecture and advances Definition-of-Ready analysis. It does not yet create normative plan/entitlement authority because exact entitlements, allowances, pricing and purchaser behaviour remain unresolved.

No production code, billing provider, technical architecture, price or exact entitlement matrix is approved by this record.

---

## Founder-approved entitlement policy and MVP boundary — 20 August 2026

Founder decision:

`Approve FI-002 entitlement policy and MVP boundary`

This approval establishes the policy-level entitlement architecture and the minimum FI-002 product boundary. It does **not** approve exact prices, plan names, numeric allowances, billing provider, purchaser/account model or implementation.

The approved policy is promoted into `10-product-governance/Subscription Plans and Entitlements.md`. That authority now governs the stable product rules for tier jobs, cross-tier foundations, entitlement behaviour and FI-002 MVP scope.

### Approved policy consequences

- Free must retain enough subject breadth and adaptive capability to demonstrate Revision's genuine cross-subject proposition; subject count must not become the core Free paywall.
- Core planning, progress/evidence truth, safety, accessibility and preservation of learner work remain coherent across tiers.
- Paid primarily differentiates through materially greater breadth, depth, scale and convenience for serious self-service revision.
- Premium must provide a qualitative additional proposition rather than merely larger numeric limits; deeper personalised REV/AI is the intended direction where separately approved capabilities support it.
- Separately approved high-variable-cost AI capability may use bounded or quantitative allowances where needed for commercial sustainability.
- The entitlement model must support both boolean capability access and quantitative allowances.
- Higher-tier capability remains discoverable contextually without using vulnerability, exam anxiety, false urgency or deliberate Free degradation to create conversion.
- FI-002 must provide the reusable entitlement platform; future feature definitions map approved packaging into it rather than hard-coding plan names independently.

### Approved FI-002 MVP

The MVP must establish:

- subscription/account state sufficient to resolve entitlement status;
- package-to-entitlement mapping;
- boolean entitlements and quantitative allowances;
- consistent capability-access decisions;
- current-plan visibility;
- locked/unlocked product states and contextual upgrade discovery;
- a plan-comparison route;
- relevant server/API enforcement rather than UI-only locking;
- entitlement refresh after plan/subscription changes;
- safe upgrade, downgrade, cancellation, expiry and failed-payment states;
- preservation of learner work and evidence across entitlement changes;
- commercial analytics events required by the governed funnel; and
- Founder/Admin visibility for material entitlement, lifecycle and commercial-health failures.

Deliberately excluded from the FI-002 MVP are referral rewards, coupons/complex promotions, elaborate trial variants, family-plan packaging, parent dashboards, gift subscriptions, sophisticated promotional pricing and speculative packaging for unapproved future features.

### Premium launch rule

The architecture should support the approved Free / Paid / Premium model, but commercial launch of Premium is not mandatory merely because the entitlement layer supports it.

Premium should be actively sold only when a separately approved capability provides a genuinely qualitative higher-tier experience. Until then, the architecture may support Premium without forcing a weak proposition into market.

## Current Definition-of-Ready position — supersedes preliminary position above

- Student problem and target user — **PASS**
- Strategic case — **PASS**
- User-value hypothesis — **PASS**
- Experience and simplicity — **PARTIAL**; contextual visibility and tier-boundary principles are approved, but purchaser flow and detailed lifecycle/recovery UX remain
- Evidence / intelligence model — **PARTIAL**; commercial/learning evidence separation is approved, but account/subscription data model and downstream event contract remain
- REV role — **PARTIAL**; restrained commercial role is approved, but exact entitlement explanation behaviour remains to be finalised alongside the broader REV capability
- MVP boundary — **PASS**
- Free / Paid / Premium value ladder — **PARTIAL**; tier jobs and policy-level capability families are approved, but numeric allowances and cost sustainability remain unresolved
- Upgrade / conversion hypothesis — **PARTIAL**; contextual consultative pattern is approved, but purchaser/account journey and final proposition remain
- Measurement contract — **PARTIAL**; common funnel and guardrails are governed by the KPI framework and promoted entitlement authority, but concrete FI-002 event definitions and operational thresholds remain
- Admin / Founder assurance — **PARTIAL**; required visibility is now part of the MVP, but concrete checks/thresholds remain
- Risk / trust / accessibility — **PARTIAL**; core guardrails are approved, but current consumer/child/payer/legal analysis remains
- Technical feasibility and dependencies — **PASS in principle**; reusable entitlement architecture is defined, but billing provider, account relationship and technical data/event design remain
- Test and assurance approach — **BLOCKED**; critical failure modes still require an explicit assurance plan
- Documentation / authority impact — **PARTIAL**; dedicated product authority has now been created and indexed, while commercial, journey, privacy/security and technical authority remain to be completed as decisions mature
- Blocking decisions resolved — **NO**
- Human Definition-of-Ready approval — **NOT REQUESTED / NOT GRANTED**

## Remaining blocking decisions after entitlement/MVP approval

The material unresolved Definition-of-Ready work is now narrowed to:

- purchaser/account relationship, including parent-paid plans and age-appropriate purchase routes;
- exact prices and billing cadence;
- customer-facing plan names if different from Free / Paid / Premium;
- numeric AI/REV and other variable-cost allowances, supported by unit economics;
- payment/subscription provider and billing architecture;
- trial policy, if any;
- detailed upgrade, downgrade, cancellation, expiry, failed-payment and recovery behaviour;
- entitlement refresh/caching and server-side enforcement design;
- billing/account data model and privacy/security boundary;
- concrete analytics/event contract and Founder assurance thresholds;
- test/assurance strategy for entitlement bypass, lifecycle failure and billing-event failure modes; and
- current UK consumer, child-design, advertising/privacy and subscription requirements applicable to the selected purchaser model.

## Documentation-impact check — entitlement policy increment

This increment materially changes what Revision's subscription product should do, so the approved policy has been promoted out of the backlog into dedicated product authority at `10-product-governance/Subscription Plans and Entitlements.md` and added to `INDEX.md`.

No implementation, billing provider, pricing, numeric allowance or customer payment flow is approved by this increment. Further normative, commercial and technical documentation will be updated as those remaining decisions are resolved.

---

## Founder-approved tiered parent dashboard model — 20 August 2026

Founder decision:

`Approve FI-002 tiered parent dashboard model`

This decision deliberately changes the previous FI-002 MVP exclusion that placed parent dashboards outside the initial subscription scope. Where a valid linked parent/payer relationship exists, a bounded parent/payer dashboard is now part of the Paid proposition and its richer support-insight layer contributes to Premium differentiation.

This approval does **not** resolve the separate contracting-age rule, exact purchaser verification flow, pricing, billing provider or technical account schema.

### Approved parent value ladder

**Paid parent/payer value — basic reassurance**

- subscription/billing visibility relevant to the payer;
- upcoming known assessments/exams;
- high-level learner engagement;
- overall progress and simple subject-level progress;
- evidence-supported broad on-track / attention-needed signals; and
- a concise periodic parent summary.

**Premium parent/payer value — richer support insight**

- subject-level trends over time;
- changing priorities and areas where support may help;
- progress/readiness trajectory and explanation where evidence supports it;
- richer context behind attention-needed signals;
- personalised suggestions for constructive parent support; and
- restrained proactive summaries/alerts when a material change genuinely warrants attention.

### Privacy and trust rule

Premium buys better interpretation, synthesis, trends and support guidance from the approved parent-visible data set. It does **not** buy progressively deeper access to the learner's private information.

REV conversations, individual answers/raw work, private notes, detailed activity surveillance and safeguarding-sensitive data remain outside automatic parent/payer visibility unless a future separately governed sharing decision explicitly changes that boundary.

The learner must be told clearly what a linked parent/payer can see.

### Revised FI-002 MVP consequence

The basic Paid parent/payer dashboard, the linked relationship needed to support it, and its permission boundary are now part of FI-002 MVP. The architecture should support richer Premium parent insight, but the detailed Premium information design may mature alongside approved learner evidence/intelligence capability.

Multiple-parent household management, family plans beyond the required linked payer relationship and broader surveillance remain outside the MVP.

## Current Definition-of-Ready position — supersedes the previous current position above

- Student problem and target user — **PASS**
- Strategic case — **PASS**
- User-value hypothesis — **PASS**
- Experience and simplicity — **PARTIAL**; learner tier boundaries and parent value ladder are approved, but linking, payer purchase flow and lifecycle/recovery UX remain
- Evidence / intelligence model — **PARTIAL**; commercial/learning separation and parent-visible data boundary are approved, but account/subscription/relationship data model and event contract remain
- REV role — **PARTIAL**; restrained commercial role remains approved, while exact REV behaviour around parent-visible summaries remains dependent on separately approved REV capabilities
- MVP boundary — **PASS**; now includes the basic Paid parent/payer dashboard and linked relationship
- Free / Paid / Premium value ladder — **PARTIAL**; learner and parent/payer tier jobs are approved, but numeric AI allowances, cost sustainability and final Premium launch proposition remain unresolved
- Upgrade / conversion hypothesis — **PARTIAL**; parent reassurance is now an explicit Paid value driver and Premium parent support insight a differentiator, but purchaser flow and final pricing proposition remain unresolved
- Measurement contract — **PARTIAL**; must now include parent-dashboard activation/usefulness and parent-linking health in addition to the governed tier funnel
- Admin / Founder assurance — **PARTIAL**; must now include parent-linking/access exceptions as well as entitlement and commercial-health visibility
- Risk / trust / accessibility — **PARTIAL**; explicit parent privacy boundary is governed, but relationship verification, age, consent and current UK legal analysis remain
- Technical feasibility and dependencies — **PASS in principle**; architecture can represent a linked payer and permissioned parent view, but billing/account relationship and schema design remain
- Test and assurance approach — **BLOCKED**; must include parent authorization/bypass and visibility-boundary assurance in addition to subscription lifecycle failure modes
- Documentation / authority impact — **PARTIAL**; subscription authority, Core User Journeys and Privacy principles are aligned in this increment; commercial and technical authority remain pending
- Blocking decisions resolved — **NO**
- Human Definition-of-Ready approval — **NOT REQUESTED / NOT GRANTED**

## Remaining blocking decisions after parent-dashboard approval

- final purchaser/account relationship and contracting-age policy;
- relationship verification/linking and unlinking behaviour;
- exact prices and billing cadence;
- customer-facing plan names if different from Free / Paid / Premium;
- numeric AI/REV and other variable-cost allowances, supported by unit economics;
- payment/subscription provider and billing architecture;
- trial policy, if any;
- detailed upgrade, downgrade, cancellation, expiry, failed-payment and recovery behaviour;
- entitlement/parent-access refresh and caching design;
- billing/account/relationship data model and security boundary;
- concrete learner and parent analytics/event contract and Founder assurance thresholds;
- test/assurance strategy including parent authorization, privacy-boundary bypass, entitlement bypass and billing-event failures; and
- current UK consumer, child-design, advertising/privacy and subscription requirements applicable to the selected purchaser model.

## Documentation-impact check — tiered parent dashboard increment

This Founder decision conflicted with the earlier FI-002 MVP exclusion and the earlier Core User Journeys sequencing that placed parent support later. The governed increment therefore updates `10-product-governance/Subscription Plans and Entitlements.md`, `10-product-governance/Core User Journeys.md` and `40-evidence-and-trust/Privacy and Student Data Principles.md` together and records the decision in the FI-002 analysis record.

No production implementation, pricing, billing provider, final contracting-age rule or technical account schema is approved by this decision.

---

## Founder-approved purchaser, payer and supporter account model — 21 August 2026

Founder decision:

`Approve FI-002 purchaser, payer and supporter account model`

This decision resolves the policy-level purchaser/account model and initial contracting-age product rule. It deliberately distinguishes commercial payment responsibility from learner-data permission.

### Approved account roles

- **Learner** — owns and uses the Revision learning account, learner work, educational evidence and REV relationship.
- **Billing customer / payer** — owns the subscription contract, payment method, invoices, renewal and cancellation responsibilities.
- **Linked supporter** — holds permission to access the separately governed Paid/Premium parent-support dashboard for that learner.

One person may hold more than one role. An adult learner may be both learner and payer. A parent will commonly be both payer and linked supporter.

Role combination must not collapse the permissions. Payment may create the learner's commercial entitlement, but payment alone does **not** grant the payer learner progress information or parent-dashboard access. Supporter access requires a valid supporter relationship in addition to the relevant subscription entitlement.

### Approved adult-payer rule

For the initial UK FI-002 product, the billing customer must be **18 or over**.

This is a product-policy choice for MVP simplicity and risk reduction, not a legal conclusion that every contract made by a younger person would necessarily be invalid in every UK jurisdiction or circumstance.

An adult learner may pay for themselves. A learner under 18 may receive the paid entitlement through a separate adult payer account.

Revision must not collect learner date of birth solely to enable subscription purchase. Exact payer declaration, age-assurance mechanism, checkout wording and legal implementation remain subject to current legal/privacy validation before production reliance.

### Approved linking paths

Two relationship paths are approved in principle:

1. **Learner-led:** learner chooses to link a parent/supporter → Revision creates a secure invitation/link → adult signs in or creates an account → adult accepts the relationship and, where relevant, completes the subscription journey.
2. **Adult-led:** adult starts from an appropriate pricing/purchase route → adult signs in or creates a payer account → Revision creates a learner invitation → learner accepts the relationship before supporter access to learner information becomes active.

The system must not rely on unrestricted learner search or expose whether a named child/email address has a Revision account.

The first implementation should support one primary payer/supporter relationship per learner subscription. Multiple-parent household management, broader family-plan management and gift-subscription workflows remain outside the MVP.

Exact identity and relationship verification, invitation expiry/recovery, unlinking safeguards and exceptional support processes remain Definition-of-Ready work.

### Learner transparency and lifecycle

A learner with an active linked supporter must be able to see who is linked and what that supporter can and cannot see.

Cancellation, downgrade, expiry or unlinking must not delete legitimate learner work or rewrite educational evidence. Ending the supporter relationship must remove that person's learner-dashboard access when the relationship ceases to be valid. Account recovery must not silently recreate supporter access.

### Commercial/child-user consequence

Learner surfaces may continue to explain and demonstrate higher-tier value. Exact age-specific purchase calls-to-action, including the treatment of under-16 learners, remain subject to current UK advertising, consumer, child-design and privacy validation before production implementation. Revision must not make child-to-parent pressure the conversion mechanism.

## Current Definition-of-Ready position — supersedes the previous current position above

- Student problem and target user — **PASS**
- Strategic case — **PASS**
- User-value hypothesis — **PASS**
- Experience and simplicity — **PARTIAL**; tier boundaries, parent value ladder and learner/adult linking paths are approved, but detailed checkout, verification, invitation recovery and subscription lifecycle/recovery UX remain
- Evidence / intelligence model — **PARTIAL**; commercial/learning separation, account-role semantics and parent-visible data boundary are approved, but the concrete subscription/relationship schema and downstream event contract remain
- REV role — **PARTIAL**; restrained commercial role remains approved, while exact REV behaviour around entitlement explanation and parent-visible summaries depends on separately approved REV capability
- MVP boundary — **PASS**; includes distinct learner/payer/supporter roles, 18+ payer rule, one primary linked relationship, basic Paid parent/supporter dashboard and secure linking paths
- Free / Paid / Premium value ladder — **PARTIAL**; learner and parent/supporter tier jobs are approved, but numeric AI allowances, cost sustainability and final Premium launch proposition remain unresolved
- Upgrade / conversion hypothesis — **PARTIAL**; contextual value selling and adult-led/learner-led purchaser routes are approved in principle, but final pricing proposition, checkout design and age-specific CTAs remain unresolved
- Measurement contract — **PARTIAL**; must include payer checkout, invitation/linking, supporter activation/usefulness and access-state health alongside the governed tier funnel
- Admin / Founder assurance — **PARTIAL**; must include relationship-linking/access exceptions plus entitlement and commercial-health visibility, with concrete checks and thresholds still unresolved
- Risk / trust / accessibility — **PARTIAL**; payer/supporter separation, adult-payer rule, learner transparency and private-data boundary are governed, but exact verification/consent/age-assurance and current UK legal implementation still require validation
- Technical feasibility and dependencies — **PASS in principle**; the architecture can represent distinct roles and permissioned relationships, but billing provider, schema, event ordering, caching and server-side enforcement design remain
- Test and assurance approach — **BLOCKED**; must explicitly cover role-confusion, payer-without-supporter access, supporter authorization/bypass, invitation/linking, unlinking/recovery, entitlement bypass and billing-event failure modes
- Documentation / authority impact — **PARTIAL**; Subscription Plans and Entitlements, Core User Journeys, Authentication Experience and Privacy and Student Data Principles are aligned in this increment; pricing/commercial and technical implementation authority remain pending
- Blocking decisions resolved — **NO**
- Human Definition-of-Ready approval — **NOT REQUESTED / NOT GRANTED**

## Remaining blocking decisions after purchaser/payer/supporter approval

- exact prices and billing cadence;
- customer-facing plan names if different from Free / Paid / Premium;
- numeric AI/REV and other variable-cost allowances, supported by unit economics;
- payment/subscription provider and billing architecture;
- exact payer age-assurance/declaration implementation and checkout legal wording;
- detailed learner/supporter identity and relationship-verification method;
- invitation expiry/recovery, unlinking safeguards and exceptional support processes;
- age-specific learner purchase/upgrade calls-to-action;
- trial policy, if any;
- detailed upgrade, downgrade, cancellation, expiry, failed-payment, grace/retry and recovery behaviour;
- entitlement/supporter-access refresh and caching design;
- billing/account/relationship data model, RLS/authorization and security boundary;
- concrete learner, payer and supporter analytics/event contract and Founder assurance thresholds;
- test/assurance strategy covering account-role separation, privacy-boundary bypass, entitlement bypass and billing/webhook/event failures; and
- current UK consumer, child-design, advertising/privacy and subscription requirements applicable to the selected implementation.

## Documentation-impact check — purchaser/payer/supporter increment

This approval changes the governed product/account model and resolves a previously explicit FI-002 blocker. The same branch therefore updates:

- `10-product-governance/Subscription Plans and Entitlements.md` for the normative role model, adult-payer rule and MVP consequences;
- `10-product-governance/Core User Journeys.md` for learner-led and adult-led linking and the supporter journey;
- `10-product-governance/Authentication Experience.md` for role-aware account/authentication boundaries and learner data-minimisation consequences; and
- `40-evidence-and-trust/Privacy and Student Data Principles.md` for the rule that payment is not learner-data permission.

No production implementation, payment provider, database schema, pricing, billing cadence, numeric allowance or `Analyse → Ready` approval is created by this decision. Technical documentation and ADR updates become appropriate only once the provider/data architecture is approved.

---

## Founder-approved launch pricing and billing cadence — 21 August 2026

Founder decision:

`Approve FI-002 launch pricing and billing cadence`

This decision resolves the initial consumer price points, supported billing periods and the MVP trial baseline. The approved commercial source of truth is `60-business-operations/Pricing and Billing Policy.md`.

### Approved launch pricing

| Tier | Monthly | Annual | Annual equivalent |
|---|---:|---:|---:|
| Free | £0 | £0 | £0 |
| Paid | £6.99/month | £59.99/year | approximately £5.00/month / 16.4p/day |
| Premium | £12.99/month | £109.99/year | approximately £9.17/month / 30.1p/day |

The initial FI-002 product supports monthly and annual billing only. Annual is billed upfront and may be described as `Best value` where that remains accurate against the monthly option.

A daily or monthly equivalent may lead visually on an annual proposition only where the actual amount charged and billing period are equally clear in the same pricing context. The equivalent must not imply that an annual subscription is charged daily or monthly.

### Approved trial baseline

FI-002 will not launch with a card-required, auto-converting paid-tier trial. Revision's genuine Free tier and contextual previews/examples are the default way to demonstrate value before purchase.

A future trial, introductory offer or auto-converting promotion requires a separate governed commercial decision.

### Approved renewal/cancellation principles

- auto-renewal must be clearly disclosed before purchase;
- cancellation must be available through a straightforward online subscription-management route;
- cancellation must not delete learner work or educational evidence;
- cancellation at period end preserves the paid entitlement until the paid period ends unless a separately governed refund/termination rule requires otherwise;
- annual subscribers should receive a clear pre-renewal reminder; and
- the payer must be able to understand tier, amount, cadence, renewal state and next material billing event.

Exact reminder timing, cooling-off/refund mechanics, failed-payment retries, grace periods and provider-specific lifecycle behaviour remain unresolved and require current UK legal/commercial validation before implementation.

### Commercial-envelope consequence

The approved prices define the commercial envelope but do not prove that proposed AI/REV allowances are sustainable. Before FI-002 becomes Ready, cost-to-serve analysis must still account for payment/billing fees, applicable tax treatment, infrastructure, AI/model usage, support/refund cost and realistic usage distributions.

Provider or tax constraints must not silently change the approved consumer price points. If the selected implementation requires a different customer-facing total, that returns to the Founder as a new pricing decision.

## Current Definition-of-Ready position — supersedes the previous current position above

- Student problem and target user — **PASS**
- Strategic case — **PASS**
- User-value hypothesis — **PASS**
- Experience and simplicity — **PARTIAL**; pricing cadence and presentation rules, tier boundaries, parent value ladder and learner/adult linking paths are approved, but detailed checkout, verification, invitation recovery and subscription lifecycle/recovery UX remain
- Evidence / intelligence model — **PARTIAL**; commercial/learning separation, account-role semantics and parent-visible data boundary are approved, but the concrete subscription/relationship schema and downstream event contract remain
- REV role — **PARTIAL**; restrained commercial role remains approved, while exact REV behaviour around entitlement explanation and parent-visible summaries depends on separately approved REV capability
- MVP boundary — **PASS**; includes distinct roles, 18+ payer rule, approved monthly/annual commercial path, no card-required auto-converting trial, basic Paid parent/supporter dashboard and secure linking paths
- Free / Paid / Premium value ladder — **PARTIAL**; tier jobs and exact launch price points are approved, but numeric AI/REV allowances, unit economics and the qualitative Premium launch capability remain unresolved
- Upgrade / conversion hypothesis — **PARTIAL**; contextual value selling, adult/learner purchaser routes and the launch price proposition are approved, but detailed checkout design and age-specific CTAs remain unresolved
- Measurement contract — **PARTIAL**; must include tier/cadence selection, payer checkout, invitation/linking, supporter activation/usefulness and access-state health alongside the governed tier funnel; concrete events and thresholds remain unresolved
- Admin / Founder assurance — **PARTIAL**; must include conversion by tier/cadence, renewal/cancellation health, cost-to-serve and relationship/access exceptions, with concrete checks and thresholds still unresolved
- Risk / trust / accessibility — **PARTIAL**; pricing transparency, payer/supporter separation, adult-payer rule, learner transparency and private-data boundary are governed, but exact verification/consent/age-assurance, VAT/tax implementation and current UK legal implementation still require validation
- Technical feasibility and dependencies — **PASS in principle**; monthly/annual subscriptions and the approved roles are technically feasible, but provider, schema, webhook/event ordering, caching and server-side enforcement design remain
- Test and assurance approach — **BLOCKED**; must explicitly cover pricing/cadence correctness, checkout/lifecycle failure, role-confusion, supporter authorization, entitlement bypass, webhook replay/order and recovery paths
- Documentation / authority impact — **PARTIAL**; dedicated pricing/billing commercial authority is now created and linked from Subscription Plans and Entitlements and `INDEX.md`; provider-specific technical authority remains pending
- Blocking decisions resolved — **NO**
- Human Definition-of-Ready approval — **NOT REQUESTED / NOT GRANTED**

## Remaining blocking decisions after launch-pricing approval

- customer-facing plan names if different from Free / Paid / Premium;
- numeric AI/REV and other variable-cost allowances, supported by unit economics within the approved price envelope;
- payment/subscription provider and billing architecture;
- VAT/tax/provider implementation consistent with the approved customer-facing prices;
- exact payer age-assurance/declaration implementation and checkout legal wording;
- detailed learner/supporter identity and relationship-verification method;
- invitation expiry/recovery, unlinking safeguards and exceptional support processes;
- age-specific learner purchase/upgrade calls-to-action;
- detailed upgrade, downgrade, cancellation, expiry, failed-payment, grace/retry, refund/cooling-off and recovery behaviour;
- entitlement/supporter-access refresh and caching design;
- billing/account/relationship data model, RLS/authorization and security boundary;
- concrete learner, payer and supporter analytics/event contract and Founder assurance thresholds;
- test/assurance strategy covering price/cadence correctness, account-role separation, privacy-boundary bypass, entitlement bypass and billing/webhook/event failures; and
- current UK consumer, child-design, advertising/privacy, tax and subscription requirements applicable to the selected implementation.

## Documentation-impact check — launch pricing and billing increment

This approval creates normative commercial policy, so the same governed branch:

- creates `60-business-operations/Pricing and Billing Policy.md` as the source of truth for approved launch prices, billing cadence, MVP trial baseline and consumer pricing presentation;
- updates `10-product-governance/Subscription Plans and Entitlements.md` so it no longer reports those decisions as unresolved and instead references the commercial authority;
- updates `60-business-operations/README.md` and `INDEX.md` so the new authority is discoverable; and
- records this decision and revised Definition-of-Ready position in the FI-002 analysis record.

No payment provider, technical billing schema, production checkout, AI allowance, VAT implementation or `Analyse → Ready` approval is created by this decision.

---

## Founder-approved Stripe billing architecture — 21 August 2026

Founder decision: the Founder explicitly approved the recommended FI-002 Stripe billing architecture on 21 August 2026.

This resolves the payment/subscription provider decision and establishes the provider-level target architecture without authorising production implementation.

### Approved provider model

- Initial UK launch provider: **Stripe Payments + Stripe Billing**.
- Revision remains the merchant for the direct UK launch model.
- Initial purchase should prefer **Stripe-hosted Checkout** where it satisfies the final governed purchaser journey and legal requirements.
- Ordinary payer billing management/cancellation should prefer the **Stripe Billing Customer Portal** where it satisfies the final governed lifecycle policy.
- Stripe is authoritative for external financial/provider subscription facts; Revision owns the local commercial projection used by the entitlement system.
- Stripe integration must sit behind a server-side Revision service boundary rather than being called ad hoc from learner UI components.
- Stripe secret/API keys and webhook secrets must remain server-side only; Revision does not store raw card data.
- Provider events must be signature-verified, processed idempotently, tolerate duplicates/delay/out-of-order delivery and feed a durable local projection.
- Periodic reconciliation with Stripe is required so a missed webhook cannot leave entitlement state permanently stale.
- A Stripe Customer, payment or subscription relationship does **not** grant supporter access to learner data; payer billing and supporter authorization remain separate paths.
- Stripe Managed Payments is retained as a future optional merchant-of-record route for supported international markets/products where the compliance/cost trade-off later justifies it. It is outside the UK FI-002 MVP.

The decision is recorded in `decisions/ADR-0014-stripe-subscription-billing-architecture.md` and the target architecture is documented in `docs/technical/Subscription Billing Architecture.md`.

### Unit-economics consequence

The approved consumer prices should be stress-tested on a VAT-inclusive basis using the prevailing standard UK VAT rate as a conservative planning scenario when setting variable-cost AI/REV allowances.

This is a commercial modelling assumption only. It is not evidence that Revision is currently VAT-registered and does not resolve exact tax classification, accounting, invoice or Stripe tax configuration.

### Current Definition-of-Ready position — supersedes the previous current position above

- Student problem and target user — **PASS**
- Strategic case — **PASS**
- User-value hypothesis — **PASS**
- Experience and simplicity — **PARTIAL**; pricing, provider surfaces, tier boundaries and purchaser/linking paths are approved in principle, but detailed checkout, verification, invitation recovery and lifecycle/recovery UX remain
- Evidence / intelligence model — **PARTIAL**; commercial/learning separation, account-role semantics, provider/local source-of-truth boundary and parent-visible data boundary are approved, but the concrete subscription/relationship schema and downstream event contract remain
- REV role — **PARTIAL**; restrained commercial role remains approved, while exact entitlement explanation and parent-visible summary behaviour depends on separately approved REV capability
- MVP boundary — **PASS**; includes the approved account roles, monthly/annual pricing path, no card-required auto-converting trial, basic Paid supporter dashboard, secure linking paths and Stripe-based billing target architecture
- Free / Paid / Premium value ladder — **PARTIAL**; tier jobs and launch prices are approved, but numeric AI/REV allowances, unit economics and the qualitative Premium launch capability remain unresolved
- Upgrade / conversion hypothesis — **PARTIAL**; contextual value selling, adult/learner purchaser routes, approved launch pricing and hosted Stripe purchase/management surfaces are defined, but detailed checkout design and age-specific CTAs remain unresolved
- Measurement contract — **PARTIAL**; must include tier/cadence selection, checkout/provider outcomes, invitation/linking, supporter activation/usefulness, reconciliation/access health and the governed tier funnel; concrete events and thresholds remain unresolved
- Admin / Founder assurance — **PARTIAL**; must include billing-event processing, provider/local drift, renewal/cancellation health, cost-to-serve and relationship/access exceptions, with concrete checks and thresholds still unresolved
- Risk / trust / accessibility — **PARTIAL**; provider secrets/payment-data boundary, payer/supporter separation, pricing transparency and adult-payer policy are governed, but exact verification/consent/age-assurance, VAT/tax implementation and current UK legal implementation still require validation
- Technical feasibility and dependencies — **PASS** for provider architecture; Stripe/Supabase service boundary, hosted surfaces, verified webhooks, local projection and reconciliation are approved, while exact schema, lifecycle-state mapping, cache/refresh semantics and implementation details remain unresolved
- Test and assurance approach — **PARTIAL**; the architecture now defines mandatory billing failure modes to test, but the full assurance contract and lifecycle-specific expected outcomes remain unresolved
- Documentation / authority impact — **PARTIAL**; provider ADR, billing architecture, Technology Stack and `INDEX.md` are now aligned, while concrete schema/lifecycle implementation documentation remains pending
- Blocking decisions resolved — **NO**
- Human Definition-of-Ready approval — **NOT REQUESTED / NOT GRANTED**

## Remaining blocking decisions after Stripe architecture approval

- customer-facing plan names if different from Free / Paid / Premium;
- numeric AI/REV and other variable-cost allowances, supported by unit economics within the approved price envelope and VAT-inclusive stress scenario;
- VAT/tax implementation consistent with the approved customer-facing prices;
- exact payer age-assurance/declaration implementation and checkout legal wording;
- detailed learner/supporter identity and relationship-verification method;
- invitation expiry/recovery, unlinking safeguards and exceptional support processes;
- age-specific learner purchase/upgrade calls-to-action;
- detailed upgrade, downgrade, cancellation, expiry, failed-payment, grace/retry, refund/cooling-off and recovery behaviour;
- entitlement/supporter-access refresh and caching design;
- concrete billing/account/relationship schema, RLS/authorization and lifecycle-state mapping;
- concrete learner, payer and supporter analytics/event contract and Founder assurance thresholds;
- final test/assurance contract covering price/cadence correctness, role separation, privacy/entitlement bypass, webhook verification/replay/order/loss, reconciliation and provider outage/recovery; and
- current UK consumer, child-design, advertising/privacy, tax and subscription requirements applicable to the selected implementation.

## Documentation-impact check — Stripe billing architecture increment

This approval resolves a technical architecture blocker, so the governed branch:

- creates ADR-0014 for the Stripe provider and merchant/billing boundary decision;
- creates `docs/technical/Subscription Billing Architecture.md` for the approved target service, webhook, reconciliation and authorization architecture;
- updates `docs/technical/Technology Stack.md` to identify Stripe as an approved FI-002 target dependency while making clear it is not yet implemented;
- updates `INDEX.md` so future agents can locate the approved billing architecture; and
- updates this FI-002 analysis record so provider selection is no longer falsely reported as unresolved.

No production Stripe configuration, Supabase billing schema, webhook handler, checkout code, entitlement integration, VAT implementation, numeric AI allowance or `Analyse → Ready` approval is created by this decision.

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

Definition-of-Ready analysis is therefore active and FI-002 is in `Analyse`. This does **not** constitute approval of pricing, packaging, implementation, billing-provider selection or the later `Analyse → Ready` gate.

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

## Preliminary Definition-of-Ready position

- Student problem and target user — **PASS**
- Strategic case — **PASS**
- User-value hypothesis — **PASS**
- Experience and simplicity — **PARTIAL**; contextual visibility and value-selling principle agreed, detailed patterns and recovery states remain
- Evidence / intelligence model — **PARTIAL**; commercial/learning evidence separation agreed, data model remains
- REV role — **PARTIAL**; restrained role agreed, detailed behaviours remain
- MVP boundary — **BLOCKED**
- Free / Paid / Premium value ladder — **BLOCKED**
- Upgrade / conversion hypothesis — **PARTIAL**; contextual consultative pattern agreed, proposition and purchaser journey remain
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

- exact Free / Paid / Premium value ladder and entitlement matrix;
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

## Documentation-impact check for this analysis start

This change records product-management lifecycle evidence and active Definition-of-Ready analysis only. It does not yet change normative product behaviour or current implementation truth.

No production code, technical architecture, pricing authority or plan entitlement matrix is approved by this record.

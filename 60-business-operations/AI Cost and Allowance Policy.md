---
title: "Revision AI Cost and Allowance Policy"
document_id: "revision-ai-cost-and-allowance-policy"
document_type: "domain-authority"
authority: "business-operations"
status: "active"
version: "1.0"
owner: "Founder"
effective_date: "2026-08-21"
last_reviewed: "2026-08-21"
review_cadence: "monthly during FI-002/FI-003 definition, then quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["FI-002 AI/REV variable-cost envelope", "cost-weighted AI allowance principle", "commercial AI cost guardrails"]
depends_on: ["Pricing and Billing Policy", "Subscription Plans and Entitlements", "Product KPI Framework", "AI Agent Constitution"]
supersedes: null
---
# AI Cost and Allowance Policy

## Purpose

Define the Founder-approved commercial cost envelope and allowance principles for variable-cost AI/REV capability without prematurely inventing customer-facing message limits, model choices or FI-003 tutor behaviour.

This authority governs **commercial AI cost guardrails** for FI-002. It does not approve a particular AI provider, model, prompt architecture, public usage quota or REV implementation.

Customer prices remain governed by `60-business-operations/Pricing and Billing Policy.md`. Tier jobs and entitlement policy remain governed by `10-product-governance/Subscription Plans and Entitlements.md`. The fuller REV tutor remains separately governed through FI-003.

## Founder decision

Founder decision on 21 August 2026:

`Approve FI-002 AI cost envelope and allowance principle`

The approved decision has two parts:

1. establish conservative average monthly AI/REV variable-cost envelopes for Free, Paid and Premium; and
2. use a **cost-weighted allowance architecture** rather than guessing arbitrary message-per-day limits before real REV workloads are defined and evaluated.

## Approved planning envelopes

For FI-002 commercial modelling and future entitlement design, the current average monthly variable AI/REV cost envelopes are:

| Tier | Approved average AI/REV cost envelope |
|---|---:|
| Free | **≤ £0.10 per active learner-month** |
| Paid | **≤ £0.60 per active learner-month** |
| Premium | **≤ £1.85 per active learner-month** |

These are internal planning envelopes, not customer-facing promises and not hard per-user spend caps.

The precise production definition of an `active learner-month`, measurement denominator and cohort treatment must be finalised in the FI-002/FI-003 measurement contract before implementation is Ready. That definition must not be chosen retrospectively merely to make the envelope appear healthy.

## Annual-plan economics are the commercial floor

Paid and Premium AI allowances must be designed against the lower-margin approved **annual** subscription economics rather than assuming every customer pays the higher monthly-equivalent price.

The envelopes were approved using a deliberately conservative planning basis that includes:

- the approved annual consumer price;
- current provider/payment cost assumptions at the time of decision;
- a VAT-inclusive stress scenario rather than assuming favourable tax treatment indefinitely; and
- retained headroom for infrastructure, data, support, refunds/failures and business contribution beyond AI inference cost.

External payment fees, tax rules and model pricing are changeable facts and must be revalidated during implementation and subsequent reviews. They are not frozen by this policy.

If updated external economics mean the approved cost envelope cannot support a genuinely useful tier, Revision must escalate the commercial/product decision rather than silently degrading educational value.

## What the envelope covers

The envelope is intended to control material **variable AI/REV inference cost**, including provider/model usage that scales materially with learner interactions.

It should be measured separately from:

- Stripe/payment and billing fees;
- VAT or other tax treatment;
- base Supabase/hosting/infrastructure cost;
- deterministic application logic;
- content-production cost;
- support and refund cost; and
- other non-AI operating expenditure.

This separation is required so a healthy-looking AI metric cannot hide an unhealthy overall tier contribution.

## Cost-weighted allowance principle

Revision should govern variable-cost AI usage through internal **cost-weighted capability accounting** rather than treating every REV interaction as economically equivalent.

Different AI activities may have materially different marginal cost because of:

- model/provider route;
- input/context size;
- output length;
- retrieval requirements;
- reasoning depth;
- multimodal or voice processing where separately approved; and
- repeated or background model calls needed to complete the learner task.

The entitlement/usage architecture must therefore be capable of representing an allowance in a way that reflects the cost of the approved capability rather than only counting raw chat messages.

The exact internal unit, conversion logic and production metering implementation remain Definition-of-Ready/implementation decisions. They must be deterministic enough to test and explain operationally.

## Learner experience principle

Commercial controls must preserve Revision's approved tier ladder:

- **Free** receives a genuine bounded REV experience that can demonstrate the real Revision proposition;
- **Paid** receives generous routine REV support suitable for serious self-service revision; and
- **Premium** may receive substantially deeper, higher-cost and more personalised REV support once FI-003 or another separately approved capability creates a genuinely qualitative Premium proposition.

The product should not expose raw token counts, provider spend or obscure internal cost units to learners merely because those are useful operational controls.

Do not invent a public rule such as `20 messages per day`, `15 turns per session` or similar solely because it is easy to meter. A learner-facing quota must be justified by real tutor-flow evidence, learner value, cost distribution and experience testing.

## Routing before interruption

Where educational quality and safety allow it, Revision should try to keep a useful learner interaction within the commercial envelope through architecture before abruptly terminating the interaction.

Appropriate techniques may include:

- deterministic product logic for tasks that do not require generative reasoning;
- routing routine work to the least-cost model/provider route that passes the required quality and safety evaluation;
- escalating to more capable/high-cost reasoning only when it materially improves the learner outcome;
- retrieving only relevant curriculum/content/evidence context;
- structured learner-state summaries rather than repeatedly replaying full history;
- bounded conversation summaries;
- safe caching/reuse where appropriate; and
- concise output where additional verbosity would not improve learning.

Cost reduction must not justify unsupported educational claims, weaker safety, privacy leakage, fabricated learner knowledge or degraded accessibility.

If a hard commercial boundary is eventually required, the learner experience and fallback must be explicitly governed rather than emerging accidentally from an API error or provider limit.

## No model or provider decision

This policy is deliberately model-agnostic.

The approval of the cost envelope does **not** approve:

- OpenAI or any other AI provider for FI-003;
- a particular model family;
- a fixed model-routing table;
- token limits;
- a particular context-window strategy; or
- a customer-facing claim about model capability.

Provider/model choices must follow the applicable engineering, privacy, evidence, safety and AI-governance process. Model/provider pricing and capabilities must be revalidated when implementation decisions are made because they change over time.

## Relationship to quantitative entitlements

FI-002 should support quantitative entitlements because higher-variable-cost capabilities may require governed limits.

This policy establishes the **commercial envelope and cost-weighted principle**, but it does not set the eventual learner-facing quota for REV or another future AI capability.

Exact public allowances remain feature-specific Definition-of-Ready work. FI-003 should use representative tutor journeys and quality evaluation to determine what real usage pattern fits inside the envelope before any public quota is approved.

A public allowance may differ by Free, Paid and Premium only where the resulting product remains consistent with the approved value ladder and Free remains genuinely useful.

## Premium rule

Premium must not be launched merely because its higher AI envelope can fund more inference.

The existing product rule remains: Premium requires a separately approved **qualitative** learner-side value difference, such as deeper tutor-style intelligence or personalisation. `More messages` alone is not sufficient Premium differentiation.

## Measurement and Founder assurance

Before FI-002/FI-003 implementation is Ready, the measurement contract must make it possible to monitor at least:

- average variable AI/REV cost per active learner-month by tier;
- cost distribution and heavy-use tail behaviour rather than average alone;
- cost by material REV/AI capability and model/provider route;
- cost by monthly versus annual commercial cohort where useful;
- frequency and cause of allowance pressure, routing fallback or hard-boundary events;
- learner usefulness/engagement when lower-cost routes are used;
- Free retention and evidence that cost control has not reduced Free to a non-functional demo;
- Paid/Premium use of the additional capability unlocked by payment;
- tier-level contribution/cost-to-serve alongside, not replaced by, the AI cost metric; and
- material complaints, confusion or trust harm caused by usage controls.

The final event names, dashboards, percentiles and alert thresholds remain Definition-of-Ready work.

## Review and breach handling

During FI-002/FI-003 definition and initial live calibration, this policy should be reviewed frequently because AI pricing and usage distributions can move quickly.

If measured or forecast average cost materially exceeds the approved envelope, the response order should be:

1. verify measurement and external pricing assumptions;
2. identify whether context/output/model routing is inefficient;
3. improve architecture where learner value can be preserved;
4. assess whether the tier/package allowance is incorrectly designed; and
5. escalate for a governed price, envelope or capability decision if sustainable operation cannot otherwise be achieved.

Do not silently lower educational quality or rewrite the learner proposition to hide a budget breach.

## Change authority

Changing the £0.10 / £0.60 / £1.85 planning envelopes requires a governed Founder commercial decision.

Changing a customer-facing quota, material tier capability or Premium proposition requires the relevant product/commercial authority change as well.

Routine model routing or implementation optimisation inside the approved envelope does not automatically require a new commercial decision, but material architecture, provider, privacy, safety or user-experience changes must still follow their own governed change process and documentation requirements.

## Documentation-impact rule

Material changes to AI/REV cost envelopes or the cost-weighted allowance principle must update this authority through a governed PR.

Customer price changes belong in `Pricing and Billing Policy.md`; tier entitlement changes belong in `Subscription Plans and Entitlements.md`; actual REV capability/usage design belongs in FI-003 and its promoted authorities; implementation detail belongs in code/technical documentation after the relevant feature has achieved human-approved `Ready`.

# Feature Definition and Measurement Workflow

**Status:** Draft authority candidate — v0.1  
**Owner:** Product  
**Purpose:** Ensure material product features are defined with enough product, commercial, measurement and assurance thinking to ship quickly without treating implementation as the whole feature decision.

## Operating principle

This is a lightweight product-definition workflow, not a stage-gate process.

The goal is to make the important product decisions once, record them clearly, and move into implementation quickly. The depth should be proportionate to the feature. Small features may satisfy this in a concise record; larger or riskier features may need deeper analysis.

Governance should capture decisions already made and protect product quality. It should not create unnecessary delay.

## Required feature definition

Before material implementation begins, the Product Manager should define or recommend, where relevant:

1. **Student problem** — what problem is being solved, for whom, and why it matters.
2. **User value hypothesis** — what should become materially easier, clearer, more effective or less stressful for the learner.
3. **Product / strategic value** — how the feature strengthens Revision's core proposition, differentiation, engagement, retention or commercial potential.
4. **Experience and simplicity** — the intended journey, including how complexity is kept behind the product, progressive disclosure, sensible defaults, accessibility, overrides and important failure/empty states.
5. **Evidence / intelligence model** — what learner, curriculum or behavioural data informs the feature, what new evidence it creates, and what uncertainty must remain explicit.
6. **REV role** — whether REV explains, guides, adapts, recommends or is intentionally not involved.
7. **MVP boundary** — the minimum capability required to prove the hypothesis, plus deliberate exclusions.
8. **Packaging recommendation** — how the capability should work across the assumed three-level commercial model: **Free, Level 1 and Level 2**. The recommendation must explain what remains genuinely useful for Free and what materially stronger value justifies each upgrade level.
9. **Measurement contract** — the primary hypothesis and the adoption, useful-engagement, student-value/outcome, subjective-experience, retention/commercial, cost, guardrail and operational metrics needed, following `60-business-operations/Product KPI Framework.md`.
10. **Admin / Founder assurance** — what should be surfaced in Admin so the Founder can tell whether the capability is adopted, valuable, healthy and generating material exceptions or failures.
11. **Risk / trust / accessibility** — important educational, privacy, safeguarding, security, accessibility or claims implications.
12. **Documentation impact** — which normative authority, technical documentation, decision records, indexes or registers must change if the feature is approved or implemented.

Not every feature needs every item at equal depth. A field may be explicitly marked not material rather than padded with unnecessary analysis.

## Packaging principle

Assume three product levels for MVP commercial design unless Founder-approved authority later changes that model:

- **Free** — must provide genuine standalone value and demonstrate Revision's core proposition.
- **Level 1** — should unlock a clearly stronger, repeat-use benefit that is easy for a student or parent to understand.
- **Level 2** — should provide the fullest intelligent/personalised experience and/or materially higher-value capability, especially where AI or advanced adaptation creates additional cost or differentiation.

Do not create artificial limitations whose main purpose is to make Free frustrating. Packaging should distinguish value, depth, scale, intelligence, convenience or cost-intensive capability rather than deliberately breaking the core learning experience.

Exact plan names, prices and final entitlement boundaries remain subject to dedicated product/commercial authority.

## Product-manager recommendation rule

The Product Manager should make a recommendation rather than merely list options wherever the evidence and current authority support one. Genuine trade-offs or unresolved Founder choices should be surfaced explicitly.

## Relationship to implementation

Once the feature direction is approved and the necessary product authority is updated, implementation follows `80-company-workflows/Governed Implementation Workflow.md`.

The feature definition and implementation may be prepared in the same governed branch/PR when that is the fastest safe path, provided normative authority is not silently bypassed.

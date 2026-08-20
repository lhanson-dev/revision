# Feature Definition and Measurement Workflow

**Status:** Active — v1.0  
**Owner:** Product / Founder  
**Purpose:** Define the repeatable path by which a material Revision feature moves from an idea to a human-approved, implementation-ready definition, with product, commercial, experience, evidence, measurement and assurance decisions made before development begins.

## Operating principle

Revision should make the important feature decisions once, record them clearly and then move into implementation with as little ambiguity as possible.

This workflow is proportionate rather than bureaucratic. Small features may satisfy the Definition of Ready concisely; large, risky, AI-intensive or cross-cutting features require deeper analysis. The required thinking may be brief, but it may not be silently skipped.

A feature being attractive, technically feasible, present in the backlog or recommended by an AI agent does not make it ready for development.

## Canonical feature lifecycle

Use the following normal lifecycle for material product features:

`New → To Do → Analyse → Ready → In Progress → Live`

### New

The feature has been captured for consideration. Revision has not yet made the human product decision that the capability belongs in the product.

`New → To Do` requires an explicit human product decision that the feature belongs in Revision. By default that decision belongs to the Founder unless authority is deliberately delegated through governance.

### To Do

Revision has agreed that the feature belongs in the product, but detailed work to satisfy the Definition of Ready has not yet started.

`To Do` records a product-management state. It must point to the relevant approved product authority or decision evidence; the backlog status does not itself replace normative authority.

### Analyse

Active product analysis is underway to make the feature Ready. This is where Revision challenges the idea, resolves product and commercial choices, designs the intended experience, assesses evidence and risk, confirms technical feasibility, defines assurance and measurement, and establishes the implementation boundary.

Analysis may result in the feature returning to `New`, becoming `Parked` or `Rejected`, or being materially reshaped. Analysis is not a commitment to build the original concept unchanged.

### Ready

The complete Definition of Ready has been satisfied and an explicit human approval to proceed to development has been recorded.

An AI agent may assess the criteria and recommend `Ready`, but it may not self-approve the transition. Passing automated checks, technical feasibility, an earlier decision that the feature belongs in Revision, or silence do not constitute Definition-of-Ready approval.

`Ready` means development could safely begin without reopening fundamental product decisions. It does not mean development has started.

### In Progress

Governed implementation has actually started on the approved scope. Implementation follows `80-company-workflows/Governed Implementation Workflow.md`.

A feature must not move to `In Progress` merely because a branch exists, a prototype was explored or technical investigation occurred during analysis.

### Live

Implementation evidence confirms the feature is available on the canonical production runtime.

A merge, deployment attempt or passing CI run is not by itself evidence that a feature is `Live`. Production-route verification must establish that the intended user-facing capability is actually available.

## Exception / disposition states

The following states sit outside the normal forward lifecycle:

- **Parked** — deliberately not progressing now, but potentially worth revisiting.
- **Rejected** — deliberately not pursuing; retain the rationale.
- **Retired** — previously approved or live capability deliberately withdrawn or superseded.

These states preserve decision history and must not be used to conceal unresolved work.

## Lightweight invocation protocol

The Founder should not need to reproduce the feature workflow in a long prompt.

### `Start FI-XXX`

The AI agent must inspect current `main`, locate the feature in the canonical backlog, read the applicable authority and continue according to current lifecycle state:

- **New** — assess whether the feature should belong in Revision and bring the human product decision required for `To Do`.
- **To Do** — move into active analysis and work systematically toward Definition of Ready.
- **Analyse** — resume from the first material unresolved Definition-of-Ready area.
- **Ready** — if the instruction is to begin the feature, enter governed implementation and move to `In Progress` only when implementation actually starts.
- **In Progress** — inspect the governed branch/PR and current implementation evidence and continue delivery.
- **Live** — treat further work as a change/enhancement to an existing live capability and re-run proportionate definition where behaviour materially changes.

The agent must not use chat memory as the feature record when repository state is available.

### `Continue FI-XXX`

Inspect repository state and resume the next unresolved piece of work without asking the Founder to restate the feature process.

### `Status FI-XXX`

Report at minimum:

- lifecycle status;
- Definition-of-Ready position where applicable;
- key decisions already recorded;
- unresolved blockers or Founder decisions;
- current implementation/PR/production state where applicable; and
- the next governed step.

## Analysis expectations

During `Analyse`, the Product Manager / AI agent should make recommendations rather than force the Founder to complete a template. The agent should resolve what can be resolved from current authority, evidence, research and implementation context, challenge weak assumptions, and surface only genuine product choices or approval points.

Competitor behaviour is evidence, not a reason to copy a capability. A feature must be tested against Revision's student problem, product principles, differentiation and opportunity cost.

## Definition of Ready

A material feature may move from `Analyse` to `Ready` only when every applicable criterion below is explicitly satisfied. A criterion may be marked not material only with a brief rationale; it must not be omitted silently.

### 1. Student problem and target user

The definition states:

- who has the problem;
- what problem is being solved;
- why it matters; and
- why Revision is an appropriate product to solve it.

### 2. Strategic case

The definition explains:

- how the feature strengthens Revision's core proposition and product loop;
- its differentiation or strategic value;
- credible alternatives, including doing nothing; and
- why the feature is worth the opportunity cost now.

### 3. User-value hypothesis

There is a clear, falsifiable hypothesis describing what should become materially easier, clearer, more effective, more motivating or less stressful for the intended learner.

### 4. Experience and simplicity

The intended learner experience is sufficiently defined to remove fundamental ambiguity, including where relevant:

- entry point and primary journey;
- explanation of purpose;
- success/result and useful next action;
- empty, failure and recovery states;
- important edge cases and overrides;
- mobile/tablet/desktop behaviour; and
- accessibility expectations.

### 5. Evidence / intelligence model

The definition explains:

- what learner, curriculum, assessment or behavioural evidence informs the feature;
- what new evidence the feature creates;
- evidence quality/confidence and uncertainty rules;
- what downstream decisions the evidence may influence; and
- what the evidence must not be interpreted as.

### 6. REV role

The definition states whether REV explains, teaches, guides, recommends, adapts, acts proactively, converses or is deliberately not involved. AI should not be added merely because the product contains REV.

### 7. MVP boundary

The minimum capability needed to prove the hypothesis is explicit, together with deliberate exclusions and later possibilities. Development must not be asked to discover the basic product boundary.

### 8. Free / Paid / Premium value ladder

Every material learner-facing feature must be assessed across **Free, Paid and Premium** before it is Ready, even where the final decision is that a particular capability should not vary by tier.

The definition must state for each applicable tier:

- the genuine student value available;
- the capability, depth, scale, intelligence or convenience provided;
- any legitimate limit or allowance;
- why the next tier is materially more desirable;
- how the learner can understand or discover that additional value; and
- whether the resulting cost-to-serve is commercially sustainable.

The governing commercial principle is:

**Free proves the value. Paid compounds the value. Premium maximises the value.**

Free must remain genuinely useful as a standalone learning experience. Paid/Premium differentiation should come from greater value, depth, personalisation, scale, convenience, intelligence or materially higher-cost capability rather than deliberately damaging the free journey.

Underlying evidence, safety controls, educational truth, accessibility requirements and data needed to operate the product correctly must not be degraded by payment status merely to create an upgrade incentive.

Exact global plan names, prices and entitlement boundaries remain subject to dedicated product/commercial authority.

### 9. Upgrade / conversion hypothesis

Where tiering is material, the definition must explain why exposure to the feature should make the next tier more attractive and how that desire is earned.

Preferred mechanisms include:

- making additional capability discoverable without pretending it is already available;
- contextual upgrade moments when the stronger capability solves a real learner need;
- previews, examples or bounded demonstrations where appropriate;
- explaining the additional learner benefit rather than merely displaying a lock; and
- preserving the learner's existing work when an entitlement boundary is reached.

Do not use false scarcity, manipulative countdowns, exam-anxiety exploitation, shame, guilt, misleading controls or a deliberately broken free journey to drive conversion.

### 10. Measurement contract

Define the primary hypothesis and the events/data needed to assess the feature, following `60-business-operations/Product KPI Framework.md`.

Where relevant this includes:

- adoption;
- useful engagement;
- student value/outcome;
- subjective experience;
- retention/commercial impact;
- cost-to-serve;
- guardrails;
- operational/health measures; and
- tier/upgrade funnel measurement.

For tiered features, useful funnel measurement should normally distinguish:

`eligible → premium value exposed → upgrade intent → proposition viewed → converted → unlocked benefit used → retained`

Conversion must not be optimised in isolation from student value, free-tier health, trust and retention.

### 11. Admin / Founder assurance

Define what the Founder should be able to see to determine whether the feature is adopted, valuable, commercially healthy, operationally healthy and generating material exceptions or failures.

### 12. Risk / trust / accessibility

Material educational, claims, privacy, safeguarding, security, accessibility, AI/model, abuse, operational and commercial risks are identified with appropriate controls or accepted residual risk.

### 13. Technical feasibility and dependencies

Before Ready, Revision must have enough technical analysis to establish that the feature is realistically implementable, understand major architecture/data/service dependencies, identify material unknowns and estimate cost/complexity sufficiently for a development decision.

Detailed implementation design may continue after Ready. Exploration spikes during `Analyse` are allowed where needed to resolve feasibility, but a spike must not silently become production implementation.

### 14. Test and assurance approach

The definition identifies how the critical intended behaviour and material risks will be proven, including where relevant unit/integration/browser/contract/accessibility/security/AI-evaluation/data-quality/production-smoke assurance.

The exact suite is risk-based and proportionate, but assurance must not be invented after the feature is built.

### 15. Documentation and authority impact

Identify which normative product, experience, evidence/trust, commercial, engineering or AI authority must change, plus any technical documentation, ADRs, indexes or registers required by the governed change.

The applicable normative authority must be updated before or as the feature is approved Ready; the backlog must never become a competing source of product truth.

### 16. Blocking decisions resolved

No unresolved decision may remain that would force development to choose fundamental product behaviour, commercial packaging, evidence semantics, critical user experience or a material trust/safety position by accident.

Known non-blocking uncertainties or accepted risks must be explicit.

### 17. Human Definition-of-Ready approval

The final gate is explicit human approval that the feature has met the Definition of Ready and may proceed to development.

By default the Founder provides this approval unless a future governance change explicitly delegates it.

The approval should be recorded against the feature and linked to the relevant governed authority/change evidence.

An AI agent may present a concise pass/fail readiness assessment and recommend `Ready`; it may not approve its own assessment.

## Definition-of-Ready decision format

At the final decision, present a concise assessment such as:

- Student problem — PASS / BLOCKED
- Strategic case — PASS / BLOCKED
- User value — PASS / BLOCKED
- Experience — PASS / BLOCKED
- Evidence / intelligence — PASS / BLOCKED
- REV role — PASS / BLOCKED / N/A
- MVP boundary — PASS / BLOCKED
- Free / Paid / Premium — PASS / BLOCKED / N/A with rationale
- Upgrade hypothesis — PASS / BLOCKED / N/A
- Measurement — PASS / BLOCKED
- Founder/Admin assurance — PASS / BLOCKED
- Risk / trust / accessibility — PASS / BLOCKED
- Technical feasibility — PASS / BLOCKED
- Test / assurance approach — PASS / BLOCKED
- Documentation / authority impact — PASS / BLOCKED
- Blocking decisions — NONE / LISTED

Then state the Product Manager / AI recommendation and request the explicit human `Ready` decision.

## Relationship to implementation

Material feature implementation may begin only after the feature is `Ready` with recorded human Definition-of-Ready approval.

Once implementation starts, set the feature to `In Progress` and follow `80-company-workflows/Governed Implementation Workflow.md`, including canonical route/runtime verification before code changes.

Definition and implementation may still be prepared efficiently within the same broader delivery initiative, but material production implementation must not begin while the feature remains `New`, `To Do` or `Analyse`.

## Documentation-impact check

This workflow is the canonical repeatable feature-definition and readiness process. Changes to the lifecycle, Definition of Ready, human approval gate or mandatory feature commercial design must update this document and the canonical backlog rules together. Changes to implementation mechanics must remain aligned with the Governed Implementation Workflow and AI operating rules.

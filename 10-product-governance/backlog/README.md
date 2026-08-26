# Product Backlog

This subdirectory contains Revision's **non-authoritative product backlog and product-management working registers**.

It sits inside the product domain so that product-management agents and humans have one clear place to find candidate features, but its contents are **not approved product behaviour** unless explicitly promoted into the approved product authority at the root of `10-product-governance/` or otherwise supported by the appropriate governed decision/authority evidence.

## Strategic anchor — Personalised Revision Intelligence

The governing product strategy is `00-company-foundation/Product Strategy.md`.

Its core strategic rule is:

> **Revision should know the student better after every useful interaction.**

The product should use reliable learner evidence and legitimate planning context to make later teaching, practice, feedback, exam preparation and recommendations more useful.

Before prioritising or analysing a material backlog feature, read the strategy and ask whether the feature strengthens the connected learner-intelligence loop rather than merely matching a competitor feature or creating another isolated tool.

The product-management mapping from the strategy to existing feature ownership is:

- `Personalised Revision Intelligence Strategy Mapping.md`

This mapping keeps the major strategic bets visible without inventing duplicate feature IDs or bypassing lifecycle approval. In particular, the current strategy maps structured contextual REV to FI-003, evidence-linked exam marking to FI-007, adaptive recall to FI-009, and the Weakness Repair loop across FI-010 and FI-011.

## Boundary

- `00-company-foundation/Product Strategy.md` → governing strategic product thesis and allocation rules.
- `10-product-governance/*.md` at the root → approved or draft product authority, as identified by each document's status.
- `10-product-governance/backlog/` → candidate ideas, lifecycle state, prioritisation inputs and product-management records. Backlog state reflects governed decisions but does not replace normative authority.
- code and `docs/technical/` → current implementation/live truth.
- `decisions/` → material decision history.
- `research/` → deeper investigation, external evidence and exploratory work supporting product decisions.

## Canonical backlog

- `Product Feature Backlog.md` — canonical inventory of product feature ideas and their current product-management status.
- `Personalised Revision Intelligence Strategy Mapping.md` — current product-management mapping from the governing strategy to existing backlog feature ownership and sequencing; non-authoritative and lifecycle-preserving.

## Canonical lifecycle

Material product features use the normal lifecycle:

`New → To Do → Analyse → Ready → In Progress → Live`

Definitions and transition rules are governed by `80-company-workflows/Feature Definition and Measurement Workflow.md`.

In summary:

- **New** — captured for consideration; no human decision yet that the feature belongs in Revision.
- **To Do** — human decision recorded that the feature belongs in Revision; Definition-of-Ready analysis has not yet started.
- **Analyse** — active work is underway to satisfy the Definition of Ready.
- **Ready** — all applicable Definition-of-Ready criteria pass and explicit human approval to proceed to development is recorded.
- **In Progress** — governed implementation has actually started.
- **Live** — production evidence confirms the capability is available on the canonical production runtime.

Exception/disposition states are:

- **Parked** — deliberately not progressing now.
- **Rejected** — deliberately not pursuing.
- **Retired** — previously approved/live capability deliberately withdrawn or superseded.

## Human approval boundaries

Two lifecycle transitions require explicit human product approval by default:

1. **New → To Do** — confirmation that the feature belongs in Revision.
2. **Analyse → Ready** — confirmation that the complete Definition of Ready has been met and the feature may proceed to development.

By default the Founder provides these approvals unless a future governance change explicitly delegates them.

An AI agent may assess, recommend and prepare the governing changes, but may not self-approve either boundary.

Adoption of a product strategy does not automatically promote every mapped candidate feature. Existing feature lifecycle states remain unchanged until their own governed approval boundary is deliberately crossed.

## Definition-of-Ready boundary

A feature must not enter material implementation while it is `New`, `To Do` or `Analyse`.

`Ready` requires the complete criteria in `80-company-workflows/Feature Definition and Measurement Workflow.md`, including product problem/value, strategic case, intended experience, evidence semantics, REV role, MVP boundary, **Free / Paid / Premium value ladder**, upgrade/conversion hypothesis, measurement, Founder/Admin assurance, risk/trust/accessibility, technical feasibility, test/assurance approach, documentation impact and explicit human approval.

For strategy-mapped features, the strategic case should explicitly explain:

- how the feature improves the connected learner-intelligence loop;
- what reliable learner evidence or context it consumes and produces;
- how its outputs improve later support or recommendations where applicable;
- whether a deterministic mechanism can achieve the outcome more simply than generative AI; and
- why its bootstrap opportunity cost is justified relative to strengthening the core loop.

The commercial rule is not permission to degrade the free experience. Free must provide genuine standalone value; Paid and Premium should create stronger, discoverable value that earns upgrade desire without manipulative or anxiety-exploiting mechanics.

## Promotion rule

A backlog item becomes governed product scope only when the relevant product authority or decision evidence is deliberately updated through the governed branch/PR process.

`To Do` therefore reflects that an approval exists; it does not create that approval by itself. The backlog entry should link to the resulting authority/decision and remain for traceability.

A feature may become `Ready` only after the applicable authority has been updated before or as part of the governed readiness change. `Live` may be asserted only from production implementation evidence.

## Lightweight invocation

The standard AI interaction is intentionally short:

- `Start FI-XXX`
- `Continue FI-XXX`
- `Status FI-XXX`

For mapped Personalised Revision Intelligence features, those commands should cause the agent to read both the canonical feature entry and `Personalised Revision Intelligence Strategy Mapping.md` before substantive product definition.

The detailed behaviour behind those commands is governed by the Feature Definition and Measurement Workflow. The repository, not chat history, is the persistent record of lifecycle state and decisions.

# Product Backlog

This subdirectory contains Revision's **non-authoritative product backlog and product-management working registers**.

It sits inside the product domain so that product-management agents and humans have one clear place to find candidate features, but its contents are **not approved product behaviour** unless explicitly promoted into the approved product authority at the root of `10-product-governance/` or otherwise supported by the appropriate governed decision/authority evidence.

## Boundary

- `10-product-governance/*.md` at the root → approved or draft product authority, as identified by each document's status.
- `10-product-governance/backlog/` → candidate ideas, lifecycle state, prioritisation inputs and product-management records. Backlog state reflects governed decisions but does not replace normative authority.
- code and `docs/technical/` → current implementation/live truth.
- `decisions/` → material decision history.
- `research/` → deeper investigation, external evidence and exploratory work supporting product decisions.

## Canonical backlog

- `Product Feature Backlog.md` — canonical inventory of product feature ideas and their current product-management status.

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

## Definition-of-Ready boundary

A feature must not enter material implementation while it is `New`, `To Do` or `Analyse`.

`Ready` requires the complete criteria in `80-company-workflows/Feature Definition and Measurement Workflow.md`, including product problem/value, strategic case, intended experience, evidence semantics, REV role, MVP boundary, **Free / Paid / Premium value ladder**, upgrade/conversion hypothesis, measurement, Founder/Admin assurance, risk/trust/accessibility, technical feasibility, test/assurance approach, documentation impact and explicit human approval.

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

The detailed behaviour behind those commands is governed by the Feature Definition and Measurement Workflow. The repository, not chat history, is the persistent record of lifecycle state and decisions.

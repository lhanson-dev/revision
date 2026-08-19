# Product Backlog

This subdirectory contains Revision's **non-authoritative product backlog and product-management working registers**.

It sits inside the product domain so that product-management agents and humans have one clear place to find candidate features, but its contents are **not approved product behaviour** unless explicitly promoted into the approved product authority at the root of `10-product-governance/`.

## Boundary

- `10-product-governance/*.md` at the root → approved or draft product authority, as identified by each document's status.
- `10-product-governance/backlog/` → candidate ideas, prioritisation inputs and backlog state. Presence here does not approve scope.
- code and `docs/technical/` → current implementation/live truth.
- `decisions/` → material decision history.
- `research/` → deeper investigation, external evidence and exploratory work supporting product decisions.

## Canonical backlog

- `Product Feature Backlog.md` — canonical inventory of product feature ideas and their current product-management status.

## Promotion rule

A backlog item becomes approved product scope only when the relevant product authority is deliberately updated through the governed branch/PR process. The backlog entry should then link to the resulting authority or decision record and remain for traceability.

# Knowledge Architecture

## Purpose
Define where project knowledge belongs and how it moves from exploration to authority to implementation.

## Knowledge classes

### Normative truth
What **should** be true. Lives in the numbered authority folders.

### Product backlog / product-management state
What the product **might** do, what is being considered, and the current prioritisation/lifecycle state of candidate capabilities.

The canonical product feature backlog lives in `10-product-governance/backlog/` because it belongs to the product-management domain, but backlog material is explicitly **non-authoritative** until deliberately promoted into approved product authority.

Folder location alone does not determine authority; document type, status and the local folder rules must be respected.

### Current implementation truth
What the system **currently does**. Lives in code and `docs/technical/`.

### Historical evidence
What was observed at a point in time. Lives in `audits/`, `decisions/`, registers and `archive/`.

### Research
Ideas, hypotheses, prototypes and evidence gathering that require deeper investigation. Lives in `research/`. Research is not authority until deliberately promoted.

Research may support a backlog item, but `research/` is not the canonical product feature inventory.

## Core classification rule
- What must the product/company/channel do? → governed authority.
- What product capability might we pursue or how is a candidate currently prioritised? → product backlog/product-management register.
- How does the current repository implement that rule? → code or technical documentation.
- Is it investigation, evidence gathering, a hypothesis or prototype? → research.
- Is it a dated observation? → audit/history.

## Product promotion rule

For product capabilities, the default path is:

`backlog idea → exploration/evidence as needed → Founder-approved product decision → normative product authority → implementation → technical documentation → audit/evidence`

An item may remain in the backlog for traceability after promotion, but its backlog record must link to the resulting authority/decision and must not become a competing source of normative truth.

## Conflict handling
Lower-order documents may explain or implement higher-order rules but may not redefine them. Current code is evidence of implementation state, not automatic permission to redefine authority.

Backlog state must never silently override approved product authority. If a backlog proposal conflicts with current authority, surface the conflict and treat the proposal as a requested authority change.

## General promotion path
`research / backlog → decision/proposal → authority → implementation → technical documentation → audit/evidence`

## Archive rule
Superseded or historical documents must not compete with active authority. Preserve history; do not silently rewrite it.

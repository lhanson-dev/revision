# Migrating an Existing Project

## Purpose
Use this guide when adopting the Product Operating System into a repository that already contains code, documentation, decisions, assets, configuration or production history.

This is an **authority-discovery and controlled-migration process**, not bulk file reorganisation.

## Core rule
> Do not assume an existing document, README, code path, configuration value, comment, screenshot, prototype or production behaviour is approved organisational authority merely because it exists.

Existing material is evidence to inspect. Authority must be identified and approved deliberately.

## Revision classification
**Light Adoption.** The repository is young and small, with one principal README and a compact implementation. If evidence later reveals material conflicts or production risk, reclassify to Controlled Migration.

## Migration phases

### 0 — Protect the existing system
Do not break working code, rename implementation files for tidiness, delete apparently duplicate material, or change product behaviour merely to match the operating-system structure.

### 1 — Inventory the knowledge estate
Record existing documents, code/config that encode behavioural rules, technical architecture, research/history and significant production behaviour in `90-governance-registers/Knowledge Estate Inventory.md`.

### 2 — Establish the constitutional kernel
Maintain `KNOWLEDGE_ARCHITECTURE.md`, `DOCUMENT_TYPES.md`, `AUTHORITY_HIERARCHY.md`, `INDEX.md` and `START_HERE.md`.

### 3 — Discover authority by responsibility
Review founder/strategy, product scope, product behaviour, audience, journeys, brand/design, marketing, evidence/privacy, engineering, operations and AI/workflows.

Classify existing material as: retain as authority; necessary context; dangerous duplicate; implementation detail; research/hypothesis; historical; stale; unsupported; or genuine conflict.

### 4 — Promote authority deliberately
Draft target authority, record its migration disposition, surface unresolved conflicts, open a PR, obtain explicit Founder approval, merge, verify `main`, then archive/redirect superseded sources where appropriate.

### 5 — Separate implementation truth
Describe current architecture, authentication, data model, routing, hosting, integrations and other implementation details in `docs/technical/` without changing working code solely for documentation tidiness.

### 6 — Reconcile implementation with authority
After product/journey authority is clear, compare implementation against it and create explicit gaps/remediation work. Never rewrite approved authority merely to match existing code.

### 7 — Complete migration
Migration completes only when key authority is owned and approved, legacy sources have dispositions, dangerous duplicates are controlled, implementation documentation is separate, conflicts/gaps are visible, `INDEX.md` routes correctly, and Founder merge governance is operating.

## Founder gate
Every merge requires explicit Founder approval unless an active Founder-approved governance change delegates that authority.
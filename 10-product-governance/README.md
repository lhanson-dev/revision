# Product Governance

This folder contains Revision's product-management knowledge: approved product authority at the folder root, plus clearly separated non-authoritative backlog material under `backlog/`.

## Approved product authority

The root-level product documents define what Revision is for, who it serves, how it should behave and the core system and journeys it should support.

Current authority includes:

- `Target Audience and Personas.md`
- `Student Problem Definition.md`
- `Product Promise.md`
- `Product Principles.md`
- `Product System Model.md`
- `Scope and Capability Taxonomy.md`
- `Core User Journeys.md`
- `Information Architecture.md`
- `Subscription Plans and Entitlements.md`

The proposed `Subscription Plans and Entitlements v0.5 Amendment.md` records the 24 August 2026 Founder-directed clarification for Student / Parent / Teacher / School commercial routes, subscription clarity and the Student-first independence rule. It remains proposed until its governed PR is merged; once merged it amends v0.4 on the topics it explicitly identifies.

Together these documents define the current product foundation for the student-first Revision experience.

## Product backlog

`backlog/` contains non-authoritative product-management registers for candidate ideas and prioritisation state.

The canonical feature inventory is:

- `backlog/Product Feature Backlog.md`

Feature analysis and decision records may sit alongside the canonical inventory, including FI-specific analysis files. Presence in an analysis file does not replace the canonical inventory lifecycle state and does not make a feature implementation-ready.

Presence in the backlog does **not** make an idea approved product scope. Backlog items must be deliberately promoted into the appropriate root-level product authority through the governed branch/PR process before they become normative product direction.

## Implementation truth

Product authority answers what the product **should** do.

The backlog answers what the product **might** do or what is being considered/planned.

Code and `docs/technical/` answer what the product **currently does**. A backlog item must not be marked `Live` unless implementation evidence confirms it is available on the canonical runtime.

## Future authority

This folder should also contain lifecycle, prioritisation, entitlements/pricing rules where product-facing, and any further domain product authority needed as Revision develops.

**Migration status:** core product foundation established and approved on main. Existing README/code remain implementation evidence and must be reconciled against this authority rather than treated as policy.

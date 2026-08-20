# Governed Implementation Workflow

## Trigger
Any material implementation change to Revision code, routes, UI, persistence, deployment or technical behaviour.

## Purpose
Prevent implementation work from being applied to the wrong runtime, route, component or migration surface, and prevent material product features entering development before the product definition is genuinely ready.

## Feature-readiness precondition

For material product-feature work, implementation may begin only when the feature has achieved `Ready` under `80-company-workflows/Feature Definition and Measurement Workflow.md`.

`Ready` requires the complete applicable Definition of Ready and explicit human approval to proceed to development. AI agents may recommend readiness but may not self-approve it.

Exploratory technical spikes performed during `Analyse` are allowed only when they are clearly bounded to resolving feasibility or uncertainty. They must not silently become production implementation or move the feature to `In Progress`.

Defect fixes, maintenance and other implementation changes that are not new/material feature development do not require a feature lifecycle state, but still follow the authority, runtime, documentation and assurance rules below.

## Mandatory pre-code checks
Before editing implementation files:

1. **Read authority first.** Start from `INDEX.md` and apply the authority hierarchy, knowledge architecture and AI Agent Constitution.
2. **Confirm feature readiness where applicable.** For material product-feature development, verify the canonical backlog/authority evidence shows `Ready` with recorded human Definition-of-Ready approval. If not, stop production implementation and return to the feature-definition workflow.
3. **Identify the user-facing target.** State the exact product surface, route or URL the change is intended to affect.
4. **Resolve the canonical runtime.** Use current technical documentation and code to identify the runtime, entry point, component/service and deployment artifact that actually serve that target.
5. **Check for competing or migration surfaces.** If more than one route or implementation appears to serve the same learner job, classify each one as canonical, compatibility, legacy, experimental or migration-only before editing.
6. **Surface conflicts.** If authority, technical documentation, deployment configuration and implementation disagree about the canonical target, stop and resolve the conflict before writing code.
7. **Confirm deployment path.** For changes intended for production, verify how the changed files reach the production route and what smoke test proves that route changed.
8. **Confirm approved scope.** For feature development, compare the intended implementation with the Ready definition, including MVP exclusions, Free/Paid/Premium behaviour, evidence semantics, risk controls, measurement and assurance. Material scope changes return to proportionate product analysis and, where they invalidate the approved Definition of Ready, require renewed human readiness approval.
9. **Work on a branch and PR.** The PR must record the target route/runtime and evidence used to identify it.

## Lifecycle update

A feature moves from `Ready` to `In Progress` only when governed implementation actually starts.

A branch existing, a prototype, a technical spike or preparatory documentation alone does not constitute `In Progress`.

A feature moves from `In Progress` to `Live` only when production evidence confirms the intended capability is available on the canonical production runtime.

## Required implementation record
Every implementation PR must state:

- applicable FI identifier and approved `Ready` evidence for material feature work;
- intended user-facing route(s) or product surface;
- canonical runtime / entry point;
- primary files or components changed;
- technical source used to establish that target;
- whether any compatibility or legacy surface also exists;
- how the implementation reflects the approved MVP and Free/Paid/Premium behaviour where applicable;
- how the required measurement/assurance instrumentation is implemented; and
- how tests or production smoke demonstrate the intended route is affected.

## Stop conditions
Stop and surface to the Founder if:

- material feature work has not achieved recorded `Ready` approval;
- implementation would materially contradict or expand the Ready definition without renewed product analysis;
- the canonical runtime or route cannot be established confidently;
- two implementations compete for the same product responsibility;
- a change would redefine the canonical product surface through code alone;
- deployment configuration would publish a different surface from the one being changed; or
- a migration/compatibility route risks being mistaken for the governed product.

## Completion check
Implementation is not complete until code, technical documentation, deployment configuration, product/entitlement behaviour, measurement/assurance and production-route evidence all describe the same current system.

`Live` is a production-evidence state, not a synonym for merged.

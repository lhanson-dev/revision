# Governed Implementation Workflow

## Trigger
Any material implementation change to Revision code, routes, UI, persistence, deployment or technical behaviour.

## Purpose
Prevent implementation work from being applied to the wrong runtime, route, component or migration surface, prevent material product features entering development before the product definition is genuinely ready, and ensure parallel work converges through one canonical `main` integration baseline.

## Feature-readiness precondition

For material product-feature work, implementation may begin only when the feature has achieved `Ready` under `80-company-workflows/Feature Definition and Measurement Workflow.md`.

`Ready` requires the complete applicable Definition of Ready and explicit human approval to proceed to development. AI agents may recommend readiness but may not self-approve it.

Exploratory technical spikes performed during `Analyse` are allowed only when they are clearly bounded to resolving feasibility or uncertainty. They must not silently become production implementation or move the feature to `In Progress`.

Defect fixes, maintenance and other implementation changes that are not new/material feature development do not require a feature lifecycle state, but still follow the authority, runtime, documentation, integration-baseline and assurance rules below.

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
9. **Branch from current `main` and use a PR.** The governed branch must start from the then-current approved `main`. The PR must record the target route/runtime and evidence used to identify it.

## Parallel work and final integration gate

Revision may have multiple active feature, defect, maintenance and governance branches at the same time. They do not become alternative versions of the product: only approved `main` is canonical integration truth.

To support safe parallel delivery without constant branch churn:

1. Branches begin from current `main`.
2. While work is active, a branch may temporarily fall behind as unrelated work merges. It does not need continuous rebasing merely to remain active.
3. When the PR is otherwise complete and ready to enter merge-readiness assurance, perform a **final integration-baseline refresh** against the latest `main`.
4. The refreshed PR head must contain the latest `main` as an ancestor before exact-head CI and before Founder merge approval is requested.
5. For files changed by both the PR and newer `main`, resolve the final combined state deliberately. Shared knowledge/index/register/configuration files must retain newer `main` content plus the PR's intended addition; an old branch copy must never overwrite newer canonical content.
6. Any refresh changes the exact PR head and therefore invalidates earlier exact-head CI and any earlier merge approval. Rerun the required assurance on the refreshed head.
7. Only one PR should occupy the final integration/merge gate at a time. Other ready PRs wait outside that gate; after the active PR merges, they refresh once against the newly updated `main`.
8. Immediately before merge, re-read `main`. If it has advanced since the approved head was refreshed, the PR must leave the gate, refresh again, rerun exact-head assurance and obtain renewed Founder approval.

This is Revision's default manual merge-queue behaviour. A future automated GitHub merge queue may replace the manual serialization only through a governed change that preserves the same canonical-main, exact-head assurance and Founder approval invariants.

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
- how the required measurement/assurance instrumentation is implemented;
- how tests or production smoke demonstrate the intended route is affected; and
- the `main` baseline used for final merge-readiness assurance.

## Stop conditions
Stop and surface to the Founder if:

- material feature work has not achieved recorded `Ready` approval;
- implementation would materially contradict or expand the Ready definition without renewed product analysis;
- the canonical runtime or route cannot be established confidently;
- two implementations compete for the same product responsibility;
- a change would redefine the canonical product surface through code alone;
- deployment configuration would publish a different surface from the one being changed;
- a migration/compatibility route risks being mistaken for the governed product; or
- a final integration refresh exposes a substantive authority, product, schema, route, lifecycle or implementation conflict that cannot be resolved mechanically without changing approved scope.

## Completion check
Implementation is not complete until code, technical documentation, deployment configuration, product/entitlement behaviour, measurement/assurance and production-route evidence all describe the same current system.

The PR is not merge-ready until its exact head has been assured against the latest `main` integration baseline required by the repository rules.

`Live` is a production-evidence state, not a synonym for merged.

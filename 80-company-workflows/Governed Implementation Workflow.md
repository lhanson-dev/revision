# Governed Implementation Workflow

## Trigger
Any material implementation change to Revision code, routes, UI, persistence, deployment or technical behaviour.

## Purpose
Prevent implementation work from being applied to the wrong runtime, route, component or migration surface, prevent material product features entering development before the product definition is genuinely ready, and ensure parallel work converges safely through one canonical `main` integration baseline.

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
9. **Branch from current `main` and use a PR.** Governed work should use a short-lived branch created from the then-current approved `main`. The PR must record the target route/runtime and evidence used to identify it.

## Parallel work and integration

Revision may have multiple active feature, defect, maintenance and governance branches and PRs at the same time. This is expected and should be handled in the same way as a multi-developer product team.

Only `main` is canonical integrated product truth. Branches are temporary working states.

While work is active:

- branches may temporarily fall behind as unrelated work merges;
- multiple PRs may be open, reviewed and technically ready at the same time;
- do not continuously rebase every branch solely because `main` moved; and
- do not allow an older branch copy of a shared file to overwrite newer `main` content.

## Final integration before merge

When a PR is otherwise complete and is being prepared for production merge:

1. **Read current `main`.** Establish the latest canonical integration state.
2. **Integrate/test with current `main`.** Use a native repository merge queue when available and governed; otherwise bring current `main` into the PR branch through an appropriate merge/rebase/update before final merge assurance.
3. **Review overlap.** If both the PR and newer `main` changed the same responsibility or shared file, resolve the combined state deliberately.
4. **Preserve cumulative truth.** Shared indexes, registers, manifests, routes, config and migrations must become `latest main + intended PR delta`, never `old branch version wins`.
5. **Run final assurance.** The integration candidate must pass the required risk-proportionate CI/assurance.
6. **Summarise for Founder approval.** Before production merge, present what the PR changes, material impact, assurance evidence, documentation impact, risks and any substantive conflict resolution.
7. **Obtain explicit Founder merge approval.** The Founder approves the proposed change entering production; branch mechanics remain an engineering responsibility.

There is no governance rule limiting Revision to one review-ready PR at a time. Actual merges are necessarily ordered because each successful merge changes `main`; the next merge candidate must therefore be checked against the resulting current `main` before it merges.

## Approval continuity across a mechanical `main` refresh

If `main` changes after Founder approval but before merge, refresh/revalidate the PR.

The previous Founder approval may be carried forward only when the refresh is demonstrably mechanical:

- only newer `main` is incorporated;
- no substantive conflict-resolution decision is required;
- the intended PR delta remains materially unchanged; and
- final assurance passes against the refreshed integration candidate.

In that case the executing agent may update the exact-head approval evidence without asking the Founder to repeat approval for unchanged work.

If the PR delta, product behaviour, authority, schema, route, security position, release behaviour or other material effect changes, renewed Founder approval is required.

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
- the final integration evidence used to show compatibility with current `main` before merge.

## Stop conditions
Stop and surface to the Founder if:

- material feature work has not achieved recorded `Ready` approval;
- implementation would materially contradict or expand the Ready definition without renewed product analysis;
- the canonical runtime or route cannot be established confidently;
- two implementations compete for the same product responsibility;
- a change would redefine the canonical product surface through code alone;
- deployment configuration would publish a different surface from the one being changed;
- a migration/compatibility route risks being mistaken for the governed product; or
- final integration with current `main` exposes a substantive authority, product, schema, route, lifecycle or implementation conflict that cannot be resolved without changing approved scope.

## Completion check
Implementation is not complete until code, technical documentation, deployment configuration, product/entitlement behaviour, measurement/assurance and production-route evidence all describe the same current system.

The PR is not merge-ready until its proposed production change has been successfully validated with the current `main` integration state using the governed repository mechanism.

`Live` is a production-evidence state, not a synonym for merged.

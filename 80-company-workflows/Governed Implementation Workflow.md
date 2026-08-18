# Governed Implementation Workflow

## Trigger
Any material implementation change to Revision code, routes, UI, persistence, deployment or technical behaviour.

## Purpose
Prevent implementation work from being applied to the wrong runtime, route, component or migration surface.

## Mandatory pre-code checks
Before editing implementation files:

1. **Read authority first.** Start from `INDEX.md` and apply the authority hierarchy, knowledge architecture and AI Agent Constitution.
2. **Identify the user-facing target.** State the exact product surface, route or URL the change is intended to affect.
3. **Resolve the canonical runtime.** Use current technical documentation and code to identify the runtime, entry point, component/service and deployment artifact that actually serve that target.
4. **Check for competing or migration surfaces.** If more than one route or implementation appears to serve the same learner job, classify each one as canonical, compatibility, legacy, experimental or migration-only before editing.
5. **Surface conflicts.** If authority, technical documentation, deployment configuration and implementation disagree about the canonical target, stop and resolve the conflict before writing code.
6. **Confirm deployment path.** For changes intended for production, verify how the changed files reach the production route and what smoke test proves that route changed.
7. **Work on a branch and PR.** The PR must record the target route/runtime and evidence used to identify it.

## Required implementation record
Every implementation PR must state:

- intended user-facing route(s) or product surface;
- canonical runtime / entry point;
- primary files or components changed;
- technical source used to establish that target;
- whether any compatibility or legacy surface also exists;
- how tests or production smoke demonstrate the intended route is affected.

## Stop conditions
Stop and surface to the Founder if:

- the canonical runtime or route cannot be established confidently;
- two implementations compete for the same product responsibility;
- a change would redefine the canonical product surface through code alone;
- deployment configuration would publish a different surface from the one being changed; or
- a migration/compatibility route risks being mistaken for the governed product.

## Completion check
Implementation is not complete until code, technical documentation, deployment configuration and production-route assurance all describe the same current system.

# AI Coding & Repository Rules

## Workflow
For material product features:

Read authority → confirm governed feature state → complete analysis/Definition of Ready → explicit human `Ready` approval → resolve canonical route/runtime → branch → implement → test/assure → document → PR → explicit Founder merge approval → merge → verify production → mark `Live` only from production evidence.

For defects, maintenance and other non-feature implementation, apply the relevant authority and Governed Implementation Workflow without inventing a feature lifecycle record unnecessarily.

## Feature-readiness rule

- Do not begin material production feature implementation while a feature is `New`, `To Do` or `Analyse`.
- AI may recommend `Ready`; it may not self-approve `Ready`.
- A technical spike during `Analyse` must be explicitly bounded to feasibility/evidence gathering and must not silently become production implementation.
- If implementation reveals a material change to the approved MVP, Free/Paid/Premium behaviour, evidence semantics, critical UX or trust/safety position, return to proportionate analysis and renew readiness approval where the prior Definition of Ready is no longer valid.

## Migration safety
- Do not restructure working implementation solely to match governance folders.
- Do not delete or overwrite legacy material until its migration disposition is known.
- Do not convert current code behaviour into normative authority without review.
- Keep product authority and technical implementation documentation separate.

## Merge rule
Every merge requires explicit Founder approval unless active Founder-approved governance explicitly delegates otherwise.

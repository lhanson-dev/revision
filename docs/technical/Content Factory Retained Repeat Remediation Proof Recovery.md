# Content Factory Retained Repeat Remediation Proof Recovery

## Purpose

This document records the implementation-only recovery path for a narrow Content Factory failure mode: a repeat Learn/Practice remediation has completed its provider work and retained a structurally valid corrected bundle, but the GitHub proof job subsequently fails on a proof-harness assertion after that evidence has already been written.

This does not change Content Factory authority. The active Foundation and Content Accuracy Assurance rules still require smallest-safe remediation, deterministic validation, genuinely fresh independent re-assurance, qualified-human Foundation approval and publication gating.

## Triggering evidence

The first use case is AQA A-level Business 7132 — 2027 repeat-remediation run `36115708856` on approved main `2e7a1a15cf9860e6bc6665a7026ae7ca749529f6`.

The run completed all retained-evidence and lineage checks and completed all 18 targeted provider runs. It retained artifact `10854463735`, digest `sha256:2a36ac0a66c53f56376e1abbfb888708bbd19c2b8325a73dd3971f06e8de2ee1`. The retained pass evidence records:

- remediation cycle 2;
- 12 source open findings and 12 addressed findings;
- 12 remediated work units;
- 14 remediated asset sides;
- 18 successful remediation contexts with zero collisions;
- 98 cumulative prior reviewer contexts excluded;
- corrected bundle fingerprint `577d1d3c344112f2b79332332ff5d18d091994533909669ccc477bcce45db860`;
- Learn and Practice both still `pending`;
- assured asset count 0;
- qualified-human Foundation approval still `not_approved`;
- learner publication still false;
- reported final-response usage cost `$0.887708` across 18 provider runs, explicitly not retry-complete total spend.

The job failed only after retaining that pass evidence because the proof harness asserted the superseded release-problem wording `Learner release requires derived-asset assurance pass`. Current implementation returns `Derived asset assurance must pass before learner release`. The qualified-human Foundation approval blocker was unchanged.

## Recovery contract

The recovery workflow deliberately does not call a model or regenerate learner content. It accepts only an exact failed repeat-remediation run and exact digest-bound artifact from approved `main`.

Before emitting recovered evidence it must prove:

1. the source workflow is the repeat-remediation proof, completed on `main` with GitHub conclusion `failure` at the supplied head;
2. the supplied artifact ID, name, digest, run identity and head SHA all match and the artifact is unexpired;
3. the artifact contains exactly retained pass evidence for a completed repeat remediation and retained failure evidence for the post-generation proof failure;
4. the retained pass evidence is bound to the supplied Foundation fingerprint and source head;
5. every retained remediation provider run succeeded;
6. remediation context IDs are unique and collision-free and match the remediation record;
7. all source open findings are addressed by the retained remediation record;
8. work-unit, asset-side and context counts agree with the retained remediation record;
9. the corrected bundle recomputes to its retained result bundle fingerprint;
10. Learn and Practice remain `pending`, assured asset count remains 0, Foundation approval remains `not_approved`, and learner publication remains false;
11. the retained release blockers match the current release contract;
12. the retained failure evidence identifies the superseded release-problem assertion rather than a provider or content-generation failure.

If any condition fails, recovery fails closed.

## Recovered evidence

A successful recovery creates a new retained proof artifact on the current approved-main recovery implementation commit. It preserves the generated bundle, remediation record, provider provenance, usage telemetry, Foundation lineage and corrected bundle fingerprint from the original retained evidence. It adds recovery provenance identifying the failed source run, artifact, digest and source head and records that zero provider calls were repeated.

The recovered artifact remains a remediation proof, not an assurance decision. Learn and Practice stay `pending`; the next permissible step is deterministic validation and genuinely fresh independent re-assurance. Recovery cannot set asset assurance to pass, approve the Foundation or enable publication.

## Historical evidence

The failed source run and its retained artifact remain immutable. Recovery creates new evidence; it does not rewrite or erase the failed run.

## Documentation impact

This is an implementation recovery mechanism only. It introduces no new normative authority and does not require an ADR or `INDEX.md` change. If the current repeat-remediation proof harness is later changed to remove the obsolete wording assertion directly, that implementation should be updated separately without altering this historical evidence.

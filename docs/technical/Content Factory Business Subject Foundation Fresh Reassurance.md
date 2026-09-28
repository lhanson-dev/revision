# Content Factory Business Subject Foundation Reassurance

**Status:** Current technical assurance implementation for the Business Subject Knowledge Foundation trial  
**Updated:** 28 September 2026  
**Normative authority:** `80-company-workflows/Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`, `80-company-workflows/Content Accuracy Assurance Gate.md`, `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`  
**Related trial guidance:** `docs/technical/Content Factory Subject Foundation Trial.md`

## Purpose

Define the independent reassurance proof used to close the reusable Business Subject Knowledge Foundation T3 gate without repeatedly discarding valid assurance for unchanged knowledge.

The current effective candidate is `v0.5-targeted-reassurance`, composed deterministically over the exact `v0.4-reassurance-remediation` fingerprint. Earlier candidates and assurance runs remain immutable historical evidence.

This control does not promote the Foundation, approve AQA 7132, replace exact-course assurance or replace qualified human subject/assessment review.

## Why the reassurance strategy changed

The earlier implementation re-ran a fresh domain-by-domain challenge across all 81 Business nodes after every targeted remediation. That was more repetitive than the governing incremental-assurance rule and created a practical risk that independent reviewers would continually reopen unrelated accepted content.

Current authority requires the opposite behaviour after a bounded subject-foundation change:

- create a new version/fingerprint;
- assure changed/new nodes plus genuinely affected relationships and structural dependencies;
- preserve earlier valid assurance evidence;
- rerun dependent review where necessary; and
- leave unrelated content untouched.

`Content Accuracy Assurance Gate.md` also requires remediation at the smallest safe affected scope and explicitly says unrelated content must not be regenerated merely to clear one issue.

v0.5 therefore corrects the assurance orchestration. It does **not** lower the blocking/material quality threshold.

## Triggering v0.4 evidence

Fresh reassurance run `36428218127` reviewed exact `main` `93be1daeac6ffb5762a7b0ede34942e0130edb04` and exact v0.4 fingerprint `b4610dd17094b5769d9706fcd99b90973eb31baa7df7cd3e0149320c7f9042b3`.

Retained artifact:

- artifact ID `10973072890`;
- digest `sha256:c1720d5863fd32b744194c63efbdc050e0bea669e703f9a5303bb6b07f583c26`.

The run established useful accepted evidence before terminating on a source-path contract rejection in the Evidence domain:

- Marketing passed;
- Operations passed, including the v0.4 capacity/bottleneck and Critical Path remediations;
- Strategy passed;
- External and Global Business passed;
- Business Foundations had one unique material blocker, `BUS-FND-002`;
- Finance had one unique material blocker, `BUS-FIN-003`;
- People and Organisation had one unique material blocker, `BUS-PEO-011`;
- `BUS-EVI-008` had an accepted assessment inside the completed Operations review;
- Evidence nodes `BUS-EVI-001` through `BUS-EVI-007` did not obtain an accepted completed domain review; and
- the five Named Models nodes were not reached.

The rejected Evidence output also identified a plausible source-support issue on `BUS-EVI-002`. Independent reconciliation confirmed that gap, so it is remediated and remains inside the fresh v0.5 scope rather than being treated as preserved evidence.

Minor findings from accepted v0.4 assessments remain retained limitations; they do not become blocking merely because v0.5 changes the orchestration.

## v0.5 remediation

`research/business-subject-foundation/v0.5-targeted-reassurance/REMEDIATION.json` is bound to the exact v0.4 fingerprint.

It closes four confirmed items:

1. `BUS-FND-002` — adds direct CC BY 4.0 evidence for intrapreneurship from the LOUIS entrepreneurship chapter;
2. `BUS-FIN-003` — adds the missing margin-percentage method, worked examples and error boundary, plus direct CC BY 4.0 financial-ratio evidence;
3. `BUS-PEO-011` — adds current OGL HSE evidence for workload, work patterns, job demands and work-related stress; and
4. `BUS-EVI-002` — adds current OGL Government Analysis Function evidence for correlation versus causation, temporal order and alternative causes.

Only `BUS-FIN-003` teaching content changes. The other three are promotion-evidence changes only. No node changes domain and no board material becomes reusable subject truth.

## Deterministic composition and validation

`scripts/content-factory/load-business-subject-foundation-candidate-v05.mjs` composes v0.5 over v0.4 and fails closed unless the exact v0.4 fingerprint matches.

`scripts/assurance/validate-business-subject-provenance.mjs` then proves at least:

- exactly 81 unique nodes remain in the index, node set and promotion matrix;
- domain membership is unchanged;
- v0.5 is bound to the exact v0.4 fingerprint;
- exactly one teaching node changed: `BUS-FIN-003`;
- exactly four targeted node-to-source mappings changed;
- all new sources have rights/provenance metadata and permitted commercial/AI-use profiles;
- board/reference-only sources remain quarantined from reusable subject truth;
- exactly 15 nodes are marked for fresh reassurance;
- the remaining 66 unchanged nodes are marked as prior-assurance-preserved; and
- the candidate cannot self-promote.

Any violation stops before live provider spend.

## Fresh scoped assurance set

The live runner freshly reviews exactly these 15 nodes:

- `BUS-FND-002`;
- `BUS-FIN-003`;
- `BUS-PEO-011`;
- `BUS-EVI-001` through `BUS-EVI-007`; and
- `BUS-MOD-001` through `BUS-MOD-005`.

They are divided into five fresh review groups: the three targeted remediations, the unresolved Evidence/Decision-making scope, and the previously unreached Named Models scope.

`BUS-EVI-008` is deliberately excluded because it already has accepted v0.4 evidence inside the completed Operations PASS and is unchanged by v0.5.

All other unchanged nodes retain their prior accepted node-level evidence. Related/prerequisite nodes may be supplied as relationship context, but the reviewer is prohibited from reopening their standalone factual/source adequacy.

## Scoped reviewer contract

Each fresh target node is challenged for:

- factual correctness and boundaries;
- Level 3 scope;
- quantitative accuracy where applicable;
- causal/relationship claims;
- assumptions, limitations and misconceptions;
- source support; and
- affected prerequisites/relationships.

Each target node must cite at least one of its own mapped promotion-truth sources. Evidence URLs remain constrained to the registered host/path boundary, with safe percent-encoded/decoded path equivalence but no sibling-path, encoded-slash or host escape.

Any blocking/material finding in the 15-node fresh scope produces `fail_hold`. Minor issues may be retained as explicit limitations.

## Final whole-subject integration check

Only after all fresh scoped reviews contain no blocking/material finding does the runner perform one whole-subject integration check across the 81-node catalogue.

This check may create findings only for:

- genuinely missing major Level 3 Business domain/area;
- cross-domain contradiction or incoherence;
- broken prerequisite/relationship dependency; or
- contradiction/duplication introduced by v0.5.

It is explicitly **not** another standalone source/factual review of all 81 nodes. It may not reopen an unchanged accepted node merely because a new reviewer prefers a different source, example, wording, model treatment or depth.

A material/blocking integration finding still results in `fail_hold`.

## Provider and cost controls

The runner retains the existing safety controls:

- fresh OpenAI Responses contexts;
- high reasoning effort;
- rights-limited web search;
- strict structured output;
- unique response IDs;
- deterministic source-ID/URL validation;
- at most one fresh retry for max-output incompletion or deterministic output-contract rejection;
- rejected output retained as evidence; and
- hard US$5 total reassurance ceiling.

No remediation occurs inside the live reassurance run.

## Evidence artifact

The workflow uploads a retained artifact containing, as available:

- exact reviewed `main` SHA;
- exact v0.5 and v0.4 fingerprints;
- reference to the v0.4 run/artifact whose unchanged assurance is preserved;
- the exact 15-node fresh scope and 66-node preserved count;
- provider attempts, response IDs, search/spend accounting and rejected outputs;
- all scoped review outputs and blocking/material findings;
- the final integration-only output when reached; and
- final `pass` or `fail_hold` decision when a complete content verdict is reached.

Provider/contract failure remains distinct from substantive content `fail_hold`.

## Workflow

The operator dispatches `.github/workflows/content-factory-business-subject-foundation-reassurance-proof.yml` with the exact current `main` SHA.

The workflow:

1. normalises and validates the SHA;
2. verifies the checkout is still exact current `main`;
3. deterministically validates v0.5 composition, provenance and incremental scope;
4. runs the no-spend scoped-assurance self-test;
5. runs the five fresh scoped review groups;
6. if those pass, runs the final integration-only whole-subject check; and
7. uploads retained evidence even on failure.

The deterministic validation and no-spend self-test also run in normal Foundation-quality CI through the existing compatibility entry point.

## T3 exit and next step

A complete PASS means the Business Subject Knowledge Foundation has no unresolved blocking/material finding in the freshly required scope and has passed the final integration check. That closes the automated T3 subject-foundation assurance work for this candidate.

It does not itself create `foundation_approved`, approve a learner course or permit learner publication.

The next trial stage after T3 is **T4: exact AQA 7132 intake and specification mapping**, followed by gap/depth reconciliation, Course Truth projection, Exam Truth and exact-course assurance.

A future change to an assured Business node triggers the same incremental rule: new fingerprint, affected-node/dependency assurance only, preservation of unrelated valid evidence.

## Historical evidence

Earlier full-restart runner implementations and all prior assurance artifacts remain historical evidence in Git history/GitHub Actions. v0.5 does not rewrite those records; it supersedes the current execution strategy in accordance with existing normative authority.

## Documentation impact

This is an implementation correction to align the Business trial with already-active incremental-assurance authority. No normative governance change is required and there is no learner-facing product behaviour change.

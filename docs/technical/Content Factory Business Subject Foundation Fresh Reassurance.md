# Content Factory Business Subject Foundation Reassurance

**Status:** Current technical assurance implementation for the Business Subject Knowledge Foundation trial  
**Updated:** 28 September 2026  
**Normative authority:** `80-company-workflows/Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`, `80-company-workflows/Content Accuracy Assurance Gate.md`, `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`  
**Related trial guidance:** `docs/technical/Content Factory Subject Foundation Trial.md`

## Purpose

Define the independent reassurance proof used to close the reusable Business Subject Knowledge Foundation T3 gate while preserving valid assurance for unchanged knowledge.

The current effective candidate is `v0.6-final-targeted-remediation`, composed deterministically over the exact `v0.5-targeted-reassurance` fingerprint. Earlier candidates and assurance runs remain immutable historical evidence.

This control does not promote the Foundation, approve AQA 7132, replace exact-course assurance or replace qualified human subject/assessment review.

## Governing assurance rule

Current authority requires incremental subject assurance after a bounded change:

- create a new version/fingerprint;
- assure changed/new nodes plus genuinely affected relationships and structural dependencies;
- preserve earlier valid assurance evidence;
- rerun dependent review where necessary; and
- leave unrelated content untouched.

`Content Accuracy Assurance Gate.md` likewise requires the smallest safe affected scope and says unrelated content must not be regenerated merely to clear one issue.

The blocking/material threshold is unchanged.

## v0.5 targeted reassurance evidence

Run `36442563254` reviewed exact `main` `97223dc03c7cd3a4f2e03a89812421e469f2e61d` and exact v0.5 fingerprint `aac24e5aeddcf1ae5d9559edd67fb5387276758ff7b7dc70d6eb0830e5abba57`.

Retained artifact:

- artifact ID `10979093553`;
- digest `sha256:5b047fa9778ce95ac6745e216ee2daf3c9c9a307559d3a2f614043dc741ef68f`.

Deterministic composition and the 15-node incremental contract passed. The live review completed all five scoped groups and returned `fail_hold` before the final integration check because material findings remained.

The raw artifact contained five material entries, but two were duplicate node/group representations. There were **three unique material issues**:

1. `BUS-FND-002` — several causal generalisations about staged/reversible experiments, staged investment, first-mover advantages and resource scarcity exceeded direct mapped-source support;
2. `BUS-FIN-003` — revenue was defined too narrowly as sales revenue and margin comparison did not state the revenue-denominator boundary precisely enough; and
3. `BUS-EVI-006` — the node's cross-functional examples depended on marketing, finance, operations and people concepts that were not registered in `related_nodes`.

The same run established accepted evidence for the other v0.5 fresh-scope nodes:

- `BUS-PEO-011` passed with minor non-blocking limitations;
- `BUS-EVI-001` through `BUS-EVI-005` and `BUS-EVI-007` passed;
- the v0.5 correlation/causation remediation in `BUS-EVI-002` passed; and
- all five Named Models nodes `BUS-MOD-001` through `BUS-MOD-005` passed.

Those accepted unchanged assessments are preserved by v0.6 rather than reopened.

## v0.6 final targeted remediation

`research/business-subject-foundation/v0.6-final-targeted-remediation/REMEDIATION.json` is bound to the exact v0.5 fingerprint.

It changes exactly three nodes:

### `BUS-FND-002`

Teaching is narrowed to claims directly supported by the existing promotion sources: market information, customer feedback, feasibility/what-if analysis, business planning and revision, resource organisation, opportunity cost and intrapreneurship.

Unsupported causal generalisations about staged/reversible experiments, staged investment limiting downside, first-mover learning/access advantages and resource scarcity encouraging focus are removed rather than retaining weakly supported claims.

The existing minor definition ambiguity is also resolved while this node is already in scope: `enterprise` is explicitly used in the enterprise-skills/capability sense and distinguished from the separate use of enterprise to mean a business organisation or business activity.

No source mapping changes.

### `BUS-FIN-003`

Teaching now distinguishes:

- sales revenue;
- net sales/relevant sales denominator where applicable; and
- total reported revenue, which may include other income depending on presentation.

`price × quantity` is retained only as a simple sales-revenue case. Margin methods now require a named numerator and a stated, like-for-like revenue/sales denominator.

No source mapping changes.

### `BUS-EVI-006`

Teaching content is unchanged. `related_nodes` now explicitly registers the cross-functional dependencies used by the node:

- `BUS-MKT-002`;
- `BUS-FIN-003`;
- `BUS-FIN-005`;
- `BUS-OPS-003`;
- `BUS-PEO-011`;
- existing `BUS-STR-001`; and
- existing `BUS-EVI-007`.

No source mapping changes.

## Deterministic composition and validation

`scripts/content-factory/load-business-subject-foundation-candidate-v06.mjs` composes v0.6 over v0.5 and fails closed unless the exact v0.5 fingerprint matches.

`scripts/assurance/validate-business-subject-provenance.mjs` proves at least:

- exactly 81 unique nodes remain;
- domain membership is unchanged;
- v0.6 is bound to the exact v0.5 fingerprint;
- exactly three nodes differ from v0.5;
- teaching content changes only in `BUS-FND-002` and `BUS-FIN-003`;
- relationship metadata changes only in `BUS-EVI-006`;
- no promotion source, source-rights record or node-to-source mapping changes;
- the previously unsupported `BUS-FND-002` phrases are absent;
- the finance sales/total-revenue and denominator boundaries are present;
- the required `BUS-EVI-006` related-node set is present;
- exactly three nodes are marked for fresh reassurance; and
- the other 78 nodes are marked as prior-assurance-preserved.

Any violation stops before live provider spend.

## v0.6 live reassurance scope

The live runner freshly reviews exactly:

- `BUS-FND-002`;
- `BUS-FIN-003`; and
- `BUS-EVI-006`.

Each is reviewed in its own fresh context. Related/prerequisite nodes may be supplied only as relationship context and may not be reopened for standalone findings.

The reviewer checks factual correctness, definitions/boundaries, quantitative accuracy, causal claims, Level 3 depth, source support and affected relationships. Each target must cite its own promotion-truth sources.

Any blocking/material issue in those three nodes returns `fail_hold`.

The runner deduplicates equivalent node/group material findings by affected node, issue type and evidence-source set so the Founder-facing result reflects unique underlying blockers rather than duplicated reporting layers.

## Final whole-subject integration check

Only after all three v0.6 scoped reviews contain no blocking/material finding does the runner perform one whole-subject integration check across all 81 nodes.

Permitted integration findings are limited to:

- genuinely missing major Level 3 Business domain/area;
- cross-domain contradiction or incoherence;
- broken prerequisite/relationship dependency; or
- contradiction/duplication introduced by v0.6.

It is not another standalone factual/source review of the 78 preserved nodes.

A blocking/material allowed integration finding still returns `fail_hold`.

## Provider and evidence controls

The proof retains:

- fresh OpenAI Responses contexts;
- high reasoning effort;
- rights-limited web search;
- strict structured output;
- deterministic source-ID/URL validation;
- safe encoded/decoded URL equivalence without host/path escape;
- at most one bounded retry for incomplete/output-contract failure;
- rejected-output retention;
- hard US$5 total reassurance ceiling; and
- evidence upload on pass or failure.

No remediation occurs inside the live run.

## Workflow

The operator dispatches `.github/workflows/content-factory-business-subject-foundation-reassurance-proof.yml` with the exact current `main` SHA.

The workflow:

1. validates and verifies exact current `main`;
2. validates v0.6 composition/provenance and the exact three-node scope;
3. runs the no-spend v0.6 contract self-test;
4. freshly reassures the three changed nodes;
5. if they pass, runs the final integration-only 81-node check; and
6. uploads retained evidence even on failure.

## T3 exit and next step

A complete PASS means no blocking/material finding remains in the v0.6 fresh scope and the final integration-only check passes. That closes automated Business Subject Knowledge Foundation T3 assurance for this candidate.

It does not create exact-course `foundation_approved` status or permit learner publication.

The next controlled-trial stage is **T4: exact AQA 7132 intake and specification mapping**, followed by gap/depth reconciliation, Course Truth projection, Exam Truth and exact-course assurance.

## Documentation impact

This is a bounded implementation/evidence update under existing authority. No normative governance document changes and no learner-facing product behaviour changes are required. Historical candidates, assurance runs and artifacts remain unchanged.

# Content Factory Business Subject Foundation Fresh Reassurance

**Status:** Technical assurance implementation for the Business Subject Knowledge Foundation trial  
**Updated:** 28 September 2026  
**Normative authority:** `80-company-workflows/Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`, `80-company-workflows/Content Accuracy Assurance Gate.md`, `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`  
**Related trial guidance:** `docs/technical/Content Factory Subject Foundation Trial.md`

## Purpose

Define the fresh independent reassurance proof used to challenge the reusable Business Subject Knowledge Foundation before any promotion decision.

The current effective candidate is `v0.3-reassurance-remediation`. It is a deterministic composition over the immutable `v0.2-post-board-candidate`; the v0.2 research files and earlier reassurance evidence remain historical evidence and are not rewritten.

This control implements the T3 subject-foundation assurance gate. It does not promote the candidate, approve a learner course, replace exact-course assurance, or replace qualified human subject/assessment review.

## Current candidate composition

`v0.3-reassurance-remediation` is defined by:

- immutable base candidate `research/business-subject-foundation/v0.2-post-board-candidate/`;
- targeted overlay `research/business-subject-foundation/v0.3-reassurance-remediation/REMEDIATION.json`; and
- deterministic composer `scripts/content-factory/load-business-subject-foundation-candidate.mjs`.

The overlay records:

- the exact failed reassurance run and retained artifact that triggered remediation;
- targeted node/content patches;
- additional promotion-eligible source records and node-to-source mappings;
- the reclassification of existing `BUS-EVI-008` Network analysis and Critical Path Analysis into the Operations review domain rather than duplicating that knowledge; and
- the finding-to-remediation map used to reconcile the 24 preserved material findings from run `36408090011`.

The composer verifies the exact v0.2 aggregate fingerprint before applying any v0.3 overlay. It then produces one effective 81-node candidate, effective promotion matrix/source universe and a new deterministic candidate fingerprint. A changed or stale base candidate therefore fails closed rather than silently receiving the overlay.

## Why v0.3 exists

Fresh reassurance run `36408090011` reviewed `main` `59f2d3bbccf295e35db227f73147bc098fd28389` using the corrected promotion-provenance semantics introduced by PR #416.

Seven domains completed and their full review evidence was retained. Those completed reviews produced 24 blocking/material findings across Business Foundations, Operations, Finance, People and Organisation and Strategy; Marketing and External & Global Business passed their completed domain reviews.

The run did **not** reach a complete whole-subject verdict. The final `Evidence, Decision-making and Integration` domain returned a structurally valid JSON response whose assessment ID set did not match the exact expected node set, so deterministic validation stopped the run before the whole-subject integration review.

The run is therefore classified as **incomplete assurance with preserved material findings**, not as a complete subject PASS and not as a complete whole-subject FAIL/HOLD.

The 24 retained findings are remediation evidence, not automatic instructions. Each was reconciled against the whole 81-node candidate so that existing knowledge was not duplicated and broad source-support findings were separated from genuine educational gaps.

## Targeted v0.3 remediation

The v0.3 overlay follows the smallest-safe-scope rule.

Examples include:

- strengthening the economies/diseconomies of scale explanation around long-run average cost and separating scale from utilisation;
- making the risk/uncertainty definition explicitly bounded rather than treating one probability convention as universal;
- adding facility-layout treatment to Operations;
- tightening the reusable capacity explanation to claims supported by promotion-safe evidence;
- making the Foundation boundary explicit where inventory calculations are qualification-specific;
- defining capital employed consistently for ROCE;
- strengthening selection, motivation, communication, leadership and employee-relations treatment where the completed review found depth/evidence weaknesses;
- adding direct promotion-eligible sources for affected Operations, People and Strategy nodes; and
- moving existing `BUS-EVI-008` into the Operations review domain so Critical Path Analysis is reviewed with the Operations knowledge it already supplies.

The remediation does not use awarding-body material as reusable subject truth and does not promote the candidate.

## Reviewed artifact and deterministic gate

Before provider work, `scripts/assurance/validate-business-subject-provenance.mjs` loads the composed v0.3 candidate and checks, at minimum:

- exactly 81 unique effective nodes across index, candidate and promotion matrix;
- exact v0.2 base fingerprint binding;
- consistent v0.3 identity across effective index, matrix and promotion-source supplement;
- no self-promotion and explicit requirement for fresh reassurance;
- source-rights fields and permitted commercial/AI-use licence profiles;
- no awarding-body or excluded source used as reusable subject truth;
- board-source quarantine still matches the preserved historical node metadata;
- every new v0.3 promotion source is eligible and actually mapped to at least one node; and
- every declared node/domain patch resolves to a real effective node/domain.

Any failure stops before live provider spend.

## Independence and rights-safe challenge

A successful run uses fresh OpenAI Responses contexts rather than the implementation/remediation context:

- one successful fresh review for each of the nine Business domains; and
- one additional fresh whole-subject integration review.

Provider response IDs must be unique across attempts. Reviewers are told not to rely on prior Revision assurance/remediation conclusions or exam-board specifications.

Each domain receives only the effective node content, promotion-provenance rows and promotion-eligible source metadata required for that domain. Legacy node `sources` arrays and historical board-challenge metadata are not supplied as current promotion truth.

Web search is restricted to domains belonging to promotion-eligible source records. Awarding-body and other prohibited sources remain outside the reusable subject-truth review boundary. Returned evidence must reference a permitted source ID and the registered source URL or a child page within the same host/path boundary.

## Review and decision contract

Domain review challenges every supplied node for factual correctness, definitions/boundaries, causal claims, applications, assumptions/limitations, misconceptions, Level 3 scope, quantitative methods, model treatment and source support.

The whole-subject review separately challenges completeness, cross-domain coherence, quantitative-method coverage, frameworks, misconception boundaries, transfer/interdependency, duplication/contradiction and board-specific contamination.

The gate remains fail-closed:

- any `blocking` or `material` node/domain finding produces `fail_hold`;
- any material/blocking completeness gap produces `fail_hold`;
- provider, schema, source-boundary, output-contract or spend-ceiling failure is not a PASS; and
- only a complete run with no blocking/material finding may return `pass`.

No remediation occurs inside the reassurance run itself.

## Bounded provider retry

Provider lifecycle failures remain distinct from content verdicts.

A single fresh retry is permitted when either:

1. the provider returns `incomplete` specifically because `max_output_tokens` was reached, usage is available/charged and the unchanged US$5 spend ceiling can still cover the retry; or
2. the provider returns a completed structured response that fails deterministic output-contract validation, for example by omitting or duplicating required node/domain IDs or returning evidence outside the permitted source boundary.

For output-contract rejection:

- the rejected response ID, deterministic validation error and parsed rejected output are retained in the evidence artifact;
- the second attempt is a new fresh provider context;
- the retry is explicitly instructed to replace the rejected output rather than defend it; and
- no third attempt is permitted for that review call.

This correction addresses the terminal failure in run `36408090011` without weakening any educational or source-evidence criterion.

## Historical reassurance incidents

The following runs remain immutable implementation evidence:

- `36348538728`: provider schema incompatibility (`format: uri`); no content verdict.
- `36351378020`: provider `incomplete` lifecycle/accounting defect exposed; no content verdict.
- `36356501177`: incomplete assurance; completed Business Foundations/Marketing work exposed evidence-retention and invalid fixed-search-count gates.
- `36393804597` and `36395180639`: manual SHA whitespace handling stopped before paid review; no content verdict.
- `36408090011`: corrected provenance semantics; seven completed domains retained 24 material findings, then final domain failed deterministic assessment-ID validation; incomplete whole-subject assurance.

Historical evidence must not be rewritten after remediation.

## Cost control

The proof uses `gpt-5.6-terra` at high reasoning effort with a hard US$5 reassurance ceiling.

Every provider attempt with available usage is charged before retry/validation handling. The runner reserves conservative capacity before a call or permitted retry and fails closed rather than reducing review quality to stay within budget. Missing provider usage disables automatic retry because remaining spend cannot be demonstrated safely.

The cost ceiling is an operational guardrail, not permission to accept incomplete assurance.

## Evidence retained

The workflow uploads a 30-day GitHub Actions artifact containing, as available:

- exact reviewed `main` SHA;
- v0.3 effective candidate fingerprint and v0.2 base fingerprint;
- node/domain counts;
- model route and spend controls;
- every provider attempt and response ID;
- rejected output-contract responses and deterministic rejection reasons;
- full completed domain review outputs and blocking/material issue register;
- incremental partial evidence after every completed domain;
- whole-subject review when reached;
- final PASS or FAIL/HOLD when a complete content verdict is reached; and
- explicit excluded scope.

A runner/provider/control failure remains distinct from a substantive content FAIL/HOLD. Completed-domain findings remain preserved without being inflated into a whole-subject verdict.

## Workflow

The operator dispatches:

`.github/workflows/content-factory-business-subject-foundation-reassurance-proof.yml`

with the exact current `main` SHA. Surrounding whitespace is normalized once; the normalized value must still be exactly 40 lowercase hexadecimal characters and exactly equal current `main` before provider work starts.

The workflow:

1. normalizes and validates the reviewed-main SHA;
2. checks out that exact SHA and verifies it is still current `main`;
3. composes and deterministically validates Business v0.3 promotion provenance;
4. runs the no-spend reassurance self-test, including v0.3 composition/fingerprint binding and rejected-output retention;
5. executes the fresh independent live reassurance; and
6. uploads all retained reassurance evidence even when the live review fails.

The same deterministic provenance check and no-spend reassurance self-test run in normal Foundation-quality CI.

## Progression after the proof

A complete PASS means the v0.3 Business subject-foundation candidate has cleared this automated T3 reassurance gate. It does not itself promote the candidate or create learner-publication authority.

After PASS, promotion of the reusable Business Subject Knowledge Foundation requires the next governed promotion decision/change. Exact AQA 7132 specification mapping, Course Truth, Exam Truth, exact-course assurance and the required qualified human subject/assessment review remain subsequent gates.

A complete FAIL/HOLD triggers another smallest-safe targeted remediation cycle against only the genuine affected nodes/facets/dependencies.

A provider/runner failure that prevents complete review produces neither PASS nor a complete subject FAIL/HOLD and requires bounded runner correction plus a new fresh run.

## Documentation impact

This document records implementation of existing Content Factory authority. The v0.3 remediation does not amend normative sequencing, does not rewrite v0.2 historical research, and does not change learner-facing product behaviour.

# Content Factory Business Subject Foundation Fresh Reassurance

**Status:** Technical assurance implementation for the Business Subject Knowledge Foundation trial  
**Date:** 27 September 2026  
**Normative authority:** `80-company-workflows/Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`, `80-company-workflows/Content Accuracy Assurance Gate.md`, `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`  
**Related trial guidance:** `docs/technical/Content Factory Subject Foundation Trial.md`

## Purpose

Define the fresh independent reassurance proof used after the Business `v0.2-post-board-candidate` promotion-provenance remediation.

This control implements the T3 subject-foundation assurance gate. It does not promote the candidate, approve a learner course, replace exact-course assurance, or replace qualified human subject/assessment review.

## Reviewed artifact

The runner binds reassurance to the exact checked-out `main` commit and computes an aggregate SHA-256 fingerprint across:

- `NODE_INDEX.json`;
- `PROMOTION_PROVENANCE_MATRIX.json`;
- `SOURCE_REGISTER_PROMOTION_SUPPLEMENT.json`;
- `SPECIALIST_REGISTERS.json`; and
- all nine domain node files referenced by the index.

The runner fails before provider work if the 81-node index, node files or promotion matrix diverge, if a promotion-truth source is missing or ineligible, or if a node lacks substantive teaching content.

## Independence contract

The proof uses a new provider execution path rather than treating the remediation conversation or remediation implementation as an independent reviewer.

A successful run creates:

- one fresh OpenAI Responses context for each of the nine Business domains; and
- one additional fresh whole-subject integration context.

Response IDs must be unique across all ten review contexts. The reviewer is instructed not to rely on prior Revision assurance, remediation conclusions or board specifications.

## Rights-safe external challenge

Each domain receives only the node corpus, its promotion-provenance rows and the promotion-eligible source metadata required for those nodes.

Web search is restricted to domains belonging to promotion-eligible `OPEN`/OGL source records. Awarding-body and other excluded sources remain outside the subject-truth review boundary. Evidence returned by the reviewer must name a permitted source ID and resolve to the registered source URL or a child page on the same host/path boundary.

The whole-subject review receives the complete 81-node corpus, specialist registers, fresh domain-review summaries and the same promotion-safe source universe.

## Review contract

Domain reviewers must challenge every supplied node for:

- factual correctness;
- definitions and important boundaries;
- causal claims and relationships;
- applications and real-world transfer;
- assumptions and limitations;
- misconceptions;
- Level 3/A-level scope;
- quantitative formulas, worked examples and interpretation where applicable;
- model/framework purpose, application, limitations and misuse where applicable; and
- whether the promotion-truth sources actually support the educational meaning.

The whole-subject reviewer separately challenges:

- major-domain completeness;
- cross-domain coherence and interdependencies;
- quantitative-method coverage;
- models/frameworks treatment;
- misconception/boundary coverage;
- transfer and evidence/decision-making capability;
- artificial board-shaped contamination;
- contradictory or duplicated subject truth; and
- over-advanced specialist content presented as core.

Style improvements are outside this gate.

## Decision rule

The proof is fail-closed.

- any `blocking` or `material` node/domain finding produces `fail_hold`;
- any material/blocking completeness gap produces `fail_hold`;
- deterministic inconsistency between findings/statuses and the provider decision is a contract failure;
- provider, schema, source-boundary or spend-ceiling failure is not a PASS; and
- only a complete run with no blocking/material finding may return `pass`.

No automatic remediation occurs inside this proof. A FAIL/HOLD must create a separate bounded remediation cycle so the reassurance evidence remains independent historical evidence.

## Cost control

The initial proof uses `gpt-5.6-terra` at high reasoning effort with a US$5 hard reassurance ceiling. The runner reserves conservative capacity before each call and stops rather than silently reducing review quality when the ceiling would be exceeded.

The cost ceiling is an operational guardrail, not permission to accept incomplete assurance.

## Evidence retained

The workflow uploads a 30-day GitHub Actions artifact containing, as available:

- exact reviewed `main` SHA;
- exact candidate fingerprint;
- node/domain counts;
- model route and configured spend ceiling;
- observed token/tool spend estimate;
- web-search call count;
- all fresh reviewer context IDs;
- domain review outputs;
- whole-subject review output;
- blocking/material issue register;
- final PASS or FAIL/HOLD decision; and
- explicit exclusions/known limits.

Failure evidence is also retained when the live proof starts but cannot complete.

## Workflow

The operator dispatches:

`.github/workflows/content-factory-business-subject-foundation-reassurance-proof.yml`

with the exact current `main` SHA.

The workflow:

1. checks out that exact SHA;
2. verifies it is still current `main`;
3. reruns deterministic Business promotion-provenance validation;
4. runs the reassurance runner self-test;
5. executes the fresh live reassurance using the separate provider contexts; and
6. uploads the retained evidence artifact.

The runner is also exercised in normal `Foundation quality` CI using `--self-test`, which validates the 81-node package/fingerprint contract without incurring provider spend.

## Progression after the proof

A PASS is evidence that the remediated Business subject-foundation candidate has cleared this automated T3 reassurance gate. It does not itself change the candidate from `research_evidence_only` or create learner-publication authority.

After PASS, any promotion of the candidate into governed Subject Knowledge Foundation authority requires a separate explicit governed decision/change. Exact AQA 7132 mapping, Course Truth, Exam Truth and exact-course assurance remain subsequent gates. Qualified human subject/assessment review remains required at the threshold defined by the Content Accuracy Assurance Gate.

A FAIL/HOLD leaves the candidate unpromoted and triggers targeted remediation only for the affected node/facet/dependency scope.

## Documentation impact

This document records implementation of existing authority only. It does not amend normative Content Factory policy, rewrite the sealed research baseline, or alter learner-facing product behaviour.

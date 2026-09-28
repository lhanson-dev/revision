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

Response IDs must be unique across all provider attempts and completed review contexts. The reviewer is instructed not to rely on prior Revision assurance, remediation conclusions or board specifications.

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

## Provider-schema compatibility control

The first live dispatch, GitHub Actions run `36348538728` against `main` `de125a505e960e06e1c2b1c6dfd36ee410faaa47`, did not reach a substantive reviewer decision. The deterministic provenance and package self-tests passed, but the first OpenAI Responses request was rejected before review because the generated structured-output schema emitted JSON Schema `format: "uri"` for the evidence URL field.

This incident is an assurance-runner implementation failure, not a Business subject-foundation finding. No domain review completed and no PASS or FAIL/HOLD content verdict was produced.

The runner therefore keeps the provider-facing evidence URL as a required non-empty string and applies URL validity plus registered-source host/path checks deterministically after the structured response is returned. Normal `--self-test` assurance recursively rejects provider schemas containing unsupported `format` keywords and separately verifies that valid registered source URLs pass while malformed URLs fail the deterministic source-boundary check. This regression control runs before any live provider spend in both normal Foundation-quality CI and the live reassurance workflow.

The failed run remains historical evidence and must not be reclassified as a content FAIL/HOLD after remediation.

## Incomplete-response accounting and bounded retry

The second live dispatch, GitHub Actions run `36351378020` against `main` `884c1c8c0e1e996e33bb917848155e00a9377626`, reached the live provider but the first `Business Foundations` review returned provider status `incomplete`. No domain review completed and the run produced no Business-content PASS or FAIL/HOLD decision.

That run exposed a provider-lifecycle accounting defect: the runner checked for `status === completed` before retaining `incomplete_details`, usage, provider response identity or estimated spend. An incomplete response can consume provider tokens even when it does not return usable structured review output, so a failure artifact must not silently report such a response as zero-cost evidence merely because review parsing did not complete.

The runner now records every provider response before deciding whether review can continue. For each attempt it retains, when available:

- provider response ID;
- provider status and HTTP status;
- `incomplete_details`;
- usage payload;
- whether usage was available;
- web-search call count;
- observed spend estimate; and
- the `max_output_tokens` allowance used for that attempt.

Observed usage and search cost are charged to the reassurance budget before status handling. If provider usage is unavailable, spend measurement is marked partial and no automatic retry is permitted.

A provider response is retryable only when all of the following hold:

1. status is `incomplete`;
2. `incomplete_details.reason` is exactly `max_output_tokens`;
3. provider usage is available and has already been charged to the running budget;
4. no previous retry has been used for that review call; and
5. a fresh conservative reserve for the retry remains within the unchanged US$5 reassurance ceiling.

The single retry raises `max_output_tokens` to at least 25,000 while preserving the same high-reasoning review contract. Other incomplete causes, provider failures/refusals, missing usage evidence, exhausted retry allowance or reserve-ceiling failure remain fail-closed and do not produce a content verdict.

The `--self-test` contract now exercises incomplete-response cost accounting, retention of `incomplete_details`, retry classification, the no-retry-without-usage rule and the minimum retry output allowance without incurring live provider spend.

Run `36351378020` remains historical evidence and must not later be rewritten as a Business-content FAIL/HOLD or PASS.

## Completed-review evidence retention and evidence-quality gate

The third live dispatch, GitHub Actions run `36356501177` against `main` `cf3031071c28cce4742f7d1b3682b13ef8740cb4`, passed exact-main identity, deterministic promotion-provenance validation and the reassurance self-test. `Business Foundations` required the governed `max_output_tokens` retry and then completed with a `fail_hold` decision. `Marketing` also required the retry and then completed its structured review, but the runner stopped because the completed response contained three provider web-search calls while the implementation required a minimum of four.

The run therefore did not complete T3 reassurance. Its retained failure artifact recorded the `Business Foundations` decision and response identity but not the full completed-domain review output or issue register. The `Business Foundations` `fail_hold` is a genuine warning signal from a completed independent domain review, but the missing issue details mean the run does not contain sufficient evidence for controlled targeted remediation and must not be reclassified as a completed subject-foundation FAIL/HOLD.

The fixed numeric web-search-call threshold was an implementation proxy, not a requirement of the governing Content Accuracy Assurance Gate. The quality contract is instead enforced through the structured review itself: every supplied node must be reviewed; every node must carry at least one evidence item; evidence source IDs must be permitted for that node; evidence URLs must satisfy the registered source boundary; material findings must use permitted sources; and the reviewer decision must be deterministically consistent with the returned statuses and findings. Provider web-search count remains retained as cost/audit telemetry and continues to contribute to conservative pre-call spend reservation, but it is not itself a content-quality verdict.

The runner now writes a partial evidence checkpoint after every completed and validated domain. If a later domain, provider call, source-boundary check, whole-subject review or other control fails, the failure evidence retains the full completed-domain review objects and a machine-readable register of their blocking/material findings rather than reducing them to domain/decision/response-ID summaries.

The no-spend `--self-test` now proves that a structurally complete domain review with valid per-node evidence is accepted independently of its recorded search-call count and that a later synthetic failure retains the full completed-domain node-assessment output. The existing rights boundary, high-reasoning review contract, independent-context requirement, bounded retry policy and US$5 ceiling are unchanged.

Run `36356501177` remains immutable historical evidence. It is recorded as incomplete assurance with a non-recoverable `Business Foundations` `fail_hold` signal whose detailed findings were not retained; a new fresh complete reassurance run is required before targeted content remediation or promotion decisions.

## Manual-dispatch SHA normalization

The fourth and fifth dispatches, GitHub Actions runs `36393804597` and `36395180639`, both targeted the correct current `main` commit `fe596e34117d25856f33638cebff3a4dd0a06f33` but stopped before dependency installation or provider work at the exact-main identity step. The manually supplied `reviewed_main_sha` reached the workflow with surrounding whitespace. `actions/checkout` tolerated the value and checked out the intended commit, while the later literal shell comparison correctly failed closed because the raw input string was not byte-for-byte equal to the current-main SHA.

These two runs are workflow-input handling failures, not Business subject-foundation findings. Neither run reached deterministic package assurance or paid provider review, and neither produced a Business-content PASS/FAIL-HOLD decision or provider spend.

The workflow now normalizes the manual SHA once at its boundary by trimming surrounding whitespace only, then validates that the normalized value is exactly 40 lowercase hexadecimal characters. The single normalized value is reused for checkout, current-main identity verification, live runner binding and artifact naming. The substantive gate is unchanged: provider work may begin only when the normalized reviewed SHA exactly equals the current `main` SHA. Invalid, malformed or stale values still fail closed.

This normalization is an operator-input robustness correction only. It does not change the reviewed candidate, assurance criteria, independence contract, rights/source boundaries, provider model, spend ceiling or promotion decision rules.

## Cost control

The initial proof uses `gpt-5.6-terra` at high reasoning effort with a US$5 hard reassurance ceiling. The runner reserves conservative capacity before every provider call, including any permitted retry, and stops rather than silently reducing review quality when the ceiling would be exceeded.

Every provider attempt with available usage is charged before completion/retry handling. If usage is unavailable, the runner records partial spend measurement and prohibits an automatic retry because the remaining budget cannot be demonstrated safely.

The cost ceiling is an operational guardrail, not permission to accept incomplete assurance.

## Evidence retained

The workflow uploads a 30-day GitHub Actions artifact containing, as available:

- exact reviewed `main` SHA;
- exact candidate fingerprint;
- node/domain counts;
- model route and configured spend ceiling;
- observed token/tool spend estimate and spend-measurement status;
- web-search call count as audit/cost telemetry;
- all provider attempt records, including incomplete details and usage where available;
- all fresh provider/reviewer response IDs;
- full completed domain review outputs and their blocking/material issue register even when a later step fails;
- incremental partial evidence after each completed and validated domain;
- whole-subject review output when reached;
- final PASS or FAIL/HOLD decision when the complete gate reaches a content verdict; and
- explicit exclusions/known limits.

Failure evidence is also retained when the live proof starts but cannot complete. A provider/runner/control failure remains distinct from a substantive content FAIL/HOLD, while any completed-domain warning is preserved without being promoted into a whole-subject verdict.

## Workflow

The operator dispatches:

`.github/workflows/content-factory-business-subject-foundation-reassurance-proof.yml`

with the exact current `main` SHA. Surrounding operator whitespace is normalized at the workflow boundary; the resulting value must still be an exact 40-character lowercase hexadecimal SHA and must exactly equal current `main` before provider work can begin.

The workflow:

1. normalizes and validates the manually entered reviewed-main SHA;
2. checks out that exact SHA;
3. verifies it is still current `main`;
4. reruns deterministic Business promotion-provenance validation;
5. runs the reassurance runner self-test, including structured-output schema compatibility, runtime URL/source-boundary checks, incomplete-response accounting/retry controls, per-node evidence coverage and completed-domain failure retention;
6. executes the fresh live reassurance using separate provider contexts/attempts; and
7. uploads the retained evidence artifact.

The runner is also exercised in normal `Foundation quality` CI using `--self-test`, which validates the 81-node package/fingerprint contract and assurance-runner regression controls without incurring provider spend.

## Progression after the proof

A PASS is evidence that the remediated Business subject-foundation candidate has cleared this automated T3 reassurance gate. It does not itself change the candidate from `research_evidence_only` or create learner-publication authority.

After PASS, any promotion of the candidate into governed Subject Knowledge Foundation authority requires a separate explicit governed decision/change. Exact AQA 7132 mapping, Course Truth, Exam Truth and exact-course assurance remain subsequent gates. Qualified human subject/assessment review remains required at the threshold defined by the Content Accuracy Assurance Gate.

A FAIL/HOLD leaves the candidate unpromoted and triggers targeted remediation only for the affected node/facet/dependency scope.

A provider/runner failure that prevents substantive review completion produces neither PASS nor content FAIL/HOLD and requires bounded runner remediation plus a new fresh reassurance run.

## Documentation impact

This document records implementation of existing authority only. It does not amend normative Content Factory policy, rewrite the sealed research baseline, or alter learner-facing product behaviour.

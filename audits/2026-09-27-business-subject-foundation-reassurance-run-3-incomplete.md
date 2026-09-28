# Business Subject Foundation fresh reassurance run 3 — incomplete assurance

**Date:** 27 September 2026  
**Workflow run:** `36356501177`  
**Reviewed main SHA:** `cf3031071c28cce4742f7d1b3682b13ef8740cb4`  
**Candidate:** `v0.2-post-board-candidate`  
**Candidate fingerprint:** `e361c8b50dd43883d75aecfea775d922686e4248ec4964d73fe3d11de497fa97`  
**Outcome:** INCOMPLETE ASSURANCE — no final subject-foundation PASS or FAIL/HOLD

## Scope

This audit preserves the third live fresh independent T3 reassurance attempt for the Business Subject Knowledge Foundation after the provider-schema and incomplete-response lifecycle corrections.

It records the run as executed. It does not rewrite earlier assurance history, promote the candidate, or infer unavailable reviewer findings.

## Preconditions and deterministic controls

The run checked out the exact reviewed SHA and verified that it was current `main` at the start of execution.

Before live provider work:

- Business promotion-provenance validation passed;
- all 81 indexed candidate nodes matched the 81 promotion-matrix nodes;
- 20 promotion-eligible subject-truth sources were available;
- seven board-source IDs remained quarantined from reusable subject truth;
- the reassurance package self-test passed;
- provider-schema compatibility passed;
- runtime evidence-URL validation passed;
- incomplete-response accounting/evidence-retention controls passed; and
- the bounded `max_output_tokens` retry policy passed.

## Live provider attempts

The run used four fresh provider response contexts before stopping.

### Business Foundations

Attempt 1 returned provider status `incomplete` with reason `max_output_tokens`.

- web-search calls: 4;
- observed spend estimate: US$0.218862;
- provider usage was available and charged before retry;
- one bounded retry was therefore permitted.

Attempt 2 completed.

- web-search calls: 5;
- observed spend estimate: US$0.2745052;
- completed domain decision: `fail_hold`.

The completed `Business Foundations` decision is a genuine independent-review warning signal. However, the failure artifact retained only the domain, decision and provider response ID for that completed domain. It did not retain the full node-assessment output or machine-readable issue register. The underlying blocking/material findings are therefore unavailable for controlled targeted remediation.

### Marketing

Attempt 1 returned provider status `incomplete` with reason `max_output_tokens`.

- web-search calls: 5;
- observed spend estimate: US$0.235058;
- provider usage was available and charged before retry;
- one bounded retry was therefore permitted.

Attempt 2 completed its structured provider response.

- web-search calls: 3;
- observed spend estimate: US$0.1536552.

The runner then stopped with:

`business-subject-Marketing used 3 web searches; minimum 4`

No Marketing content verdict was accepted into the completed-domain set because the implementation-level search-count threshold failed first.

## Aggregate run evidence

- observed spend estimate: **US$0.8820804** of the US$5 ceiling;
- provider attempts / fresh response contexts: **4**;
- total recorded web-search calls: **17**;
- completed accepted domain reviews: **1** (`Business Foundations`);
- completed accepted domain decision: **`fail_hold`**;
- whole-subject integration review: **not reached**;
- final T3 subject-foundation verdict: **not produced**.

## Assurance classification

This run is not a PASS.

It is also not a completed whole-subject FAIL/HOLD because the reassurance sequence did not complete and the retained evidence does not contain the detailed issue register for the one completed `fail_hold` domain.

The correct classification is **incomplete assurance with a non-recoverable completed-domain `fail_hold` warning signal**. The Business candidate remains unpromoted and on HOLD pending a fresh complete reassurance run.

The absence of retained detailed findings means Revision must not guess or reconstruct a targeted Business-content remediation from this run.

## Control defect exposed

The run exposed two assurance-runner weaknesses:

1. a completed domain review could be reduced to domain/decision/response-ID metadata in the final failure artifact when a later step failed, losing the issue register required for targeted remediation; and
2. the runner treated a fixed minimum number of provider web-search calls as a quality gate even though the governing assurance requirement is valid source-backed evidence coverage, not a numeric search-call quota.

The numeric search count remains useful cost/audit telemetry and for conservative spend reservation. It is not, by itself, evidence that a completed structured review is adequate or inadequate.

## Required remediation

The bounded implementation remediation is to:

- persist each completed and deterministically validated domain review immediately;
- retain the full completed-domain review outputs and blocking/material issue register in later failure evidence;
- continue deterministic per-node evidence/source-ID/URL-boundary validation as the evidence-quality gate;
- retain provider web-search call counts as cost/audit telemetry rather than a standalone content-quality verdict;
- add no-spend regression tests for both behaviours; and
- run a new fresh independent reassurance against the then-current exact `main` SHA.

No Business teaching content, candidate provenance, rights classification, review severity rule, independent-context requirement, retry rule or US$5 ceiling is changed by this remediation.

## Later main movement

After this live run, `main` advanced from `cf3031071c28cce4742f7d1b3682b13ef8740cb4` to `d1f2ac606a7d134bd47aa575e35992c50b397a26` through unrelated Plan/interface work. The intervening changes were UI/test files and did not alter the Business candidate or reassurance runner. They do not explain the run-3 failure, but the next reassurance run must still bind to the exact then-current `main` SHA under the normal freshness rule.

## Historical integrity

This audit is an immutable snapshot of run `36356501177`. Later runner remediation or a later successful/failed reassurance run must be recorded as new evidence rather than editing this run into a different outcome.

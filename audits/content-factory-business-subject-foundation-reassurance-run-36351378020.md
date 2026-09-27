# Business Subject Foundation Fresh Reassurance — Run 36351378020

**Date:** 27 September 2026  
**Workflow:** Content Factory Business Subject Foundation Fresh Reassurance Proof  
**Run:** `36351378020`  
**Reviewed main SHA:** `884c1c8c0e1e996e33bb917848155e00a9377626`  
**Candidate:** `v0.2-post-board-candidate`  
**Candidate fingerprint:** `e361c8b50dd43883d75aecfea775d922686e4248ec4964d73fe3d11de497fa97`  
**Historical result:** assurance-runner/provider lifecycle failure before substantive independent review

## What completed

The workflow checked out and verified the exact current `main` SHA. Deterministic Business promotion-provenance validation passed for the 81-node candidate:

- 9 node files;
- 81 indexed nodes;
- 81 promotion-matrix nodes;
- 20 promotion-eligible subject-truth sources; and
- 7 board-source IDs quarantined from reusable subject truth.

The reassurance package self-test also passed, including provider structured-output schema compatibility and runtime evidence URL/source-boundary validation.

## Failure

The first live domain review, `Business Foundations`, reached the OpenAI Responses provider but returned provider status `incomplete` before a substantive review result was produced.

The runner then failed with:

`business-subject-Business Foundations provider status incomplete`

No domain review completed, no whole-subject review ran, and no Business-content PASS or FAIL/HOLD decision was reached.

## Evidence

- GitHub Actions run: `36351378020`
- Failed job: `108710582386`
- Retained artifact: `10941894387`
- Reviewed main: `884c1c8c0e1e996e33bb917848155e00a9377626`
- Candidate fingerprint: `e361c8b50dd43883d75aecfea775d922686e4248ec4964d73fe3d11de497fa97`
- Promotion provenance: PASS
- Candidate package/self-test: PASS
- Live independent review: NOT COMPLETED
- Content decision: NONE

## Accounting limitation

The retained failure artifact reported zero observed spend and zero web-search calls. That record must not be interpreted as evidence that the provider call consumed no billable usage.

The pre-remediation runner checked provider completion status before reading and retaining the response usage payload, `incomplete_details`, response identity or calculated spend. An `incomplete` response can consume input/reasoning/output capacity even when no usable structured review result is returned. Historical spend for this run is therefore **unknown / under-recorded**, not proven zero.

The historical artifact itself is not rewritten; this audit records the limitation discovered from the exact runner implementation and workflow log.

## Remediation boundary

The defect belongs to provider lifecycle handling and assurance accounting only. It does not identify a Business teaching-content error, provenance defect, source-rights defect or promotion decision.

The bounded remediation is to:

1. record provider response identity, status, `incomplete_details`, usage and web-search count before completion-status handling;
2. charge available usage/tool cost to the running reassurance budget before retry or failure handling;
3. retain every provider attempt in success/failure evidence;
4. permit at most one automatic retry only for `incomplete` with reason `max_output_tokens`, only when provider usage is available and already accounted;
5. require a fresh conservative reserve for that retry to remain inside the unchanged US$5 hard ceiling;
6. prohibit automatic retry when usage is missing or the incomplete reason is anything else; and
7. cover the lifecycle/accounting rules in the no-spend `--self-test` contract.

The Business candidate, teaching prose, promotion provenance matrix, rights boundary and substantive independent-review criteria are unchanged.

After this governed runner remediation is merged, a new fresh reassurance run must be dispatched against the then-current exact `main` SHA. Only a later completed run may produce a PASS or content FAIL/HOLD decision.

## Historical integrity

This record preserves the observed run state. Run `36351378020` must not later be rewritten or reclassified as a Business-content PASS or FAIL/HOLD.

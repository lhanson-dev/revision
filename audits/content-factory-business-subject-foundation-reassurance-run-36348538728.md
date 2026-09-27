# Business Subject Foundation Fresh Reassurance — Run 36348538728

**Date:** 27 September 2026  
**Workflow:** Content Factory Business Subject Foundation Fresh Reassurance Proof  
**Run:** `36348538728`  
**Reviewed main SHA:** `de125a505e960e06e1c2b1c6dfd36ee410faaa47`  
**Candidate:** `v0.2-post-board-candidate`  
**Historical result:** assurance-runner implementation failure before substantive independent review

## What completed

The workflow checked out and verified the exact reviewed `main` SHA. Deterministic Business promotion-provenance validation passed for the 81-node candidate, and the reassurance package self-test passed with candidate fingerprint `e361c8b50dd43883d75aecfea775d922686e4248ec4964d73fe3d11de497fa97`.

## Failure

The first live OpenAI Responses call failed before a Business-domain review completed. The provider rejected the generated strict structured-output JSON Schema because the evidence URL field emitted JSON Schema `format: "uri"`, which was not accepted by that response-format contract.

The workflow therefore failed on the reassurance execution step before producing any substantive node/domain findings. No reviewer context completed, no Business content verdict was reached, and this run is neither a PASS nor a content FAIL/HOLD.

## Evidence

- GitHub Actions run: `36348538728`
- Failed job: `108702533982`
- Retained artifact: `10941423499`
- Promotion provenance: PASS
- Candidate package/self-test: PASS
- Live independent review: NOT COMPLETED
- Content decision: NONE

## Remediation boundary

The defect belongs to the reassurance runner/provider schema contract only. The Business teaching corpus, node IDs, promotion provenance matrix, source register and candidate fingerprint do not require remediation as a result of this run.

The bounded fix is to keep evidence URLs as provider-compatible non-empty strings in the structured-output schema, retain deterministic URL/source-boundary validation after response parsing, and add a CI self-test that rejects unsupported JSON Schema `format` keywords before live provider spend.

After the governed runner fix is merged, the fresh reassurance must be dispatched again against the then-current exact `main` SHA. Only that later completed run may produce a PASS or FAIL/HOLD decision for the candidate.

## Historical integrity

This record preserves the observed failure state. It must not be rewritten after remediation to imply that run `36348538728` completed substantive independent assurance.

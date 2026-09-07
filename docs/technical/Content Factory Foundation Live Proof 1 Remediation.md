# Content Factory Foundation Live Proof 1 Remediation

**Status:** Implementation correction in progress  
**Date:** 3 September 2026  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production

## Context

The first main-only `Content Factory Foundation Live Proof` run executed against approved `main` commit `95eb36a605442a94bfcbc327900b3a4d519c80a1` as workflow run `33799492847`.

The proof progressed through the live runtime until the Question Families provider boundary, where the OpenAI Responses API rejected the structured-output schema with HTTP 400 because the response format used a top-level JSON Schema array. The provider requires the top-level response-format schema to be an object.

No successful Foundation Candidate or proof artifact was retained from this run. The failed run remains historical execution evidence and must not be rewritten as a successful proof.

## Root cause

`createAqaAlevelBusiness7132FoundationLiveWorkers()` passed `z.array(questionFamilySchema)` directly to `OpenAIStructuredWorkerClient` for the Question Families worker. That internal compiler contract is valid as an array, but it is not a valid top-level OpenAI structured response format.

This was a provider-contract integration defect. The run did not establish an educational-quality, source-rights, or Foundation-assurance failure.

## Correction

The live adapter now uses an object-rooted provider envelope:

`{ questionFamilies: [...] }`

The envelope exists only at the live provider boundary. After successful provider parsing, the adapter unwraps `questionFamilies` and returns the existing Question Family array to the Foundation compiler. The compiler contract and downstream Foundation schema therefore remain unchanged.

## Regression assurance

The Foundation live-adapter unit proof now verifies that:

- the Question Families provider JSON Schema has top-level `type: object`;
- the schema exposes the `questionFamilies` field;
- the provider response is unwrapped back to the existing Question Family array contract;
- the complete provider-free Foundation Candidate proof still succeeds; and
- zero learner-facing artifacts remain generated.

## Governance and scope

This correction is within the already Founder-approved Slice 2B scope for Issue #289. It introduces no new product behaviour, content strategy, rights policy, Foundation approval rule or learner-facing capability.

The failed live workflow must not be re-run on its old commit. After this correction passes exact-head CI, receives Founder merge approval, is merged, and is production-verified on `main`, a new main-only live proof must be dispatched. Slice 2B remains incomplete until that new proof succeeds and retains evidence.

## Related strict-schema regression — 7 September 2026

After PR #334 was Founder-approved, merged and production-verified, Foundation Live Proof #45 ran as workflow `34160813587` on released `main` `42cfb1d074ec6bd3e5f9fc075e6c7e208ee4d62e`.

The run reached the Question Families provider boundary but OpenAI rejected the strict response schema before generation with HTTP 400. PR #334 had added optional internal field `aggregateMarkTotal` to `questionFamilySchema`; because the strict provider envelope reused the complete domain schema, `aggregateMarkTotal` appeared under JSON Schema `properties` without appearing in `required`. The OpenAI strict structured-output contract requires every declared property to be required, so the request was invalid.

This was a provider-contract integration defect rather than an educational-quality, source-rights or Foundation-assurance finding. No successful Foundation Candidate was created and no proof artifact was retained from workflow `34160813587`.

### Correction

`aggregateMarkTotal` remains compiler-owned Foundation truth. The OpenAI live compatibility boundary now substitutes a provider-specific Question Families envelope for worker `content-factory.foundation.question-families` that omits `aggregateMarkTotal` from provider output entirely.

The provider therefore generates only the semantic Question Family fields it is responsible for. The downstream AQA pre-calibration compiler continues to inject and validate the exact complete-set aggregate total from governed Exam Truth. The internal `questionFamilySchema`, ADR-0022 pre-calibration semantics, source-rights boundary and learner-facing behaviour are unchanged.

### Regression assurance

`foundation-live-provider-schema.test.ts` now proves that:

- the internal/domain Question Family schema still contains `aggregateMarkTotal`;
- the strict provider Question Family schema does not expose `aggregateMarkTotal`;
- every property exposed by the strict provider item schema is present in its `required` set; and
- a provider response without `aggregateMarkTotal` succeeds through the live structured-provider boundary.

Existing pre-calibration regressions remain responsible for proving that Paper 2 and Paper 3 receive the compiler-owned `aggregateMarkTotal = 100` invariant after provider generation.

### Documentation and governance impact

No normative authority, ADR, source-use classification or learner-facing product change is required. This is a technical integration correction under the already-governed Foundation compiler boundary. The failed workflow remains historical evidence and must not be reclassified as a successful Foundation proof.

After this correction passes exact-head CI, receives explicit Founder merge approval, is merged and `revision/path-to-live` is green, a completely new Foundation Live Proof must be launched from the new released `main`. Workflow `34160813587` must not be retried as if it produced a reusable candidate.

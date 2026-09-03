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

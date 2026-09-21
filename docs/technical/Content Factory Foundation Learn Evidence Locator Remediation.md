# Content Factory Foundation Learn Evidence Locator Remediation

**Status:** Current implementation remediation evidence  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Course Learning Blueprint Amendment.md`; `docs/technical/Content Factory Foundation-Native Atomic Learning Obligations.md`; ADR-0027

## Purpose

Record the fourth `course-learning-blueprint-v2` / provider-contract-v5 Business generation fail-hold and the smallest implementation repair required to align provider Learn evidence-locator guidance with the existing fail-closed resolver.

This remediation does not change Course Truth, the Course Learning Blueprint, provider contract semantics, the validator, Foundation approval requirements, learner publication rules or the hard generation spend ceiling.

## Retained fail-hold evidence

After PR #357 became Live, a new Business generation was triggered from the unchanged retained AQA A-level Business 7132 Foundation fingerprint:

`1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`

Generation run `35582938563` executed against merged-main commit `9c11da0e4c431b31494eca092c99f0c88f3585cc` with provider contract version `5`, model `gpt-5.6-terra`, an 8,000-token output capacity and the unchanged `$12` hard spend ceiling.

All retained source-proof and AI-assured Foundation identity, fingerprint and provenance checks passed before generation.

The run then produced:

- 65 provider generation calls;
- 64 successful calls;
- 32 complete Learn + Practice work units;
- zero provider retries;
- reported final-response usage cost `$2.480932`;
- learner asset count `0`; and
- overall status `fail_hold`.

The retained artifact is:

- artifact ID `10632183688`;
- digest `sha256:dc4da9863bbec2a64842210891ccb23b8d25e9acf4159308ea35baa54047e27b`;
- generation implementation commit `9c11da0e4c431b31494eca092c99f0c88f3585cc`.

The exact failure occurred on the Learn generation for `foundation-overall-business-performance`:

`provider_contract_failure: Coverage evidence location references missing key point in section 2 5`

The provider returned a `section_key_point` evidence location whose `detailIndex=5` did not correspond to an existing key-point entry in generated section 2. The resolver correctly rejected the nonexistent location.

## Classification

This is a provider-contract evidence-location guidance defect, not a Foundation truth defect and not an output-capacity failure.

The existing Learn resolver already requires all evidence locations to resolve to generated content. Provider-v5 instructions stated that evidence indexes are 1-based and described the meaning of `itemIndex` and `detailIndex`, but did not explicitly tell the provider that the selected indexes must remain within the generated arrays.

The previous Practice locator remediation exposed the equivalent rule for Practice activity indexes. This remediation applies the same fail-closed alignment principle to Learn evidence locations.

## Implementation repair

The shared `provider-coverage-evidence.ts` boundary now exposes generic Learn evidence-location guidance requiring that:

- Learn evidence indexes are 1-based;
- every `coverageEvidence` and `treatmentEvidence` location references generated content that actually exists;
- `section_key_point` uses an existing section and an existing `keyPoints` entry inside that section;
- `worked_example_step` uses an existing worked example and an existing `steps` entry; and
- no `itemIndex` or `detailIndex` may point beyond the generated arrays.

Provider contract v5 includes this guidance before the stricter atomic Learn placement rules. The existing resolver remains unchanged and continues to fail closed if the provider returns a nonexistent location.

Regression coverage binds the provider instruction to these rules so the live failure cannot be reintroduced silently.

## Governed next step

After this implementation repair passes exact-head CI and is merged with explicit Founder approval, generate one new Business v2/v5 bundle from the unchanged retained Foundation. If generation succeeds, run deterministic and genuinely fresh-context independent asset assurance against that exact new bundle.

Do not run assurance against the failed bundle from run `35582938563`, and do not reinterpret this historical fail-hold as a successful generation.

The qualified-human Foundation review remains pending and learner publication remains false.

## Documentation impact

No normative authority change is required. This change aligns provider instructions with existing implementation validation and approved Course Learning Blueprint obligations. No new ADR is required.
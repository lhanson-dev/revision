# Content Factory Foundation Learn Evidence Binding Remediation

**Status:** Current implementation remediation evidence  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Course Learning Blueprint Amendment.md`; `docs/technical/Content Factory Foundation-Native Atomic Learning Obligations.md`; ADR-0027

## Purpose

Record the fifth `course-learning-blueprint-v2` Business generation fail-hold and the structural Learn evidence-binding repair introduced after provider-contract-v5 prompt guidance proved insufficient.

This remediation changes only the Foundation-v2 Learn provider evidence-location contract. It does not change Course Truth, the Course Learning Blueprint, the generic/legacy provider-v4 Learn path, Practice evidence semantics, Foundation approval requirements, learner publication rules, provider output capacity or the hard generation spend ceiling.

## Retained fifth fail-hold evidence

After PR #358 became Live, one new Business generation was triggered from the unchanged retained AQA A-level Business 7132 Foundation fingerprint:

`1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`

Generation run `35633958590` executed against merged-main commit `f51d02faa0e943918865c83ad97aaafde3e7ef8d` with Learn/Practice provider contract version `5`, model `gpt-5.6-terra`, an 8,000-token output capacity and the unchanged `$12` hard spend ceiling.

All retained source-proof and AI-assured Foundation identity, fingerprint and provenance checks passed before generation.

The run produced:

- 19 provider generation calls;
- 18 successful calls;
- 9 complete Learn + Practice work units;
- zero provider retries;
- reported final-response usage cost `$0.674106`;
- learner asset count `0`; and
- overall status `fail_hold`.

The retained artifact is:

- artifact ID `10655638851`;
- digest `sha256:15a115db50ce62cbf22a7e18a8adfd61befbaff0a040cde2548bd72ab370b08c`;
- generation implementation commit `f51d02faa0e943918865c83ad97aaafde3e7ef8d`.

The exact failure occurred on Learn generation for `foundation-marketing-objectives`:

`provider_contract_failure: Coverage evidence location references missing key point in section 2 4`

The provider again emitted a numeric Learn evidence reference to a key-point array entry that did not exist. The resolver correctly failed closed.

## What the fifth proof established

PR #358 made the numeric-index rules explicit in the provider instruction. The fifth live proof nevertheless reproduced the same defect class seen in run `35582938563`.

The remaining weakness is therefore structural rather than merely instructional: provider v5 asks the model to generate variable-length Learn arrays and separately predict numeric pointers back into those arrays. A prompt can tell the model to keep the pointers in range, but it cannot make that relationship structurally safe.

The correct response is not to clamp invalid indexes, redirect them to a nearby field, use fuzzy matching or impose fixed numbers of sections/key points/steps. Those approaches would either weaken evidence integrity or conflict with the Course Learning Blueprint requirement that learning treatment be requirement-driven rather than quota-driven.

## Provider v6 Learn evidence binding

Foundation-native `course-learning-blueprint-v2` Learn generation now uses provider contract version `6` for evidence locations. The v6 schema and resolver are isolated to the dedicated Foundation learning-worker route; generic/legacy Learn generation continues to use the existing provider-v4 numeric evidence contract unchanged.

A Foundation-v2 Learn evidence location contains:

- `area`: the governed generated field type, such as `section_explanation`, `section_key_point`, `worked_example_step` or `misconception_correction`; and
- `evidenceText`: text copied verbatim from the exact generated field that provides the evidence.

The fail-closed resolver enumerates generated strings for the declared area and accepts the evidence only when `evidenceText` has exactly one exact match in that area.

It rejects:

- text that is absent from the declared area;
- paraphrased or reconstructed evidence text; and
- text that is duplicated within the declared area and is therefore ambiguous.

The existing deterministic atomic placement rules still run before the text binding is accepted. Course Truth summaries still belong in the Learn explanation body, formulas/procedures still require worked-example evidence, and misconceptions still require explicit correction evidence.

No fuzzy or positional fallback is permitted.

## Practice remains provider v5

The repeated live failure is specific to Learn's nested variable-length content arrays. Foundation-v2 Practice retains provider contract version `5` and its existing fail-closed `mode + activityIndex + field` evidence contract. The earlier Practice locator defect has not recurred in the later Business proofs.

This separation keeps the remediation at the smallest evidenced scope rather than changing an unaffected contract.

## Regression protection

The repair includes tests proving that Foundation-v2 Learn evidence:

- resolves only from a unique verbatim value in the declared generated area;
- fails closed when the text is absent;
- fails closed when the same text is ambiguous in that area;
- continues to enforce atomic Learn placement before accepting evidence;
- is instructed to use `area + evidenceText`, not guessed array indexes; and
- does not alter the shared provider-v4 Learn evidence schema or its existing generic/legacy regression coverage.

The existing Practice v5 guidance regression remains in place.

## Governed next step

After the provider-v6 Learn repair passes exact-head CI, receives explicit Founder merge approval, is merged and is confirmed Live, generate exactly one new Business bundle from the unchanged retained Foundation.

If generation succeeds, retain and inspect that exact bundle and run deterministic plus genuinely fresh-context independent asset assurance against it. Do not run assurance against the failed bundle from run `35633958590`.

The qualified-human Foundation review remains pending and learner publication remains false.

## Documentation impact

No normative authority change is required: the Course Learning Blueprint already requires exact evidence and rejects fixed format quotas. This is a localized implementation-contract correction within the existing Content Factory architecture and ADR-0027 decision boundary, so no new ADR is required.

Historical v5 fail-hold evidence remains immutable and must not be rewritten as successful generation evidence.

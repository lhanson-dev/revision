# Content Factory Foundation Internal Learning Assurance Context Accounting Remediation

**Status:** Current implementation remediation evidence  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory AI-Assured Foundation Gate Amendment.md`; `docs/technical/Content Factory Foundation Learn Evidence Binding Remediation.md`; ADR-0027

## Purpose

Record the deterministic-assurance compatibility defect exposed by the first successful provider-v9 Business generation and define the narrow implementation correction.

This remediation does not change Course Truth, the Course Learning Blueprint, generation obligations, independent-review semantics, Foundation approval requirements or learner publication rules.

## Retained provider-v9 generation proof

Business generation run `35789048198` succeeded against implementation commit `541a079f5647c54e04e67040f25f08ab86402665` using the unchanged retained AQA A-level Business 7132 Foundation fingerprint:

`1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`

The retained bundle contains:

- 49 deterministic work units;
- 147 successful provider calls;
- zero failed provider calls;
- zero retries;
- 98 Learn provider calls: one learner-content generation call and one evidence-binding call per work unit;
- 49 Practice provider calls;
- 147 unique generation contexts;
- Learn provider contract v9;
- Practice provider contract v5;
- Learn and Practice assets retained as pending assurance; and
- learner publication eligibility `false`.

The generation artifact is `10723573827`. Its current GitHub artifact metadata is authoritative for digest/expiry values.

## Assurance fail-hold

Fresh assurance run `35829471613` bound the exact source proof, AI-assured Foundation proof and successful learning artifact. Proof identity checks and retained-evidence downloads passed before deterministic asset assurance ran.

The assurance artifact `10736673398` retained a `fail_hold`. Every deterministic check passed except `generation-context-integrity`, which reported:

`Expected 98 generation contexts, found 147`

No independent reviewer calls were started. `reviewerContextCount` remained `0`, so this result is not an educational-content finding and does not assess the semantic quality of the generated Learn or Practice assets.

## Root cause

The deterministic asset-assurance implementation assumed exactly two provider contexts per work unit: one Learn context and one Practice context.

Provider v9 deliberately changed Foundation-v2 Learn to a two-stage provider flow:

1. generate finalized learner content; and
2. bind every deterministic evidence obligation to a field that exists in that finalized content.

The generation bundle correctly retains both Learn provider contexts so later independent review can exclude every generation context. Therefore the correct v9 count is three contexts per work unit, while older single-call Learn contracts legitimately retain two.

The assurance fixed-count invariant was stale; the generated bundle was not malformed.

## Remediation

Deterministic assurance must not infer a fixed provider-call count from the number of work units. It now requires:

- at least two retained generation contexts per work unit, preserving the minimum one Learn plus one Practice execution model;
- every retained generation context to be unique; and
- no retained generation context to collide with Foundation generation, prior Foundation assurance or other explicitly forbidden contexts.

The live assurance proof separately verifies that the retained learning proof's `generationRuns` context set exactly equals the bundle's `generationContextIds`. Together these checks remain fail-closed while allowing implementation-valid multi-call Learn contracts such as provider v9.

Regression coverage explicitly proves both the provider-v9 three-context pattern and the legacy two-context minimum, while retaining duplicate, missing-context and forbidden-context failures.

## Governed next step

The remediation must pass exact-head Revision CI, receive explicit Founder merge approval, merge through the governed path and be confirmed Live.

After it is Live, rerun fresh-context internal Learn/Practice assurance against the same successful retained generation artifact `10723573827` while it remains unexpired. A new paid Business generation is not required because the failed assurance did not identify a generation defect and did not mutate the retained bundle.

Learner publication remains blocked until derived-asset assurance passes and the Foundation receives qualified-human approval.

## Documentation impact

No normative authority change is required. This is a localized implementation correction that aligns deterministic assurance with the already-documented provider-v9 provenance model. No new ADR is required.

Historical generation and assurance artifacts remain immutable evidence and must not be rewritten or reclassified.

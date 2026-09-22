# Content Factory Foundation Learn Evidence Binding Remediation

**Status:** Current implementation remediation evidence — provider-v7 repair in progress  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Course Learning Blueprint Amendment.md`; `docs/technical/Content Factory Foundation-Native Atomic Learning Obligations.md`; ADR-0027

## Purpose

Record the retained Business Learn evidence-binding fail-holds and the structural remediation sequence from provider-v5 numeric references, through provider-v6 copied-text references, to provider-v7 inline evidence markers.

These remediations change only the Foundation-v2 Learn provider evidence-binding contract. They do not change Course Truth, the Course Learning Blueprint, the generic/legacy provider-v4 Learn path, Practice evidence semantics, Foundation approval requirements, learner publication rules, provider output capacity or the hard generation spend ceiling.

## Retained fifth fail-hold — provider v5

After PR #358 became Live, one Business generation was triggered from the unchanged retained AQA A-level Business 7132 Foundation fingerprint:

`1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`

Generation run `35633958590` executed against merged-main commit `f51d02faa0e943918865c83ad97aaafde3e7ef8d` with Learn/Practice provider contract version `5`, model `gpt-5.6-terra`, an 8,000-token output capacity and the unchanged `$12` hard spend ceiling.

The run retained:

- 19 provider calls;
- 18 successful calls;
- 9 complete Learn + Practice work units;
- zero retries;
- reported final-response usage cost `$0.674106`;
- learner asset count `0`; and
- overall status `fail_hold`.

Artifact:

- ID `10655638851`;
- digest `sha256:15a115db50ce62cbf22a7e18a8adfd61befbaff0a040cde2548bd72ab370b08c`.

Exact failure:

`provider_contract_failure: Coverage evidence location references missing key point in section 2 4`

This repeated the numeric Learn locator defect after prompt guidance had already been strengthened. It established that asking the provider to generate variable-length arrays and separately predict numeric pointers back into them was structurally unreliable.

## Provider v6 remediation

PR #359 replaced provider-guessed Learn indexes with `area + evidenceText` binding for Foundation-v2 Learn only. Generic/legacy Learn remained on provider v4 and Practice remained on provider v5.

The v6 resolver accepted evidence only when `evidenceText` exactly matched one generated string in the declared area and failed closed for missing, paraphrased or ambiguous text.

This removed the numeric-pointer failure mode without using fuzzy matching, nearest-item fallback or fixed content-array quotas.

## Retained sixth fail-hold — provider v6

After PR #359 became fully Live, exactly one new Business generation was triggered from the same retained Foundation fingerprint.

Generation run `35726339624` executed against merged-main commit:

`6811e11555437a77960f90f500f69b1dc5d31563`

The retained source-proof and AI-assured Foundation identity/fingerprint checks all passed. Generation used:

- Learn provider contract `6`;
- Practice provider contract `5`;
- model `gpt-5.6-terra`;
- 8,000 maximum output tokens; and
- unchanged `$12` hard spend ceiling.

The very first Learn call for `foundation-course-wide-business-context` failed closed with:

`provider_contract_failure: Coverage evidence text does not exactly match generated section_explanation`

Retained proof:

- workflow run `35726339624`;
- artifact ID `10693164409`;
- artifact digest `sha256:8818ebd9f31d53f05af6576266b50d8b96a4e8fcb83590003586936230f968c9`;
- one provider generation call;
- zero retries;
- reported final-response usage cost `$0.043836`;
- learner asset count `0`;
- human review status `pending`;
- Foundation approval status `not_approved`; and
- learner publication eligibility `false`.

The resolver again behaved correctly. The failure demonstrates that v6 still contained a self-reference: the provider generated learner content and separately had to duplicate the exact generated text into an evidence field. Even without indexes, that cross-field copy relationship remained structurally fragile.

This is not evidence of a Foundation truth defect and does not justify weakening evidence validation.

## Provider v7 Learn inline evidence binding

Provider v7 removes separate Learn evidence references altogether.

Before generation, the deterministic worker derives short machine-only markers for:

- every required teaching-point coverage obligation; and
- every exact `nodeId + Learn treatment` obligation.

The provider places each supplied marker exactly once **inside the learner-content field that actually proves the obligation**. For example, a Course Truth marker belongs in an explanation/key-point field, a formula/procedure marker belongs in a worked-example field, and a misconception marker belongs in the explicit correction.

The resolver then:

1. traverses the generated Learn fields;
2. records the actual field/area containing each marker;
3. requires every expected marker exactly once;
4. rejects unknown or duplicated markers;
5. applies the existing deterministic atomic and treatment-placement rules to the actual marked field;
6. derives retained coverage evidence from that field; and
7. removes all valid machine markers before learner content is retained.

The provider no longer has to:

- guess array indexes;
- repeat generated learner text in a second evidence structure;
- calculate positional references; or
- rely on fuzzy/nearest matching.

A field may carry multiple markers only when it genuinely satisfies multiple compatible obligations. Marker presence does not itself prove semantic quality; fresh-context independent assurance remains required after successful generation.

## Practice remains provider v5

Foundation-v2 Practice continues to use provider contract `5` and its fail-closed `mode + activityIndex + field` evidence contract. The later Business proofs have not reproduced the earlier Practice indexing defect, so changing Practice would expand scope without evidence.

## Regression protection

Provider-v7 regression coverage must prove that Foundation-v2 Learn:

- derives coverage evidence from the actual marked generated field;
- strips markers before retained learner output;
- fails closed when an expected marker is missing;
- fails closed when a marker is duplicated;
- fails closed for unknown marker identities;
- preserves atomic Course Truth/formula/misconception placement rules;
- preserves node-level treatment placement rules such as worked-example and misconception-repair ownership;
- exposes marker mappings clearly in provider instructions;
- no longer exposes v6 copied-text or v5 numeric Learn evidence instructions; and
- does not change generic/legacy provider-v4 Learn or Practice-v5 behaviour.

## Governed next step

The provider-v7 repair must pass exact-head Revision CI, receive explicit Founder merge approval for its PR, merge through the governed path and be confirmed Live before another paid Business generation is allowed.

After it is Live, trigger exactly one new Business generation from the unchanged retained Foundation. If that succeeds, inspect the retained bundle and then run deterministic plus genuinely fresh-context independent asset assurance against that exact bundle.

Do not run assurance against any failed bundle.

The qualified-human Foundation review remains pending and learner publication remains false.

## Documentation impact

No normative authority change is required. The active Course Learning Blueprint already requires exact, requirement-driven evidence and prohibits fixed-format quotas. Provider v7 is a localized implementation-contract correction within the existing ADR-0027 architecture boundary, so no new ADR is required.

Historical provider-v5 and provider-v6 fail-holds remain immutable evidence and must not be rewritten as successful generation results.

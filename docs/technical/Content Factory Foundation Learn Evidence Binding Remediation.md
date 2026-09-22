# Content Factory Foundation Learn Evidence Binding Remediation

**Status:** Current implementation remediation evidence — provider-v8 repair in progress  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Course Learning Blueprint Amendment.md`; `docs/technical/Content Factory Foundation-Native Atomic Learning Obligations.md`; ADR-0027

## Purpose

Record the retained Business Learn evidence-binding fail-holds and the structural remediation sequence from provider-v5 numeric references, through provider-v6 copied-text references and provider-v7 free-text inline markers, to provider-v8 typed field-owned evidence metadata.

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

## Provider v7 remediation

PR #362 removed separate Learn evidence references and derived evidence from short deterministic machine markers placed directly inside generated learner-content fields.

Before generation, the worker derived one coverage marker for every required teaching point and one treatment marker for every required `nodeId + Learn treatment` obligation. The resolver required each expected marker exactly once, validated the actual marked field, derived evidence from that field and stripped valid markers before retention.

This removed both numeric pointers and copied-text self-reference. Generic/legacy Learn remained v4 and Practice remained v5.

## Retained seventh fail-hold — provider v7

After PR #362 became fully Live, exactly one new Business generation was triggered from the same retained Foundation fingerprint.

Generation run `35747978726` executed against merged-main commit:

`fc5c894254820a806d3779e3846737930cac42e0`

The source-proof and AI-assured Foundation checks all passed. Generation used Learn provider contract `7`, Practice provider contract `5`, model `gpt-5.6-terra`, 8,000 maximum output tokens and the unchanged `$12` hard spend ceiling.

The first Learn call for `foundation-course-wide-business-context` failed closed with:

`provider_contract_failure: Missing Learn evidence marker [[REV-C2]]`

Retained proof:

- workflow run `35747978726`;
- artifact ID `10703917081`;
- artifact digest `sha256:938ac10f0d49c518115e95cc8aa541a8ee2f05beb83417c99c48b544a17ca90b`;
- one provider generation call;
- zero retries;
- reported final-response usage cost `$0.027354`;
- learner asset count `0`;
- human review status `pending`;
- Foundation approval status `not_approved`; and
- learner publication eligibility `false`.

The resolver correctly failed closed. The defect is that v7 still expressed evidence ownership only through free-text marker instructions. The structured JSON schema required the learner-content strings but could not require a provider to place every supplied marker inside those strings. The provider therefore omitted one required coverage marker even though the content call itself completed.

This is not a Foundation truth defect. It shows that free-text marker placement is still too weak a provider contract for deterministic evidence completeness.

## Provider v8 typed field-owned evidence

Provider v8 makes evidence ownership an explicit typed property of every learner-content field returned by the provider.

Each evidence-bearing field is generated as:

```text
{
  text: <learner-facing prose>,
  evidenceIds: <zero or more schema-constrained obligation IDs>
}
```

Before generation, the deterministic worker derives:

- one `coverage_N` ID for every required teaching point; and
- one `treatment_N` ID for every exact `nodeId + Learn treatment` obligation.

The provider schema requires every learner-content field object to contain both `text` and `evidenceIds`. The `evidenceIds` values are constrained to the exact supplied IDs. The resolver then:

1. traverses the generated field objects;
2. records the actual field/area that owns each evidence ID;
3. requires every supplied ID exactly once across the generated content;
4. rejects unknown or duplicated IDs;
5. applies the existing deterministic atomic and treatment-placement rules to the actual owning field;
6. derives retained coverage evidence from that field; and
7. retains only learner-facing `text`, discarding evidence metadata before learner assets are formed.

Legacy `[[REV-*]]` marker text is rejected rather than silently accepted or stripped.

The provider no longer has to:

- guess array indexes;
- repeat generated learner text in a second evidence structure;
- calculate positional references; or
- remember to insert free-text machine markers into prose.

A field may own multiple compatible evidence IDs only when its text genuinely proves each obligation. Typed ownership does not itself prove semantic quality; fresh-context independent assurance remains required after successful generation.

## Practice remains provider v5

Foundation-v2 Practice continues to use provider contract `5` and its fail-closed `mode + activityIndex + field` evidence contract. The later Business proofs have not reproduced the earlier Practice indexing defect, so changing Practice would expand scope without evidence.

## Regression protection

Provider-v8 regression coverage must prove that Foundation-v2 Learn:

- derives coverage evidence from the actual field that owns the typed evidence ID;
- discards typed evidence metadata before retained learner output;
- requires the `evidenceIds` property structurally on generated learner fields;
- constrains evidence IDs to the supplied deterministic identifiers;
- fails closed when an expected evidence ID is missing;
- fails closed when an evidence ID is duplicated;
- fails closed for unknown evidence identities in direct resolver use;
- rejects legacy inline marker text;
- preserves atomic Course Truth/formula/misconception placement rules;
- preserves node-level treatment placement rules such as worked-example and misconception-repair ownership;
- exposes ID mappings clearly in provider instructions;
- no longer requests v7 markers, v6 copied text or v5 numeric Learn evidence references; and
- does not change generic/legacy provider-v4 Learn or Practice-v5 behaviour.

## Governed next step

The provider-v8 repair must pass exact-head Revision CI, receive explicit Founder merge approval for its PR, merge through the governed path and be confirmed Live before another paid Business generation is allowed.

After it is Live, trigger exactly one new Business generation from the unchanged retained Foundation. If that succeeds, inspect the retained bundle and then run deterministic plus genuinely fresh-context independent asset assurance against that exact bundle.

Do not run assurance against any failed bundle.

The qualified-human Foundation review remains pending and learner publication remains false.

## Documentation impact

No normative authority change is required. The active Course Learning Blueprint already requires exact, requirement-driven evidence and prohibits fixed-format quotas. Provider v8 is a localized implementation-contract correction within the existing ADR-0027 architecture boundary, so no new ADR is required.

Historical provider-v5, provider-v6 and provider-v7 fail-holds remain immutable evidence and must not be rewritten as successful generation results.

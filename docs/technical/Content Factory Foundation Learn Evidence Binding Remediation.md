# Content Factory Foundation Learn Evidence Binding Remediation

**Status:** Current implementation remediation evidence — provider-v9 repair in progress  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Course Learning Blueprint Amendment.md`; `docs/technical/Content Factory Foundation-Native Atomic Learning Obligations.md`; ADR-0027

## Purpose

Record the retained Business Learn evidence-binding fail-holds and the structural remediation sequence from provider-v5 numeric references, through provider-v6 copied-text references, provider-v7 free-text inline markers and provider-v8 typed field-owned metadata, to provider-v9 two-stage closed-set field binding.

These remediations change only the Foundation-v2 Learn provider evidence-binding contract. They do not change Course Truth, the Course Learning Blueprint, the generic/legacy provider-v4 Learn path, Practice evidence semantics, Foundation approval requirements, learner publication rules, provider output capacity or the hard generation spend ceiling.

## Provider v5 — numeric references

Provider v5 asked the model to generate variable-length Learn arrays and separately return numeric locations into those arrays.

After PR #358 strengthened numeric locator guidance, generation run `35633958590` still fail-held on `foundation-marketing-objectives` with:

`provider_contract_failure: Coverage evidence location references missing key point in section 2 4`

Retained proof:

- implementation commit `f51d02faa0e943918865c83ad97aaafde3e7ef8d`;
- artifact ID `10655638851`;
- digest `sha256:15a115db50ce62cbf22a7e18a8adfd61befbaff0a040cde2548bd72ab370b08c`;
- 19 provider calls;
- 18 successful calls;
- 9 complete Learn + Practice work units;
- zero retries;
- reported final-response usage cost `$0.674106`;
- learner asset count `0`; and
- overall status `fail_hold`.

This established that prompt wording could not make model-guessed pointers into variable-length arrays structurally reliable.

## Provider v6 — copied generated text

PR #359 replaced numeric pointers with `area + evidenceText` binding for Foundation-v2 Learn only. Generic/legacy Learn remained v4 and Practice remained v5.

After #359 became fully Live, run `35726339624` executed against merged-main commit `6811e11555437a77960f90f500f69b1dc5d31563` and failed on the first Learn call for `foundation-course-wide-business-context`:

`provider_contract_failure: Coverage evidence text does not exactly match generated section_explanation`

Retained proof:

- artifact ID `10693164409`;
- digest `sha256:8818ebd9f31d53f05af6576266b50d8b96a4e8fcb83590003586936230f968c9`;
- one provider generation call;
- zero retries;
- reported final-response usage cost `$0.043836`;
- learner asset count `0`;
- human review status `pending`;
- Foundation approval status `not_approved`; and
- learner publication eligibility `false`.

The resolver behaved correctly. The failure proved that exact copied text remained another self-reference: the provider generated learner content and separately had to reproduce the same content verbatim in evidence metadata.

## Provider v7 — free-text inline markers

PR #362 removed separate evidence references and instead asked the provider to insert short deterministic markers directly into generated learner fields. The resolver derived the evidence from the marked field and stripped markers before retention.

After #362 became fully Live, run `35747978726` executed against merged-main commit `fc5c894254820a806d3779e3846737930cac42e0` and failed on the first Learn call for `foundation-course-wide-business-context`:

`provider_contract_failure: Missing Learn evidence marker [[REV-C2]]`

Retained proof:

- artifact ID `10703917081`;
- digest `sha256:938ac10f0d49c518115e95cc8aa541a8ee2f05beb83417c99c48b544a17ca90b`;
- one provider generation call;
- zero retries;
- reported final-response usage cost `$0.027354`;
- learner asset count `0`;
- human review status `pending`;
- Foundation approval status `not_approved`; and
- learner publication eligibility `false`.

The resolver again failed closed correctly. The defect was that a structured JSON schema cannot require a free-text marker to occur inside arbitrary prose.

## Provider v8 — typed field-owned metadata

PR #363 moved evidence ownership into typed metadata on each generated learner-content field:

```text
{
  text: <learner-facing prose>,
  evidenceIds: <zero or more schema-constrained obligation IDs>
}
```

The schema constrained each individual `evidenceIds` value to a valid deterministic obligation ID and required the property on every generated learner-content field. The resolver required every obligation exactly once across the complete output and kept atomic/treatment placement rules unchanged.

This removed invalid identities, copied text, machine markers and numeric references. It did not, however, make **global completeness across a dynamic set of fields** structurally mandatory in the JSON schema. The model could still return well-formed field objects while omitting one obligation ID everywhere.

### Retained eighth fail-hold — provider v8

After PR #363 became fully Live, exactly one new Business generation was triggered from the unchanged retained AQA A-level Business 7132 Foundation fingerprint:

`1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`

Generation run `35752632982` executed against merged-main commit:

`c5d288347a50c176394efd5e7a124655dc4c83df`

The retained source-proof and AI-assured Foundation identity/fingerprint checks all passed. Generation used:

- Learn provider contract `8`;
- Practice provider contract `5`;
- model `gpt-5.6-terra`;
- 8,000 maximum output tokens; and
- unchanged `$12` hard spend ceiling.

The run progressed materially further than the preceding evidence-binding attempts:

- 37 provider generation calls;
- 36 successful calls;
- 18 complete Learn + Practice work units;
- zero retries;
- reported final-response usage cost `$1.245618`;
- learner asset count `0`; and
- overall status `fail_hold`.

The failing Learn work unit was `foundation-inventory-and-supply-chains` with:

`provider_contract_failure: Missing Learn evidence ID treatment_5`

Retained proof:

- workflow run `35752632982`;
- artifact ID `10708295095`;
- artifact digest `sha256:b05a337a5fbf32ea3b42d7c8296dcffb23bfbfbcfa3f2372d8b2dd9e8ff42c88`;
- Foundation human review `pending`;
- Foundation approval status `not_approved`; and
- learner publication eligibility `false`.

This is not a Foundation truth defect, output-capacity defect or reason to weaken the evidence gate. The v8 resolver did exactly what it should: it rejected a generated Learn object that did not claim ownership of every deterministic treatment obligation.

The live result demonstrates the remaining structural gap: constraining the values inside each dynamic field's `evidenceIds` array is not the same as making every expected obligation a mandatory response property.

## Provider v9 — two-stage closed-set field binding

Provider v9 separates learner-content generation from evidence binding.

### Stage 1 — generate final learner content

The Learn worker first generates the complete learner-facing content under the deterministic Course Learning Blueprint obligations.

The stage-1 response contains no evidence IDs, field IDs, copied evidence text, marker syntax or positional references. Existing educational structure rules remain part of the generation instruction: Course Truth summaries belong in the explanation body, formulas/procedures must be worked through in worked examples, and misconception repair belongs in explicit correction fields.

### Deterministic field registry

After stage 1 succeeds, Revision traverses the finalized generated content and creates deterministic machine field IDs such as:

- `introduction`;
- `section_1_explanation`;
- `section_1_key_point_1`;
- `worked_example_1_setup`;
- `worked_example_1_step_1`;
- `worked_example_1_conclusion`;
- `misconception_1_correction`; and
- `next_action`.

Each registry entry carries the exact field area and the already-generated learner text. Field IDs are created by Revision after generation; the model does not guess them while also deciding array sizes.

### Stage 2 — bind every obligation

A second bounded provider call receives:

- the finalized field registry;
- exact required teaching points;
- exact node/treatment obligations; and
- deterministic evidence IDs.

Its strict output schema is created **after the field registry exists**. Every expected `coverage_N` and `treatment_N` evidence ID is a required top-level response property. Each property's value is an enum constrained to the field IDs that actually exist in the finalized content.

This means:

- completeness is structural: an obligation cannot be silently omitted because its key is required by the schema;
- target existence is structural: an obligation cannot point to a nonexistent generated field because values come from a closed enum;
- the provider does not copy learner text;
- the provider does not insert machine markers into prose;
- the provider does not predict array indexes before array lengths are known; and
- multiple compatible obligations may bind to one existing field only when that field genuinely proves each obligation.

The resolver derives retained evidence text from the selected field, applies the same atomic and treatment-placement rules as before, and retains only learner-facing content.

There is no fuzzy matching, nearest-item fallback, evidence clamping or fixed content-array quota.

## Provider budget and provenance

The two v9 Learn calls use the same `OpenAIStructuredWorkerClient`, so both consume the same configured `$12` generation spend ledger rather than receiving independent budgets.

The runtime retains both provider calls as generation provenance. Both context IDs enter the bundle's generation-context set and the retained live-proof `generationRuns` list. This keeps cost/call telemetry truthful and ensures the later independent asset reviewer excludes **every** prior generation context rather than only the content-generation context.

Practice remains provider contract v5 and continues to use its fail-closed `mode + activityIndex + field` evidence contract.

## Regression protection

Provider-v9 regression coverage must prove that Foundation-v2 Learn:

- enumerates stable deterministic field IDs only after learner content is generated;
- makes every deterministic evidence obligation a required binding-schema property;
- constrains each binding to an actual generated field ID;
- derives retained evidence from the exact selected field;
- fails closed for missing obligations and unknown field identities in direct resolver use;
- preserves Course Truth/formula/misconception atomic placement rules;
- preserves node-level worked-example and misconception-repair placement rules;
- rejects legacy inline marker text;
- generates learner content without evidence metadata or machine syntax;
- runs the second evidence-binding call only after final content exists;
- retains both Learn provider contexts/cost records for live-proof and fresh-context assurance; and
- does not change generic/legacy provider-v4 Learn or Practice-v5 behaviour.

## Governed next step

The provider-v9 repair must pass exact-head Revision CI, receive explicit Founder merge approval for its PR, merge through the governed path and be confirmed Live before another paid Business generation is allowed.

After it is Live, trigger exactly one new Business generation from the unchanged retained Foundation. If that succeeds, inspect the retained bundle and then run deterministic plus genuinely fresh-context independent asset assurance against that exact bundle.

Do not run assurance against any failed bundle.

The qualified-human Foundation review remains pending and learner publication remains false.

## Documentation impact

No normative authority change is required. The active Course Learning Blueprint already requires exact, requirement-driven evidence and prohibits fixed-format quotas. Provider v9 is a localized implementation-contract correction within the existing ADR-0027 architecture boundary, so no new ADR is required.

Historical provider-v5, provider-v6, provider-v7 and provider-v8 fail-holds remain immutable evidence and are not reclassified by this remediation.

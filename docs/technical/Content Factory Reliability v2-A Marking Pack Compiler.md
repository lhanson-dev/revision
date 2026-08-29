# Content Factory Reliability v2-A — Marking Pack Compiler

Status: implemented on governed branch; same-head CI/qualification evidence required before merge.

Authority: `80-company-workflows/Content Factory Reliability Qualification Standard.md`.

Trigger: Pilot #18 exposed a generic Marking Pack reliability failure in which deterministic operational-rubric validation stopped at the first defect, so the one bounded repair received only that first defect and a later defect was discovered afterwards.

## Scope

V2-A changes the reusable Marking Pack worker/compiler boundary. It does not change educational product authority, qualification content authority or the Founder merge gate.

The implementation applies two Reliability v2 rules together:

1. **compiler-first ownership** — mechanically reconstructible Marking Pack structure is no longer model-authored; and
2. **complete-diagnostic validation** — one parseable candidate is inspected as a whole before any repair call, the repair receives the complete actionable defect set, and the whole repaired candidate is revalidated once before either compilation or fail-closed disposition.

## Provider boundary

For structured assessment items the provider now supplies only educational judgement and bounded references:

- subquestion target ID;
- rewarded demands;
- subquestion AO distribution;
- answer requirements;
- rubric scope ID;
- ordered educational quality descriptors;
- application / analysis / evaluation requirements;
- valid reasoning routes;
- indicative content;
- misconceptions;
- diagnostic feedback and improvement actions;
- ambiguity and confidence policy.

The structured provider schema deliberately does **not** contain:

- `subquestionGuidance[].maxMark`;
- top-level `assessmentObjectiveAllocation`;
- `rubric[].id`;
- `rubric[].minMark`;
- `rubric[].maxMark`.

Those fields are mechanically reconstructed by Revision from the validated assessment item, Question Family and provider educational meaning.

For an unstructured item, an overall AO allocation remains provider-authored only where AO distribution itself requires educational judgement; its objective set, duplicates and total are deterministically validated.

## Compiler behaviour

### Subquestion guidance

Revision links provider guidance to existing subquestions and validates the whole candidate for:

- missing, duplicate or unknown subquestion targets;
- rewarded demands not asked by the assessment item;
- AO totals that do not equal the governed subquestion mark value;
- duplicate or unavailable assessment objectives.

After validation, Revision injects each subquestion `maxMark` from the assessment item.

### Aggregate AO arithmetic

For structured items Revision derives the top-level AO allocation by summing validated subquestion allocations in the governed Question Family objective order.

The provider is not asked to duplicate this arithmetic.

### Rubric skeleton

The provider supplies ordered educational quality levels for each governed rubric scope. Revision validates exact scope coverage and then constructs:

- stable rubric IDs;
- contiguous integer mark bands;
- complete coverage from `0` through the scope `maxMark`.

Bands are allocated deterministically over the ordered educational levels. Where an outcome count does not divide evenly, lower ordered levels receive the earlier remainder outcomes. This rule is mechanical and stable; educational level meaning and ordering remain model-authored.

Calculation scopes must contain educational guidance for method/working and accuracy or consequential/follow-through treatment. Extended analysis/evaluation scopes worth at least six marks must distinguish more than one quality level.

## Complete diagnostics and bounded repair

For a structurally parseable candidate, Revision accumulates every actionable deterministic defect across:

- subquestion guidance;
- AO allocation;
- rubric scope/level guidance;
- calculation treatment;
- extended-response level distinction; and
- preservation of Question Family application, analysis and evaluation demand.

No repair is called until that complete set has been collected.

If the first candidate is valid, no repair call occurs.

If the first candidate has repair-eligible defects, exactly one targeted repair is allowed. The repair receives:

- the complete first candidate;
- the complete structured diagnostic set; and
- the same governed assessment inputs.

The repaired candidate is then fully diagnosed again. Any remaining defect fails closed. There is no serial `first defect -> repair -> next defect` loop.

Structurally unparseable provider output remains an explicit early stop at the structured provider-client boundary, consistent with the Reliability v2 exception for cases where later semantic validation is unsafe or meaningless.

## Spend ceiling

V2-A introduces a direct Marking Pack provider contract above the legacy worker stack so that the model is not asked for compiler-owned fields. The implementation therefore shares one conservative fetch-level spend reservation across both the existing worker stack and the V2-A Marking Pack client.

This prevents the new compiler layer from accidentally creating a second independent `maxSpendUsd` allowance. Concurrent calls reserve spend before dispatch so they cannot each consume the same remaining allowance.

## Durable reuse and invalidation

The effective Marking Pack durable worker version advances from `output-integrity-v1` to `output-integrity-v2`.

This invalidates legacy Marking Packs and genuine downstream dependants while preserving unrelated validated upstream work such as Course Knowledge Model, Learn, Practice and assessment-item generation where their own dependency fingerprints remain unchanged.

## Assurance added in V2-A

`src/content-factory/openai-marking-pack-v2-compiler.test.ts` proves at minimum:

- compiler-owned structured fields are absent from the provider schema;
- multiple simultaneous Pilot-18-style defects are returned in one diagnostic pass;
- rubric IDs, numeric bands, subquestion max marks and aggregate AO arithmetic are compiled deterministically;
- the one repair prompt contains the complete first-pass defect set;
- a valid repaired candidate succeeds after whole-artifact revalidation; and
- remaining defects after the one repair fail closed.

The same-head CI run remains required before this work can be considered merge-ready.

## Ownership register and legacy Q1 evidence

`content-factory/reliability-v2-a-marking-pack-ownership.json` records the current V2-A ownership split.

`content-factory/reliability-contract-inventory.json` predates Reliability v2 for this boundary. Its earlier `fail_closed` classification for provider-authored rubric ranges is retained as historical qualification evidence; it must not be treated as current V2 Q1 evidence for the Marking Pack boundary after V2-A.

This PR does not claim V2 Q1 PASS. The later Q1 same-head consolidation must absorb the V2-A ownership register together with the other worker boundaries.

## Documentation impact check

- **Normative authority:** no change required. V2-A implements the already-approved Reliability v2 standard.
- **Technical documentation:** this document records the new provider/compiler boundary, diagnostics, repair, spend and invalidation behaviour.
- **Machine-readable governance evidence:** the V2-A Marking Pack ownership register records current ownership and explicitly disposes the legacy Q1 classification for this boundary.
- **Historical evidence:** Pilot #18 and earlier qualification evidence remain unchanged.
- **ADR:** not required because this change implements an existing approved architectural/governance rule rather than introducing a new competing decision.

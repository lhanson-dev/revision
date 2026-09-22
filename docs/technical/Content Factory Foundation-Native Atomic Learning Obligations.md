# Content Factory Foundation-Native Atomic Learning Obligations

**Status:** Current implementation contract after ADR-0027; Learn provider contract v8 / Practice provider contract v5  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Course Learning Blueprint Amendment.md`; `docs/technical/Content Factory Foundation-Native Internal Learning Assets.md`; ADR-0027

## Purpose

Define the deterministic atomic-obligation safeguard used by `course-learning-blueprint-v2` between exact Course Truth and Foundation-native Learn/Practice generation.

The safeguard exists because node-level treatment/capability evidence is necessary but not sufficient. A Course Truth node can contain several distinct formulas, misconceptions, application contexts or evidence demands. One generated worked example, correction or application activity must not silently satisfy all of those structured facts.

## Deterministic derivation

For every exact Course Knowledge Model node in a v2 work unit, `deriveFoundationCourseLearningAtomicTeachingPoints` creates node-bound generation obligations for:

- the node summary;
- every explicit formula or quantitative procedure;
- every explicit misconception;
- every governed application context; and
- every structured evidence demand.

The derived label retains the exact node ID. This means identical-looking facts on two different nodes remain separate obligations.

These labels are assurance metadata derived mechanically from Foundation truth. They do not add curriculum truth and do not need to appear verbatim in learner-facing prose.

Legacy-v1 planning is unchanged. Atomic expansion applies only when the work unit is planned through `course-learning-blueprint-v2`.

## Provider evidence placement

The provider evidence resolver remains the exact-location boundary. When a teaching-point label is an atomic v2 obligation, the resolver applies deterministic placement rules before accepting the generated evidence.

### Learn

- Course Truth summary obligations must resolve to the explanation body (`section_explanation` or `section_key_point`).
- Formula/procedure obligations must resolve inside a worked example.
- Misconception obligations must resolve to an explicit misconception correction.
- Other atomic facts still require exact coverage evidence through the normal teaching-point contract.

Learn provider contract v8 expresses evidence ownership as typed metadata on the generated learner-content field itself. The provider does not return a separate Learn evidence-reference array, duplicate generated evidence text or place machine markers inside learner prose.

Before generation the system derives one `coverage_N` evidence ID for every required teaching point and one `treatment_N` evidence ID for every required `nodeId + Learn treatment` pair. Every evidence-bearing field object contains:

- `text` — learner-facing prose; and
- `evidenceIds` — zero or more schema-constrained deterministic obligation IDs owned by that exact field.

The resolver records the field/area that owns each ID, requires every expected ID exactly once, validates atomic/treatment placement and retains only the learner-facing text. Missing, duplicated or unknown IDs fail closed. Legacy inline marker text also fails closed. There is no fuzzy, nearest-item, copied-text or positional fallback.

### Practice

Every atomic obligation must resolve to an **active learner task field**: `prompt` or `expectedResponse`. Passive `explanation` or `improvementAction` evidence cannot satisfy the obligation.

Additional mode ownership applies where the structured fact itself determines the activity form:

- formula/quantitative procedure → `quantitative`;
- governed application context → `application`;
- misconception diagnosis → `retrieval`;
- quantitative/calculation evidence demand → `quantitative`;
- construction/procedure evidence demand → `short_answer`;
- graph/data/framework/context/evaluation/synoptic evidence demand → `application`;
- comparison/analysis/causal/process/exam-response evidence demand → `short_answer`.

Evidence demands that do not mechanically imply one of those modes retain the active-task requirement without inventing a mode from free-form prose.

Practice remains on provider contract v5. Its evidence location is `mode + activityIndex + field`; `activityIndex` is 1-based and must reference an activity that exists in the named `activitiesByMode` bucket.

## Provider instruction / validator alignment

Provider instructions must state the same deterministic evidence-placement rules that the post-generation resolver enforces.

The instructions therefore derive atomic evidence guidance from `foundation-course-learning-atomic-obligations.ts`, the same implementation boundary that performs fail-closed validation. In particular:

- Learn v8 tells the provider that Course Truth summaries belong in section explanation/key-point fields, formulas/procedures in worked-example fields, and misconceptions in explicit misconception corrections;
- Learn v8 supplies deterministic coverage/treatment evidence IDs and requires each ID exactly once in the `evidenceIds` metadata of the actual learner-content field that proves the obligation;
- Learn v8 keeps those IDs out of learner-facing text and removes evidence metadata before retained learner output is formed;
- Practice v5 explicitly tells the provider that atomic evidence must use an active `prompt` or `expectedResponse`, never passive `explanation` or `improvementAction` fields;
- Practice v5 tells the provider the deterministic formula, context and misconception mode ownership; and
- deterministic evidence-demand mode assignments for the exact work unit are included in the generation instruction.

Generic provider guidance cannot broaden these atomic rules. This prevents structurally valid output from being accepted when the actual generated field does not satisfy the deterministic obligation.

The Learn v8 typed-field contract deliberately avoids all three earlier self-reference/annotation failure forms:

- provider-v5 model-guessed indexes into variable-length `sections`, `keyPoints`, `workedExamples` and `steps`;
- provider-v6 duplicated copies of generated learner text in a separate evidence field; and
- provider-v7 free-text machine markers whose completeness could not be required by the structured output schema.

It does not clamp invalid evidence, redirect it to another field or impose fixed content-array sizes. Those approaches would either weaken evidence integrity or conflict with the Course Learning Blueprint requirement that learning treatment be requirement-driven rather than quota-driven.

Practice evidence indexing remains a generic provider-evidence concern. The shared `provider-coverage-evidence.ts` boundary continues to own the corresponding provider guidance and fail-closed resolution.

## Relationship to Learn v8 and Practice v5 provider contracts

Atomic obligations operate alongside the node-level proof:

1. the planner derives node classifications, Learn treatments and Practice capabilities;
2. it expands exact structured Course Truth facts into node-bound atomic required teaching points;
3. Learn provider contract v8 assigns deterministic coverage and treatment evidence IDs before generation;
4. the provider assigns each Learn evidence ID to the `evidenceIds` metadata of the exact generated field implementing that obligation;
5. the resolver derives the actual field/area from typed ownership, validates atomic/treatment placement and discards evidence metadata before retention;
6. Practice provider contract v5 requires exact coverage evidence for every required teaching point plus exact `(nodeId, Practice capability)` evidence using existing activity locations;
7. the evidence resolvers reject missing, duplicated, passive or incompatible evidence; and
8. fresh-context independent review still judges whether the resulting content is educationally and factually sufficient.

The intended proof chain is:

`structured Course Truth fact → exact node → required treatment/capability → exact generated-content evidence`.

No deterministic check substitutes for semantic independent review.

## Regression protection

The implementation includes regression coverage proving that:

- two nodes with identical-looking structured facts produce separate node-bound obligations;
- a non-Business science node produces the same qualification-neutral derivation behaviour;
- formula and misconception Learn evidence fails closed when placed outside the required educational structure;
- Learn v8 derives evidence from the actual generated field that owns the typed evidence ID and retains only learner text;
- Learn v8 requires typed `evidenceIds` metadata in the provider schema and constrains values to supplied IDs;
- Learn v8 fails closed for missing, duplicated or unknown evidence IDs;
- Learn v8 rejects legacy inline marker text;
- Learn v8 preserves node-level treatment placement such as worked-example and misconception-repair ownership;
- application, misconception and quantitative Practice evidence fails closed when passive or placed in the wrong mode;
- Learn v8 instructions expose typed evidence-ID mappings and no longer request markers, copied text or array indexes;
- Practice v5 instructions expose the active-field rule plus deterministic atomic mode ownership;
- Practice v5 instructions explicitly state the resolver's 1-based activity indexing and existing-mode-bucket reference rule; and
- correctly placed evidence is accepted.

The non-Business fixture is an implementation regression only. It does not satisfy the wider governed multi-subject portability proof required before general qualification.

## Historical and assurance boundary

The retained Business generation run `35468029336` and fail-hold assurance run `35504427790` remain immutable legacy evidence. They are not reinterpreted under the atomic v2 contract.

### First v2/v5 Business generation attempt — provider-guidance fail-hold

After PR #354 became Live, a new Business generation was triggered from the unchanged retained Foundation fingerprint `1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`.

Run `35529282623` executed on merged-main commit `cbb36d46b3291e57c766834299e4a526c46b9e42`. Exact source and AI-assured Foundation validation succeeded before generation. The first Learn work unit, `foundation-course-wide-business-context`, then failed closed because provider contract v5 returned the course-wide atomic Course Truth summary at a location that did not satisfy the deterministic Learn evidence-placement rule.

The retained failure artifact is:

- artifact ID `10610951512`;
- digest `sha256:d46fb219c8c17486a80b3407cf2397115ab3fe76264f15b51678d723fe42f00a2`;
- generation implementation commit `cbb36d46b3291e57c766834299e4a526c46b9e42`;
- provider contract version `5`;
- one provider generation call;
- reported response cost `$0.034234`;
- learner asset count `0`; and
- overall status `fail_hold`.

This was not a Foundation truth failure. The provider-v5 instruction required exact `coverageEvidence` but did not state the stricter atomic evidence-placement rules later enforced by the resolver. The Practice instruction also generically permitted `explanation` / `improvementAction` evidence even though atomic Practice validation correctly rejects those passive fields.

The failed run is immutable proof evidence and must not be reclassified or overwritten. PR #355 aligned provider guidance to the existing deterministic validator; it did not relax the atomic rules or alter the Foundation.

### Second v2/v5 Business generation attempt — Practice evidence locator fail-hold

After PR #355 became Live, run `35532542046` generated a new Business bundle from the same unchanged retained Foundation on merged-main commit `f502c6f71ccb330d51d9f78b326a11017ab3fe70`.

All retained source-proof and AI-assured Foundation identity/fingerprint checks passed. The earlier first-unit atomic Learn failure was no longer present: four complete Learn/Practice work units succeeded and the fifth Learn work unit also succeeded. The fifth Practice call, for `foundation-external-business-environment`, then failed closed because provider contract v5 returned coverage evidence pointing to `short_answer` activity `2` when that mode bucket did not contain a second activity.

Retained failure evidence:

- artifact ID `10611472637`;
- digest `sha256:a02195b5d523d1e77902f3b0ddbb1074c329b51fae8fe76d79d37f66917d6ff0`;
- generation implementation commit `f502c6f71ccb330d51d9f78b326a11017ab3fe70`;
- provider contract version `5`;
- provider/model `openai / gpt-5.6-terra`;
- 10 provider calls, with the first 9 successful and no provider retries;
- reported final-response usage cost `$0.359092`;
- learner asset count `0`;
- overall status `fail_hold`;
- Foundation human review still pending; and
- learner publication false.

The exact failure was `provider_contract_failure: Coverage evidence location references missing short_answer activity 2`.

This is not a Foundation truth defect and does not justify weakening the resolver. The Practice provider instructions omitted the generic locator rule already enforced by `provider-coverage-evidence.ts`: evidence indexes are 1-based and must reference an activity that exists in the selected mode bucket. The remediation exposed that existing rule to the provider from the shared resolver boundary and added regression coverage for the live failure. The retained run remains immutable fail-hold evidence.

### Later provider-v5 Learn numeric-locator fail-holds

The later v2/v5 Business proofs established that prompt guidance alone could not make Learn's self-referential numeric evidence pointers reliable. Run `35582938563` failed closed when Learn evidence cited section 2 key point 5 that did not exist. PR #358 then made the numeric indexing constraints explicit without weakening validation.

After #358 became Live, run `35633958590` reproduced the same defect class on `foundation-marketing-objectives`: Learn evidence cited section 2 key point 4 that did not exist. The retained proof had 19 provider calls, 18 successes, 9 complete Learn/Practice work units, zero retries and reported final-response usage cost `$0.674106`. Its retained artifact is `10655638851` with digest `sha256:15a115db50ce62cbf22a7e18a8adfd61befbaff0a040cde2548bd72ab370b08c`.

That repeated live failure established that numeric Learn references were structurally unreliable rather than merely under-instructed. PR #359 moved Foundation-v2 Learn to provider v6 exact-text binding.

Historical provider-v5 failure evidence remains historically true and must not be rewritten under later contracts.

### Provider-v6 copied-text fail-hold

After PR #359 became fully Live, run `35726339624` used Learn provider contract v6 against the unchanged Foundation on merged-main commit `6811e11555437a77960f90f500f69b1dc5d31563`.

The first Learn call for `foundation-course-wide-business-context` failed closed with:

`provider_contract_failure: Coverage evidence text does not exactly match generated section_explanation`

Retained evidence:

- artifact ID `10693164409`;
- digest `sha256:8818ebd9f31d53f05af6576266b50d8b96a4e8fcb83590003586936230f968c9`;
- one provider call;
- zero retries;
- reported final-response usage cost `$0.043836`;
- learner asset count `0`;
- Foundation human review pending; and
- learner publication false.

This proved that v6 retained another self-reference: the provider had to generate learner text and separately reproduce that exact text in the evidence structure. The resolver correctly rejected the mismatch.

Historical v6 failure evidence remains immutable.

### Provider-v7 inline-marker fail-hold and provider-v8 remediation

PR #362 moved Foundation-v2 Learn to provider v7 inline evidence markers. After that change became fully Live, run `35747978726` executed on merged-main commit `fc5c894254820a806d3779e3846737930cac42e0` against the unchanged Foundation.

The first Learn call for `foundation-course-wide-business-context` failed closed with:

`provider_contract_failure: Missing Learn evidence marker [[REV-C2]]`

Retained evidence:

- artifact ID `10703917081`;
- digest `sha256:938ac10f0d49c518115e95cc8aa541a8ee2f05beb83417c99c48b544a17ca90b`;
- one provider call;
- zero retries;
- reported final-response usage cost `$0.027354`;
- learner asset count `0`;
- Foundation human review pending; and
- learner publication false.

The resolver correctly failed closed. The defect was that the JSON schema could not structurally require every free-text marker to appear inside generated prose. Provider v8 therefore moves evidence ownership into typed `evidenceIds` metadata on each generated learner-content field. Full evidence and remediation rationale are retained in `docs/technical/Content Factory Foundation Learn Evidence Binding Remediation.md`.

Historical v7 failure evidence remains immutable.

## Governed next proof path

1. Merge the Learn v8 typed-evidence repair only after exact-head assurance and explicit Founder approval.
2. Confirm the merged change through the governed path-to-live evidence.
3. Generate exactly one **new** Business Learn/Practice bundle with new contexts from the unchanged retained Foundation under `course-learning-blueprint-v2`, Learn provider v8 and Practice provider v5.
4. Run deterministic and genuinely fresh-context independent assurance against that exact new bundle only if generation succeeds.
5. Remediate any remaining asset-local findings at the smallest safe scope.
6. If the new contract exposes missing or incorrect Course Truth, reopen the Foundation Candidate/version rather than inventing truth downstream.
7. Proceed to internal preview only after the exact new bundle passes the applicable asset-assurance gate.

The historical 16 findings from asset-assurance proof #2 are not considered resolved until a regenerated bundle passes the governed assurance sequence. The separate qualified-human Foundation approval requirement remains unchanged.

No normative product/workflow authority is changed by this evidence-binding repair. It stays within the existing Content Factory architecture and ADR-0027 decision boundary, so no new ADR is required.

## Release boundary

This safeguard changes generation acceptance only. It does not approve the Foundation, assure learner assets or make content publication eligible. Existing qualified-human Foundation approval and derived-asset release gates remain unchanged.

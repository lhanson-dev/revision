# Content Factory Foundation-Native Atomic Learning Obligations

**Status:** Current implementation contract after ADR-0027; Learn provider contract v9 / Practice provider contract v5  
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

The derived label retains the exact node ID. Identical-looking facts on different nodes therefore remain separate obligations.

These labels are assurance metadata derived mechanically from Foundation truth. They do not add curriculum truth and do not need to appear verbatim in learner-facing prose.

Legacy-v1 planning is unchanged. Atomic expansion applies only to `course-learning-blueprint-v2`.

## Provider evidence placement

The evidence resolver remains the exact-location boundary. Atomic v2 obligations are accepted only when their generated evidence appears in a deterministically valid educational location.

### Learn

- Course Truth summaries must resolve to `section_explanation` or `section_key_point`.
- Formula/procedure obligations must resolve inside a worked example.
- Misconception obligations must resolve to an explicit misconception correction.
- Other atomic facts require exact generated-content evidence through the normal teaching-point contract.

Foundation-v2 Learn now uses provider contract v9. It separates content generation from evidence binding so the provider no longer has to create content and simultaneously make globally complete self-references into that content.

#### Stage 1 — learner content

The provider generates final learner-facing content under the deterministic Blueprint requirements. The response contains ordinary learner text only; it does not contain evidence IDs, field IDs, copied evidence text, machine markers or numeric evidence pointers.

#### Deterministic field registry

Revision then enumerates the finalized content into exact fields with deterministic IDs. Examples include:

- `introduction`;
- `section_1_explanation`;
- `section_1_key_point_1`;
- `worked_example_1_setup`;
- `worked_example_1_step_1`;
- `worked_example_1_conclusion`;
- `misconception_1_correction`; and
- `next_action`.

Every registry entry retains the field's deterministic evidence area and exact generated text.

#### Stage 2 — evidence binding

The second provider call receives the closed generated-field registry. Its strict JSON schema has one required top-level property for every deterministic obligation:

- `coverage_N` for required teaching points; and
- `treatment_N` for exact `nodeId + Learn treatment` obligations.

Every property value is constrained to the enum of field IDs that actually exist in the finalized content.

The resolver therefore receives a structurally complete obligation map and derives the evidence from the selected generated field. It then applies the same atomic and node-level placement rules before retention.

This contract has no fuzzy matching, nearest-item fallback, evidence clamping or fixed content-array quota.

### Practice

Every atomic obligation must resolve to an **active learner task field**: `prompt` or `expectedResponse`. Passive `explanation` or `improvementAction` evidence cannot satisfy the obligation.

Additional mode ownership applies where the structured fact determines the valid activity form:

- formula/quantitative procedure → `quantitative`;
- governed application context → `application`;
- misconception diagnosis → `retrieval`;
- quantitative/calculation evidence demand → `quantitative`;
- construction/procedure evidence demand → `short_answer`;
- graph/data/framework/context/evaluation/synoptic evidence demand → `application`;
- comparison/analysis/causal/process/exam-response evidence demand → `short_answer`.

Evidence demands that do not mechanically imply one of those modes retain the active-task requirement without inventing a mode from free-form prose.

Practice remains provider contract v5. Its evidence location is `mode + activityIndex + field`; `activityIndex` is 1-based and must reference an activity that exists in the named `activitiesByMode` bucket.

## Provider instruction / validator alignment

Provider instructions must state the same deterministic placement rules that post-generation validation enforces.

For Learn v9:

- stage 1 tells the provider to place Course Truth summaries in section explanation/key-point fields, formulas/procedures in worked-example fields and misconception repair in explicit correction fields;
- stage 1 explicitly prohibits evidence IDs, field IDs, copied evidence structures, marker syntax and numeric evidence pointers in learner-facing prose;
- stage 2 receives the deterministic coverage/treatment obligation mapping plus the exact generated-field registry;
- stage 2 is instructed to bind each mandatory obligation to the existing field whose content genuinely proves it; and
- the resolver independently validates the selected field area against the deterministic atomic/treatment rules.

For Practice v5:

- atomic evidence must use active `prompt` or `expectedResponse` fields;
- deterministic formula, context and misconception mode ownership is explicit; and
- evidence-demand mode assignments for the exact work unit are included in the generation instruction.

Generic guidance cannot broaden these stricter atomic rules.

## Relationship to the earlier Learn contracts

The v9 two-stage binding removes four failure classes demonstrated by retained paid Business proofs:

1. **v5 numeric pointers** — the model guessed indexes into variable-length generated arrays;
2. **v6 copied text** — the model separately duplicated generated learner text into evidence metadata;
3. **v7 inline markers** — the schema could not require every free-text marker inside learner prose; and
4. **v8 typed field ownership** — each field's IDs were valid, but the dynamic field schema could not structurally require global appearance of every expected obligation ID.

In v9, the learner structure exists before evidence field IDs are created, every obligation is a required top-level binding property, and every target is drawn from a closed enum of actual generated fields.

The detailed retained run IDs, artifacts, costs and failure messages are preserved in `docs/technical/Content Factory Foundation Learn Evidence Binding Remediation.md`. Historical failures are not rewritten or reclassified.

## Relationship to Learn v9 and Practice v5 provider contracts

The complete proof chain is:

1. the planner derives node classifications, Learn treatments and Practice capabilities;
2. it expands exact structured Course Truth facts into node-bound atomic required teaching points;
3. Learn v9 generates the final learner content;
4. Revision enumerates the actual generated Learn fields;
5. Learn v9 evidence binding requires one schema property per coverage/treatment obligation and binds it to an existing field ID;
6. the resolver derives exact evidence and validates atomic/treatment placement;
7. Practice v5 requires exact coverage evidence for every required teaching point plus exact `(nodeId, Practice capability)` evidence using active activity locations;
8. deterministic resolvers reject missing, passive or incompatible evidence; and
9. genuinely fresh-context independent review judges whether the resulting content is educationally and factually sufficient.

The intended chain remains:

`structured Course Truth fact → exact node → required treatment/capability → exact generated-content evidence`.

No deterministic check substitutes for semantic independent review.

## Provider provenance and spend

Both Learn v9 provider stages run through the same Foundation learning provider client, so they share the same configured hard generation spend ledger.

Both provider calls retain distinct run/context provenance. The aggregate learner bundle records every generation context, and the live proof records each call independently for call/cost telemetry. Downstream independent assurance must exclude all of those generation contexts.

Practice v5 uses the same Foundation-specific client family and remains inside the same hard generation spend boundary.

## Regression protection

The implementation must prove that:

- two nodes with identical-looking structured facts remain separate node-bound obligations;
- a non-Business science node receives the same qualification-neutral deterministic treatment;
- formula and misconception Learn evidence fails closed outside the required educational structure;
- Learn v9 enumerates stable fields only after final content exists;
- the v9 binding schema requires every supplied coverage/treatment obligation as a top-level property;
- each v9 binding value is constrained to an actual generated field ID;
- the resolver derives evidence from the selected field and rejects unknown fields or missing obligations;
- worked-example and misconception-repair treatment placement remains fail-closed;
- legacy inline marker text is rejected;
- stage-1 Learn output contains no evidence metadata or machine annotation syntax;
- both Learn provider contexts are retained for proof and fresh-context exclusion;
- application, misconception and quantitative Practice evidence fails closed when passive or in the wrong mode;
- Practice v5 locator guidance remains 1-based and existing-bucket only; and
- correctly placed evidence is accepted.

The non-Business fixture is an implementation regression only. It does not satisfy the governed multi-subject portability proof.

## Historical and assurance boundary

The retained legacy Business generation run `35468029336` and fail-hold asset-assurance run `35504427790` remain immutable evidence.

Provider-v5 through provider-v8 Learn fail-holds likewise remain immutable. Most recently, provider-v8 run `35752632982` progressed through 36 successful provider calls before Learn work unit `foundation-inventory-and-supply-chains` failed closed because `treatment_5` was absent. The retained artifact is `10708295095`, digest `sha256:b05a337a5fbf32ea3b42d7c8296dcffb23bfbfbcfa3f2372d8b2dd9e8ff42c88`, with zero learner assets released.

This is implementation evidence of a global completeness gap in v8, not a Foundation truth defect. Full history is retained in `Content Factory Foundation Learn Evidence Binding Remediation.md`.

## Governed next proof path

1. Pass exact-head Revision CI for provider v9.
2. Obtain explicit Founder approval for the exact PR and merge through the governed path.
3. Confirm the merged change is Live.
4. Trigger exactly one new Business Learn/Practice generation from the unchanged retained Foundation using Learn v9 / Practice v5.
5. Run deterministic and genuinely fresh-context independent asset assurance only if generation succeeds.
6. Remediate any remaining asset-local finding at smallest safe scope.
7. If generation or assurance exposes missing/incorrect Course Truth, reopen the Foundation Candidate/version instead of inventing truth downstream.

The qualified-human Foundation approval requirement remains unchanged and learner publication remains blocked.

## Documentation impact

No normative product or workflow authority changes. Provider v9 remains a localized exact-evidence implementation correction inside the existing Course Learning Blueprint and ADR-0027 architecture boundary, so no new ADR is required.

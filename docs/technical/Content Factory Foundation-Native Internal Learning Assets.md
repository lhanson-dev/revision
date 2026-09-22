# Content Factory Foundation-Native Internal Learning Assets

**Status:** Current pre-production implementation contract after ADR-0025, ADR-0026 and ADR-0027  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Course Learning Blueprint Amendment.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`

## Purpose

Define the Foundation-native Learn/Practice production and assurance boundary after a Foundation reaches the explicitly permitted pre-production state.

This runtime is pre-production only. It creates Revision-owned Learn and Practice material from an exact Foundation, retains deterministic planning and provider provenance, independently challenges generated content in fresh contexts and keeps learner publication blocked until all existing release gates are satisfied.

Detailed Learn evidence-binding remediation history is retained in `Content Factory Foundation Learn Evidence Binding Remediation.md`. Atomic obligation rules are retained in `Content Factory Foundation-Native Atomic Learning Obligations.md`.

## Inputs and Foundation binding

Production requires:

- an eligible Foundation job;
- the exact Foundation Coverage Model identified by the Candidate;
- the exact Course Knowledge Model identified by the Candidate;
- structured Learn and Practice workers; and
- a production timestamp/asset identity.

The runtime fails closed when supplied artifacts do not match the exact Candidate/job fingerprints. Awarding-body source prose is not supplied to downstream generation workers.

An AI-assured Foundation may be used only for the explicitly governed internal derivation/testing path. Qualified-human `foundation_approved` status remains mandatory before learner publication.

## Versioned learning planning

`planFoundationInternalLearningWorkUnits` remains deterministic and groups governed Foundation requirements by `revisionArea` while retaining exact requirement IDs, knowledge-node IDs, source references and teaching points.

### `legacy-v1`

The historical planner selects explanation/retrieval by default, plus quantitative/worked-example and application modes where the retained legacy rules require them. It remains available only for exact historical replay. Existing legacy bundles are not reinterpreted under newer planning rules.

### `course-learning-blueprint-v2`

New Foundation-native generation explicitly writes `planningContractVersion: course-learning-blueprint-v2`.

For every exact source node the planner retains:

- node ID;
- deterministic educational classifications;
- required Learn treatments; and
- required Practice capabilities.

The work unit also retains the exact aggregate unions. The schema fails closed if node IDs do not match `sourceNodeIds`, duplicate node-design records exist, or aggregate classifications/treatments/capabilities differ from the node-level union.

Planning derives from governed structured Course Knowledge Model facts, including node kind, formulas, misconceptions, application contexts, depth and evidence types. The planner is qualification-neutral and does not hard-code Business topics or requirement IDs.

## Atomic Course Truth obligations

For v2 work units, the planner additionally derives node-bound teaching obligations for:

- each node summary;
- every explicit formula/quantitative procedure;
- every explicit misconception;
- every governed application context; and
- every structured evidence demand.

These labels are deterministic metadata derived from Foundation truth; they do not create new curriculum truth and are not required to appear verbatim in learner-facing prose.

The exact placement rules are defined in `Content Factory Foundation-Native Atomic Learning Obligations.md` and remain fail-closed.

## Foundation-v2 provider contracts

New Foundation-v2 work units route:

- **Learn through provider contract v9**; and
- **Practice through provider contract v5**.

Generic/legacy work units without v2 `learningDesign` continue through the generic provider-v4 route.

### Learn v9 — generate, then bind

Learn v9 uses two bounded provider stages under the same Foundation learning client and the same hard spend ledger.

#### Stage 1 — generate final learner content

The first provider call generates the full learner-facing Learn object from the exact work unit, required teaching points, structured Course Truth facts and deterministic Learn treatments.

The output contains learner content only. It does not contain:

- evidence IDs;
- field IDs;
- copied evidence text;
- machine markers; or
- numeric evidence pointers.

The generation instruction still states the deterministic educational placement requirements: Course Truth summaries in the explanation body, formulas/procedures in worked examples, misconception repair in correction fields, and all required teaching points taught in the final content.

#### Deterministic field registry

After content generation succeeds, Revision enumerates the finalized fields and assigns deterministic machine IDs such as:

- `introduction`;
- `section_1_explanation`;
- `section_1_key_point_1`;
- `worked_example_1_setup`;
- `worked_example_1_step_1`;
- `worked_example_1_conclusion`;
- `misconception_1_correction`; and
- `next_action`.

Every registry entry retains the exact generated text and its governed Learn evidence area.

#### Stage 2 — bind every deterministic obligation

The second provider call receives the final field registry and deterministic evidence obligations. Its strict output schema contains one **required top-level property for every evidence obligation**:

- `coverage_N` for each required teaching point; and
- `treatment_N` for each exact `nodeId + Learn treatment` pair.

Every property value is an enum of field IDs that actually exist in the final generated content.

The resolver then:

1. checks that the binding set exactly matches the deterministic obligation set;
2. resolves each field ID to an actual generated field;
3. derives exact evidence text from that field;
4. applies the existing atomic and treatment-placement rules; and
5. creates the retained learner output without any binding metadata.

This design eliminates the previous self-reference classes demonstrated by live proofs: pre-guessed array indexes (v5), copied generated text (v6), free-text markers (v7), and globally incomplete typed IDs distributed across dynamic fields (v8).

No fuzzy matching, nearest-item fallback, evidence clamping or fixed content-array quota is used.

### Practice v5

Practice v5 remains unchanged. It requires:

- every governed teaching point exactly once in `coverageEvidence`;
- every exact `(nodeId, Practice capability)` obligation exactly once in `capabilityEvidence`;
- every capability entry to resolve to an exact generated activity field; and
- each capability to be evidenced through the deterministic Practice mode capable of exercising it.

Atomic Practice obligations must resolve to active `prompt` or `expectedResponse` fields. Formula/procedure, application-context, misconception and classifiable evidence-demand obligations retain the deterministic mode rules defined in the atomic-learning implementation contract.

## Provider spend boundary

The generic/base provider stack and Foundation-v2 learning stack remain separate provider-client families. A factory instance must not silently split one configured spend ceiling across multiple independent Foundation clients.

Both Learn v9 stages and Practice v5 use the Foundation-specific provider client and therefore share the same configured hard generation spend ledger. The current live workflow ceiling remains `$12`.

## Generation and retained evidence

`generateFoundationInternalLearningAssets` uses Course Learning Blueprint v2 planning for new bundles.

Successful generation produces one pending Learn derived asset and one pending Practice derived asset bound to the exact Foundation fingerprint and Candidate. Generation does not imply asset assurance.

A retained bundle includes:

- exact Foundation fingerprint and Candidate ID;
- exact Coverage Model and Course Knowledge Model fingerprints;
- course identity;
- planning-contract version;
- deterministic work-unit plans and v2 learning design;
- generated Learn and Practice content;
- **every provider generation context used to create that content**; and
- pending Learn/Practice derived-asset records.

For Learn v9, both the content-generation context and evidence-binding context are retained. Practice v5 contributes its own generation context.

## Live-proof telemetry

The governed Internal Learning Proof records each underlying provider call rather than treating v9 Learn as one opaque call.

For each provider call it retains:

- stage (`learn` or `practice`);
- work-unit ID;
- provider run ID;
- provider context ID;
- contract version;
- status/error;
- provider/model;
- retry count; and
- reported final-response usage cost where supplied.

This means the v9 proof records two Learn calls and one Practice call per successfully completed work unit.

The same context set is retained in the generated bundle. Downstream assurance checks the retained generation-run context set against the bundle context set before fresh independent review.

## Foundation-native asset assurance

`runFoundationInternalLearningDeterministicAssurance` and `assureFoundationInternalLearningAssets` remain the Foundation-native assurance boundary.

Before independent review, deterministic assurance verifies:

- eligible Foundation state;
- exact Foundation/Candidate/artifact identity;
- retained work-unit plans against the declared planner contract;
- generated Learn/Practice mode and teaching-point contracts;
- generation-context uniqueness and separation from earlier Foundation/assurance contexts; and
- pending aggregate asset state.

Each work unit is then challenged in a genuinely fresh independent context. Review covers factual distortion, omitted conditions, misleading certainty, curriculum drift, pedagogy, misconceptions, expected-response correctness and quantitative consistency.

Provider evidence binding is not semantic assurance. A structurally valid v9 binding only proves that every deterministic obligation points to an existing generated field in an allowed location. The independent reviewer still decides whether that field genuinely teaches the obligation adequately and accurately.

## Retained proof history

Historical evidence is not rewritten.

Important retained checkpoints include:

- successful legacy Business generation run `35468029336`, which produced 49 Learn + 49 Practice outputs under the historical planner;
- fresh-context legacy asset assurance run `35504427790`, which correctly fail-held with 16 findings across 15 remediation targets and led to planner-v2/ADR-0027;
- provider-v5 through provider-v8 Learn evidence-binding fail-holds, all of which retained zero learner assets and kept learner publication false.

The most recent paid proof before provider v9 is run `35752632982` on implementation commit `c5d288347a50c176394efd5e7a124655dc4c83df`. It completed 36 of 37 provider calls successfully, including 18 complete Learn/Practice work units, before Learn work unit `foundation-inventory-and-supply-chains` failed closed because evidence ID `treatment_5` was omitted globally.

Retained v8 artifact:

- ID `10708295095`;
- digest `sha256:b05a337a5fbf32ea3b42d7c8296dcffb23bfbfbcfa3f2372d8b2dd9e8ff42c88`;
- reported final-response usage cost `$1.245618`;
- zero retries;
- learner asset count `0`;
- Foundation human review pending; and
- learner publication false.

Exact v5-v8 evidence, earlier proof IDs and remediation rationale are retained in `Content Factory Foundation Learn Evidence Binding Remediation.md` and the repository's historical commits. They are not reclassified under v9.

## Governed next sequence

The current provider-v9 change must:

1. pass exact-head Revision CI;
2. receive explicit Founder approval for the exact PR;
3. merge through the governed path and become confirmed Live;
4. trigger exactly one new Business generation from the unchanged retained Foundation;
5. run deterministic and genuinely fresh-context independent asset assurance only if that generation succeeds;
6. remediate any remaining asset-local findings at smallest safe scope; and
7. reopen the Foundation Candidate/version if the new evidence exposes missing or incorrect Course Truth rather than inventing truth downstream.

Do not run asset assurance against a failed generation bundle.

## Release safety

Pre-production generated content is not learner publication.

`assertFoundationDerivedAssetReleaseEligible` continues to require:

1. derived-asset assurance PASS;
2. qualified-human `foundation_approved` state; and
3. exact equality between the asset Foundation fingerprint and approved Foundation fingerprint.

The current Business Foundation remains AI-assured only; qualified-human Foundation review is pending and learner publication remains false.

## Portability limit

Business is the first reference proof, not evidence that the planner is generally qualified for every subject. A materially different qualification/subject proof remains required before Revision claims general multi-subject portability.

## Documentation impact

ADR-0025 records Foundation-native generation, ADR-0026 records Foundation-native asset assurance, and ADR-0027 records the versioned Course Learning Blueprint planner and exact provider-evidence boundary. Provider v9 is a localized implementation-contract correction inside that existing architecture. It does not change normative product/workflow authority, so no new ADR is required.

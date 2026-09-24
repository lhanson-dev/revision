# Content Factory Foundation-Native Internal Learning Assets

**Status:** Current pre-production implementation contract after ADR-0025, ADR-0026 and ADR-0027  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Course Learning Blueprint Amendment.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`

## Purpose

Define the Foundation-native Learn/Practice production and assurance boundary after a Foundation reaches the explicitly permitted pre-production state.

This runtime is pre-production only. It creates Revision-owned Learn and Practice material from an exact Foundation, retains deterministic planning and provider provenance, independently challenges generated content in fresh contexts and keeps learner publication blocked until all existing release gates are satisfied.

Detailed Learn evidence-binding remediation history is retained in `Content Factory Foundation Learn Evidence Binding Remediation.md`. Atomic obligation rules are retained in `Content Factory Foundation-Native Atomic Learning Obligations.md`. Targeted asset-local remediation and corrected-bundle re-assurance are retained in `Content Factory Foundation-Native Targeted Learning Remediation Proof.md`.

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

Both Learn v9 stages and Practice v5 use the Foundation-specific provider client and therefore share the same configured hard generation spend ledger. The current live generation/remediation/review proof ceilings remain `$12` per independently configured proof client.

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

A targeted remediation bundle preserves original generation contexts and adds every remediation provider context. Changed asset sides return to `pending`. Untargeted asset sides remain byte-for-byte equivalent at their structured object boundary.

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

Targeted remediation retains the same per-call provenance for every regenerated asset side and records all remediation context IDs in the corrected bundle so they become forbidden to later independent reviewers.

## Foundation-native asset assurance

`runFoundationInternalLearningDeterministicAssurance` and `assureFoundationInternalLearningAssets` remain the Foundation-native assurance boundary for original and corrected bundles.

Before independent review, deterministic assurance verifies:

- eligible Foundation state;
- exact Foundation/Candidate/artifact identity;
- retained work-unit plans against the declared planner contract;
- generated Learn/Practice mode and teaching-point contracts;
- generation-context uniqueness and separation from earlier Foundation/assurance contexts; and
- pending aggregate asset state.

Each work unit is then challenged in a genuinely fresh independent context. Review covers factual distortion, omitted conditions, misleading certainty, curriculum drift, pedagogy, misconceptions, expected-response correctness and quantitative consistency.

For corrected-bundle re-assurance, the adapter additionally supplies all reviewer contexts from the earlier asset assurance as forbidden contexts. Because the corrected bundle itself retains both original generation and remediation contexts, the new reviewer is separated from Foundation contexts, original generation, remediation and all prior asset-review contexts.

Provider evidence binding is not semantic assurance. A structurally valid v9 binding only proves that every deterministic obligation points to an existing generated field in an allowed location. The independent reviewer still decides whether that field genuinely teaches the obligation adequately and accurately.

## Retained proof history

Historical evidence is not rewritten.

Important retained checkpoints include:

- successful legacy Business generation run `35468029336`, which produced 49 Learn + 49 Practice outputs under the historical planner;
- fresh-context legacy asset assurance run `35504427790`, which correctly fail-held with 16 findings across 15 remediation targets and led to planner-v2/ADR-0027;
- provider-v5 through provider-v8 Learn evidence-binding fail-holds, all of which retained zero learner assets and kept learner publication false;
- successful Blueprint-v2/provider-v9 Business generation run `35789048198`, artifact `10723573827`;
- fresh independent assurance run `35836291040`, artifact `10739757463`, which deterministically passed but semantically `fail_hold` with 20 open findings across 17 remediation targets;
- successful targeted remediation run `35996162981`, artifact `10806996448`, which addressed those 20 retained findings across 15 work units / 20 asset sides using 25 fresh remediation contexts, while leaving both assets pending; and
- corrected bundle fingerprint `8452d1ef17ef56f626b2711c536083c9fce138015f90f0dde85885db15780cb9`, which is the exact input to the separate re-assurance proof.

The historical failed remediation run `35994489923` remains evidence of the pre-provider identity-check defect and is not reclassified after the runner correction.

Exact earlier provider-v5-v8 evidence and remediation rationale remain in `Content Factory Foundation Learn Evidence Binding Remediation.md` and repository history.

## Governed next sequence

The current Business Learn/Practice sequence is:

1. targeted remediation capability — implemented and merged;
2. retained targeted-remediation proof — successful on run `35996162981`;
3. separate corrected-bundle re-assurance adapter — implemented through the governed PR process;
4. after that adapter is approved, merged and confirmed Live, run exactly one retained re-assurance against corrected bundle fingerprint `8452d1ef17ef56f626b2711c536083c9fce138015f90f0dde85885db15780cb9`;
5. if deterministic or semantic re-assurance reveals blocking/material asset-local findings, remediate again at the smallest safe scope and revalidate;
6. if evidence reveals missing or incorrect Course Truth, reopen the Foundation Candidate/version instead of inventing truth downstream; and
7. regardless of asset-assurance result, keep learner publication blocked until qualified-human `foundation_approved` exists for the exact Foundation fingerprint.

Do not broaden this slice into Exam Prep or publication.

## Release safety

Pre-production generated or corrected content is not learner publication.

`assertFoundationDerivedAssetReleaseEligible` continues to require:

1. derived-asset assurance PASS;
2. qualified-human `foundation_approved` state; and
3. exact equality between the asset Foundation fingerprint and approved Foundation fingerprint.

The current Business Foundation remains AI-assured only; qualified-human Foundation review is pending and learner publication remains false.

## Portability limit

Business is the first reference proof, not evidence that the planner is generally qualified for every subject. A materially different qualification/subject proof remains required before Revision claims general multi-subject portability.

## Documentation impact

ADR-0025 records Foundation-native generation, ADR-0026 records Foundation-native asset assurance, and ADR-0027 records the versioned Course Learning Blueprint planner and exact provider-evidence boundary. Targeted remediation and corrected-bundle re-assurance implement the already-governed remediation/revalidation rule inside that architecture. They do not change normative product/workflow authority, so no new ADR is required.

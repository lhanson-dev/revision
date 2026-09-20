# Content Factory Foundation-Native Internal Learning Assets

**Status:** Current pre-production implementation contract after ADR-0025, ADR-0026 and proposed ADR-0027  
**Authority:** `10-product-governance/Course Learning Blueprint.md`; `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Course Learning Blueprint Amendment.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`

## Purpose

Define the Foundation-native Learn/Practice production and assurance boundary after a Foundation reaches the explicitly permitted pre-production state.

This runtime is pre-production only. It creates Revision-owned Learn and Practice material from an exact Foundation, retains deterministic planning provenance, independently challenges the generated content in fresh contexts and keeps learner publication blocked until all existing release gates are satisfied.

## Inputs and Foundation binding

Production requires:

- an eligible Foundation job;
- the exact Foundation Coverage Model identified by the Candidate;
- the exact Course Knowledge Model identified by the Candidate;
- structured Learn and Practice workers; and
- a production timestamp/asset identity.

The runtime fails closed when supplied artifacts do not match the exact Candidate/job fingerprints. Awarding-body source prose is not supplied to downstream generation workers.

## Versioned learning planning

`planFoundationInternalLearningWorkUnits` remains deterministic and groups governed Foundation requirements by `revisionArea` while retaining exact requirement IDs, knowledge-node IDs, source references and teaching points.

The planner now has two explicit contracts.

### `legacy-v1`

The retained historical planner selects:

- explanation + retrieval for every work unit;
- worked example + quantitative practice when formula knowledge exists; and
- application practice when application contexts exist.

This contract remains available only so retained historical bundles can be reconstructed against the exact rules that created them. Absence of `planningContractVersion` on an existing bundle is interpreted as this historical planner. Historical bundle fingerprints and proof evidence are not rewritten.

### `course-learning-blueprint-v2`

New Foundation-native generation explicitly writes `planningContractVersion: course-learning-blueprint-v2`.

Each work-unit plan retains deterministic `learningDesign` metadata derived from structured Course Knowledge Model facts. The planner can classify and select obligations for:

- concepts;
- comparison/discrimination;
- causal/process reasoning where structured evidence supports it;
- quantitative/formula work, including structured quantitative evidence even when a formula string is absent;
- procedure/skill execution;
- application/context transfer;
- analysis/reasoning;
- evaluation/judgement;
- framework application;
- misconception diagnosis; and
- explicitly structured synoptic/exam-response demands.

The work-unit learning design records:

- classifications;
- required Learn treatments;
- required Practice capabilities; and
- exact source knowledge-node IDs.

The planner maps those obligations onto the existing bounded Learn/Practice generation modes. This allows, for example, construction, interpretation, framework application or contextual judgement obligations to select more than generic retrieval without introducing Business-specific templates.

Generative workers remain responsible for learner-facing wording, examples, activities and feedback. They do not decide that a deterministic treatment obligation can be omitted.

## Generation and evidence

`generateFoundationInternalLearningAssets` now uses Course Learning Blueprint v2 planning for new bundles.

The worker input contains:

- exact course identity;
- deterministic work-unit scope and learning design;
- structured knowledge-node summaries, formulas, misconceptions, application contexts, depth and evidence types; and
- exact governed teaching points.

Each returned Learn/Practice output must still provide exact auditable teaching-point evidence. Generation does not set asset assurance to PASS.

## Provenance

A generated bundle retains:

- exact Foundation fingerprint and Candidate ID;
- Course identity;
- exact Coverage Model and Course Knowledge Model fingerprints;
- planning-contract version;
- deterministic work-unit plans and v2 learning-design metadata where applicable;
- generation context IDs; and
- pending Learn and Practice derived-asset records.

## Foundation-native asset assurance

`runFoundationInternalLearningDeterministicAssurance` and `assureFoundationInternalLearningAssets` remain the Foundation-native assurance boundary.

Before independent review, deterministic assurance verifies:

- eligible Foundation state;
- exact Foundation/Candidate/artifact identity;
- the retained work-unit plan against the correct planner contract declared by the bundle;
- generated Learn/Practice mode and teaching-point contracts;
- generation-context uniqueness and separation from earlier Foundation/assurance contexts; and
- pending aggregate asset state.

A v2 bundle is reconstructed with the v2 planner. A historical bundle without a planning-contract field is reconstructed with legacy v1. This prevents new assets from being assured against weaker historical rules while preserving exact replay of retained evidence.

Each deterministic work unit is then challenged in an independent fresh context. Review remains adversarial and covers factual distortion, omitted conditions, misleading certainty, curriculum drift, pedagogy, misconceptions, expected-response correctness and quantitative consistency. Non-pass findings remain smallest-scope remediation targets by work unit and asset kind.

## Retained proof history

Historical evidence remains unchanged.

### Generation proof #3 — teaching-point evidence contract finding

Run `35458295457` reached real generation and correctly fail-held on `Management and Leadership` because structurally valid output did not evidence the exact governed teaching point. The repair bound teaching-point evidence cardinality and exact labels into the provider schema. The retained failed run remains historical evidence.

### Generation proof #5 — successful legacy production

Run `35468029336` successfully produced the complete retained Business bundle from Foundation fingerprint `1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee` on implementation commit `1444af1f7a3c33e8902b0c148a5e18ec8634235b`.

Retained artifact:

- artifact ID `10592980673`;
- digest `sha256:4d463ff3a8d6473a53b8fab1ee1074195ed41a2938ac8801b2db4359fc0a2863`;
- 49 deterministic legacy work units;
- 49 Learn + 49 Practice provider calls;
- zero provider retries;
- 98 unique generation contexts;
- provider/model `openai / gpt-5.6-terra`;
- reported final-response usage cost `$1.766944`;
- Learn and Practice assets left `pending`;
- Foundation not human-approved; learner publication false.

This retained bundle is historical `legacy-v1` evidence and is not mutated by the planner-v2 migration.

### Asset-assurance proof #1 — identity-contract finding

Run `35497826282` correctly fail-held because the provider returned the wrong work-unit fingerprint for `foundation-human-resource-objectives`. The provider-facing review contract was repaired to bind all five system-owned identity fields to exact literals while retaining downstream comparisons as defence in depth. The retained failed run remains historical evidence.

### Asset-assurance proof #2 — educational fail-hold

Run `35504427790` executed against approved-main commit `39c7da983d618b56ac6df6205e000e0031b5f1af` and the exact retained generation bundle from run `35468029336`.

All source/provenance checks passed and the substantive fresh-context review completed all 49 work units. The run then correctly returned `fail_hold` with:

- 16 findings;
- 15 smallest-scope remediation targets;
- Learn asset still `pending`;
- Practice asset still `pending`; and
- learner publication still false.

The findings included missing or insufficient construction, graph/chart, quantitative, diagnostic, framework and contextual-evaluation practice as well as several asset-local factual/pedagogical issues. This pattern demonstrated that the legacy planner's `formula present / context present` treatment selection was not rich enough to implement the approved Course Learning Blueprint.

The run is retained evidence. It is not reclassified as a pass and the generated content is not edited in place.

## Remediation path after proof #2

The systemic planner defect is addressed by ADR-0027 and the `course-learning-blueprint-v2` contract.

The governed next sequence is:

1. merge the planner-v2 implementation only after exact-head assurance and explicit Founder approval;
2. generate a new retained Business Learn/Practice bundle with new contexts under `course-learning-blueprint-v2`;
3. run deterministic and fresh-context independent assurance against that exact new bundle;
4. remediate any remaining asset-local findings at smallest safe scope;
5. if v2 planning exposes missing/incorrect Course Truth, reopen the Foundation Candidate/version rather than inventing truth downstream; and
6. proceed to internal preview only after the exact new bundle passes the applicable asset-assurance gate.

The separate human Foundation approval requirement remains unchanged.

## Release safety

Pre-production content is not registered in the normal learner-content registry and must not enter Production Pages merely because generation or asset assurance succeeds.

`assertFoundationDerivedAssetReleaseEligible` remains the final release guard. Learner publication still requires:

1. derived-asset assurance PASS;
2. qualified-human `foundation_approved` state; and
3. exact equality between the asset Foundation fingerprint and the approved Foundation fingerprint.

## Portability limit

Business is the first reference proof, not evidence that the planner is generally qualified for every subject. The approved workflow still requires a materially different qualification/subject proof before Revision claims general multi-subject portability.

## Documentation impact

ADR-0025 records Foundation-native generation, ADR-0026 records Foundation-native asset assurance, and ADR-0027 records the versioned Course Learning Blueprint planner migration. This document records current implementation truth plus retained proof history without rewriting prior evidence.

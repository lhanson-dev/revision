# Content Factory Subject Foundation Trial

**Status:** Proposed implementation/trial contract  
**Date:** 27 September 2026  
**Normative authority:** `80-company-workflows/Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`  
**Architecture decision:** `decisions/ADR-0028-subject-knowledge-foundation-and-course-projection.md`

## Purpose

Define the controlled technical trial that converts the existing AQA A-level Business 7132 work into the new reusable Subject Knowledge Foundation model without discarding valid prior artifacts or bypassing existing assurance.

This document describes the transition and proof sequence. It does not itself change publication authority.

## Trial objective

Prove that Revision can:

1. create a reusable Business Subject Knowledge Foundation from existing and newly researched educational truth;
2. map AQA 7132 requirements to that reusable foundation at explicit depth/capability;
3. expand the shared foundation when reconciliation exposes genuine Business gaps;
4. materialise exact AQA Course Truth and Exam Truth without duplicating shared knowledge;
5. reuse existing Learn/Practice assets when their dependencies remain valid;
6. preserve exact-course assurance and human-review boundaries; and
7. leave behind a repeatable production path for the next Business exam board.

## Non-goals

This trial does not:

- redesign the learner UI;
- publish unreviewed content;
- discard historical Content Factory evidence;
- create a universal ontology for every academic subject;
- assume current Business artifacts are automatically valid under the new model; or
- require regeneration of valid artifacts merely to fit a new orchestration shape.

## Transitional domain model

The target trial artifacts are:

### 1. SubjectKnowledgeFoundation

Required identity:

- subject family ID;
- subject/qualification-family scope;
- version;
- aggregate fingerprint;
- source/provenance set;
- knowledge-node collection;
- node/facet fingerprints;
- assurance state/evidence; and
- known limitations.

### 2. SubjectKnowledgeNode

Minimum useful fields:

- stable subject node ID;
- title;
- type/classification;
- core explanation/meaning;
- facts/relationships;
- formulas/methods where applicable;
- applications/transfer contexts;
- misconceptions;
- prerequisites/related nodes;
- analysis/evaluation facets where intrinsic;
- valid evidence modes;
- provenance;
- version/fingerprint; and
- assurance evidence/status.

The implementation may split these into substructures so long as stable node/facet identity remains traceable.

### 3. SpecificationMapping

Required identity:

- exact course/specification/cohort;
- mapping version/fingerprint;
- structured requirement IDs;
- requirement-to-node/facet mappings;
- required depth/capability;
- course/topic placement;
- assessment relevance;
- alignment/source references;
- coverage status; and
- explicit gaps/limitations.

### 4. CourseTruthProjection

The AQA Course Truth should reference:

- Subject Knowledge Foundation version/fingerprint;
- exact mapped subject node/facet dependencies;
- exact specification mapping fingerprint;
- course-specific structure and capability requirements; and
- derived/reconciled Course Truth representation needed by existing downstream contracts.

### 5. ExamTruth

Continue to use the existing Assessment Blueprint / Question Family concepts where valid, bound to the exact AQA course identity and Course Truth projection.

## Migration inventory

Before generating new Business truth, inventory existing retained artifacts into these buckets:

1. source/provenance evidence;
2. Board Alignment / specification coverage evidence;
3. Course Truth / CKM educational content;
4. Exam Truth / Assessment Blueprint / Question Families;
5. Learn assets;
6. Practice assets;
7. Exam Prep / assessment assets;
8. assurance findings/remediation evidence; and
9. historical pipeline-only evidence.

For each artifact record:

- exact source/run/commit/fingerprint where available;
- current rights classification;
- whether educational content can be reused;
- whether assurance remains applicable;
- what new subject node/specification mapping dependency it could support; and
- whether it is retained only as history.

## Controlled trial sequence

### T1 — Existing-artifact inventory

Produce a machine-readable and human-readable inventory. Do not modify educational content in this step.

Exit condition:

- existing Business artifacts are classified and traceable;
- no material artifact is silently lost or automatically promoted.

### T2 — Business Subject Knowledge Foundation candidate

Normalise reusable Business educational truth into stable subject nodes/facets.

Use permitted new research only where:

- existing material lacks provenance or confidence;
- the current knowledge is incomplete;
- relationships/depth needed for genuine understanding are missing; or
- later reconciliation requires a genuine Business expansion.

Initial scope is the Business knowledge needed for the supported A-level/Level 3 qualification family, not an unlimited university Business encyclopedia.

Exit condition:

- every node has stable identity, provenance and explicit assurance state;
- the candidate is coherent enough for AQA mapping.

### T3 — Subject-foundation assurance

Apply the relevant existing source/factual and educational-explanation controls at node/facet level.

Use deterministic checks for structure/cross-references and fresh independent challenge for material educational meaning where applicable.

Do not require unrelated unchanged nodes to be regenerated when one node changes.

Exit condition:

- the exact subject-foundation candidate/version has no unresolved blocking/material finding for the scope needed by the AQA trial, or carries an explicit fail-hold.

### T4 — Exact AQA intake and specification mapping

Resolve current applicable AQA 7132 cohort identity and rights-safe structured specification requirements.

Map every material requirement to subject node/facet dependencies and required depth/capability.

Exit condition:

- 100% of the governed AQA requirement denominator is represented as mapped or explicit gap;
- no generated Learn/Practice asset is used as the completeness denominator.

### T5 — Gap/depth reconciliation loop

For every mapping gap classify:

- `REUSE_SUFFICIENT`;
- `EXPAND_SUBJECT_NODE`;
- `ADD_SUBJECT_NODE`;
- `COURSE_SPECIFIC_MAPPING`;
- `EXAM_TRUTH_ONLY`; or
- `SOURCE_RIGHTS_BLOCKED`.

`EXPAND_SUBJECT_NODE` and `ADD_SUBJECT_NODE` must update the Business Subject Knowledge Foundation first and re-run only affected subject assurance/dependencies before the AQA mapping can close.

Exit condition:

- no silent AQA-only patch exists for genuinely reusable Business knowledge;
- AQA requirement coverage is complete for the declared course scope.

### T6 — AQA Course Truth projection

Materialise a Course Truth representation compatible with current downstream Course Foundation contracts while preserving traceability to subject nodes/facets and the specification mapping.

Exit condition:

- exact dependency fingerprints are retained;
- no duplicated educational truth can drift independently without detection.

### T7 — AQA Exam Truth reconciliation

Reconcile existing Board Alignment, Assessment Blueprint and Question Family artifacts against the current course identity, specification mapping and Course Truth projection.

Retain valid prior work; remediate only real gaps/defects.

Exit condition:

- Exam Truth is sufficiently complete for the exact-course assurance gate and later Course Learning Blueprint derivation.

### T8 — Exact-course assurance

Run the existing applicable Foundation assurance chain on the exact AQA Course Foundation:

- source rights;
- deterministic assurance;
- fresh-context independent review/remediation;
- fresh external-source challenge where required;
- `ai_assured` state only when its existing contract passes; and
- qualified subject/assessment review for `foundation_approved` / learner-publication eligibility.

The subject foundation is a reusable dependency, not a bypass around exact-course review.

### T9 — Course Learning Blueprint

Derive the exact AQA blueprint from:

- genuine subject understanding represented by the selected subject nodes/facets;
- exact Course Truth/specification requirements; and
- exact Exam Truth/assessment demand.

Exit condition:

- Learn/Practice treatment covers required understanding and skills without collapsing into exam coaching;
- exam-demand capabilities are not omitted.

### T10 — Existing Learn/Practice reconciliation

For each retained asset classify:

- `REUSE_UNCHANGED`;
- `REUSE_WITH_METADATA_REBIND`;
- `ADAPT_BOUNDED`;
- `REGENERATE`;
- `REASSURE_ONLY`; or
- `HISTORICAL_ONLY`.

Reuse requires exact dependency compatibility and applicable asset assurance.

Generate only missing/deficient assets.

### T11 — Exam Prep reconciliation/production

Reconcile or create AQA-specific Exam Prep against exact Exam Truth. Treat Exam Prep as course-specific by default.

### T12 — Student-test readiness

A controlled learner test may proceed only under the applicable existing internal/pre-production or publication authority. Do not reinterpret `ai_assured` as human approval.

## Required diagnostics

The trial should produce a concise operator summary including:

- subject foundation version/fingerprint;
- total subject nodes/facets;
- reused existing nodes;
- newly researched nodes;
- expanded nodes;
- AQA requirement count;
- mapped requirements;
- unresolved gaps/blockers;
- exact Course Truth fingerprint;
- Exam Truth fingerprint;
- exact-course assurance state;
- Learn/Practice reuse counts by classification;
- Exam Prep status;
- provider/model spend where applicable; and
- human-review status.

## Second-board scalability proof

After AQA Business reaches the controlled target gate, the next Business exam board must run the same process starting from the retained Business Subject Knowledge Foundation.

The proof must demonstrate that unchanged subject nodes and applicable assets are reused rather than regenerated.

At minimum compare:

- total specification requirements;
- percent mapped to unchanged subject nodes;
- subject nodes added/expanded;
- subject assurance work triggered;
- Learn/Practice reuse rate;
- Exam Truth delta work;
- total AI/provider spend;
- operator intervention; and
- time to equivalent gate.

If unchanged Business knowledge is substantially rebuilt, treat that as an architecture defect rather than normal course-production cost.

## Current code impact

Current `foundation-*` runtime and existing Course Knowledge Model contracts remain implementation evidence and reusable components.

The preferred implementation path is bounded adaptation:

- introduce subject-level stable node/version ownership;
- introduce Specification Mapping as a durable dependency;
- add a projection/adapter into the current exact-course Foundation contract;
- extend fingerprints/dependency invalidation rather than replace them;
- keep existing AI-assured/expert-review lifecycle semantics for exact courses; and
- avoid reviving the legacy whole-course v2 orchestrator.

### Business v0.2 promotion-provenance assurance

Following the independent assurance HOLD recorded for the Business `v0.2-post-board-candidate`, promotion provenance is implemented as a sidecar assurance layer rather than by rewriting the historical research corpus.

The bounded remediation consists of:

- `research/business-subject-foundation/v0.2-post-board-candidate/PROMOTION_PROVENANCE_MATRIX.json`, which gives each of the 81 candidate nodes an explicit `subject_truth_sources` set and separately quarantines `board_challenge_or_mapping_sources`;
- `research/business-subject-foundation/v0.2-post-board-candidate/SOURCE_REGISTER_PROMOTION_SUPPLEMENT.json`, which records the current promotion-only source-rights basis, including licence profile, commercial-derivative permission, AI-context permission, attribution/restriction notes, check date and checker method;
- `scripts/assurance/validate-business-subject-provenance.mjs`, which fails closed when node/index/matrix identity diverges, a promotion truth source is absent or rights-ineligible, an excluded source is used as subject truth, or awarding-body evidence is not quarantined consistently; and
- an exact CI step in `Foundation quality` that runs the validator before the broader TypeScript/lint/test/build chain.

The original node `sources` arrays remain historical research/corroboration provenance. They are not reinterpreted as the promotion truth basis. Awarding-body sources remain alignment/challenge evidence only. Historical source records are not rewritten to disguise later rights changes; where a source is no longer acceptable for commercial generative reuse, the promotion layer excludes it and uses a currently eligible replacement instead.

A deterministic PASS of this validator is necessary but not sufficient for promotion. The exact remediated candidate must still receive fresh independent re-assurance for source/factual meaning, and a later governed decision must explicitly promote the candidate. This control does not alter publication authority or make the candidate learner-facing.

The Business provenance control is a bounded implementation of existing source-rights and subject-foundation authority. Further trial implementation should continue to follow the controlled sequence above rather than treating this validator as a substitute for T3 or exact-course assurance.

### AQA Business 7132 T6/T7 projection implementation checkpoint

The controlled trial now has a bounded implementation for the T6 Course Truth projection and the stable T7 Exam Truth core on branch `feat/aqa-7132-course-exam-truth`. This checkpoint is implementation evidence only until its governed PR is green and merged with explicit Founder approval.

The implementation is deliberately bound to the exact successful Business v0.7 reassurance evidence rather than rewriting the earlier specification-mapping candidate state:

- `research/aqa-business-7132/2027/SPECIFICATION_MAPPING_REASSURANCE_RECEIPT.json` records the exact passing reassurance run, artifact, reviewed `main` SHA, candidate fingerprint, target node and reassurance fingerprint;
- `scripts/assurance/materialise-aqa-business-7132-course-exam-truth.mjs` verifies that receipt against the immutable 42-requirement specification mapping and exact Business Foundation candidate before any projection is allowed;
- only AQA requirement `3.1.2`, which was explicitly pending `BUS-FIN-008` reassurance, transitions to `covered_after_v07_foundation_reassurance`; the other 41 requirements retain their prior `mapped` state;
- the Course Truth output fingerprints the exact Foundation, specification mapping and reassurance dependencies and keeps awarding-body content reference-only;
- the Exam Truth output records only stable assessment facts supported by the official AQA scheme of assessment, specification-at-a-glance, quantitative-skills annex and assessment-resource index; and
- `.github/workflows/content-factory-aqa-business-7132-course-exam-truth.yml` revalidates the specification mapping, executes the deterministic projection contract and retains the materialised Course Truth / Exam Truth artifacts as CI evidence.

Repository inspection found no current `main` implementation artifact that can honestly be reused as an existing AQA 7132 Assessment Blueprint or Question Family truth source. The branch therefore does not claim legacy assessment-artifact reuse. Stable question families are projected from the current official assessment contract. Variable question-specific mark allocations, indicative content, detailed mark-scheme wording and examiner commentary are intentionally not promoted into durable Exam Truth; they remain reference-only evidence for later exact-course assurance, calibration and Exam Prep where applicable.

The projection remains fail-closed on learner production. A successful T6/T7 deterministic proof sets the next gate to T8 exact-course assurance and keeps `learnerAssetRegenerationAllowed=false`. It does not confer `ai_assured`, `foundation_approved`, expert approval or learner-publication authority.

## Documentation impact

This document is current technical trial guidance only after the corresponding normative amendment is merged.

It does not rewrite historical Foundation, Learn/Practice or assurance proof records. Those remain evidence to be inventoried and reconciled by the trial.

The T6/T7 projection implementation above does not change normative product or Content Factory authority. It implements the already-approved controlled sequence and preserves the separate exact-course assurance and human-approval gates. No governance amendment or ADR change is required for this bounded implementation unless later assurance exposes a policy or architecture conflict.

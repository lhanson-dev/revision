# Content Factory Subject Foundation Trial

**Status:** Proposed revised implementation/trial contract  
**Date:** 27 September 2026  
**Normative authority:** `80-company-workflows/Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`  
**Research-baseline amendment:** `80-company-workflows/Content Factory Independent Subject Research Baseline Amendment.md`  
**Architecture decisions:** `decisions/ADR-0028-subject-knowledge-foundation-and-course-projection.md`; `decisions/ADR-0029-independent-subject-research-before-content-reuse.md`

## Purpose

Define the controlled technical trial that converts the existing AQA A-level Business 7132 work into the reusable Subject Knowledge Foundation model without discarding valid prior artifacts, allowing AQA-shaped content to define generic Business by default, or bypassing existing assurance.

This document describes the transition and proof sequence. It does not itself change learner-publication authority.

## Trial objective

Prove that Revision can:

1. inventory and preserve the existing Business estate;
2. establish a fresh independent Business subject baseline without anchoring on Revision's AQA content;
3. challenge that sealed baseline against current Business specifications without turning board prose into reusable subject truth;
4. reconcile existing Business content against the independent baseline;
5. create an assured reusable Business Subject Knowledge Foundation;
6. map AQA 7132 requirements to that foundation at explicit depth/capability;
7. materialise exact AQA Course Truth and Exam Truth without duplicating shared knowledge;
8. reuse existing Learn/Practice assets when their dependencies remain valid;
9. preserve exact-course assurance and human-review boundaries; and
10. leave a repeatable production path for the next Business exam board.

## Non-goals

This trial does not:

- redesign the learner UI;
- publish unreviewed content;
- discard historical Content Factory evidence;
- create a universal ontology for every academic subject;
- create an unlimited Business encyclopedia;
- assume current Business artifacts are automatically valid under the new model;
- use an exam-board specification as the generic subject taxonomy; or
- regenerate valid artifacts merely to fit a new orchestration shape.

## Transitional domain model

### SubjectKnowledgeFoundation

Required identity:

- subject family ID and supported scope;
- version and aggregate fingerprint;
- source/provenance set;
- stable knowledge-node/facet collection;
- node/facet fingerprints;
- assurance state/evidence; and
- known limitations.

### SubjectKnowledgeNode

Minimum useful fields:

- stable subject ID;
- title and classification;
- core explanation/meaning;
- definitions/boundaries;
- facts/relationships;
- formulas/methods where applicable;
- applications/transfer contexts;
- misconceptions;
- prerequisites/related nodes;
- analysis/evaluation facets where intrinsic;
- valid evidence modes;
- provenance;
- version/fingerprint; and
- assurance status/evidence.

### IndependentSubjectResearchBaseline

Required identity:

- subject-family scope and level boundary;
- sealed pre-board-challenge version/fingerprint;
- source/provenance/rights register;
- research taxonomy and atomic node/facet register;
- quantitative methods register;
- models/frameworks register;
- misconception/boundary register;
- relationship/dependency graph;
- real-world transfer map;
- completeness/saturation evidence;
- residual uncertainty; and
- post-seal board-challenge delta register.

This is research evidence, not automatically approved Subject Knowledge Foundation truth.

### SpecificationMapping

Required identity:

- exact course/specification/cohort;
- mapping version/fingerprint;
- structured requirement IDs;
- requirement-to-node/facet mappings;
- required depth/capability;
- course/topic placement;
- assessment relevance;
- alignment/source references;
- coverage state; and
- explicit gaps/limitations.

### CourseTruthProjection

The AQA Course Truth references:

- Subject Knowledge Foundation version/fingerprint;
- exact mapped node/facet dependencies;
- exact Specification Mapping fingerprint;
- course-specific organisation/capability requirements; and
- the derived representation required by current downstream Foundation contracts.

### ExamTruth

Continue to reuse the existing Assessment Blueprint / Question Family concepts where they remain valid, bound to the exact AQA course identity and Course Truth projection.

## Controlled trial sequence

### T1 — Existing-artifact inventory

Produce machine-readable and human-readable inventories before modifying educational content.

Inventory at minimum:

1. source/provenance evidence;
2. Board Alignment / specification coverage;
3. Course Truth / CKM educational content;
4. Exam Truth / Assessment Blueprint / Question Families;
5. Learn assets;
6. Practice assets;
7. Exam Prep / assessment assets;
8. assurance/remediation evidence; and
9. historical pipeline-only evidence.

For each artifact retain exact source/run/commit/fingerprint where available, rights state, existing assurance, possible future dependency role and whether it is reusable candidate or history only.

Exit condition:

- existing Business artifacts are classified and traceable;
- no material artifact is silently lost or automatically promoted.

### T2 — Sealed independent Business subject-research baseline

Run `research/Business Subject Knowledge Independent Research Brief - 2026-09-27.md` in a genuinely fresh review/research context.

During the independent phase the researcher must not inspect Revision's existing Business content/taxonomy or use exam-board specifications as the organising outline.

Use permitted external subject sources to establish the Business knowledge universe at the supported UK Level 3 / A-level boundary, including relationships, quantitative methods, misconceptions, limitations and real-world transfer.

Seal the result as a pre-board-challenge baseline before moving on.

Exit condition:

- the independent baseline has a stable version/fingerprint or equivalent retained identity;
- sources/provenance and rights are explicit;
- research completeness method and residual uncertainty are explicit; and
- independence from Revision's current Business estate is recorded.

### T3 — Post-seal cross-board breadth challenge

Only after T2 is sealed, identify current relevant UK Level 3 / A-level Business specifications through fresh official research.

Use structured/reference-only official specification evidence within source-rights rules to challenge whether the independent baseline omitted legitimate Business knowledge or necessary depth.

Classify every delta as:

- `GENUINE_SUBJECT_FOUNDATION_GAP`;
- `SUBJECT_DEPTH_EXTENSION`;
- `COURSE_SPECIFIC_SCOPE_OR_TERMINOLOGY`;
- `EXAM_TRUTH_ONLY`; or
- `OUT_OF_SCOPE_OR_UNSUPPORTED`.

Do not silently rewrite the sealed independent baseline. Retain the delta register separately.

Exit condition:

- breadth challenge completed;
- genuine subject gaps/depth extensions explicit;
- course/exam-only requirements separated.

### T4 — Existing Business reconciliation and Subject Foundation candidate

Now expose the sealed research baseline and breadth-challenge evidence to the existing Revision Business estate.

Reconcile each existing CKM/source-seed knowledge object at the smallest useful scope as:

- `REUSE_ALIGNED`;
- `EXPAND_TO_BASELINE`;
- `SPLIT_FOR_GRANULARITY`;
- `MERGE_DUPLICATE`;
- `CORRECT`;
- `COURSE_SPECIFIC`;
- `INSUFFICIENT_PROVENANCE`;
- `RESEARCH_CONFLICT`;
- `REJECT`; or
- `NEEDS_SPECIALIST_JUDGEMENT`.

Build the Business Subject Knowledge Foundation candidate from the reconciled result. Do not merely rename the current `BUS-7132-*` CKM.

Exit condition:

- every subject node/facet has stable identity, provenance and explicit assurance state;
- AQA-only organisation has not silently become generic Business structure;
- the candidate is coherent enough for assurance and exact-course mapping.

### T5 — Subject-foundation assurance

Apply applicable source/factual, structural and educational-explanation assurance at node/facet level.

Use deterministic checks for mechanically provable structure/cross-references and fresh independent challenge for material educational meaning.

Do not regenerate or re-assure unrelated unchanged nodes when one node changes.

Exit condition:

- no unresolved blocking/material finding for the Business scope needed by the trial, or explicit fail-hold.

### T6 — Exact AQA intake and Specification Mapping

Resolve current applicable AQA 7132 identity/cohort and rights-safe structured specification requirements.

Map every material requirement to assured Business subject nodes/facets and required depth/capability.

Exit condition:

- 100% of the governed AQA requirement denominator is mapped or an explicit gap;
- generated learner assets are not used as the completeness denominator.

### T7 — AQA gap/depth reconciliation

For every mapping gap classify:

- `REUSE_SUFFICIENT`;
- `EXPAND_SUBJECT_NODE`;
- `ADD_SUBJECT_NODE`;
- `COURSE_SPECIFIC_MAPPING`;
- `EXAM_TRUTH_ONLY`; or
- `SOURCE_RIGHTS_BLOCKED`.

Genuine reusable knowledge/depth gaps update the Subject Knowledge Foundation first and rerun only affected subject assurance/dependencies.

Exit condition:

- no silent AQA-only patch exists for genuinely reusable Business knowledge;
- AQA requirement coverage is complete for declared scope.

### T8 — AQA Course Truth projection

Materialise a Course Truth compatible with current downstream Foundation contracts while retaining exact subject-node/facet and Specification Mapping dependencies.

Exit condition:

- exact fingerprints retained;
- shared truth cannot drift independently without detection.

### T9 — AQA Exam Truth reconciliation

Reconcile existing Board Alignment, Assessment Blueprint and Question Family artifacts against current AQA identity, Specification Mapping and Course Truth projection.

Retain valid prior work; remediate only real gaps/defects.

Exit condition:

- Exam Truth complete enough for exact-course assurance and Course Learning Blueprint derivation.

### T10 — Exact-course Foundation assurance

Run existing applicable Foundation assurance:

- source rights;
- deterministic assurance;
- fresh-context independent review/remediation;
- fresh external-source challenge where required;
- `ai_assured` only under its existing exact-state contract; and
- qualified subject/assessment review for `foundation_approved` / learner-publication eligibility.

The Subject Knowledge Foundation is a reusable dependency, not a bypass around exact-course review.

### T11 — Course Learning Blueprint

Derive the exact AQA blueprint from:

- genuine subject understanding represented by selected subject nodes/facets;
- exact Course Truth/specification scope; and
- exact Exam Truth/assessment demand.

Exit condition:

- Learn/Practice treatment develops genuine understanding and required skills without collapsing into exam coaching;
- assessment-demand capabilities are not omitted.

### T12 — Existing Learn/Practice reconciliation

For each retained asset classify:

- `REUSE_UNCHANGED`;
- `REUSE_WITH_METADATA_REBIND`;
- `ADAPT_BOUNDED`;
- `REGENERATE`;
- `REASSURE_ONLY`; or
- `HISTORICAL_ONLY`.

Reuse requires exact dependency compatibility and applicable asset assurance. Generate only missing/deficient material.

### T13 — Exam Prep reconciliation/production

Reconcile or create AQA-specific Exam Prep against exact Exam Truth. Treat Exam Prep as course-specific by default.

### T14 — Student-test readiness

A controlled learner test may proceed only under existing internal/pre-production or publication authority. Do not reinterpret `ai_assured` as qualified-human approval.

## Current T1 evidence location

The point-in-time inventory is recorded in:

- `audits/Content Factory Business Existing Artifact Inventory - 2026-09-27.md`

Machine-readable inventory data should be retained alongside the audit as item-level extraction is completed.

## Required diagnostics

The trial operator summary should ultimately show:

- independent baseline version/fingerprint;
- post-seal board-challenge delta counts;
- Subject Knowledge Foundation version/fingerprint;
- total subject nodes/facets;
- reused/expanded/new/corrected/rejected existing nodes;
- AQA requirement count and mapped count;
- unresolved gaps/blockers;
- exact Course Truth fingerprint;
- Exam Truth fingerprint;
- exact-course assurance state;
- Learn/Practice reuse counts by classification;
- Exam Prep status;
- provider/model spend where applicable; and
- human-review status.

## Second-board scalability proof

After AQA Business reaches the controlled target gate, the next Business exam board must start from the retained assured Business Subject Knowledge Foundation rather than rerunning the complete first-subject research process.

Measure:

- total specification requirements;
- percentage mapped to unchanged subject nodes;
- nodes added/expanded;
- subject assurance work triggered;
- Learn/Practice reuse rate;
- Exam Truth delta work;
- total provider spend;
- operator intervention; and
- time to equivalent gate.

If unchanged Business knowledge is substantially rebuilt, treat that as an architecture defect rather than normal course-production cost.

## Current code impact

Current `foundation-*` runtime, Course Knowledge Model, Assessment Blueprint, Question Family, fingerprint and targeted-remediation contracts remain implementation evidence and reusable components.

Preferred implementation remains bounded adaptation:

- introduce subject-level stable node/version ownership;
- persist Specification Mapping;
- retain independent-baseline/reconciliation provenance;
- add a projection/adapter into current exact-course Foundation contracts;
- extend dependency-aware invalidation;
- retain existing exact-course AI-assured/expert-review lifecycle semantics; and
- do not revive the legacy whole-course v2 orchestrator.

## Documentation impact

This technical trial must remain aligned with the active subject-foundation authorities. Historical Foundation, learner-asset and assurance proofs remain historically accurate and are inventoried rather than rewritten.
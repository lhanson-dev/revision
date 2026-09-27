# Content Factory Subject Knowledge Foundation and Course Projection Amendment

**Status:** Active on Founder-approved merge  
**Decision date:** 27 September 2026  
**Owner:** Founder / Product / Educational Content / Content Operations  
**Amends:** `Content Factory Foundation and Asset Production Model.md`  
**Related authority:** `Content Factory AI-Assured Foundation Gate Amendment.md`; `10-product-governance/Course Learning Blueprint.md`; `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`  
**Decision record:** `decisions/ADR-0028-subject-knowledge-foundation-and-course-projection.md`

## Purpose

Define the scalable Content Factory process for creating multiple qualifications and exam-board courses without rebuilding unchanged subject knowledge from scratch.

This amendment preserves the existing exact-course assurance and publication gates, but inserts a reusable, versioned **Subject Knowledge Foundation** upstream of Course Truth.

Where this amendment conflicts with the parent Foundation/Asset Production Model on how Course Truth is compiled, reused or expanded across courses, this amendment governs. Unaffected controls in the parent model and the AI-Assured Foundation Gate remain in force.

## Governing decision

Revision will separate four responsibilities:

1. **Subject Knowledge Foundation** — the reusable, board-independent educational truth for a deliberately bounded subject/qualification family.
2. **Specification Mapping / Course Projection** — the exact mapping from an awarding-body specification and cohort to the Subject Knowledge Foundation, including required depth, capabilities and scope.
3. **Exam Truth** — the exact governed model of how that course is assessed.
4. **Learner assets** — Learn, Practice and Exam Prep derived only after Course Truth and Exam Truth are sufficiently established for the applicable internal-production or publication gate.

The governing sequence becomes:

`course request → subject-foundation load/create → exact specification/board alignment → requirement mapping → subject-foundation gap/depth reconciliation → exact Course Truth projection + Exam Truth → course-foundation assurance → Course Learning Blueprint → Learn / Practice / Exam Prep → asset assurance → publication`

The existing `ai_assured` and `foundation_approved` semantics continue to apply to the **exact Course Foundation**. A reusable subject foundation does not by itself approve a specific course.

## Why this changes the previous exact-course model

The parent model correctly separated truth from learner assets, but its normal compilation flow treated each exact course as the primary place where subject knowledge was established.

That is safe for one course but does not scale well across multiple exam boards or specification revisions because equivalent subject knowledge can be repeatedly regenerated, restructured and reassured.

Revision therefore adopts this rule:

> **Unchanged, already-assured subject knowledge must be reused. New courses should spend effort on specification mapping, genuine subject-knowledge deltas, required depth and Exam Truth rather than recreating the subject.**

This is a reuse change, not a reduction in the standard required to prove an exact course complete.

## Subject Knowledge Foundation

### Definition

A **Subject Knowledge Foundation** is the reusable governed knowledge model for a bounded subject/qualification family, for example UK Level 3 / A-level Business.

It is not:

- a single exam-board specification;
- a learner-facing course;
- an infinite encyclopedia of the academic discipline;
- an exam-technique model; or
- permission to teach every stored node to every learner.

It should be comprehensive enough to support the qualifications Revision deliberately serves and should expand when a legitimate new specification reveals missing subject knowledge or insufficient depth.

### Required node structure

A substantial subject node should carry, where educationally applicable:

- stable subject-level knowledge/skill ID;
- title and plain-language meaning;
- definitions and important boundaries;
- concepts, facts and relationships;
- formulas, methods and quantitative rules;
- processes or procedures;
- prerequisites and related nodes;
- application contexts and transfer/use cases;
- worked-example requirements where useful;
- common misconceptions;
- analysis/reasoning relationships;
- evaluation/judgement considerations where intrinsic to the subject;
- relevant real-world use or interpretation;
- valid evidence types capable of testing the knowledge/skill;
- source/provenance references;
- version/fingerprint; and
- assurance status/evidence.

Subject nodes may use facets/sub-obligations so a specification can require only the relevant depth or capability without duplicating the underlying concept.

### Genuine understanding rule

The Subject Knowledge Foundation must support genuine subject understanding, not merely exam coaching.

It should capture enough meaning, relationships, application, transfer and real-world interpretation for a learner to understand and use the subject appropriately at the supported qualification level.

Exam Truth may shape how an exact course teaches and practises a node, but Exam Truth must not redefine the underlying subject truth or create an artificial ceiling on useful understanding.

## Specification Mapping / Course Projection

Each exact course must have a versioned mapping from current structured specification/alignment requirements to subject nodes and, where necessary, specific facets/depth.

At minimum the mapping records:

- exact course/specification/cohort identity;
- requirement ID;
- rights-safe structured requirement summary;
- mapped Subject Knowledge Foundation node(s);
- required facets/skills/depth;
- course/topic placement;
- assessment relevance;
- source/alignment reference;
- coverage status; and
- known ambiguity or limitation.

Every material examinable requirement must map to sufficient subject knowledge or create an explicit gap. Generated learner content must never be used as evidence that a requirement is covered.

## Subject-foundation expansion rule

When specification reconciliation exposes a gap, classify it before changing anything.

### A. Existing subject knowledge is sufficient

Map and reuse it. Do not regenerate or re-assure unchanged subject knowledge merely because a new exam board uses it.

### B. Existing subject knowledge is valid but not comprehensive enough

Improve the **Subject Knowledge Foundation** at the smallest safe scope, assure the changed node/facets and affected relationships, then update the course mapping.

Do not patch the richer knowledge only into the exam-board-specific Course Truth if the knowledge is genuinely part of the subject.

### C. Genuine subject knowledge is missing

Add it to the Subject Knowledge Foundation, assure the addition and affected relationships, then map it into the exact course.

### D. Requirement is qualification/board-specific rather than subject truth

Keep it in Specification Mapping, Board Alignment or Exam Truth as appropriate. Do not pollute the reusable Subject Knowledge Foundation with paper timings, specification section numbering, board-specific administrative structure or other assessment-only facts.

This classification is mandatory. The goal is a progressively stronger reusable subject foundation, not a growing collection of board-specific exceptions.

## Course Truth

Course Truth remains the complete governed model of what the learner must know and be able to do for the **exact course**.

Under this amendment, Course Truth should normally be a deterministic or reviewable projection of:

`Subject Knowledge Foundation version + exact Specification Mapping + course-specific depth/capability requirements`

Course Truth may include course-specific organisation and requirement metadata, but it must not fork or silently rewrite reusable subject truth when the underlying subject knowledge is shared.

An exact Course Foundation records the precise subject-foundation version and node/facet dependencies from which its Course Truth was projected.

## Exam Truth sequencing

Course Truth and Exam Truth are sibling inputs to final learning design.

Exam Truth must be established before the final Course Learning Blueprint and before final Learn/Practice asset planning because assessment demand can change the capabilities a learner must develop, for example:

- calculation and interpretation;
- contextual application;
- analysis and causal reasoning;
- evaluation and justified judgement;
- source/data handling;
- synoptic connection;
- extended response construction; and
- performance under timing or paper constraints.

However:

> **Exam Truth shapes the required demonstration of subject knowledge; it does not define the full educational meaning of that knowledge.**

## Course Learning Blueprint relationship

The existing Course Learning Blueprint remains the learning-design authority.

For an exact course, the blueprint should be derived after the relevant Course Truth and Exam Truth are sufficiently complete under the applicable gate.

The blueprint must balance three inputs:

1. genuine subject understanding from the Subject Knowledge Foundation;
2. exact specification scope/depth from Course Truth; and
3. required assessment performance from Exam Truth.

The intended learner distinction is:

- **Learn** — understand the subject clearly and coherently at the required level;
- **Practice** — retrieve, apply, reason with and deepen that understanding, producing valid evidence; and
- **Exam Prep** — convert that understanding and capability into performance under the exact assessment demands.

Learn and Practice must not collapse into mark-scheme coaching. Conversely, they must not ignore assessment capabilities that the exact course requires.

## Exact-course assurance remains mandatory

A reusable Subject Knowledge Foundation does not remove the need to prove an exact course complete.

The exact Course Foundation must still satisfy all applicable existing controls, including:

- exact identity/cohort resolution;
- source-rights/provenance safety;
- complete specification requirement coverage;
- sufficient subject-node/facet mapping and depth;
- complete Course Truth for the declared scope;
- complete Exam Truth;
- applicable deterministic assurance;
- fresh-context independent AI review/remediation;
- fresh external-source challenge where required;
- qualified subject/assessment review for `foundation_approved`; and
- explicit known limitations.

The AI-Assured Foundation Gate continues to determine when controlled internal asset production may begin.

## Incremental subject assurance and reuse

Subject-foundation versions are immutable once retained as an assured dependency set.

When subject knowledge changes:

1. create a new subject-foundation version/fingerprint;
2. assure only the changed/new nodes plus genuinely affected relationships and structural dependencies;
3. preserve prior assurance evidence;
4. identify every exact course whose mapping depends on changed nodes/facets;
5. re-evaluate only those course projections and downstream assets; and
6. leave unrelated courses/assets untouched.

Adding a new node that only a new specification uses must not invalidate unrelated existing courses.

Correcting or materially changing an existing shared node must trigger dependency analysis across every course that uses that node.

## New exam board / course reuse rule

When adding a new course in an already-supported subject family:

1. load the latest applicable assured Subject Knowledge Foundation;
2. establish current exact course/specification/cohort identity;
3. extract/verify rights-safe structured specification requirements and Board Alignment;
4. map every requirement to existing subject nodes/facets where sufficient;
5. classify all unmatched or insufficient mappings using the subject-foundation expansion rule;
6. expand and assure Subject Knowledge Foundation deltas where genuinely required;
7. prove complete exact-course requirement coverage;
8. establish Exam Truth for the exact qualification/components;
9. assure the exact Course Foundation;
10. derive the Course Learning Blueprint; and
11. reuse, adapt or generate learner assets according to actual dependency compatibility.

The system must not rerun the complete subject-foundation creation process merely because a different exam board or specification is being added.

## Specification revision / later-cohort rule

For a revised specification or later cohort:

1. establish whether the specification and assessment authority actually changed;
2. diff structured requirements and Board Alignment against the prior course version;
3. classify requirements as unchanged, changed, added or removed;
4. reuse unchanged subject knowledge and course mappings;
5. expand or correct Subject Knowledge Foundation only for genuine subject-knowledge deltas;
6. update only affected Course Truth projections;
7. update Exam Truth only where assessment rules changed; and
8. invalidate/regenerate/reassure only dependent learner assets.

A new exam year by itself is not justification for rebuilding unchanged educational truth.

## Learner-asset reuse

### Learn

Learn assets may be reused across exact courses when all material dependencies are compatible, including:

- same subject node/facets;
- sufficient depth;
- compatible learning treatment; and
- no course-specific wording/claim that makes reuse misleading.

### Practice

Practice may be reused where it validly tests the same subject knowledge/capability at suitable depth. Assessment-shaped Practice must also be compatible with the relevant Course Truth and Exam Truth.

### Exam Prep

Exam Prep is course/board-specific by default because it depends strongly on Exam Truth. Reuse is allowed only where the assessment contract is genuinely shared and evidence supports it.

Asset reuse must be explicit and dependency-traceable, not inferred from similar titles.

## Source-rights rule

This amendment does not weaken the Educational Content Source Licensing and Provenance Standard.

Awarding-body material may establish identity, structured specification requirements and Board Alignment only within its approved source-use classification.

REFERENCE_ONLY protected prose must not be laundered into the Subject Knowledge Foundation by paraphrasing or automated transformation.

Reusable subject knowledge must be independently authored/established from OPEN, REVISION_OWNED or appropriately LICENSED sources and other permitted educational evidence under the existing standard.

## Controlled use of existing Business work

The first trial applies to AQA A-level Business 7132 and the Business content already produced in the repository/workflow evidence.

Existing work must not be discarded merely because this process changes the model. It must be reconciled and classified.

Existing artifacts may become:

- **reusable subject-knowledge candidate** — educational truth that can be normalised into Subject Knowledge Foundation nodes with sufficient provenance and assurance;
- **AQA specification-mapping evidence** — requirement/alignment information that supports the exact course mapping;
- **AQA Exam Truth evidence** — assessment structure/demand suitable for reconciliation into the exact Exam Truth;
- **learner-asset candidate** — Learn/Practice/Exam Prep material potentially reusable after dependency and asset assurance checks; or
- **historical evidence only** — useful learning about prior runs but not current educational truth.

No historical artifact is automatically promoted merely because it previously passed an older internal check. Equally, no valid artifact should be regenerated solely to satisfy a new orchestration shape.

## Controlled trial runbook — AQA Business 7132

The Business trial must execute in this order:

1. **Inventory existing Business educational artifacts and provenance.**
2. **Construct Business Subject Knowledge Foundation candidate** by normalising reusable Business knowledge and filling genuine subject gaps through permitted research.
3. **Assure the subject-foundation candidate/deltas** for factual accuracy, completeness at the supported A-level Business scope and internal relationships.
4. **Resolve current AQA 7132 / applicable cohort identity and structured specification requirements.**
5. **Map every AQA requirement** to Business subject nodes/facets and required depth/capability.
6. **Run gap/depth reconciliation.** Any genuine Business deficiency expands the Business Subject Knowledge Foundation first; board-specific assessment/organisation stays course-specific.
7. **Materialise exact AQA Course Truth** from the reconciled subject-foundation version and mapping.
8. **Establish/reconcile AQA Exam Truth** before final learning design.
9. **Run exact-course Foundation assurance** using the applicable deterministic, independent, external-source and human-review gates.
10. **Derive the AQA Course Learning Blueprint** from subject understanding + Course Truth + Exam Truth.
11. **Reconcile existing Learn/Practice assets** against the blueprint and reuse them where dependency/quality evidence is sufficient; generate only missing or deficient material.
12. **Produce/reconcile AQA Exam Prep** against exact Exam Truth.
13. **Assure learner assets and integrate for controlled student testing/publication** under existing release gates.

The trial should expose content gaps, not conceal them through asset generation.

## Scalability acceptance criteria

The process is not considered scalable merely because AQA Business completes.

The next Business exam board must be used as the first reuse proof. Record at minimum:

- percentage/count of subject nodes reused unchanged;
- new subject nodes/facets required;
- existing nodes expanded;
- percentage/count of Learn assets reusable unchanged or with bounded adaptation;
- percentage/count of Practice assets reusable unchanged or with bounded adaptation;
- new/changed Exam Truth work;
- exact-course assurance effort;
- qualified-review delta/focus versus full first-course review;
- provider/model spend; and
- elapsed/operator effort to reach the equivalent controlled gate.

Failure condition:

> If adding a second Business board materially repeats the first Business subject-research and assurance workload for unchanged knowledge, the architecture has failed its reuse objective and must be corrected before scaling course volume.

A later materially different subject should then test whether the production machinery is qualification-agnostic without forcing Business-specific structure onto that subject.

## Operator / Founder interaction

The intended interaction remains simple:

1. request an exact course or batch of course URLs;
2. the system identifies whether a reusable subject foundation exists;
3. the system reports genuine subject gaps, specification gaps, source-rights blockers or expert-review decisions only when action is required;
4. unchanged approved/assured dependencies are reused automatically under the governed rules;
5. the operator receives a concise exact-course assurance decision and reuse/delta summary; and
6. normal explicit Founder approval remains required for governed repository merges.

The Founder should not coordinate prompts, contexts, retries, node remapping or assurance bookkeeping.

## Documentation and implementation impact

This amendment changes the target Content Factory domain model and sequencing before Course Truth compilation.

Required implementation work must:

- add a durable Subject Knowledge Foundation schema/version/fingerprint or a deliberately equivalent representation;
- make exact Course Truth reference reusable subject nodes/facets rather than own duplicated educational truth by default;
- persist Specification Mapping as a first-class dependency;
- support dependency-aware subject/course/asset invalidation;
- support delta-focused new-board and specification-update workflows; and
- keep current exact-course `ai_assured` / `foundation_approved` gates intact unless separately changed by Founder-approved authority.

Current runtime remains implementation evidence until these capabilities are implemented. The Business trial may use controlled transitional artifacts/adapters so long as provenance, versions, mappings and assurance decisions are explicit and no learner-publication gate is bypassed.

Historical Content Factory evidence and ADRs remain historically true and must not be rewritten to imply this subject-foundation model existed during earlier proofs.
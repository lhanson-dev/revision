# Content Factory Stage 4 — independent Foundation to learner projection

**Status:** Governed candidate on Stage 4 branch; not yet merged or production-approved.
**Scope:** Provider-free internal pre-publication proof, no real course production, no new learner content, no release or approval gate change.
**Existing learner entry point:** `/revision/app/` (`/app/` within the Vite base), `content/**/index.ts` through `src/engine/content/content-adapter.ts`; the Stage 4 code has no learner-runtime import and does not change navigation, routes or learner records.
**Normative sources:** Content Factory Fast-Path Process (ADR-0029), Subject Knowledge Foundation and Course Projection Amendment (ADR-0028), Foundation and Asset Production Model, AI-Assured Foundation Gate Amendment, Content Accuracy Assurance Gate, Content Pack Production and Assurance Workflow, Content Factory Mock Exam Production, Educational Content Source Licensing and Provenance Standard and AI Agent Constitution.

## Independent expected truth — exact boundaries

* **Source-use permission:** `sourceLicenceRegisterSchema` records origin, licence classification, permission basis, permitted generation/derivative uses, references and checksum. `UNKNOWN` and `PROHIBITED` fail closed. `REFERENCE_ONLY` may establish board facts but cannot become approved curriculum-derivation text.
* **Identity and cohort:** `FoundationCandidate.courseIdentity/cohortValidity`, independently rechecked in `BoardAlignment`; no generated learner manifest is an authority. This intentionally narrow adapter only proves an *explicit single assessment-year* first/last cohort identity. Wider windows HOLD pending independently grounded cohort-identity records.
* **Course Truth:** `foundationCoverageModelSchema` holds the atomic official requirement IDs, source references, paper scopes, and canonical knowledge node IDs; `courseKnowledgeModelSchema` holds exact assured teaching/knowledge requirements. Missing requirements or nodes cannot be inferred from the learner pack.
* **Exam Truth:** `boardAlignmentSchema.components` independently holds required compulsory papers, marks, timings and qualification weights. `foundationAssessmentBlueprintSchema` must be fingerprint-bound to the Board Alignment and Course Knowledge Model and agree on every component.
* **Governance and provenance:** `FoundationJob` holds `ai_assured`/review/approved state; `FoundationCandidate` records exact constituent fingerprints and passing deterministic assurance, fresh independent review and source challenge evidence; `foundation_approved` adds exact qualified approval evidence. Structural PASS never substitutes for these controls.

The Business v0.x Subject Knowledge Foundation / AQA 7132 T6–T7 materialiser at `scripts/assurance/materialise-aqa-business-7132-runtime-adapter.mjs` is **transitional compatibility code** and does not establish generic source truth. The separate Psychology Source-First experimental exception is **not** an approved replacement for the Foundation/Fast-Path architecture or an alternative learner publication route.

## Implementation

`src/content-factory/foundation-learner-projection.ts` exposes `checkFoundationLearnerProjection()` and a constrained `foundationLearnerProjectionMappingSchema`. Inputs are **externally retained** Foundation Job, Source Licence Register, Board Alignment, Foundation Coverage, Course Knowledge Model, Assessment Blueprint, an explicit ID crosswalk and candidate `ContentPack` objects. It never generates a source, calls a provider or infers specification requirements from candidate learner text.

1. Parse every independent artifact against existing contracts, then require the permitted Foundation state, no blockers, matched exact approval/review evidence and re-computed governing checksums.
2. Reconcile source-rights status and covered material references, exact job/cohort/qualification identity, both truth graphs, all compulsory component identity/mark/timing/qualification weights and all atomic requirement/node IDs. Existing fingerprint protection is **not cryptographic signature verification** or proof that human reviewers independently verified the underlying specifications.
3. Build the Stage 3 `QualificationProjectionProfile` *from independent verified Board Alignment and coverage*, never from the learner mocks. Reject unsupported scope, optional-component complexity, invented paper IDs/numbers, wide cohort windows, missing or duplicate requirements, extra/missing papers and variant projections.
4. Demand explicit per-requirement, per-paper **Learn page + Practice question + representative Exam Prep question** identities, with exact mock ID (for exams), asset ID and learner topic ID. Every governed course requirement applicable to a paper must retain one locator **for each of the three paths**. A Learn page is teaching coverage, not mastery evidence. These deliberately conservative three-lane requirements can be relaxed only when independent Learning Blueprint obligations justify a different scope. The checker can prove **existence and structural scope**, not semantic teaching accuracy, scored progress or AO validity.
5. Invoke existing `checkQualificationProjection()` for per-paper checks across all mocks. Return `{status:'pass'|'hold', problems, publicationEligible:false}` with no mutation.

**Known intentionally unsupported truths:** Current generic Foundation Exam Truth has no trusted, machine-readable exact pre-release context or whole-paper practical-mark minimum field. A mapper cannot invent them: the Stage 4 checker HOLDS either assertion even if its candidate sidecar agrees. GCSE tier/variant identity likewise HOLDS until the learner manifest, routing and evidence storage have a governed generic design. A-level option branches/optional qualification components and broad cohort windows HOLD until separately proven in governing input. The adapter assumes independently sourced and assured Foundation artifacts are supplied: a copied/self-certified fabricated review report is not an independent audit.

## Assurance and failure boundaries

`src/content-factory/foundation-learner-projection.test.ts` contains a **fully fictional**, no-provider, planned-only two-paper scenario with unequal 40/60 weights, two independently established requirements, both papers' topic eligibility, and twelve exact Learn/Practice/Exam asset bindings. Mutations cover omitted requirements, papers and evidence locators; tampered/unknown source rights; missing review evidence; stale fingerprints; wrong cohort, identity, paper, weighting and topics; unsupported tier/pre-release/practical rules; and mistakenly available learner packs.

A passing synthetic case establishes the correctness of this bounded wiring, not **Source Universe completeness**, correctness of specific source claims, genuine human educational A1–A4 acceptance, quality of teaching, marks/optional routes, GCSE readiness, rights permission for actual awarding-body text or student release.

The existing `ai_assured` internal production permission and `foundation_approved` semantics are **not** changed. The later Founder-approved Fast-Path restricted-pilot conditional publication exception remains governed by its existing release and independent assessment controls, not by this preflight. The checker has no ability to set catalogue status `available` and does not override publication, Founder PR approval, deployment or student-path assurance.

## Efficiency and migration measurement

* Reused: existing `FoundationJob` lifecycle and fingerprints, five Foundation/content Zod schemas, existing source classification logic, Stage 3 projection checker, learner pack schema and existing coverage-to-evidence IDs. No copy of Business topic tables or bespoke per-board React rendering.
* Manual remaining: independent official Source Universe collection, source rights classification, atomic specification and exam mapping, educational A1–A4/qualified reviews, verification of topic crosswalk semantics and real publication routing. None is completed by synthetic data.
* Early rejection points: schema/source rights before mapping; fingerprints/reviews before profile projection; mandatory requirements and topic/evidence crosswalk before Stage 3 mock checks.
* Provider calls: **0** in this test path. Measured paid production duration, human-review hours and cost cannot be inferred from fixture tests; those require the Stage 5–7 real-trial ledger.
* Further integration: the next real course must supply artifact retrieval and independent cohort, mapping and review proof, then run this gate in the existing pre-publication workflow. No parallel release API or subject-specific learner runtime should be introduced.

## Documentation impact

This records implementation truth and the intentionally narrower validation boundary. The three-lane requirement is a conservative internal structural preflight, not a new publication rule. No normative authority change is proposed: adding a mandatory publishing gate or extending tier/cohort/variant semantics requires a separately reviewed governed authority and implementation decision. Historical Business/Psychology research, source material and assurance evidence remain untouched. The existing Stage 3 preflight technical document still describes Stage 3; this is its Stage 4 independent-truth companion.

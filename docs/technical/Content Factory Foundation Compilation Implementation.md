# Content Factory Foundation Compilation Implementation

**Status:** Slice 2A implementation in progress via Issue #289  
**Governing authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Implementation plan:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`

## Purpose

Record the current technical implementation of Foundation compilation: the bounded process that turns an exact governed course request into a complete `FoundationCandidate` containing Course Truth and Exam Truth before Foundation assurance or any learner-facing asset generation begins.

This document describes implementation truth. It does not change the product or governance authority.

## Canonical runtime boundary

Slice 2A establishes:

- `src/content-factory/foundation-compilation.ts` — Foundation-native compilation contracts, deterministic reconciliation and candidate assembly;
- `src/content-factory/foundation-compilation.test.ts` — provider-free regression proof of the boundary;
- `src/content-factory/foundation-schema.ts` — Foundation Candidate / approved Foundation contracts; and
- `src/content-factory/foundation-lifecycle.ts` — the surrounding `requested → compiling → assuring → expert_review → foundation_approved` lifecycle.

The legacy `ContentFactoryJob`, `orchestrator.ts`, `runIntakeToKnowledgeModel`, Learn/Practice work units and old assessment-generation sequence are not runtime dependencies of the new Foundation compiler.

## Compilation sequence

Within the single operator lifecycle state `compiling`, the compiler performs:

```text
exact request
  → identity/cohort resolution
  → source discovery
  → deterministic source-rights classification
  → controlled structured evidence
  → Board Alignment
  → Foundation coverage model
  → Course Truth / Course Knowledge Model
  → Exam Truth / Assessment Blueprint
  → Question Families where required
  → complete Foundation Candidate
```

The result remains in `compiling`. Deterministic Foundation assurance and independent review are intentionally still `pending`; only the lifecycle gate may advance the candidate into `assuring`.

## Foundation coverage replacement

The legacy `coverageMapSchema` cannot be used because it requires learner-content references before a requirement can be marked complete.

Slice 2A uses `foundationCoverageModelSchema` instead. Each governed curriculum requirement must preserve:

- its official reference;
- requirement summary;
- knowledge/skill description;
- component scope;
- revision area; and
- exact permitted source references.

It must also map to one or more canonical `knowledgeNodeIds` and carry `coverageStatus: complete`.

Completeness therefore means **the Foundation knows exactly what Course Truth must contain**, not that downstream Learn or Practice assets have been generated.

## Fail-closed reconciliation

The compiler rejects a candidate when any of these conditions occur:

- course options remain unresolved;
- a source has no unique approved rights rule or is prohibited;
- curriculum evidence relies on a source without permitted derived-use rights;
- Board Alignment identity/cohort/components do not match the resolved course;
- a known resolved component name, compulsory status, marks, duration or weighting drifts in Board Alignment;
- Board Alignment evidence is not verified;
- Foundation coverage omits, adds or mutates a governed curriculum requirement;
- Foundation coverage uses unknown components or disallowed sources;
- Course Truth does not contain the exact canonical node set established by Foundation coverage;
- a Course Truth node has no explicit valid Board Alignment relevance;
- Course Truth uses source evidence outside the coverage governing that node or cannot trace to each governing coverage requirement;
- Course Truth references unknown Board Alignment items;
- Exam Truth is not bound to the exact Board Alignment and Course Truth fingerprints;
- Exam Truth does not cover the exact governed component/objective set;
- governed marks, timing or objective weighting drift in Exam Truth; or
- Question Family IDs, component scope, objective references or mark ranges conflict with Exam Truth.

Provider-supplied Board Alignment and Course Truth fingerprint strings are not trusted as identity. The compiler recalculates their durable artifact fingerprints from validated canonical content before downstream dependencies are built.

## Artifact boundary

Slice 2A permits only these artifact kinds:

- `source_licence_register`;
- `board_alignment`;
- `foundation_coverage_model`;
- `course_knowledge_model`;
- `assessment_blueprint`; and
- `question_family`.

There is deliberately no artifact type for Learn, Practice, assessment items, mocks or Marking Packs.

The resulting Foundation Candidate stores exact ref/fingerprint pairs for each persisted dependency and records the source-set fingerprint and implementation provenance.

## Worker boundary

`FoundationCompilationWorkers` is provider-neutral. It exposes bounded workers for:

- identity;
- source discovery;
- structured evidence;
- Board Alignment;
- coverage;
- Course Truth;
- Exam Truth; and
- Question Families.

Every execution carries worker/context/contract provenance and optional provider/model/retry/cost data. The compiler records Foundation-only input/output refs so later operational persistence can retain an auditable run ledger.

Slice 2A does not choose or connect a live model provider. That is Slice 2B, so the new architecture can be proven independently of provider/network behaviour before live cost is incurred.

### Source-rights policy trust boundary

`sourceRightsRules` is a control-plane input, not an AI judgement. Slice 2A validates rule shape and applies it deterministically, but it cannot establish whether a human/legal approval is authentic merely because a caller supplied a rule object.

Slice 2B must therefore load reusable source-rights rules only from a governed approved source and retain the approval/policy evidence that authorises each rule. Arbitrary runtime or model-generated rules must not be accepted as authorised. If a source cannot be matched uniquely to that governed rule set, the Foundation must fail closed with `source_rights_review_required`.

This preserves the licensing authority rule that only an authorised human/legal decision or a previously approved reusable policy rule can clear source-rights uncertainty.

## Selective reuse decision

Useful previous concepts were retained:

- the Source Licence Register shape;
- source-rights rule semantics;
- exact identity/cohort and Board Alignment schemas;
- Course Knowledge Model concepts;
- Assessment Blueprint and Question Family concepts;
- deterministic fingerprinting and cross-reference validation; and
- worker provenance.

The old orchestration sequence, old job states, learner-coupled coverage schema and Learn/Practice/assessment-item prerequisites were not reused.

## Assurance in Slice 2A

Provider-free tests prove that:

- a governed fixture can reach a complete Foundation Candidate;
- only Foundation artifacts are persisted;
- Foundation coverage contains canonical node mappings and no learner-content requirements;
- unresolved source rights fail closed;
- resolved component contract drift fails closed;
- an omitted curriculum requirement fails closed;
- missing or unanchored Course Truth nodes fail closed;
- stale Exam Truth fingerprint bindings fail closed; and
- Question Family scope drift fails closed.

Repository CI remains the merge gate.

## Documentation impact

No normative authority changes in Slice 2A. The implementation enforces the sequencing, source-rights boundary and Foundation definition already approved through PR #290 and the Educational Content Source Licensing and Provenance Standard.

`docs/technical/Content Factory Architecture.md` remains transitional while live provider execution still belongs to the legacy path. Update that architecture document when Slice 2B establishes the live Foundation provider/runtime path rather than describing a provider-free compiler as a complete runtime replacement.

## Next implementation increment

Slice 2B will connect live provider workers to this boundary, load source-rights policy only through the governed approval boundary, and prove one **new** real governed Foundation job—likely using AQA Business as a useful historical failure corpus—through complete Course Truth + Exam Truth with zero learner-facing assets. It must not resume the superseded Issue #281 pilot or route through the old end-to-end orchestrator.
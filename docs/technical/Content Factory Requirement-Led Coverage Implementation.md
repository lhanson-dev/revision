# Content Factory Foundation Curriculum and Exam Coverage Implementation

**Status:** Proposed implementation on `fix/content-factory-requirement-led-coverage`  
**Governing authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`  
**Decision record:** `decisions/ADR-0023-requirement-led-content-coverage.md`

## Purpose

Record the implementation change required after the AQA Business human review exposed that the Foundation approval path could prove internal consistency without proving complete curriculum and exam coverage.

This work is Foundation-only. It does not generate or govern Learn, Practice or Exam Prep material.

## Failure exposed by the AQA Business review

The Foundation compiler already proved several useful things:

- coverage preserved every governed requirement supplied to the compiler;
- Course Truth contained the canonical node set established by that coverage;
- Exam Truth preserved governed Board Alignment facts; and
- deterministic assurance checked references, fingerprints and cross-artifact consistency.

Those controls answered:

> Did Revision faithfully compile the requirement set it already had?

They did not answer:

> Did Revision capture the complete applicable curriculum and exam requirement set in the first place?

The independent reviewer then received the same internally bounded Foundation artifacts plus source metadata and was instructed not to browse/reconstruct awarding-body source content. The qualified-human package contained the generated Foundation artifacts, but not a separate complete source-to-Foundation reconciliation.

Therefore an omitted specification requirement could disappear upstream and remain invisible through the whole approval chain.

## Existing evidence that was missed

For AQA A-level Business, `content/business/aqa-a-level/SOURCE_AND_COVERAGE.md` already contained a substantially fuller source-and-coverage blueprint, including curriculum areas and exam/quantitative requirements later found missing from the Foundation seed.

The Foundation-native migration did not treat that coverage knowledge (or an equivalent newly derived source map) as an enforced completeness input.

The remediation must fix that migration/control gap rather than merely patch the individual omissions found by the human reviewers.

## New Foundation model

The implementation will expose two explicit maps.

### 1. Curriculum Coverage Map

Conceptual shape:

```text
Curriculum
  Area
    Topic
      Subtopic / requirement
        -> Course Truth node(s)
```

The depth may vary by specification. The important rule is that every applicable lowest-level curriculum requirement is represented and mapped.

Each leaf retains at least:

- stable requirement identity;
- official/source reference;
- hierarchy/path;
- concise governed requirement meaning;
- source references and cohort applicability;
- Course Truth node reference(s); and
- coverage status / explicit limitation where applicable.

A parent topic cannot be marked complete solely because some child content exists.

### 2. Exam Coverage Map

Conceptual shape:

```text
Qualification
  Paper / component
    Structure / assessment / marking requirement
      -> Exam Truth artifact/field(s)
```

This covers, where applicable:

- component/paper structure;
- compulsory/optional rules;
- marks, timing and weighting;
- question/response structure;
- assessment objectives and demands;
- quantitative/practical/synoptic/source requirements;
- response expectations;
- marking/rubric principles;
- valid alternative reasoning behaviour; and
- explicit pre-calibration boundaries.

Every applicable requirement must map to Board Alignment, Assessment Blueprint, Question Family or other governed Exam Truth representation.

## Completeness gate

A Foundation cannot claim complete Course Truth or Exam Truth unless:

- zero applicable curriculum leaves are unmapped to Course Truth; and
- zero applicable exam/marking requirements are unmapped to Exam Truth.

There is no configured target number of topics, subtopics, Course Truth nodes or exam requirements. Their count follows the course specification and cohort.

Official numeric assessment facts remain enforceable because they are requirements themselves.

## Reusable deterministic guard

`src/content-factory/requirement-led-coverage.ts` is the first reusable implementation piece. It provides fail-closed source-requirement-to-semantic reconciliation without encoding an expected count.

The implementation should evolve so that the retained curriculum hierarchy can be rendered for assurance/review while the deterministic gate operates on its applicable leaf requirements.

A parallel Exam Truth reconciliation boundary must perform the same function for assessment/marking requirements.

The guard must never derive its complete requirement set by reflecting the semantic seed being validated.

## Assurance integration

### Deterministic assurance

Deterministic Foundation assurance must receive the two maps and check that all applicable mappings resolve to the exact retained Foundation artifacts/fingerprints.

### Fresh-context independent review

Independent review must receive the two source-led maps, not merely Revision's generated artifact set. Its job includes challenging whether the curriculum/exam interpretation is sufficient for the stated course/cohort.

### Qualified-human approval pack

The portable human-review package must include the exact maps and their mappings.

The intended reviewer experience is simple:

```text
Curriculum coverage
  3.1 ...                            COVERED
    3.1.x ...                        COVERED -> Course Truth ...
    3.1.y ...                        COVERED -> Course Truth ...
  3.2 ...                            COVERED
    ...

Exam coverage
  Paper 1
    total marks/timing               COVERED -> Board Alignment ...
    response structure               COVERED -> Exam Truth ...
    marking/assessment requirement   COVERED -> ...
  Paper 2
    ...
```

Any missing/partial line prevents the package being presented as approval-ready.

The human can then focus on whether the mappings are correct, accurate, sufficiently deep and assessment-authentic rather than having to discover omitted syllabus lines from scratch.

## AQA 7132 remediation sequence

Before another AQA 7132 / 2027 Foundation goes to qualified-human review:

1. use the correct cohort-specific authoritative sources plus retained valid source/coverage evidence;
2. construct the complete curriculum hierarchy;
3. construct the complete exam/marking requirement map;
4. reconcile both maps against the current Foundation seed/artifacts;
5. correct every exposed omission, contradiction or unsupported restriction;
6. compile a fresh Foundation Candidate/fingerprint;
7. run deterministic assurance with both maps;
8. run fresh-context independent review with both maps; and
9. package both maps with the exact Foundation for qualified-human review.

No learner-facing assets are produced in this sequence.

## Documentation impact

The normative clarification is recorded in `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md` and ADR-0023.

Historical ADRs and retained proof artifacts are not rewritten. The current Foundation technical documentation and expert-review packaging documentation must be updated as the two-map boundary is implemented.

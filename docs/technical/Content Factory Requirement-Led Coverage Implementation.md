# Content Factory Foundation Curriculum and Exam Coverage Implementation

**Status:** Draft implementation on `fix/content-factory-requirement-led-coverage`  
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

The independent reviewer then received the same internally bounded Foundation artifacts plus source metadata and was instructed not to browse/reconstruct awarding-body source content. The qualified-human package contained the generated Foundation artifacts, but not an explicit complete source-to-Foundation reconciliation.

Therefore an omitted specification requirement could disappear upstream and remain invisible through the whole approval chain.

## Existing evidence that was missed

For AQA A-level Business, `content/business/aqa-a-level/SOURCE_AND_COVERAGE.md` already contained a substantially fuller source-and-coverage blueprint, including curriculum areas and exam/quantitative requirements later found missing from the Foundation seed.

The Foundation-native migration did not treat that coverage knowledge, or an equivalent newly derived source map, as an enforced completeness input.

The remediation fixes that migration/control gap rather than merely patching the individual omissions found by the human reviewers.

## Foundation coverage model

The implementation uses two source-led reconciliations.

### 1. Curriculum Coverage Map

Conceptual shape:

```text
Curriculum
  Area
    Topic
      Subtopic / requirement
        -> governed semantic item(s)
        -> canonical Course Truth node(s)
```

The depth may vary by specification. The important rule is that every applicable lowest-level curriculum requirement is represented and mapped.

Each source obligation retains stable identity, official/source reference, hierarchy/path, concise governed requirement meaning, source references, semantic mapping and mechanically checkable named scope where appropriate.

A parent topic cannot be marked complete solely because some child content exists.

For AQA 7132 / 2027, `src/content-factory/source-seeds/aqa-a-level-business-7132-2027-coverage.ts` defines the source-led curriculum universe independently of the semantic seed. The remediated seed then uses matching stable requirement IDs and is deterministically reconciled against that external universe before Foundation coverage may compile.

### 2. Exam Coverage Map

Conceptual shape:

```text
Qualification
  Paper / component
    Structure / assessment requirement
      -> Board Alignment / Assessment Blueprint / Question Family evidence
```

`src/content-factory/source-seeds/aqa-a-level-business-7132-2027-exam-coverage.ts` records the current AQA 7132 / 2027 exam obligations used by the compiler guard, including:

- all content assessable across all three papers;
- Paper 1 2-hour / 100-mark / 15-MCQ / 35-short-answer / two selected 25-mark essay structure;
- an explicit 9-mark analyse response family from current governed AQA assessment evidence;
- Paper 2 2-hour / 100-mark / three compulsory approximately-33-mark data-response structure with three or four parts per question;
- Paper 3 2-hour / 100-mark / one case study / approximately-six-question structure;
- current overall AO ranges;
- the overall quantitative minimum; and
- the existing ADR-0022 pre-calibration boundary that prevents unsupported exact Paper 2/Paper 3 constituent mark/timing invention.

The AQA compiler guard normalises compiler-owned Exam Truth facts where they are externally governed, adds the explicit Paper 1 9-mark family, preserves aggregate-only Paper 2/Paper 3 pre-calibration rules, then fails closed if the source-led Exam Coverage Map does not reconcile to the resulting Exam Truth evidence.

## Completeness gate

A Foundation cannot claim complete Course Truth or Exam Truth unless:

- zero applicable curriculum leaves are unmapped to governed semantics/Course Truth; and
- zero applicable exam requirements are unmapped to Exam Truth evidence.

There is no configured target number of topics, subtopics, Course Truth nodes or exam requirements. Their count follows the course specification and cohort.

Official numeric assessment facts remain enforceable because they are requirements themselves.

## Reusable deterministic guard

`src/content-factory/requirement-led-coverage.ts` contains the reusable fail-closed reconciliation primitives for both Course Truth and Exam Truth.

For curriculum coverage it validates that every source obligation maps to governed semantic items, that mappings resolve, and that high-risk named scope/boundaries recorded by the source-led profile remain present in the semantic seed.

For exam coverage it validates that every source-led assessment obligation maps to retained Exam Truth evidence and that mechanically checkable required scope is present.

Neither map derives its complete requirement set by reflecting the Foundation seed or generated Exam Truth being validated.

## AQA compiler integration

`src/content-factory/foundation-precalibration-assembly.ts` is now the AQA 7132 profile guard for both:

1. source-led curriculum reconciliation before Foundation coverage is accepted; and
2. source-led Exam Truth normalisation/reconciliation before Question Families are persisted.

This retains the prior no-invention protection. The model still cannot broaden Course Truth from memory; instead the governed semantic seed must first prove that it satisfies the independently established curriculum denominator.

## Assurance and approval-pack integration

The corrected Foundation coverage model is no longer a self-defined list of broad seed topics: for AQA it is compiled only after exact reconciliation to the source-led requirement universe, and its stable official references/leaf requirements remain part of the resolved human-review artifact set.

`src/content-factory/foundation-expert-review-packaging.ts` now explicitly tells the qualified reviewer not to treat deterministic/AI PASS as proof that the requirement universe is correct. The reviewer must challenge:

- whether the Foundation coverage requirement set itself covers the complete applicable curriculum for the cohort;
- whether Course Truth satisfies those requirements accurately and at sufficient depth;
- whether Exam Truth covers the applicable assessment specification and current governed exam evidence; and
- whether any applicable requirement is absent from the reconciliation.

A missing curriculum or exam requirement is itself a Foundation defect and requires `fail_hold` when material.

Fresh-context independent review continues to inspect the exact coverage model, Board Alignment, Course Truth, Assessment Blueprint and Question Families through the artifact index. A subsequent hardening step must ensure any post-review remediation cannot bypass the source-led coverage invariant before deterministic re-assurance; PR #318 remains draft until that path is proven.

## AQA 7132 remediation sequence

Before another AQA 7132 / 2027 Foundation goes to qualified-human review:

1. use the correct cohort-specific authoritative sources plus retained valid source/coverage evidence;
2. reconcile the complete curriculum hierarchy against the governed semantic seed;
3. reconcile the complete exam requirement map against compiler-owned Exam Truth and Question Families;
4. correct every exposed omission, contradiction or unsupported restriction;
5. compile a fresh Foundation Candidate/fingerprint;
6. run deterministic assurance and fresh-context independent review on the corrected exact fingerprint;
7. prove remediation/re-assurance cannot bypass the source-led coverage checks; and
8. package the corrected exact Foundation for qualified-human review under the strengthened review instructions.

No learner-facing assets are produced in this sequence.

## Documentation impact

The normative clarification is recorded in `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md` and ADR-0023.

Historical ADRs and retained proof artifacts are not rewritten. `docs/technical/Content Factory Foundation Expert Review Contract.md` is updated in this branch to record that the historical retained AQA package remains evidence of the earlier implementation state and cannot be used to approve the corrected Foundation.
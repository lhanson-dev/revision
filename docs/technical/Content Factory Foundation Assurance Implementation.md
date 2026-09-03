# Content Factory Foundation Assurance Implementation

**Status:** Slice 3A implementation record — PR #295  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Implementation plan:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`

## Purpose

Implement the assurance side of the Foundation Factory without importing the superseded end-to-end Content Factory assurance topology.

The governing sequence remains:

`Course Truth + Exam Truth → deterministic Foundation assurance → fresh-context independent Foundation review/remediation → qualified expert review → foundation_approved`

No learner-facing asset factory may begin from this assurance path until the exact Foundation version reaches `foundation_approved`.

## Slice 3 decomposition

Slice 3 is deliberately split into short governed increments:

1. **Slice 3A — deterministic Foundation assurance** — PR #295.
2. **Slice 3B — fresh-context independent Foundation review and targeted remediation.**
3. **Slice 3C — qualified expert-review package, approval evidence and immutable Approved Course Foundation persistence.**

This keeps deterministic structure checking separate from educational judgement and human approval.

## Slice 3A implementation

`src/content-factory/foundation-assurance.ts` introduces a Foundation-native deterministic assurance engine.

It accepts only a complete Foundation Candidate in the canonical `assuring` lifecycle state and re-reads the exact persisted artifacts referenced by that candidate:

- Source Licence Register;
- Board Alignment;
- Foundation coverage model;
- Course Knowledge Model / Course Truth;
- Assessment Blueprint / Exam Truth; and
- Question Families.

The engine then performs mechanically provable checks across the complete dependency set.

### Exact artifact identity

Assurance recomputes material fingerprints and compares them with the exact fingerprints frozen into the Foundation Candidate.

The Source Licence Register retains its existing material-identity rule: `checkedAt` revalidation timestamps are audit metadata and do not create a new Foundation identity by themselves. Material source/right changes still change the fingerprint.

### Source-rights checks

The deterministic layer fails closed when a persisted source is `PROHIBITED` or `UNKNOWN`, or when a `REFERENCE_ONLY` source is incorrectly permitted for generative AI input.

Curriculum coverage and Course Truth source references must resolve only to sources whose use class and commercial-derivation permissions allow curriculum truth.

### Board Alignment checks

Deterministic assurance verifies that Board Alignment:

- belongs to the exact Foundation job;
- preserves the exact candidate course identity and cohort;
- remains verified;
- references admissible sources; and
- does not contain assessment requirements pointing at unknown components.

### Coverage and Course Truth checks

The assurance engine verifies that:

- Foundation coverage belongs to the exact job/source set;
- every requirement remains complete;
- curriculum source references remain rights-safe;
- component references remain valid;
- Course Truth contains exactly the canonical node set established by coverage;
- every Course Truth node retains governed source traceability; and
- Board Alignment references remain resolvable.

### Exam Truth and Question Family checks

The assurance engine verifies that Exam Truth:

- binds to the exact Board Alignment and Course Truth fingerprints;
- preserves the governed component set, marks and timings;
- preserves assessment objectives and assessment requirements; and
- is satisfied by the exact persisted Question Family set.

Question Families are checked against valid component and assessment-objective IDs.

## Complete diagnostics

Deterministic assurance does not stop at the first material problem where the remaining checks can safely continue. It retains one structured report containing all detected deterministic failures.

This follows the existing Content Factory lesson that complete deterministic diagnostics are more useful than repeated one-defect-at-a-time repair cycles.

If a required artifact cannot be read or parsed, the load failure is recorded as blocking evidence and dependent checks are marked not applicable rather than inventing confidence.

## Evidence binding

A successful or failed deterministic assurance report records:

- exact Foundation job/candidate;
- exact reviewed repository commit;
- exact aggregate Foundation fingerprint;
- all deterministic checks and evidence; and
- a pass/fail decision mechanically consistent with those checks.

The report is persisted as `foundation_deterministic_assurance_report` evidence and the existing Foundation lifecycle records only that evidence reference plus the exact Foundation fingerprint.

A stale report for another Foundation fingerprint cannot satisfy the existing lifecycle approval guard.

## Regression assurance

`src/content-factory/foundation-assurance.test.ts` proves that:

- a coherent Foundation Candidate passes deterministic assurance;
- the report and lifecycle evidence bind to the exact Foundation fingerprint;
- timestamp-only source-rights revalidation does not create a false material mismatch;
- simultaneous persisted-artifact, Course Truth and Question Family defects are all surfaced in one deterministic report; and
- deterministic failure prevents transition to expert review.

## Explicit non-scope

Slice 3A does **not**:

- claim qualified-human curriculum completeness;
- perform fresh-context AI/independent educational review;
- remediate Course Truth or Exam Truth;
- create or approve an expert-review package;
- produce `foundation_approved`;
- generate Learn, Practice, assessment items, Exam Prep, mocks or Marking Packs; or
- publish learner content.

## Next increment

After Slice 3A is released and production-verified, Slice 3B should add a Foundation-native fresh-context independent review contract and the smallest-safe remediation/re-assurance loop. It must remain bound to the exact Foundation fingerprint and must not reuse generation context as review context.

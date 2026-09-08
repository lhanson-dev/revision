# Content Factory Foundation Assurance Implementation

**Status:** Current Foundation assurance implementation; AQA 7132 / 2027 is `FAIL HOLD` pending replacement proof after curriculum-reconciliation and semantic-retention remediation  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`  
**Implementation plan:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`

## Purpose

Implement the assurance side of the Foundation Factory without importing the superseded end-to-end Content Factory assurance topology.

The current governed assurance sequence is:

`Course Truth + Exam Truth → deterministic Foundation assurance → fresh-context independent Foundation review/remediation → fresh external-source challenge → qualified expert review → foundation_approved`

No learner-facing asset factory may begin until the exact Foundation version reaches `foundation_approved`.

## Foundation deterministic assurance

`src/content-factory/foundation-assurance.ts` is the Foundation-native deterministic assurance engine.

It accepts a complete Foundation Candidate in the canonical `assuring` state and re-reads the exact persisted artifacts referenced by that candidate:

- Source Licence Register;
- Board Alignment;
- Foundation coverage model;
- Course Knowledge Model / Course Truth;
- Assessment Blueprint / Exam Truth; and
- Question Families.

The engine performs mechanically provable checks across the dependency set, including material fingerprints, source-rights safety, exact course/cohort/alignment, Foundation coverage, Course Truth traceability, Exam Truth binding and Question Family validity.

A `foundation_deterministic_assurance_report` records the exact job/candidate, reviewed repository commit, aggregate Foundation fingerprint, all checks/evidence and a mechanically consistent pass/fail decision. A stale report for another Foundation fingerprint cannot satisfy the lifecycle gate.

## Course Truth semantic-retention assurance

The 7 September 2026 external-source challenge exposed a defect that structural node equality did not detect: governed curriculum semantics could contain required named scope while the final generated Course Truth silently dropped it.

The corrected implementation adds a separate deterministic check:

`course-truth-semantic-retention`

The supporting implementation is split deliberately:

- `requirement-led-coverage.ts` contains the portable `assertCourseTruthRequiredScopeRetention` control;
- the applicable source-led requirement profile defines mechanically checkable named scope;
- the governed semantic seed defines canonical node mappings; and
- the final Course Truth node evidence is checked across summaries, formulas, misconceptions and application contexts.

The check does not require generated prose to copy semantic-seed wording. It requires material named curriculum scope and boundaries to survive the generative step.

For the current AQA A-level Business 7132 / 2027 profile, `foundation-aqa7132-curriculum-retention.ts` binds the portable control to the reconciled AQA source-led curriculum profile and Revision-owned semantic seed. A missing required term or canonical node is a **material deterministic failure**.

The same invariant is applied before fresh independent review and to remediated Course Truth before a remediation result is accepted. Material remediation must still create a new Candidate/fingerprint and pass deterministic re-assurance before fresh re-review.

## Fresh-context independent review and remediation

`foundation-independent-review.ts` provides provider-neutral independent review, finding classification, targeted remediation and deterministic re-assurance.

The review context must be independent from Foundation generation and all prior review/remediation contexts. Candidate provenance retains the relevant context IDs without making them part of material educational identity.

Blocking or material findings require `fail_hold`. Minor findings remain retained limitations rather than disappearing.

Material remediation remains restricted to the smallest safe dependency closure:

- Course Truth finding → Course Truth plus dependent Exam Truth and all affected Question Families;
- Exam Truth finding → Exam Truth plus dependent Question Families;
- Question Family finding → affected family only;
- Source Rights, Board Alignment or Foundation coverage finding → stop and reopen governed compilation rather than allowing the remediation model to rewrite the denominator.

Every material correction creates a new candidate/fingerprint and must pass deterministic re-assurance before another fresh independent review.

The AQA source-led review guard additionally rechecks the source universe, requirement-led curriculum coverage, final Course Truth semantic retention and exam coverage before accepting review/remediation provider work.

## External-source challenge

Internal deterministic and independent-review PASS evidence does not prove that Revision's own source or requirement universe is complete.

Before a Foundation can be described as ready for qualified expert review, the separate external-source challenge must use a genuinely fresh context and current permitted official/authoritative sources to test for:

- omitted material source categories/resources;
- missing or narrowed curriculum scope;
- missing quantitative/exam scope;
- stale or superseded requirements; and
- explicit factual contradictions that should have been detectable before human review.

A blocking/material finding returns `fail_hold`. `foundation-expert-review.ts` rejects an expert-review package if the external challenge is absent, stale, context-contaminated, source-incomplete or not `pass`.

## Current AQA 7132 / 2027 position

Historical deterministic assurance and fresh independent review both passed Foundation fingerprint:

`0d90fccdca657fc1d9dae0e16b663071fc08bdcec3323f3a95fa24e36242380e`

The subsequent fresh external-source challenge returned `fail_hold` after finding material curriculum-scope defects in the requirement universe and final Course Truth retention. Those earlier PASS results remain historically true for the checks that ran; they do not override the later challenge and do not permit progression to qualified expert review.

The failed fingerprint must not be patched or reused for approval.

The current remediation is documented in:

`docs/technical/Content Factory Foundation Curriculum Reconciliation and Semantic Retention.md`

After release to approved `main`, a fresh Foundation Candidate/fingerprint must be compiled and the complete chain rerun:

1. live Foundation compilation/proof;
2. deterministic assurance, including semantic retention;
3. fresh-context independent review;
4. guarded remediation and re-assurance/re-review if required;
5. fresh external-source challenge; and
6. only then qualified expert review packaging.

## Regression assurance

The current regression set proves, at minimum:

- source-led curriculum obligations cannot silently lose their semantic mappings;
- required named scope cannot silently disappear from the governed semantic input;
- final Course Truth cannot silently drop governed named scope while retaining the same canonical node IDs;
- the observed 3.3.4 social-media / viral-marketing / multi-channel loss fails deterministic retention;
- corrected 3.2.2, 3.3.4 and 3.6.1 scope remains locked in the current AQA seed/profile;
- deterministic assurance remains exact-fingerprint bound;
- fresh review context separation remains enforced; and
- upstream denominator findings cannot be locally rewritten by remediation.

Repository CI remains the integration authority for the exact PR head.

## Historical implementation lineage

The following releases remain historical implementation evidence and are not rewritten by this correction:

- PR #295 — initial Foundation deterministic assurance;
- PR #296 — retained real-course deterministic proof path;
- PR #298 and subsequent Slice 3B hardening — fresh-context independent review/remediation; and
- later source-led coverage/source-universe/expert-packaging hardening recorded on Issue #289 and their associated ADRs/technical records.

The current semantic-retention correction extends those controls because the external-source challenge proved that structural consistency alone was not a sufficient completeness guarantee.

## Documentation impact

No normative authority change is required for this remediation. Existing authority already requires complete Course Truth, an independently established requirement/source universe, fail-closed assurance and a passing external-source challenge before qualified expert review readiness.

Historical evidence remains unchanged. Current technical documentation must describe the replacement proof chain rather than treating the failed fingerprint as expert-review ready.

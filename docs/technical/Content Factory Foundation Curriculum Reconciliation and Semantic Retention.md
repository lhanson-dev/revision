# Content Factory Foundation Curriculum Reconciliation and Semantic Retention

**Status:** Current remediation for Issue #289 external-source challenge `fail_hold`  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`  
**Superseded candidate:** Foundation fingerprint `0d90fccdca657fc1d9dae0e16b663071fc08bdcec3323f3a95fa24e36242380e` must not progress to qualified expert review.

## Purpose

Correct the implementation defects exposed by the fresh external-source challenge of AQA A-level Business 7132 for the 2027 cohort without changing normative Foundation authority.

The challenge proved two distinct failure modes:

1. the source-led curriculum denominator and governed semantic seed omitted explicit current examinable scope; and
2. final generated Course Truth could silently narrow named scope that the governed semantic input already contained.

A structurally complete Foundation is therefore insufficient unless the independent requirement universe is complete and material named scope survives the generative boundary.

## Full current-specification reconciliation

The AQA 7132 / 2027 source-led curriculum profile and Revision-owned semantic seed were rechecked across the current outgoing subject-content hierarchy, including sections 3.1 through 3.10 and the existing quantitative boundary.

The reconciliation corrects the reported omissions and additional explicit scope exposed by the complete pass. Material corrections include:

- 3.2.2 — external environment including competition as an influence on decision making;
- 3.3.4 — product-life-cycle extension strategies and influences on/value of new product development;
- 3.6.1 — alignment of employee and employer values;
- explicit value/difficulty/influence relationships where the previous seed named the topic but under-described the examinable relationship, including operational efficiency/lean production, financial analysis, organisational design, strategic position, innovation, globalisation and change; and
- current named method/scope wording needed for deterministic retention checks.

The semantic-seed schema remains version 3 because the data shape has not changed. Its material content changes, so the compiled Course Truth/coverage artifacts and aggregate Foundation fingerprint must change even though the schema version remains stable. Any newly compiled Foundation Candidate therefore receives a new aggregate Foundation fingerprint.

## Deterministic semantic-retention control

`src/content-factory/requirement-led-coverage.ts` now separates two proofs:

1. **requirement-led semantic reconciliation** — every source-led curriculum obligation maps to governed semantic input and contains its mechanically checkable named scope; and
2. **final Course Truth retention** — every canonical node mapped from those obligations must still contain the same named scope after generation.

`assertCourseTruthRequiredScopeRetention` checks final Course Truth across the node summary, formulas, misconceptions and application contexts. It does not require generated prose to reproduce the seed verbatim; it requires retention of the governed named concepts and boundaries.

For AQA 7132 / 2027, `foundation-aqa7132-curriculum-retention.ts` binds the generic retention control to the current source-led curriculum profile and governed semantic seed.

`foundation-assurance.ts` adds a material deterministic check named:

`course-truth-semantic-retention`

For the exact AQA 7132 / 2027 profile, the check fails if final Course Truth drops a governed required term or canonical node. This means structural Course Truth/coverage equality can no longer produce a deterministic PASS when material named curriculum scope has disappeared.

The AQA fresh-context review/remediation guard applies the same retention invariant before independent review and again to any remediated Course Truth before the result can be accepted. Deterministic re-assurance remains mandatory after material remediation.

## Regression evidence

Requirement-led coverage tests now prove:

- the fully reconciled governed seed maps to the complete source-led requirement profile;
- missing source requirements fail closed;
- missing named scope in the semantic seed fails closed;
- a faithful final Course Truth retains the complete mechanically checkable scope;
- the previously observed 3.3.4 loss of social media / viral marketing / multi-channel distribution fails at final Course Truth retention; and
- the corrected high-risk terms, including extension strategies, new product development, external environment including competition and alignment of employee/employer values, remain locked in the governed seed.

The AQA qualification-specific retention regressions additionally prove that the original governed 3.0 wording passes, the exact retained live paraphrase passes, true loss of varied-context scope fails, true loss of functional interrelationship fails, contradictory wording that treats functions as isolated fails, and the historical 3.3.4 / 3.6.1 omission modes remain blocked.

The repository CI remains the integration authority for typecheck, unit/regression and wider governed assurance on the PR head.

## Replacement proof #1 deterministic finding

After the curriculum reconciliation release, Foundation Live Proof run `34275826891` compiled a genuinely new AQA 7132 / 2027 Candidate on approved `main` commit `a553416a1c4c741fd9a3a2f4f5e307e8c06270de`. The retained live artifact is `10075741986` and the new Foundation fingerprint is `d8923a6779facfa14f796d2a11e2df50542d37ba7fada02285a27d5096cfd813`.

Deterministic assurance run `34276705426` correctly failed closed with 20 checks total and one material failure:

`missing_required_course_truth_scope:aqa-3-0-course-context:varied business contexts`

Inspection of the exact retained Course Truth node showed that the curriculum concept had **not** been dropped. Node `aqa-3-0-course-context.k01` states that business analysis applies ideas "across varied contexts" and then retains the remaining course-wide scope. The current AQA 3.0 subject-content requirement is that students study business in a variety of contexts. The failed check therefore exposed an over-specific qualification retention anchor rather than a missing curriculum concept.

PR #337 kept the shared deterministic matcher strict and added one qualification-specific bounded equivalent for this wording: the governed `varied business contexts` anchor could alternatively be proven by requiring both `business` and `varied contexts`. The failed assurance run remains historical evidence and must not be reclassified as passing.

## Replacement proof #2 deterministic finding

After PR #337 was released to approved `main` commit `322923823dfc1077bd64fff4b78999418574074a`, deterministic assurance was rerun against the **same retained Candidate**, live artifact `10075741986` and Foundation fingerprint `d8923a6779facfa14f796d2a11e2df50542d37ba7fada02285a27d5096cfd813` without regeneration.

Assurance run `34319393013` again failed closed with 20 checks total and one material failure:

`missing_required_course_truth_scope:aqa-3-0-course-context:interrelated`

All source-proof identity and artifact-binding checks passed before the deterministic assurance stage. Inspection of the exact retained node shows the relationship was retained: it says business analysis "connects functional decisions rather than treating functions as isolated." The governed seed expresses the same course-wide requirement as analysing "interrelated functional decisions rather than isolated silos." This is therefore a second over-specific wording anchor on the same AQA 3.0 obligation, not evidence that the retained Candidate dropped the relationship between business functions.

The follow-on correction still leaves `assertCourseTruthRequiredScopeRetention` unchanged and strict. Only the AQA 7132 / 2027 course-context wrapper may try a finite set of qualification-specific alternatives. The original governed terms remain the first accepted form. The already approved varied-context alternative remains bounded to `business` plus `varied contexts`. The new interrelationship alternative requires **both** `connects functional decisions` and `rather than treating functions as isolated`, preserving the positive relationship and the explicit rejection of siloed treatment. The wrapper tries only the finite combinations of those two known wording alternatives and rethrows any failure outside those exact course-context anchors. No fuzzy matching, stemming, model judgement or generic relaxation is introduced.

A negative regression deliberately uses wording that says it "connects functional decisions but treats functions as isolated" and must fail. This prevents the alternative from passing merely because a few related words are present while the substantive relationship is reversed.

Assurance run `34319393013` and artifact `10091270939` remain historical failed evidence. They must not be rewritten or treated as passing after remediation.

## Required new proof chain

The failed retained fingerprint `0d90fccdca657fc1d9dae0e16b663071fc08bdcec3323f3a95fa24e36242380e` is historical evidence and must not be patched or reused for approval.

The replacement fingerprint `d8923a6779facfa14f796d2a11e2df50542d37ba7fada02285a27d5096cfd813` also remains blocked until the complete qualification-specific course-context retention correction is released and deterministic assurance passes against the exact retained Candidate.

The required sequence is now:

1. release the complete bounded AQA 3.0 course-context retention correction to approved `main`;
2. rerun deterministic Foundation assurance against exact retained live artifact `10075741986` and fingerprint `d8923a6779facfa14f796d2a11e2df50542d37ba7fada02285a27d5096cfd813` without regeneration;
3. if deterministic assurance passes, run fresh-context independent Foundation review;
4. remediate any blocking/material findings through the guarded path and rerun deterministic assurance plus fresh review;
5. run a genuinely fresh external-source challenge against the resulting exact fingerprint; and
6. only if every prior gate passes, assemble the qualified expert-review package and obtain qualified subject/assessment review.

No learner-facing Learn, Practice or Exam Prep asset may start before the later exact Foundation version becomes `foundation_approved`.

## Documentation impact

No new normative authority is required. The remediation implements the existing Foundation completeness and external-challenge rules.

Historical live-proof, deterministic-review, independent-review and external-challenge evidence remains unchanged. This document records the current implementation state and required replacement proof chain; it does not rewrite any failed candidate or failed assurance run as passing.

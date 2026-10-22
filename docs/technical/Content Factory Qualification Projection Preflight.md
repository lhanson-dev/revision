# Qualification projection preflight — internal structural checker

**Implementation status:** Candidate only in the content-production repeatability PR, not yet merged into approved `main`  
**Canonical product runtime:** existing signed-in `/app/` and `src/engine/content/content-adapter.ts` fed by `content/**/index.ts`; this candidate adds **no** learner route, entry point, content pack, or runtime publication integration.  
**Governing sources:** `80-company-workflows/Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`, `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`, `80-company-workflows/Content Accuracy Assurance Gate.md`, `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`.  
**Preceding experimental evidence:** draft PR #659, `audits/2026-10-22-content-production-repeatability-baseline.md`, and `research/content-production-repeatability/BOARD-SHAPE-TRIAL-2026-10-22.md`. Those files are not in `main` at this candidate's starting point.

## Problem and restricted scope

The existing `contentPackSchema` correctly catches schema defects, exam timing/marks mismatches, non-course topics and some optional-question arithmetic. It cannot alone prove that an authored learner pack preserves **exact qualification/cohort Exam Truth**: a valid topic may belong to a different paper, raw marks do not express weighting, tier eligibility is not in the learner manifest, and an apparently good mark total cannot show required practical assessment coverage.

This small checker is a **pre-production structural validator**, not a new canonical source of Exam Truth, independent educational assurance, provenance or approval.

- `src/content-factory/qualification-projection-preflight.ts` exports a pure `checkQualificationProjection` function and typed input/output.
- An upstream, independently reconciled structured course/cohort profile supplies expected component identities, paper marks/durations, qualification weightings, exam-topic eligibility and any applicable specialist obligations.
- Candidate packs are the exact ordinary typed `ContentPack` records that could be passed to the existing learner adapter.
- The checker returns `pass` or `hold` with stable diagnostic codes; it does not write, approve or publish anything.
- There are **no** provider calls, external source ingestion, source material transformations, extra dependencies or invented new learning assets.

## What it checks

1. Exact cohort/subject/qualification/board/specification match across candidate packs.
2. Expected distinct components present once, no extra papers or duplicate projected candidates.
3. Declared paper ID, number, raw mark total and duration match the expected profile and actual candidate.
4. Sum of qualification component weights equals 100%, and each pre-production candidate **sidecar** explicitly carries the correct per-paper weight (rather than silently dropping it); weights may be unequal even if all raw papers are 100 marks.
5. Each mock exam question topic belongs to the explicit eligible topic set for **that paper**, not merely to the shared subject/course topics.
6. Missing component topic-scope information fails closed instead of being silently accepted.
7. The existing ordinary learner manifest cannot prove GCSE tier/variant publication identity: any profile requiring one receives `variant_projection_unsupported`. It must not claim GCSE release readiness.
8. A pre-released component can require a matching exact-cohort external evidence-reference identifier; source authenticity and currency must be checked independently.
9. If a governed exact-paper rule specifies a minimum number of practical-assessment marks, candidates must explicitly attribute existing mock question IDs with sufficient nonduplicated marks. Optional-choice exams receive `practical_choice_arithmetic_unproven`, not a sum of all printed alternative marks.
10. Structural input errors (invalid weights, wrong durations, empty identity) produce HOLD.

## What it deliberately cannot prove

- That the **Source Universe is complete**, that the real specification/cohort alignment is correct, or that a source is permitted for AI use.
- That question wording and practical-attribution tags are educationally correct; tags are merely structured evidence locators and require independent A3 review.
- That **a whole qualification's practical-mark assessment percentage** is met by its actual external awarding-body papers. A minimum in the profile is an explicit representative-paper quality threshold, not automatically the board's whole-qualification rule.
- That a mock's extended-response marking guidance is a valid rubric; A3/A4 independent and qualified review remain separate.
- That `qualificationWeightPercent` is consumed by the learner planner or progress presentation. It is retained in a **pre-production sidecar**, not the ordinary learner content manifest. This checker checks the structural sidecar/expected-assessment contract only and cannot replace downstream publication or behaviour tests.
- That a GCSE tier is navigable or eligible in the student app. A required variant intentionally holds, pending a separate generic publication/evidence design.
- That a successful structural `pass` authorises `available` or waives `ai_assured`/`foundation_approved`, explicit Founder PR approval, exact-head release, qualified educational review, or the conditional restricted-pilot exception.
- That the profile itself was independently sourced, licensed and approved. This helper assumes that external upstream validation is separately proven and must not be used as self-certified source truth.

## Tests and risk classification

`src/content-factory/qualification-projection-preflight.test.ts` uses synthetic, planned-only examples:

- positive example: three original fictional 100-mark papers with 35/35/30 percentage weightings; missing and wrong projected per-paper weights;
- missing/duplicate/extra papers, incorrect cohort, marks/duration, bad component weighting;
- out-of-paper topic even when it belongs to the overall course;
- omitted paper-topic scope;
- GCSE variant identity deliberately held as unsupported;
- pre-release context reference missing/mismatched and matched;
- absent/unknown/duplicate/insufficient practical-question links;
- practical mark calculations with alternative answers fail closed;
- malformed expected course facts.

CI has no paid source or provider workflow. The production-level risk is **low while this is unused internal code**; wiring it as a release gate later requires a separate governed change with source and configuration provenance, and relevant content/learner/assurance regression checks. All optional new profile fields must be proven from governed exact Course/Exam Truth, never inferred from candidate learner assets.

## Follow-up after passing this proof

1. Complete PR #659 (audit and negative qualification-shape proof), including its exact-head CI, and reconcile its acceptance findings with this independent PR before promotion.
2. Identify canonical structured Exam Truth evidence for one current approved course; prove an exact input/profile adapter can be derived without using learners' generated questions to establish the expected requirements.
3. Define genuine generic variant publication identity with correct course/topic/evidence handling for tiered GCSE courses; don't insert course-specific UI conditions.
4. Wire the checker to a pre-publication step only once source-universe and human/external assurance boundaries are understood, and confirm failure cannot be bypassed by a syntactically valid self-authored profile.
5. Measure actual time, repeat-generation avoidance and manual remediation when a real second-board Business and GCSE course are attempted.

## Documentation impact

This candidate adds isolated testable implementation and this technical record. It does not alter normative authority, learner runtime, launch status or historical experimental evidence. Any later decision to make this an authoritative pre-publication requirement must update the applicable `80-company-workflows/` source in a Founder-approved PR with matching technical/code changes. The `INDEX.md` pointer is included in the same candidate.

# Content Factory AQA Business 7132 Course and Exam Truth Preparation

**Status:** Research preparation only — not approved Course Truth or Exam Truth  
**Updated:** 28 September 2026  
**Base main:** `1ca6569f888f0467f0c952f7448f50f16812033d`  
**Pending dependency:** Business Subject Foundation v0.7 targeted reassurance for `BUS-FIN-008`

## Purpose

Prepare the deterministic exact-course projection and assessment denominator while the single v0.7 Subject Foundation reassurance gate is pending, so a PASS can move directly into governed Course Truth + Exam Truth production without repeating discovery.

This preparation does not bypass the sequence in `Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`. Nothing in this branch is learner truth or release eligible before the v0.7 dependency passes and the exact-course assurance gates run.

## Course Truth preparation

`research/aqa-business-7132/2027/COURSE_TRUTH_PREPARATION.mjs` deterministically projects the merged 42-section AQA 7132 specification map into 42 stable candidate Course Truth records.

Current state:

- 42 / 42 lowest-level mapped sections represented;
- every section retains its Business Subject Foundation node IDs;
- exact AQA course-specific facets and quantitative methods remain explicit;
- AQA wording remains reference/alignment evidence rather than reusable teaching truth;
- only `AQA-7132-3.1.2` is blocked, solely because the v0.7 `BUS-FIN-008` reassurance result has not yet been retained.

Required v0.7 fingerprint:

`64c072f188e3581a60787bd6a5556e4ac9ebf097434c6caf42a60d5598f61c53`

## Exam Truth preparation

`research/aqa-business-7132/2027/EXAM_TRUTH_PREPARATION.mjs` records rights-safe structured assessment facts from current official AQA pages classified `REFERENCE_ONLY`.

Prepared facts include:

- outgoing 7132 remains the specification for the 2027 exam cohort;
- three compulsory papers: `7132/1`, `7132/2`, `7132/3`;
- each paper is 120 minutes, 100 raw marks and approximately 33.3% of the qualification;
- all three papers may assess the full course;
- Paper 1 objective structure: 15-mark MCQ section, 35 marks of short answers, and two 25-mark essay responses selected from choices;
- Paper 2: three compulsory multi-part data-response questions;
- Paper 3: one compulsory case study followed by approximately six questions;
- AO1–AO4 component and overall weighting ranges;
- linear/same-series qualification rules;
- minimum 10% overall quantitative-skills assessment at at least Level 2 mathematical demand;
- full-course/synoptic and extended-response demand;
- 2027 paper dates for operational cross-checking; and
- a rights-safe structured layer for common AQA Business command-word demands.

No protected AQA question, model answer or mark-scheme prose is retained as generative input.

## Sources and rights

Official AQA specification, at-a-glance, scheme-of-assessment, quantitative-skills, key-dates and Business command-word pages are retained as `REFERENCE_ONLY` alignment sources under the active Source Licensing and Provenance Standard.

The preparation stores structured factual/alignment outputs only. Public availability is not treated as permission to copy or ingest protected material.

## Deterministic assurance

`scripts/assurance/validate-aqa-business-7132-course-exam-truth-preparation.mjs` is designed to fail if, among other things:

- the exact AQA 7132 / 2027 identity changes;
- the v0.7 Foundation fingerprint dependency changes;
- any of the 42 mapped curriculum requirements disappears;
- more than the known v0.7-dependent requirement is blocked;
- paper count, component IDs, duration, raw marks or full-course scope drift;
- the 300-mark total is inconsistent;
- AO1–AO4 coverage is incomplete;
- the 10% quantitative minimum is lost;
- a reference-only AQA source is incorrectly marked for substantial generative ingestion; or
- an assessment requirement has no Exam Truth mapping.

## Remaining work before promotion

1. Run the exact-main v0.7 `BUS-FIN-008` targeted reassurance. A PASS is mandatory.
2. Complete the rights-safe question-family / marking-behaviour denominator from current official assessment evidence. This must record stable assessment behaviour without copying protected questions, example answers or mark-scheme prose.
3. Revalidate the deterministic Course Truth and Exam Truth projections against the retained v0.7 PASS.
4. Run fresh exact-course automated assurance at the smallest safe scope.
5. Package the exact Foundation for the qualified human specialist review required by governance before formal `foundation_approved` / unrestricted publication.

## Cost and reuse rule

No paid model call is required for the preparation in this branch. The merged 42-section mapping, prior Business Foundation assurance and deterministic assessment facts are reused.

Future AI review should be limited to unresolved judgement that deterministic checks cannot establish. A cost boundary remains operational and resumable; it is not an educational FAIL/HOLD.

## Documentation impact

This branch records implementation preparation under existing authority. It does not change normative governance, historical T3/T4 evidence, or publication state. If these schemas become durable production architecture after the v0.7 gate, the corresponding technical architecture/ADR/index documentation must be updated in the governed promotion PR.

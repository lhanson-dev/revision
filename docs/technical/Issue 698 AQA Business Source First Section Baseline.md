# Issue #698 — AQA Business 7132 whole-section source-first audit baseline

**30 October 2026 — candidate evidence, NOT merged or live.** Source: the official 42-page AQA AS/A-level Business 7131/7132 specification, **version 2.0 (June 2023)**, for A-level **7132**. Official reference: https://filestore.aqa.org.uk/resources/business/specifications/AQA-7131-7132-SP-2023.PDF. AQA is **REFERENCE_ONLY**; no protected source page prose or previous examination questions are copied into the learner app.

## Why this package exists

The historical `research/aqa-business-7132/2027/NAMED_ITEMS.json` is a **344-entry provisional keyword matching list**, not an independent whole-course source inventory. The entry for *profit, growth, survival and cash-flow objectives* can match a single term, `survival`, and therefore creates false confidence in coverage. Existing `src/app/published-requirement-assurance.ts` instead starts from actual published bank tags: this is useful **supply evidence**, but inherently invisible to any source requirement that lacks an authored question. Counting the resulting rows cannot be a completeness claim.

The new `scripts/assurance/data/aqa-business-7132-official-source-baseline.json` is a **source-first, independent section/checkpoint review register**, not an imported copy of the 344 keyword candidates. It records:

- all **42 official §3.1.1–§3.10.4 subsections**, with printed page/zero-indexed PDF page locators and AS-versus-A-level scope;
- **194 high-signal source-informed checking prompts** (source themes and separable skills), with known compound examples split (profit/growth/survival/cash flow; environmental issues/fair trade; different break-even diagram abilities);
- the **nine annex quantitative skills** at printed p41 (including actual construction and interpretation of graphs), **four A-level assessment objectives** and the **three paper shapes**;
- **seven cross-cutting obligations**, including synoptic relationships, diverse contexts, evidence quality and sustained evaluation.

A *checkpoint* is deliberately not yet a guaranteed **fully atomised** requirement: some source statements contain further named facets or multiple response demands and must be decomposed against the exact document. The 194 count must **not** be added to or divided by the 344 historical count, used as a complete denominator, or shown to learners as course coverage.

## Source and quality boundary

The official public **version and printed-page structure** were reviewed against the 42-page edition. The exact Founder-uploaded PDF bytes (GitHub Issue #698 records SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`) have **not** been retrieved and hash-compared in this execution environment. Official-version similarity does not establish uploaded-file parity. It also remains necessary to perform the complete independent line-by-line atomic inventory, including exhaustive named subitems and method/command/AO demands, before publishing any whole-course denominator.

All teaching, assessment, Exam Prep and live learner acceptance fields are **UNVERIFIED**. A source-page locator proves a consultation location, not educational adequacy or student performance.

## Repeatable reconciliation and actual learner scope

`scripts/assurance/aqa-business-7132-source-baseline.test.ts` validates the source structure and explicit epistemic limitations, retains the old 344 candidate source for comparison, rejects the compound-objective keyword false pass, checks the three actual AQA 7132 Business ContentPacks, and emits a machine-readable `REVISION_BUSINESS_SOURCE_FIRST_BASELINE` **section-level supply report**.

The report only associates historical bank records and possible Learn nodes at **section scope**; it never treats a section-level tagged question as proof that an independent checkpoint is taught, that working is examined, or that a signed-in student's result is persisted. Canonical learner application remains `/revision/app/`. No content, schema, learner evidence, question identity, Plan/REV, signup or UI change is included.

## Required follow-through — do not close #698 on this checkpoint

1. Obtain the exact uploaded 42-page source and verify SHA-256; independently finish source-to-atomic decomposition of all section tables, annex, AO, synoptic and paper-format demands. Reconcile discrepancies to the historic 344 without relabelling historical evidence.
2. For **each final source atom**, manually/independently record observable valid performance and link an actual Learn block ID, independently scored Practice question/activity ID, exam component/rubric or explicit `absent`/capability gap. Separate single-value calculations from authentic written method, plotting, networks and evaluation. Do not infer mastery from a one-target MCQ.
3. Confirm accuracy, sufficiency and feedback with educational review; verify signed-in, saved and resumed learner journeys and Plan/Progress adaptation on the released site. Address the verified gaps through small governed product/content PRs; keep the source ledger and current technical reports updated.

**Documentation impact:** This source review register, automated test, technical note and INDEX link accompany each other. Normative Course Learning Blueprint, source-rights and assessment governance are unchanged; no new feature is requested. Preserve dated historical audits and the original 344 dataset without retroactive rewriting. This is NOT a complete-course assurance claim.

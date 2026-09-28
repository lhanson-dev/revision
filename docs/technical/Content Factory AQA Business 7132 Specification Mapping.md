# Content Factory AQA Business 7132 Specification Mapping

**Status:** Current controlled-trial implementation  
**Updated:** 28 September 2026  
**Normative authority:** `80-company-workflows/Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`; `80-company-workflows/Awarding Body URL Content Intake Workflow.md`; `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`

## Purpose

Record the T4 implementation for mapping AQA A-level Business 7132, 2027 exam cohort, onto the assured reusable Business Subject Knowledge Foundation without rebuilding unchanged subject knowledge.

## Exact course identity

The controlled course is `aqa:aqa-a-level:7132`, AQA A-level Business, specification code 7132, for students taking exams in 2027.

AQA identifies this as the outgoing specification but explicitly instructs centres to continue using it for cohorts taking exams in 2027. Exact requirement/alignment facts are REFERENCE_ONLY awarding-body evidence; AQA protected wording is not reusable subject truth or learner teaching copy.

## Retained T3 dependency

The starting reusable Foundation is v0.6, fingerprint:

`4f2cc0e75bbe364a2e1a1adaf832b4ad26fa6658c5ec4d988c7de38755b4f947`

Its targeted reassurance run `36470642663` passed all three remediated nodes and the final 81-node integration check. That evidence remains valid for unchanged nodes.

## Deterministic T4 mapping

`research/aqa-business-7132/2027/SPECIFICATION_MAPPING.mjs` records a rights-safe structured mapping for all 42 AQA subject-content subsections.

The current deterministic result is:

- 42 / 42 sections mapped to one or more existing Foundation nodes;
- zero unmapped sections;
- 17 sections where the existing reusable Foundation is sufficient as-is;
- 24 sections where the underlying subject truth is sufficient but exact AQA labels, named frameworks, formula conventions or required depth stay in the course projection;
- one reusable Foundation depth gap: AQA 3.1.2 share-market fundamentals.

Course-specific facets include examples such as Tannenbaum-Schmidt, Carroll, Elkington Triple Bottom Line, Handy culture types, Kotter-Schlesinger, Porter generic strategies and exact AQA quantitative conventions. These do not by themselves justify broad Subject Foundation regeneration when the underlying business truth is already represented.

## v0.7 gap reconciliation

The only reusable subject gap is bound to `BUS-FIN-008` — Sources of finance and financing choice.

The v0.7 candidate adds board-independent teaching for:

- ordinary shares/share capital;
- shareholder residual/voting rights;
- dividends and their non-guaranteed nature;
- share price versus nominal/book value;
- market capitalisation and its calculation;
- the distinction between a new share issue raising finance and secondary-market share-price movements; and
- appropriate interpretation boundaries.

Reusable promotion truth is supplied only from OGL-compatible UK Government/ONS sources. AQA material remains alignment evidence only.

The composed v0.7 candidate fingerprint is:

`64c072f188e3581a60787bd6a5556e4ac9ebf097434c6caf42a60d5598f61c53`

## Assurance scope

The next paid assurance is intentionally limited to `BUS-FIN-008`.

The other 80 nodes retain accepted v0.6 evidence. The whole-subject integration review is not repurchased because v0.6 already passed it and v0.7 changes no domain membership or dependency edges. CI deterministically proves the complete node/index relationship and exact 42-section mapping before any paid call.

The manual proof workflow is:

`.github/workflows/content-factory-business-subject-foundation-v07-aqa-gap-reassurance.yml`

A PASS closes the one T4 reusable subject gap and allows exact AQA Course Truth projection and Exam Truth work to proceed. FAIL/HOLD means only `BUS-FIN-008` is remediated again. A cost boundary is operational, not an educational failure.

## Documentation impact

This work implements existing normative authority; it does not change the Content Factory process. Historical T3 evidence remains historical evidence and is not rewritten.

# AQA Business 7132 Fast-Path T12 Website Release

**Status:** Proposed restricted-pilot release; effective only after Founder-approved merge  
**Base main:** `2c527e32f2c98ed5453068afe38b1b0d3d543ec0`  
**Course:** AQA A-level Business 7132

## Purpose

Promote the assured Business content already produced by the Fast-Path Content Factory into the canonical learner website before mock-paper production begins.

This is a publication adapter and release-evidence change. It does not regenerate subject knowledge, alter Course Truth or Exam Truth, create mocks, or change the approved learner navigation.

## What is published

- **Learn:** all 79 exact-course AQA 7132 teaching nodes projected from the 81-node reusable Business Foundation, layered into the existing reading-first Learn structure while preserving the richer curated pages already approved on the site.
- **Practice:** the Foundation-native guided-practice items for those exact-course nodes, added at the learner workspace layer so the existing 100-card pack contract and curated flashcards remain unchanged.
- **Exam Prep:** 245 Revision-authored AQA-style practice questions with marking guidance:
  - 231 accepted questions retained from the final T11 Action artifacts;
  - 14 original accepted 3.5 questions already committed in the repository.

The website remains explicit that these are **AQA-style practice**, not AQA questions.

## Assurance basis

The release uses the completed Fast-Path evidence chain:

- exact-course T8 proof run `37185846714` — success;
- affected 3.1–3.2 Learn/Practice refresh run `37185995084` — 16/16 accepted, zero blockers/escalations/failures;
- final question-batch evidence retained in `content/business/aqa-a-level/shared/fast-path-question-bank.json` with source run, artifact, reviewed commit and artifact digest;
- all promoted question batches report zero blocking, escalated or failed items.

The 3.1–3.2 and 3.7 final question runs were performed on current main after PR #515. Already-complete batches are retained by exact accepted evidence rather than regenerated.

## Release classification

This is a **restricted-pilot conditional pass** under the active Fast-Path process and Content Accuracy Assurance Gate.

Qualified human subject review remains pending. The release therefore does not claim expert review or awarding-body approval. The later Founder-approved Fast Path makes proven teaching errors or missing examinable content blocking, while logged non-critical limitations can continue through the line.

The older Foundation-native technical implementation document predates the Fast Path and is explicitly marked as superseded where it describes qualified-human approval as an absolute prerequisite for learner publication.

## Implementation

The canonical typed Business content packs remain the website source.

- `shared/learn.ts` adapts governed `content-factory/slices/aqa-7132-*/learn-practice/*.json` teaching into Learn chapters/pages.
- `shared/fast-path-flashcards.ts` adapts the same governed guided-practice assets and is composed with the existing curated flashcards in all three AQA Business paper packs.
- `shared/fast-path-question-bank.json` retains the 231 final accepted Action-only question records and exact source provenance.
- `shared/fast-path-questions.ts` combines those 231 questions with the 14 repository-native 3.5 questions.
- `src/app/AqaBusinessQuestionBank.tsx` presents the 245-question bank in Exam Prep without presenting it as a mock paper.

No duplicate public route is introduced.

## Follow-up

After student testing of this published Learn/Practice/Exam Prep content, proceed to the Fast-Path mock-paper stage. Qualified-human subject sampling remains a release-quality follow-up and should be used to calibrate confidence labels and claims.

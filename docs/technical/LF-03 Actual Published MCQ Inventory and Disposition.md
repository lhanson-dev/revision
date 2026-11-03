# #787 — Actual published Business/Psychology MCQ item-disposition gate

**State:** PROPOSED repeatable audit (not merged, not released). The complete #787 acceptance programme is still open. This technical check complements, **does not rewrite**, `audits/2026-11-02-lf03-mcq-bank-source-audit.md` and its previous live release identities.

## Why it is needed

The existing 2 November source-pattern audit covers the 118 base AQA Psychology requirement questions and a narrower 59-MCQ *retained* AQA Business structured bank. The actual learner Practice screen also serves the Business course-pack authored questions, 30 imported Business slice questions (of which a subset are MCQs), four additional mapped recheck MCQs and other content-pack bank assets. A published-source review and independent education-quality check must include the integrated learner items, not only one old JSON file.

## Canonical learner path and inventory source

`/revision/app/` → Courses → AQA 7132 Business or AQA 7182 Psychology → Practice. The canonical source is **all six actually imported published ContentPacks**, `paper-1`/`paper-2`/`paper-3` for both subjects. Identical item IDs across each subject's paper projections are deduplicated only if *all student-facing MCQ text, choices and keys agree*. Course-pack question IDs and structured-bank conversion identities come from the same `coursePackQuestionToPractice` / `bankRecordToPractice` adapters used by Practice; no new course or question engine.

`scripts/assurance/lf03-published-disposition.test.ts` emits `.artifacts/lf03-bank-dispositions/published-qa-queue.json` during test execution, without student data, question stems or option text. The dedicated non-secret GitHub workflow `.github/workflows/lf03-published-mcq-disposition.yml` runs the inventory test and uploads its actual source output as a **30-day GitHub Actions artifact**, bound to the workflow's candidate SHA; it can be manually rerun from approved `main` after merge. Evidence reviewers must use the precise release/head of the emitted report, because earlier artifact counts do not validate later bank changes.

It provides **per published item ID**:
- subject, source family, course-pack topic (or the **real source section** for bank records), exact published source-item/node locators where authored and correct-answer position; bank contents must not be falsely attributed to an invented `audit-only` topic;
- review signals (invalid key/option, repeated options, keyed bias/run, duplicated stem, length clue or generic feedback);
- a deliberately conservative disposition: *targeted V2 correction published but original learner acceptance open* (only the 12 specific corrected Social Influence, Memory, Attachment and Issues/Debates IDs in current approved main) **or** *unresolved independent item review needed*.

Absence of a pattern flag is **not** a factual key, source-alignment, AO or educational adequacy pass. Existing V2 status means targeted remediation reached production, not entire specification item independently assessed or LF accepted.

## Baseline signals and evidence status

At first preparation, approved main retains **50 authored Business course-pack MCQ tuples**, a source bank of **231** retained structured records (**59 MCQs**, historic key positions **A40/B12/C7/D0**), **4** source-mapped recheck MCQs and **30** imported original Business slice questions from sections 3.5 and 3.10 (16 source MCQs). The production Business structured bank therefore contains **79** MCQ source records from these three described families, before any specialist Practice assets. The shared Psychology pack has **118** base requirement MCQs plus separately published applied questions; actual per-course counts are determined by importing the pack, **not** by assuming the 118 are the entire active learner question pool.

The test must fail if the same question ID presents materially different text/keys across a subject's paper packs, if identities are missing/duplicated or if in-range key and item disposition cannot be determined. It deliberately continues to report unresolved repeated-option groups and Business position skew for review rather than treating them as proof of an invalid key or silently mass-shuffling choices.

## Full #787 closure still requires substantial work

1. The emitted inventory must be inspected and **each item independently marked** retain as genuine reinforcement / reauthor / exclude / unresolved, including unusual multiple-defensible options, wrong conceptual key, weak distractors or missing source context. The report's `unresolved-independent-item-review-needed` is a truthful provisional item-level disposition, not an invented review conclusion.
2. For every reauthored assessment, use original source-grounded teaching/practice logic, distinct versioned scored ID, stable historical option/key and raw marks; precise old checkpoint fingerprint recovery or explicit fail-closed migration; prevent retired V1 recognition answers from raising newly derived readiness.
3. Run **fresh blinded A3 answer/key and separate feedback critique per material item**; evidence must be tied to exact source blob/head and kept in #787 / governed PR records, with qualified examiner confidence limits separate.
4. Production smoke, canonical authenticated desktop/tablet/phone score/reload and genuine learner acceptance remain distinct. Only then close #787 and the corresponding LF-03 observation.

This is not a shortcut to close the issue through a green regex test. The AQA reference PDFs are REFERENCE_ONLY and must not be republished as bank questions. No student response or identity leaves the learner backend for this audit.

## Documentation impact

Technical-test/inventory implementation only. Existing Course Learning Blueprint, source rights, Claims and Progress Governance, AI Agent Constitution and learner route are unchanged. INDEX receives the pointer in the same governed PR. Historical audit files remain untouched; add future dated evidence cuts as new records.

## Found and corrected: signed Business arithmetic false positive (3 November 2026)

The first all-published artifact [Actions #41627746794](https://github.com/lhanson-dev/revision/actions/runs/41627746794) emitted **275 exact active MCQ IDs** (Business 50 pack + 86 structured-bank; Psychology 131 pack + 8 structured-bank), including 12 previously released narrow V2 items and 263 without independently completed source-to-answer acceptance. This is a source snapshot, *not* 275 invalid questions or a complete skill denominator. On that first run, the existing `reviewMcqQuality` reported a duplicate-option flag for Business `aqa7132-3.5-q17`.

Source inspection showed **the options are genuinely different**: `−£6,000` is a negative closing balance, while `+£6,000` is a positive number. The old normaliser removed signs and thereby conflated two distinct amounts. The QA signal was false, and reauthoring or rekeying the student's question would have been harmful. The amended source normaliser preserves numeric signs and standard thousands separators. Regression references the real q17 source and proves true identical signed numbers still flag; do not claim the item's mathematical explanation has been independently educationally reviewed.

The first artifact also reported **106 Psychology generic-feedback pattern hits**, **26 Psychology repeated-option-set item hits**, **59 Business retained-subgroup answer-position bias item hits** and published answer-position runs. These are **item-level warning occurrences**, not counts of independently invalid questions. The signed-number correction does not repair these outstanding content-quality classes. Every cohort still requires the source-to-item dispositions and review controls in #787; this test is not a licence to mass shuffle or close the wider bank.

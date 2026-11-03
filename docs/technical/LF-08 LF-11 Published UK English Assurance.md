# LF-08 and LF-11 — UK-English published learner content and UI regression guard

**State:** Draft candidate under original Workstream 5 feedback #765. It does not close either reported learner defect by itself.

## Source-backed finding

On approved main (3 November 2026), manual source-level lexical checks of 37 published AQA shared course modules, the retained Business 231-record structured question bank and all 79 published Business fast-path learning/practice JSON slices found **no** matches for a targeted class of US spelling and inflection indicators. That bounded negative result must not be turned into an assertion that every UK-English phrase is correct. The original learner's exact wording/screen from LF-08 and LF-11 was not retained.

## Correction/prevention

`scripts/assurance/lf08-lf11-uk-english.test.ts` examines **all six actual AQA Business 7132 and Psychology 7182 published ContentPacks**, including dynamically assembled authored case text, flashcards, generated learning/Practice source slices, questions, exam prompt/feedback and examination guidance. It also parses the current `src/app/` TypeScript and TSX AST to review JSX text and string/template literals. Checking string content rather than raw program text avoids confusing DOM `behavior` configuration and CSS properties with learner language.

It flags unambiguously American forms such as *behavior, analyze, organize, practicing, practiced*, and *should practice* (verb); approved British noun *practice* and verb *practise* stay distinct. Regression fixtures prove the indicator catches both directions. A detected source item must receive contextual human review and, for scored questions or prior answer identity, a version-safe editorial correction rather than blind replacement.

## Scope and acceptance

This is a **preventive lexical test**, not substantive educational copy authoring or a UI change. It cannot spot every ambiguous contextual use of noun/verb *practice*, punctuation/register errors, non-ASCII typography, generated runtime messages not present in pack strings, or inaccessible/cropped rendered text. It cannot certify every externally pulled item; matched content is the actual bundle imported by all six active content packs.

Before merging, verify exact-head CI, current approved main integration, no test false-positive failures and relevant responsive browser regression. Founder approval for the specific PR is required. No existing learner data, scoring, source IDs, marks, historical evidence, RLS or normative authority changes.

**Original learner acceptance:** Keep LF-08 and LF-11 OPEN until the actual reporting learner reviews UK-English in Home, Plan, Practice, Exam Prep and both course banks, provides any remaining specific wording, and the original material is fixed. This document supplements rather than rewrites prior #765 evidence cuts.

**Documentation impact:** Technical test only, with this current implementation note and INDEX pointer. Existing Tone of Voice Framework remains authoritative. No new ADR, migration or product-feature DoR needed.

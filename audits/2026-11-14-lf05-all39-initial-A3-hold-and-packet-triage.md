# LF-05 — First independent A3 full-bank run: HOLD, input-gap triage

**Historical evidence captured on 14 November 2026.** This is an assurance record, **not** product or content authority. Preserve the actual first-run outcomes and do **not** retroactively mark them passed when revising reviewer inputs or materials.

## Original immutable run and source identities

- Research source: draft PR [#834](https://github.com/lhanson-dev/revision/pull/834), original **head `2ef5e66cf38c8582fe2cb68ea78366a0e75f272a`**.
- Trusted reviewer installation: merged PR [#846](https://github.com/lhanson-dev/revision/pull/846), approved `main` `be36df082f367497f766f5008b9a554ba76d694d`.
- [Workflow run #43599092313](https://github.com/lhanson-dev/revision/actions/runs/43599092313): completed **FAIL / educational HOLD**, as intentionally requested by the fail-closed educational gate; six secret-free contract tests passed.
- [Versioned full JSON receipt artifact](https://github.com/lhanson-dev/revision/actions/runs/43599092313/artifacts/14116490885), 66,838 ZIP bytes / 249,245-byte JSON, SHA256 ZIP **`3983c3fc23a5a5401501c9ae9c745143455754df9614a5c6a995cadb97aec5dd`**, default 30-day artifact retention. Preserve extracted item-specific issue notes in this report; source run artifact is ground truth, **not** the author summary.
- Source PDF verification (the exact Founder uploads, not general web recall): AQA Business **7132 v2.0, 14 June 2023**, SHA256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`; Psychology **7182 v1.4, 1 September 2025**, SHA256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`. AQA material remains `REFERENCE_ONLY` and is not imported as official learner questions or mark schemes.
- Run completeness **39/39 item identities, seven question/guide batches, 14 responses, 14/14 model calls**; estimated consumption **$1.951475** using the original workflow's *conservative planning estimate*, not a reconciled provider invoice. The run was completed, with `decision=HOLD`, not a run infrastructure error or missing provider output.

## Recorded A3-stage dispositions (exact item IDs)

| Candidate ID | Blind question challenge | Guided marking challenge |
| --- | --- | --- |
| `PSY-LF05-01` | pass | material |
| `PSY-LF05-02` | pass | material |
| `PSY-LF05-03` | pass | material |
| `PSY-LF05-04` | pass | material |
| `PSY-LF05-05` | pass | material |
| `PSY-LF05-06` | pass | material |
| `PSY-LF05-07` | pass | material |
| `PSY-LF05-08` | pass | material |
| `PSY-LF05-09` | pass | material |
| `PSY-LF05-10` | pass | material |
| `PSY-LF05-11` | pass | material |
| `PSY-LF05-12` | pass | material |
| `PSY-LF05-13` | minor | material |
| `PSY-LF05-14` | pass | material |
| `PSY-LF05-15` | minor | material |
| `PSY-LF05-16` | material | material |
| `PSY-LF05-17` | material | material |
| `BUS-LF05-01-16` | material | material |
| `BUS-LF05-01-25` | minor | material |
| `BUS-LF05-02-16` | material | material |
| `BUS-LF05-02-25` | minor | material |
| `BUS-LF05-03-16` | material | material |
| `BUS-LF05-03-25` | minor | material |
| `BUS-LF05-04-16` | material | material |
| `BUS-LF05-04-25` | material | material |
| `BUS-LF05-05-16` | minor | minor |
| `BUS-LF05-05-25` | material | material |
| `BUS-LF05-06-16` | minor | minor |
| `BUS-LF05-06-25` | material | material |
| `BUS-LF05-07-16` | minor | material |
| `BUS-LF05-07-25` | material | material |
| `BUS-LF05-08-16` | minor | material |
| `BUS-LF05-08-25` | material | material |
| `BUS-LF05-09-16` | minor | material |
| `BUS-LF05-09-25` | material | material |
| `BUS-LF05-10-16` | minor | material |
| `BUS-LF05-10-25` | material | material |
| `PSY-LF05-01-S1` | material | material |
| `PSY-LF05-02-S1` | material | material |

Totals: **blind 13 pass / 11 minor / 15 material**; **guided 0 pass / 2 minor / 37 material**. **0 questions independently approved for publication**. The two separate Psychology `-S1` items are not part of the original 37 count. The original 16-mark Psychology Research Methods candidate stays *training-only*, not evidence of an official 2027 tariff.

## Material source-packet design flaw: not every material finding reflects an authored defect

**Verified against exact versioned source:**
- Original Psychology authoring file has a **complete shared four-level 16-mark *training-only* grid** preceding the per-item sections in `## Assessment rules for these candidates`. Each of the 17 per-item guides refers to that *existing grid*. The reviewer, however, was given **only** `authoredGuide = section from "**Indicative marking guidance" onward` (it omitted the shared table) and repeatedly declared `provisional level grid above` absent. This is a **review input deficiency**, not proof that the authoring grid is missing.
- Original Business authoring file has **separate shared 16-mark and 25-mark training-only holistic level guides** in `## Provisional original Revision level guides`, also omitted from the guided reviewer input. The two Psychology contextual variants share qualitative level anchors that were likewise omitted by slicing the individual sections. These grids are **not independently calibrated** merely because they exist; the next guided review must actually inspect them and challenge their educational adequacy.
- The reviewer recommended attaching cases to numerous **standalone Business Paper 1 25-mark-style essays**. The uploaded AQA 7132 v2.0 §2 states Paper 1 Sections C and D involve choices of 25-mark essay questions; this does **not** make a supplied case compulsory for every broad essay. The reviewer may critique the cognitive/application demand of a specific essay, but **absence of an artificial scenario alone must not be a material blocker**.
- The reviewer flagged missing granular source confirmation of **Social Influence resistance**, **working-memory components**, **Forensic profiling**, **Addiction mechanisms**, **Eating Behaviour explanations** and **organisational culture** despite those being identifiable within the exact supplied 7182 v1.4 §§4.1.1/4.1.2/4.3.6/4.3.9/4.3.10 and 7132 v2.0 §3.10.2. This is a limit of the original *reviewer packet*, which supplied broad section names but not those specific trusted source facts. It does **not** verify item-level 2027 mark allocation or official Set 3 examples.

## Genuine or plausible material defects still requiring case-by-case resolution

- **Psychology `PSY-LF05-08` Issues and Debates:** authored AO2=0 may not reflect the theoretical application demanded by its request for examples. The exact 2027 item distribution remains unverified; an explicit AO mapping/quality decision is required.
- **Psychology `PSY-LF05-16` Forensic:** question wording may conflate typology, investigative psychology and geographical profiling. These are distinct approaches in §4.3.9. Do not grant an artificial pass merely because the subtopics appear in the specification.
- **Psychology `PSY-LF05-13` Eating Behaviour and `PSY-LF05-15` Aggression:** ambiguous theory scope or missing distinctions should be resolved if sustained as material under a source-corrected review.
- **Business `BUS-LF05-07-16`:** the draft's purported `gearing 56.25%` requires checking the actual supplied numbers and stated convention; non-current liabilities / capital employed may be 56.25% without uniquely establishing the appropriate gearing definition. No misleading ratio credit.
- **Business `BUS-LF05-05-16`:** profit margin **8%**, current ratio **0.875:1**, working capital **−£100,000** from the original Harbour Furniture case are arithmetically correct; loan repayment capacity and terms are **not supplied**. Guidance must express the cash-flow/risk judgement conditionally and must not claim insolvency or loan affordability as proven.
- **Business finance/operations/marketing decision cases:** some 16-mark scenarios may require clarifying their exact data, dates, denominator or proposed intervention. A reviewer request for every possible finance forecast/benchmark must be weighed against answerability, not adopted automatically.
- **AO and level precision:** uniform proposed AO1/AO2/AO3/AO4 distributions and exact numeric bands are *author planning examples* for original long-answer training, not item-specific official 2027 mark schemes. Even with the shared grids included, a guided review must decide whether visible guidance overclaims examiner precision or fails to reward valid alternative answers.

## Targeted corrective action and no-scope-creep plan

1. **First correct reviewer inputs**, not all 37 original authored questions: deliver the authentic **shared original Revision training-only grids to Stage B only**, keep Stage A blind, supply bounded verified granular AQA source facts and explicitly remind the reviewer that Business Paper 1 standalone essays need not have a mandatory case.
2. Run secret-free tests and governed CI on the reviewer fix; obtain **specific Founder PR approval** before merging new trusted reviewer logic. No silent original-result overwrite.
3. Then run the same exact-source review *once* (subject to specific owner/provider opt-in), compare item verdicts to this preserved baseline, and correct only independently sustained material issues with versioned research-source edits. Do not force a 39/39 PASS for convenience or call a self-assessment an examiner mark.
4. Independently of content quality, LF-05 still needs full 17-part Definition of Ready and explicit Founder `Analyse → Ready`, bounded owner-private raw essay retention, genuine first-answer freeze before revealing guidance, RLS and a tested limited family gate. No application implementation in this review-fix branch.
5. This audit document is **dated evidence** under `audits/`; changes to reviewer tooling/technical docs belong to this same governed PR. Historical original run unchanged.

**Status:** First real A3 run **HOLD**. No learner question catalogues or runtime changes; publication remains blocked.

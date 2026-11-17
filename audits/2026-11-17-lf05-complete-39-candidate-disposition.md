# LF-05 full 39-item authored inventory — candidate staging only

**Dated:** 17 November 2026. **Status:** source/engineering inventory, not independent educational approval, student publication, teacher calibration, or proof of full AQA course coverage.

## What has actually shipped versus what is merely prepared

The canonical learner path is the existing signed-in `/revision/app/` → Course → Practice / Exam Prep → `Lf05WrittenPracticePanel`, backed by the original versioned server catalogue. Approved production from PRs #850–#852 contains **six published original training questions and six post-answer guides** (five AQA Business 7132 and one AQA Psychology 7182). Ordinary signed-in learners have access; another student's submitted text remains private and first-submission gating remains compulsory.

The immediate next-six branch [PR #853](https://github.com/lhanson-dev/revision/pull/853) contains six **additional HELD** candidates — three compulsory Psychology (Social Influence, Memory and Research Methods) plus three Business (Marketing, Operations, Strategic Position). This stacked inventory branch creates the *other 27* as **HELD**, bringing the **source-candidate database total to 39, but not the learner-visible total**.

| Category | Psychology | Business | Total | Publication |
|---|---:|---:|---:|---|
| Previously released, exact independent A3 PASS/PASS | 1 | 5 | 6 | Published |
| PR #853 revised no-material candidates | 3 | 3 | 6 | HELD — new guide A3 required |
| Remaining old no-material A3 cases | 4 | 6 | 10 | HELD — final source/version/A3/A4 |
| Previously material A3 findings | 11 | 6 | 17 | HELD — correction and fresh independent A3 |
| **Authored inventory** | **19** | **20** | **39** | **6 published, 33 held** |

The initial A3 blind/guided review [run #43599092313](https://github.com/lhanson-dev/revision/actions/runs/43599092313) was HOLD and had a deficient reviewer packet. The corrected and still historically authoritative independent assessment [run #43620992688](https://github.com/lhanson-dev/revision/actions/runs/43620992688), receipt [#14124482254](https://github.com/lhanson-dev/revision/actions/runs/43620992688/artifacts/14124482254), reviewed 39 older exact versions: **22 with no material findings / 17 with material**. Six have subsequently completed separate source/A3/A4 and shipped. **An author's own changes, a repaired rubric or CI success do not confer independent A3 PASS.** Four of the old no-material Psychology items involve selected Paper 3 options; before publication, respect the student's actual Paper 3 group and option selections, not a generic list of every 7182 option.

The remaining 27 source texts are anchored to [draft research PR #834](https://github.com/lhanson-dev/revision/pull/834), exact head `3b318fc53bce95195c8eef8b5771690c123f2a31`, and the two Founder-supplied PDF specifications: AQA Psychology **7182 version 1.4 (1 September 2025)**, SHA256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`; AQA Business **7132 version 2.0 (14 June 2023)**, SHA256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`. Source PDFs are REFERENCE_ONLY, and the learner content is authored Revision material, not official AQA question/mark-scheme text. Six of the last 27 original source sections differ from the historical reviewed version (`PSY-LF05-11`, `PSY-LF05-16`, `BUS-LF05-06-25`, `BUS-LF05-07-16`, `BUS-LF05-08-25`, `PSY-LF05-02-S1`), preventing an accidental historical verdict reuse.

### All 17 material-HOLD identities to fix

Psychology: `PSY-LF05-03`, `PSY-LF05-04`, `PSY-LF05-05`, `PSY-LF05-06`, `PSY-LF05-08`, `PSY-LF05-09`, `PSY-LF05-10`, `PSY-LF05-11`, `PSY-LF05-12`, `PSY-LF05-14`, `PSY-LF05-16`.

Business: `BUS-LF05-01-16`, `BUS-LF05-05-16`, `BUS-LF05-06-16`, `BUS-LF05-06-25`, `BUS-LF05-07-16`, `BUS-LF05-08-25`.

Use the independently dated item-level receipt to separate genuine authoring defects from source-packet deficiencies; preserve the original verdicts. Correct mathematical/accounting claims, Psychology mechanisms and their alternatives, source/topic/paper choices, overprecise numeric AO bands and actual assessment demands. Never force an apparently positive verdict by hiding known defects from the reviewer.

### Exact staged data and validity boundaries

The additive candidate-only SQL `supabase/migrations/20261117222000_stage_lf05_remaining_27_review_candidates.sql` is intentionally **stacked on PR #853 and the published six**, guarded against duplicate or missing baselines. It inserts 27 original question/guide pairs with new SHA256 fingerprints tied to their exact stem, stimulus and JSON guidance, `original_training_only=true`, and **`status='held'`**. The old material items have an explicit HOLD review reference, and all 27 require new A3/A4 review before their `published` status may change. A guide begins with an explicit training/no-official-marks/hold caveat and is stored separately behind the existing learner's submission-only RLS.

Psychology Paper 3 original option-group questions are *not* suitable for blanket publication through a generic paper selector. Their paper/source group and the learner's actual selected option must first be enforced; do not present 17 Psychology topic families as 17 compulsory exam topics. The Psychology Research Methods 16-mark candidate is training-only; do not imply this is a confirmed real 2027 research-methods mark tariff. Neither draft content nor this staging migration awards numeric marks or independently measured weakness, and neither changes timed exam totals.

### Real release checkpoints and documentation impact

1. **PR #853:** obtain genuinely independent blind-question + separate guided-assessment review for the exact six new guides, correct any sustained findings, verify version/prompt/guide fingerprints and actual AQA source, then promote the six in one PR to published and rerun authenticated Business/Psychology A4, database RLS, desktop/phone/tablet and CI. Obtain specific Founder merge approval and hosted production evidence.
2. **Remaining 10 no-material historic cases:** version-specific checks, precise credit and uncertainty in guidance, original source mapping; ensure the Psychology Paper 3 selected-option filtering is truly implemented before any optional item is published.
3. **17 historical material-HOLD:** correct source/assessment defects independently, re-run exact-version A3, then only individually promote those that pass.
4. **Integration:** no new writing engine. Keep the generic catalogue and admission-free signed-in access, private fixed 14-day drafts, guide-only-after-first-commit and reviewer-versus-learner evidence separation. Real browser integration for all released versions, with no shared answer contamination.
5. **Total/full-coverage truth:** the 39 draft identities are an initial editorial queue, *not* the complete specification-defined denominator; issue #698 remains the separate whole-course completeness proof.

**Documentation impact:** this new dated audit, SQL content staging, specific 39-inventory pgTAP tests, updated existing tests, LF-05 technical implementation record and INDEX belong on the governed stacked PR. Historic run receipts and current approved main are unchanged until a specifically Founder-approved content merge. No normative new feature is proposed: the already approved LF-05 Course Learning Blueprint allows these individually reviewed incremental releases.

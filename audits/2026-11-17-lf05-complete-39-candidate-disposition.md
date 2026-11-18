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


## 17 November 2026 — direct exact-PDF recheck of all historically material findings

A new author-side source check reopened **both exact Founder-uploaded specifications**, identifying their SHA256 digests as recorded above, and read the following actual specification requirements. This **resolves missing-source-packet uncertainty for these claims** but is **not** an independent A3 PASS, and is not authority to publish the 33 held items without new exact-version review. In the corrected old A3 batch receipt, most Psychology material findings were due to incomplete trusted granular source facts, not an established erroneous question.

| Previously material A3 item | Direct primary-source verification | Remaining work on current staged item |
|---|---|---|
| PSY-LF05-03 | Psychology 7182 §4.1.3 p18 explicitly names Bowlby's monotropic theory, critical period, internal working model and later relationships | Confirm the guide does not conflate maternal deprivation with attachment, and independently review final bytes |
| PSY-LF05-04 | §4.1.4 p18 explicitly names Beck's negative triad, Ellis's ABC and CBT for depression | Recheck explanation/treatment distinction and avoid assuming CBT success proves etiology |
| PSY-LF05-05 | §4.2.1 p19 explicitly names behaviourist and social learning approaches and comparison of approaches | Verify observation, vicarious reinforcement and mediational processes; fresh guide A3 |
| PSY-LF05-06 | §4.2.2 p19 explicitly names fMRI, EEG/ERPs, post-mortem and localisation | Recheck temporal/spatial resolution and causal-inference limits |
| PSY-LF05-08 | §4.3.1 pp21–22 explicitly requires nature/nurture and interactionist approach, plus synoptic connections | Use accurate examples from learner's compulsory or **selected** options; no fixed topic-count rule |
| PSY-LF05-09 | §4.3.2 p22 includes social exchange theory and Rusbult's investment model | Section B option only; preserve the model's alternatives/investment construct |
| PSY-LF05-10 | §4.3.3 p22 names Kohlberg and gender schema theory | Section B option only; avoid confusing sex development with gender identities |
| PSY-LF05-11 | §4.3.4 p22 names Piaget, Vygotsky, scaffolding and development | Section B option only; current authored question was revised to **compare and evaluate**, so the earlier guide-versus-command mismatch must be independently retested on new bytes |
| PSY-LF05-12 | §4.3.5 pp22–23 includes diathesis-stress and schizophrenia treatments | Section C option only; avoid suggesting treatments prove aetiology |
| PSY-LF05-14 | §4.3.7 p23 explicitly includes stress inoculation therapy and biofeedback | Section C option only; check treatment distinctions and claims about effectiveness |
| PSY-LF05-16 | §4.3.9 pp23–24 separately names typology, investigative psychology and geographical profiling | Section D option only; current authored guidance distinguishes investigative psychology from geographical profiling, fixing the old category conflation on **new bytes**; independent recheck still required |
| BUS-LF05-01-16 | Business 7132 §3.1.1 p11 includes profit measurement/objectives; §§3.5.1, 3.5.3–3.5.4 pp19–21 cover cash/profit, borrowing and liquidity | The source/ref/topic mapping has been changed from generic §3.1/'business' to **'finance' with both exact section references**; recheck expansion judgement and 16-mark *style*, not official tariff |
| BUS-LF05-05-16 | §§3.5.2–3.5.4 pp20–21 include financial analysis and sources of finance | Catalogue already has `original_training_only=true`; avoid claiming numeric examiner tariff or that negative working capital alone proves inability to borrow |
| BUS-LF05-06-16 | §§3.6.2–3.6.3 pp22–23 cover turnover and training | Catalogue already marks it original training; calculated replacement costs are explicitly conditional |
| BUS-LF05-06-25 | §3.6.4 p23 covers motivation/engagement, financial and non-financial methods | Current authored AO1 guide focuses financial reward rather than the earlier copied training-format text; new exact-version guide A3 required |
| BUS-LF05-07-16 | §§3.7.2–3.7.3 and 3.7.8 pp24–27 concern internal financial position and NPV investment appraisal | Revised guide avoids **requiring** 56.25% gearing from undefined debt inputs, and mapping is now precise; independently retest it |
| BUS-LF05-08-25 | §3.8.2 p28 explicitly names Porter's cost, differentiation and focus strategies | Revised AO1 now addresses differentiation vs low-cost competition instead of the earlier unrelated Ansoff matrix; independent recheck required |

**Result of this author-side correction:** the 17 historical material-HOLD IDs have each been revisited against the **actual PDFs**, with six Business mappings clarified in the source staging migration and the existing updated research guide corrections identified. The historical verdicts stay **MATERIAL/HOLD** until a fresh independent review returns a verdict on the exact currently staged question/guide versions; a one-agent source check cannot convert those historical statuses into a publication pass. The originally posted A3 receipt also explicitly disclaimed qualified human review, official tariff confirmation and publication authorization.

**User-facing integration defect identified and corrected on this branch:** `Lf05WrittenPracticePanel` formerly listed every published Psychology optional topic without consulting the learner's saved Paper 3 choices. It now validates the existing Plan `revision_assessments.scope.topicIds` against the published, three-group Psychology exam option contract and scopes the selector accordingly. All 27 valid combinations, invalid/missing scopes and a signed-in option-change browser scenario are checked in new tests. Compulsory content remains accessible; optional content is withheld when selection cannot be established. This is UI-level relevance filtering, **not a claim that the general signed-in question API enforces a security secret around optional stems**. The backend still requires each learner's own submitted first answer for their guide and isolates all raw responses.

**Documentation impact:** this is a dated audit supplement plus implementation and tests in PR #854; no normative AQA course change, no edits to historical review evidence, and no claim that all 39 questions are live.

## 17 November — independent-review packet produced from exact staged SQL

To avoid repeating authoring and manual packet assembly, the 33 current held question+guide pairs were deterministically extracted from the **two staged source-migration blobs**, retaining the exact original question, original scenario, paper/topic/mark-style, source references and distinct item guidance. Source SQL blob SHAs: `826f081a5005eefd656f95c8409b36e06f3bd497` (priority six) and `d5b6299e263b2d32b4e7f5460fa61629baa8318e` (other 27). All **33 unique IDs** were extracted and validated; the original six published records were not duplicated.

- **Blind question-first reviewer input** (NO authored marking guidance): `audits/2026-11-17-lf05-33-blind-question-review-packet.md`.
- **Separate guided challenge input** (for a second, subsequent context after independent expected answers have been written): `audits/2026-11-17-lf05-33-guided-review-packet.md`.

These packets are **inputs** to independent educational A3, not review results. No independent reviewer has yet endorsed these exact 33 staged guide versions. A genuine independently run reviewer must return per-item PASS/MINOR/MATERIAL/BLOCKING with substantive corrections, and the final SQL blobs/packets must be regenerated on any question/guide edit. This reduces repeated packet preparation and concentrates the remaining work in educational accuracy and actual learner A4, rather than more content staging. CI alone cannot promote a held item.


## 17 November 2026 — source-editorial corrections on PR #854; still held

Corrected 27 staged held question/guide pairs against the Founder's exact AQA Business 7132 v2.0 (SHA256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`) and Psychology 7182 v1.4 (SHA256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`). Removed learner-facing REVIEW HOLD text, duplicate point numbering, nonexistent grid references and invented performance bands. Added specific source/evidence safeguards to all 27, corrected Psychology behaviourist/SLT integrated question wording, clarified Pine's proposed machine does not have a proven quality effect, and aligned Business motivation with Taylor, Maslow, Herzberg and the specified reward techniques. The six additional first-priority held prompts retain their existing source versions.

**Limits:** these author-side corrections are not independent A3 passes; the 17 material historical findings remain recorded. All 33 are still held while 6 previously independently assured originals remain published. Regenerated separate blind and guided 33-item exact-blob review packets and tightened pgTAP content check. Independent A3, authenticated A4, final CI, Founder-specific merge approval, and live deployment evidence remain outstanding. The 39-item inventory does not prove whole-course adequacy (#698).


## 18 November 2026 — preliminary source/display review correction before A3

A source-level learner-output check found that PSY-LF05-02-S1 stored literal Markdown bold markers around 76%/49% while the canonical LF-05 React panel renders scenario text as plain text. The current candidate-only SQL and both all-33 packets now use plain percentages without `**`, preserving the intended invented data. The same candidate's specification skill locator was truncated with a trailing `AO`; it now identifies exact Psychology §4.1.2, the working-memory dual-task demand, Paper 1 and original training-only 16-mark style. Two pgTAP assertions fail closed if either regression reappears. Exact SQL source blob and both review packet provenance markers were regenerated; **no student publication, A3 verdict, learner evidence or source history was changed**.


**18 November correction to preceding checkpoint:** The first CI regression test failed because the same memory scenario still contained `**not real research findings**` in its fictional-data disclaimer. Removed these final Markdown delimiters as well; regenerated both all-33 review packets for the new exact SQL blob. The prior failed CI result remains historical evidence and a new final-head CI is required. No learner-facing publication change.

# LF-05 — 25 November 2026 independent all-33 A3 adjudication and targeted source corrections

**Status:** Author-side source adjudication and revised held candidates only. This is **not** a new independent PASS, final learner A4, or publication. Preserve historical review artifacts without modifying them.

## Exact review evidence

- Trusted-main [A3 run #45651938158](https://github.com/lhanson-dev/revision/actions/runs/45651938158) assessed **all 33 original held question+guide identities** in 11 groups of 3. Receipt [artifact #15042331658](https://github.com/lhanson-dev/revision/actions/runs/45651938158/artifacts/15042331658); exact PR #854 reviewed head `d23f743382060e6eb566118670624b157c55c88d`. `completed:true`, `decision:HOLD`, 26 provider calls including four rejected malformed attempts independently retried, estimated $2.22.
- All 33 question-only judgments were PASS or MINOR. Guided A3 found **three MATERIAL flags**: `PSY-LF05-08`, `PSY-LF05-13`, `BUS-LF05-07-16`. Thirty guides were PASS/MINOR. No BLOCKING verdict. No item may inherit a PASS from another source version.
- The older 18 November 25/33 run #44409465096 and 21 November three/33 run #44904071213 remain historical incomplete HOLD artifacts; these are not silently combined into a new publication pass.

## Primary-source verification

The Founder-supplied original PDFs were re-opened and SHA256 verified:
- AQA Business **7132 v2.0, 14 June 2023**: `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`.
- AQA Psychology **7182 v1.4, 1 September 2025**: `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`.
- Supplement to the Business source for the **formula**, which the specification merely lists but does not spell out: AQA **Teaching guide: formulae and key data**, revised 9 June 2023, item 22: https://filestore.aqa.org.uk/resources/business/AQA-7131-7132-FORMULAE.PDF. It defines `gearing % = non-current liabilities / (total equity + non-current liabilities) × 100`, where the denominator is capital employed. This is a source-aligned external AQA teaching guide, not a copied AQA learner question or a replacement for the uploaded versioned specification.

## Material flag dispositions (reviewer allegation ≠ accepted source error)

| Question | Exact source / authored-guide adjudication | Changes to HELD candidate |
| --- | --- | --- |
| `PSY-LF05-08` nature–nurture | §4.3.1 covers nature–nurture **and** interactionism as course knowledge, but the particular original question does not instruct candidates to define interactionism independently. The guide did demand this as a categorical requirement. | Correct guidance 3 and 10: credit relevant interactionist reasoning **without excluding** sound nature/nurture debate answers lacking its separate definition. Preserve full curriculum teaching. |
| `PSY-LF05-13` eating behaviour | §4.3.6 includes biological, family-systems, social-learning and cognitive accounts. The guided reviewer mistakenly reported an unrelated false fact about §4.1.4: the uploaded version **does** title it Clinical Psychology and Mental Health. This reviewer error is not an authored question defect. The guide's *mandatory interactionist conclusion* could still unduly constrain valid evaluation. | Make interactionist synthesis optional. Retain genetic/neural and cognitive alternative routes; record and reject the independent reviewer’s incorrect §4.1.4 claim as source disagreement, **not** source correction. |
| `BUS-LF05-07-16` financial indicators | §3.7.2 includes gearing and §3.7.8 investment appraisal. Official AQA formulae guide item 22 gives `£9m / £16m × 100 = 56.25%`; the authored guide wrongly said no unambiguous gearing ratio was possible. | Correct guidance criteria for ROCE 12.5%, operating margin 8%, gearing 56.25%, forecast-sensitive positive NPV and absence of liquidity figures. Do not imply 56.25% alone proves overgearing or mandates one investment decision. |

**Rejected separate reviewer error:** For `BUS-LF05-08-25`, the review described Porter strategic positioning as §3.8.3 and Ansoff as §3.8.2. The uploaded **7132 v2.0** expressly places **Ansoff at §3.8.1** and **Porter low-cost/differentiation/focus at §3.8.2**. The original §3.8.2 mapping is retained and protected by pgTAP. The reviewer verdict remains historical, not silently edited.

## Other source-aligned minor guidance corrections

- `PSY-LF05-03`: deprivation/institutionalisation evidence earns credit only when explicitly relevant to Bowlby, not as tangential content.
- `PSY-LF05-04`: remove unsupported 2027-content exclusion; credit relevant comparison evidence.
- `PSY-LF05-09`: do not mischaracterise social exchange as intrinsically short-term.
- `PSY-LF05-12`: incorporate biological, psychological **and social** dimensions of interactionist treatment.
- `BUS-LF05-06-25`: specified Taylor/Maslow/Herzberg knowledge remains part of course coverage; do not require all named theorists in this individual essay.
- `BUS-LF05-05-16`, `BUS-LF05-06-16`: clarify source references to §3.7.2 ratios and §3.6.2 HR performance respectively, while retaining legitimate relevant alternatives.
- `BUS-LF05-08-16`: clarify the new product targets the **existing** UK specialist market, to eliminate accidental Ansoff diversification ambiguity.
- `PSY-LF05-15`: use the source-aligned “psychological explanations” phrase in the question.
- Other minor suggestions were checked for direct support rather than accepted automatically. Source page references and §3.8.2 Porter mapping are preserved where the **uploaded PDF** supports them.

## Changed artifacts and integrity boundary

- Source candidate SQL: `supabase/migrations/20261117222000_stage_lf05_remaining_27_review_candidates.sql`, new Git blob `476df066bc2e13968e62abbc26a822127c323fe1`.
- Re-generated **blind question-only** and **separate guided** packets both point to the new exact SQL blob. The original first-six candidate SQL blob `826f081a5005eefd656f95c8409b36e06f3bd497` is unchanged.
- Strengthened pgTAP `supabase/tests/lf05-remaining-27-held-content-assurance.test.sql` with six fail-closed source/credit/ratio/scenario checks, retaining `39 total, 6 published, 33 held` and guide-after-answer secrecy.
- No content is marked published by these edits. No old independent A3 receipt, questions already live, saved attempt, review outcomes or production migrations on `main` are rewritten.

## Next release gates

1. Obtain **new independent question-first and separate guided A3 on the final exact revised 33-item PR head**. Do not reuse the old PASS/MINOR verdicts for edited items. Source-adjudicate any remaining MATERIAL/BLOCKING flags and correct them on the same PR.
2. Once all 33 clear, update the exact governed content promotion (published states) in the same PR, replacing candidate-only status without bypassing RLS, submit-before-guide, versioning, 14-day expiry, and the Psychology Paper 3 chosen-option filter.
3. Complete authenticated Business and Psychology **A4** across desktop/tablet/phone and private owner RLS, durable draft/reload, version/fingerprint, guide after confirmed first submission, 14-day deletion, anonymous denial, and option selection. Validate merge candidate **with current main**, final CI, and production-backend-readiness contract.
4. Present **PR #854** for its own specific Founder merge approval, then verify release/deployment and actual learner-visible counts. The 39-item initial editorial bank does **not** establish whole-specification course completeness (#698) or independent examiner-calibrated marking (#706).

**Documentation impact:** dated audit, source SQL, exact review packets, pgTAP and LF-05 technical/index pointers remain in the same governed PR. No proposed normative change: the approved original-training-only, self-review content pathway remains unchanged.


## Later 25 November 2026 — revised-head independent A3 run #45655713087: partial 30/33 and rate limit

This **new** trusted-main run targeted exact content head `939fc1117aa19d8f661383b7a2b320e805bbf975`. [Run #45655713087](https://github.com/lhanson-dev/revision/actions/runs/45655713087) failed closed after **30/33** complete blind+guided review pairs, with the final three `BUS-LF05-09-25`, `BUS-LF05-10-16`, and `PSY-LF05-02-S1` not assessed because the provider returned **HTTP 429**. Retained original [artifact #15044277070](https://github.com/lhanson-dev/revision/actions/runs/45655713087/artifacts/15044277070): `completed:false`, `decision:HOLD`, 24 attempted calls, $1.71702 estimated usage, 10 complete batches and four invalid-attempt records (including the HTTP 429). Do not claim 33/33 or publication readiness.

The 30-item review contained **five MATERIAL judgments across four unique items**: both blind+guide on `PSY-LF05-07`, and guided on `PSY-LF05-16`, `BUS-LF05-05-16`, and `BUS-LF05-06-16`. The reviewer assertions were **not all sound**:

- `PSY-LF05-07` **valid narrower source mapping/prompt improvement**: the uploaded original **Psychology 7182 v1.4 PDF**, pp19–20, has §4.2.3 research methods and experimental method, **§4.2.3.1 “Scientific processes”** (experimental designs, control, validity), and **§4.2.3.2 “Data handling and analysis”**. The old broad §§4.2.3–4.2.3.2 tag was imprecise and “design a study” needlessly restated an already specified repeated-measures design. We corrected the mapping to §4.2.3 + §4.2.3.1, and made the question explicitly ask for controls within the proposed design. **The reviewer itself falsely called §4.2.3.1 “Experimental method” and §4.2.3.2 “Observational techniques”; neither is the actual source heading.**
- `PSY-LF05-16` **reject unsupported reviewer substitution finding**: the submitted authored guide already says **“Both appear in 7182 §4.3.9 but are not synonyms”** and **“Geographical profiling may receive relevant comparative credit ... not substituted as a synonym for investigative psychology.”** The reviewer named an alleged **frozen reviewer's own alternative-credit response**, not a contradictory authored-guide criterion. Retain the source-correct guide; do not rewrite it to satisfy a hallucinated defect.
- `BUS-LF05-05-16` **reject unsupported reviewer affordability finding**: the authored guide explicitly states **“neither affordability nor inevitable default can be established”**, and “One ratio cannot establish ... repayment capacity.” The adverse reviewer quotes wording about repayments being unsafe that is **not in the authored guide**, so no supported material correction. Correct arithmetic remains current ratio 0.875:1, profit margin 8% and working capital −£100,000, with case data insufficient to establish loan affordability.
- `BUS-LF05-06-16` **reject false subsection claim and clarify source title**: Business **7132 v2.0 PDF**, p22 expressly titles **§3.6.2 “Analysing human resource performance”** and lists **labour turnover**, contrary to the independent reviewer assertion that §3.6.2 is organisational structures. **§3.6.3** is organisational design and managing HR flow, including training. The guide also explicitly qualifies “about 58 leavers” and conditions **any** 58 recruits or £69,120 on replacements. We have made the two exact published source section headings explicit in the candidate skill reference and blind input. This is source clarification, not capitulation to the false finding.

**New source version:** the first-six held staging SQL (`PSY-LF05-07`) and 27 held staging SQL (`BUS-LF05-06-16`) plus their separate blind and guided snapshots were updated and checksum pins regenerated together. Two new pgTAP tests guard Psychology §4.2.3.1, source-aligned procedural question wording, plus one protects Business §3.6.2's actual title; the 39 total/6 published/33 HELD guards remain unchanged. The already released first six original content records are not modified. Historical review receipts remain immutable.

**Outstanding:** repeat the independent two-stage exact-version assurance after all source changes. A provider rate-limit failure is not an educational verdict; the trusted reviewer must remain fail-closed rather than treating partial receipts as success. Subsequent publication requires a full 33/33 independent source-adjudicated result, A4 authenticated learner evidence, final current-main integrated CI, separate Founder approval and production proof. No normative educational rule changes; this is a technical-and-evidence correction within draft #854.

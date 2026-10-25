# Edexcel 9BS0 Market 1.2 — bounded independent review and source-use decision handoff

**Status 25 October 2026:** PREPARED FOR REVIEW, **not reviewed or approved**. Programme [#661](https://github.com/lhanson-dev/revision/issues/661), current delivery [#675](https://github.com/lhanson-dev/revision/issues/675). Reference manifest: `research/content-production-repeatability/edexcel-9bs0-market-gated-review-handoff.json`. It pins the exact Git blob of every research input so the reviewer is not asked to assess a moving target.

## Why this is the next gate, not a new content prototype

The official Pearson Edexcel [9BS0 Issue 1 specification](https://qualifications.pearson.com/content/dam/pdf/A%20Level/Business%20Studies/2015/specification-and-sample-assessment-materials/9781446914694-gce2015-a-bus-web.pdf), **PDF page index 18 (printed page 7)**, directly supports the numbered 1.2.1–1.2.5 Market headings: demand, supply, market interaction/diagram drawing and interpretation, price elasticity, and income elasticity. It shows five top-level units and their terminal source positions. These **reference positions are not automatically the educationally complete atomic skill denominator**.

The review packet reconciles **26 provisional skill hypotheses against 23 terminal source reference positions**, without copying Pearson teaching prose. Only **7 of 26** have joined original, still unreviewed Learn/Practice/exam-style specimens; **1** is only visually demonstrated, and **18** have no equivalent original teaching-and-assessment specimen. No one has accepted reuse, marks or source-rights permission. Counts are *operational gaps*, not evidence that a student has learnt anything.

| Cohort within Market 1.2 | Provisional skill hypotheses | Learning/assessment work to challenge |
| --- | ---: | --- |
| Demand mechanisms | 8 | Original teaching and valid Practice absent; confirm substitute/complement, income, preference, marketing, demographics, shocks, seasonal influence |
| Supply, equilibrium and diagrams | 8 | Seven provisional integrated specimens; graph construction lacks student drawing assessment and cannot count as mastered |
| PED, revenue and YED | 10 | Existing `BUS-MKT-008` node methods and applications are potential reuse, **not independently accepted**; no original Edexcel-specific assessment specimen in this handoff |
| **Total** | **26** | **7 unreviewed specimens, 1 visual-only, 18 unaddressed** |

The supplied five-section original learning specimen and two original fictional written questions are author artefacts, **not official Pearson assessments**. The proposed 8/10 marks and assessment-objective allocation need independent A3 and A4 decisions before any claim of Edexcel authenticity or marking readiness. Question-answer keys and equations are only deterministically checked.

## Source-use operations: precise human decisions needed

| Source operation | Current evidence | Decision boundary |
| --- | --- | --- |
| Pearson 9BS0 specification reference | Official PDF and Pearson current 2015 qualification page; publisher copyright. Classification `REFERENCE_ONLY` | **Reference-only** structured facts, IDs and alignment checks; no protected Pearson body text or graphics sent to model contexts or reproduced in learner items. No expansion of permission proposed |
| Existing Business v0.8 reuse | Effective 81-node candidate, exact fingerprint `0f9a9423102cfa26b11dad1ed4d99eb5594c7b8a26d4d84fd8a42d2994dd0241` | Independent evidence must confirm reuse for the *exact* 9BS0 skills. Candidate links and formula presence alone do not justify `REUSE_SUFFICIENT` |
| LOUIS *Microeconomics* 2024, chapter 3 | [Chapter](https://louis.pressbooks.pub/microeconomics/chapter/demand-and-supply-3/) displays **CC BY 4.0 except where otherwise noted**; existing source register `SRC-OER-LOUIS-MICRO-2024` is eligible in its prior context. Chapter illustrations are separately credited to OpenStax or other parties | **New operation decision pending**. Review the precise AI-worker material, applicable base licence, separately credited exclusions and complete attribution. No third-party images or unapproved material should be supplied. If no LOUIS text is needed in the new worker context, explicitly document that input exclusion rather than inventing a blanket licence approval |
| Revision-owned draft/diagram/question bundle | Original synthetic refill-pack equations and Revision-authored draft artefacts, retained with exact Git fingerprints | Permitted to *prepare for qualified/independent review* within applicable rights-safe inputs, but not proof of correct educational depth, verified board alignment, approved Foundation or learner publication |

**Action for authorised source-rights reviewer:** decide whether the intended narrow source operation uses no LOUIS text, permissible attributed licensed text only, or must be blocked pending further legal/permission evidence. Retain approval identity, exact source/version, intended worker inputs, AI/commercial use, exclusions, attribution format and date in the governed source-use register. **An AI-authored handoff cannot approve that operation on behalf of a human.** No new provider calls or source ingestion occur in this package.

## One fixed-question independent educational review

The independent reviewer should receive this manifest and the *exact pinned* Version 0.8 candidate + author specimen, original drawings, approved structured board-alignment metadata and source-licence decisions. Do not supply Pearson protected prose or the generating agent's hidden rationale. For source verification, use the original official PDF in a separately authorised reference-only evidence procedure.

Six fixed checks are recorded in the manifest, each starting `NOT_PERFORMED`:

1. **A1 — subject and exact qualification:** independently verify all 26 reference/skill proposals, identify missing or misclassified obligations, confirm Year 2027 course and paper scope. Record affected skill ID, evidence, correction, explicit accepted/rejected coverage.
2. **A2 — learning depth:** adversarially check the original five sections, supply-shift diagram examples, meaning and business consequences, realism, possible misconceptions and inappropriate simplification.
3. **A3 — original assessment:** independently recompute all calculation answers and challenge case logic, question demand, appropriateness of 8- and 10-mark variants and alignment to approved assessment objectives.
4. **A4 — marking reliability:** find double-counted marks, unjustified mark splits, valid alternative responses, missing partial-credit paths and anchor/calibration requirements. Author's own example answer is not a blind mark.
5. **RIGHTS — source operations:** authorise or explicitly block the **specific** use of LOUIS, its CC BY obligations/exclusions, the Pearson reference-only boundary and the original authored input set.
6. **EXPERT — subject reviewer:** qualified Business specialist evaluates curriculum completeness and A-level assessment authenticity using the fixed checked source/rights evidence and independent A1–A4 findings.

**Reviewer result contract:** exact candidate Git blob SHA and Foundation fingerprint; independent context and exclusion identifiers; reviewer identity/capacity, review date and actual time, fixed question ID, verdict, every item-level `blocking/material/minor/no issue` finding, reproducible calculation/source reference, smallest remediation, affected skills, re-review decision. **Two rounds maximum**; genuine unresolved disputes escalate, with the historical findings preserved. A pass here is not `ai_assured`: the full exact Course/Exam Truth plus fresh external-source challenge and the applicable lifecycle proof still gate that state.

## Decision and shortest path after feedback

The review owner should record decisions once, then apply **only affected** source/subject-node/course deltas in a governed branch. The next deliverable must be a working, assured **whole Market 1.2** original learner-content slice with real skill-valid Practice, not a fourth unvalidated example.

Do not assume drawing is assessed. A separate feature Ready decision is required before new learner graph-capture functionality. Graph interpretation can continue on supported modes but must not grant construction mastery.

All 2027 Paper 3 annual context, entire course requirement census, component mark/AO and source-universe decisions remain for **whole-course Stage 5**; a correct Market handoff does not close them. Document impacts belong with subsequent governed code/technical PRs; the historical 22–25 October experiments remain untouched.

**This branch:** non-publishing review handoff + bounded exact-input verifier/tests + technical run log, no normative rule change and no new runtime import. Retained provider calls **0**, spend **$0 for this provider-free operation**; independent reviewer cost and elapsed end-to-end production remain **not measured**. Publication / Foundation / student evidence remains HOLD.

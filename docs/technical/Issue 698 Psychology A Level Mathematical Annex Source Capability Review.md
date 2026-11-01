# Issue #698 — Psychology 7182 A-level Mathematical Annex §7.2 source-to-published-asset candidate audit

**Status: PROVISIONAL A1 SOURCE-DECOMPOSITION AND SUPPLY CHECK, NOT EDUCATIONAL OR LIVE ACCEPTANCE.**

## Reference and scope

- Official **Founder-supplied** AQA A-level Psychology **7182, version 1.4, 1 September 2025**, 38-page PDF, SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`.
- Independently inspected exact A-level **Annex §7.2, printed pp35–37**, including the table on p36 and its algebra/graphs continuation on p37. This work does **not** use AS §7.1, a replacement exam board specification, an unofficial website, past-paper protected text, or alternative version.
- Qualification source-rights: **REFERENCE_ONLY**. This inventory uses independently paraphrased capabilities and source locators, not protected paragraphs, official exam questions or the AQA table's prose.
- The annex says that **at least 10% of A-level Psychology assessment marks** involve mathematical skills; that is an **overall assessment design threshold**, not a guarantee of 10% of every paper, teaching module, practice set, website or student's completed questions.
- Examples alongside the annex skills are **illustrative, not exhaustive**. In particular, referencing Chi-squared formulae or degrees of freedom as an algebra illustration is **not** independent evidence that the full Chi-squared calculation is required under the explicitly enumerated §4.2.3.3 inferential-testing syllabus; the current sign-test calculation is an explicit curriculum demand. Avoid expanding or understating published obligations through example columns.

## Source-first candidate checks

The machine-readable `scripts/assurance/data/aqa-psychology-7182-maths-annex-source-review.json` decomposes the table into **32 independently observable candidate checks** (5 arithmetic, 22 handling-data, 3 algebra and 2 graphs), each with its printed source page, capability, independent-response mode, optional **actual published candidate asset IDs and their evidence family**, and explicit **unverified** Learn/Practice/Exam Prep/learner acceptance.

This count is a deliberately more granular *audit worklist*, **not** an official AQA total or an externally verified completeness denominator for the full course. Some single source rows are split into construction/interpretation or ratio/fraction/percentage so a matching multiple-choice recognition task cannot silently earn credit for a separate construction or calculation capability. No item is currently marked educationally adequate, independently assessed as mastered, or accepted on the signed-in website.

### Early evidence observations, checked against real published packs

- `psy-rm-applied-mean-01` gives **scored MCQ recognition** of an arithmetic mean. `psy-rm-applied-drill-average` is a **self-marked construction/calculation drill**, not one independently software-scored worked solution.
- Four `rev7182-4.2.3-sd-population-0[1–4]` question IDs are **one-mark typed final-number standard-deviation** candidates. The current source states population convention explicitly. They do **not** establish independently scored mathematical working or all standard-deviation teaching and contexts.
- `psy-rm-applied-histogram-01` recognises an unequal-bin frequency-density property by MCQ; `psy-rm-applied-drill-histogram` asks for **unscored on-paper construction**. Neither proves a teacher-verified constructed histogram in the actual student interface.
- The now-production-verified two original sign-test questions `rev7182-4.2.3-sign-test-01/02` separately score only final S values. They do not establish broader test application, reasoned choice, significance or inference mastery.
- Four named test-choice MCQs are **scored recognition only**, not a verified written justification of test choice. Candidate IDs in the table are deliberately bounded, not a claim that all possible inferential MCQs or tests have been searched or accepted.
- **No independently verified candidate** is currently recorded for student-constructed scatterplots, authentically retrieving values from statistical tables, full formula substitution, or several elementary mathematical skills. Blank candidate lists mean **not linked in this bounded audit**, rather than proof the whole learner course has no related resource.

Tests in `scripts/assurance/aqa-psychology-7182-maths-annex-source-review.test.ts` validate the actual **all-three published paper packs**, resolve each cited candidate to its **correct assessment family**, enforce honest distinctions for self-marked drills versus scored responses, check the source identity, require all 32 review flags to remain unverified, and explicitly prevent the assessment-wide 10% threshold or versioned source from being misrepresented.

## Follow-on educational work

1. Independently review these 32 candidate capabilities against the §4.2.3 Research Methods taught content and the exact applicable Paper 1/2/3 assessment obligations; this annex pass cannot silently complete the section-4 requirement universe. Include mathematical application across core and chosen Paper 3 options.
2. Read actual Learn content for depth, correctness, examples and misconceptions; assess independent capability evidence rather than matching keywords, topic labels or raw question counts.
3. Prioritise genuine gaps in graph/scatter plotting, significance-table *lookup*, procedure/working verification and data interpretation; classify each as inadequate content, unsupported interface or still unverified.
4. Implement bounded original learner corrections with A2/A3 fresh-context adversarial review, exact-step scoring limits, authoritative source provenance, deterministic browser/integration tests and user progress preservation. Authenticate real saved Practice/Progress/Plan interactions under #703/#704/#705.
5. Retain human educator/examiner and full-course acceptance limits. **Do not promote** provisional source-inventory items as completed course coverage.

**Documentation impact:** New indexed technical note, original structured source-first audit and production-pack candidate tests. This is a **documentation/evidence-only proposal**, not a live content, interface, marking, schema, policy, source-rights or learner-data change. No ADR or new normative authority is necessary. Historical evidence unchanged. Run full current-main CI and use normal branch/PR governance, with Founder approval required before any merge.

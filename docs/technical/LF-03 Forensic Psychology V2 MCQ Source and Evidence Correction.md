# #698 / #787 — Psychology Forensic Psychology V2 objective Practice correction

**State: DRAFT / EDUCATIONAL A3 HOLD / NOT MERGED / NOT LIVE / NOT LEARNER ACCEPTED.** This governed candidate corrects one narrow MCQ design defect, not the complete AQA 7182 Forensic Psychology course or written assessment. Date: 8 November 2026.

## Source-first, rights and canonical learner route

- Founder-provided official AQA A-level Psychology **7182 v1.4 (1 September 2025), A-level first examinations 2027**, original PDF SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`.
- Exact source: **§4.3.9 Forensic Psychology, printed pages 23–24**, four multi-part A-level content bullets. This is a Paper 3 **Option 3 alternative** (not a compulsory topic for every student). Source-use status **REFERENCE_ONLY**. Do not copy AQA protected questions, passages or marking schemes.
- Existing canonical learner entry: `/revision/app/` → enrolled AQA Psychology 7182 → **Practice** → **Forensic Psychology**, route `#/courses/aqa%3Aaqa-a-level%3A7182/practice/forensic-psychology`. Data lives in `content/psychology/aqa-a-level/shared/course.ts`, projected to all three actual ContentPacks. Do not create a separate question engine, recommendation service or course variant.

## Demonstrated bounded defect and original proposed correction

The original four source-prototype one-mark MCQs `psy-psy1601-check` through `psy-psy1604-check` present the **same four concept choices** in varying positions. This is a repeated-option-set weakness: an answer list can be memorised rather than each multi-part source bullet independently understood. This does **not** prove the original factual keys were incorrect.

Four new, **original** `-v2` identities each require a different case-grounded, single-best-answer decision:

| Source requirement | V2 identity | Authored answer index (zero-based) | Narrow valid decision |
| --- | --- | ---: | --- |
| PSY-16-01 | `psy-psy1601-check-v2` | 1 | Spatial location evidence supports *geographical profiling*, not a categorical type or certain offender identification |
| PSY-16-02 | `psy-psy1602-check-v2` | 3 | Genetic/neural risk association is non-deterministic; environmental context and causal limitations remain |
| PSY-16-03 | `psy-psy1603-check-v2` | 0 | An ambiguous encounter interpreted as a hostile intention demonstrates *hostile attribution bias* rather than offence minimisation or proven peer learning |
| PSY-16-04 | `psy-psy1604-check-v2` | 2 | Voluntary, facilitated harm-and-reparation dialogue indicates *restorative justice* rather than prison token economy, anger management or custodial sentencing |

The 4 source bullets require considerably more than these four distinct decisions: organised/disorganised and investigative profiling, detailed genetic and neural research, Eysenck/differential association/moral reasoning/cognitive distortions, and custody/anger management/behaviour modification/restorative work all need further Learn, applied Practice, extended AO3 and independent review. Do **not** report each bullet educationally passed because one case has a correct key. A QA pattern heuristic alone cannot validate explanations or distractors.

## Historical and planning integrity

- Immutable historical scored V1 responses, old original keyed positions, completion history and source IDs remain intact. Fresh Practice uses **only new V2 IDs** after release.
- Exact V1 `psychologyLegacyForensicQuestions` and `legacyForensicPool` reconstruct only previously saved owner-scoped four-question content fingerprints. Unknown/different course/topic/fingerprint fails closed. No schema change or migration.
- The old four repeated-option IDs become ineligible for **newly computed** Understanding/Exam readiness confidence only within the real Psychology AQA 7182 paper family. This does not delete or alter old raw marks. One current software-keyed choice remains narrow, topic-scoped performance evidence, not verified subskill mastery.
- Paper 3's existing **96-mark timed paper total and option selection** remain unchanged; this is an objective Practice-only correction.

## Gate status and evidence required before release

- **A1:** manually checked original Founder specification §4.3.9 against four source-bullet IDs in the already published crosswalk. The source section is accurate; item-level education adequacy and all named subskills are not passed.
- **A2/A3: HOLD.** An independent fresh-context blinded response/answer-key and distractor plausibility review of the exact proposed code blob, *then* a separate adversarial authored-explanation and factual review, are required. Resolve every material/blocking issue before marking the draft ready. An AI review is not a qualified examiner or evidence of actual student discrimination. The previous trusted one-purpose reviewers for PR #816/#825 must not be misrepresented as having reviewed this content.
- **Deterministic/QA candidate:** `forensic-psychology-mcq-v2.test.ts` checks source hash, IDs, all three pack projections, distinct options, score provenance, V1 exclusion from inferred readiness and exact saved checkpoint recovery. Existing source/launch guards and a signed-in, responsive Practice/evidence/reload Playwright scenario are extended. No passing CI is claimed until an actual exact-head run finishes.
- **Release:** integrate latest approved `main`; prove full risk-selected current-head CI/Auth/RLS/browser; explicit separate Founder approval of this PR; merge; independent actual Pages deployment + path-to-live and production smoke. Genuine original learner acceptance under #703/#765 remains unobserved even after synthetic tests pass.

## Documentation-impact check

This is a correction within existing Course Learning Blueprint and Claims and Progress Governance, not a new feature requiring Analyse→Ready. The same PR must contain authored V2 source, tests, exact legacy compatibility, technical note and INDEX. Do not revise historical audit records. No product normative, business-operations, security, subscription, external licence or database architecture change is introduced. Keep #698/#787 open for the full published MCQ and source-to-live assurance programme.

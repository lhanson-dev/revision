# LF-03 — Social Influence MCQ assessment validity and saved evidence safety

**Status (2 November 2026):** Governed candidate fix, **NOT approved / merged / live**. Educational assurance A3 **HOLD** until a separate fresh-context independent adversarial review of this exact PR head and resolution of any material findings. Real student browser acceptance and production verification outstanding.
**Programmes:** [#765](https://github.com/lhanson-dev/revision/issues/765), [#698](https://github.com/lhanson-dev/revision/issues/698). Does not depend on unmerged [#773](https://github.com/lhanson-dev/revision/pull/773) or [#774](https://github.com/lhanson-dev/revision/pull/774). Prior Social Influence A2 Learn remediation is already merged separately in #768.

## Root cause reproduced from approved main

At `63ad63f6b2aa4835a7484e3b59b85a0a03bfdf2c`, `psychologyQuestions` in `content/psychology/aqa-a-level/shared/course.ts` created one item per course-truth requirement. `objectivePracticeOptions` selects exactly three labels from all other requirements in the same topic and appends the correct label at `stablePsychologyPracticeHash(requirementId) % 4`. For four-source-parent Social Influence there are only four available concept labels, guaranteeing **the identical four-option multiset** in every question. Correct positions are fixed D,D,C,B. The stem generator only extracts the first concept definition, and feedback appends the same generic explanation. No live/shuffled option selection is involved. The canonical learner Practice path runs through discovered Psychology content packs → `content-adapter` → `FocusedLearningWorkspace` → `buildQuestionPool` → `PracticeQuestionView` → `createMultipleChoiceEvidence`.

The learner's exact authenticated session was **not accessed**; this is independently inspectable **source/runtime reproduction**, not an assertion that a genuine user/browser session was replayed.

## Precise V1 inventory and V2 correction

| AQA parent | Old stable ID | Old four options A / B / C / D | Old correct / position | New V2 ID and source-aligned single skill | New correct / position |
| --- | --- | --- | --- | --- | --- |
| PSY-01-01 | `psy-psy0101-check` | Minority influence / Locus of control / Obedience / Conformity | Conformity / D | `psy-psy0101-check-v2`: recognise outward compliance without private change in an unfamiliar Asch-style situation (AO2 application) | Compliance / B |
| PSY-01-02 | `psy-psy0102-check` | Minority influence / Locus of control / Conformity / Obedience | Obedience / D | `psy-psy0102-check-v2`: identify setting/authority legitimacy as an obedience variable (AO2 application) | Setting may affect perceived authority legitimacy / D |
| PSY-01-03 | `psy-psy0103-check` | Conformity / Minority influence / Locus of control / Obedience | Locus of control / C | `psy-psy0103-check-v2`: apply social-support/dissent despite a dissenting answer being incorrect (AO2 application) | Social support can break unanimity / A |
| PSY-01-04 | `psy-psy0104-check` | Conformity / Minority influence / Locus of control / Obedience | Minority influence / B | `psy-psy0104-check-v2`: discriminate flexibility from commitment/rigidity in an original campaign scenario (AO2 application) | Flexibility while retaining a coherent goal / C |

All question wording, options and complete feedback are authored in `content/psychology/aqa-a-level/shared/social-influence-mcq-v2.ts`. Feedback explains the correct mechanism and the closest misconception; no letter-only answer. New option sets are pairwise distinct. New positions B, D, A, C; static deterministic keys, not runtime shuffling. They assess a bounded **sample** of AQA §4.1.1, not all 21 provisional demand checks. Course-pack items remain **untagged topic-level scored evidence** through the existing adapter (which defaults to the Apply level); the proposed AO2 classification is an educational *review label*, not newly introduced fine-grained mastery evidence.

### Source and rights

- AQA Psychology 7182, v1.4 dated 1 September 2025, §4.1.1 printed p17, original Founder-supplied PDF SHA256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`; REFERENCE_ONLY, structured curriculum alignment, not copied learner prose.
- Original permitted subject truth: `research/source-first-course-prototype/psychology-course-truth/topic-01-social-influence.json`, with OPEN source evidence and explicit provenance; existing #768 A2 Learn correction and source crosswalk. Avoid earlier-cohort **identification** or Zimbardo as mandatory requirements.
- No AQA question, case, mark scheme or protected body text reproduced. This is original Revision educational material.

### Learner evidence and in-progress checkpoint handling

Replacing a key/assessment meaning **under the same content ID would be unsafe**. The existing historical question IDs remain completely unchanged in prior scored evidence records. The **new** four items use `-v2` IDs. Existing `createMultipleChoiceEvidence` records source, selected index, keyed index, boolean correctness and content ID at the time of attempt; no migration and no reinterpretation of old values. No claim can be made that a particular learner has attempted any affected question without authenticated owner-scoped data access.

Saved 14-day Practice sessions are content-fingerprinted and fail closed on unauthorised changes. `practice-checkpoint-compat.ts` reconstructs the **exact old four-item Practice pool** solely for already-persisted Social Influence checkpoints with a matching historical SHA-256 fingerprint. A checkpoint with an unknown fingerprint, another topic/course or expired data is not silently restored. In-flight pending answer intent is replayed with the **old** immutable keyed index and evidence ID, not against V2. Fresh sessions display only V2. An intact old session may finish with V1 questions, disclosed in its assessment provenance; new corrected questions apply after finishing/discarding the old session. If a later release materially changes the rest of the Social Influence pool, old compatibility must be re-reviewed and must fail closed rather than guess.

No auth, RLS, database, scoring formula, question engine, or history mutation is introduced. Tests must exercise real selected vs authored keys and exact resume fallback.

### Repeatable quality checks

`scripts/assurance/lf03-mcq-quality.ts` produces item-ID-specific hard errors for missing/invalid answer keys and empty/duplicate options; **review queues** (not automated subject verdicts) for identical option sets, ≥60% position imbalance in samples of ≥12, runs of four correct positions, near-duplicate stems, disproportionate answer length and generic feedback. Tests run against actual Psychology and Business published pack items and structured Business bank adapter. Intentional spaced retrieval and individual repeated positions are not automatically defective. These checks cannot prove distractor plausibility, all keys, exam demand, AO alignment or educational validity.

## A1/A3 assurance and truthful acceptance

| Gate | Current evidence | Decision |
| --- | --- | --- |
| A1 exact qualification and Section 4.1.1 source | Founder official PDF version + existing approved structured source crosswalk; four parent demands verified | Scope mapped; detailed inference requires reviewer |
| A3 individually blind-answer all four | Author's candidate keys + software key/feedback consistency checks; **no independent reviewer yet** | **HOLD** |
| Fresh-context adversarial A3 finding register | Separate independent reviewer not yet executed on this branch | **HOLD** |
| Hard option and key checks | Source tests added, pass/fail only after exact-head CI completes | Pending |
| Actual canonical Practice + responsive/browser scoring + restart | Playwright seeded synthetic signed-in end-to-end test added for desktop/tablet/phone; **not a real learner** | Pending CI |
| Prior saved scores and owner-scoped checkpoints | Tests cover immutable old IDs/keys, exact-fingerprint recovery, no duplicate new evidence; real database acceptance not run | Pending CI; real acceptance pending |
| Production release | Explicit Founder merge approval, successful path-to-live and post-deploy validation required | NOT MERGED / NOT LIVE |

**Not educationally assured merely by CI:** causal or historical nuance, all plausible distractors, independently blind answer validity, full AQA syllabus sufficiency, actual learner outcomes and professional examiner review. The narrower automated correction may be reviewed for merge only after required independent A3 review, exact-head CI and browser evidence pass; live/learner acceptance follow deployment.

## Documentation-impact decision

No new normative product behaviour was requested: Learning Blueprint, Claims and Progress, Content Accuracy Assurance Gate and Testing & Assurance Standard already require meaningful objective questions and evidence-safe scoring. This is a **defect correction**. This technical implementation note, #765 and #698, `90-governance-registers/Defect Register.md`, repeatable checks, and `INDEX.md` are therefore the governed documentation record. Do not rewrite original prototype research or the historical A2 / A3 evidence.

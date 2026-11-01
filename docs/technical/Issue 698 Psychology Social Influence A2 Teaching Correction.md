# Issue #698 — AQA Psychology 7182 Social Influence source-to-Learn A2 correction

**Status:** proposed **learner-facing** A2 teaching correction, not published. Source-first A1 alignment and deterministic checks proposed; **fresh independent A2 adversarial review NOT RUN**, no expert assurance, no actual learner acceptance. PR must not merge merely on green CI.

## Canonical source and runtime

The sole canonical learner experience is `/revision/app/`, and the published Psychology course is assembled from the three `content/psychology/aqa-a-level/paper-*/index.ts` packs via `src/engine/content/content-registry.ts` and the shared course adapter. The four existing Social Influence Learn page identities are kept exactly intact:

- `PSY-01-01` → `social-influence-psy0101`
- `PSY-01-02` → `social-influence-psy0102`
- `PSY-01-03` → `social-influence-psy0103`
- `PSY-01-04` → `social-influence-psy0104`

The curriculum reference is the Founder-supplied **AQA A-level Psychology 7182 version 1.4 (1 September 2025)** PDF, 38 pages, **SHA256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`**, §**4.1.1** printed **p17**, **REFERENCE_ONLY**. It has four parent-bullet requirements in Social Influence and separate general Paper 1 AO and ethical practical research obligations. **This exact version lists internalisation and compliance** for conformity types; older AQA lists containing an additional identification type or Zimbardo's conformity-to-social-roles study must not be treated as governing this cohort.

Existing original reusable subject input `research/source-first-course-prototype/psychology-course-truth/topic-01-social-influence.json` is a **published production dependency** but remains unchanged as historical production input. Original expanded learner teaching resides in `content/psychology/aqa-a-level/shared/social-influence-learn.ts` and is integrated into shared `psychologyLearn` only at the four matching requirement IDs. No new runtime, route, data model or content-generator architecture is introduced.

## Independently distinguish the source demands

`scripts/assurance/data/aqa-psychology-7182-social-influence-atomic-review.json` provisionally decomposes four source parent bullets from the merged #767 section-4 crosswalk into **21 named demand checks**: 8 for conformity and Asch, 7 for obedience and Milgram, 3 for resistance, 3 for minority influence. These are **Revision provisional audit rows, not 21 official AQA marks, individual blueprint approval or a full course denominator**. Every row has a parent source ID and real unchanged Learn page ID, and retains `teachingAdequacy=unverified`, `practiceAdequacy=unverified` and `signedInLearnerAccepted=false`.

### Bounded, source-grounded teaching findings and corrections

| Source | Previous published wording | Proposed A2 addition | Remaining evidence |
| --- | --- | --- | --- |
| §4.1.1 bullet 1 | Names conformity types, NSI/ISI, group size/unanimity and task difficulty, but Asch procedure and causal variation distinctions are summarised briefly | Asch line-task procedure and its implications; distinguish majority size, dissent/unanimity, ambiguity; contrast outward compliance with private internalisation; bounded evaluation | Independently authored unseen-context response and evaluation performance still unverified |
| §4.1.1 bullet 2 | Covers agentic state, legitimacy, proximity and authority cues; location and named Authoritarian Personality were only implicit | Explicit university-to-office **location** contrast; proximity versus location versus uniform; Milgram baseline procedure; named Authoritarian Personality and limits of F-scale inference | A2 fresh-context review pending, precise independent explanation/evaluation assessment missing |
| §4.1.1 bullet 3 | Resistance examples focus mainly on majority conformity | Differentiate breaking unanimity in conformity and models of disobedience in obedience; define internal/external locus and explain non-determinism | Independent application under both contexts unverified |
| §4.1.1 bullet 4 | Mechanisms named and described briefly | Original applied minority example of consistency, commitment, flexibility and the risk of rigidity | Unseen transfer/extended evaluation unverified |

The additions are original learner prose and not copies of specification paragraphs, AQA past-paper questions or mark schemes. Related reusable factual-support references: existing prototype provenance cites open psychology materials and peer-reviewed research; the proposed teaching also aligns with [OpenStax Psychology 2e §12.4](https://openstax.org/books/psychology-2e/pages/12-4-conformity-compliance-and-obedience), including Asch's line task and Milgram's main situation variations. The original AQA PDF decides scope, not OpenStax.

## Tests, boundaries and release gate

New `content/psychology/aqa-a-level/shared/social-influence-learn.test.ts` checks source identity and the 4-to-21 parent mapping, all four unchanged Learn page IDs in all three actual published paper packs, explicit named details and stable four preexisting generic Social Influence recognition MCQs. A topical MCQ **does not** prove an independently assessed named skill. No questions, scoring, feedback persistence, Progress, planner, exam component, subscription, child data or database migration changes.

**Mandatory HOLD before publication:** fresh-context independent A2 review of the exact PR head and all four new explanation groups, including factual accuracy, misleading inference, omitted source conditions, comprehension and right-to-use; resolve material findings; validate exact-head current-main CI and obtain distinct Founder approval. The currently installed trusted PR #759 reviewer **cannot** be repurposed: it is hard-pinned to unrelated five Research Methods activities, not these Social Influence additions. Green CI is not independent educational sign-off.

### Documentation impact and next stage

This note and `INDEX.md` accompany the correction/assurance JSON and tests. No change of product normative authority is needed; the Course Learning Blueprint and Claims/Progress evidence limits continue to apply. The previously merged 117 source-bullet baseline and other historical audits are unchanged. The next source-first work remains remaining 16 topics' atomic decomposition and **actual** Learn/Practice/Exam Prep adequacy, plus #703/#704/#705 independent repair and real signed-in learner recheck. Do not close Issue #698 or claim a full Psychology audit.

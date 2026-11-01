# Issue #698 — AQA Psychology 7182 Social Influence source-to-Learn A2 correction

**Status:** proposed **learner-facing** A2 teaching correction, still **NOT published**. First fresh-context A2 review on exact head `3211206ec8ddd8e9395f15a6e877dd9c4184c464` **FAILED/HOLD** on five material educational issues plus one minor Practice limitation. A materially revised correction is prepared on this branch; independent A2 re-review and exact-head CI are **PENDING**. Original failed review remains preserved as dated audit evidence. No expert assurance or real learner acceptance. PR must not merge merely on green CI.

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
| §4.1.1 bullet 1 | Names conformity types, NSI/ISI, group size/unanimity and task difficulty, but Asch procedure and causal variation distinctions are summarised briefly | Asch line-task procedure and its implications; distinguish majority size, dissent/unanimity, ambiguity; contrast outward compliance with private internalisation; bounded evaluation | New worked scenario and checked Asch results added; independent scored unseen-context performance still unverified |
| §4.1.1 bullet 2 | Covers agentic state, legitimacy, proximity and authority cues; location and named Authoritarian Personality were only implicit | Explicit university-to-office **location** contrast; proximity versus location versus uniform; Milgram baseline procedure; named Authoritarian Personality and limits of F-scale inference | First A2 review found material omissions; revised facts and limitations need fresh adversarial review; precise independent explanation/evaluation assessment still missing |
| §4.1.1 bullet 3 | Resistance examples focus mainly on majority conformity | Differentiate breaking unanimity in conformity and models of disobedience in obedience; define internal/external locus and explain non-determinism | Named Asch/Milgram resistance contexts and correlation limits added; independently scored application remains unverified |
| §4.1.1 bullet 4 | Mechanisms named and described briefly | Original applied minority example of consistency, commitment, flexibility and the risk of rigidity | Named Moscovici outcomes, dual consistency, augmentation and evaluation added; unseen independently scored evaluation remains unverified |

The additions are original learner prose and not copies of specification paragraphs, AQA past-paper questions or mark schemes. Related reusable factual-support references: existing prototype provenance cites open psychology materials and peer-reviewed research; the proposed teaching also aligns with [OpenStax Psychology 2e §12.4](https://openstax.org/books/psychology-2e/pages/12-4-conformity-compliance-and-obedience), including Asch's line task and Milgram's main situation variations. The original AQA PDF decides scope, not OpenStax.


### Verification of historical study detail added in this revision

Curriculum demand is grounded only in the Founder-supplied AQA 7182 v1.4 Section 4.1.1 p17. The separate historical study outcomes and criticisms are checked against secondary or scholarly sources as evidence, **not substitute curriculum authority**:

- **Asch, 1955**, original line-judgement evidence and majority size patterns: https://www.scientificamerican.com/article/opinions-and-social-pressure/ ; study summary: https://www.courts.state.co.us/userfiles/file/Administration/Probation/ResearchInBriefs/RIB_GroupPressure_Nov18.pdf . Published research reports 36.8% of critical trial judgements and an explicit control comparison; the percentage is not the proportion of participants always conforming. Source remains copyright protected; new learner prose is independently authored.
- **Milgram variation synthesis**: https://doi.org/10.1371/journal.pone.0093927 , including source condition distinctions and maximum 450 V. Original often-cited 65% initial condition is not misrepresented as the same condition as the 62.5% voice-feedback rate; associated proximity/touch, location, remote experimenter and role change outcomes are kept separate. The treatment of uniform correctly acknowledges the authority-role confound.
- **Authoritarian Personality** historic developmental hypothesis: https://academic.oup.com/reference/62403/reference-article-abstract/555465970 ; **Jackson and Messick (1956)** critique of F-scale response acquiescence: https://www.ets.org/research/policy_research_reports/publications/report/1956/ibqj.html . Causal developmental certainty is explicitly rejected.
- **Social-support evaluation**: Asch dissenters are distinguished from Milgram disobedient peers; evidence for the latter is in the same Milgram synthesis. Locus-of-control causality is not inferred from questionnaire association.
- **Moscovici, Lage and Naffrechoux** original consistent-minority experimental results (8.42% public green judgements, 1.25% inconsistent, 0.25% no-minority control) https://classiques.uqam.ca/contemporains/moscovici_serge/minorite_consistante/minorite_consistante_texte.html ; distinguishes public response from private conversion, diachronic versus synchronic consistency and the scope of artificial tasks.

A historic study may have different baseline conditions and measurement definitions. The new pages explicitly prevent treating quoted rates as universal or assuming that changes observed under several experimental conditions were all due to one manipulated factor. These factual checks do **not** establish teaching effectiveness or authentic learner performance.

## Tests, boundaries and release gate

New `content/psychology/aqa-a-level/shared/social-influence-learn.test.ts` checks source identity and the 4-to-21 parent mapping, all four unchanged Learn page IDs in all three actual published paper packs, explicit named details and stable four preexisting generic Social Influence recognition MCQs. A topical MCQ **does not** prove an independently assessed named skill. No questions, scoring, feedback persistence, Progress, planner, exam component, subscription, child data or database migration changes.

**Mandatory HOLD before publication:** first [independent A2 workflow run #41349292308](https://github.com/lhanson-dev/revision/actions/runs/41349292308) produced an actual machine-readable `fail_hold` (5 material, 1 minor) on prior head `3211206e` (artifact ID `13099769709`). Historical findings are documented separately in `audits/2026-11-01-psychology-pr768-first-a2-hold.md` and in [PR #768 review comment #6563787877](https://github.com/lhanson-dev/revision/pull/768#issuecomment-6563787877). The revised candidate must obtain a **new fresh-context A2 review against its new exact PR head**, resolve any further material findings, pass exact-head current-main CI and obtain distinct Founder approval. The currently installed trusted PR #759 reviewer **cannot** be repurposed: it is hard-pinned to unrelated five Research Methods activities, not these Social Influence additions. Green CI is not independent educational sign-off.

### Documentation impact and next stage

This note and `INDEX.md` accompany the correction/assurance JSON and tests. No change of product normative authority is needed; the Course Learning Blueprint and Claims/Progress evidence limits continue to apply. The previously merged 117 source-bullet baseline and other historical audits are unchanged. The next source-first work remains remaining 16 topics' atomic decomposition and **actual** Learn/Practice/Exam Prep adequacy, plus #703/#704/#705 independent repair and real signed-in learner recheck. Do not close Issue #698 or claim a full Psychology audit.

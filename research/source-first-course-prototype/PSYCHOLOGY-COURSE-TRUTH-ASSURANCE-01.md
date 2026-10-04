# Psychology Course Truth Assurance 01

**Status:** Course Truth complete after deterministic reconciliation and internal challenge; latest exact-head CI pending; later production-level independent educational/assessment assurance remains pending  
**Course:** AQA A-level Psychology 7182 — revised specification, first A-level exams summer 2027  
**Checked:** 4 October 2026  
**Prototype authority:** `80-company-workflows/Source-First Course Prototype Experimental Exception.md`

## Purpose

Record the whole-course Course Truth assurance evidence for the completed 118-requirement Psychology Course Truth without overstating what software checks or internal challenges can prove.

This is experimental evidence. It is not learner-publication approval, `foundation_approved`, or a substitute for the active continuation run's later fresh independent educational and assessment assurance before restricted-pilot publication.

## Candidate entering this gate

- exact named course requirements: **118**;
- requirements with reusable source support: **118 / 118**;
- live source-review state: **118 covered / 0 partial / 0 gaps**;
- Course Truth records marked `course_truth_ready`: **118 / 118**;
- named topic shards: **17 / 17**;
- Research Methods: **34 / 34**;
- known material subject-truth gaps after remediation: **0**;
- known material rights blockers after remediation: **0**;
- paid source/licence spend: **£0**;
- paid provider spend recorded for continuation source closures: **£0**.

## Deterministic reconciliation

A bounded validator was added at:

`scripts/assurance/psychology-course-truth.test.ts`

It checks that:

1. the stable AQA scope contains exactly 17 topics and 118 unique requirement IDs;
2. the manifest contains 17 topic shards whose named and ready counts sum to 118;
3. every scope requirement appears exactly once in the Course Truth shards, with no missing, extra or duplicate IDs;
4. every requirement retains AQA as `REFERENCE_ONLY` alignment and has material independently structured subject truth;
5. every requirement has source evidence and at least one source that is not merely `REFERENCE_ONLY`;
6. reusable source records include a URL, licence and supported-claim description and are rejected if the recorded licence is non-commercial, unknown or a vague historical placeholder;
7. high-risk source records whose licences have been directly rechecked are pinned to their verified licence metadata so stale substitutions fail assurance;
8. every requirement is marked `course_truth_ready` with no known material subject-truth gap or rights blocker and is still not marked learner-asset-ready; and
9. the manifest records `courseTruthComplete=true` while retaining `wholeCourseIndependentAssurancePassed=false`, preserving the distinction between a completed Course Truth layer and the later production-level independent assurance gate.

The validator first passed in the ordinary Revision unit-test suite on exact branch head:

`5020edf2eaae159b93bca20b99e0cbee45154ec7`

The surrounding CI run was Revision CI **#2607**. Typecheck and lint also passed on that head before the unit-test pass.

After the Research Methods remediation, the full Revision CI then passed on exact branch head:

`07b8bb0831d9afa323e5befc25105810d6572e84`

The surrounding run was Revision CI **#2611** with conclusion `success`. Later provenance and completion-sequencing commits require their own exact-head CI; this record does not inherit a green status from an earlier head.

## Fresh internal Research Methods challenge

A separate internal challenge was applied to the 34 newly consolidated Research Methods records, concentrating on the two highest-risk failure classes for this topic:

- **rights/provenance overclaim** — treating public material as reusable without an established or accurately recorded licence; and
- **methodological overclaim** — turning AQA test-selection shortcuts or introductory heuristics into universal statistical/scientific rules.

### Finding CT-A01-F01 — incorrect ShareAlike licence version

**Severity:** material provenance defect, non-blocking once corrected  
**Requirement:** `PSY-07-32`  
**Finding:** the Course Truth record initially labelled the LibreTexts *Statistics for Behavioral Science Majors* non-parametric/sign-test source as `CC BY-SA 4.0`. Direct source inspection shows the cited work/page is `CC BY-SA 1.0`.

**Remediation:**

- corrected the Course Truth source metadata to `CC BY-SA 1.0`;
- retained the source as commercially reusable factual/methodological evidence;
- clarified that Revision is not adapting the source's protected expression in the Course Truth synthesis and that any future direct adaptation would have to honour the applicable attribution and ShareAlike obligations; and
- tightened PSY-07-09 at the same time from the broader phrase “known chance of selection” to the qualification-appropriate simple-random-sampling statement that each eligible member of the sampling frame has an equal chance of selection.

**Post-remediation state:** no known material rights blocker remains from this finding.

### Other Research Methods challenge checks

No further blocking or material Research Methods defect was identified in this internal challenge. In particular:

- AQA remains alignment-only rather than reusable teaching corpus;
- older LibreTexts mirrors used for OpenStax Sociology/Statistics evidence explicitly record `CC BY 4.0` on the cited editions/pages rather than relying on current OpenStax Psychology terms;
- the UniSQ *Statistics for Research Students* source explicitly records `CC BY 4.0`;
- NIST critical-value/significance material is treated as public-information/public-domain evidence rather than assumed open merely because it is accessible;
- ratio-versus-interval treatment is explicitly labelled as qualification framing rather than a universal claim that the two scales are identical;
- skewed-distribution mean/median/mode ordering is explicitly presented as a teaching heuristic rather than a mathematical identity;
- correlation is not treated as causation;
- statistical significance is not treated as practical importance or proof of a hypothesis;
- critical-value comparisons are not reduced to one universal greater-than rule; and
- the named inferential-test decision structure retains assumptions and design/data constraints rather than teaching a mechanical lookup table as sufficient statistical reasoning.

## Fresh whole-course internal challenge

A fresh cross-topic challenge was then applied across all 17 Course Truth shards and all 118 requirement records. The review concentrated on:

- material educational accuracy and responsible interpretation;
- whether historical qualification theories were incorrectly presented as settled modern truth;
- whether source evidence plausibly supports the material claim families attached to each requirement;
- high-risk methodological, clinical and biological overclaim; and
- source-rights/provenance precision.

No material educational-accuracy defect was identified in that pass. The Course Truth consistently distinguishes qualification framing from modern evidential qualification in areas such as attachment, clinical psychology, gender, schizophrenia, eating behaviour, aggression, forensic psychology and addiction rather than converting historical course models into unqualified modern claims.

### Finding CT-A01-F02 — vague retained licence metadata in Forensic Psychology

**Severity:** material provenance-record defect, non-blocking once corrected  
**Requirements:** `PSY-16-01`, `PSY-16-02`, `PSY-16-03`  
**Finding:** five source records were classified `OPEN` but retained the historical licence description `commercial-compatible open source retained by predecessor proof` rather than the applicable licence itself. That wording pointed back to predecessor evidence but was not precise enough for a self-contained Course Truth provenance record under the active source standard.

The affected sources were:

- `10.1002/jip.1531` — verified `CC BY`;
- `10.1177/0956797617744542` — verified `CC BY 4.0`;
- `10.1186/s40163-015-0018-5` — verified `CC BY 4.0`;
- `10.1016/j.tics.2023.08.013` — verified `CC BY 4.0`; and
- `10.1002/ab.21908` — verified `CC BY`.

**Remediation:**

- replaced the vague historical shorthand in the Forensic Psychology shard with the verified licence metadata;
- added the five rechecked sources to the deterministic `VERIFIED_SOURCE_LICENCES` map; and
- hardened the validator so vague placeholders such as `commercial-compatible`, `retained by predecessor`, `rights verified elsewhere`, `TBD` or `unspecified` fail Course Truth assurance.

**Post-remediation state:** no known material rights blocker remains from this finding.

## Sequencing correction — independent assurance is not the Course Truth completion gate

During assurance work the branch temporarily introduced a stricter rule than the approved Source-First continuation: it made fresh whole-course independent educational assurance a prerequisite for setting `courseTruthComplete=true` and for starting Exam Truth.

That was an invented over-gate and has been removed.

The active Founder-approved continuation sequence is:

1. complete Course Truth;
2. complete Exam Truth;
3. derive the Course Learning Blueprint;
4. produce complete learner assets;
5. build Marking Packs and learner-evidence mappings;
6. run production-level deterministic and fresh independent educational/assessment assurance;
7. integrate through the canonical learner architecture; and
8. verify the restricted student pilot.

The Source-First experimental authority also explicitly says the prototype is not required to inherit the current Content Factory review ceremony or provider sequence merely because it exists.

Accordingly:

- Course Truth is now complete because all 118 requirements are source-traceable and `course_truth_ready`, no known material subject-truth or rights blocker remains, and the bounded structural/provenance reconciliation is in place;
- `wholeCourseIndependentAssurancePassed` correctly remains **false**;
- learner-facing readiness remains **false**; and
- Exam Truth may now depend on the completed Course Truth without implying publication approval.

## Independence boundary

The Research Methods challenge and whole-course challenge above are useful Course Truth assurance evidence but are not represented as the continuation run's later fresh independent educational/assessment assurance. They were performed inside the same production/assurance continuation.

The fresh independent reviewer remains a mandatory pre-publication control at the production-level assurance stage and must be free to return blocking or material findings across Course Truth, Exam Truth and the derived learner/assessment assets.

## Current assurance state

| Gate | State |
| --- | --- |
| Requirement-ID reconciliation | passed on prior exact heads; latest exact-head rerun required after final status correction |
| Topic/manifest count reconciliation | passed on prior exact heads; latest exact-head rerun required after final status correction |
| Candidate readiness reconciliation | passed on prior exact heads; latest exact-head rerun required after final status correction |
| Basic recorded-rights/provenance invariants | two material metadata findings identified and remediated; hardened regression checks added |
| Research Methods internal adversarial challenge | passed after remediation, non-independent |
| Whole-course internal educational/provenance challenge | passed after remediation, non-independent |
| `courseTruthComplete` | **true** |
| `wholeCourseIndependentAssurancePassed` | **false — later production-level gate** |
| Learner publication readiness | **false** |
| Full Revision CI on latest exact head | pending after final Course Truth status/sequencing corrections |
| Integration validation against then-current `main` | pending before merge |

## Required next action

First, obtain green deterministic/Revision CI evidence on the final exact Course Truth head. Once that is green, PR #510 is a complete Course Truth change set and should be validated against then-current `main` before any Founder-approved merge.

The next substantive course-production phase is **Exam Truth**, not another pre-Exam review ceremony. Exam Truth must establish the AQA 7182 assessment model described in step 2 of the active continuation run while keeping official AQA assessment material `REFERENCE_ONLY` where required.

Fresh independent educational and assessment assurance remains mandatory at the later production-level assurance gate before restricted-pilot publication. This correction does not weaken that gate; it restores the sequence already approved for the experiment.

## Documentation impact

This record adds assurance evidence, records the two provenance remediations and corrects an accidental branch-level sequencing over-gate. It does **not** change normative authority: the correction restores the experimental artifacts to the already-approved Source-First continuation sequence. It does not publish learner content, grant restricted-pilot approval or alter the current production Content Factory operating model.
# Psychology Course Truth Assurance 01

**Status:** Deterministic candidate assurance passed on prior exact head; two internal provenance findings remediated; fresh independent educational assurance pending  
**Course:** AQA A-level Psychology 7182 — revised specification, first A-level exams summer 2027  
**Checked:** 4 October 2026  
**Prototype authority:** `80-company-workflows/Source-First Course Prototype Experimental Exception.md`

## Purpose

Record the first whole-course assurance evidence for the completed 118-requirement Course Truth candidate without overstating what software checks or internal challenges can prove.

This is experimental evidence. It is not learner-publication approval, `foundation_approved`, or a substitute for the run contract's fresh independent educational assurance.

## Candidate entering this gate

- exact named course requirements: **118**;
- requirements with reusable source support: **118 / 118**;
- live source-review state: **118 covered / 0 partial / 0 gaps**;
- Course Truth candidate records marked `course_truth_ready`: **118 / 118**;
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
4. every candidate requirement retains AQA as `REFERENCE_ONLY` alignment and has material independently structured subject truth;
5. every candidate requirement has source evidence and at least one source that is not merely `REFERENCE_ONLY`;
6. reusable source records include a URL, licence and supported-claim description and are rejected by the validator if the recorded licence is non-commercial, unknown or a vague historical placeholder;
7. high-risk source records whose licences have been directly rechecked are pinned to their verified licence metadata so stale substitutions fail assurance;
8. every requirement is marked `course_truth_ready` with no known material subject-truth gap or rights blocker and is still not marked learner-asset-ready; and
9. the manifest still keeps `wholeCourseIndependentAssurancePassed` and `courseTruthComplete` false.

The validator first passed in the ordinary Revision unit-test suite on exact branch head:

`5020edf2eaae159b93bca20b99e0cbee45154ec7`

The surrounding CI run was Revision CI **#2607**. Typecheck and lint also passed on that head before the unit-test pass.

After the Research Methods remediation, the full Revision CI then passed on exact branch head:

`07b8bb0831d9afa323e5befc25105810d6572e84`

The surrounding run was Revision CI **#2611** with conclusion `success`. Later provenance-hardening commits require their own exact-head CI; this record does not inherit a green status from an earlier head.

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
**Finding:** five source records were classified `OPEN` but retained the historical licence description `commercial-compatible open source retained by predecessor proof` rather than the applicable licence itself. That wording was sufficient to point back to predecessor evidence but was not precise enough for a self-contained Course Truth provenance record under the active source standard.

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

**Post-remediation state:** no known material rights blocker remains from this finding. The new exact branch head still requires its own CI before deterministic assurance can be claimed for that head.

## Independence boundary

The Research Methods challenge and the whole-course challenge above are useful pre-assurance evidence but **do not qualify as the run contract's independent educational assurance**. They were performed inside the same governed production/assurance continuation and therefore cannot honestly self-certify the independence gate.

The independent reviewer must still challenge the exact candidate after the current remediation commits and must be free to return blocking or material findings without inheriting this internal review's conclusions.

## Current assurance state

| Gate | State |
| --- | --- |
| Requirement-ID reconciliation | passed on `07b8bb0...`; latest exact-head rerun required after provenance hardening |
| Topic/manifest count reconciliation | passed on `07b8bb0...`; latest exact-head rerun required after provenance hardening |
| Candidate readiness reconciliation | passed on `07b8bb0...`; latest exact-head rerun required after provenance hardening |
| Basic recorded-rights/provenance invariants | two material metadata findings identified and remediated; latest exact-head rerun required |
| Research Methods internal adversarial challenge | passed after remediation, non-independent |
| Whole-course internal educational/provenance challenge | passed after remediation, non-independent |
| Full Revision CI on latest exact head | pending after provenance-hardening commits |
| Fresh independent educational assurance | pending |
| Integration validation against then-current `main` | pending before merge |
| `courseTruthComplete` | **false** |

## Required next action

Run deterministic/CI assurance on the new exact head. Then run a fresh independent educational review across that exact 118-requirement Course Truth candidate. The reviewer must challenge material accuracy, completeness for the stated AQA scope, responsible interpretation, methodology/statistics, and whether the cited evidence actually supports the material claims. Any blocking or material finding must be remediated and affected scope revalidated before `courseTruthComplete` is set true.

Only after the independent assurance passes should the prototype set `wholeCourseIndependentAssurancePassed=true`, set `courseTruthComplete=true`, refresh against then-current `main`, and move into dependent Exam Truth work.

## Documentation impact

This record adds assurance evidence and records remediation rather than rewriting predecessor evidence. It does not change normative production authority, publish learner content or alter the current Content Factory operating model. The source-metadata changes affect only the experimental Course Truth candidate and its bounded assurance test.
# Psychology Course Truth Assurance 01

**Status:** Deterministic candidate assurance passed; internal finding remediated; fresh independent educational assurance pending  
**Course:** AQA A-level Psychology 7182 — revised specification, first A-level exams summer 2027  
**Checked:** 4 October 2026  
**Prototype authority:** `80-company-workflows/Source-First Course Prototype Experimental Exception.md`

## Purpose

Record the first whole-course assurance evidence for the completed 118-requirement Course Truth candidate without overstating what software checks or an internal challenge can prove.

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
6. reusable source records include a URL, licence and supported-claim description and are rejected by the validator if the recorded licence is non-commercial or unknown;
7. every requirement is marked `course_truth_ready` with no known material subject-truth gap or rights blocker and is still not marked learner-asset-ready; and
8. the manifest still keeps `wholeCourseIndependentAssurancePassed` and `courseTruthComplete` false.

The validator first passed in the ordinary Revision unit-test suite on exact branch head:

`5020edf2eaae159b93bca20b99e0cbee45154ec7`

The surrounding CI run was Revision CI **#2607**. Typecheck and lint also passed on that head before the unit-test pass. Later assurance/remediation commits require their own exact-head CI and this record does not inherit a green status from the earlier head.

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

**Post-remediation state:** no known material rights blocker remains from this finding. Exact-head CI/reconciliation must still pass after the remediation commit.

### Other challenge checks

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

This internal challenge is useful pre-assurance evidence but **does not qualify as independent educational assurance**, because it was performed within the same active production context.

## Current assurance state

| Gate | State |
| --- | --- |
| Requirement-ID reconciliation | passed on pre-remediation head; exact-head rerun required |
| Topic/manifest count reconciliation | passed on pre-remediation head; exact-head rerun required |
| Candidate readiness reconciliation | passed on pre-remediation head; exact-head rerun required |
| Basic recorded-rights/provenance invariants | one material metadata finding identified and remediated; exact-head rerun required |
| Research Methods internal adversarial challenge | passed after remediation, non-independent |
| Full Revision CI on latest exact head | pending after remediation commits |
| Fresh independent educational assurance | pending |
| Integration validation against then-current `main` | pending before merge |
| `courseTruthComplete` | **false** |

## Required next action

First rerun deterministic/CI assurance on the remediated exact head. Then run a fresh independent educational review across the exact 118-requirement Course Truth candidate. The reviewer must challenge material accuracy, completeness for the stated AQA scope, responsible interpretation, methodology/statistics, and whether the cited evidence actually supports the material claims. Any blocking or material finding must be remediated and affected scope revalidated before `courseTruthComplete` is set true.

Only after that assurance passes should the prototype treat Course Truth as complete and move into dependent Exam Truth work.

## Documentation impact

This record adds assurance evidence and records the remediation rather than rewriting predecessor evidence. It does not change normative production authority, publish learner content or alter the current Content Factory operating model.

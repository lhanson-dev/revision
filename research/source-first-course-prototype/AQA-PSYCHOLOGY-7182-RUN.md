# Prototype Run — AQA A-level Psychology 7182

**Prototype:** Source-First Course Prototype  
**Status:** Psychology proof complete — recommendation: `iterate`  
**Started:** 2 October 2026  
**Completed:** 2 October 2026  
**Purpose:** First independent proof of the source-first Foundation method

## Run instruction

This was deliberately **not** run through the current Content Factory workflow. The experiment follows `research/source-first-course-prototype/README.md` and the approved Source-First Course Prototype experimental exception.

## Question tested

Can a comprehensive AQA A-level Psychology 7182 Foundation candidate be made materially faster and cheaper by starting from high-quality material that is free and explicitly permits commercial reuse/adaptation and AI-assisted processing, then using AI mainly for structuring, reconciliation and genuine gaps?

## Course identity

- Awarding body: AQA
- Qualification: A-level
- Subject: Psychology
- Specification: 7182
- First teaching: September 2025
- First A-level exams: summer 2027
- AQA role: `REFERENCE_ONLY` scope/alignment, not reusable teaching corpus

## What was completed

### Exact scope

`AQA-PSYCHOLOGY-7182-SCOPE.json` records **118 stable named requirement IDs** across 17 topics:

- 71 compulsory requirements;
- 47 option requirements.

### Source discovery and rights

The prototype established a reusable source base across broad Psychology, neuroscience, abnormal Psychology, statistics, developmental Psychology, criminal justice and targeted open research.

Rights were treated fail-closed. Convenient but non-commercial sources were rejected rather than counted, including current OpenStax Psychology 2e, multiple NC Research Methods resources, Noba and other topic-specific NC material.

### Named coverage

All **118/118 named requirements** received a first named-source review.

Current state after targeted difficult-option reconciliation is recorded in `AQA-PSYCHOLOGY-7182-WHOLE-COURSE-METRICS.json`:

- **56 source-covered candidates**;
- **61 partial / bounded synthesis requirements**;
- **1 current source gap**;
- **117/118 requirements have some commercial-compatible reusable subject evidence**.

The one source gap is `PSY-17-06` — Prochaska's six-stage behaviour-change model. The model is easy to identify factually, but the convenient explanatory sources inspected carry non-commercial terms and are not counted as reusable corpus.

### Representative Foundation transformation

Two structured Foundation slices were produced:

1. `AQA-PSYCHOLOGY-7182-FOUNDATION-SLICE-SOCIAL-INFLUENCE.json`
   - 4/4 named requirements source-complete;
   - no unsupported new subject truth required;
   - paid provider spend £0;
   - paid source spend £0.

2. `AQA-PSYCHOLOGY-7182-FOUNDATION-SLICE-FORENSIC.json`
   - deliberately tests a more fragmented specialist option;
   - 3/4 named requirements source-complete;
   - 1 narrow rights residual: custodial token-economy evidence exists, but the exact Creative Commons licence of the closest forensic study was not verified as commercial-compatible;
   - whole-topic generation required: 0;
   - paid provider spend £0;
   - paid source spend £0.

The Forensic slice is important because it demonstrates that source fragmentation increases manual search/provenance work without necessarily requiring whole-topic generation.

## Current measures

| Measure | Result |
| --- | --- |
| Exact named course scope | 118 requirements / 17 topics |
| Named coverage review | **118/118** |
| Source-covered candidates | **56/118 (47.5%)** |
| Source-supported partials | **61/118 (51.7%)** |
| Current source gaps | **1/118 (0.8%)** |
| Requirements with some reusable subject evidence | **117/118 (99.2%)** |
| Representative structured slices | Social influence + Forensic Psychology |
| AI-created unsupported subject truth | **0%** |
| Paid AI/provider spend | **£0** |
| Paid source/licence spend | **£0** |
| Main manual work | source discovery, rights verification, named mapping, targeted reconciliation, provenance |

Elapsed active working time cannot be honestly reconstructed because this proof ran across multiple governed chat/repository interactions rather than a single instrumented job. A subsequent experiment must record active elapsed time automatically from start to finish.

## What the proof establishes

### Supported

The original economic hypothesis is strongly supported on **source availability**.

Psychology does not appear to need to be researched or generated from zero. Commercial-compatible reusable material already provides at least some subject knowledge for **117 of 118 named requirements**.

The representative slices also show that AI can be used mainly as a transformation layer — structuring, reconciling, mapping and independently phrasing supported subject truth — rather than paying it to rediscover a whole course.

### Not yet proven

The proof does **not** establish:

- production-ready educational quality across all 118 requirements;
- final learner-facing Learn/Practice/Exam Prep quality;
- exact fully automated elapsed time per course;
- the final cost of closing all 61 partials;
- that every subject will have the same quality of open-source ecosystem; or
- that the current production Content Factory should be replaced immediately.

The clearest remaining scalability risk is **manual source orchestration and rights verification**, especially for specialist option material. That is now a more important problem than raw subject-knowledge availability.

## Recommendation — `iterate`

Do **not** return to the current Content Factory for the next test, and do not manually close all 61 Psychology partials merely to obtain a prettier percentage.

The next experiment should automate only the parts the Psychology proof showed are repetitive and expensive in human attention:

1. exact course-scope extraction into stable named requirements;
2. discovery of broad candidate OER plus targeted gap sources;
3. licence/right classification with fail-closed handling;
4. deterministic requirement-to-source matching;
5. production of a coverage/bridge report;
6. transformation of source-complete requirements into a minimal structured Foundation schema; and
7. measurement of elapsed active time, provider spend, paid-source spend and manual interventions from the start.

Then run that minimal automation on a **second materially different course/subject**. The purpose of the second run is not another long research exercise; it is to measure repeatability and economics under instrumentation.

### Why not `promote` yet

The source-first principle is promising enough to continue, but production promotion would be premature because throughput has not been measured cleanly and Psychology may have an unusually rich open-resource ecosystem.

### Why not `reject`

Rejection is not supported by the evidence. The experiment reached whole-course named coverage with only one unresolved source gap and **£0 paid provider / £0 paid source spend**, while also demonstrating structured Foundation transformation for both a broad compulsory topic and a fragmented specialist option.

## Founder decision boundary

This research recommendation does not automatically promote or change production authority.

The Founder should choose one of the experiment's governed end states:

- **promote** — define a production successor/replacement process;
- **iterate** — authorise the minimal automated second-course proof described above; or
- **reject** — stop the source-first route and retain the current production approach.

Until that decision, these outputs remain experimental research and are not a production-approved Course Foundation.

# Source-First Course Prototype

**Status:** Experimental / non-authoritative research prototype
**Owner:** Founder
**Started:** 2 October 2026
**Branch:** `experiment/source-first-course-prototype`
**First proof course:** AQA A-level Psychology 7182

## Purpose

This prototype exists to answer one practical question:

> Can Revision create a comprehensive, high-quality subject/course Foundation quickly and cheaply by starting from material that already exists and is legally usable for commercial AI-assisted production, instead of recreating subject knowledge through a long Content Factory research/review process?

The prototype is deliberately optimised for:

- speed to a usable Foundation candidate;
- very low AI/provider spend;
- maximum reuse of free, commercially reusable educational material;
- minimal manual intervention;
- clear measurement of source coverage, gaps, elapsed time and cost; and
- repeatability across many GCSE and A-level courses.

The prototype is successful only if the method looks economically capable of scaling to a large catalogue. Process sophistication is not a success metric by itself.

## Explicit separation from the current Content Factory

This is **not** a run of the current governed Content Factory and must not be forced through its operating process merely for compatibility.

For this prototype, the following current Content Factory mechanisms are **not inherited by default**:

- the current Content Factory Fast-Path sequence;
- ADR-0028 / ADR-0029 architecture requirements as prototype process requirements;
- the existing Foundation Factory orchestration sequence;
- existing Content Factory state machines, trial stages or pilot ceremony;
- existing AI review sequencing or review-round mechanics;
- current expert-review completion requirements;
- existing Content Factory provider routing;
- existing per-course generation assumptions;
- existing requirement to prove compatibility with Business-specific pipeline stages; and
- implementation reuse whose only justification is that it already exists.

Existing Content Factory code may be reused selectively, but only when doing so makes this prototype materially faster, cheaper, safer or simpler. Compatibility with the existing factory is not a prototype objective.

This separation is intentional. The purpose of the experiment is to discover a better production method without allowing the cost, complexity or assumptions of the existing factory to constrain the test.

## What still applies

This prototype remains part of the Revision repository, so repository-wide controls still apply. In particular:

- work happens on a branch and through a PR;
- nothing is merged to `main` without explicit Founder approval for that PR;
- experimental findings do not become normative authority automatically;
- protected or rights-uncertain source material must not be treated as commercially reusable merely because it is publicly accessible; and
- prototype output is not automatically learner-publication-ready.

The source-rights constraint is part of the hypothesis, not unwanted process overhead: the prototype specifically needs to prove that enough **permitted** material exists to make the economics work.

## Prototype operating principle

The sequence is source-first:

`exact course → identify required scope → find reusable sources → verify permissions → ingest permitted subject knowledge → map against course requirements → identify gaps → fill only genuine gaps → measure result`

The default question at every stage is:

> Can we reuse trustworthy existing knowledge instead of paying to research or generate it again?

## First proof: AQA A-level Psychology 7182

AQA material is used to identify and verify course scope, qualification structure and required coverage. It is not assumed to be commercially reusable teaching copy.

The Psychology proof should:

1. establish the exact AQA 7182 scope that a Foundation must support;
2. search for high-quality free sources whose licences permit the intended commercial reuse/adaptation and AI-assisted processing;
3. record those sources and their licence basis;
4. extract/structure permitted subject knowledge into a reusable Psychology source corpus;
5. measure how much of the required course knowledge the corpus covers;
6. identify only the genuinely missing or insufficient areas;
7. use AI selectively to structure, reconcile or fill those gaps where appropriate;
8. produce a Foundation candidate or clear evidence that the source-first hypothesis does not work; and
9. record actual time, provider spend and manual interventions.

Do not create learner-facing Learn, Practice, Exam Prep or mock content as part of this proof unless specifically required to test the Foundation method.

## Source priority

Search sources in this order:

1. high-quality open educational resources with explicit commercial reuse/adaptation permission;
2. public-domain educational or scholarly sources;
3. government/public-sector material with terms that permit the intended use;
4. university/institutional material with explicit compatible licences;
5. other explicitly licensed sources that permit commercial reuse and AI-assisted transformation;
6. paid source licences only where the value is compelling and the commercial/AI rights are explicit.

Free sources are preferred. A paid source is not a failure if it materially reduces total production cost, but its licence and cost must be recorded separately.

Public availability alone is never evidence of permission.

## AI use

AI is a transformation and gap-closing tool in this prototype, not the default source of subject truth.

Preferred AI uses:

- converting permitted source knowledge into a consistent structured schema;
- deduplicating and reconciling overlapping sources;
- identifying apparent coverage gaps;
- mapping reusable knowledge to course requirements;
- creating concise original bridge material where a genuine knowledge gap remains; and
- targeted quality challenge where software cannot establish the answer.

Avoid paying AI to rediscover information that is already available in reusable source material.

There is no requirement to run paid model calls merely because the existing Content Factory would normally do so.

## Measurement

Every proof run must report at least:

- exact course;
- number of candidate sources found;
- number of sources accepted for commercial AI-assisted use;
- percentage of Foundation/course knowledge supplied directly by reusable sources;
- percentage requiring AI-created gap material;
- unresolved coverage gaps;
- elapsed working time;
- AI/provider spend;
- paid source/licence spend;
- manual interventions;
- rights blockers; and
- whether the result appears repeatable for the next course.

The four headline measures are:

> **Reusable source coverage % · AI-created gap % · elapsed time · total variable cost**

## Prototype decision rules

- Do the cheapest reliable thing first.
- Search before generating.
- Reuse before researching.
- Structure before rewriting.
- Fill gaps rather than regenerate covered material.
- Prefer deterministic comparison over model judgement where possible.
- Stop adding infrastructure when it is not required to answer the prototype question.
- Do not preserve a current Content Factory component merely for compatibility.
- Record failures as evidence rather than designing around every hypothetical failure before the first proof.

## Promotion rule

This prototype does not replace current Content Factory authority simply by succeeding.

If the evidence shows a materially faster, cheaper and sufficiently trustworthy method, the next decision is to define what should be promoted into the production operating model and what existing rules should be superseded. That would be a separate governed Founder decision.

Until then, this directory records experimental method and evidence only.

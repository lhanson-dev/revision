# Source-First Course Prototype — Experimental Exception

**Status:** Experimental authority when present on approved `main`; proposed while only on an unmerged branch
**Owner:** Founder
**Date:** 2 October 2026
**Applies only to:** the Source-First Course Prototype recorded under `research/source-first-course-prototype/`

## Decision

Revision may run the Source-First Course Prototype as a deliberately independent experimental course-production method without following the current Content Factory domain workflow, architecture, sequencing, review ceremony or completion gates.

This is a narrow experimental exception. It exists so Revision can test whether a materially faster and cheaper way of building new subject/course Foundations is possible without forcing the experiment through the process it is intended to challenge.

## Why this exception exists

The current Content Factory produced substantial useful engineering and assurance learning, but the first Business course took too long and cost too much for Revision's intended catalogue scale.

The new hypothesis is that Foundation production can be made dramatically faster and cheaper by starting from high-quality existing material that is already permitted for commercial reuse/adaptation, then using AI mainly for structuring, reconciliation and genuine gaps.

Requiring that hypothesis to use the current Content Factory operating model as its acceptance process would contaminate the experiment.

## Rules that do not apply to this prototype by default

For work explicitly identified as a Source-First Course Prototype run, agents must **not** treat the following as mandatory prototype process requirements:

- `80-company-workflows/Content Factory Fast-Path Process.md`;
- ADR-0028 / ADR-0029 Content Factory architecture and sequencing;
- `80-company-workflows/Content Factory Foundation and Asset Production Model.md` Foundation Factory sequence;
- Content Factory trial-stage or pilot-stage progression;
- existing Content Factory state machines and orchestration;
- existing Content Factory AI reviewer sequence, review-round mechanics or provider routing;
- existing Content Factory expert-review gate as a prerequisite for completing the prototype experiment;
- Business-specific schemas or pipeline compatibility; or
- reuse of existing Content Factory implementation merely because it already exists.

Existing Content Factory components may be reused where they independently earn their place by making the prototype faster, cheaper, simpler, safer or more reliable.

## Rules that still apply

This exception does **not** suspend repository-wide, legal/trust or release controls.

The prototype must still comply with:

- the AI Agent Constitution;
- the Authority Hierarchy and Knowledge Architecture;
- branch + PR working and explicit Founder approval before merge to `main`;
- source-rights and provenance controls in `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`;
- privacy, security and safeguarding requirements where applicable; and
- truthful separation between experimental output and approved/published learner content.

In particular, publicly accessible material must not be assumed commercially reusable. Rights must be established before source material is used as the reusable corpus.

## Prototype output boundary

Completing a prototype run may produce:

- a reusable-source register;
- structured course-scope facts;
- a coverage map;
- an experimental Foundation candidate;
- gap material;
- scripts or tooling needed to test the method; and
- measured time/cost/coverage evidence.

Prototype completion does **not** by itself mean:

- `foundation_approved` under the current production Content Factory;
- learner-publication approval;
- replacement of the current Content Factory operating model; or
- permission to weaken rights, safety or evidence standards in production.

## Operating instruction for AI agents

When a task explicitly says it is part of the Source-First Course Prototype:

1. read this exception first;
2. read `research/source-first-course-prototype/README.md` for the experimental operating method;
3. read the relevant prototype run file;
4. do **not** redirect the work into the current Content Factory solely because that is the existing production authority;
5. search for permitted reusable sources before generating subject knowledge;
6. minimise infrastructure and paid model use until the source-first economics are understood;
7. measure reusable-source coverage, AI-created gap share, elapsed time, variable cost and manual intervention; and
8. keep all prototype findings clearly labelled experimental.

If a requested action would publish prototype output to learners, declare it production-ready, or replace existing production authority, stop and treat that as a separate governed decision.

## First authorised proof

The first proof course is:

**AQA A-level Psychology 7182 (revised specification, first A-level exams summer 2027).**

The run instructions live at:

`research/source-first-course-prototype/AQA-PSYCHOLOGY-7182-RUN.md`

## End condition

After the Psychology proof, the Founder should receive evidence sufficient to choose one of:

- **promote** — define a production replacement/successor process from the proven method;
- **iterate** — run another bounded prototype because the economics are promising but unresolved; or
- **reject** — retain the current Content Factory approach because the source-first method did not produce sufficient coverage/quality/economic benefit.

No automatic promotion occurs.

# Prototype Run — AQA A-level Psychology 7182

**Prototype:** Source-First Course Prototype
**Status:** In progress — compulsory named-source review complete; representative Foundation slice started
**Started:** 2 October 2026
**Purpose:** First independent proof of the source-first Foundation method

## Run instruction

Do not run this course through the current Content Factory workflow.

Use `research/source-first-course-prototype/README.md` as the operating instruction for this experiment. Existing Content Factory material may be consulted for reusable technical components, but its process, stages, assurance ceremony and orchestration are not acceptance criteria for this run.

## Question to answer

Can a comprehensive AQA A-level Psychology 7182 Foundation candidate be created quickly and at very low variable cost by using existing high-quality material that is free and explicitly permits commercial reuse/adaptation and AI-assisted processing?

## Acceptance focus

This proof is about Foundation economics and coverage, not learner-asset production.

The run must establish:

1. what knowledge AQA 7182 requires;
2. which commercially reusable source set can supply that knowledge;
3. how much of the required knowledge can be supplied from those sources without new subject research/generation;
4. which genuine gaps remain;
5. how cheaply and quickly those gaps can be resolved; and
6. whether the method appears reusable for the next new subject.

## Course identity

- Awarding body: AQA
- Qualification: A-level
- Subject: Psychology
- Specification: 7182
- First teaching: September 2025
- First A-level exams: summer 2027
- Official awarding-body material role: scope/alignment/reference, not assumed reusable teaching copy

Course dates/options/cohort details should be resolved from current official AQA information as part of the run rather than copied from historical Content Factory assumptions.

## Source acceptance rule

A source can supply the reusable subject corpus only when its rights basis explicitly supports the intended commercial use.

Record for every accepted source:

- title/provider;
- URL;
- edition/version/date where relevant;
- licence or public-domain basis;
- whether commercial reuse is permitted;
- whether adaptation is permitted;
- attribution/share-alike obligations;
- evidence URL for the rights basis;
- subject areas covered; and
- any restrictions or uncertainty.

Sources with non-commercial restrictions must not be counted as reusable commercial corpus coverage.

Sources with unclear rights may be useful leads but must be recorded as rejected/pending rather than assumed usable.

## Working stages

### A. Exact scope

Compile a compact structured checklist of required AQA 7182 knowledge/topics and major assessment facts from current official information.

Do not copy large amounts of awarding-body prose into the reusable corpus.

**Current state:** complete for the first pass. `AQA-PSYCHOLOGY-7182-SCOPE.json` records 118 stable named requirement IDs across 17 topics, including 71 compulsory requirements and 47 option requirements.

### B. Source discovery

Search broadly for free high-quality psychology resources with commercial-compatible licences.

Prioritise whole textbooks/corpora because one broad reusable source is operationally more valuable than dozens of fragmented pages.

**Current state:** broad source discovery plus three targeted addenda completed. The prototype has accepted multiple CC BY psychology, neuroscience, abnormal-psychology, statistics and targeted research sources. Non-commercial sources that would otherwise be attractive have been rejected rather than counted.

### C. Rights verification

Verify the actual licence at source. Search-result snippets, third-party descriptions and general website availability are insufficient.

**Current state:** active and fail-closed. AQA remains `REFERENCE_ONLY`; sources including current OpenStax Psychology 2e and the Atlantic OER Research Methods in Psychology & Neuroscience book were excluded from reusable commercial corpus use because their current licences/terms do not support the intended commercial route.

### D. Coverage test

Map accepted reusable sources to the AQA scope.

Classify each required area as:

- `covered` — reusable sources appear sufficient to build the Foundation;
- `partial` — relevant reusable material exists but needs supplementation/deepening;
- `gap` — no adequate accepted source yet; or
- `uncertain` — source/rights/requirement needs resolution.

**Current state:** the compulsory course has completed its first named-requirement review. After targeted gap reconciliation:

- compulsory named requirements: **71/71 reviewed**;
- source-covered candidates: **33**;
- partial / bridge requirements: **38**;
- unresolved source gaps: **0**;
- unknown/uncertain rights blockers: **0** for the compulsory set.

The remaining 47 option requirements are not yet fully reviewed at named-requirement level.

### E. Gap strategy

For each `partial` or `gap` area, choose the lowest-cost valid route:

1. find another accepted reusable source;
2. use permitted primary/public-domain material;
3. create a small amount of original bridge/gap content with AI from accepted factual inputs; or
4. record a blocker if trustworthy content cannot be established cheaply.

Do not regenerate already-covered areas merely for stylistic consistency.

**Current state:** `AQA-PSYCHOLOGY-7182-COMPULSORY-BRIDGE-PLAN.json` classifies the 38 incomplete compulsory requirements as:

- **24 small bridges** — one or two named elements, terminology/alignment links or short synthesis remain;
- **14 medium bridges** — several named elements or a specialist model remain, but not whole-topic creation;
- **0 source-domain gaps**.

No paid model call has been needed to reach this point.

### F. Foundation candidate

Only after source coverage is understood, transform the accepted knowledge into the minimum structured Foundation representation needed to test completeness and reuse.

The schema may borrow useful existing Revision structures but must not inherit unnecessary Content Factory orchestration.

**Current state:** started. `AQA-PSYCHOLOGY-7182-FOUNDATION-SLICE-SOCIAL-INFLUENCE.json` is the first representative structured slice. It deliberately contains:

- one no-bridge requirement;
- two small-bridge requirements; and
- one medium-bridge requirement.

The slice keeps reusable source knowledge, provenance and unresolved bridge items separate rather than silently filling gaps. It is experimental structured subject knowledge, not learner-facing content.

### G. Measure

Record final headline measures:

| Measure | Current result |
| --- | --- |
| Exact named course scope | 118 requirements across 17 topics |
| Compulsory named coverage review | 71/71 reviewed |
| Compulsory source-covered candidates | 33/71 |
| Compulsory bridge requirements | 38/71: 24 small, 14 medium |
| Compulsory unresolved source gaps | 0 |
| Option named-requirement review | 4/47 reviewed incidentally; full option pass pending |
| Representative structured Foundation slice | Social influence slice created |
| AI-created gap content | 0 so far |
| AI/provider spend | £0 |
| Paid source/licence spend | £0 |
| Manual interventions | source/licence verification, requirement mapping, bridge classification, provenance review |

Elapsed working time remains to be recorded as a final run measure because this prototype has been executed across multiple governed chat/repository interactions rather than a single timed job. Do not invent a duration retrospectively.

## Current economics signal

The source-first hypothesis is **promising but not yet proven**.

The key improvement over the original coarse map is that the compulsory course no longer appears to require whole-topic generation or paid-source acquisition. Every compulsory requirement now has either reusable source support or a bounded synthesis/alignment route. Most remaining work is narrow: 24 small bridges and 14 medium bridges.

That is materially different from recreating 71 compulsory requirements from zero, but it is not yet sufficient to claim a scalable production cost. The next proof must measure the work required to close the representative Social influence bridges and turn the structured slice into a complete Foundation node set without sacrificing educational quality.

## Cost discipline

No paid AI call is required until it has a specific job that cannot be done more cheaply by source discovery, deterministic processing or reuse.

Track actual variable cost rather than theoretical token estimates wherever possible.

## Stop conditions

Stop and report rather than building more infrastructure when any of these becomes true:

- accepted free/commercially reusable sources cover too little of the subject to make the method attractive;
- licensing uncertainty prevents safe use of the sources needed for broad coverage;
- Foundation quality requires enough original research/generation that the expected economics no longer improve materially on the existing process; or
- the source-first method has been sufficiently proven and the next useful step is productisation/automation rather than more prototype work.

## Output

The proof should finish with:

- a source register;
- a course-scope/coverage map;
- a structured Foundation candidate or representative Foundation slice sufficient to demonstrate the method;
- measured time/cost/intervention evidence;
- identified risks and gaps; and
- a recommendation: `promote`, `iterate`, or `reject` the source-first method.

No result from this run should be labelled an approved production Course Foundation solely because the prototype completed.

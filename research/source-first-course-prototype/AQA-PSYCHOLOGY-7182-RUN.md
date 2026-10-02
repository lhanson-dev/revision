# Prototype Run — AQA A-level Psychology 7182

**Prototype:** Source-First Course Prototype  
**Status:** In progress — all 118 named requirements reviewed; representative Social influence slice source-complete  
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

## Source acceptance rule

A source can supply the reusable subject corpus only when its rights basis explicitly supports the intended commercial use. Public availability is not permission. AQA remains `REFERENCE_ONLY`; the reusable subject layer uses OPEN, REVISION_OWNED or appropriately LICENSED evidence only.

## Working state

### A. Exact scope — complete first pass

`AQA-PSYCHOLOGY-7182-SCOPE.json` records **118 stable named requirement IDs** across 17 topics:

- 71 compulsory requirements;
- 47 option requirements.

### B. Source discovery — broad + targeted passes complete enough for whole-course economics

The prototype has accepted broad CC BY psychology, neuroscience and abnormal-psychology resources plus targeted open research/statistics/criminal-justice sources. Convenient sources with non-commercial restrictions have been rejected rather than counted.

Targeted evidence is retained in the source register and addenda, including `PSYCHOLOGY-TARGETED-SOURCE-ADDENDUM-04.md` for closure of the representative Social influence bridges.

### C. Rights verification — active / fail-closed

AQA remains reference-only. Current OpenStax Psychology 2e, several Research Methods textbooks, Noba, convenient social-psychology materials and other NC sources were excluded where their terms did not support Revision's intended commercial route.

The prototype has deliberately retained one remaining source gap rather than treating a publicly accessible non-commercial source as permission.

### D. Named coverage — 118/118 reviewed

Current whole-course state is recorded in `AQA-PSYCHOLOGY-7182-WHOLE-COURSE-METRICS.json`.

After closing the representative Social influence bridges:

- **118/118 named requirements reviewed**;
- **54 source-covered candidates**;
- **63 partial / bounded synthesis requirements**;
- **1 remaining source gap**;
- **117/118 requirements have some commercial-compatible reusable subject evidence**.

The one current source gap is `PSY-17-06` — Prochaska's six-stage behaviour-change model. The model is publicly easy to find, but the convenient explanatory sources inspected so far carry non-commercial terms and are not counted.

This distinction matters: **117/118 source-supported is not the same as 117/118 finished Foundation coverage**. Sixty-three requirements still need one or more named elements closed or synthesised.

### E. Bridge / gap strategy

The compulsory first pass initially found 38 bounded bridges and zero source-domain gaps. The Social influence proof then closed three of those bridges entirely with rights-clear sources.

Option-group first passes now show:

- **Option group 1 — Relationships / Gender / Cognition & development:** 14/14 reviewed; 5 covered candidates, 9 partials, 0 gaps.
- **Option group 2 — Schizophrenia / Eating behaviour / Stress:** 18/18 reviewed; 8 covered candidates, 10 partials, 0 gaps.
- **Option group 3 — Aggression / Forensic Psychology / Addiction:** 15/15 reviewed; 5 covered candidates, 9 partials, 1 gap.

The previously gap-heavy Forensic Psychology topic is not source-empty. It is more fragmented: one of four requirements is currently source-covered and three have narrow outstanding elements. This is useful evidence about expected manual/source-orchestration cost.

### F. Representative Foundation candidate — Social influence source-complete

`AQA-PSYCHOLOGY-7182-FOUNDATION-SLICE-SOCIAL-INFLUENCE.json` now records a source-complete structured slice for all four Social influence requirements.

Current slice result:

- 4/4 named requirements have rights-clear subject evidence;
- 0/4 require unsupported new subject truth;
- 0 require further source discovery;
- AI was used as a transformation/structuring/reconciliation layer, not as the source of unsupported Psychology knowledge;
- paid provider spend: **£0**;
- paid source spend: **£0**.

This demonstrates that a representative topic containing previously small and medium bridges can be completed by targeted open-source discovery plus structured synthesis rather than whole-topic generation.

### G. Current measures

| Measure | Current result |
| --- | --- |
| Exact named course scope | 118 requirements across 17 topics |
| Named coverage review | **118/118** |
| Current source-covered candidates | **54/118 (45.8%)** |
| Current partial / bounded synthesis | **63/118 (53.4%)** |
| Current source gap | **1/118 (0.8%)** |
| Requirements with some reusable subject evidence | **117/118 (99.2%)** |
| Representative structured Foundation slice | Social influence — source-complete |
| AI-created unsupported subject truth | **0% so far** |
| Paid AI/provider spend | **£0** |
| Paid source/licence spend | **£0** |
| Manual interventions | source/licence verification, requirement mapping, targeted search, provenance review, conservative classification |

Elapsed working time is not being invented retrospectively because this prototype has been executed across multiple governed chat/repository interactions rather than a single timed job. A future automated run should instrument elapsed active work directly.

## Current economics signal

The source-first hypothesis is now **strongly supported on source availability, but not yet fully proven on production throughput**.

The strongest evidence is not that 45.8% of named requirements are already source-complete. It is that **117 of 118 requirements already have a commercially reusable subject-knowledge route**, meaning Psychology does not appear to need to be researched or generated from zero.

The remaining cost problem is therefore narrower:

- rights verification;
- targeted source discovery for exact named models;
- reconciliation of fragmented sources;
- structured synthesis/alignment;
- and quality validation of the resulting Foundation nodes.

Specialist option topics are noticeably more fragmented than the representative compulsory topic. That means automation should prioritise **source discovery + rights classification + requirement mapping**, not simply pay a model to generate an entire course.

## Next proof

Do not expand infrastructure yet.

The next useful experiment is to close a small, deliberately difficult sample from the specialist options — including the single `PSY-17-06` source gap and one or two Forensic/Aggression partials — then transform those into structured Foundation nodes. If that remains cheap and controlled, the source-first production hypothesis will be strong enough for a Founder `promote / iterate / reject` decision or a final narrow automation proof.

## Cost discipline

No paid AI call is required until it has a specific job that cannot be done more cheaply by source discovery, deterministic processing or reuse.

Track actual variable cost rather than theoretical token estimates wherever possible.

## Stop conditions

Stop and report rather than building more infrastructure when any of these becomes true:

- accepted free/commercially reusable sources cover too little of the subject to make the method attractive;
- licensing uncertainty prevents safe use of the sources needed for broad coverage;
- Foundation quality requires enough original research/generation that the expected economics no longer improve materially on the existing process; or
- the source-first method has been sufficiently proven and the next useful step is productisation/automation rather than more prototype work.

## Output still required before final recommendation

The proof should finish with:

- retained source register — present;
- whole-course scope/coverage map — present for first pass;
- representative structured Foundation candidate — present for Social influence;
- measured cost/intervention evidence — variable spend present; retrospective elapsed time deliberately unavailable;
- targeted difficult-option closure evidence — next;
- identified risks and gaps — active;
- recommendation: `promote`, `iterate`, or `reject` — pending final difficult-option proof.

No result from this run should be labelled an approved production Course Foundation solely because the prototype completed.

# Content Factory Mock Exam Production

**Status:** first implementation foundation; no paid mock generation on this branch  
**Base main:** `f8e84e4db39b8ea54ac9e4d0bdfb02c0b2dac16d`  
**Pilot qualification:** AQA A-level Business 7132, 2027 outgoing specification

## Purpose

Implement the governed whole-paper layer between the existing AQA 7132 T11 question machinery and learner publication.

The current repository already owns:

- deterministic Course Truth and Exam Truth materialisation;
- exact-course T8 assurance and fingerprint reuse;
- the 81-node Business Foundation and 79-node exact-course projection;
- deterministic Learning Blueprint and question plans;
- structured question generation with calculations, AO metadata and mark schemes;
- blind answering and software validation;
- fixed-checklist independent T11 review with exact-fingerprint resume;
- a 245-question accepted Revision-authored AQA-style question bank with provenance; and
- the existing Exam Prep / timed `ExamSimulator` learner surface.

It does **not** currently own a whole-paper Mock Profile, deterministic paper-set plan, whole-paper duplication/coverage checks or a dedicated mock production workflow.

## Current AQA 7132 assessment model

The active Course/Exam Truth materialiser and current official AQA references agree on the stable core:

| Component | Duration | Attempted marks | Weight | Stable structure |
| --- | ---: | ---: | ---: | --- |
| 7132/1 Business 1 | 120 min | 100 | 33.3% | Section A: 15 MCQs / 15 marks. Section B: short answers / 35 marks. Sections C and D: two 25-mark essay options in each section; candidate answers one from C and one from D. |
| 7132/2 Business 2 | 120 min | 100 | 33.3% | Three compulsory data-response questions worth approximately 33 marks each, made up of three or four parts. |
| 7132/3 Business 3 | 120 min | 100 | 33.3% | One compulsory case study followed by approximately six questions. |

All papers can assess the full course. The qualification is linear and all papers are taken in the same series. The overall minimum quantitative-skills weighting is 10% of A-level marks. Published AO ranges remain owned by Exam Truth rather than duplicated as prompt lore.

There is an important AO unit trap: the component values in Exam Truth such as AO1 `7132/1: 9–11` are **qualification percentage points contributed by that paper**, not 9–11% of the 100-mark paper. `MOCK_PROFILE.json` records that unit explicitly so the paper planner must convert the published ranges into compatible component mark targets rather than silently under-allocating AO demand.

Paper 1 also has an important mark-accounting distinction: the paper contains four 25-mark essay options (100 printed optional marks) but the candidate attempts only two of them (50 marks). Whole-paper validation therefore uses **attempted raw marks**, not a naive sum of every printed question tariff.

## Rights boundary

AQA specification, scheme-of-assessment, quantitative annex, past papers, specimen papers and mark schemes are `REFERENCE_ONLY` inputs. They may establish assessment structure and calibrate realism. They are not reusable question/case/dataset content.

The first mock set will prefer synthetic businesses and synthetic data. This avoids unnecessary provenance cost and gives deterministic control over every figure needed by the questions.

## Qualification Mock Profile

`content-factory/mock-exams/aqa-7132/MOCK_PROFILE.json` is the first qualification profile. `content-factory/mock-exams/aqa-7132/CALIBRATION.json` retains only rights-safe derived specimen-paper metadata used to calibrate realistic variable tariffs and command patterns.

The profile deliberately separates:

- `invariant` facts that software may fail closed against; and
- `calibration` guidance used to shape a realistic mock without claiming future AQA papers must repeat a historical pattern.

The profile records the lower pilot spend cap but does not change the company-wide Content Factory course ceiling.

## Smallest repeatable production design

### 1. Deterministic planning — no provider spend

Before a model call, software resolves current Course Truth/Exam Truth, validates the Mock Profile and creates a paper-set plan.

The plan will allocate:

- structural slots and choices;
- marks and AO demand;
- quantitative slots;
- exact Course Truth / named-item targets;
- context ownership;
- repetition constraints; and
- cross-paper breadth.

Coverage is based on **what the question requires**, never a topic merely mentioned in stimulus.

### 2. Generation batches

The first pilot should use bounded coherent units rather than one enormous course call or one call per isolated question:

- **Paper 1:** one shared paper plan; Section A/B may be generated in bounded chunks, while each C/D essay option is generated against the same paper coverage ledger. Paper-level validation reconciles the choices and 100 attempted marks.
- **Paper 2:** three data-response set units. Each unit owns one coherent stimulus/dataset and all of its parts. The three units share the paper coverage/difficulty ledger.
- **Paper 3:** one case-study context unit followed by the complete linked question set. Questions may be generated in bounded calls only after the shared case is fixed; no question may invent conflicting case facts.

This keeps provider context small without degrading whole-paper coherence.

### 3. Existing accepted question-bank reuse

The 245 accepted questions are reused first as:

- coverage evidence;
- tariff/command/style intelligence;
- examples of already-detected failure modes;
- formula/calculation validation evidence; and
- optional exact-fingerprint source material when a question genuinely fits a planned slot.

The first mock set should **not** optimise aggressively for question-text reuse. Forcing bank questions into a paper would recreate the exact failure the mock stage is meant to prevent: a collection rather than an examination.

If an unchanged accepted question is later reused, its existing question-level assurance can be retained, but it still participates in fresh whole-paper assurance because context, progression and cross-paper duplication are new relationships.

### 4. Assurance

After software checks, use fresh-context independent review at whole-paper level. Reuse the current Fast-Path ledger/fingerprint semantics and two-fresh-round limit.

Fresh review is required only for new/changed mock fingerprints. Unchanged Foundation, Course Truth, Exam Truth and accepted question dependencies are not repurchased.

The whole-paper checklist must cover:

- assessment-model fidelity;
- question/mark-scheme validity;
- factual and calculation accuracy;
- paper totals and choice accounting;
- timing realism;
- coverage and synoptic validity;
- difficulty progression;
- quantitative balance;
- command/tariff realism;
- case/stimulus coherence;
- cross-paper duplication; and
- originality / rights safety.

## Spend proposal before live generation

No paid provider calls are made by this foundation change.

For the first complete three-paper mock set, the proposed **mock-stage pilot cap is US$8 total new provider spend**, including fresh generation and independent review. The runner must stop before starting a call that could breach that cap.

This is intentionally below the existing US$20 hard automated ceiling for one live Content Factory course run. If the deterministic plan or conservative estimator says US$8 is insufficient, stop before generation and review batching/model routing; do not weaken assurance and do not silently consume the remaining course ceiling.

Observed generation/review spend will be retained by stage so the cap can be recalibrated from evidence.

## Learner publication

The existing Exam Prep / `ExamSimulator` experience already supports full timed papers, question navigation, delayed marking guidance and confidence-limited self-assessment. The mock output should therefore adapt into the existing typed `Exam` content model after assurance.

No new learner route or duplicate mock surface is required.

Learner wording must identify the papers as Revision-authored realistic practice papers built to AQA's structure and not official AQA papers or mark schemes.

## This branch

This branch introduces only the lowest-risk pre-spend foundation:

1. governed mock-production authority;
2. the AQA 7132 versioned Mock Profile and calibration metadata;
3. provider-free deterministic profile validation;
4. the provider-free GitHub Action `Content Factory AQA Business 7132 Mock Profile` for exact-head validation;
5. documentation/index/run-log updates.

It does **not** create learner mock content, call an AI provider, publish mocks or alter the learner UI.

After Founder-approved merge, the next governed change can add the deterministic paper-set planner and live generation/review runner against this contract. Paid generation must still run only from approved `main`, following the existing Content Factory pattern.

## Documentation impact

Normative impact: adds an explicit mock-paper workflow authority because the Fast Path previously named mocks but did not define whole-paper production rules.

Technical impact: adds a qualification Mock Profile, rights-safe calibration metadata and provider-free validation/action. No existing Course Truth, Exam Truth, Foundation, learner content, routes, persistence or historical evidence are modified.

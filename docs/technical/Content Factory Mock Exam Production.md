# Content Factory Mock Exam Production

**Status:** deterministic three-paper planner implemented; no paid mock generation on this branch  
**Base main:** `ed9fd669de6a36cff9c39f2b9e7f8dd311be0205`  
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
- a 245-question accepted Revision-authored AQA-style question bank with provenance;
- a versioned AQA 7132 Mock Profile and rights-safe calibration metadata;
- a provider-free deterministic three-paper mock-set planner; and
- the existing Exam Prep / timed `ExamSimulator` learner surface.

It does **not** yet own the live whole-paper generation/review runner or publishable mock-paper assets.

## Current AQA 7132 assessment model

The active Course/Exam Truth materialiser and current official AQA references agree on the stable core:

| Component | Duration | Attempted marks | Weight | Stable structure |
| --- | ---: | ---: | ---: | --- |
| 7132/1 Business 1 | 120 min | 100 | 33.3% | Section A: 15 MCQs / 15 marks. Section B: short answers / 35 marks. Sections C and D: two 25-mark essay options in each section; candidate answers one from C and one from D. |
| 7132/2 Business 2 | 120 min | 100 | 33.3% | Three compulsory data-response questions worth approximately 33 marks each, made up of three or four parts. |
| 7132/3 Business 3 | 120 min | 100 | 33.3% | One compulsory case study followed by approximately six questions. |

All papers can assess the full course. The qualification is linear and all papers are taken in the same series. The overall minimum quantitative-skills weighting is 10% of A-level marks. Published AO ranges remain owned by Exam Truth rather than duplicated as prompt lore.

There is an important AO unit trap: the component values in Exam Truth such as AO1 `7132/1: 9–11` are **qualification percentage points contributed by that paper**, not 9–11% of the 100-mark paper. `MOCK_PROFILE.json` records that unit explicitly and the deterministic planner converts those ranges into compatible component mark bounds against the 300-mark qualification total.

Paper 1 also has an important mark-accounting distinction: the paper contains four 25-mark essay options (100 printed optional marks) but the candidate attempts only two of them (50 marks). Whole-paper validation therefore uses **attempted raw marks**, not a naive sum of every printed question tariff. The planner enumerates all four permitted C/D essay-choice paths and validates every path independently.

## Rights boundary

AQA specification, scheme-of-assessment, quantitative annex, past papers, specimen papers and mark schemes are `REFERENCE_ONLY` inputs. They may establish assessment structure and calibrate realism. They are not reusable question/case/dataset content.

The first mock set uses synthetic businesses and synthetic data as the default planned context source. This avoids unnecessary provenance cost and gives deterministic control over every figure needed by the questions.

## Qualification Mock Profile

`content-factory/mock-exams/aqa-7132/MOCK_PROFILE.json` is the first qualification profile. `content-factory/mock-exams/aqa-7132/CALIBRATION.json` retains only rights-safe derived specimen-paper metadata used to calibrate realistic variable tariffs and command patterns.

The profile deliberately separates:

- `invariant` facts that software may fail closed against; and
- `calibration` guidance used to shape a realistic mock without claiming future AQA papers must repeat a historical pattern.

The profile records the lower pilot spend cap but does not change the company-wide Content Factory course ceiling.

## Deterministic three-paper planner

`scripts/assurance/plan-aqa-business-7132-mock-set.mjs` is the provider-free planner for the first complete mock set. It resolves the current Course Truth and Exam Truth on every run, reads the Mock Profile, calibration metadata and named-item catalogue, and creates `.artifacts/content-factory-aqa-business-7132-mock-plan/mock-set-plan.json`.

The plan is production specification data only. It does not contain learner-facing questions, case text, datasets or mark-scheme prose and it makes no provider call.

The planner allocates:

- all three required papers exactly once;
- structural slots, tariffs, compulsory/choice rules and context ownership;
- AO marks per slot using the qualification-percentage-point interpretation from Exam Truth;
- quantitative marks backed by formula targets;
- exact Course Truth requirement IDs and named-item targets;
- coherent Paper 2 set contexts and one shared Paper 3 case context;
- no repeated named-item target in this first plan; and
- broad course distribution without attempting to predict future AQA topic placement.

### Paper 1

The plan contains:

- 15 one-mark MCQ slots;
- a calibrated 35-mark Section B shape of `4, 4, 4, 5, 9, 9`;
- two 25-mark Section C options;
- two 25-mark Section D options;
- 150 printed marks but 100 attempted marks; and
- all four valid C/D response paths.

Every response path must independently reconcile to 100 attempted marks and remain inside the published component AO ranges. Optional choice therefore cannot rescue an otherwise-invalid paper.

### Paper 2

The plan contains three compulsory coherent data-response contexts with calibrated set totals of 35, 31 and 34 marks. Each set contains three or four linked parts and owns a fixed synthetic fact/data state that generation must preserve.

### Paper 3

The plan contains one shared synthetic case context followed by six linked compulsory questions with calibrated tariffs of `12, 12, 16, 16, 20, 24`. All six questions must use the same fixed case fact state.

### Deterministic validation

The planner fails closed when any mechanically provable contract drifts, including:

- component identity, duration or attempted marks;
- Paper 1 printed/attempted mark accounting;
- Paper 1 response-path count or path totals;
- Paper 2 set totals or part counts;
- Paper 3 shared-case/question-count shape;
- slot AO arithmetic;
- paper-level and whole-set AO ranges;
- minimum quantitative-mark allocation;
- unknown Course Truth requirements or named items;
- a quantitative slot without a formula target;
- repeated target signatures;
- insufficient course breadth; or
- rights/planning guard drift.

The first plan deliberately requires at least 30 distinct Course Truth requirements and coverage across all ten major specification sections while preserving the Mock Profile rule that a single mock set does not need to force all 42 requirements into one examination set.

## Provider-free CI evidence

The existing GitHub Action `Content Factory AQA Business 7132 Mock Profile` now validates both the Mock Profile and the deterministic planner on the exact PR head. It then retains the generated plan JSON as a 90-day workflow artifact and explicitly proves that no `OPENAI_API_KEY` is present for this stage.

A green workflow therefore demonstrates that the exact branch head can resolve its current dependencies and construct a structurally valid three-paper plan without paid generation.

## Generation batches after this gate

The first live pilot should use bounded coherent units rather than one enormous course call or one call per isolated question:

- **Paper 1:** one shared paper plan; Section A/B may be generated in bounded chunks, while each C/D essay option is generated against the same paper coverage ledger. Paper-level validation reconciles the choices and 100 attempted marks.
- **Paper 2:** three data-response set units. Each unit owns one coherent stimulus/dataset and all of its parts. The three units share the paper coverage/difficulty ledger.
- **Paper 3:** one case-study context unit followed by the complete linked question set. Questions may be generated in bounded calls only after the shared case is fixed; no question may invent conflicting case facts.

This keeps provider context small without degrading whole-paper coherence.

## Existing accepted question-bank reuse

The 245 accepted questions are reused first as:

- coverage evidence;
- tariff/command/style intelligence;
- examples of already-detected failure modes;
- formula/calculation validation evidence; and
- optional exact-fingerprint source material when a question genuinely fits a planned slot.

The first mock set should **not** optimise aggressively for question-text reuse. Forcing bank questions into a paper would recreate the exact failure the mock stage is meant to prevent: a collection rather than an examination.

If an unchanged accepted question is later reused, its existing question-level assurance can be retained, but it still participates in fresh whole-paper assurance because context, progression and cross-paper duplication are new relationships.

## Whole-paper assurance after generation

After software checks, use fresh-context independent review at whole-paper level. Reuse the current Fast-Path ledger/fingerprint semantics and two-fresh-round limit.

Fresh review is required only for new/changed mock fingerprints. Unchanged Foundation, Course Truth, Exam Truth and accepted question dependencies are not repurchased.

The whole-paper checklist must cover:

- assessment-model fidelity;
- question/mark-scheme validity;
- factual and calculation accuracy;
- paper totals and every optional response path;
- timing realism;
- coverage and synoptic validity;
- difficulty progression;
- quantitative balance;
- command/tariff realism;
- case/stimulus coherence;
- cross-paper duplication; and
- originality / rights safety.

## Spend boundary before live generation

No paid provider calls are made by this deterministic-planner change.

For the first complete three-paper mock set, the **mock-stage pilot cap remains US$8 total new provider spend**, including fresh generation and independent review. The later live runner must stop before starting a call that could breach that cap.

This is intentionally below the existing US$20 hard automated ceiling for one live Content Factory course run. If the deterministic plan or conservative estimator says US$8 is insufficient, stop before generation and review batching/model routing; do not weaken assurance and do not silently consume the remaining course ceiling.

Observed generation/review spend will be retained by stage so the cap can be recalibrated from evidence.

## Learner publication

The existing Exam Prep / `ExamSimulator` experience already supports full timed papers, question navigation, delayed marking guidance and confidence-limited self-assessment. The mock output should therefore adapt into the existing typed `Exam` content model after assurance.

No new learner route or duplicate mock surface is required.

Learner wording must identify the papers as Revision-authored realistic practice papers built to AQA's structure and not official AQA papers or mark schemes.

## This branch

This branch adds only the deterministic pre-spend planning gate:

1. the provider-free three-paper planner;
2. exact Course Truth / Exam Truth / Mock Profile dependency fingerprints in the plan;
3. deterministic mark, option-path, AO, quantitative, target and breadth validation;
4. coherent Paper 2 / Paper 3 context ownership specifications;
5. exact-head CI execution and retained plan evidence; and
6. technical documentation updates.

It does **not** create learner mock questions, case studies, datasets or mark schemes; call an AI provider; publish mocks; or alter the learner UI.

After Founder-approved merge, the next governed change can add the spend-guarded live generation/review runner against this validated plan contract. Paid generation must still run only from approved `main`, following the existing Content Factory pattern.

## Documentation impact

Normative impact: none. The active `Content Factory Mock Exam Production` authority already requires deterministic planning before paid generation, so this branch implements rather than changes that contract.

Technical impact: adds the AQA 7132 deterministic paper-set planner, exact-head plan validation and retained workflow evidence. No existing Course Truth, Exam Truth, Foundation, learner content, routes, persistence or historical evidence are modified.

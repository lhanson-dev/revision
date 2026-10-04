# Content Factory Mock Exam Production

**Status:** deterministic planner plus bounded generation / whole-paper assurance runner implemented; first live pilot stopped fail-closed at one Paper 3 generation defect; retained-failure resume remediation implemented  
**Current implementation baseline:** approved `main` after PR #520 (`93e2be95c1e7c3214404c3d5965e44b0f675957b`)  
**Pilot qualification:** AQA A-level Business 7132, 2027 outgoing specification

## Purpose

Implement the governed whole-paper layer between established Course Truth / Exam Truth and Revision-authored mock generation.

The governing contract is `80-company-workflows/Content Factory Mock Exam Production.md`. This technical document describes current implementation only; it does not redefine that authority.

The learner-facing destination remains the existing Exam Prep / `ExamSimulator` experience. This implementation creates no new learner route and grants no publication authority.

## Existing dependencies

The Business pilot already owns deterministic Course Truth and Exam Truth materialisation, exact-course assurance and fingerprint reuse, the reusable Business Subject Foundation, the accepted Revision-authored question bank and the existing Exam Prep learner surface.

PR #517 added the pre-generation profile foundation:

- `content-factory/mock-exams/aqa-7132/MOCK_PROFILE.json`;
- `content-factory/mock-exams/aqa-7132/CALIBRATION.json`;
- provider-free profile validation; and
- the provider-free `Content Factory AQA Business 7132 Mock Profile` GitHub Action.

PR #519 added the deterministic paper-set planner and validator. PR #520 added the bounded live generation, blind-answer, unit-review, whole-paper-review and complete-set-review runner. AQA materials remain `REFERENCE_ONLY`; protected question wording, cases, datasets and mark-scheme prose are not reusable mock content.

## Deterministic mock-set planner

`scripts/content-factory/plan-aqa-business-7132-mock-set.mjs` materialises current Course Truth and Exam Truth, resolves the current Mock Profile and calibration metadata, and produces:

`.artifacts/content-factory-aqa-business-7132-mock-plan/mock-set-plan.json`

The plan is deterministic for the exact dependency fingerprints and records its own fingerprint.

The planned three-paper structure is:

| Component | Planned structure | Attempted marks |
| --- | --- | ---: |
| 7132/1 | 15 MCQs; six Section B responses totalling 35; two 25-mark options in C and two in D, with one response required from each choice section | 100 |
| 7132/2 | Three coherent compulsory data-response sets using calibration-backed 35 / 31 / 34 mark shapes | 100 |
| 7132/3 | One coherent case with six linked questions using the calibration-backed 12 / 12 / 16 / 16 / 20 / 24 mark shape | 100 |

Paper 1 retains the distinction between 150 printed marks and 100 attempted marks.

The plan allocates 34 quantitative marks across the 300 attempted marks and one distinct primary Course Truth requirement to each of 41 printed structural slots. It deliberately samples 41 of the 42 governed requirements rather than forcing full-course coverage into one mock set.

## Provider-free deterministic gate

`scripts/assurance/validate-aqa-business-7132-mock-plan.mjs` rebuilds the plan and fails closed unless it proves at least:

- exactly three required papers;
- 120 minutes and 100 attempted marks per paper;
- all four permitted Paper 1 C/D response paths independently reconcile to 100 marks;
- Paper 1 preserves 150 printed / 100 attempted marks;
- slot AO arithmetic reconciles exactly to tariffs;
- component and overall AO allocations remain inside current Exam Truth ranges;
- at least 30 quantitative marks are planned (currently 34);
- every printed slot resolves to Course Truth and mapped Subject Foundation dependencies;
- primary Course Truth targets are not repeated in the initial printed plan;
- Paper 2 and Paper 3 context ownership remains coherent; and
- provider calls remain zero during this gate.

The existing `Content Factory AQA Business 7132 Mock Plan` workflow owns this pre-generation gate.

## Bounded generation units

`scripts/assurance/aqa-business-7132-mock-generation.ts` and `aqa-business-7132-mock-generation.test.ts` implement the next stage without changing the paper plan.

The 41 printed slots are generated and reviewed through 13 bounded coherent units:

- Paper 1 Section A: three five-MCQ units;
- Paper 1 Section B: two three-question units;
- Paper 1 Sections C and D: four independent essay-option units;
- Paper 2: one unit per fixed data-response stimulus/set (three units); and
- Paper 3: one fixed case unit containing all six linked questions.

This boundary is deliberately smaller than a whole paper. A failed question or review finding therefore does not force unrelated mock content to be repurchased.

## Shared context ownership

The runner generates shared context before linked questions:

- each Paper 2 data-response set receives one fixed synthetic business stimulus/dataset;
- Paper 3 receives one fixed synthetic case/dataset shared by all six questions; and
- Paper 1 essays use independent synthetic contexts where needed.

Linked questions are software-blocked if they invent their own competing context. If a context-coherence review fails, only that shared context and its dependent questions become stale.

Synthetic businesses and data remain the default rights-safe approach.

## Question and mark-scheme generation

Every question call receives only:

- the exact deterministic slot specification;
- rights-safe Course Truth requirement summaries;
- the mapped Subject Foundation teaching/quantitative content required by that slot;
- the fixed shared context where applicable; and
- targeted remediation findings when the exact unit previously failed.

The provider must return the exact slot ID, family, command word, tariff and AO mark allocation. Course Truth targets count only when the question directly demands them and they are necessary for full marks.

Software validates before semantic review:

- plan identity, family, command word, tariff and AO arithmetic;
- MCQ option/key structure;
- point-mark or level-of-response mark-scheme reconciliation;
- exact planned quantitative-mark allocation;
- recomputation of structured calculations and presence of each calculated answer in the mark scheme; and
- fixed shared-context ownership.

Generated mock wording, cases, data and marking guidance are Revision-authored. Official AQA material remains calibration/reference evidence only.

## Blind answering and unit assurance

Each bounded unit is answered blind by a fresh provider call that sees learner-facing stimulus/questions only, not the plan or mark schemes.

The unit reviewer then receives the generated unit, blind answers and compact Foundation evidence and answers only the fixed checklist covering:

- question validity;
- blind-answer reconstruction against the mark scheme;
- mark-scheme validity;
- factual accuracy;
- context coherence; and
- exam authenticity/originality.

The Fast-Path two-fresh-round rule applies. Round-two remediation regenerates only the affected question(s), or the shared context plus dependent questions where context coherence failed. An unresolved second round is escalated rather than reviewed a third time.

Unchanged accepted units are reused by exact fingerprint without generation, blind answering or review.

## Whole-paper and whole-set assurance

Question-level assurance is not sufficient.

After all bounded units can progress, software reassembles the papers and re-proves:

- exact generated slot set;
- every question still passes deterministic validation;
- no deterministic near-duplicate question stems across the complete set;
- generated quantitative marks still equal the planned 34;
- printed mark totals; and
- all four Paper 1 optional response paths still reconcile to 100 attempted marks.

Each assembled paper then receives a fresh fixed-checklist review covering validity, factual/data coherence, progression and difficulty, timing realism, command/tariff realism, quantitative balance, synoptic validity, breadth, duplication and assessment-model resemblance without protected-content copying.

A final complete-set review is separate from the individual paper reviews. It judges the semantic properties that require all three papers in view, especially:

- full-set breadth;
- cross-paper semantic duplication;
- overall quantitative and synoptic balance;
- difficulty balance; and
- overall assessment-model fit and originality.

Paper-level or full-set blocking findings are retained in their own ledgers. A later resume may target those findings, but the same unresolved fingerprint cannot enter a third fresh review round.

## Spend and resume contract

The live runner consumes the exact validated plan fingerprint and uses the Mock Profile's **US$8** mock-stage pilot ceiling.

Spend protection is cumulative across resumes:

- provider calls run sequentially through the existing Content Factory hard pre-call spend guard;
- observed/conservative provider spend is persisted after each call in `generation-state.json`;
- a resumed workflow must restore that state and target the same exact plan fingerprint;
- after the first live workflow has started, a later workflow dispatch must identify a prior run to resume rather than silently starting a fresh US$8 allowance; and
- if the conservative next-call reservation would exceed the remaining pilot allowance, the run stops before that call.

Generation failures retained in `generation-state.json` are part of resume evidence. On a governed resume the workflow exports only those exact slot-level deterministic failure strings as targeted `fix_these` remediation for the affected slot's first new generation attempt. This does not create or consume a semantic review round, does not change the durable source fingerprint, and does not affect unrelated accepted slots.

Remediation feedback is deliberately excluded from the durable source fingerprint. It can force a fresh call for the remediation attempt, but once the corrected output is accepted a later clean resume can reuse it rather than repurchasing the same content.

The company-wide US$20 course ceiling remains unchanged; the lower US$8 mock-stage pilot ceiling is the operative cap for this run.

## GitHub workflow

`.github/workflows/content-factory-aqa-business-7132-mock-generation.yml` has two modes.

**Pull request / preflight:** provider-free. It rebuilds the deterministic plan and runs all software tests, including retained-resume-feedback regression tests, with no provider key.

**Manual workflow dispatch from approved `main`:** live provider use is permitted only after the preflight passes. The workflow locks the run to the exact current plan fingerprint, enforces the cumulative resume rule, restores retained generation-failure feedback for the exact affected slot, supplies the US$8 cap and retains the generation/assurance artifact even when the live run fails closed.

The live evidence artifact is named from the exact reviewed `main` SHA and contains, where reached:

- generation state and cumulative spend;
- synthetic shared contexts;
- generated questions and Revision-authored mark schemes;
- blind answers;
- unit review ledger;
- paper review ledger;
- full-set review ledger;
- assembled paper artifacts and fingerprints; and
- final summary / publication lock state.

## Publication boundary

A successful live generation run ends at `assured_not_published`.

It does **not** itself:

- publish the mock;
- change Course Truth, Exam Truth or the Subject Foundation;
- alter learner navigation;
- create a duplicate mock route; or
- claim the mocks are official AQA papers.

The learner label remains:

> A realistic practice paper built to AQA's structure. Revision-authored; not an official AQA paper.

A successful live artifact must still be retained through the governed repository/release process before learner publication.

## Current execution state

The first live pilot was workflow run `37234199201` from approved `main` `93e2be95c1e7c3214404c3d5965e44b0f675957b`, using deterministic plan fingerprint `42ae1cf75e9cd6b35d3553ad083f01a921c6267b8b9b2c0d5397af001e83beed`.

It generated all four shared synthetic contexts and 40 of 41 planned question slots, then failed closed before blind-answer or semantic review because `P3-01` could not pass deterministic question validation after three attempts. The retained failure is `activity_e_total_float_after_amendment answer 1 is absent from the mark scheme`. Cumulative provider spend is **US$1.379328 across 47 calls**. No mock was published.

The next live run must resume exact evidence from run `37234199201`, preserve that cumulative spend, reuse the 40 accepted question slots and four shared contexts, and send the retained `P3-01` deterministic failure as targeted first-attempt remediation. It must not reset the pilot or invent a new review round for this generation defect.

## Documentation impact

Normative authority is unchanged. This continues to implement the already-approved `Content Factory Mock Exam Production` and Fast-Path contracts.

Technical documentation is updated because the first live pilot exposed a resume-specific implementation gap: cumulative spend and accepted outputs were retained, but the deterministic generation-failure message was not previously carried into the resumed first attempt. The correction is implementation-only, provider-free on the PR, creates no new learner route and does not alter Course Truth, Exam Truth, Foundation, Mock Profile or the deterministic paper plan. `INDEX.md` already points to this technical document, so no index change is required.

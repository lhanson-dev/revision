# Content Factory Mock Exam Production

**Status:** deterministic planner plus bounded generation / whole-paper assurance runner implemented; 41/41 generated slots retained; exact-slot blind-answer contract and bounded response-headroom hardening implemented from live pilot evidence  
**Current implementation baseline:** approved `main` after PR #523 (`31725ceea04d56d72ed5b86a5e1b59a9b1267a78`)  
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

PR #519 added the deterministic paper-set planner and validator. PR #520 added the bounded live generation, blind-answer, unit-review, whole-paper-review and complete-set-review runner. PR #522 carried retained deterministic question-generation failures into the first resumed attempt without resetting spend or repurchasing accepted questions. PR #523 bound fresh blind-answer output to the exact planned unit/slot set and retained unaffected blind units across failures. AQA materials remain `REFERENCE_ONLY`; protected question wording, cases, datasets and mark-scheme prose are not reusable mock content.

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

This boundary is deliberately smaller than a whole paper. A failed question, blind-answer call or review finding therefore does not force unrelated mock content to be repurchased.

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

The blind-answer structured-output contract is bound to the exact unit identity and exact planned slot keys. The provider cannot satisfy the schema with a missing or invented slot ID; accepted provider output is then normalised into deterministic plan order before retention. Software still verifies the exact returned slot set before the blind unit is retained.

A blind-answer unit is retried up to three times. If that unit still cannot satisfy the contract, its failure is persisted in `generation-state.json`, the runner continues attempting unaffected blind units, and the stage fails closed only after the bounded pass has retained everything else it can. Accepted blind units are reused by stable fingerprint on resume rather than purchased again.

Live run `37280091393` showed that the previous 4,000-token high-reasoning independent-review ceiling could return provider status `incomplete` repeatedly on the two remaining larger coherent blind units even though 11 other blind units were retained successfully. The mock runner therefore uses an 8,000-token independent-review ceiling while retaining the same sequential execution, three-attempt unit limit and cumulative US$8 pilot cap. The adapter currently records the provider status but not `incomplete_details`, so this is a bounded capacity correction supported by the observed failure pattern rather than a claim that the provider's internal incomplete reason was independently proven.

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
- after the first live workflow has started, a later workflow dispatch must identify the latest prior evidence-bearing run rather than silently starting a fresh US$8 allowance; and
- if the conservative next-call reservation would exceed the remaining pilot allowance, the run stops before that call.

Generation failures retained in `generation-state.json` are part of resume evidence. On a governed resume the workflow exports only those exact slot-level deterministic failure strings as targeted `fix_these` remediation for the affected slot's first new generation attempt. This does not create or consume a semantic review round, does not change the durable source fingerprint, and does not affect unrelated accepted slots.

Blind-answer failures are also retained as stage evidence. Accepted blind units remain reusable by exact fingerprint; a failed blind unit does not invalidate generated questions or other accepted blind units. A fail-closed blind stage writes a current `blind_answer_incomplete` summary containing completed units, missing units, failure reasons, cumulative spend and provider-call count before exiting.

Remediation feedback is deliberately excluded from the durable question source fingerprint. It can force a fresh call for the remediation attempt, but once the corrected output is accepted a later clean resume can reuse it rather than repurchasing the same content.

The company-wide US$20 course ceiling remains unchanged; the lower US$8 mock-stage pilot ceiling is the operative cap for this run.

## GitHub workflow

`.github/workflows/content-factory-aqa-business-7132-mock-generation.yml` has two modes.

**Pull request / preflight:** provider-free. It rebuilds the deterministic plan and runs all software tests, including retained-resume-feedback and exact blind-answer slot-contract regression tests, with no provider key.

**Manual workflow dispatch from approved `main`:** live provider use is permitted only after the preflight passes. The workflow locks the run to the exact current plan fingerprint, enforces the cumulative resume rule, restores retained generation-failure feedback for the exact affected slot, supplies the US$8 cap and retains the generation/assurance artifact even when the live run fails closed.

The live evidence artifact is named from the exact reviewed `main` SHA and contains, where reached:

- generation state and cumulative spend;
- synthetic shared contexts;
- generated questions and Revision-authored mark schemes;
- blind answers and retained blind-unit failures;
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

It generated all four shared synthetic contexts and 40 of 41 planned question slots, then failed closed before blind-answer or semantic review because `P3-01` could not pass deterministic question validation after three attempts. The retained failure was `activity_e_total_float_after_amendment answer 1 is absent from the mark scheme`. Cumulative provider spend was **US$1.379328 across 47 calls**. No mock was published.

The first governed resume was workflow run `37240194922` from approved `main` `783d69077c2bf2cfb4d795b47f2d8e63eab4dd69`. It restored the first run's exact evidence and sent the retained `P3-01` failure into the first new generation attempt. `P3-01` passed on that first resumed attempt, so the retained state reached all four shared contexts and **41/41 generated question slots**, with no remaining deterministic generation failure.

The same run then reached blind answering. `P1-A-CHUNK-1` was accepted and retained, while `P1-A-CHUNK-2` exhausted three provider attempts because the generic blind-answer schema permitted a returned slot set that did not exactly match the five planned MCQ slots. The runner failed closed at that boundary. Cumulative provider spend reached **US$1.475300**; the resume added **US$0.095972 across 6 provider calls**. No mock was published.

After PR #523 hardened the exact-slot contract, workflow run `37280091393` resumed that evidence from approved `main` `31725ceea04d56d72ed5b86a5e1b59a9b1267a78`. It reused all 41 generated questions and four shared contexts and retained **11 of 13 blind-answer units**. `P2-SET-3` and `P3-CASE-1` each exhausted three blind-answer attempts with provider status `incomplete`. The run added **US$0.464342 across 16 provider calls**, bringing cumulative mock-stage spend to **US$1.939642**. Its fail-closed artifact retained all successful work and publication remained locked.

A later dispatch, workflow run `37283715555`, supplied the older `37240194922` resume ID. The linear cumulative-spend gate correctly rejected it because `37280091393` was already the latest evidence-bearing run. The provider stage never started, so this dispatch added **US$0** spend and is not a resume point.

After the response-headroom hardening is merged and production-verified, the next live workflow must resume exact evidence from run **`37280091393`**. It must preserve US$1.939642 cumulative spend, all 41 generated questions, all four contexts and the 11 accepted blind units whose fingerprints remain unchanged. It must not resume `37240194922` or the pre-provider rejected run `37283715555`.

## Documentation impact

Normative authority is unchanged. This continues to implement the already-approved `Content Factory Mock Exam Production` and Fast-Path contracts.

Technical documentation is updated because live evidence exposed a bounded provider-capacity defect after the exact-slot correction: two remaining larger blind-answer units repeatedly returned provider status `incomplete` under the mock runner's 4,000-token high-reasoning independent-review ceiling. The implementation correction raises that runner-local ceiling to 8,000 tokens while preserving the exact plan, fingerprints, retry/failure-isolation rules, US$8 cumulative cap and publication lock. It creates no learner route and does not alter Course Truth, Exam Truth, Foundation, Mock Profile or the deterministic paper plan. `INDEX.md` already points to this technical document, so no index change is required.

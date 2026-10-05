# Content Factory Mock Exam Production

**Status:** deterministic three-paper plan implemented; 4/4 shared contexts, 41/41 questions and 13/13 blind-answer units retained; semantic unit assurance has 10/13 accepted reviews with three case-only review-identity failures isolated for governed resume  
**Current implementation baseline:** proposed PR branch based on approved `main` `4bf94aceb03aa2da3db01acf1c8d09eb31efc362`  
**Latest evidence-bearing live run:** `37299460148`  
**Pilot qualification:** AQA A-level Business 7132, 2027 outgoing specification

## Purpose

Implement the governed whole-paper layer between established Course Truth / Exam Truth and Revision-authored mock generation.

The governing contract is `80-company-workflows/Content Factory Mock Exam Production.md`. This technical document records implementation and live execution evidence only; it does not redefine that authority.

The learner-facing destination remains the existing Exam Prep / `ExamSimulator` experience. Mock generation grants no publication authority and creates no new learner route.

## Existing dependencies

The Business pilot already owns deterministic Course Truth and Exam Truth materialisation, exact-course assurance and fingerprint reuse, the reusable Business Subject Foundation, the accepted Revision-authored question bank and the existing Exam Prep learner surface.

Key mock-production implementation lineage:

- PR #517 added the versioned REFERENCE_ONLY Mock Profile, calibration metadata and provider-free profile validation;
- PR #519 added the deterministic three-paper planner and validator;
- PR #520 added bounded live generation, blind answering, unit review, whole-paper review and complete-set review;
- PR #522 carried retained deterministic question-generation failures into resume without resetting spend or repurchasing accepted questions;
- PR #523 bound blind-answer output to the exact planned unit and slot keys and isolated failed blind units;
- PR #528 raised independent-review output capacity from 4,000 to 12,000 tokens after live Paper 3 blind-answer responses repeatedly ended incomplete.

AQA materials remain `REFERENCE_ONLY`; protected question wording, cases, datasets and mark-scheme prose are not reusable mock content.

## Deterministic mock-set planner

`scripts/content-factory/plan-aqa-business-7132-mock-set.mjs` materialises current Course Truth and Exam Truth, resolves the current Mock Profile and calibration metadata, and produces:

`.artifacts/content-factory-aqa-business-7132-mock-plan/mock-set-plan.json`

The current deterministic plan fingerprint is:

`42ae1cf75e9cd6b35d3553ad083f01a921c6267b8b9b2c0d5397af001e83beed`

The planned set is:

| Component | Planned structure | Attempted marks |
| --- | --- | ---: |
| 7132/1 | 15 MCQs; six Section B responses totalling 35; two 25-mark options in C and two in D, with one response required from each choice section | 100 |
| 7132/2 | Three coherent compulsory data-response sets using calibration-backed 35 / 31 / 34 mark shapes | 100 |
| 7132/3 | One coherent case with six linked questions using the calibration-backed 12 / 12 / 16 / 16 / 20 / 24 mark shape | 100 |

Paper 1 retains 150 printed marks and 100 attempted marks. The plan allocates 34 quantitative marks across the 300 attempted marks and one distinct primary Course Truth requirement to each of 41 printed structural slots. It deliberately samples 41 of the 42 governed requirements rather than forcing full-course coverage into one mock set.

## Provider-free deterministic gate

`scripts/assurance/validate-aqa-business-7132-mock-plan.mjs` rebuilds the plan and fails closed unless software proves at least:

- exactly three required papers;
- 120 minutes and 100 attempted marks per paper;
- all four permitted Paper 1 C/D response paths reconcile independently to 100 marks;
- Paper 1 preserves 150 printed / 100 attempted marks;
- slot AO arithmetic reconciles exactly to tariffs;
- component and overall AO allocations remain inside current Exam Truth ranges;
- at least 30 quantitative marks are planned, currently 34;
- every printed slot resolves to Course Truth and mapped Subject Foundation dependencies;
- primary Course Truth targets are not repeated in the initial printed plan;
- Paper 2 and Paper 3 context ownership remains coherent; and
- provider calls remain zero during this gate.

The `Content Factory AQA Business 7132 Mock Plan` workflow owns this pre-generation gate.

## Bounded generation units

The 41 printed slots are generated and reviewed through 13 coherent units:

- Paper 1 Section A: three five-MCQ units;
- Paper 1 Section B: two three-question units;
- Paper 1 Sections C and D: four independent essay-option units;
- Paper 2: one unit per fixed data-response stimulus/set, three units; and
- Paper 3: one fixed case unit containing all six linked questions.

This boundary is deliberately smaller than a whole paper. A failed question, blind-answer call or semantic review therefore does not invalidate unrelated retained mock evidence.

## Shared context, question and mark-scheme generation

Shared synthetic context is generated before linked questions. Paper 2 owns one context per data-response set; Paper 3 owns one case across all six questions. Synthetic businesses and data are the default rights-safe approach.

Every question call receives only the exact deterministic slot specification, rights-safe Course Truth requirement summaries, mapped Subject Foundation teaching/quantitative content, the fixed shared context where applicable and targeted remediation findings when the exact item previously failed.

Software validates plan identity, family, command word, tariff, AO arithmetic, MCQ structure, mark-scheme reconciliation, quantitative allocation, calculation recomputation and shared-context ownership before semantic review. Generated wording, cases, data and marking guidance are Revision-authored.

## Blind answering

Each bounded unit is answered blind by a fresh provider call that sees learner-facing stimulus/questions only, not the plan or mark scheme.

The blind-answer structured-output contract is bound to the exact unit identity and exact planned slot keys. A missing or invented slot cannot satisfy the provider contract. Accepted output is normalised into deterministic plan order and software still verifies the exact returned slot set before retention.

A blind-answer unit is retried up to three times. A failed unit is persisted while unaffected units continue; the stage fails closed only after the bounded pass has retained everything else it can. Accepted blind units are reused by stable fingerprint on resume.

Paper 3 is the largest blind unit: six linked questions totalling 100 marks, including 16-, 20- and 24-mark extended responses. Live evidence proved the former 4,000-token independent-review ceiling was too small. The runner therefore reserves a 12,000-token maximum output ceiling for independent-review calls. This is a response-capacity ceiling, not a required response length, and does not change the US$8 cumulative mock-stage spend guard.

## Semantic unit assurance

The unit reviewer receives generated questions, blind answers and compact Foundation evidence and answers only the fixed checklist covering question validity, blind reconstruction, mark-scheme validity, factual accuracy, context coherence and exam authenticity/originality.

Fast-Path rules remain authoritative:

- software-proven facts come first;
- only proven teaching/question failures block;
- AI-call failures remain isolated to one review unit;
- unchanged accepted inputs are reused by exact fingerprint;
- at most two fresh semantic review rounds are permitted for blocking content findings; and
- unresolved second-round findings escalate rather than entering a third review round.

### Review identity normalisation

Live run `37299460148` exposed a non-content failure at this stage. Three otherwise scoped unit-review calls returned the correct unit identity with different letter casing, for example `p1-b-chunk-2` instead of canonical `P1-B-CHUNK-2`. The generic review runner rejected that string after the paid response and retried it.

The hardened Fast-Path runner treats a **case-only** identity difference as deterministically equivalent because the review call is already scoped to exactly one planned unit. It canonicalises the returned value to the planned unit ID before ledger retention. A genuinely different ID remains invalid and follows the existing bounded three-attempt failure path.

This is identity normalisation only. It does not change the review checklist, finding classification, review fingerprints, blocking rules, two-round semantic limit or accepted content. Provider-free regression coverage proves both the accepted case-only path and rejection of a genuinely different ID.

Because whole-paper and complete-set assurance also use `runReviewUnits`, the same canonical identity rule applies if those later review stages return only a casing variation in their scoped ID.

## Whole-paper and whole-set assurance

After every bounded unit can progress, software reassembles the papers and re-proves:

- exact generated slot set;
- every question still passes deterministic validation;
- no deterministic near-duplicate question stems across the complete set;
- generated quantitative marks still equal the planned 34;
- printed mark totals; and
- all four Paper 1 optional response paths still reconcile to 100 attempted marks.

Each assembled paper then receives a fresh fixed-checklist review covering validity, factual/data coherence, progression and difficulty, timing realism, command/tariff realism, quantitative balance, synoptic validity, breadth, duplication and assessment-model resemblance without protected-content copying.

A final complete-set review separately judges properties requiring all three papers in view: full-set breadth, cross-paper semantic duplication, quantitative and synoptic balance, difficulty balance, and overall assessment-model fit/originality.

Paper-level or set-level blocking findings are retained in their own ledgers. A later resume may target those findings, but the same unresolved fingerprint cannot enter a third fresh review round.

## Spend and resume contract

The live runner consumes the exact validated plan fingerprint and uses the Mock Profile's **US$8** mock-stage pilot ceiling.

Spend protection is cumulative across resumes:

- provider calls run sequentially through the Content Factory pre-call spend guard;
- observed/conservative provider spend is persisted after each call in `generation-state.json`;
- a resumed workflow must restore that state and target the same exact plan fingerprint;
- later dispatches must identify the latest prior evidence-bearing run rather than silently starting a fresh allowance; and
- if the next-call reservation would exceed the remaining pilot allowance, the run stops before that call.

Generation and blind-answer failures are retained as stage evidence. Remediation feedback is excluded from durable source fingerprints so accepted corrected outputs can later be reused rather than repurchased.

The company-wide US$20 course ceiling remains unchanged; the lower US$8 mock-stage pilot ceiling is the operative cap for this set.

## GitHub workflow

`.github/workflows/content-factory-aqa-business-7132-mock-generation.yml` has two modes.

**Pull request / preflight:** provider-free. It rebuilds the deterministic plan and runs software assurance with no provider key.

**Manual workflow dispatch from approved `main`:** live provider use is permitted only after provider-free validation. The workflow locks the exact plan fingerprint, enforces the linear cumulative-spend resume chain and retains the generation/assurance artifact even when the live run fails closed.

The retained artifact contains, where reached, generation state, contexts, questions/mark schemes, blind answers, unit/paper/set review ledgers, assembled papers, fingerprints and publication-lock summary.

## Publication boundary

A successful live generation run ends at `assured_not_published`.

It does **not** publish the mock, change Course Truth/Exam Truth/Foundation, alter learner navigation, create a duplicate mock route or claim official AQA status.

The learner label remains:

> A realistic practice paper built to AQA's structure. Revision-authored; not an official AQA paper.

A successful live artifact must still pass the governed repository/release process before learner publication.

## Live execution lineage

### Run `37234199201`

First live pilot from approved `main` `93e2be95c1e7c3214404c3d5965e44b0f675957b`. It generated four shared contexts and 40/41 question slots, then failed closed on `P3-01` deterministic validation. Cumulative spend: **US$1.379328 across 47 calls**. No blind or semantic review started.

### Run `37240194922`

Governed resume from approved `main` `783d69077c2bf2cfb4d795b47f2d8e63eab4dd69`. Retained `P3-01` feedback repaired that slot on the first resumed generation attempt, reaching 41/41 questions. `P1-A-CHUNK-1` blind answer passed; `P1-A-CHUNK-2` exhausted three calls because the old blind schema allowed the wrong slot set. Cumulative spend: **US$1.475300**. PR #523 hardened exact blind identity/slot binding.

### Run `37280091393`

Resume under the hardened blind contract. Generated questions/contexts were reused, eleven blind units were retained, and only `P2-SET-3` and `P3-CASE-1` remained incomplete. Cumulative spend: **US$1.939642**. Semantic review had not started.

### Run `37290839911`

Resume on approved `main` `ce1955953b428e8023c5d0c72c07a73830ff4a1a`. `P2-SET-3` completed. `P3-CASE-1` again ended `OpenAI response status was incomplete`, leaving 12/13 blind units. Five calls were made and cumulative spend reached **US$2.192934**. PR #528 raised independent-review output capacity to 12,000 tokens.

### Run `37299460148`

Resume on approved `main` `3d97439e48edcb9251b3ebac1a8da21d1f22d8e0` with `resume_run_id=37290839911`.

The Paper 3 capacity fix worked: `P3-CASE-1` was accepted, so the retained state now has **4/4 contexts, 41/41 generated questions and 13/13 blind-answer units**.

Semantic unit assurance then ran. **10/13 unit reviews passed**. The remaining three units were:

- `P1-B-CHUNK-2`;
- `P1-D-02`; and
- `P2-SET-2`.

They failed after bounded retries because the reviewer returned their scoped IDs with different letter casing. There were **zero blocking content findings and zero Founder escalations**. The failure therefore isolates review-identity handling rather than subject/question quality.

The run made **22 provider calls** and cumulative mock-stage spend reached **US$3.348264**. No paper-level or complete-set semantic review was reached. Nothing was published; `publication_authority` remains false.

## Next governed resume

After this identity-normalisation patch is merged and production-verified, the next live mock workflow must resume exact retained evidence from:

`resume_run_id = 37299460148`

It must preserve the **US$3.348264** cumulative spend and reuse the four contexts, 41 questions, 13 blind units and ten passed semantic unit reviews where fingerprints remain unchanged. It must not restart from an older run or reset the pilot allowance.

## Documentation impact

Normative authority is unchanged. The patch implements the existing Fast-Path failure-isolation and exact-fingerprint reuse contracts; it does not change the Mock Profile, paper plan, Course Truth, Exam Truth, Subject Foundation, learner experience, publication boundary, review checklist or spend cap.

This technical document is updated because live execution proved a case-only semantic-review identity defect. `INDEX.md` already points to this technical implementation record, so no index change is required.

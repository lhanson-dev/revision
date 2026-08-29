# Content Factory Reliability Qualification Harness

## Status

The Content Factory reliability programme is **paused after Confirmation Pilot #18 pending Reliability v2 implementation and qualification**.

Pilot #18 proved that the v1 Q1–Q6 provider-free qualification was valuable but insufficient as a predictor of live provider robustness. The pipeline progressed materially further than earlier failures, but a Marking Pack contained more than one operational-rubric defect and the current validator/repair path surfaced only the first defect before the one permitted repair. After that repair, a second defect of the same class became visible and the run failed closed.

The active governing authority is now `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0. Full-course paid pilots must remain disabled until Q1–Q7 v2 evidence is complete and a separate Q8 eligibility PR restores `qualified` status.

## Pilot #18 historical evidence

Pilot #18 remains historical evidence and is not rewritten:

- approved content head: `ed3bd4c4a50dd723da38952a41ff9bad084ad68d`;
- workflow run: `33239396439` / run number `18`;
- durable job: Issue `#234`;
- final state: `blocked` from `generating`;
- failure class: generic `provider_contract_failure` in Marking Pack operational-rubric validation after targeted repair;
- cumulative provider spend: `US$1.253632`;
- remaining course budget: `US$18.746368`;
- executed workers: `45`;
- successfully persisted Marking Packs before the failing target: `4`;
- independent educational review was not reached;
- expert review was not reached;
- nothing was published.

The key architectural finding is not merely that one generated rubric was wrong. The current `validateOperationalRubricCoverage` path throws at the first failing subquestion. The targeted repair therefore receives only that first diagnostic. If another subquestion contains the same or another repair-eligible defect, it becomes visible only after the repair. That behavior can turn several defects in one generated artifact into sequential live failures.

## Reliability v2 objective

The factory should behave like a compiler boundary around variable model output:

`model educational judgement → compiler-owned structure → complete deterministic diagnostics → at most one targeted repair → whole-artifact revalidation → valid artifact or fail closed`

The target is **not** perfect first-pass model output. The target is that normal model variability does not require an engineer to change TypeScript or prompts between ordinary courses.

## v2 implementation sequence

Implementation should proceed in short governed PRs against approved `main`.

### V2-A — complete-diagnostic validation and compiler ownership

Primary objective: remove the known Pilot #18 serial-defect behavior and reduce unnecessary model ownership.

Required work:

- change repair-eligible validators to collect the complete actionable diagnostic set for a parseable artifact rather than throw on the first independent defect;
- send the complete diagnostic set to the one bounded repair call;
- revalidate the complete repaired artifact once;
- retain explicit early stop only where the artifact is structurally unparseable or later validation is genuinely unsafe;
- review Marking Pack operational rubric structure and move mechanically constructible skeleton/banding responsibility into deterministic/compiler ownership where educational meaning is preserved;
- update worker semantic versions/dependency invalidation only for genuinely affected outputs.

### V2-B — historical failure replay corpus

Build a permanent corpus for all known contract-class failures from Pilots #1–#18 where durable evidence exists.

Evidence classes:

- **exact historical output** — replay the durable provider output unchanged through the current boundary;
- **synthetic reproduction** — where exact output is unavailable, encode the smallest generic reproduction and label it explicitly as synthetic.

The corpus must preserve original pilot records and prove the current expected outcome for every known defect class.

### V2-C — adversarial mutation matrix

Extend provider-free qualification beyond hand-authored happy-path/one-defect fixtures.

The mutation harness should cover, where applicable:

- blank/omitted/malformed optional values;
- duplicated/missing/reordered references;
- inconsistent totals;
- overlapping/missing/out-of-range mark bands;
- multiple calculation subquestions with simultaneous operational-rubric defects;
- mixed valid and invalid bounded locators;
- plausible phrasing alternatives;
- multiple independent repair-eligible defects in one artifact;
- combinations that must remain fail closed.

All five governed subject shapes remain required.

### V2-D — full provider-free qualification

Re-run Q1–Q6 on one exact implementation head:

- Q1 compiler/worker ownership inventory;
- Q2 historical failure replay corpus;
- Q3 adversarial provider-free subject matrix;
- Q4 deterministic full-pipeline simulation;
- Q5 restart/reuse/dependency invalidation;
- Q6 repeated stability with varied mutation inputs/seeds rather than only repeating one immutable fixture.

No live provider call belongs in Q1–Q6.

### V2-E — bounded live worker soak

Only after Q1–Q6 PASS, run Q7 as a separate bounded live-provider reliability exercise.

The soak must:

- use rights-safe synthetic/structured inputs;
- cover all five subject shapes across the sample set;
- include at least 20 live worker outputs in total;
- include multiple samples of assessment-item and Marking Pack generation plus any other boundaries Q1 classifies as high risk;
- use production compiler/validator/repair code;
- record every sample result, repair count and cost;
- stay below the governed US$5 soak ceiling;
- assemble/publish no real course;
- fail qualification on any new generic contract class the v2 boundary cannot safely handle.

Educational-content rejection that is correctly classified and fail-closed is not automatically a reliability failure. A new engineering contract class is.

### V2-F — separate Q8 eligibility transition

Only after Q1–Q7 PASS may a separate governed PR restore:

- `status: qualified`;
- `livePilotEligible: true`;
- evidence binding to the exact v2 qualification head;
- next paid run class `confirmation_pilot`.

Pilot #19 must not run before that transition merges.

## Maturity evidence after qualification

A successful Pilot #19 would be confirmation evidence, not proof that routine scaling is solved.

The factory becomes mature enough for routine course production only after **three consecutive materially different real courses** reach `expert_review_ready` on their initial full factory run without an engineering/code/worker-contract correction between those course runs.

Normal educational findings, bounded infrastructure retries and course-specific educational decisions do not break this sequence. A new generic engineering contract class does and resets the sequence after correction/requalification.

If two consecutive post-v2 confirmation-course attempts still expose new generic engineering contract classes, the Reliability Standard requires an architecture review before another full-course attempt rather than continuing a paid debugging loop.

## Current machine-readable state

On the Reliability v2 governance branch, `content-factory/reliability-qualification.json` is intentionally:

- `status: paused`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`;
- triggered by Pilot #18 workflow `33239396439` / Issue `#234`;
- requiring Q1–Q7 v2 gates before a separate Q8 eligibility transition.

Until this governance change is merged, approved `main` still contains the previous qualified record. Operationally, another full-course run should not be manually started because Pilot #18 has already invalidated the basis for that status.

## Documentation impact

Reliability v2 changes the governing reliability method and the bootstrap calibration cost model, so the same governed change updates:

- `80-company-workflows/Content Factory Reliability Qualification Standard.md`;
- `60-business-operations/Content Factory Bootstrap Cost Strategy.md`;
- `content-factory/reliability-qualification.json`;
- this indexed technical qualification record.

No historical pilot evidence is rewritten. No learner-facing product behavior changes in this authority/pause PR. `INDEX.md` does not require a new entry because the existing Reliability Qualification Standard and this harness remain the canonical indexed locations.

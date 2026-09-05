# Content Factory Post-ADR0022 Foundation Recompilation Checkpoint

**Status:** Fresh Foundation retained and rebound through PR #310; first post-hardening Slice 3B proof failed closed on reviewer/normaliser boundary; targeted repair in progress  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Related implementation plan:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`  
**Architecture decisions:** `decisions/ADR-0021-foundation-course-truth-semantic-seed.md`; `decisions/ADR-0022-foundation-precalibration-assessment-assembly.md`

## Purpose

Record the fresh Foundation compilation required after the fifth retained Slice 3B proof exposed two upstream educational/assessment ownership gaps, the subsequent source rebind, and the first post-hardening Slice 3B assurance outcome without rewriting earlier proof history.

This is append-only implementation evidence. It does not reinterpret earlier Slice 3B proofs and does not change normative Content Factory authority.

## Released upstream boundary

PR #308 released the Revision-owned semantic Course Truth seed for all 82 atomic AQA Business obligations. The seed now provides candidate definitions, relationships, quantitative methods/formulae, interpretation boundaries and explicit method scope rather than topic labels alone.

PR #309 released the AQA 7132 pre-calibration assessment-assembly guard. While Paper 2 and Paper 3 Question Families remain `not_calibrated`, Revision preserves verified aggregate component structure but prevents model generation/remediation from inventing unsupported exact constituent mark or timing patterns.

PR #309 merged and production-verified on approved `main` commit `599704ff77bc2f1e782f4804b142614a043700c7`.

## Fresh Foundation live proof

The governed **Content Factory Foundation Live Proof** ran once as workflow run `33938173128` on exact released `main` `599704ff77bc2f1e782f4804b142614a043700c7`.

Retained artifact:

- artifact id: `9960898017`;
- artifact name: `content-factory-foundation-live-proof-599704ff77bc2f1e782f4804b142614a043700c7`;
- artifact digest: `sha256:ba590273474bae9325bcc7b1a3add4e73bd5498c60d75cf1c603ed71ce56a16e`;
- retained proof file: `aqa-a-level-business-7132-foundation-599704ff77bc-1788574070566.json`.

The run completed successfully and retained a fresh AQA A-level Business 7132 — 2027 Foundation Candidate with:

- Foundation fingerprint: `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca`;
- Course Truth nodes: `82`;
- canonical coverage nodes: `82`;
- Course Truth compiler completeness: `complete`;
- Exam Truth compiler completeness: `complete`;
- quantitative minimum: `10%` of qualification marks;
- total qualification assessment marks: `300`;
- minimum quantitative marks: `30`;
- quantitative validation: `sum_quantitative_marks_gte_minimum`;
- interpretation credit required: `true`;
- live provider generation runs: Course Truth, Exam Truth and Question Families;
- conservative provider spend: `$0.202386 / $12.00`;
- learner-facing assets: `0`;
- deterministic assurance: `pending`, as expected after compilation;
- independent review: `pending`, as expected after compilation.

## Pre-calibration Question Family verification

The retained exact artifact shows the released assembly boundary is active:

- `paper2-data-response` remains `not_calibrated`, uses the component-wide `1..100` mark envelope, and states that constituent mark and timing allocations remain unfixed until qualified calibration;
- `paper3-case-study` remains `not_calibrated`, uses the component-wide `1..100` mark envelope, and states that constituent mark and timing allocations remain unfixed until qualified calibration;
- exact aggregate paper facts remain available for controlled generation without manufacturing unsupported internal precision.

This is the intended pre-calibration state. It is not a claim that Paper 2 or Paper 3 internal assembly has been qualified by a human assessment expert.

## Slice 3B source rebind — released through PR #310

PR #310 changed only the retained source identity used by `.github/workflows/content-factory-foundation-independent-review-proof.yml` from the earlier v2 Foundation to the exact fresh artifact above.

PR #310 merged as `519766280f9acd4b0687a99cdd914dae33ce9cd1`. Post-merge Revision CI #1578, Pages #242 and `revision/path-to-live` all passed on that exact merge commit.

The rebind did **not** change:

- source-rights rules;
- deterministic assurance severity;
- independent-review severity;
- fresh-context separation;
- remediation dependency closure;
- the three-material-remediation-cycle limit;
- the `$12` whole-proof spend ceiling;
- qualified expert-review requirements; or
- the zero-learner-asset boundary.

## First post-hardening Slice 3B proof — workflow `33954158017`

The governed **Content Factory Foundation Independent Review Proof** ran on released `main` `519766280f9acd4b0687a99cdd914dae33ce9cd1` against exact source Foundation fingerprint `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca`.

Retained evidence artifact:

- artifact id: `9965804707`;
- artifact name: `content-factory-foundation-independent-review-proof-519766280f9acd4b0687a99cdd914dae33ce9cd1`;
- artifact digest: `sha256:7da6a687a5c4f18a316354818f130c3848c97af58231729838086cb92716ca6e`.

Evidence:

- source artifact/digest verification passed;
- deterministic assurance status: `pass`;
- independent review status: `fail_hold`;
- fresh independent-review contexts: `1`;
- retained remediation contexts: `0` because remediation failed before a corrected candidate could be persisted;
- provider non-completed-response diagnostics: none;
- conservative provider spend: `$0.167342 / $12.00`;
- learner-facing assets: `0`;
- final Foundation fingerprint remained the unchanged source fingerprint `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca`.

The reviewer raised two material findings asking for more operational Paper 2 and Paper 3 constituent mark/timing assembly precision. To the extent those corrections require exact constituent mark/time bands before qualified calibration, they conflict with the deliberate ADR-0022 pre-calibration non-claim and are not supported by current governed evidence.

The remediation worker attempted to stay within the pre-calibration boundary. It included the valid aggregate phrase:

`component-level 120-minute response-time envelope`

and explicitly avoided fixed constituent timings. The local normaliser nevertheless rejected that text as though the exact `120-minute` component fact were an unsupported constituent allocation.

Exact blocker:

`remediation worker failure: provider_contract_failure: remediation_normalisation: Question Family paper2-data-response contains unsupported exact constituent mark/timing allocation outside compiler-owned response shape: Validate the component-level 120-minute response-time envelope and ensure each data-response set contains a viable balance of focused knowledge or interpretation, contextual application, developed analysis and supported judgement without asserting fixed constituent timings before qualified calibration.`

This is an implementation/reviewer-contract defect. It is not evidence that the Foundation should invent fixed constituent timings and is not a reason to weaken the guard or raise the remediation-cycle limit.

## Run #19 bounded repair

The required repair is:

1. preserve ADR-0022 unchanged: Paper 2 and Paper 3 stay aggregate-only while `not_calibrated`;
2. instruct the independent reviewer that deliberate absence of constituent calibration is not, by itself, a blocking/material defect;
3. prohibit reviewer recommendations that invent exact constituent mark/timing bands unsupported by supplied governed evidence;
4. permit exact mark/timing values only when they match verified Exam Truth component totals/timings and are locally expressed as aggregate component/paper facts; and
5. continue to reject per-question/per-set values, exact constituent sequences and other unsupported precision.

Regression assurance covers the exact Run #19 aggregate `120-minute` phrase and a counterexample where a paper sentence still assigns `40-minute` timing to each data-response set.

No material Foundation artifact changes in this repair. Therefore the same retained source Foundation remains the correct next proof input. A fresh Foundation compile is not required solely because the review/normalisation implementation changed.

## Progression boundary

After the Run #19 repair is exact-head assured, Founder-approved, merged and production-verified:

1. run one fresh Slice 3B proof against the same exact retained source Foundation;
2. require deterministic assurance PASS on the new reviewed implementation commit;
3. require a genuinely fresh independent-review context;
4. permit only evidence-supported smallest-safe remediation;
5. rerun deterministic assurance after every material correction; and
6. enter Slice 3C only if the exact final Foundation version reaches deterministic PASS plus independent-review PASS.

Even a clean Slice 3B PASS is not qualified expert approval. Slice 3C remains mandatory before `foundation_approved` and before any Learn, Practice or Exam Prep asset factory may start.

## Documentation impact

This checkpoint records the exact fresh compilation, released source rebind, Run #19 evidence and bounded implementation correction under existing Content Factory authority. No new normative authority or architecture decision is required. Earlier proof evidence remains historically intact.

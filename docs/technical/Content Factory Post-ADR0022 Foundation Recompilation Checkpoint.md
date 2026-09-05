# Content Factory Post-ADR0022 Foundation Recompilation Checkpoint

**Status:** Fresh post-ADR-0021 / ADR-0022 Foundation compilation retained; Slice 3B source rebind in progress  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Related implementation plan:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`  
**Architecture decisions:** `decisions/ADR-0021-foundation-course-truth-semantic-seed.md`; `decisions/ADR-0022-foundation-precalibration-assessment-assembly.md`

## Purpose

Record the fresh Foundation compilation required after the fifth retained Slice 3B proof exposed two upstream educational/assessment ownership gaps and PRs #308 and #309 released the corresponding deterministic hardening.

This is append-only implementation evidence. It does not reinterpret earlier Slice 3B proofs and does not change normative Content Factory authority.

## Released upstream boundary

PR #308 released the Revision-owned semantic Course Truth seed for all 82 atomic AQA Business obligations. The seed now provides candidate definitions, relationships, quantitative methods/formulae, interpretation boundaries and explicit method scope rather than topic labels alone.

PR #309 released the AQA 7132 pre-calibration assessment-assembly guard. While Paper 2 and Paper 3 Question Families remain `not_calibrated`, Revision now preserves verified aggregate component structure but prevents model generation/remediation from inventing unsupported exact constituent mark or timing patterns.

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

## Slice 3B source rebind

The released independent-review workflow is still pinned to the earlier retained v2 Foundation from workflow run `33896487722`, fingerprint `950c002c325e4d6a980d2588c707b3c541a3316b9fe5b7ce446fd51b1e481fac`.

That candidate predates the semantic-seed and pre-calibration assembly hardening and must not be used for the next Slice 3B qualification proof.

The current governed rebind changes only the retained source identity used by `.github/workflows/content-factory-foundation-independent-review-proof.yml` to the exact fresh artifact above. The workflow already performs deterministic assurance on the exact retained candidate before fresh-context review and deterministic re-assurance after any material remediation.

The rebind does **not** change:

- source-rights rules;
- deterministic assurance severity;
- independent-review severity;
- fresh-context separation;
- remediation dependency closure;
- the three-material-remediation-cycle limit;
- the `$12` whole-proof spend ceiling;
- qualified expert-review requirements; or
- the zero-learner-asset boundary.

## Progression boundary

After this source rebind is exact-head assured, Founder-approved, merged and production-verified, run **one** governed Slice 3B proof against Foundation fingerprint `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca`.

Do not rerun an older retained candidate as a substitute and do not blindly rerun a failed proof without diagnosing its retained evidence.

Slice 3B may progress to Slice 3C only if the exact current Foundation finishes with both:

1. deterministic assurance `pass`; and
2. fresh-context independent review `pass` with no unresolved blocking/material finding after any permitted targeted remediation.

Even a clean Slice 3B PASS is not qualified expert approval. Slice 3C remains mandatory before `foundation_approved` and before any Learn, Practice or Exam Prep asset factory may start.

## Documentation impact

This checkpoint records the exact fresh compilation and source-binding handoff under existing Content Factory authority. No normative authority or ADR change is required. Historical proof records remain unchanged.

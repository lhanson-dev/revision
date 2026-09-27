# Business Subject Knowledge Foundation v0.2 — Provenance Remediation

**Date:** 27 September 2026  
**Status:** REMEDIATED / AWAITING FRESH INDEPENDENT RE-ASSURANCE  
**Candidate:** `research/business-subject-foundation/v0.2-post-board-candidate`  
**Remediation branch:** `remediation/business-subject-provenance-v0-2`  
**Starting approved `main`:** `fd3362a8fdd6d4939db82a98ab7b8063128e3f0b`  
**Trigger:** `audits/2026-09-27-business-subject-foundation-v0.2-independent-assurance.md` / PR #405

## Purpose

Record the bounded remediation of the provenance/rights HOLD raised by the independent assurance of the Business `v0.2-post-board-candidate`.

This record is historical assurance evidence. It does not promote the candidate into approved Subject Knowledge Foundation authority and does not alter publication authority.

## Original HOLD findings addressed

PR #405 recorded a FAIL / HOLD for promotion because:

1. multiple reusable subject nodes relied only or primarily on sources classified as `REFERENCE_ONLY`;
2. awarding-body specification IDs appeared directly in reusable node provenance even though those sources are `REFERENCE_ONLY_BOARD_ALIGNMENT`;
3. promotion-grade source-rights metadata was incomplete for the exact reusable truth basis; and
4. deterministic assurance did not yet fail closed on those provenance conditions.

The prior assurance did not identify a blocking factual error in the sampled high-risk quantitative content and did not identify a missing major Business domain. This remediation therefore targets provenance only rather than regenerating educational content.

## Scope control

No teaching prose, formulas, examples, misconceptions, node titles, node IDs, node classifications or domain structure were changed by this remediation.

The nine existing node corpus files remain unchanged from the merged research candidate. Their original `sources` arrays are preserved as historical research/corroboration provenance rather than rewritten to imply that later rights checks existed at research time.

The remediation adds a separate promotion provenance layer.

## Promotion provenance sidecars

### Promotion source-rights supplement

`research/business-subject-foundation/v0.2-post-board-candidate/SOURCE_REGISTER_PROMOTION_SUPPLEMENT.json`

This supplement records the current source-rights basis for promotion assessment. For every source admitted as reusable subject truth it records:

- source identity and URL;
- version/date information available at the rights check;
- educational role;
- licence profile and permission basis;
- AI-context permission;
- permission for derived commercial use;
- attribution/restriction requirements;
- date checked;
- checker method; and
- confidence.

The accepted promotion classes in this remediation are:

- `OPEN_CC_BY_4_0`;
- `OPEN_CC_BY_3_0`; and
- `OPEN_OGL_V3`.

The supplement contains 20 promotion-eligible source records spanning broad Business education, marketing, accounting/finance, strategy/models, UK public-sector factual material and statistical/decision-analysis evidence.

### 81-node promotion matrix

`research/business-subject-foundation/v0.2-post-board-candidate/PROMOTION_PROVENANCE_MATRIX.json`

The matrix covers all 81 candidate node IDs.

Each node has:

- one or more `subject_truth_sources` drawn only from the promotion-eligible supplement;
- a separate `board_challenge_or_mapping_sources` array where awarding-body evidence appears in historical node provenance; and
- status `REMEDIATED_AWAITING_INDEPENDENT_REASSURANCE`.

The matrix explicitly states that:

- legacy node `sources` remain historical research/corroboration evidence;
- only `subject_truth_sources` are the reusable promotion truth basis;
- awarding-body sources are alignment or post-seal challenge evidence only;
- teaching content was not changed; and
- no promotion decision has yet been made.

## Board-source quarantine

The following awarding-body IDs are prohibited from reusable subject-truth provenance and are treated only as board alignment/challenge evidence:

- `SRC-AQA-7132`;
- `SRC-AQA-7138`;
- `SRC-OCR-H436`;
- `SRC-PEARSON-ALEVEL`;
- `SRC-EDUQAS-ALEVEL`;
- `SRC-WJEC-ALEVEL`; and
- `SRC-CCEA-ALEVEL`.

Where one of these IDs appears in a historical node `sources` array, the promotion matrix records the same ID in `board_challenge_or_mapping_sources`. The new deterministic check requires that quarantine to be exact.

## Source-rights regression handled without rewriting history

Fresh rights checks found that historical direct OpenStax model references used during research should not be treated as the current commercial generative promotion basis under Revision's fail-closed source standard.

The remediation therefore explicitly excludes these historical source IDs from promotion truth:

- `SRC-OPENSTAX-TAYLOR`;
- `SRC-OPENSTAX-MOTIVATION`;
- `SRC-OPENSTAX-MCGREGOR`; and
- `SRC-OPENSTAX-LEWIN`.

Their historical research role is preserved. Current promotion truth for the affected teaching is instead supported by sources whose commercial reuse/AI-context permissions are recorded in the promotion supplement.

## Deterministic fail-closed assurance

`scripts/assurance/validate-business-subject-provenance.mjs` was added and wired into the `Foundation quality` CI job before typecheck/lint/tests/build.

The validator fails if any of the following occurs:

- the node index, nine node corpus files and promotion matrix do not contain the same 81 unique IDs;
- a node lacks a promotion truth source;
- a promotion source is absent from the promotion rights supplement;
- a source is not explicitly promotion-eligible;
- the licence profile does not explicitly permit commercial derivative use and AI-context use;
- a board source or other promotion-excluded source is used as subject truth;
- a board source in historical node provenance is not quarantined identically in the promotion matrix; or
- the remediation attempts to represent itself as a promotion decision.

A deterministic PASS therefore proves structural/source-contract compliance only. It does not prove educational accuracy or approve the candidate.

## Remediation result

At branch construction time:

- candidate node count: **81**;
- promotion matrix node count: **81**;
- promotion-eligible source records: **20**;
- teaching node files changed: **0**;
- teaching meaning changed: **no**;
- historical research evidence rewritten: **no**;
- board sources permitted as reusable subject truth: **0**.

The exact-head CI run on the final pull request remains the authoritative deterministic execution evidence. Any mismatch found by that run must be remediated at the smallest safe scope before this record can be treated as mechanically complete.

## Residual assurance boundary

This remediation closes the provenance-design gap identified by PR #405 but does not itself clear the candidate for promotion.

The next mandatory gate is a fresh independent re-assurance against the exact remediated candidate/sidecar fingerprint. That reviewer must check, at minimum:

- that each promotion source actually supports the educational meaning for which it is mapped;
- that source-rights classifications and restrictions have been interpreted correctly;
- that the sidecar has not concealed a board-derived truth dependency;
- that no factual meaning changed indirectly through the remediation; and
- that no blocking/material provenance or subject-accuracy finding remains.

Only after that fresh review passes may a separate governed promotion decision be proposed.

## Decision

**REMEDIATED / AWAITING FRESH INDEPENDENT RE-ASSURANCE.**

Do not treat this state as `foundation_approved`, learner-publication approval, or authority promotion.

## Documentation impact

The implementation changes how Business v0.2 promotion provenance is mechanically assured, so `docs/technical/Content Factory Subject Foundation Trial.md` is updated on the same governed branch.

No normative authority is changed because this remediation implements the existing Subject Knowledge Foundation and Educational Content Source Licensing and Provenance standards rather than introducing a new company rule.

Historical research and the PR #405 HOLD audit remain unchanged.

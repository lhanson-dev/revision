# Content Factory Business Subject Foundation Fresh Reassurance — Promotion Semantics Correction

**Status:** Technical implementation correction for the Business Subject Knowledge Foundation reassurance trial  
**Date:** 28 September 2026  
**Applies to:** `scripts/assurance/business-subject-foundation-reassurance.mjs`  
**Normative authority:** `80-company-workflows/Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`, `80-company-workflows/Content Accuracy Assurance Gate.md`, `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`

## Purpose

Correct the fresh-reassurance review payload so the independent reviewer evaluates the Business candidate using the approved post-remediation promotion-provenance semantics rather than treating preserved historical research metadata as current promotion truth.

This is an implementation correction. It does not weaken the subject-foundation gate, change normative Content Factory policy, promote the Business candidate, or alter learner-facing content.

## Triggering evidence

GitHub Actions run `36401496160` reviewed current `main` `5693a7f3140c50c5bd2f5d7afd6c281ef4790281` and reached paid independent review. Exact-main identity, deterministic promotion-provenance assurance and the reassurance package self-test passed before the live review started.

The run completed five domain reviews before stopping in Strategy on a deterministic evidence-URL boundary error. Its retained evidence contained 41 blocking/material findings from the completed domains.

Inspection of those findings showed two different classes:

1. **invalid promotion-provenance findings** — reviewers treated the preserved legacy `sources` arrays in node research records, including quarantined awarding-body identifiers, as if they were current promotion truth; and
2. **potentially genuine educational/evidence findings** — for example insufficient promotion-safe source support for some economies-of-scale, operations, finance and people-content claims, plus possible Level 3 depth gaps.

The first class conflicts with the approved remediation semantics. The promotion matrix explicitly makes `subject_truth_sources` the reusable promotion truth basis while legacy node `sources` remain historical research/corroboration evidence and board references remain alignment/challenge-only evidence. Historical evidence must remain preserved rather than rewritten.

Run `36401496160` therefore remains immutable incomplete assurance evidence. Its genuine educational warnings remain useful for subsequent challenge, but its legacy-source/prohibited-board findings are not valid current-promotion defects merely because those identifiers remain in historical node metadata.

## Corrected reviewer boundary

The reassurance runner now constructs a dedicated reviewer representation of each node rather than passing the raw research node object unchanged.

The reviewer receives:

- the substantive node teaching and structure;
- the node's explicit `promotion_truth_source_ids` derived from `PROMOTION_PROVENANCE_MATRIX.json`;
- promotion-safe source metadata;
- a promotion-only provenance row containing `subject_id`, `subject_truth_sources` and promotion status; and
- the prohibited-source list as a boundary definition only.

The reviewer does **not** receive:

- the legacy node `sources` array; or
- `board_challenge_or_mapping_sources` as if it were promotion provenance.

Those historical fields remain in the repository, remain part of the candidate fingerprint, and remain covered by the deterministic provenance/quarantine validator. They are omitted only from the semantic independent-review payload so their mere historical existence cannot be mistaken for current subject-truth dependence.

## Assurance remains fail-closed

This correction does not relax content assurance.

For every node, the independent reviewer must still return at least one evidence item from that node's mapped promotion-truth sources. A node with no evidence from its mapped promotion source set is rejected deterministically.

The reviewer may additionally use another promotion-permitted source already supplied for the same domain. This allows genuine independent challenge when a mapped source is weak or a second permitted source exposes a contradiction, while keeping all evidence inside the rights-safe source universe.

Blocking/material findings still produce `fail_hold`. The reviewer remains required to challenge factual correctness, boundaries, causal claims, quantitative content, Level 3 scope, misconceptions, relationships, completeness and source support. Board-specific contamination remains a valid finding when assessment-only/administrative material has entered reusable subject truth or when teaching truth actually depends on prohibited awarding-body material.

Ordinary overlap between reusable Business knowledge and topics that exam boards assess is not, by itself, board contamination.

## Regression controls

The no-spend self-test now additionally proves that:

- legacy node `sources` do not enter domain-review payloads;
- legacy node `sources` do not enter whole-subject review payloads;
- `board_challenge_or_mapping_sources` do not enter promotion-provenance review rows;
- every reviewer node carries the exact mapped promotion-truth source IDs;
- additional domain evidence may only come from the promotion-permitted source universe; and
- a node response lacking evidence from its own mapped promotion source set fails deterministically.

Existing provider-schema, source-URL, incomplete-response, spend, reviewer-context, evidence-retention and decision-consistency controls remain in force.

## Strategy URL failure from run 36401496160

Run `36401496160` stopped while validating `BUS-STR-001` because the reviewer returned the registered HM Treasury Green Book 2026 page using a URL form that did not satisfy the existing exact registered-path/child-path rule.

The registered promotion source itself is already the Green Book 2026 page. This PR does not broaden the URL boundary generically or weaken host/source identity checks. A subsequent live run remains responsible for proving whether the current registered URL and reviewer evidence resolve cleanly under the existing fail-closed boundary. If a fresh run reproduces a legitimate canonical-URL mismatch, that must be handled as a separate bounded source-register/URL-normalisation defect rather than silently accepted.

## Progression

After this correction is merged, a new fresh reassurance run must execute against the exact then-current `main` SHA. The prior run cannot be reused as a PASS.

- A complete `pass` with no blocking/material finding permits a separate governed proposal to promote the reusable Business Subject Knowledge Foundation.
- A complete `fail_hold` provides the clean issue register for smallest-safe targeted remediation and another fresh reassurance run.
- A provider/runner/control failure remains neither PASS nor substantive FAIL/HOLD.

Exact AQA 7132 mapping, Course Truth, Exam Truth, exact-course assurance and qualified human review remain later gates.

## Documentation impact

No normative authority changes. This file records the current technical correction and preserves the historical run without rewriting it. The existing fresh-reassurance technical document remains the broader implementation history; this correction governs the promotion-semantics issue identified by run `36401496160`.

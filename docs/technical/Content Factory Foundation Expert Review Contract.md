# Content Factory Foundation Expert Review Contract

**Status:** Slice 3C implementation record — qualified-human contract and historical retained package released; PR #318 source-led completeness correction released; portable reconciliation hardening in follow-on implementation  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`  
**Implementation plan:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`

## Purpose

Define the qualified-human Foundation review boundary and the evidence that must accompany a Foundation before it can be treated as approval-ready.

AI review must not stand in for the human gate. The human package must also expose enough source-led evidence for the reviewer to challenge whether Course Truth and Exam Truth cover the complete applicable curriculum and exam requirement universes.

## Assurance correction — 5 September 2026

Qualified-human review of the historical retained AQA Foundation showed that the old package was exact and internally consistent but did not itself prove that the Foundation represented the complete applicable curriculum and exam requirement universe.

The defect was not stale artifact packaging. The package resolved the exact generated Foundation artifacts, but it did not separately expose the source-led denominator and the mapping from every applicable requirement to Course Truth / Exam Truth.

PR #318 corrected the upstream Foundation boundary by introducing independently source-led Curriculum Coverage Map and Exam Coverage Map requirements and fail-closed compilation/review/remediation guards.

The follow-on packaging hardening closes the remaining portable evidence gap by making that reconciliation directly inspectable in the qualified-human bundle.

## Current approval-ready package boundary

A new approval-ready qualified-human package requires all of the following for the same exact Foundation fingerprint:

- passing deterministic Foundation assurance;
- passing fresh-context independent Foundation review;
- no unresolved blocking Foundation findings;
- exact resolved Foundation artifacts and fingerprints;
- complete source-led curriculum reconciliation;
- complete source-led exam reconciliation; and
- a neutral human-decision submission template requiring genuine subject and assessment qualification evidence.

These are prerequisites for human review, not substitutes for it.

## Explicit coverage reconciliation

The current portable bundle uses schema version 2 and includes `coverage-reconciliation.json` alongside the exact generated Foundation artifacts.

For AQA 7132 / 2027 the reconciliation exposes:

### Curriculum

- the source-led curriculum profile identity;
- every applicable curriculum obligation;
- official and source references;
- curriculum hierarchy/path and concise requirement meaning;
- mechanically checkable named scope where applicable;
- semantic-item mappings; and
- exact canonical Course Truth node mappings.

### Exam

- the source-led exam profile identity;
- every applicable exam/assessment obligation;
- official and source references;
- exam hierarchy/path and concise requirement meaning;
- mechanically checkable required scope;
- evidence-item identities; and
- the exact Board Alignment, Assessment Blueprint and relevant Question Family artifact references supporting each obligation.

The package also verifies that every source reference used by the reconciliation resolves in the exact packaged Source Licence Register.

The reconciliation is derived from the governed source-led profiles. It does not create a second competing authority or allow the generated Foundation to define its own completeness denominator.

## Fail-closed packaging

The expert bundle must not be produced as approval-ready if:

- any expected Foundation artifact is unavailable or has the wrong fingerprint;
- the curriculum or exam profile does not match the exact course/cohort;
- a curriculum obligation lacks its required semantic or Course Truth node mapping;
- a required Course Truth node is absent;
- an exam obligation fails source-led reconciliation;
- a required source reference is absent from the Source Licence Register; or
- the reconciliation points to an artifact outside the exact resolved review bundle.

This makes the completeness evidence independently visible to the qualified human rather than relying only on instructions to infer it from generated artifacts.

## Human review task

The qualified reviewer or reviewer set must cover both `subject` and `assessment` expertise and provide qualification evidence references.

The reviewer must inspect both:

1. the explicit source-led curriculum/exam reconciliation; and
2. the exact Foundation artifacts to which it maps.

The review must challenge:

- whether the requirement universe itself is correct for the exact cohort;
- whether Course Truth represents every curriculum obligation accurately and at sufficient depth;
- whether Exam Truth represents the applicable assessment specification and current governed evidence;
- component structure, question/response families, assessment-objective demand and quantitative requirements;
- response and marking expectations and explicit pre-calibration boundaries;
- factual/conceptual accuracy and internal consistency;
- source boundary interpretation; and
- any missing applicable requirement.

Prior deterministic or independent-AI PASS evidence must not be treated as proof that the source-led requirement universe itself is correct.

A blocking or material finding requires `fail_hold`. A pass is valid only when no blocking or material findings remain.

## Neutral decision handoff

`src/content-factory/foundation-expert-review.ts` retains the durable qualified-human package/submission contract.

The submission template uses a neutral `<pass-or-fail_hold>` placeholder. It does not invent reviewer identity, qualifications, evidence or a decision. The exact `jobId`, `candidateId`, reviewed implementation commit and Foundation fingerprint cannot be changed by the human submission.

## Historical AQA evidence

The previously retained AQA package and its review remain historical evidence of the earlier implementation state.

The successful historical package was produced before the source-led completeness boundary existed. Its packaging integrity remains historically true, but it cannot be reused to approve the corrected Foundation.

The next qualified-human review must use a fresh Foundation Candidate/fingerprint produced after the PR #318 correction and a new bundle containing the explicit source-led reconciliation.

Historical proof and review records must not be rewritten to imply the new boundary existed at that time.

## Fresh proof and review sequence

The next AQA 7132 / 2027 sequence is:

1. compile a fresh Foundation Candidate on approved `main` using the source-led curriculum and exam guards;
2. retain its exact source proof, Candidate and Foundation fingerprint;
3. run deterministic assurance against that exact retained proof;
4. run fresh-context independent review against the same exact fingerprint;
5. remediate blocking/material findings only through the guarded remediation path and rerun affected assurance;
6. assemble a schema-v2 expert bundle containing `coverage-reconciliation.json` and the exact Foundation artifacts; and
7. obtain a new qualified-human subject/assessment decision.

Only a later passing human submission can support Approved Course Foundation v1.

## Deliberately excluded

This work does not:

- perform or simulate qualified human review;
- invent reviewer credentials;
- approve the historical failing Foundation;
- create Approved Course Foundation v1;
- generate Learn, Practice or Exam Prep assets; or
- rewrite historical proof evidence.

## Documentation impact

PR #318 approved the normative Foundation completeness change through the requirement-led coverage amendment and ADR-0023.

The current portable reconciliation hardening is implementation of that approved decision. It updates current technical documentation and tests but does not require a new product or governance decision.
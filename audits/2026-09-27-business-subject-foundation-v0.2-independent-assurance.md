# Business Subject Knowledge Foundation v0.2 — Independent Assurance

**Date:** 27 September 2026  
**Candidate reviewed:** `research/business-subject-foundation/v0.2-post-board-candidate/`  
**Reviewed main commit:** `615d9c103de9e1042502d9066e544a3936e459b6`  
**Authority status of candidate:** research evidence only  
**Assurance decision:** **FAIL / HOLD for promotion**

## Purpose

Independently challenge the merged `v0.2-post-board-candidate` before any decision to promote it into a governed Business Subject Knowledge Foundation.

This audit does not modify the sealed `v0.1-pre-board-challenge` research baseline, does not promote the candidate into normative authority, and does not change learner-facing content or runtime behaviour.

## Governing controls applied

This assurance applies the current approved controls in:

- `AUTHORITY_HIERARCHY.md`;
- `KNOWLEDGE_ARCHITECTURE.md`;
- `70-ai-operating-system/AI Agent Constitution.md`;
- `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`;
- `80-company-workflows/Content Factory Foundation and Asset Production Model.md`;
- `80-company-workflows/Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`;
- `80-company-workflows/Content Accuracy Assurance Gate.md`; and
- `docs/technical/Content Factory Subject Foundation Trial.md`.

The decisive promotion rule is that reusable subject truth must remain source-traceable and rights-safe, with awarding-body material kept in structured board/specification alignment rather than becoming the provenance basis for reusable subject truth.

## Scope and method

The review challenged:

- subject breadth and Level 3 / A-level boundary;
- representative high-risk quantitative methods and financial reasoning;
- model/framework treatment and limitations;
- current-board breadth after the Phase 1 seal;
- source/provenance classification;
- separation of reusable subject truth from board alignment; and
- whether the candidate can safely be promoted under current source-rights rules.

Fresh external checks were used as challenge evidence rather than as authority promotion. Representative references included:

- AQA A-level Business 7132 current/outgoing specification and quantitative-skills annex;
- AQA A-level Business 7138 new specification/overview for first teaching September 2026;
- Cambridge OCR A Level Business H436 from 2026;
- Pearson Edexcel A Level Business (2015) specification;
- ACCA investment-appraisal technical material; and
- HM Treasury `The Green Book 2026` for appraisal/discounting concepts.

## Findings

### IA-001 — MATERIAL — reusable subject nodes rely on `REFERENCE_ONLY` sources

The candidate source register deliberately and correctly classifies many professional-body sources as `REFERENCE_ONLY`, including ACCA, ICAEW, CIPD, CIM, CMI and CIPS material.

However, multiple reusable subject nodes use those sources as their only or primary node provenance. Examples observed during the independent review include:

- `BUS-MKT-001` — sources `SRC-CIM-MARKETING`, `SRC-CIM-7PS`;
- `BUS-MKT-002` — source `SRC-CIM-MARKETING`;
- `BUS-MKT-003` — sources `SRC-CIM-MARKETING`, `SRC-CIPD-RECRUITMENT`;
- `BUS-FIN-002` — source `SRC-ACCA-INVESTMENT`;
- `BUS-FIN-003` — source `SRC-ACCA-RATIOS`;
- `BUS-FIN-008` — sources `SRC-ICAEW-FINANCE-GUIDE`, `SRC-BOE-INFLATION`;
- `BUS-FIN-011` — source `SRC-ACCA-RATIOS`;
- `BUS-FIN-013` — sources `SRC-ACCA-RATIOS`, `SRC-ACCA-WORKING-CAPITAL`.

This is acceptable for **research and factual challenge**, because no substantial protected prose is being treated as reusable text. It is not yet sufficient for **promotion into reusable governed subject truth** under the current provenance standard, which requires the reusable curriculum/subject-truth basis to be supported by permitted source classes and explicit source-use evidence.

**Resolution required:** produce node/facet-level promotion provenance that identifies an approved `OPEN`, `REVISION_OWNED` or appropriately `LICENSED` basis (or another deliberately approved reusable policy basis) for the reusable subject truth. `REFERENCE_ONLY` material may remain corroborating/fact-checking evidence but must not be the sole promotion basis.

### IA-002 — MATERIAL — awarding-body alignment sources leak into reusable node provenance

The candidate correctly classifies board sources as `REFERENCE_ONLY_BOARD_ALIGNMENT`, but some post-board candidate nodes include those source IDs directly in their reusable node `sources` arrays.

Examples observed:

- `BUS-FIN-009` includes Pearson Edexcel, Eduqas and CCEA specification source IDs alongside subject evidence;
- `BUS-FIN-012` includes the CCEA specification source ID.

This weakens the required boundary between reusable subject truth and course/board alignment. The board material may explain **why a facet or depth was challenged/added**, but it should remain in the post-seal delta/specification-mapping evidence rather than become the source basis for the reusable educational truth itself.

**Resolution required:** separate `subject_truth_sources` from `board_challenge_or_mapping_sources`, or deliberately equivalent metadata, and remove board specifications from the reusable subject-truth provenance set.

### IA-003 — MATERIAL — source-clearance records are not yet promotion-ready

The normalization register is transparent about incomplete metadata, which is good research practice. However, promotion requires stronger retained source-use evidence than several current classifications provide.

Examples include classifications such as `OPEN_PUBLIC_SECTOR_WITH_NOTICE_CHECK` and metadata stating that exact item dates/versions were not captured. The active source-rights gate requires an explicit permission/licence basis, restrictions, AI-context permission, derived-commercial-use permission, date checked and checker/method provenance for sources materially supporting the production truth.

**Resolution required:** for every source that will support promoted subject truth, resolve the reusable rights status to a promotion-ready record rather than leaving a future notice/licence check implicit.

### IA-004 — NO BLOCKING EDUCATIONAL ERROR FOUND IN SAMPLED HIGH-RISK QUANTITATIVE CONTENT

Fresh checks did not identify a blocking factual error in the sampled quantitative treatment.

In particular:

- the candidate distinguishes revenue, contribution, profit and cash;
- break-even treatment is appropriately conditional on model assumptions;
- payback, ARR and NPV are correctly distinguished as different appraisal methods;
- NPV is presented as assumption-dependent rather than guaranteed value;
- liquidity ratios are treated as contextual indicators rather than universal thresholds;
- current AQA 7132 quantitative requirements support the candidate's inclusion of ratios, percentages, index numbers, break-even, investment appraisal and elasticity interpretation;
- AQA 7132 marketing content confirms correlation, confidence-interval interpretation and extrapolation as relevant evidence skills.

Exact formula conventions that differ by qualification, such as ARR or gearing denominators, are appropriately identified as course-mapping concerns rather than universal subject truth.

**Status:** no remediation required from this sample, but full promotion assurance must still cover the complete promoted dependency set.

### IA-005 — NO MAJOR DOMAIN GAP FOUND IN THE FRESH BREADTH CHALLENGE

Fresh current-board checks support the candidate's broad domain architecture rather than exposing a new missing major Business domain.

The new AQA 7138 and Cambridge OCR H436 materials continue to emphasise the same broad whole-business areas represented by the candidate: business activity, marketing/customers, people, operations, finance, external influences, strategy, risk/change and modern cross-cutting themes. AQA 7138 also explicitly highlights CRM, productivity beyond manufacturing, customer experience, supply-chain transparency, equality/diversity/belonging/inclusion, talent development, employee wellbeing, ESG and disruptive technologies including AI; these correspond to the post-seal depth extensions already recorded by the candidate.

**Status:** no new major-domain blocker identified by this assurance pass.

## Gate decision

**FAIL / HOLD for promotion.**

The research candidate is educationally substantial and remains useful evidence. The HOLD is not a finding that the Business research should be discarded or rebuilt from scratch.

Promotion is blocked because the current node-level provenance does not yet satisfy the governed separation between:

1. reusable, rights-safe subject truth; and
2. reference-only professional/awarding-body evidence used for challenge, corroboration or exact-course mapping.

The Content Accuracy Assurance Gate requires a HOLD when source rights/provenance are unresolved. A governance promotion decision should therefore not be requested until IA-001 to IA-003 are closed and the affected assurance is rerun.

## Targeted remediation contract

Remediation should preserve the current educational corpus unless evidence shows an actual subject defect. Do not regenerate unrelated nodes merely to satisfy a new bookkeeping shape.

Required work:

1. create a deterministic node/facet-to-source provenance matrix for all 81 candidate nodes;
2. identify nodes/facets whose promotion basis is currently only `REFERENCE_ONLY` or board material;
3. add or map sufficient promotion-permitted subject evidence for those nodes/facets;
4. keep professional-body `REFERENCE_ONLY` sources as corroboration where useful rather than deleting valid research evidence;
5. move awarding-body source IDs out of reusable subject-truth provenance and retain them in post-seal delta/specification-mapping evidence;
6. resolve item-specific rights/licence/reuse records for sources actually supporting promoted truth, including version/date and checker/method provenance;
7. add deterministic checks that fail if a promoted subject node has no permitted subject-truth provenance or if board-alignment sources are used as its reusable truth basis;
8. rerun affected factual/provenance assurance and fresh independent review; and
9. issue a new promotion decision against the exact remediated candidate fingerprint.

## Revalidation / stop conditions

Do not promote the candidate if any of the following remain true:

- a material node/facet has no promotion-permitted subject-truth source basis;
- a board specification is being treated as the reusable truth source for a subject node;
- a required source-rights decision remains `UNKNOWN`, conditional on an unperformed notice check, or otherwise unresolved;
- remediation changes educational meaning without fresh factual assurance; or
- a fresh review exposes a new blocking/material factual or completeness issue.

## Documentation impact

This audit is historical assurance evidence only. It does not change normative Content Factory authority, the sealed research baseline, product behaviour, Course Truth, Exam Truth, learner assets or runtime implementation.

If remediation later changes the unsealed candidate, retain this HOLD as historical evidence and add a new remediation/revalidation record. If a future Founder decision promotes a remediated Subject Knowledge Foundation, update the appropriate normative/technical records in that separate governed promotion change.

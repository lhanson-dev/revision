# Business Subject Knowledge Baseline — Completion and Acceptance Audit

**Status:** RESEARCH EVIDENCE PACKAGE COMPLETE FOR REVIEW — not approved Revision authority  
**Candidate:** `v0.2-post-board-candidate`  
**Branch:** `research/business-subject-foundation-v0-1`  
**Phase 1 seal:** `2026-09-27T14:00:28+01:00`  
**Phase 1 seal commit:** `83772e12b1ab3d8f42a1ac437995e59c091ba317`

## Purpose

This audit checks the recovered Business subject-baseline work against the original independent-research brief. It does not promote the findings into approved Revision authority and does not retrospectively alter the sealed Phase 1 baseline.

The immutable Phase 1 baseline remains `v0.1-pre-board-challenge`. The unsealed `v0.2-post-board-candidate` is a machine-readable strengthened candidate created after the cross-board breadth challenge.

## Independence and sequencing gates

**PASS — Phase 1 independence.** The seal manifest records that Phase 1 was completed without inspecting Revision's existing Business Course Truth / CKM, Learn, Practice, Exam Prep, Content Factory outputs, prior Business remediation/assurance, existing Revision Business taxonomy/IDs, or awarding-body Business specifications as the organising framework.

**PASS — board timing.** No awarding-body Business source is part of the sealed Phase 1 baseline. Board sources were introduced only after the 2026-09-27T14:00:28+01:00 seal.

**PASS — immutability.** The sealed baseline has not been rewritten. Post-seal discoveries are recorded in `DELTA_REGISTER.json`, `POST_SEAL_BOARD_CHALLENGE.md`, and the unsealed candidate/delta integration map.

## Required deliverables

| # | Required deliverable | Result | Evidence / location |
|---|---|---|---|
| 1 | Executive scope / boundary | PASS | Sealed Phase 1 research report, frozen by `v0.1-pre-board-challenge/SEAL_MANIFEST.md`; Level 3 boundary and eight-domain scope retained in candidate. |
| 2 | Hierarchical subject map | PASS | Eight subject domains plus separately classified named-model facets in the seal manifest; candidate file/domain structure under `v0.2-post-board-candidate/nodes/`. |
| 3 | Atomic knowledge / facet register | PASS | Nine machine-readable node files under `nodes/`; 81 candidate nodes with stable IDs. |
| 4 | Dependency / relationship graph | PASS | `SPECIALIST_REGISTERS.json` → `relationship_dependency_graph`. |
| 5 | Quantitative methods register | PASS | `SPECIALIST_REGISTERS.json` → 20-method `quantitative_methods_register`. |
| 6 | Models / frameworks register | PASS | `SPECIALIST_REGISTERS.json` → 15-entry `models_frameworks_register`, explicitly distinguishing fundamental understanding, useful teaching frameworks and qualification conventions. |
| 7 | Misconception / boundary register | PASS | `SPECIALIST_REGISTERS.json` → 20-entry `misconception_boundary_register`. |
| 8 | Real-world transfer / application map | PASS | `SPECIALIST_REGISTERS.json` → `real_world_transfer_map`, covering all eight major subject areas. |
| 9 | Source / provenance / rights register | PASS | `SOURCE_REGISTER.json` plus `SOURCE_REGISTER_NORMALIZATION.json`, `SOURCE_REGISTER_EVIDENCE_SUPPLEMENT.json`, and `SOURCE_REGISTER_MODELS_SUPPLEMENT.json`. The base 38 sources are schema-normalised; seven evidence-domain and five named-model sources use the richer schema natively. |
| 10 | Three-pass completeness evidence | PASS | `v0.1-pre-board-challenge/SEAL_MANIFEST.md` records Pass 1 initial universe, Pass 2 deliberate gap hunt, and Pass 3 saturation challenge. |
| 11 | Advanced / out-of-scope register | PASS — frozen source | Recorded as part of the sealed Phase 1 research report and explicitly listed in the seal manifest. It is not reconstructed post-seal because doing so from memory would risk changing sealed evidence. |
| 12 | Residual uncertainty register | PASS — frozen source | Sealed report plus explicit residual uncertainties in `SEAL_MANIFEST.md`; node-level uncertainties are also retained in the v0.2 corpus. |
| 13 | Sealed `v0.1-pre-board-challenge` baseline | PASS | `SEAL_MANIFEST.md`, `NODE_INDEX.json`; exact seal 2026-09-27T14:00:28+01:00. |
| 14 | Post-seal cross-board breadth challenge | PASS | `POST_SEAL_BOARD_CHALLENGE.md`; AQA, OCR, Pearson Edexcel, Eduqas, WJEC and CCEA examined after seal. |
| 15 | Explicit delta classifications | PASS | `DELTA_REGISTER.json` has 14 classified findings; `v0.2-post-board-candidate/DELTA_INTEGRATION_MAP.json` records candidate treatment of every delta. |
| 16 | Machine-readable stable-ID representation | PASS | `v0.2-post-board-candidate/NODE_INDEX.json` plus nine JSON node corpus files; 81 candidate IDs. |

## Candidate structural assurance

The post-board candidate contains:

- Business Foundations: 9 nodes;
- Marketing: 9 nodes;
- Operations: 9 nodes;
- Finance: 14 nodes;
- People and Organisation: 11 nodes;
- Strategy: 9 nodes;
- External and Global Business: 7 nodes;
- Evidence, Decision-making and Integration: 8 nodes; and
- named model/framework facets: 5 nodes.

Total: **81 nodes**.

The sealed Phase 1 total remains **80 nodes**. The only new post-seal node is `BUS-EVI-008` — Network analysis and Critical Path Analysis — created for delta `D-002`. Existing sealed IDs are retained; board-driven depth extensions strengthen candidate content without changing the identity of the sealed nodes.

## Board-challenge conclusion

The cross-board breadth challenge did **not** expose a missing major Business domain. It supported the independent architecture and mainly identified bounded depth/facet extensions.

Two findings qualify as genuine reusable subject additions:

1. **Network analysis / Critical Path Analysis** — `GENUINE_SUBJECT_FOUNDATION_GAP`; now represented by new candidate node `BUS-EVI-008`.
2. **Protectionism / trade-policy mechanics** — the genuine-gap component of mixed delta `D-008`; now explicitly represented within `BUS-EXT-003`, alongside strengthened FDI and market-entry depth. Named international strategy frameworks remain course-specific.

All other findings are recorded as depth extensions, existing-foundation-sufficient, or course-specific scope/terminology as appropriate. See `DELTA_INTEGRATION_MAP.json`.

## Quality-treatment checks

**PASS — fact/model distinction.** Named motivation, management, strategy and change frameworks are separately classified and carry assumptions/limitations rather than being presented as universal truths.

**PASS — quantitative methods as decision tools.** The quantitative register records method, units, interpretation, decision use, assumptions, limitations and common mistakes; the node corpus connects calculations to decisions rather than stopping at arithmetic.

**PASS — cross-functional reasoning.** The relationship graph and `BUS-EVI-006`/`BUS-EVI-007` make functional interdependence, causal chains, trade-offs and whole-business judgement explicit.

**PASS — evidence-quality treatment.** Correlation/causation, sampling uncertainty, confidence intervals, forecasting uncertainty, sensitivity and qualitative/quantitative evidence are represented at bounded Level 3 depth.

**PASS — rights separation.** Board specifications are post-seal alignment evidence only. Candidate learner truth is independently expressed; reference-only sources are not treated as prose substrates.

## Residual assurance boundary

This is a research-content acceptance audit, not an approval of the Business Subject Knowledge Foundation. No claim is made that every qualification-specific formula convention, notation, named framework or exam demonstration requirement is universal subject truth. Those remain for exact Course Truth / Exam Truth mapping.

The candidate is now suitable for the next governed step: independent assurance and Founder decision on whether to promote it into the approved Subject Knowledge Foundation process.

## Final confirmations required by the brief

- **Phase 1 was completed without existing Revision Business content:** confirmed by the sealed independence statement.
- **Phase 1 did not use exam specifications as the organising framework:** confirmed.
- **Exact seal point:** `2026-09-27T14:00:28+01:00` (Europe/London), commit `83772e12b1ab3d8f42a1ac437995e59c091ba317`.
- **Board sources introduced only after seal:** confirmed.
- **Genuine subject gaps exposed by board challenge:** Critical Path Analysis/network analysis; protectionism/trade-policy mechanics as the genuine-gap component of D-008.
- **Research conclusions remain evidence, not approved Revision authority:** confirmed.

## Documentation-impact check

This branch records research evidence only. It does not change product behaviour, company policy, approved educational authority, architecture or production implementation. Therefore no normative authority or technical implementation documentation is changed in this research package.

If the Founder later approves promotion of this candidate, the promotion must occur through the governed Subject Knowledge Foundation / Content Factory process and update the applicable normative records in the same governed branch/PR. Historical sealed research evidence must remain unchanged.

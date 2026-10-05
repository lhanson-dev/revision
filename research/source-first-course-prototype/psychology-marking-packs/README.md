# Psychology Step 5 — Marking Packs and Evidence Mappings

**Status:** experimental Step 5 candidate complete  
**Course:** AQA A-level Psychology 7182  
**Route:** Source-First Course Prototype Experimental Exception

## Purpose

This workspace completes Step 5 of the authorised source-first Psychology pilot. It turns the Step 4 learner-asset candidate into a governed marking/evidence layer without modifying the learner runtime or pretending that an unassured automated marker exists.

The derivation uses completed rights-safe Psychology Course Truth, completed Psychology Exam Truth, the deterministic Course Learning Blueprint, and the merged Step 4 learner-asset projection.

Course Truth remains the academic source. Exam Truth contributes structured assessment facts only. Official AQA material remains `REFERENCE_ONLY` and is not a reusable question, rubric or mark-scheme corpus.

## What Step 5 adds

`derive-psychology-marking-packs.ts` produces four governed outputs:

1. **Practice evidence mappings** — every Practice activity is reduced to the single claim that its own mode can legitimately support. The Step 4 aggregate unit-level evidence scope is preserved as source metadata but is not promoted as the activity's evidence claim.
2. **Practice Marking Packs** — activities that are sufficiently specified for reproducible scoring receive Revision-owned criteria, AO/skill allocation where applicable, diagnostic feedback and confidence/abstention rules.
3. **Topic Exam Prep Marking Packs** — every topic question receives a concrete scored variant where the Step 4 shell lacked alternatives, a scenario, a study context or fixed data.
4. **Full-paper scored overlays** — the three representative Step 4 paper simulations receive deterministic question-level AO allocations, Marking Packs and evidence links while preserving the current 96-mark / 120-minute structures and valid Paper 3 option paths.

The Step 4 learner assets are deliberately not rewritten. Step 5 is a downstream evidence/marking overlay so the historical candidate remains inspectable and upstream changes can invalidate/regenerate the derived layer cleanly.

## Explicit Step 4 evidence corrections

Step 5 does not accept several Step 4 placeholders as scored evidence merely because they exist.

- A Practice activity no longer inherits every evidence claim available to its whole Blueprint unit. Retrieval supports `knowledge_recall`; it does not also support application or evaluation merely because the same requirement has other activity modes.
- `classification_matching_ordering`, `calculation_quantitative_drill`, `interpretation_data_graph_source` and `mixed_topic_retrieval` remain **non-scoreable base Practice candidates** until a concrete ordering set, fixed dataset/display or exact second-topic/node variant is materialised.
- Topic MCQ, scenario, Research Methods and data/maths shells are materialised inside the Marking Pack as Revision-owned scored variants rather than treating missing alternatives/context/data as already present.
- Full-paper scoring uses the exact scored overlay, not looser command metadata carried by the Step 4 shell.

This is an evidence-integrity correction, not a change to Course Truth or the Blueprint's educational intent.

## Marking Pack contract

Every item represented as scored contains, as applicable:

- the exact Revision-owned scored prompt/context and maximum mark;
- Course Truth requirement and Blueprint-unit mappings;
- question family or Practice mode;
- lower-level criteria whose marks reconcile exactly to the item maximum;
- AO allocation whose marks reconcile exactly;
- non-exhaustive indicative content from rights-safe Course Truth;
- valid reasoning routes and known misconceptions/invalid reasoning;
- diagnostic feedback and improvement direction;
- explicit precise-mark, borderline-range and abstention rules;
- provenance, rights boundary and calibration state.

No fake calibration anchors are created. Every pack is `uncalibrated_step_5_candidate` with an empty anchor set and an explicit requirement for independent calibration/assurance.

## Whole-paper deterministic calibration

The scored overlay is a Revision-owned practice construction, not a claim that AQA will use this exact future question mix.

| Paper | AO1 | AO2 | AO3 | RM marks | Maths marks |
| --- | ---: | ---: | ---: | ---: | ---: |
| 7182/1 | 36 | 24 | 36 | 24 | 0 |
| 7182/2 | 21 | 54 | 21 | 48 | 32 |
| 7182/3 | 32 | 16 | 48 | 0 | 0 |
| **Qualification** | **89** | **94** | **105** | **72** | **32** |

Across 288 raw marks this is AO1 30.90%, AO2 32.64%, AO3 36.46%, Research Methods 25.00%, and mathematical skills 11.11%.

Deterministic assurance checks these totals against current Exam Truth ranges, verifies the dedicated 48-mark Paper 2 Research Methods section, and checks all 27 valid Paper 3 option paths independently.

## Evidence boundary

Step 5 does **not** enable production evidence ingestion. All mappings remain `runtimeEvidenceEligible=false` and `readinessEvidenceEligible=false`.

Marking Packs are content contracts, not a production implementation of FI-007 Assisted Exam Answer Marking. No precise mark, mastery state, readiness claim or predicted grade may be emitted from this experimental layer until later assurance/runtime gates authorise it.

## Rights and provenance

- AQA remains `REFERENCE_ONLY`.
- No official AQA question, learner prose or mark-scheme wording is copied into reusable output.
- Scored variants, contexts, data and rubrics are Revision-owned.
- Course Truth supplies reusable subject truth only from approved rights-safe sources.
- Exam Truth supplies structured paper/AO/Research Methods/maths constraints only.

## Completion boundary

`experimental_step_5_marking_evidence_complete` means the source-first pilot has a deterministic, inspectable marking/evidence contract sufficient to enter Step 6 assurance.

It does **not** mean independent educational/assessment assurance has passed, the packs are calibrated against human-marked anchors, a production automated marker is authorised or implemented, scored learner evidence is enabled in the canonical runtime, or the corpus is approved for restricted student publication.

The next governed step is **Step 6: production-level deterministic plus fresh independent educational/assessment assurance**, including marking-pack challenge and calibration review before runtime integration.

## Documentation impact

- Experimental research evidence and deterministic derivation/assurance code only.
- No normative authority change.
- No production technical-documentation change.
- No canonical learner-runtime change.
- No FI-007 production implementation change.
- Historical Course Truth, Exam Truth, Blueprint and Step 4 evidence are not rewritten.
- Paid AI/provider generation spend for this Step 5 implementation: **£0**.
- Paid source/licence spend: **£0**.

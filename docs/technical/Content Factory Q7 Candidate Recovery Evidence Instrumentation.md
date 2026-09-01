# Content Factory Q7 Candidate Recovery Evidence Instrumentation

## Status

Post-Pilot #20 Q7 is now **PASS**, pending only the separate governed evidence-classification PR reaching `main`.

Attempt 005 proved the live production recovery boundary was behaving strongly, but its schema-v2 evidence instrument could not distinguish targeted repair from fresh candidate resampling. That historical run remains unchanged and is not used as the decisive Q7 PASS record.

Attempt 006 used the corrected candidate-aware trace and completed successfully on approved `main`.

## Attempt 005 — instrumentation-limited historical evidence

Approved main:

`fffb92d9c1b1666f516b5597058276e58f0dfb31`

Workflow:

`33549488154` / run #20

Artifact:

- ID `9817051688`;
- digest `sha256:72666062b1f14b8d5605eda8e9d3f48541e3000315d75eab261f8256e0d89f64`;
- durable raw copy `content-factory/reliability-v2-e-q7-live-soak-evidence-005.json`;
- review record `content-factory/reliability-post-pilot20-q7-attempt-005-review.json`.

Observed provider outcome:

- 20/20 governed samples executed and accepted;
- all five governed subject shapes covered;
- 10 Assessment Item and 10 Marking Pack samples;
- zero controlled fail-closed samples;
- zero infrastructure incidents;
- zero engineering-boundary breaches;
- known provider spend US$0.394502 against the US$5 ceiling;
- no full-course assembly or learner publication.

The raw evidence used the historical approximation `repairCount = providerCallCount - 1`. Under ADR-0019 that is no longer sufficient because an extra provider call can represent either targeted repair or a fresh candidate resample. Attempt 005 therefore remained Q7 `pending` despite the strong provider outcome.

## Candidate-aware instrumentation

The Q7 workflow retains the production worker path with provider retries disabled and adds a non-mutating provider-request trace. It records only the recovery metadata needed for qualification:

- Q7 job identity;
- provider request schema/worker name;
- whether each call is initial generation, targeted repair or fresh candidate resample.

The trace does not change provider requests and does not store API credentials or full provider payloads.

The candidate-aware normalizer reconciles the raw live-soak artifact with that trace and emits schema-v3 evidence containing:

- accurate per-sample `repairCount`;
- per-sample `freshCandidateResampleCount`;
- provider-call kind sequence;
- total targeted repairs;
- total fresh candidate resamples;
- instrumentation-completeness evidence.

The normalizer fails closed if call counts cannot be reconciled or if a sequence exceeds the governed two-candidate / one-repair-per-candidate topology.

## Attempt 006 — candidate-aware Q7 PASS evidence

Approved main:

`e74e04613c8d9fa8d7eba617bb839ef368d26029`

Workflow:

`33554413877` / run #21

Artifact:

- ID `9818944889`;
- digest `sha256:43be3553cf21db5892efbfab888c0211f7a02944408a631d228d06fd8955a30b`;
- durable classified evidence `content-factory/reliability-v2-e-q7-live-soak-evidence-006.json`.

Observed:

- 20/20 governed samples executed;
- 20/20 accepted;
- Assessment Item 10/10 accepted;
- Marking Pack 10/10 accepted;
- all five governed subject shapes covered;
- 31 provider calls in total;
- **10 targeted repairs** accurately identified;
- **1 fresh candidate resample** accurately identified;
- provider-call classification complete for all 20 samples;
- zero controlled fail-closed samples;
- zero infrastructure incidents;
- zero engineering-boundary breaches;
- known provider spend **US$0.404658** against the US$5 ceiling;
- no full-course assembly;
- no learner publication.

The science Assessment Item sample `science-assessment_item_generation-2` exercised the recovery topology that attempt 005 could not measure correctly:

`initial generation -> targeted repair -> fresh candidate resample -> accepted`

The schema-v3 trace records that truthfully as one targeted repair and one fresh candidate resample. No engineering intervention was required.

## Q7 classification

Attempt 006 reported:

- `automaticQ7PassCandidate: true`;
- `requiresEngineeringVsEducationalClassification: false`;
- complete provider-call classification;
- no new generic engineering/provider-contract class.

Classification:

`q7_pass_no_new_generic_engineering_contract_class`

**Q7 PASS.**

Q1-Q6 remain PASS. The overall machine state deliberately remains `paused`, `qualifiedEvidence` remains null and `livePilotEligible` remains false until the separate V2-F/Q8 eligibility transition is exact-head assured, Founder-approved and merged.

## Cost position

Attempt 005 used US$0.394502 and attempt 006 used US$0.404658. Including the earlier four Q7 soaks, cumulative known Q7 spend is US$2.496296.

Attempt 006 used 8.09316% of the governed US$5 per-soak ceiling. The current evidence does not justify increasing that ceiling.

## Documentation impact

No normative authority or ADR change is required. Reliability Standard v2.0 and ADR-0019 already govern the recovery topology and evidence requirements. This document records the production-confirmed candidate-aware evidence result, while preserving attempt 005 and all earlier Q7 evidence as historical records.

# Content Factory Q7 Candidate Recovery Evidence Instrumentation

## Status

Post-Pilot #20 Q7 remains **pending**.

The first post-Pilot #20 bounded live-worker soak (`q7-live-worker-soak-005`) completed successfully on approved `main`, but its schema-v2 evidence instrument predates ADR-0019 candidate recovery. The run is therefore retained as useful live evidence but is not sufficient to declare Q7 PASS.

## Attempt 005

Approved main:

`fffb92d9c1b1666f516b5597058276e58f0dfb31`

Workflow:

`33549488154` / run #20

Artifact:

- ID `9817051688`;
- digest `sha256:72666062b1f14b8d5605eda8e9d3f48541e3000315d75eab261f8256e0d89f64`;
- durable raw copy `content-factory/reliability-v2-e-q7-live-soak-evidence-005.json`.

Observed provider outcome:

- 20/20 governed samples executed;
- 20/20 accepted;
- all five governed subject shapes covered;
- 10 Assessment Item and 10 Marking Pack samples;
- zero controlled fail-closed samples;
- zero infrastructure incidents;
- zero engineering-boundary breaches;
- known provider spend US$0.394502 against the US$5 ceiling;
- no full-course assembly;
- no learner publication.

## Why this is not yet Q7 PASS

Reliability Standard v2.0 requires a repair count for every live sample.

The historical Q7 harness calculated:

`repairCount = providerCallCount - 1`

That was a reasonable measurement before candidate resampling existed, because provider retries were disabled and an additional provider call represented the one bounded repair path.

ADR-0019 changed that topology. A provider call after the first generation may now be either:

1. a targeted repair of the current candidate; or
2. a fresh candidate resample after the previous candidate is rejected.

Attempt 005 contained a live science Assessment sample with four provider calls. The production worker permits at most two candidates and one repair per candidate, so the bounded sequence is:

`candidate 1 generation -> targeted repair -> fresh candidate 2 generation -> targeted repair -> accepted`

The raw schema-v2 artifact records this as `repairCount: 3`. That value is not semantically accurate: the correct interpretation is two targeted repairs and one fresh candidate resample.

The production recovery boundary behaved as governed. The defect is in qualification evidence instrumentation, not in the Content Factory runtime.

## Candidate-aware instrumentation

Future Q7 runs retain the existing production worker path and provider retries remain disabled.

The Q7 workflow now adds a non-mutating provider-request trace. It records only bounded recovery metadata needed for qualification:

- Q7 job identity;
- provider request schema/worker name;
- whether the call is initial generation, targeted repair or fresh candidate resample.

The trace deliberately does not change provider requests and does not store the API key or full provider payload.

After the live harness writes its existing raw artifact, a candidate-aware normalizer combines the raw sample evidence with the trace and emits schema-v3 Q7 evidence containing:

- accurate per-sample `repairCount`;
- per-sample `freshCandidateResampleCount`;
- provider-call kind sequence;
- total targeted repairs;
- total fresh candidate resamples;
- candidate-recovery sample IDs;
- an explicit instrumentation-completeness result.

The normalizer fails closed if call counts cannot be reconciled or if a call sequence exceeds the governed recovery topology.

## Recovery sequence assurance

With provider retries disabled, the accepted call sequences are bounded to the production policy:

- initial generation;
- initial generation -> targeted repair;
- initial generation -> fresh candidate resample;
- initial generation -> targeted repair -> fresh candidate resample;
- initial generation -> fresh candidate resample -> targeted repair;
- initial generation -> targeted repair -> fresh candidate resample -> targeted repair.

This matches the maximum two-candidate / one-repair-per-candidate rule.

## Qualification boundary

This instrumentation correction does not:

- make another provider call;
- modify Assessment Item or Marking Pack generation/recovery behavior;
- change Q1-Q6 status;
- change Q7 from `pending`;
- change overall qualification from `paused`;
- enable a full-course run;
- enable learner publication;
- permit Q8.

After this instrumentation is merged and production-confirmed, a fresh governed Q7 request must be created and Founder-approved before another paid soak runs. Only a correctly instrumented live result may be classified as post-Pilot #20 Q7 PASS.

## Documentation impact

No normative authority or ADR changes are required. The Reliability Standard and ADR-0019 already require the distinction between targeted repair and fresh candidate recovery. This document records the corrected implementation of that evidence requirement while preserving attempt 005 unchanged as historical live evidence.

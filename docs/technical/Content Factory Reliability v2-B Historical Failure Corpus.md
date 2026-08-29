# Content Factory Reliability v2-B Historical Failure Corpus

**Status:** implemented on governed branch; exact-head CI required before any Q2 qualification claim  
**Work item:** V2-B — historical failure replay corpus  
**Base approved `main`:** `a74ee15ddc0d958b05d12b3cb8e16b8f29dec346`  
**Authority:** `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2  
**Sequence:** `docs/technical/Content Factory Reliability Qualification Harness.md`

## Purpose

V2-B turns the durable failure history from Content Factory Pilots #1–#18 into a permanent, provider-free regression corpus without rewriting the historical pilot records or pretending that every failed workflow represented the same kind of engineering defect.

The governing Q2 question is narrower than “did the pilot fail?” It is:

> For every known reusable generated-output / provider-contract defect class, does the current production boundary have a permanent replay proving the intended deterministic compile, validation, bounded repair or fail-closed outcome?

The machine-readable corpus is:

`content-factory/reliability-v2-b-historical-failure-corpus.json`

Its structural enforcement is:

`src/content-factory/reliability-v2-b-historical-failure-corpus.test.ts`

## Evidence model

Reliability v2 permits two historical replay evidence kinds:

1. **exact historical output** — the raw historical provider output is durably retained and replayed unchanged;
2. **synthetic reproduction** — the raw failed provider output is unavailable, so the smallest generic reproduction of the durable defect class is encoded and labelled synthetic.

This V2-B corpus deliberately makes **zero exact-historical-output claims** for failed provider candidates. The repository has durable workflow runs, issue/job records, exact failure messages, independent-review findings and remediation PRs, but this work does not promote any of those into a claim that the raw failed model candidate itself is retained unchanged as a replay fixture.

Every current Q2 class is therefore labelled `synthetic_reproduction` and bound to its durable historical evidence. If a raw historical candidate is later located and lawfully retained, the evidence kind may only be promoted together with a real fixture path and unchanged replay assurance.

## Pilot classification

The corpus contains all eighteen historical pilot numbers exactly once, with their workflow-run IDs and exact historical head SHAs.

### Excluded from Q2

- **Pilot #1** — initial live-pilot configuration/secret setup and harness timeout: operational, not a generated-output contract class.
- **Pilot #2** — Vitest's 5-second default timeout terminated the live integration test before durable output evidence: harness failure, not a generated-output contract class.
- **Pilot #6** — the pipeline reached independent educational review and correctly returned `fail_hold`: educational assurance evidence, not a provider-contract failure.

These pilots remain in the corpus so the history is complete, but their exclusion reasons are machine-enforced.

### Mixed pilots

- **Pilot #7** — Q2 replays the Blueprint-scoped Learn/Practice provider-contract defect; cross-workflow durability, checkpointing and cumulative spend remain restart/operations concerns.
- **Pilot #9** — Q2 replays learning/coverage and assessment-integrity classes; resume lifecycle/state handling remains a restart concern.
- **Pilot #16** — Q2 replays reusable generated-output integrity classes; course-specific educational judgements from independent review remain educational evidence rather than being reclassified as provider-contract failures.

### Contract/integrity replay pilots

Pilots #3, #4, #5, #7–#18 (except #6) contribute one or more reusable Q2 classes. Pilot #15 intentionally points back to the same `practice_exact_evidence_locator` class first seen in Pilot #10, proving recurrence without inflating the number of distinct classes.

## Permanent defect classes

The current corpus records nineteen reusable classes:

| Class | First pilot | Current expected outcome |
| --- | ---: | --- |
| Question Family provider object envelope | 3 | provider schema prevents the old array-root failure |
| Assessment Item governed target ownership | 4 | deterministic compilation |
| Independent review scope identity | 5 | deterministic scope compilation |
| Blueprint-scoped Learn/Practice provider contract | 7 | provider schema prevents unselected modes |
| Learning Blueprint Practice-output/mode consistency | 8 | deterministic compilation |
| Learning/coverage reference integrity | 9 | truthful deterministic rejection |
| Assessment command/mark/coverage integrity | 9 | truthful deterministic rejection |
| Practice exact-evidence locator | 10 | deterministic validation; recurrence in Pilot #15 |
| Assessment command-demand contract | 11 | deterministic compilation |
| Assessment response-demand contract | 12 | deterministic compilation |
| Marking Pack AO aggregate consistency | 13 | deterministic compilation |
| Assessment response-type consistency | 14 | deterministic compilation/normalization |
| Learner-facing private marking metadata | 16 | truthful deterministic rejection |
| Content Assertion evidence substance | 16 | truthful deterministic rejection |
| Marking Pack integral subquestion AO | 16 | truthful deterministic rejection |
| Calculation marking operationality | 16 | complete diagnostics + at most one bounded repair + revalidation |
| Applied compare/explain demand | 16 | truthful deterministic rejection |
| Assessment Item compiled max mark | 17 | deterministic compilation from subquestions |
| Marking Pack complete-diagnostic repair | 18 | complete diagnostics + at most one bounded repair + whole-artifact revalidation |

## Replay binding

V2-B does not duplicate the remediation tests merely to give them a new filename. Each defect class points to the production-boundary regression test(s) introduced or strengthened by the relevant remediation work.

The V2-B enforcement test proves that:

- every class referenced by a pilot exists;
- every class is referenced by at least one pilot;
- every class has durable historical sources;
- every class has an allowed evidence kind and expected current disposition;
- every synthetic class records how the historical defect is reproduced;
- every replay target is an existing executable `.test.ts` file;
- every non-contract or mixed historical incident has an explicit exclusion reason;
- Pilots #1–#18 are present exactly once with 40-character historical head SHAs and unique workflow runs;
- any future `exact_historical_output` claim must name an actual retained fixture path;
- Q2 and overall Reliability v2 remain false until same-head assurance is complete.

Because the referenced regression files run in normal Revision CI, the permanent corpus and the production-boundary tests are assured together on the exact V2-B head.

## Important historical distinctions

### Pilot #3

The provider rejected the Question Family structured-output contract before a valid domain candidate existed because the schema root was an array. The synthetic replay therefore tests the provider-facing object envelope rather than inventing a model output that never passed the provider schema boundary.

### Pilot #5

The reusable engineering defect is the model-invented independent-review `workUnitId` (`assessment-set`). The underlying educational assessment-format finding is deliberately not converted into a provider-contract failure.

### Pilot #13

The durable failure record contains the Marking Pack AO mismatch (`ao2` expected 8, actual 7). The replay reproduces the inconsistent arithmetic generically and proves aggregate AO ownership is deterministic.

### Pilot #14

The durable failure record contains the response-type mismatch (`exam_long_answer` expected, `extended_response` returned). The replay uses the current Assessment Item normalization/repair boundary rather than preserving the obsolete provider-owned contract.

### Pilot #17

The durable evidence records top-level `maxMark: 30` while subquestions summed to 29. Current production code removes top-level max mark from provider discretion and compiles it from the subquestion marks.

### Pilot #18

The historical defect was serial diagnosis: one repair-eligible Marking Pack defect was surfaced, repaired, and only then did another defect become visible. V2-A now replays a single parseable candidate with multiple simultaneous defects, collects the complete diagnostic set, permits at most one targeted repair, and revalidates the whole artifact.

## Qualification state

This work **does not** mark Q2 PASS merely by creating the corpus.

The machine-readable record remains:

- `status: implemented_pending_same_head_assurance`;
- `q2Passed: false`;
- `overallReliabilityV2Passed: false`.

The V2-B branch must pass normal exact-head Revision CI and review. The later V2-D full provider-free qualification is responsible for assembling Q1–Q6 on one exact implementation head. V2-B therefore supplies the permanent historical replay asset without prematurely claiming the whole qualification sequence is complete.

## Documentation impact

No normative authority change is required. V2-B implements the already-approved Reliability v2 method in `80-company-workflows/Content Factory Reliability Qualification Standard.md` and the approved sequence in the Reliability Qualification Harness.

This change:

- adds the machine-readable V2-B historical replay corpus;
- adds machine-enforced corpus invariants;
- adds this focused technical implementation record;
- preserves all original workflow runs, durable Issues, independent-review findings and remediation PRs unchanged;
- does not rewrite historical evidence to reflect current fixes;
- does not change learner-facing product behaviour;
- does not enable another paid full-course pilot;
- does not claim Q2 PASS or overall Reliability v2 PASS.

No ADR is required because V2-B implements an existing approved reliability architecture rather than choosing a new architecture.

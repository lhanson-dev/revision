# Content Factory Reliability v2-E Live Worker Soak

## Status

**Runner implemented; live execution pending merge to approved `main`.**

V2-D established provider-free Q1–Q6 PASS. V2-E implements the distinct Q7 live-provider sampling path required by `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0.

This change does **not** claim Q7 PASS, does not change global qualification to `qualified`, and does not enable a full-course Content Factory run.

## Canonical runtime and entry point

Q7 uses the trusted manual GitHub Actions workflow:

- `.github/workflows/content-factory-live-worker-soak.yml`

The workflow runs only when the checked-out ref is approved `main` and executes:

- `src/content-factory/live-worker-soak.integration.test.ts`

It is deliberately separate from `.github/workflows/content-factory-live-pilot.yml`. The full-course workflow keeps its existing fail-closed qualification preflight and remains unavailable while `content-factory/reliability-qualification.json` is `paused`.

## Q7 preflight

Before any provider call, the workflow verifies:

- Q1 compiler/worker ownership inventory = PASS;
- Q2 historical failure replay corpus = PASS;
- Q3 adversarial provider-free subject matrix = PASS;
- Q4 deterministic full-pipeline simulation = PASS;
- Q5 restart/reuse/dependency invalidation = PASS;
- Q6 repeated provider-free stability = PASS;
- Q7 status is still `pending`;
- global qualification remains `paused`;
- `qualifiedEvidence` remains `null`; and
- `livePilotEligible` remains `false`.

A mismatch stops the soak before the live integration case.

## Sample design

The governed minimum is 20 live worker outputs across all five subject shapes. The V2-E plan uses exactly 20 independent samples:

| Subject shape | Assessment Item | Marking Pack | Total |
| --- | ---: | ---: | ---: |
| quantitative / business / economics | 2 | 2 | 4 |
| mathematics | 2 | 2 | 4 |
| science | 2 | 2 | 4 |
| essay / humanities | 2 | 2 | 4 |
| language / prescribed text | 2 | 2 | 4 |
| **Total** | **10** | **10** | **20** |

These are the two highest-risk generative boundaries in the current reliability history. Q1 does not identify another provider boundary with a higher live-soak requirement than Assessment Item and Marking Pack generation.

Marking Pack samples use deterministic rights-safe synthetic assessment inputs rather than depending on the preceding live Assessment Item sample. That prevents one Assessment Item rejection from silently reducing Marking Pack sample coverage.

## Production boundary

The soak calls the same exported production worker factory used by the live Content Factory:

- `createOpenAIModelAssistedWorkers().generateAssessmentItem`
- `createOpenAIModelAssistedWorkers().generateMarkingPack`

This retains the current production layers, including:

- provider structured-output schema enforcement;
- assessment optional-unit normalisation;
- governed Assessment Item target-field injection;
- structured assessment integrity validation;
- one targeted Assessment Item repair where permitted;
- Reliability v2 complete Marking Pack diagnostics;
- one complete-diagnostic Marking Pack repair where permitted;
- compiler-owned subquestion marks, aggregate AO arithmetic and numeric rubric bands;
- whole-artifact revalidation; and
- the shared provider-spend guard.

Provider transport retries are deliberately set to zero for the soak. This isolates model-contract variability from infrastructure retry behaviour and means a second provider call within one sample is attributable to the production targeted-repair path.

## Rights-safe synthetic inputs

Every sample uses invented subject-shape facts and `Synthetic Reliability Board` identity. The harness does not provide awarding-body source prose, past-paper wording, prescribed-text excerpts or a real learner course.

The five shapes exercise materially different demands:

- quantitative/business/economics — contextual calculation;
- mathematics — calculation;
- science — analysis;
- essay/humanities — evaluation;
- language/prescribed text — analysis using invented micro-text concepts only.

These inputs are process evidence, not educational benchmark evidence.

## Spend control

The workflow sets:

- `CONTENT_FACTORY_MAX_SPEND_USD=5`

The production shared budget wrapper reserves conservative spend before every provider request. The integration harness additionally refuses any configured ceiling above US$5.

Per-sample evidence records provider/model, contract version, worker result, provider-call count, inferred targeted-repair count, provider retry count and observed usage cost where provider usage metadata is available.

The first completed soak must trigger the cost-strategy review required by `60-business-operations/Content Factory Bootstrap Cost Strategy.md`.

## Evidence and classification

The workflow uploads:

- `.artifacts/content-factory-live-worker-soak/q7-live-worker-soak-<main-sha>.json`

The evidence contains all 20 sample records plus aggregate shape, worker, repair and cost data.

Results are classified conservatively:

- `accepted` — production worker returned success;
- `controlled_fail_closed` — production boundary safely rejected the provider output;
- `infrastructure_incident` — provider/network/runtime incident;
- `engineering_boundary_breach` — unexpected exception escaped the governed worker boundary.

A controlled fail-closed sample does not automatically mean Q7 fails. The Reliability Standard requires a classification decision: a genuine educational defect that was correctly rejected is different from a new reusable engineering contract class.

For that reason, the workflow is automatically green only when all 20 samples are accepted. Any controlled fail-closed sample preserves and uploads evidence, then requires review before Q7 can be declared PASS. An infrastructure incident or escaped boundary exception also prevents a PASS claim.

## Follow-up after live execution

If the soak is green with no new generic contract class:

1. inspect the exact-main evidence artifact;
2. create a governed evidence PR that records Q7 PASS and binds it to the live-soak workflow run/head;
3. keep `status: paused` and `livePilotEligible: false` in that Q7 evidence PR; and
4. only then open the separate V2-F / Q8 eligibility transition.

If the soak exposes a new generic contract class, return to the affected Q1–Q6 gates before another soak. Do not run a full-course confirmation pilot.

## Documentation impact

No normative authority changes in this runner PR. The implementation follows the existing Reliability Qualification Standard v2.0 and Bootstrap Cost Strategy.

The change adds the Q7 implementation/evidence path and updates the canonical technical qualification harness. `INDEX.md` does not require a new entry because the existing Content Factory Reliability Qualification Harness remains the indexed technical source.

Historical Pilot #1–#18 records and V2-A–V2-D evidence remain unchanged.

## Deliberate exclusions

This runner does not:

- assemble a complete course;
- publish learner content;
- use a real awarding-body content source as model input;
- claim educational correctness or benchmark approval;
- mark Q7 PASS before a live run exists;
- change `status` to `qualified`;
- enable Pilot #19; or
- combine Q7 evidence recording with the separate Q8 eligibility transition.

# Content Factory Reliability v2-E Live Worker Soak

## Status

**Runner merged on approved `main`; live execution pending.**

V2-D established provider-free Q1–Q6 PASS. V2-E implements the distinct Q7 live-provider sampling path required by `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0.

The runner merged to approved `main` in PR #240 at `ba9d5e5fee0ae33bfac22f393f50faad4e8cb4f7`. GitHub registered the workflow in the Actions UI but did not expose the expected manual `Run workflow` control. PR #241 added a narrowly scoped governed request-file push fallback and merged at `ef2b72bf83d31b66c15bee5480e33c21acfa580b`.

The first fallback trigger created workflow run `33264051185`, but GitHub rejected the workflow definition before scheduling any job. The cause was invalid YAML for the two inline Node checks: they used `run: node <<'NODE'` as a plain scalar instead of a multiline `run: |` block. The run contained zero jobs, therefore made zero provider calls and incurred zero provider spend. Q7 was not executed and remains pending. The corrective implementation uses multiline run blocks and retains the same governed Q7 request and safety envelope.

This work does **not** claim Q7 PASS, does not change global qualification to `qualified`, and does not enable a full-course Content Factory run.

## Canonical runtime and entry point

Q7 uses the trusted GitHub Actions workflow:

- `.github/workflows/content-factory-live-worker-soak.yml`

The workflow runs only on approved `main` and executes:

- `src/content-factory/live-worker-soak.integration.test.ts`

Supported trigger modes are:

- manual `workflow_dispatch`; and
- a push to approved `main` that changes the dedicated governed request path `content-factory/reliability-v2-e-live-worker-soak-request.json` within the workflow's path filter.

The request-file fallback exists because the GitHub Actions UI did not expose the manual control while the initial workflow definition was invalid. It does not create a broad push trigger: unrelated repository changes do not start a soak.

The workflow remains deliberately separate from `.github/workflows/content-factory-live-pilot.yml`. The full-course workflow keeps its existing fail-closed qualification preflight and remains unavailable while `content-factory/reliability-qualification.json` is `paused`.

## Governed request-file fallback

For a push-triggered soak, the workflow validates the request file before any provider call. It must declare:

- gate `Q7`;
- run class `bounded_live_worker_soak`;
- status `requested`;
- maximum spend exactly US$5;
- `fullCourseAssembly: false`; and
- `learnerPublication: false`.

Any mismatch fails before the live integration case. Because the push trigger is path-scoped to this file, normal merges and unrelated `main` pushes cannot start a paid soak.

The governed request remains `content-factory/reliability-v2-e-live-worker-soak-request.json`. The corrective PR changes only non-semantic whitespace in that file so that the same approved request is retriggered after the workflow-definition fix without changing its sample, spend or publication constraints.

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

The first completed soak must trigger the cost-strategy review required by `60-business-operations/Content Factory Bootstrap Cost Strategy.md`. Workflow-definition failures before job creation do not count as a completed soak and incur no provider spend.

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

No normative authority changes are required. The implementation follows the existing Reliability Qualification Standard v2.0 and Bootstrap Cost Strategy.

The workflow-definition correction changes only the technical execution mechanism required to initiate the already-approved Q7 exercise. It does not change the normative qualification method, spend ceiling, sample requirements or full-course eligibility. Historical Pilot #1–#18 records and V2-A–V2-D evidence remain unchanged. `INDEX.md` does not require a new entry because the existing Content Factory Reliability Qualification Harness remains the indexed technical source.

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

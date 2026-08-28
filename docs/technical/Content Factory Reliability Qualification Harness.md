# Content Factory Reliability Qualification Harness

## Status

Course-agnostic Content Factory reliability qualification is active. Paid end-to-end live pilots remain paused by `content-factory/reliability-qualification.json`.

The governing rule is `80-company-workflows/Content Factory Reliability Qualification Standard.md`. This document records implementation and qualification evidence; it does not replace that authority.

Approved `main` reviewed for this Q5 increment is `93b6bd9c2bb29d4c2150710eef79becc76525d69`, which includes Q1 reconciliation, the completed Q2 provider-free contract matrix, the merged Q3 subject-shape matrix and the merged Q4 deterministic full-pipeline simulation.

Current gate position on this branch:

- **Q1 — PASS:** worker-contract ownership is inventoried and the two previously identified generic blockers are retained as resolved evidence.
- **Q2 — PASS:** material provider boundaries have provider-free contract evidence with no open Q2 gap.
- **Q3 — PASS:** all five governed subject/course shapes use the same controlled contract-integration pipeline to `expert_review_ready`.
- **Q4 — PASS:** one complete provider-free course build traverses the governed pipeline, receives material independent-review findings, performs targeted remediation, persists a corrected head, revalidates, independently re-reviews and packages only for expert review.
- **Q5 — PASS on this branch:** durable restart uses exact-input plus transitive worker-contract dependency fingerprints, reuses unchanged completed executions across compatible heads, invalidates only genuine downstream dependants, preserves cumulative spend/retry provenance and replays the current pipeline rather than trusting stale late-stage state.
- **Q6 — not yet complete.**
- **Overall qualification — paused.**
- **Paid confirmation pilot — not eligible.**

Q1–Q5 PASS do not authorize another paid pilot. Only after Q1–Q6 pass may a separate governed, Founder-approved qualification PR change the overall machine-readable status to `qualified` and `livePilotEligible: true`.

## Why the calibration method changed

Pilot #15 ran from approved `main` commit `7df79c28ae0f72610cbb28f9c01f366f85aa2c0d` as workflow run `33149356421` and durable Issue `#209`.

It stopped from `mapped` with:

`Practice work unit marketing-research evidence for data interpretation is not an exact excerpt from the generated learner content`

Pilot #10 had already moved Learn and Practice exact evidence to bounded locators resolved deterministically by Revision. Reappearance of the failure class demonstrated that repeated whole-course paid pilots were lower-value evidence than systematic provider-free qualification.

Historical Pilot #10–#15 evidence remains unchanged.

## Live-pilot boundary

Approved `main` contains a fail-closed preflight before any paid live-pilot model call:

`workflow_dispatch → checkout/install → reliability qualification preflight → only if qualified: paid live pilot`

There is no workflow input or environment-variable bypass. `content-factory/reliability-qualification.json` deliberately remains:

- `status: paused`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

Q5 changes restart semantics behind that gate; it does not weaken or bypass the gate.

## Q1 — worker-contract inventory

`content-factory/reliability-contract-inventory.json` inventories the generic material boundaries for Course Knowledge Model, Learning Blueprint, Learn generation, Practice generation, Assessment Blueprint, Question Family generation, assessment-item generation, Marking Pack generation, deterministic validation, independent review, remediation and expert-review package assembly.

Every mechanically checked representation is classified under the governed ownership vocabulary: generative judgement, deterministic derivation, bounded locator/reference, targeted repair eligible, or fail closed.

The inventory records `status: complete` and `q1Pass: true`. Current blockers are empty. The two previously identified blocker IDs remain retained as `resolvedBlockers` so reconciliation is auditable rather than erased.

### Q1-PRACTICE-EVIDENCE-PATH — resolved

The Practice evidence contract remains a bounded locator/reference contract. The provider identifies a supported Practice mode, one-based activity index and allowed evidence field; Revision resolves the exact generated string.

The downstream defect was representation handling: validation searched a JSON-serialized representation, so quotes and line breaks could differ from the already-resolved learner-content string. Validation now recursively inspects actual generated string leaves.

Provider-free evidence in `src/content-factory/q2-practice-evidence-contract.test.ts` covers supported Practice modes and fields, invalid locations, paraphrase rejection and quoted/multiline exact evidence.

### Q1-MARKING-PACK-DUPLICATE-AO-ARITHMETIC — resolved

Structured Marking Packs no longer ask the provider to author aggregate AO arithmetic that Revision can derive from validated subquestion allocations.

Educational AO judgement remains at subquestion level; Revision derives the structured aggregate; provider-authored duplicate structured aggregate arithmetic fails closed.

Provider-free evidence is in `src/content-factory/q2-marking-pack-ao-contract.test.ts` and `src/content-factory/openai-assessment-integrity-compiler.ts`.

## Q2 — provider-free contract matrix

The Q2 machine-readable record is `content-factory/reliability-q2-contract-matrix.json` and records `q2Pass: true` with `paidPilotEligible: false`.

All Q1 material boundaries are represented. Evidence covers valid first-pass behaviour, malformed output, invalid or duplicate references, bounded locators, exact-evidence handling, totals/cross-references, demand mismatch and targeted repair where applicable.

Direct or deterministic Q2 evidence covers Course Knowledge Model, Learning Blueprint, Learn and Practice, Assessment Blueprint, Question Family, assessment-item integrity and bounded repair, structured Marking Pack AO derivation, independent-review binding, targeted remediation, deterministic validation and expert-review package assembly.

Valid provider outputs are proven not to require an unnecessary extra provider call. Mechanically invalid output fails closed at the earliest knowable boundary.

## Q3 — subject-shape matrix

The Q3 machine-readable record is `content-factory/reliability-q3-subject-shape-matrix.json`.

The executable fixture harness is `src/content-factory/q3-subject-shape-fixtures.ts`, with regression evidence in `src/content-factory/q3-subject-shape-matrix.test.ts`.

Every Q3 fixture uses the same production contract-integration orchestration entry point, `runRequestedContentFactoryToExpertReviewReady`, from `src/content-factory/end-to-end-proof.ts`.

Only the synthetic course shape and controlled worker outputs vary. Orchestration, schemas, artifact stores, source-rights checks, learning/assessment factories, deterministic validation, independent review and expert-review packaging remain shared.

The five governed shapes are:

1. **quantitative / business / economics** — formula-driven requirement, quantitative Practice and numeric assessment context;
2. **mathematics** — formula-driven learning and context-free calculation;
3. **science** — formula plus conceptual requirements, mixed course/component learning scope and experimental-observation context across compulsory components;
4. **essay / humanities** — non-quantitative argument, retrieval/application Practice and synthetic source context;
5. **language / prescribed-text** — non-quantitative text analysis, flashcard/application Practice, a synthetic extract and a Question Family reused across components.

For every shape the tests prove the shared contract-integration path reaches `expert_review_ready`, controlled provider executions have zero spend/retries, no fixture needs human intervention, fixture-specific learning modes are exercised through the shared Learning/Practice contracts, generated markable items receive Marking Pack coverage, and expert-review packaging remains bound to the fixture commit.

The Q3 fixtures contain invented educational content. They are process-compatibility evidence only, not factual, pedagogical or assessment-quality approval. Q3 also does not claim live-adapter proof.

## Q4 — deterministic full-pipeline simulation

The Q4 machine-readable record is `content-factory/reliability-q4-deterministic-pipeline-simulation.json`.

The executable simulation harness is `src/content-factory/q4-deterministic-pipeline-fixture.ts`, with regression evidence in `src/content-factory/q4-deterministic-pipeline-simulation.test.ts`.

Q4 deliberately uses controlled/stored responses and the same `runRequestedContentFactoryToExpertReviewReady` production contract-integration entry point. No external model or source-provider call is made.

The simulation records this state trace:

`requested → identified → sourced → mapped → generating → validating → independent_review → remediation → validating → independent_review → expert_review_packaging → expert_review_ready`

The first generated course pack receives deterministic PASS evidence tied to the initial synthetic head before independent review. Independent review deliberately raises one Learn finding and one assessment-item finding. The Learn repair is bounded to that artifact; the assessment-item repair rebuilds its genuinely dependent Marking Pack. Unaffected Practice and Question Family artifacts remain unchanged.

The corrected content is persisted as one new synthetic head, deterministically revalidated and independently re-reviewed in a fresh context. Expert-review packaging is bound to the corrected validation and independent-review evidence.

The latest manifest remains `publicationStatus: factory_generated_unassured`; no learner-publication transition occurs. Q4 proves provider-free orchestration/remediation behaviour, not educational correctness or live external adapter behaviour.

## Q5 — restart, reuse and dependency-aware invalidation

The Q5 machine-readable record is `content-factory/reliability-q5-restart-reuse-invalidation.json` and records `q5Pass: true` with `providerCallsUsed: false` and `paidPilotEligible: false`.

The dependency model is implemented in `src/content-factory/durable-worker-dependencies.ts`. The durable semantic cache and changed-head replay controls are in `src/content-factory/q5-durable-resume.ts`. Provider-free regression evidence is in `src/content-factory/q5-dependency-aware-resume.test.ts`.

### Semantic cache identity

The original durable implementation safely keyed worker reuse by:

`method + exact input fingerprint + entire content-head SHA`

and rejected a changed-head spend-ledger resume. That made any implementation-head change a universal semantic invalidation event.

Q5 changes new worker-cache records to:

`method + exact input fingerprint + transitive worker-contract dependency fingerprint`

The original execution head remains provenance but is not the semantic cache key. The dependency fingerprint recursively includes the worker's current contract version and all upstream worker-contract versions on which its output genuinely depends.

### Q5-HEAD-ONLY-REUSE — PASS

A second process on a different Git head, with identical worker inputs and unchanged dependency contracts, reuses every completed semantic worker execution and makes zero new controlled-provider executions.

This proves Git implementation-head identity is no longer a universal invalidation key once semantic dependency evidence exists.

### Q5-PRACTICE-BOUNDARY — PASS

The test simulates a Practice compiler contract-version change. Exactly these semantic executions invalidate:

- `generatePracticeCollateral`;
- `independentReview`;
- `remediate`.

Course Knowledge Model, Learn and the independent assessment-generation branch remain reusable.

### Q5-ASSESSMENT-BOUNDARY — PASS

The test simulates an Assessment Blueprint compiler contract-version change. Assessment Blueprint, Question Family, assessment-item, Marking Pack and assurance dependants invalidate. Learn and Practice remain reusable.

### Q5-COVERAGE-PROPAGATION — PASS

The test simulates a Coverage contract-version change. Coverage, Course Knowledge Model, Learning Blueprint, Learn, Practice, assessment generation and assurance dependants invalidate. Identity, source discovery, structured evidence and Board Alignment remain reusable because their contracts do not depend on Coverage.

Exact input fingerprints provide the complementary runtime rule: if source or structured evidence values themselves change, any worker receiving changed input naturally misses the cache even when its contract version is unchanged.

### Q5-PROVENANCE-AND-SPEND — PASS

Cross-head reuse returns the original worker execution record, preserving retry count, provider/model metadata and observed usage cost. Reuse itself does not add another provider spend event.

The course spend ledger remains cumulative across workflow attempts and head changes. The ledger retains the creation head as provenance while changed-head safety is handled by semantic pipeline replay rather than by resetting or duplicating spend.

### Q5-SEMANTIC-REPLAY — PASS

A changed-head resume does not trust an old `generating`, `validating`, `expert_review_ready` or other late-stage position as current. The original governed request identity is reconstructed at `requested` and the current pipeline executes from there. Unchanged provider work is supplied only through the semantic cache.

This ensures current deterministic validation, source-rights checks and orchestration execute under the current approved implementation.

### Legacy checkpoint compatibility

Existing schema-v1 cache entries contain no dependency fingerprint and are therefore not inferred safe across a head change. They remain same-head-only. A successful same-head v1 reuse is migrated to a schema-v2 semantic record; a first cross-head resume from v1-only evidence may regenerate work.

That limitation is deliberate fail-closed behaviour, not a Q5 gap.

### Live workflow position

The manual live-pilot workflow is wired to the dependency-aware resume path, including changed-head semantic replay, cumulative spend and cross-head reuse counts in evidence. However the reliability preflight still runs before any external model call and overall qualification remains paused. Q5 does not execute or authorize a paid pilot.

## Q6 — repeated qualification stability

Q6 remains required.

A single green deterministic run is insufficient. Final evidence must record repeated Q3 subject-shape and Q4 pipeline passes on the same implementation head, including repetition count, fixtures, worker coverage, restart/reuse scenarios and known limitations.

Q6 must also include the Q5 restart/reuse scenarios in the repeated qualification suite so the dependency-aware invalidation model is demonstrated as stable rather than merely passing once.

## Overall qualification and paid confirmation

`content-factory/reliability-qualification.json` deliberately remains unchanged.

After Q6 also passes, a separate governed qualification PR may set the overall status to `qualified` and `livePilotEligible: true`. That PR requires exact-head assurance and explicit Founder approval before another paid end-to-end course run is permitted.

The next paid run will be a confirmation pilot, not the primary debugging mechanism.

## Documentation impact

This Q5 increment changes current durable-resume implementation behaviour and records provider-free dependency-aware qualification evidence. Updated together:

- `src/content-factory/durable-worker-dependencies.ts`;
- `src/content-factory/q5-durable-resume.ts`;
- `src/content-factory/q5-dependency-aware-resume.test.ts`;
- `src/content-factory/live-pilot.integration.test.ts`;
- `.github/workflows/content-factory-live-pilot.yml`;
- `content-factory/reliability-q5-restart-reuse-invalidation.json`;
- `docs/technical/Content Factory Durable Resume and Spend.md`;
- this technical qualification record.

No change is required to the active Reliability Qualification Standard because it already defines the Q5 dependency-aware invalidation requirement. No `INDEX.md` change is required because the indexed qualification-harness source of truth remains this document. Historical Pilot #10–#15 evidence remains unchanged. Overall reliability status and paid-pilot eligibility remain deliberately paused.
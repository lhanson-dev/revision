# Content Factory v2 Increment 7 Implementation

**Status:** Implementation evidence for PR #177  
**Initiative:** Issue #169 — Content Factory v2  
**Canonical runtime:** `/app/` remains unchanged; this increment is content-production-plane assurance only.

## Purpose

Increment 7 proves that the Content Factory v2 domain and orchestration contracts compose end to end across materially different qualification/course structures instead of working only as isolated stage tests.

The executable proof path is:

`requested → identity/source rights → Board Alignment/coverage/Course Knowledge Model → Learning Blueprint → Learn/Practice → Assessment Blueprint → Question Families → Revision-owned assessment items → Marking Packs → deterministic assurance → fresh-context independent review → expert package → expert_review_ready`

No learner content is published by this proof and no qualified-human benchmark decision is simulated as a publication approval.

## Proof model

`src/content-factory/end-to-end-proof.ts` composes the production domain functions already implemented by prior v2 increments. It does not introduce an alternative state machine or a second factory implementation.

The runner can:

- start from a new schema-v2 course request;
- continue from a durable intermediate job state;
- stop truthfully on an existing blocker rather than guessing;
- reuse completed stage evidence through the existing idempotent stage contracts;
- reach `expert_review_ready` when all automated gates pass;
- emit a machine-readable proof report for the completed job.

The proof report records:

- course/component structural shape;
- course-level versus component-level learning-work-unit shape;
- Question Family and markable assessment counts;
- whether a Question Family was reused across components;
- Marking Pack coverage;
- worker stages, provider/model provenance and retries;
- observed worker usage cost where supplied;
- worker runs with no supplied cost;
- expected human-intervention reasons already represented by durable blockers;
- exact reviewed commit and expert-package reference;
- limitations on what the evidence proves.

## Materially different structural cases

The CI proof uses fictional `.example` sources and controlled workers. It imports no real awarding-body content.

### 1. Single-component quantitative course

Proves:

- one compulsory assessment component;
- formula-backed knowledge;
- quantitative Learn/Practice mode;
- Revision-owned calculation assessment context;
- calculation-aware deterministic assurance;
- exact Marking Pack coverage;
- complete route to `expert_review_ready`.

### 2. Two compulsory papers with shared content

Proves:

- shared course-level Learn/Practice across two assessment components;
- one reusable Question Family legitimately spanning both papers;
- separate Revision-owned question instantiation for each component;
- separate question-specific Marking Packs;
- complete route to `expert_review_ready`.

### 3. Compulsory core plus optional pathways

Proves:

- a compulsory core plus optional components;
- shared course-level core learning;
- genuinely component-specific learning for distinct options;
- mixed course/component work-unit scope;
- distinct component assessment families and Marking Packs;
- complete route to `expert_review_ready`.

The aggregate scale-proof summary requires at least three distinct structural signatures before structural proof can pass.

## Restart and idempotency evidence

The automated proof also checks two enterprise invariants:

1. a job persisted after Learn/Practice can resume through assessment, assurance and expert packaging without regenerating the already successful Learn/Practice artifacts;
2. re-entering an already packaged `expert_review_ready` job creates no new worker runs, artifacts or expert package.

These checks use the same durable job/artifact contracts as the production domain code.

## Provider replacement and cost observability

Controlled proof workers use different provider/model provenance labels across cases while the domain contracts remain unchanged. This proves that provider routing is not embedded in the educational/domain state contract.

The proof also aggregates `usageCost`, retry count and unpriced worker runs from durable `workerRuns`.

This proves the **observability mechanism**, not real provider pricing. Actual production cost evidence requires a live provider adapter supplying real usage/cost data.

Stage duration is not yet part of the durable `WorkerRun` schema, so elapsed stage/total build-time measurement remains an explicit operational-hardening gap.

## Evidence boundary — contract integration versus live adapters

The proof schema distinguishes:

- `contract_integration` — controlled workers exercise the real orchestration/domain contracts;
- `live_adapter` — a real external source/model-provider execution path has been exercised.

PR #177 records the three structural cases as `contract_integration` evidence. Therefore a passing structural proof **must not be presented as proof that live external model/source adapters are production-ready**.

This distinction is deliberate. Current v2 code provides provider-neutral worker boundaries, but a concrete production source/model execution adapter has not yet been proven end to end on an admissible real course.

## What Increment 7 proves

If exact-head CI passes, the repository has automated evidence that:

- prior v2 stage implementations compose from request to `expert_review_ready`;
- the domain is not hard-coded to a single-paper course shape;
- shared course content and component-specific assessment can coexist;
- Question Family reuse can create separate component items safely;
- optional-component learning can remain genuinely component-specific;
- Marking Pack coverage survives the complete composed flow;
- restart/idempotency work across stage boundaries;
- provider/model provenance can vary without changing domain contracts;
- cost/retry/human-intervention evidence can be summarised from durable job state.

## What Increment 7 does not prove

This increment does not prove:

- live web/source discovery reliability;
- a concrete external AI provider adapter, model quality, latency or actual cost;
- educational correctness of a real course;
- source-rights admissibility of any new real awarding-body material;
- real qualified-expert review quality or reviewer qualification;
- learner publication;
- batch intake, parallel-course concurrency or spend ceilings;
- durable stage-duration telemetry;
- a production-grade external expert delivery/storage workflow beyond the portable package/import contract.

## Assurance impact

This is high-value internal educational-production assurance but does not alter learner UI, learner data, authentication, RLS or publication behaviour.

Required evidence for the PR is:

- typecheck and lint;
- focused unit/integration proof for all three structures;
- restart/idempotency checks;
- production build;
- the repository's normal exact-head CI and protected-service assurance.

The existing full browser suite may run through repository CI, but Increment 7 adds no new browser journey.

## Documentation impact

Increment 7 adds this implementation record and aligns stale Content Factory status/tracker wording with the production state reached through PR #176. Historical v0.1 and earlier increment records remain unchanged.

No new product or educational normative rule is introduced by the proof harness. The existing v2 authority already requires cross-course-shape proof before scale hardening.

## Next operational gap

A positive contract-integration shape proof is necessary but not sufficient for enterprise maturity. Before treating the Content Factory as operationally proven for unattended course builds, Revision still needs a concrete rights-safe source/model/artifact execution path exercised on an admissible real pilot course, with real provider usage/cost provenance and the existing qualified-expert gate.

Batch/concurrency/spend hardening should follow evidence from that live execution rather than hiding an unproven adapter boundary behind scale controls.

# Content Factory Foundation-Native Repeat Learning Remediation and Re-Assurance

**Status:** Current implementation contract for second-and-later targeted Learn/Practice remediation cycles  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`  
**Related implementation:** `docs/technical/Content Factory Foundation-Native Targeted Learning Remediation Proof.md`; `src/content-factory/foundation-internal-learning-remediation.ts`

## Purpose

Define the retained proof path used when a genuinely fresh re-assurance of a corrected Foundation-native Learn/Practice bundle still finds asset-local defects.

The governing behaviour is unchanged: blocking/material findings are corrected at the smallest safe scope and the affected corrected bundle is deterministically checked and independently reviewed again from a fresh context. Historical evidence is retained rather than rewritten. A learner-asset defect does not reopen Course Truth unless the evidence shows the Foundation itself is wrong or incomplete.

Neither repeat remediation nor repeat re-assurance can approve the Foundation or publish learner content.

## First corrected-bundle re-assurance evidence

The first corrected AQA A-level Business 7132 — 2027 bundle was re-assured from the approved-main implementation introduced by PR #380:

- re-assurance workflow run `36058013508`;
- re-assurance artifact `10833004381`;
- implementation/main head `9282d1a3b134150962d3b76f531f271f17d8e509`;
- artifact digest `sha256:353cbb14fd05f64f65d6c6f3b9ad39ab481765ab98916adce494aa2ab7091c0b`;
- Foundation fingerprint `1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`;
- corrected bundle fingerprint `8452d1ef17ef56f626b2711c536083c9fce138015f90f0dde85885db15780cb9`.

The proof was valid and fail-closed rather than technically broken:

- deterministic assurance: `pass`;
- semantic decision: `fail_hold`;
- work units freshly reviewed: `49`;
- fresh reviewer contexts: `49`;
- reviewer-context collisions: `0`;
- final-response review usage reported: `$1.424332` across 49 review runs;
- Learn assurance: `pending`;
- Practice assurance: `pending`;
- qualified-human Foundation review: `pending`;
- Foundation approval: `not_approved`;
- learner publication eligible: `false`.

The fresh semantic review found 12 open asset-local findings: 8 material and 4 minor. They affect 12 work units. The retained remediation target graph is:

- `both`: 2 work units;
- `learn`: 2 work units;
- `practice`: 8 work units.

Therefore the next smallest-safe remediation changes 4 Learn sides and 10 Practice sides, 14 asset sides in total. Untargeted asset sides must remain byte-for-byte structurally unchanged through the targeted remediation runtime.

The findings concern learner-asset accuracy, pedagogy, quantitative consistency or practice coverage. The retained evidence does not identify missing or incorrect Course Truth, so the Foundation is not reopened by this cycle. If later evidence does identify a credible Foundation defect, the asset cycle must stop and the Foundation Candidate/version must be reopened under the governing production model.

## Repeat-remediation trigger and lineage

`.github/workflows/content-factory-foundation-internal-learning-repeat-remediation-proof.yml` provides the second-and-later retained remediation adapter.

The issue-comment trigger is Founder-owned issue `#289` with marker:

```text
revision-run-foundation-internal-learning-remediation-proof:v2
```

The trigger accepts only:

- exact source re-assurance run ID;
- exact source re-assurance artifact ID;
- exact source re-assurance approved-main head;
- exact Foundation fingerprint; and
- exact corrected-bundle fingerprint reviewed by that re-assurance.

Before any provider call the workflow verifies that the source re-assurance:

- is the exact completed re-assurance workflow on `main` at the supplied head;
- intentionally concluded GitHub `failure` because its semantic result is `fail_hold` or `conditional_pass`;
- has an unexpired digest-bound artifact at the exact run/head;
- has deterministic assurance `pass`;
- contains open remediation targets;
- has zero reviewer-context collisions;
- leaves Learn and Practice `pending` with zero assured assets;
- leaves the Foundation unapproved and learner publication false; and
- binds the supplied corrected-bundle fingerprint.

The adapter then derives the immediate parent remediation identity from the re-assurance evidence, independently verifies the parent remediation run/artifact/digest/head and exact corrected bundle, and derives the Foundation Live Proof and AI-Assured Proof identities from that retained parent evidence. Source and AI proofs are independently revalidated before remediation executes.

## Smallest-safe repeat remediation

The repeat adapter reuses `remediateFoundationInternalLearningAssets`; it does not introduce a second remediation engine.

The runtime receives:

- the exact previously corrected bundle;
- the exact latest independent review;
- every and only latest open remediation target;
- the exact Foundation Coverage Model and Course Knowledge Model; and
- the existing Foundation-native OpenAI remediation workers.

The existing engine preserves exact Foundation/Candidate identity, deterministic Course Learning Blueprint v2 plan equality, reviewed asset-side targeting and pending derived-asset state after any change.

The repeat adapter additionally preserves cumulative reviewer independence. The first remediation record already retains the original 49 Learn/Practice reviewer contexts. The first corrected-bundle re-assurance adds another 49 reviewer contexts. For remediation cycle 2 the adapter therefore carries forward 98 prior reviewer contexts and explicitly rejects any new remediation provider context that collides with that historical reviewer set. Candidate/Foundation contexts and all earlier generation/remediation contexts remain forbidden by the existing remediation engine.

The resulting remediation record stores the cumulative prior-reviewer set so later cycles do not lose independence history.

## Repeat re-assurance

Successful repeat remediation is still not assurance.

`.github/workflows/content-factory-foundation-internal-learning-repeat-reassurance-proof.yml` is the second-and-later fresh re-assurance adapter. It uses the same retained re-assurance artifact class and the issue-comment marker:

```text
revision-run-foundation-internal-learning-reassurance-proof:v2
```

The workflow verifies the exact latest remediation proof and its immediate parent remediation/re-assurance lineage, then revalidates the Foundation Live Proof and AI-Assured Proof before provider execution.

The semantic review uses the existing `assureFoundationInternalLearningAssets` engine. Its forbidden context set contains:

- Foundation generation contexts;
- Foundation assurance/reviewer contexts;
- any retained external-source-challenge context;
- every generation/remediation context accumulated in the latest corrected bundle; and
- every cumulative prior Learn/Practice reviewer context retained by the latest remediation record.

For cycle 2 this means all 98 earlier Learn/Practice reviewer contexts are excluded before 49 new work-unit review contexts are created. Each new reviewer context must also be unique and collision-free.

A clean result may set the corrected Learn and Practice derived-asset assurance states to `pass`. A `fail_hold` or `conditional_pass` retains zero assured assets and creates the next smallest-safe remediation target set. Either way, qualified-human Foundation approval remains a separate release gate and learner publication remains false while the Foundation state is only `ai_assured`.

## Cycle 2 retained recovery and re-assurance gate correction

The cycle 2 targeted remediation provider work completed on run `36115708856`, but its original proof harness failed after generation because it asserted superseded release-blocker wording. The retained corrected bundle was therefore recovered without regeneration after the governed recovery implementation reached Live:

- recovered remediation proof run `36131773705`;
- recovered remediation artifact `10862030803`;
- recovered artifact digest `sha256:36cbb93c0eb6255868a783d0d7a4caf7eb07669aae6e452c41a8da1501a43fc6`;
- recovery implementation/main head `ceaf836cedda50bcaf10ffddb07ced4f4cbf2eaf`;
- corrected bundle fingerprint `577d1d3c344112f2b79332332ff5d18d091994533909669ccc477bcce45db860`;
- addressed findings: `12 / 12`;
- remediated work units: `12`;
- remediated asset sides: `14`;
- retained successful remediation contexts: `18`;
- cumulative prior reviewer contexts: `98`;
- remediation-context collisions: `0`;
- provider calls repeated by recovery: `0`;
- Learn assurance: `pending`;
- Practice assurance: `pending`;
- Foundation approval: `not_approved`;
- learner publication eligible: `false`.

The first v2 re-assurance attempt against that recovered proof was workflow run `36131935630`. It produced no semantic assurance result and made no review-provider calls. The run failed closed during pre-provider cumulative-lineage validation because a shell `jq` uniqueness expression changed its input root to an array and then attempted to read `.remediationRecord` from that array.

The corrected implementation validates the retained `priorReviewerContextIds` with a deterministic Node validator before any provider call. The validator requires a non-empty array of non-empty strings with no duplicates. Regression tests cover valid, missing, empty, malformed and duplicate context sets. This changes only the proof gate implementation; it does not alter the recovered bundle, its provenance, the 98-context independence requirement, assurance state, Foundation state or publication eligibility.

## Provider and spend boundary

Repeat remediation retains the existing remediation provider contract:

- model `gpt-5.6-terra`;
- maximum output tokens `8000`;
- hard provider spend ceiling `$12`;
- provider retries maximum `2`.

Repeat re-assurance retains the existing review contract:

- model `gpt-5.6-terra`;
- maximum output tokens `5000`;
- hard provider spend ceiling `$12`;
- provider retries maximum `2`.

No paid repeat-remediation or repeat-re-assurance proof may be triggered until the relevant runner is approved, merged and confirmed Live.

## Publication and Foundation boundary

Every repeat-cycle artifact remains pre-production evidence.

A repeat-remediation pass means only that the exact targeted corrections were generated and retained. It does not resolve findings or assure assets.

A repeat re-assurance pass means only that the corrected Learn and Practice assets passed deterministic and fresh semantic asset assurance. It does not approve the Foundation. Learner release continues to require qualified-human `foundation_approved` state for the same Foundation fingerprint.

Exam Prep is outside this proof path.

## Documentation impact

This implementation applies the already-approved smallest-safe remediation and fresh-context revalidation rules. It does not change normative Content Factory authority and does not require a new ADR.

The first generation, first assurance, first remediation, first corrected-bundle re-assurance, recovered cycle 2 remediation and failed pre-provider cycle 2 re-assurance artifacts/runs remain immutable historical evidence. Repeat-cycle evidence is additive.

`INDEX.md` does not require a new authority entry because this document introduces no new source of normative truth; the existing Content Factory technical-document entries remain the implementation index for this proof family.
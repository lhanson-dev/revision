# Content Factory Foundation v2 Recompilation Checkpoint

**Status:** Retained real-course v2 Foundation compilation complete; Course Truth fragment normalisation released; quantitative source-anchor remediation repair in progress  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Related implementation plan:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`  
**Related assurance history:** `docs/technical/Content Factory Foundation Independent Review Proof.md`

## Purpose

Record the fresh upstream Foundation recompilation required after the fourth retained Slice 3B proof showed that the historical AQA A-level Business 7132 Foundation was structurally too coarse for controlled downstream generation, and retain subsequent v2 assurance evidence without rewriting earlier proof history.

This checkpoint is append-only operational evidence. It does not reinterpret earlier Slice 3B independent-review proofs and does not change normative Content Factory authority.

## Released compiler boundary

PR #304 hardened Foundation compilation so that:

- existing governed `skillsOrKnowledge` entries compile to deterministic atomic canonical Course Truth node identities;
- Foundation coverage v2 cannot claim structural completeness with fewer canonical nodes than the governed knowledge/skill items it represents;
- the Course Truth provider enriches the exact canonical nodes rather than deciding curriculum identity;
- Exam Truth v2 carries a compiler-owned quantitative coverage plan linked to the verified assessment requirement;
- AQA A-level Business 7132 records a qualification-total quantitative minimum of 10%, represented as at least 30 marks across the three 100-mark papers;
- the generation validation contract is `sum_quantitative_marks_gte_minimum` with interpretation credit required; and
- subsequent AI remediation must preserve the v2 schema version and compiler-owned quantitative plan.

PR #304 merged to approved `main` as `48e547c44c5def0e22b3f33b1e5f762f1cd93ce4`. Post-merge Revision CI #1560 and Pages #236 passed on that exact commit.

## Retained v2 Foundation live proof

The governed **Content Factory Foundation Live Proof** ran once as workflow run `33896487722` on exact released `main` `48e547c44c5def0e22b3f33b1e5f762f1cd93ce4`.

Retained artifact:

- artifact id: `9945993178`;
- artifact name: `content-factory-foundation-live-proof-48e547c44c5def0e22b3f33b1e5f762f1cd93ce4`;
- artifact digest: `sha256:c151f91c92313771a805eef10615951f674a85bd66519b83ff242cedbc58a18a`;
- retained proof file: `aqa-a-level-business-7132-foundation-48e547c44c5d-1788540075670.json`.

The live compilation test passed and retained a complete Foundation Candidate with:

- course: **AQA A-level Business 7132 — 2027 cohort**;
- Foundation fingerprint: `950c002c325e4d6a980d2588c707b3c541a3316b9fe5b7ce446fd51b1e481fac`;
- Course Truth nodes: `82`;
- canonical coverage nodes: `82`;
- Course Truth compiler completeness: `complete`;
- Exam Truth compiler completeness: `complete`;
- quantitative minimum: `10%` of qualification marks;
- total qualification assessment marks: `300`;
- minimum quantitative marks: `30`;
- eligible Question Families: Paper 1 MCQ, short answer and essay; Paper 2 data response; Paper 3 case study;
- quantitative generation validation: `sum_quantitative_marks_gte_minimum`;
- interpretation credit required: `true`;
- live provider generation runs: Course Truth, Exam Truth and Question Families;
- conservative provider spend: `$0.129068 / $12.00`;
- learner-facing assets: `0`.

The retained live proof correctly records deterministic assurance and independent review as `pending`. Successful compilation is not educational assurance, expert approval or `foundation_approved`.

## Slice 3B source rebind

The independent-review workflow had remained pinned to the historical Slice 2B source proof:

- workflow run `33802600001`;
- Foundation fingerprint `5b9a8496128b67d78c00a6075fe46ca70cad08bbc10bed6f4ce8f16b97e6efd8`.

That historical candidate is stale for the v2 structural-hardening proof and must not be reviewed again as though it were the new Foundation.

PR #305 rebound only the retained source identity used by `.github/workflows/content-factory-foundation-independent-review-proof.yml` to the exact v2 artifact above. It did not change the independent-review implementation, deterministic precondition, fresh-context separation, remediation dependency closure, three-cycle limit, `$12` whole-proof spend ceiling or zero-learner-asset rule.

PR #305 merged to approved `main` as `355abc128452a139787b148db04f1ab42d5e123d`. Post-merge Revision CI #1562 and Pages #237 passed on that exact commit.

## First retained v2 Slice 3B proof

After the #305 release was green, the governed Issue #289 command was posted once and launched **Content Factory Foundation Independent Review Proof** run `33900325645` on exact released `main` `355abc128452a139787b148db04f1ab42d5e123d`.

Retained evidence:

- source Foundation fingerprint: `950c002c325e4d6a980d2588c707b3c541a3316b9fe5b7ce446fd51b1e481fac`;
- final retained Foundation fingerprint: `0a367d864b52cdcb34547bf3939ee89597d1ea479851fe2043861ae8bdfe1d6f`;
- evidence artifact id: `9947552022`;
- evidence artifact digest: `sha256:20733e0d8d956f8bfb1ac93bf63ecadc83e3a749b773823bcd68456b01392b60`;
- generation contexts excluded from assurance: `9`;
- fresh independent-review contexts: `2`;
- retained successful remediation contexts: `1`;
- provider non-completed-response diagnostics: none;
- conservative provider spend: `$0.668982 / $12.00`;
- learner-facing assets: `0`.

The proof failed closed, but it materially advanced the Foundation before the operational failure.

### First fresh v2 review

The first reviewer returned `fail_hold` with two findings:

1. **Blocking — Course Truth lacked generative substance.** The 82 atomic nodes had correct canonical identity but remained largely label-like, with insufficient definitions, mechanisms, quantitative detail, misconceptions, contexts and knowledge relationships for controlled downstream generation.
2. **Material — Paper 1 essay calibration evidence was insufficient.** The 25-mark essay family remained `not_calibrated` without a sufficiently explicit Revision-owned response/AO/mark-demand contract.

### First targeted remediation

The first remediation completed successfully and resolved both findings. It:

- enriched the canonical Course Truth nodes with substantive definitions/mechanisms, quantitative knowledge, interpretation/limitations, misconceptions, contexts and prerequisite/related-node relationships;
- rebuilt dependent Exam Truth and all Question Families while preserving Board Alignment, source identity and the compiler-owned quantitative plan;
- added a Revision-owned Paper 1 essay calibration contract without claiming official or human-expert calibration;
- created candidate `-r1` with Foundation fingerprint `0a367d864b52cdcb34547bf3939ee89597d1ea479851fe2043861ae8bdfe1d6f`; and
- passed deterministic re-assurance on that exact corrected candidate.

### Second fresh review

The second fresh reviewer reduced the remaining material issue to one specific mathematical defect:

- Course Truth node `quantitative-skills.k02` represented percentage change without the grouping needed to make the formula unambiguous/correct. The required semantic correction is `((new value - original value) / original value) × 100`, with the original value as denominator and the zero-denominator limitation explicit.

This is substantially narrower than the initial v2 review and is evidence that the structural recompilation plus first remediation improved the Foundation as intended.

### Targeted-remediation normalisation failure

The subsequent remediation provider call returned a semantic correction for the affected Course Truth node, but Revision failed before retaining the second remediation record.

Exact blocker:

`remediation-worker-failure-content-factory.foundation.targeted-remediation-1b2928f4-b809-4f91-ba4c-87692a5393e8`

The local normaliser rejected valid references from `quantitative-skills.k02` to unchanged canonical nodes including `quantitative-skills.k01`, `marketing-analysis.k05` and `financial-performance.k04` because it validated the provider's one-node correction as though that fragment were the complete Course Knowledge Model.

This was an implementation normalisation-boundary defect. It was not a provider-capacity failure, not a source-rights failure, not evidence that those canonical node references were invalid, and not a reason to weaken the independent-review gate or raise the remediation-cycle limit.

## Released Course Truth fragment-normalisation repair

PR #306 repaired the live remediation boundary while keeping the core remediation and assurance contracts unchanged. It:

1. accepts one or more corrected canonical Course Truth nodes from the provider;
2. rejects duplicate or unknown canonical node IDs;
3. merges corrected nodes into the exact current complete Course Truth artifact;
4. validates the reconstructed full graph so genuinely unknown prerequisite/related references still fail closed;
5. computes the Course Truth fingerprint locally from the complete reconstructed semantic artifact; and
6. passes the complete validated artifact into the existing remediation core, which continues to enforce canonical node-set identity, dependency rebuilding and deterministic re-assurance.

PR #306 merged to approved `main` as `ab00620380640431eb3f927751a2cfead38593d0`. Post-merge Revision CI #1564 and Pages #238 passed on that exact commit.

This repair did not weaken assurance or allow the provider to delete canonical nodes. It reduced unnecessary model output for narrow corrections while preserving full-graph integrity validation inside Revision.

## Second retained v2 Slice 3B proof

After #306 was fully released, one governed proof was run against the same exact retained v2 source Foundation. **Content Factory Foundation Independent Review Proof** run `33911867784` reviewed exact released `main` `ab00620380640431eb3f927751a2cfead38593d0`.

Retained evidence:

- source and final Foundation fingerprint: `950c002c325e4d6a980d2588c707b3c541a3316b9fe5b7ce446fd51b1e481fac`;
- evidence artifact id: `9951781044`;
- evidence artifact digest: `sha256:86ec91b98ff14a5b48e5381670a20a4017df5efc848296b8730c75909e6a27df`;
- deterministic assurance: `pass`;
- fresh independent-review contexts: `1`;
- retained remediation contexts: `0` because remediation failed during local normalisation before a corrected candidate could be written;
- provider non-completed-response diagnostics: none;
- conservative provider spend: `$0.377006 / $12.00`;
- learner-facing assets: `0`.

The proof again failed closed, but **did not reproduce the Course Truth fragment-reference defect repaired by #306**.

### Fresh review findings on run `33911867784`

The fresh reviewer returned `fail_hold` with two findings on the source v2 Foundation:

1. **Blocking — Course Truth remained label-only and not learning-ready.** The reviewer observed that the source 82-node candidate still contained `Focuses specifically on...` summaries, empty formula arrays for quantitative methods, and empty prerequisite/related/misconception/application structures. This is expected on the unremediated source candidate and confirms why targeted remediation is required before Slice 3C.
2. **Material — Paper 2 / Paper 3 component mark allocation remained insufficiently operationalised.** Component totals were known, but the source Exam Truth did not yet constrain multi-question assembly tightly enough to guarantee exact 100-mark totals, command/response progression and realistic timing/quantitative opportunities.

These are legitimate educational/assessment findings for the unremediated source Foundation. The proof should have entered targeted remediation.

### Quantitative source-anchor normalisation failure

The remediation provider returned corrections for the blocking/material findings, but local normalisation failed before any remediation record or new candidate was retained.

Exact blocker:

`remediation worker failure: provider_contract_failure: remediation_normalisation: Quantitative coverage plan must reference an Exam Truth assessment requirement`

The source Exam Truth v2 quantitative plan is compiler-owned and references the verified assessment requirement:

`sourceAssessmentRequirementId: quantitative-minimum`

During remediation, the semantic Assessment Blueprint replacement omitted that referenced requirement while Revision correctly restored the compiler-owned quantitative plan. Full Exam Truth validation therefore failed closed because the restored plan no longer had its required source anchor in the provider-returned assessment-requirement list.

This is a second, distinct local remediation-normalisation boundary. The correct repair is not to remove the quantitative invariant or trust the provider's omission. The exact verified source requirement referenced by the compiler-owned plan must itself be preserved mechanically during remediation, alongside the plan, schema version and dependency fingerprints. Surrounding Paper 2 / Paper 3 assessment structure remains available for legitimate targeted correction.

## Quantitative source-anchor preservation repair

The bounded repair is:

1. read `quantitativeCoveragePlan.sourceAssessmentRequirementId` from the exact current Exam Truth;
2. locate the exact current assessment requirement with that ID;
3. preserve that source requirement mechanically even if provider semantic output omits or rewrites it;
4. continue to preserve the compiler-owned v2 schema version, quantitative plan, Board Alignment fingerprint and Course Truth fingerprint;
5. validate the reconstructed complete Exam Truth normally so unrelated invalid assessment changes still fail closed; and
6. explicitly instruct the remediation provider that the compiler-linked source requirement is not a mutable remediation field.

This implements the existing authority that Exam Truth quantitative rules derive from approved/verified assessment evidence. It does not create a new assessment rule, weaken independent review, change the three-cycle limit, increase spend, alter source rights or start learner-asset generation.

The failed run `33911867784` must not be blindly rerun before this repair is exact-head assured, Founder-approved, merged and production-verified.

## Progression boundary

Slice 3B is not complete at this checkpoint.

The exact current v2 Foundation may progress toward Slice 3C only if the released Slice 3B chain establishes:

1. deterministic assurance PASS for the exact current Foundation fingerprint and reviewed implementation commit;
2. genuinely fresh independent-review context distinct from all retained generation contexts;
3. no unresolved blocking/material finding after any permitted smallest-safe remediation;
4. deterministic re-assurance after each material correction;
5. fresh re-review after remediation; and
6. final independent-review PASS within the existing three-cycle limit.

Even a clean Slice 3B PASS does not constitute qualified expert approval. Slice 3C remains mandatory before `foundation_approved` and before any learner-facing asset factory may start.

## Documentation impact

This checkpoint records current implementation evidence only. No normative authority changes. Earlier proof evidence remains historically intact. The current repair mechanically preserves a compiler-linked, verified quantitative assessment source anchor during model remediation; it does not change what educational assurance must prove.

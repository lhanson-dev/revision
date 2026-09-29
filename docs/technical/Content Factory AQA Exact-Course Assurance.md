# Content Factory AQA Exact-Course Assurance

**Status:** T8 implementation contract pending governed merge and fresh proof  
**Scope:** AQA A-level Business 7132 — 2027 controlled Content Factory trial  
**Normative authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`; `80-company-workflows/Content Factory AI-Assured Foundation Gate Amendment.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`  
**Upstream implementation:** merged T6/T7 Course Truth / Exam Truth projection and transitional runtime adapter

## Purpose

Implement T8 exact-course assurance over the already-governed Business Subject Knowledge Foundation, AQA Specification Mapping, AQA Course Truth and stable Exam Truth without reviving the superseded whole-course generation model.

T8 answers a narrower question than Subject Foundation assurance:

> Is this exact AQA 7132 — 2027 course projection sufficiently correct, complete, traceable and assessment-aligned to permit controlled downstream derivation?

It does not regenerate reusable Business knowledge, create learner assets, confer qualified-human approval or permit learner publication.

## Architecture boundary

The authoritative dependency chain is:

`Business Subject Foundation v0.7 → AQA 7132 Specification Mapping → reassurance receipt → Course Truth → Exam Truth`

The existing runtime adapter remains a non-authoritative compatibility projection only.

The historical Foundation deterministic checker is not reused wholesale for this T8 path because its older exact-course model assumes that curriculum coverage references themselves are reusable generative sources. The approved Subject Foundation architecture deliberately separates those responsibilities:

- reusable Business teaching truth comes from promotion-eligible Subject Foundation sources;
- AQA material remains `REFERENCE_ONLY` course/alignment/assessment evidence; and
- exact AQA requirements point to reusable Subject Foundation nodes rather than turning awarding-body material into subject teaching truth.

Applying the older source assumption unchanged would collapse this separation and contradict the approved architecture.

## Deterministic T8 package

`scripts/assurance/materialise-aqa-business-7132-exact-course-assurance.mjs` rebuilds and validates the exact merged T6/T7 dependencies before producing the T8 review package.

It fails closed unless all of the following remain true:

- Business Subject Foundation v0.7 has the expected 81-node identity and exact fingerprint;
- the retained reassurance receipt is bound to the exact Foundation candidate and records no unresolved blocking/material finding;
- the AQA Specification Mapping still contains exactly 42 governed requirements;
- Course Truth contains all 42 requirements, all map to existing Subject Foundation nodes, and there are no unresolved exact-course or reusable-subject gaps;
- the exact course still selects the same 78 reusable Subject Foundation nodes;
- every selected node resolves only to promotion-eligible reusable subject-truth sources and not a quarantined awarding-body/historical source;
- Course Truth remains bound to the exact Subject Foundation, Specification Mapping and reassurance evidence;
- Exam Truth remains bound to the exact Course Truth and retains the approved stable assessment contract;
- AQA sources remain `REFERENCE_ONLY`, source prose is not promoted into generative truth and variable mark-scheme/examiner detail remains outside stable Exam Truth;
- the transitional runtime adapter remains non-authoritative, dependency-bound and complete for the same selected node set; and
- learner generation and publication remain disabled before T8 passes.

The package derives one deterministic exact-course Foundation fingerprint from the exact upstream fingerprints plus the selected Subject Foundation-node set. That fingerprint is the identity reviewed by the fresh T8 proof.

The materialised package contains:

- `candidate.json` — T8 candidate/gate state;
- `deterministic-assurance.json` — deterministic check evidence;
- `review-bundle.json` — rights-safe structured input for the independent reviewer; and
- `summary.json` — operator summary.

The review bundle contains structured Subject Foundation content and source metadata, Course Truth, Exam Truth and lineage evidence. It does **not** contain protected AQA source bodies.

## Fresh independent review

`scripts/assurance/aqa-business-7132-exact-course-assurance-proof.test.ts` performs one fresh independent review only after the proof capability exists on approved `main`.

The provider creates a new random review context and receives only the structured T8 bundle. It is instructed to challenge:

- factual and conceptual accuracy;
- genuine UK Level 3 subject depth;
- specification-to-Subject-Foundation mapping sufficiency;
- quantitative methods and interpretation;
- misconceptions and conceptual boundaries;
- Course Truth completeness;
- stable Exam Truth correctness and assessment fit;
- unsupported extrapolations; and
- integrity of the transitional runtime handoff.

Findings are classified as `blocking`, `material`, `minor` or `no_issue` and identify the governing layer affected:

- `subject_foundation` — reusable Business truth defect;
- `course_truth` — exact mapping/projection defect;
- `exam_truth` — stable assessment-contract defect; or
- `runtime_handoff` — compatibility projection defect.

Any blocking/material finding produces `fail_hold`. The T8 proof does not automatically patch Course Truth or reusable Business knowledge. Remediation must occur at the smallest governing layer and must create/reassure a new fingerprint where material truth changes.

Minor findings do not by themselves fail T8, but they remain explicit in the retained proof/known limitations and therefore remain visible to later qualified review and downstream design.

## Fresh official-source challenge

The same post-merge proof freshly retrieves the four official AQA references used by stable Exam Truth:

- scheme of assessment;
- specification at a glance;
- quantitative-skills annex; and
- assessment-resources index.

The challenge:

- requires the exact governed source ID set;
- allows only HTTPS `www.aqa.org.uk` references;
- follows redirects only when they remain on the approved AQA host;
- checks successful non-empty retrieval and bounded size;
- checks minimal source-identity markers appropriate to each reference;
- records content hash and response metadata; and
- retains neither the protected source body nor sends it to the AI reviewer.

This preserves the `REFERENCE_ONLY` boundary while still proving that the exact retained assessment contract is anchored to current official references.

## Gate semantics

A fresh T8 proof becomes `ai_assured` only when:

- deterministic exact-course assurance passes;
- the fresh independent review passes;
- the fresh official-source challenge passes; and
- there are zero unresolved blocking/material findings.

An `ai_assured` result may permit controlled internal/pre-production Course Learning Blueprint and asset derivation under the active Content Factory authority. It does **not** mean:

- `foundation_approved`;
- qualified subject/assessment approval;
- learner-content asset assurance; or
- learner publication eligibility.

Qualified human subject/assessment review remains `pending` after T8 AI assurance. Learner publication remains `false` until the later governed approval and asset-assurance gates are satisfied.

## Workflows

`.github/workflows/content-factory-aqa-business-7132-exact-course-assurance.yml` runs on the PR without provider spend. It executes the fail-closed deterministic self-test, materialises the review package and verifies that the fresh-proof TypeScript contract loads successfully.

`.github/workflows/content-factory-aqa-business-7132-exact-course-assurance-proof.yml` is deliberately post-merge and `workflow_dispatch` only. It checks out the exact approved `main` event SHA, rebuilds the deterministic package, runs the fresh independent review plus official-source challenge, and retains the proof bundle as a 30-day artifact.

A branch/PR run therefore proves the **assurance capability**. Only a later exact-main proof run can provide valid fresh T8 assurance evidence.

## Failure and remediation boundary

If the fresh proof returns `fail_hold`:

1. do not generate downstream assets;
2. classify each blocking/material finding by governing layer;
3. remediate the smallest safe dependency scope;
4. preserve historical evidence rather than rewriting it;
5. produce a new dependency/foundation fingerprint where material truth changes; and
6. rerun the affected T8 deterministic and fresh assurance steps.

A reusable Business defect must be fixed in the Subject Foundation first. It must not be patched only into AQA learner content.

## Documentation impact

This change introduces no new normative policy. T8 already exists in the approved Content Factory sequence and its approval/publication boundaries are already governed.

The implementation therefore updates technical documentation and `INDEX.md` only. No governance amendment or ADR is required unless later work changes the durable Content Factory authority, assurance lifecycle semantics or native runtime interface.

Historical Subject Foundation, mapping, reassurance and T6/T7 evidence remain unchanged.

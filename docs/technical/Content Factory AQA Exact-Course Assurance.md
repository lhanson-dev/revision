# Content Factory AQA Exact-Course Assurance

**Status:** T8 implementation contract pending governed merge and fresh proof  
**Scope:** AQA A-level Business 7132 — 2027 controlled Content Factory trial  
**Normative authority:** `decisions/ADR-0029-content-factory-fast-path-and-architecture-freeze.md` and `80-company-workflows/Content Factory Fast-Path Process.md` (take precedence on review, blocking, rounds and failure handling); `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`; `80-company-workflows/Content Factory AI-Assured Foundation Gate Amendment.md`; `80-company-workflows/Content Accuracy Assurance Gate.md`  
**Upstream implementation:** merged T6/T7 Course Truth / Exam Truth projection and transitional runtime adapter

## Purpose

Implement T8 exact-course assurance over the already-governed Business Subject Knowledge Foundation, AQA Specification Mapping, AQA Course Truth and stable Exam Truth without reviving the superseded whole-course generation model.

T8 answers a narrower question than Subject Foundation assurance:

> Is this exact AQA 7132 — 2027 course projection sufficiently correct, complete, traceable and assessment-aligned to permit controlled downstream derivation?

It does not regenerate reusable Business knowledge, create learner assets, confer qualified-human approval or permit learner publication.

## Architecture boundary

The authoritative dependency chain is:

`Business Subject Foundation (current version, named in the mapping) → AQA 7132 Specification Mapping → Course Truth → Exam Truth`

The existing runtime adapter remains a non-authoritative compatibility projection only.

The historical Foundation deterministic checker is not reused wholesale for this T8 path because its older exact-course model assumes that curriculum coverage references themselves are reusable generative sources. The approved Subject Foundation architecture deliberately separates those responsibilities:

- reusable Business teaching truth comes from promotion-eligible Subject Foundation sources;
- AQA material remains `REFERENCE_ONLY` course/alignment/assessment evidence; and
- exact AQA requirements point to reusable Subject Foundation nodes rather than turning awarding-body material into subject teaching truth.

Applying the older source assumption unchanged would collapse this separation and contradict the approved architecture.

## Deterministic T8 package

`scripts/assurance/materialise-aqa-business-7132-exact-course-assurance.mjs` rebuilds and validates the exact merged T6/T7 dependencies before producing the T8 review package.

It fails closed unless all of the following remain true:

- the loaded Business Subject Foundation is the version the Specification Mapping names and has 81 nodes; its fingerprint is recorded through every stage (no hard-coded fingerprints, so a targeted fix does not require editing each stage);
- the AQA Specification Mapping still contains exactly 42 governed requirements;
- Course Truth contains all 42 requirements, all map to existing Subject Foundation nodes, and there are no unresolved exact-course or reusable-subject gaps;
- the course node set is every mapped node plus every prerequisite of those nodes (prerequisite closure), owned by Course Truth; each requirement's runtime nodes include the prerequisites it needs;
- every selected node resolves only to promotion-eligible reusable subject-truth sources and not a quarantined awarding-body/historical source;
- Course Truth remains bound to the loaded Subject Foundation and the exact Specification Mapping; accuracy of Foundation nodes changed since their last assurance is checked by the T8 course gate rather than a separate reassurance receipt;
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

`scripts/assurance/aqa-business-7132-exact-course-assurance-proof.test.ts` runs the gate under the fast-path rules (ADR-0029), using `src/content-factory/fast-path-review.ts` and `scripts/assurance/aqa-business-7132-course-gate.ts`. Each of the 42 specification sections is a separate review unit.

Software checks run first and never loop:

- **dependency freshness**: the T8 package and the item-coverage report must be built from the same Foundation fingerprint, or the gate does not run;
- **item-level coverage**: every named item in `research/aqa-business-7132/2027/NAMED_ITEMS.json` is taught by a mapped node (`ITEM_COVERAGE_REPORT.json`);
- **prerequisite closure**: every mapped node's prerequisites are in the exact-course selection.

A section with a software-proven gap is blocking and is not sent to AI review. Otherwise one fresh reviewer answers the fixed checklist for that section only (`mapping_sense`, `depth`, and `accuracy` for nodes changed since their last assurance).

The rules, not the reviewer, decide what blocks. A finding blocks only if it is `wrong_teaching`, `missing_examinable_item` or `broken_question`, names a checklist question, and, for accuracy, cites a supplied source that contradicts the content. Everything else (`weak_citation`, `opinion_or_style`, `out_of_scope`, or findings without that evidence) is logged.

## Fresh official-source challenge

The same run retrieves the four official AQA references used by stable Exam Truth (scheme of assessment, specification at a glance, quantitative-skills annex, assessment-resources index). It checks the approved HTTPS `www.aqa.org.uk` host, source-identity markers and content hash. It neither retains the protected body nor sends it to the reviewer (`REFERENCE_ONLY`). Each page is retried up to three times; a page that still cannot be read is listed as failed, not treated as a teaching defect.

## Gate semantics

A fresh T8 proof becomes `ai_assured` only when:

- deterministic exact-course assurance and the software checks pass;
- no section is blocking, escalated without a Founder decision, or failed; and
- the official-source check passes.

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

- An AI call that fails (timeout, refusal, malformed or truncated output) is retried up to three times, then only that section is marked `failed`; the run continues.
- `content-factory/runs/aqa-7132-course-gate/ledger.json` records each section's input fingerprint, outcome and consecutive blocking rounds. It is committed after each run. Sections whose inputs have not changed are reused, not re-reviewed.
- A section gets at most two review rounds on a blocking issue. It is then escalated to the Founder (`escalations.json`), not reviewed a third time. A recorded Founder decision settles it.
- Every run ends with one list (`SUMMARY.md`): blocking, escalated, failed, passed with logged notes, passed. The gate reaches `ai_assured` only with nothing blocking, escalated or failed, and the official-source check passing.
- Fixes are recorded as one line in `content-factory/RUN_LOG.md`. A reusable Business defect is still fixed in the Subject Foundation first.

## Documentation impact

This change introduces no new normative policy. T8 already exists in the approved Content Factory sequence and its approval/publication boundaries are already governed.

This PR adds a technical implementation record for the T8 capability. No governance amendment or ADR is required unless later work changes the durable Content Factory authority, assurance lifecycle semantics or native runtime interface.

Historical Subject Foundation, mapping, reassurance and T6/T7 evidence remain unchanged.

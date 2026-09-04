# Content Factory Foundation-Gated Implementation Plan

**Status:** Active implementation plan — authority approved via PR #290; Issue #289 In Progress  
**Decision authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Architecture decisions:** `decisions/ADR-0020-content-factory-foundation-gate.md`; `decisions/ADR-0021-foundation-course-truth-semantic-seed.md`; `decisions/ADR-0022-foundation-precalibration-assessment-assembly.md`  
**Source-rights authority:** `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`  
**Current increment:** Slice 3B real-course qualification — release the AQA 7132 pre-calibration Paper 2 / Paper 3 assembly guard, then compile one fresh Foundation from the released semantic seed + assembly boundary before any further paid independent-review proof.

## Purpose

Implement the Content Factory as a staged production system where an exact course reaches an immutable Approved Course Foundation before any learner-facing Learn, Practice or Exam Prep assets are generated.

The governing sequence is:

`course request → Course Truth + Exam Truth → deterministic assurance → independent review/remediation → qualified expert approval → Approved Course Foundation → learner asset factories`

The historical v2 factory remains implementation evidence and a source of reusable controls. It is not the orchestration shape to extend.

## Canonical implementation truth

The current Foundation runtime is separate from the legacy `ContentFactoryJob` topology.

Released implementation includes:

- `foundation-schema.ts` — Foundation Candidate / Approved Course Foundation contracts;
- `foundation-lifecycle.ts` — small Foundation lifecycle, exact-fingerprint assurance binding, approval gate and version-lineage invariants;
- `foundation-compilation.ts` — provider-neutral Foundation compilation and deterministic reconciliation;
- `foundation-source-rights-registry.ts` — governed-main reusable source-rights rules;
- `foundation-live-adapter.ts` — Foundation-native live source/profile/provider workers;
- `foundation-live-proof.integration.test.ts` — real-course live proof harness;
- `.github/workflows/content-factory-foundation-live-proof.yml` — main-only bounded paid proof workflow;
- `foundation-assurance.ts` — Foundation-specific deterministic assurance;
- `foundation-independent-review.ts` — fresh-context independent review, targeted remediation and deterministic re-assurance loop; and
- `foundation-independent-review-live-adapter.ts` — bounded live review/remediation provider boundary.

The current pre-calibration hardening additionally introduces `foundation-precalibration-assembly.ts` as the AQA 7132 profile boundary that prevents uncalibrated Paper 2 / Paper 3 Question Families from claiming unsupported constituent mark/timing precision during initial compilation or targeted remediation. Detailed implementation record: `docs/technical/Content Factory Foundation Pre-Calibration Assembly Guard.md`.

The legacy orchestrator, old whole-course assurance factory and old worker factories remain in the repository during migration but are not canonical Foundation runtime dependencies.

## Migration rule

Reuse a previous component only when all three are true:

1. its responsibility remains valid under the new Foundation-first authority;
2. its contract can be used without importing the old end-to-end state machine; and
3. reuse is simpler and safer than implementing the bounded responsibility cleanly.

Proven controls may be ported without preserving obsolete topology. Complete deterministic diagnostics, fresh-context review separation, targeted remediation, durable fingerprints, provenance and cost telemetry remain useful. The old combined Learn/Practice/assessment assurance package does not define the new Foundation assurance boundary.

## Foundation domain model

A Foundation Candidate is the complete pre-approval dependency set for an exact course. It records exact course/cohort, Source Licence Register, Board Alignment, Foundation coverage, Course Truth, Exam Truth, Question Families, assurance/review status, blockers/limitations and provenance.

Operational context provenance (`generationContextIds`, `assuranceContextIds`) is retained so fresh-context separation remains provable after persistence/resume. These IDs do not form part of material educational identity and therefore do not enter the aggregate Foundation fingerprint.

A Foundation Candidate contains no Learn, Practice, Exam Prep, mock or Marking Pack requirement.

An Approved Course Foundation adds stable Foundation identity/version, the deterministic aggregate Foundation fingerprint, the exact embedded candidate, qualified reviewer/approver evidence and known limitations. An approved record is immutable; changed material Foundation truth requires a new candidate/fingerprint and newer version.

## Foundation lifecycle

The canonical lifecycle remains intentionally small:

`requested → compiling → assuring → expert_review → foundation_approved`

Exception states:

- `blocked` — operational interruption, resumable to the exact prior working stage after blockers resolve;
- `superseded` — terminal record for a replaced candidate/version.

Identity, rights, Board Alignment, coverage, Course Truth and Exam Truth are activities within `compiling`. Deterministic assurance, independent review and bounded remediation are activities within `assuring`. Qualified human review occurs in `expert_review`. No learner-asset generation transition exists inside this lifecycle.

## Foundation fingerprint/version invariant

The aggregate Foundation fingerprint is deterministic SHA-256 over material educational/assessment dependency identity: exact course/cohort, Source Licence Register, Board Alignment, Foundation coverage, Course Truth, Exam Truth, Question Families and source-set fingerprint.

Artifact storage refs, review timestamps, assurance evidence refs and worker context IDs do not define educational identity. For the same `foundationId`, the same material fingerprint retains the version and changed material truth creates a newer version. Source-rights revalidation timestamps remain audit metadata and do not alone create a new Foundation identity.

## Completed Slice 1 — Foundation schema and lifecycle

**Released through PR #291.**

Implemented Foundation Candidate / Approved Course Foundation schemas, the small lifecycle, blocker/resume behaviour, aggregate Foundation fingerprint, exact-fingerprint assurance binding, approval guard, mandatory version lineage and immutable approved-record integrity.

## Completed Slice 2A — Foundation compilation core

**Released and production-verified through PR #292 / `60269b9d96d6cce75f5decde30a727301f446d03`.**

Implemented Foundation-native identity/source/evidence worker contracts, deterministic source-rights classification, Board Alignment validation/fingerprinting, Foundation-specific coverage, Course Truth reconciliation, Exam Truth binding, Question Family reconciliation and provider-free proof with zero learner assets.

## Completed Slice 2B — live adapter and initial real-course proof

**Released through PR #293, repaired through PR #294, and successfully proved on `main`.**

Foundation Live Proof #2 / workflow run `33802600001` completed successfully on approved `main` commit `b7f5ec6f699715b41e341659e4c79e0b40c79e94` for **AQA A-level Business 7132 — 2027 cohort**.

Retained evidence established compiler-complete Course Truth and Exam Truth against the then-current governed seed/compilation contract, governed source-rights evidence, three live OpenAI worker runs, conservative provider spend `$0.0824 / $12.00`, learner-facing assets generated `0`, and deterministic/independent assurance correctly pending.

That proof established the live compilation boundary only. Slice 3B later demonstrated that compiler completeness against the original 14 broad Course Truth nodes was not sufficient educational evidence for an Approved Course Foundation. The historical Slice 2B result remains valid for the contract that existed at the time and is not retroactively described as independently sufficient.

## Slice 3 — Foundation assurance and approval

Goal: make the Foundation approval gate operationally trustworthy and prove one real course reaches `foundation_approved` before any learner asset is generated.

### Completed Slice 3A — deterministic Foundation assurance

**Implementation released through PR #295; retained real-course proof released through PR #296.**

The Foundation-native deterministic assurance engine re-reads the exact persisted Candidate dependency set and checks artifact readability/fingerprints, source-rights safety, exact identity/cohort/alignment, Foundation coverage, Course Truth traceability, Exam Truth binding and Question Family validity.

The retained AQA Business Foundation passed deterministic assurance with 18 checks, zero failures and zero learner assets. Detailed implementation record: `docs/technical/Content Factory Foundation Assurance Implementation.md`.

### Current Slice 3B — fresh-context independent Foundation review and remediation

Core implementation was released through PR #298, with operational proof controls/repairs through PRs #299–#303 and subsequent v2 Foundation/rebinding/remediation hardening through PRs #304–#307.

The released boundary provides:

- exact deterministic PASS for the current Foundation fingerprint and review implementation commit before AI review;
- fresh review/remediation contexts excluded from Foundation generation and all earlier assurance contexts;
- structured blocking/material/minor/no-issue findings;
- review evidence bound to exact Foundation fingerprint and deterministic report;
- smallest-safe remediation scope and explicit dependency closure;
- fail-closed upstream Source Rights / Board Alignment / Foundation coverage handling;
- new candidate/fingerprint creation for material corrections;
- deterministic re-assurance after every material correction;
- mandatory fresh re-review after re-assurance; and
- a maximum of three material remediation cycles.

Dependency closure remains:

- Course Truth material finding → Course Truth + dependent Exam Truth + all Question Families;
- Exam Truth material finding → Exam Truth + all Question Families;
- Question Family material finding → affected family only;
- Source Rights / Board Alignment / Foundation coverage material finding → block and reopen governed Foundation compilation.

A remediation worker may not arbitrarily change canonical coverage node identity, course/job identity, Board Alignment or compiler-owned dependency fingerprints.

#### Fourth real-course Slice 3B proof checkpoint — 4 September 2026

Workflow run `33881398927` on approved `main` `45813911d10a012b0477ed43a6259fdb0e57db22` proved the full operational review/remediation loop:

- four fresh independent reviews;
- three targeted remediation cycles;
- three changed Foundation candidates/fingerprints;
- deterministic PASS after every correction;
- no incomplete/provider/infrastructure failure;
- conservative provider spend `$0.530818 / $12.00`;
- learner-facing assets `0`.

The final remediated fingerprint was `ae57b118251b5124b020c9505f7582b00d29104560c6020212fff5754aa9acfb`. Independent review remained `fail_hold` because two material structural issues persisted after the governed three-cycle limit:

1. **Course Truth granularity:** broad coverage requirements were each represented by one broad node despite the governed Revision-owned seed already containing multiple `skillsOrKnowledge` entries.
2. **Quantitative Exam Truth:** the verified minimum of 10% quantitative marks was stated but not converted into an enforceable aggregate generation constraint. For three 100-mark papers this requires at least 30 marks across the qualification assessment.

The correct response was **not** to raise the remediation-cycle limit. These findings exposed an upstream compilation-contract boundary.

#### Completed v2 Foundation recompilation hardening

The next compiler increment deliberately reopened compilation rather than continuing to mutate the old retained candidate.

The released hardening:

- preserved the rights-governed Revision-owned source seed and its existing `skillsOrKnowledge` obligations;
- created deterministic atomic canonical node IDs for every governed `skillsOrKnowledge` entry;
- emitted Foundation coverage v2 in which a requirement cannot be structurally complete with fewer canonical nodes than governed knowledge/skill items;
- constrained the Course Truth provider to enrich only those exact canonical nodes rather than inventing scope/identity;
- emitted Exam Truth v2 with a compiler-owned quantitative coverage plan linked to the verified `quantitative-minimum` Board Alignment requirement;
- recorded for AQA 7132 an aggregate minimum of `30 / 300` marks, eligible Question Families, `sum_quantitative_marks_gte_minimum`, and required interpretation credit;
- preserved the v2 schema version, quantitative plan and verified quantitative source requirement through subsequent model remediation; and
- kept historical retained artifacts readable.

A fresh v2 Foundation Candidate was retained and Slice 3B was rebound to that exact artifact/fingerprint before the fifth proof.

#### Fifth real-course Slice 3B proof checkpoint — 4 September 2026

Workflow run `33920653838` on approved `main` `9a976ff236b06257644d5fe02206817598583e03` exercised the exact retained v2 Foundation through the full independent-review/remediation loop. Retained artifact `9955070274`, digest `sha256:4b74b19d324575a35b94e61ab52a08da881ed3335a3dcb49e0d9caee14b9f8de`.

Evidence:

- four fresh independent reviews;
- three completed targeted-remediation cycles;
- deterministic PASS after every correction;
- `providerResponseDiagnostics: []`;
- conservative provider spend `$1.025522 / $12.00`;
- learner-facing assets `0`;
- final Foundation fingerprint `7fb036361c544f9acfd276f23e4f7c9c6007144e83b6a363395dd9dee12070f2`;
- final state blocked only because material findings remained after the governed three-cycle limit.

This proof confirms that the technical review/remediation machinery is functioning. The remaining work is educational/assessment ownership upstream of the retry loop.

The final two material findings were:

1. **Financial-ratio scope is not enactable.** The Course Truth node described a wider ratio-method scope than the formulas/methods it actually defined, so controlled generation could not know whether efficiency/gearing methods were required or prohibited.
2. **Paper 3 internal demand is over-specified before calibration.** Remediation created a rigid six-question `5/10/15/20/25/25` mark sequence with matching `6/12/18/24/30/30` minute guidance while the Question Family remained `not_calibrated`.

Do not raise the remediation-cycle limit and do not rerun the retained run-#15 candidate.

#### Post-fifth-proof upstream hardening

The fifth-proof findings are being converted into two explicit upstream controls rather than additional remediation cycles.

**A. Course Truth semantic evidence seed — released through PR #308**

The Revision-owned AQA Business seed now carries substantive candidate semantics for all 82 atomic knowledge/skill obligations rather than topic labels alone. Where applicable this includes definitions, relationships, exact quantitative methods/formulae, interpretation boundaries and explicit method scope. The Course Truth worker remains prohibited from broadening this scope from model memory.

The financial-ratio obligation is deliberately bounded to the methods the candidate actually defines rather than claiming undefined efficiency/gearing coverage. The semantic-seed change is material Foundation source evidence, so the next Foundation proof must compile a fresh candidate.

Architecture decision: `decisions/ADR-0021-foundation-course-truth-semantic-seed.md`.

**B. Pre-calibration assessment assembly boundary — current PR**

The current hardening prevents initial generation or remediation from manufacturing rigid constituent Paper 2 / Paper 3 mark/timing patterns where Board Alignment supports only aggregate structure and the Question Family remains `not_calibrated`.

For AQA 7132, exact component totals/timings and verified approximate paper shape remain enforceable, while the compiler owns an aggregate-only Question Family response shape and a component-wide pre-calibration mark envelope. Provider-authored exact constituent allocations outside that compiler-owned shape fail closed. Targeted remediation passes through the same normalizer.

Architecture decision: `decisions/ADR-0022-foundation-precalibration-assessment-assembly.md`. Implementation record: `docs/technical/Content Factory Foundation Pre-Calibration Assembly Guard.md`.

No paid Slice 3B proof should run until this second hardening is released.

Once ADR-0021 and ADR-0022 are both released, the required sequence is:

1. run one fresh main-only Foundation live proof to retain a new Foundation Candidate derived from the changed semantic seed and pre-calibration assembly boundary;
2. verify the exact new Foundation artifact/fingerprint, 82-node semantic Course Truth, quantitative `30 / 300` gate, pre-calibration Question Families and zero learner assets;
3. bind Slice 3B proof input to that exact new retained candidate;
4. rerun deterministic assurance and one fresh-context independent-review/remediation proof; and
5. enter Slice 3C only if the exact version reaches deterministic PASS plus independent-review PASS.

This remains an implementation/technical-documentation change under existing authority. Source-rights rules, independent-review severity, the three-cycle limit and qualified expert review are not weakened.

### Slice 3C — qualified expert review and immutable approval

Implement qualified subject/assessment expert-review package/contract, structured expert findings/evidence, reviewer identity/timestamps, known limitations, version-lineage validation and durable immutable Approved Course Foundation persistence.

Success proof for Slice 3 is the real AQA Business Foundation reaching `foundation_approved` on an exact assured/reviewed version while learner-facing asset count remains zero.

A second AI review is not expert approval. Slice 3C remains a separate human qualification gate even if Slice 3B passes cleanly.

## Subsequent implementation sequence

### Slice 4 — Learn Factory

Generate and assure teaching assets from approved Course Truth. Every Learn asset carries the approved Foundation fingerprint/version.

### Slice 5 — Practice Factory

Generate coverage-driven Practice assets against canonical knowledge/skill nodes and valid learner-evidence mappings, without universal quantity quotas or mandatory completion lanes.

### Slice 6 — Exam Prep Factory

Generate assessment-authentic technique, questions, timed work, mocks/simulations and Marking Packs from approved Course Truth + Exam Truth. Representative full mocks receive higher assurance. Full assessment generation must satisfy compiler-owned quantitative and other enforceable Exam Truth constraints.

### Slice 7 — Content Operations presentation

Present the operator journey primarily as:

```text
Foundation
Course Truth     APPROVED
Exam Truth       APPROVED
Foundation       APPROVED v1

Assets
Learn            not started / generating / assured / published
Practice         not started / generating / assured / published
Exam Prep        not started / generating / assured / published
```

Internal candidates/retries remain diagnostics rather than the primary workflow.

### Slice 8 — staged repeatability qualification

Separately prove Foundation reliability, Learn reliability, Practice reliability, Exam Prep/Marking reliability, dependency invalidation, restart/reuse/cost controls and fail-closed behaviour across materially different course shapes.

Do not inherit the old full-course Q1–Q8 sequence merely for compatibility.

## Assurance approach

For every slice use schema/unit tests for lifecycle and invariants, deterministic validator tests including simultaneous defects where relevant, dependency invalidation tests, no hidden mutation of approved Foundation artifacts, explicit provider-call/cost boundaries, fresh-context review separation where review exists, historical regressions only for retained components, and exact-head CI before governed merge.

Paid live proof evidence supplements these controls; it does not replace exact-head CI or Founder approval.

## Documentation maintenance

As implementation lands:

- maintain this plan as the staged implementation owner;
- keep Foundation lifecycle, compilation and assurance implementation records aligned;
- keep `docs/technical/Content Factory Architecture.md` aligned to the current Foundation runtime rather than legacy orchestration;
- retain pilot/remediation/proof records as history;
- update Content Operations documentation only when that surface changes; and
- update `INDEX.md` when implementation ownership, architecture-decision discoverability or source-of-truth relationships materially change.

## Operational completion condition for Slice 3B

Slice 3B is operationally complete only when an exact **current** Foundation Candidate has:

1. deterministic PASS bound to the exact current implementation commit and Foundation fingerprint;
2. a provider review context proven distinct from retained generation/review/remediation contexts;
3. retained structured review evidence;
4. if required, smallest-safe material remediation creating a new candidate/fingerprint;
5. deterministic re-assurance of the remediated candidate; and
6. another fresh independent review of the exact remediated fingerprint reaching PASS within the bounded cycle limit.

The fifth proof demonstrates that the review/remediation mechanism works. ADR-0021 has moved substantive semantic evidence upstream, and ADR-0022 now hardens the pre-calibration Paper 2/Paper 3 assembly boundary. After both changes are released, only a newly compiled exact Foundation version with deterministic PASS and independent-review PASS may progress to Slice 3C qualified expert review.

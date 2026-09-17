# Content Factory Foundation-Gated Implementation Plan

**Status:** Active implementation plan — authority approved via PR #290; Issue #289 In Progress  
**Decision authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`  
**Architecture decisions:** `decisions/ADR-0020-content-factory-foundation-gate.md`; `decisions/ADR-0021-foundation-course-truth-semantic-seed.md`; `decisions/ADR-0022-foundation-precalibration-assessment-assembly.md`; `decisions/ADR-0023-foundation-requirement-led-coverage.md`  
**Source-rights authority:** `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`  
**Current increment:** AQA 7132 / 2027 Foundation curriculum reconciliation and deterministic Course Truth semantic-retention remediation after the fresh external-source challenge returned `fail_hold`. Slice 3C qualified expert review is paused until a replacement Foundation Candidate/fingerprint passes live proof, deterministic assurance, fresh independent review and a fresh external-source challenge.

## Purpose

Implement the Content Factory as a staged production system where an exact course reaches an immutable Approved Course Foundation before any learner-facing Learn, Practice or Exam Prep assets are generated.

The governing sequence is:

`course request → Course Truth + Exam Truth → deterministic assurance → independent review/remediation → fresh external-source challenge → qualified expert approval → Approved Course Foundation → learner asset factories`

The historical v2 factory remains implementation evidence and a source of reusable controls. It is not the orchestration shape to extend.

## Canonical implementation truth

The current Foundation runtime is separate from the legacy `ContentFactoryJob` topology.

Released/current implementation includes:

- `foundation-schema.ts` — Foundation Candidate / Approved Course Foundation contracts;
- `foundation-lifecycle.ts` — small Foundation lifecycle, exact-fingerprint assurance binding, approval gate and version-lineage invariants;
- `foundation-compilation.ts` — provider-neutral Foundation compilation and deterministic reconciliation;
- `foundation-source-rights-registry.ts` — governed-main reusable source-rights rules;
- `foundation-live-adapter.ts` — Foundation-native live source/profile/provider workers;
- `foundation-live-proof.integration.test.ts` — real-course live proof harness;
- `.github/workflows/content-factory-foundation-live-proof.yml` — main-only bounded paid proof workflow;
- `requirement-led-coverage.ts` — source-led curriculum/exam reconciliation and portable final Course Truth named-scope retention;
- `foundation-assurance.ts` — Foundation-specific deterministic assurance, including applicable Course Truth semantic retention;
- `foundation-independent-review.ts` — fresh-context independent review, targeted remediation and deterministic re-assurance loop;
- `foundation-independent-review-live-adapter.ts` — bounded live review/remediation provider boundary;
- `foundation-external-source-challenge.ts` — exact-fingerprint fresh external-source challenge contract before expert-review readiness; and
- `foundation-expert-review.ts` — portable exact-fingerprint qualified-human review contract which requires a passing external-source challenge.

The AQA 7132 profile additionally includes:

- `foundation-precalibration-assembly.ts` — prevents uncalibrated Paper 2 / Paper 3 Question Families from claiming unsupported constituent mark/timing precision during initial compilation or targeted remediation; and
- `foundation-aqa7132-curriculum-retention.ts` — binds the portable final-Course-Truth retention invariant to the current AQA 7132 / 2027 source-led curriculum profile and Revision-owned semantic seed.

Detailed current implementation records:

- `docs/technical/Content Factory Foundation Assurance Implementation.md`;
- `docs/technical/Content Factory Foundation Pre-Calibration Assembly Guard.md`;
- `docs/technical/Content Factory Foundation Expert Review Contract.md`; and
- `docs/technical/Content Factory Foundation Curriculum Reconciliation and Semantic Retention.md`.

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

Identity, rights, Board Alignment, source universe, requirement-led coverage, Course Truth and Exam Truth are activities within `compiling`. Deterministic assurance, independent review, bounded remediation and the external-source challenge are pre-expert approval assurance activities. Qualified human review occurs in `expert_review`. No learner-asset generation transition exists inside this lifecycle.

## Foundation fingerprint/version invariant

The aggregate Foundation fingerprint is deterministic SHA-256 over material educational/assessment dependency identity: exact course/cohort, Source Licence Register, Board Alignment, Foundation coverage, Course Truth, Exam Truth, Question Families and source-set fingerprint.

Artifact storage refs, review timestamps, assurance evidence refs and worker context IDs do not define educational identity. For the same `foundationId`, the same material fingerprint retains the version and changed material truth creates a newer version. Source-rights revalidation timestamps remain audit metadata and do not alone create a new Foundation identity.

A material curriculum denominator or semantic-seed correction therefore requires a fresh Candidate/fingerprint even when the seed schema shape itself is unchanged.

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

That proof established the live compilation boundary only. Later assurance demonstrated that compiler completeness against an internal denominator was not sufficient educational evidence for an Approved Course Foundation. The historical Slice 2B result remains valid for the contract that existed at the time and is not retroactively described as independently sufficient.

## Slice 3 — Foundation assurance and approval

Goal: make the Foundation approval gate operationally trustworthy and prove one real course reaches `foundation_approved` before any learner asset is generated.

### Completed Slice 3A — deterministic Foundation assurance

**Implementation released through PR #295; retained real-course proof released through PR #296.**

The Foundation-native deterministic assurance engine re-reads the exact persisted Candidate dependency set and checks artifact readability/fingerprints, source-rights safety, exact identity/cohort/alignment, Foundation coverage, Course Truth traceability, Exam Truth binding and Question Family validity.

Subsequent hardening adds source-led completeness controls and, for applicable AQA 7132 / 2027 Candidates, a material `course-truth-semantic-retention` check so final generated Course Truth cannot silently drop mechanically checkable named curriculum scope while retaining the same canonical nodes.

Detailed implementation record: `docs/technical/Content Factory Foundation Assurance Implementation.md`.

### Completed Slice 3B — fresh-context independent Foundation review and remediation

Core implementation was released through PR #298, with operational proof controls/repairs through PRs #299–#303 and subsequent v2 Foundation/rebinding/remediation hardening through PRs #304–#311.

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

This proof confirmed the technical review/remediation machinery was functioning, while the remaining findings required upstream educational/assessment ownership rather than more retries.

The final two material findings were:

1. **Financial-ratio scope is not enactable.** The Course Truth node described a wider ratio-method scope than the formulas/methods it actually defined, so controlled generation could not know whether efficiency/gearing methods were required or prohibited.
2. **Paper 3 internal demand is over-specified before calibration.** Remediation created a rigid six-question `5/10/15/20/25/25` mark sequence with matching `6/12/18/24/30/30` minute guidance while the Question Family remained `not_calibrated`.

Do not raise the remediation-cycle limit and do not rerun that retained candidate.

#### Post-fifth-proof upstream hardening

The fifth-proof findings were converted into two explicit upstream controls rather than additional remediation cycles.

**A. Course Truth semantic evidence seed — released through PR #308**

The Revision-owned AQA Business seed carries substantive candidate semantics for atomic knowledge/skill obligations rather than topic labels alone. Where applicable this includes definitions, relationships, exact quantitative methods/formulae, interpretation boundaries and explicit method scope. The Course Truth worker remains prohibited from broadening this scope from model memory.

Architecture decision: `decisions/ADR-0021-foundation-course-truth-semantic-seed.md`.

**B. Pre-calibration assessment assembly boundary — released through PR #309; reviewer/normaliser boundary repaired through PR #311**

The released hardening prevents initial generation or remediation from manufacturing rigid constituent Paper 2 / Paper 3 mark/timing patterns where Board Alignment supports only aggregate structure and the Question Family remains `not_calibrated`.

For AQA 7132, exact component totals/timings and verified approximate paper shape remain enforceable, while the compiler owns an aggregate-only Question Family response shape and a component-wide pre-calibration mark envelope. Provider-authored exact constituent allocations outside that compiler-owned shape fail closed. Targeted remediation passes through the same normalizer.

Architecture decision: `decisions/ADR-0022-foundation-precalibration-assessment-assembly.md`. Implementation record: `docs/technical/Content Factory Foundation Pre-Calibration Assembly Guard.md`.

#### Historical Slice 3B clean checkpoint — 5 September 2026

After ADR-0021 and ADR-0022 hardening, workflow run `33956520875` on released `main` `2f2ae89f8280e3b0c1091346258e56f993f61f77` completed deterministic assurance and fresh independent review cleanly for Foundation fingerprint `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca`, with zero learner-facing assets.

That remains historical evidence of the internal assurance contract at that point. Later requirement-led/source-universe hardening and the external-source challenge demonstrated that internal PASS evidence alone does not establish external specification completeness.

### Requirement-led/source-universe hardening and external challenge

PR #318 introduced independently source-led Curriculum Coverage Map and Exam Coverage Map requirements so generated Foundation artifacts cannot define their own completeness denominator. Follow-on source-universe hardening moved the independent denominator upstream again and made a fresh external-source challenge mandatory before expert-review readiness.

The external-source challenge deliberately assumes Revision's Source Universe and requirement universe may be incomplete or wrong and independently checks current permitted official/authoritative evidence before the qualified-human package is built.

The expert-review runtime now fails closed unless the exact current Foundation fingerprint has:

- deterministic assurance PASS;
- fresh independent-review PASS;
- no unresolved blockers;
- the required Source Universe; and
- a fresh external-source challenge PASS using a reviewer context excluded from all generation and prior assurance contexts.

### Current remediation — AQA 7132 curriculum reconciliation and Course Truth semantic retention

The fresh external-source challenge performed against Foundation fingerprint `0d90fccdca657fc1d9dae0e16b663071fc08bdcec3323f3a95fa24e36242380e` returned **`fail_hold`**.

It found two material defect classes:

1. **Requirement-universe incompleteness.** The governed AQA curriculum denominator/semantic seed omitted explicit current 3.3.4 and 3.6.1 scope, so the internal completeness result was green against an incomplete denominator.
2. **Semantic-retention loss.** The governed 3.3.4 semantic input included social media, viral marketing and multi-channel distribution, but final Course Truth silently dropped those named requirements.

The full current-specification reconciliation additionally exposed further explicit scope that had been underrepresented, including 3.2.2 external environment including competition as an influence on decision making.

The remediation therefore:

- reconciles the complete AQA 7132 / 2027 source-led curriculum profile and Revision-owned semantic seed rather than patching only the reported strings;
- keeps protected AQA material `REFERENCE_ONLY` and outside generative model context;
- adds portable deterministic final-Course-Truth required-scope retention;
- binds that invariant to the AQA 7132 / 2027 profile;
- adds `course-truth-semantic-retention` as a material deterministic Foundation assurance check;
- applies the same invariant before fresh independent review and after Course Truth remediation; and
- retains regression tests for the exact historical 3.3.4 silent-narrowing failure.

Detailed implementation record: `docs/technical/Content Factory Foundation Curriculum Reconciliation and Semantic Retention.md`.

The failed fingerprint `0d90fccdca657fc1d9dae0e16b663071fc08bdcec3323f3a95fa24e36242380e` is historical evidence. It must not be patched, reused for qualified expert review or become `foundation_approved`.

#### Required replacement proof chain

After the remediation is merged to approved `main`, the next AQA 7132 / 2027 sequence is:

1. compile a fresh Foundation Candidate and retain its new exact Foundation fingerprint;
2. run live Foundation proof on approved `main`;
3. run deterministic assurance on that exact Candidate, including `course-truth-semantic-retention`;
4. run fresh-context independent Foundation review;
5. if material remediation is required, create a new Candidate/fingerprint and rerun deterministic assurance plus another fresh independent review;
6. run a genuinely fresh external-source challenge against the exact resulting fingerprint and current required Source Universe;
7. only if the external-source challenge passes, assemble the qualified expert-review package; and
8. obtain genuine qualified subject/assessment review before immutable `foundation_approved` persistence.

No learner-facing assets may be created as part of this replacement proof.

### Paused Slice 3C — qualified expert review and immutable approval

The portable qualified subject/assessment expert-review package/contract already exists, including structured expert findings/evidence, reviewer identity/qualification evidence, known limitations, exact fingerprint binding and fail-closed external-source challenge validation.

Slice 3C is **paused for AQA 7132 / 2027** because the current retained fingerprint failed the mandatory external-source challenge. A second AI review is not expert approval, but neither should the qualified human be used as the primary detector of explicit source omissions that the preceding gates can detect.

Slice 3C resumes only for a replacement Foundation fingerprint which clears the complete pre-human assurance chain.

Success proof for Slice 3 is the real AQA Business Foundation reaching `foundation_approved` on an exact current-source-assured, independently reviewed, external-challenge-passed and qualified-human-reviewed version while learner-facing asset count remains zero.

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

For Foundation completeness specifically, internal structural consistency is not sufficient. The implementation must also prove the independently established Source Universe/requirement denominator, final Course Truth semantic retention where mechanically checkable, and fresh external-source challenge separation before qualified-human review readiness.

Paid live proof evidence supplements these controls; it does not replace exact-head CI or Founder approval.

## Documentation maintenance

As implementation lands:

- maintain this plan as the staged implementation owner;
- keep Foundation lifecycle, compilation, assurance, external-challenge and expert-review implementation records aligned;
- keep `docs/technical/Content Factory Architecture.md` aligned to the current Foundation runtime rather than legacy orchestration;
- retain pilot/remediation/proof records as history;
- update Content Operations documentation only when that surface changes; and
- update `INDEX.md` when implementation ownership, architecture-decision discoverability or source-of-truth relationships materially change.

## Current operational condition before Slice 3C

A current exact Foundation Candidate may progress to Slice 3C only when all of the following hold for the same exact fingerprint:

1. deterministic PASS bound to the exact current implementation commit and Foundation fingerprint;
2. a fresh independent-review context proven distinct from retained generation/review/remediation contexts;
3. retained structured independent-review evidence with no unresolved blocking/material finding;
4. if required, smallest-safe material remediation creating a new candidate/fingerprint followed by deterministic re-assurance and another fresh independent review;
5. complete Source Universe and source-led curriculum/exam reconciliation for the exact course/cohort; and
6. a fresh external-source challenge PASS against that exact fingerprint, current required source universe and a reviewer context excluded from all prior generation/assurance contexts.

No currently retained AQA 7132 / 2027 Foundation satisfies this progression condition. The latest challenged fingerprint `0d90fccdca657fc1d9dae0e16b663071fc08bdcec3323f3a95fa24e36242380e` is `fail_hold` and must be replaced through the governed recompilation/proof chain above.

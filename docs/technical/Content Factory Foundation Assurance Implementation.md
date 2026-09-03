# Content Factory Foundation Assurance Implementation

**Status:** Slice 3A released through PR #295 / real-course deterministic proof through PR #296; Slice 3B implementation in PR #298  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Implementation plan:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`

## Purpose

Implement the assurance side of the Foundation Factory without importing the superseded end-to-end Content Factory assurance topology.

The governing sequence remains:

`Course Truth + Exam Truth → deterministic Foundation assurance → fresh-context independent Foundation review/remediation → qualified expert review → foundation_approved`

No learner-facing asset factory may begin from this assurance path until the exact Foundation version reaches `foundation_approved`.

## Slice 3 decomposition

Slice 3 is deliberately split into short governed increments:

1. **Slice 3A — deterministic Foundation assurance** — released through PR #295, with the retained real-course deterministic proof through PR #296.
2. **Slice 3B — fresh-context independent Foundation review and targeted remediation** — implementation in PR #298; retained real-course operational proof follows only after release to approved `main`.
3. **Slice 3C — qualified expert-review package, approval evidence and immutable Approved Course Foundation persistence.**

This keeps deterministic structure checking separate from independent educational judgement and qualified-human approval.

## Slice 3A — deterministic Foundation assurance

`src/content-factory/foundation-assurance.ts` is the Foundation-native deterministic assurance engine.

It accepts a complete Foundation Candidate in the canonical `assuring` state and re-reads the exact persisted artifacts referenced by that candidate:

- Source Licence Register;
- Board Alignment;
- Foundation coverage model;
- Course Knowledge Model / Course Truth;
- Assessment Blueprint / Exam Truth; and
- Question Families.

It performs mechanically provable checks across the complete dependency set, including material fingerprints, source-rights safety, exact course/cohort/alignment, Foundation coverage, Course Truth traceability, Exam Truth binding and Question Family validity.

Deterministic assurance retains complete diagnostics where later checks can safely continue. A `foundation_deterministic_assurance_report` records the exact job/candidate, reviewed repository commit, aggregate Foundation fingerprint, all deterministic checks/evidence and a mechanically consistent pass/fail decision. A stale report for another Foundation fingerprint cannot satisfy the lifecycle gate.

### Retained real-course deterministic proof

PR #296 added the bounded operational proof for the exact **AQA A-level Business 7132 — 2027 cohort** Foundation Candidate retained by successful Foundation Live Proof #2.

The main-only proof reused the retained generated Candidate rather than regenerating it and established deterministic PASS on approved `main` with complete retained evidence. It made no provider calls and generated zero learner-facing assets.

That retained proof is historical evidence for Slice 3A; later assurance increments may re-run deterministic checks against the same exact material Foundation fingerprint under newer approved implementation commits without pretending the Foundation was regenerated.

## Slice 3B — independent review and targeted remediation

PR #298 adds three Foundation-native assurance components:

- `foundation-independent-review.ts` — provider-neutral independent review, finding classification, targeted remediation and deterministic re-assurance loop;
- `foundation-independent-review-context.ts` — generation-context evidence binding for restart/resume-safe review independence; and
- `foundation-independent-review-live-adapter.ts` — bounded provider workers for live independent review and remediation using the existing structured provider transport.

The implementation deliberately does not import or route through the legacy whole-course `assurance-and-remediation.ts` orchestrator.

### Fresh-context independence

Independent review is not accepted merely because a different worker name is used.

Foundation compilation already retains every worker execution in its run ledger. Before Slice 3B review begins, `foundationGenerationContextIdsFromWorkerRuns` extracts the complete recorded context set and `bindFoundationGenerationContextProvenance` persists those IDs into the Candidate as operational provenance. The binding function recomputes the aggregate Foundation fingerprint before and after the metadata update and fails if material identity changes.

The control loop then constructs an explicit forbidden context set from:

- retained Foundation generation context IDs;
- previous Foundation review/remediation context IDs; and
- any additional historical context IDs supplied by the proof/runtime where required.

The independent-review worker must return provenance containing a context ID outside that set. Reuse fails closed and blocks the Foundation job.

`FoundationCandidate.provenance.generationContextIds` and `assuranceContextIds` are intentionally **non-material metadata** and remain excluded from the aggregate Foundation fingerprint. Recording provenance therefore cannot manufacture a new educational identity.

For the retained Slice 2B proof, the historical worker-run ledger is the source of generation-context evidence. The canonical 3B wrapper `runFoundationIndependentReviewWithGenerationEvidence` binds that evidence into the reconstructed Candidate before starting review, so later restart/resume does not depend on remembering an external exclusion set.

### Exact deterministic precondition

Independent review must be bound to deterministic PASS evidence for both:

- the exact current Foundation fingerprint; and
- the exact implementation commit performing the review.

If the candidate has passing deterministic evidence for the fingerprint but not the current reviewed commit, the 3B loop reruns the deterministic engine first. This allows a retained Foundation Candidate to be reviewed under the current released assurance implementation without regenerating content or accepting stale code-level evidence.

### Independent review contract

The review worker receives only the exact Foundation dependency set plus rights-safe structured source metadata and deterministic evidence. An explicit `artifactIndex` supplies each reviewable artifact's exact kind, storage ref and structured value, so a real fresh worker can return valid machine-readable findings without guessing artifact identity.

The persisted `foundation_independent_review_report` contains:

- exact job/candidate;
- exact reviewed commit;
- exact deterministic-assurance evidence reference;
- exact Foundation fingerprint;
- reviewer worker/context/provider/model provenance;
- context IDs excluded from review;
- pass/fail-hold decision; and
- machine-readable findings.

Each finding records severity (`blocking`, `material`, `minor`, `no_issue`), issue type, affected artifact kind/ref, evidence, finding, recommended correction and resolution status.

Blocking or material findings require `fail_hold`. A review with no blocking/material findings passes. Minor findings do not disappear: they are retained in `knownLimitations` for later expert review or a subsequent governed material revision.

### Live provider boundary

`createFoundationIndependentReviewLiveWorkers` uses the existing `FoundationStructuredProviderClient` boundary rather than a new provider stack.

Independent review uses the provider's dedicated `independent_review` route. Its instructions require educational/assessment challenge rather than prose improvement, including conceptual correctness, curriculum sufficiency, depth, misconceptions, assessment authenticity, component fit, command demand, mark/timing realism and Question Family suitability.

Targeted remediation uses the bounded generation route. The worker is given only the exact remediation targets and may not edit Source Rights, Board Alignment or Foundation coverage. It is explicitly told not to calculate SHA fingerprints; material and dependency fingerprints remain compiler/runtime-owned.

Both workers receive only rights-safe structured Foundation evidence and are told not to browse or reconstruct awarding-body prose. The provider transport creates fresh context identities, but the 3B runtime still independently checks returned context IDs against retained provenance before accepting evidence.

### Smallest-safe remediation boundary

Material remediation is restricted to Foundation truth that can be safely replaced inside assurance:

- **Course Truth finding** → remediate Course Truth, rebuild dependent Exam Truth and rebuild/revalidate all Question Families;
- **Exam Truth finding** → remediate Exam Truth and rebuild/revalidate all Question Families;
- **Question Family finding** → remediate only the affected Question Family.

The remediation worker must return exactly the required dependency closure. Missing or unrelated replacements are rejected.

Source Licence Register, Board Alignment and Foundation coverage are deliberately **not** locally rewritten by the assurance remediation worker. A blocking/material finding against one of those upstream authorities blocks the job and requires Foundation compilation to be reopened from governed evidence. This prevents an AI remediation pass from silently changing the course/exam contract it is supposed to review.

### New candidate and deterministic re-assurance

A blocking/material correction must produce materially changed Foundation truth. The loop:

1. persists corrected artifacts;
2. deterministically owns dependency fingerprints rather than asking a model to reproduce SHA values;
3. creates a new candidate ID;
4. resets deterministic assurance and independent review to pending;
5. computes a new aggregate Foundation fingerprint and rejects a material-remediation cycle if the fingerprint did not change;
6. writes a `foundation_remediation_record` retaining source/new fingerprints, worker provenance, finding IDs, correction notes and replacements;
7. reruns deterministic Foundation assurance against the new exact fingerprint/commit; and
8. if deterministic assurance passes, runs a new independent review in another fresh context.

No old review can satisfy the new candidate because lifecycle evidence is fingerprint-bound.

### Remediation cycle limit

The provider-neutral loop defaults to three material remediation cycles. If blocking/material findings remain after that limit, the job blocks rather than iterating indefinitely or weakening the review threshold.

### Regression assurance

`foundation-independent-review.test.ts` covers the high-risk review/remediation controls:

- coherent deterministic precondition + fresh independent review;
- minor findings retained as limitations without material regeneration;
- generation-context reuse blocked as contaminated evidence;
- Course Truth material remediation expands to the exact downstream dependency closure;
- material correction changes the Foundation fingerprint;
- deterministic re-assurance passes on the remediated candidate before re-review;
- a second independent review uses another fresh context and binds to the remediated fingerprint; and
- upstream Board Alignment findings block rather than being silently rewritten during assurance.

`foundation-independent-review-context.test.ts` separately proves that compilation contexts are de-duplicated, persisted into Candidate provenance without changing material Foundation identity, and absent generation-context evidence fails closed.

## Source-rights boundary

The 3B contract follows `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`.

Independent review/remediation receives source-use metadata and Revision-owned/derived structured Foundation truth. It does not gain a new right to ingest or reconstruct protected `REFERENCE_ONLY` awarding-body prose. The provider boundary enforces the same no-browsing/no-reconstruction rule used by the existing structured worker client.

## Explicit non-scope of PR #298

PR #298 does **not**:

- claim a real-course independent-review PASS before the released main-only proof has run;
- substitute a second AI review for qualified subject/assessment expert review;
- create the Slice 3C expert-review package;
- produce `foundation_approved`;
- generate Learn, Practice, assessment items, Exam Prep, mocks or Marking Packs; or
- publish learner content.

## Operational completion condition for Slice 3B

After PR #298 is released to approved `main`, run the retained AQA Business Foundation through the released generation-context binding, deterministic precondition and a genuinely fresh provider review context. Retain the exact review evidence, and if the reviewer finds blocking/material issues, retain every targeted remediation candidate, deterministic re-assurance report and fresh re-review until the exact current Foundation fingerprint passes or the fail-closed cycle limit/upstream-recompilation rule blocks progression.

Only an exact Foundation version with deterministic PASS and independent-review PASS may proceed to Slice 3C qualified expert review. Slice 3C remains separately governed and cannot be inferred from AI review success.

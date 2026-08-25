# Content Factory v2 Increment 1 Implementation

**Status:** In implementation  
**Initiative:** Issue #169 — Content Factory v2  
**Implementation increment:** Schemas + state machine + source-rights guard  
**Canonical runtime / operational entry point:** `/app/` → role-gated Admin / Content Operations → protected `content-factory-intake` Supabase Edge Function  
**Base:** `main` at `a02e8cab9c92cc16e9c50aa419f8ea4f9520d969`

## Purpose

Implement the first material Content Factory v2 slice after Founder-approved `Ready` and the merge of PR #170.

This increment creates the durable machine contracts and lifecycle guards required before source, generation, assessment or review workers can safely be automated.

It does not implement AI workers, automatic source discovery, content generation, expert-review export UI or automated publication.

## Implemented scope

### Versioned job compatibility

New Content Factory jobs are created as `schemaVersion: 2`.

The domain parser continues to accept existing `schemaVersion: 1` job records so historical/current v0.1 jobs remain readable and can follow their existing lifecycle. v2 behaviour is selected from the job schema version rather than silently rewriting v1 semantics.

### Source-rights contracts

Adds machine-readable:

- source-use classes: `OPEN`, `REVISION_OWNED`, `LICENSED`, `REFERENCE_ONLY`, `PROHIBITED`, `UNKNOWN`;
- `SourceLicenceRecord`;
- `SourceLicenceRegister`;
- job-level source-rights status: `pending`, `approved`, `blocked`.

The schema fails closed when:

- `PROHIBITED` or `UNKNOWN` sources claim AI-input or derived-commercial-use permission; or
- `REFERENCE_ONLY` material is marked as permitted for generative-AI input.

A v2 job cannot advance from `identified` to `sourced` until it has a Source Licence Register reference, a source-set fingerprint and `sourceRightsStatus: approved`.

### First-class v2 artifact contracts

Adds versioned Zod contracts for:

- Board Alignment;
- Course Knowledge Model;
- Learning Blueprint;
- Assessment Blueprint;
- Question Family;
- Marking Pack;
- Expert Review Contract.

These are domain contracts only in this increment. Worker implementations that populate them come in later governed increments.

### Marking Pack coverage

The job records:

- markable assessment item IDs; and
- the Marking Pack reference covering each item.

Duplicate coverage is rejected and `expert_review_packaging` cannot proceed while a markable item lacks a Marking Pack.

### v2 lifecycle

The v2 lifecycle is implemented as:

```text
requested
→ identified
→ sourced
→ mapped
→ generating
→ validating
→ independent_review
→ remediation (when required)
→ expert_review_packaging
→ expert_review_ready
→ human_review
→ remediation (when expert findings require it)
→ benchmark_approved
→ ci_verification
→ ready_for_founder_merge_approval
→ merged
→ deployment_verification
→ pilot_live
```

The existing v1 lifecycle remains available only to v1 job records.

### `expert_review_ready` guards

Before a v2 job can enter expert-review packaging/readiness, the domain layer requires machine evidence for:

- approved source rights;
- complete intended coverage;
- Board Alignment;
- Course Knowledge Model;
- Learning Blueprint;
- Assessment Blueprint;
- Question Families when markable items exist;
- Marking Pack coverage for every markable item;
- artifact compatibility validation;
- green deterministic validation tied to an exact commit;
- independent fresh-context review of that exact validated commit;
- no unresolved blocking/material independent-review findings;
- a complete expert-review package and review-contract reference tied to the exact reviewed commit.

`expert_review_ready` remains distinct from qualified human approval and benchmark approval.

### Expert remediation and publication order

For v2, qualified expert review occurs before benchmark/publication CI.

A passed human review must identify the exact packaged commit before the job can become `benchmark_approved`. Conditional/failing expert review with unresolved material/blocking findings may reopen remediation and revalidation.

Publication CI must then cover the final expert-reviewed commit before Founder merge approval can be recorded.

## Canonical intake effect

The existing protected `content-factory-intake` Edge Function remains the canonical Founder-facing job-creation boundary. It now creates v2 job payloads with explicit initial rights, coverage, artifact-compatibility and Marking Pack tracking states.

There is no new route, duplicate Admin application or learner-facing surface in this increment.

## Backwards compatibility

The issue envelope marker remains `revision-content-factory-job:v1`; that marker identifies the durable GitHub Issue payload format and is independent of the job-domain `schemaVersion`.

Existing schema-v1 job JSON remains parseable. New jobs use schema v2.

## Assurance

The Content Factory unit suite is extended to cover:

- default v2 job creation;
- v1 migration compatibility;
- source-rights fail-closed behaviour;
- Source Licence Register duplicate detection;
- source-rights transition gating;
- independent generation/review context separation;
- prevention of v2 direct publication before expert review;
- complete artifact / Marking Pack requirements;
- exact-version expert package linkage;
- qualified-expert benchmark gate;
- expert remediation loop;
- final reviewed-commit CI linkage;
- Founder merge approval;
- deployment/merged-commit linkage;
- blocker/resume behaviour;
- GitHub Issue round-trip for a v2 job.

Repository CI remains the final exact-head assurance gate for the PR.

## Security / trust impact

No new secret or browser credential path is introduced.

The change strengthens trust by making source-use permission an enforceable domain prerequisite for v2 jobs rather than a documentary convention.

## Documentation impact

This record documents the first implementation increment. The existing v2 implementation plan and Content Factory authority remain governing design sources; no authority change is introduced by this PR.

Future increments must update implementation documentation as source workers, generation workers, deterministic validators, expert handoff and Admin status become real implementation.

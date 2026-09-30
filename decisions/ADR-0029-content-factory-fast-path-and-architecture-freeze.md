# ADR-0029 — Content Factory fast path and architecture freeze

**Status:** Accepted — approved by the Founder, 30 September 2026  
**Date:** 30 September 2026  
**Decision owner:** Founder  
**Applies to:** every Content Factory course, starting with AQA A-level Business 7132 (2027)  
**Authority:** `80-company-workflows/Content Factory Fast-Path Process.md`

## Context

ADR-0028 established the Subject Knowledge Foundation and exact-course projection. That architecture reached the T8 exact-course gate within three days of adoption and is sound.

The process around it is not. Business Subject Foundation work ran through v0.3–v0.8 review and remediation rounds, most driven by weak-citation findings rather than wrong teaching. Open-ended AI review, an unbounded number of rounds, a new foundation version per remediation and whole-run failure on single AI-call errors meant no student-ready content was produced.

## Decision

1. **Freeze the ADR-0028 architecture.** The pipeline is Subject Knowledge Foundation → Specification Mapping → Course Truth + Exam Truth → exact-course gate → Learning Blueprint → Learn + Practice → exam questions → mocks → release. It changes only when a named check has failed because of the architecture.
2. **Adopt `80-company-workflows/Content Factory Fast-Path Process.md` as the governing operating process for the Content Factory.** Where it conflicts with earlier Content Factory standards or amendments on the points below, the fast-path process wins.

## What the fast-path process replaces

| Topic | Replaced by the fast-path process |
| --- | --- |
| Review loops | AI reviewers answer the fixed checklist for their stage and each finding must name the check it failed. Open-ended "find any problems" review is withdrawn. Software checks run before any AI review. |
| What blocks | Only wrong teaching, a missing examinable item, or a broken question or mark scheme blocks. Weak citations, opinion/style and out-of-scope findings are logged and fixed in batches. A "material" finding without a named failed check (and, for accuracy, a contradicting source) is logged, not actioned. |
| Round limits | At most two review rounds per item. An issue still disputed after round two goes to the Founder escalation list and does not re-enter the loop once decided. |
| Remediation versioning | A single fix does not require a new standard, amendment, ADR or remediation document. It is one line in `content-factory/RUN_LOG.md`. Fixes recheck only the changed item and its dependants; nothing with unchanged inputs is regenerated or re-reviewed. |
| Failure handling | A failed AI call is retried up to three times, then that one item is marked `failed` and the run continues. Runs resume from saved fingerprints. Every run ends with one list: passed, fixed, logged, escalated, failed. |

This affects, in particular, the remediation, revalidation and gate-semantics sections of `80-company-workflows/Content Accuracy Assurance Gate.md`, `80-company-workflows/Content Factory Subject Knowledge Foundation and Course Projection Amendment.md` and `docs/technical/Content Factory AQA Exact-Course Assurance.md`. Those documents are not rewritten; this ADR records the precedence.

## What is kept unchanged

- **Source rights and provenance.** `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md` and Gate 0 of the Content Accuracy Assurance Gate apply in full. AQA material stays `REFERENCE_ONLY`: it establishes requirements and assessment structure, is never teaching copy, and past-paper questions are never paraphrased.
- **Founder merge approval.** Every merge into `main` needs explicit Founder approval for that specific PR (`AUTHORITY_HIERARCHY.md`).
- **Approval and publication boundaries.** `ai_assured` still does not mean `foundation_approved` or learner-publication eligibility (ADR-0024).
- **Historical evidence.** Earlier reviews, reassurance runs and proofs remain true as evidence and are not rewritten.

## Consequences

Positive:

- review effort goes to errors that would mislead a student or leave something examinable untaught;
- disputes end in a Founder decision instead of another round;
- one bad item or AI call cannot stop a whole course run;
- fewer process documents; fixes are traceable in one run log.

Costs and risks:

- some genuine weaknesses will ship as logged rather than fixed; confidence labels and reduced product claims (see the process document) manage this;
- the assurance scripts do not yet enforce these rules; until they do, operators apply them manually (plan step 3);
- more decisions reach the Founder via the escalation list.

## Relationship to existing decisions

ADR-0028 remains the architecture and is now frozen. ADR-0020, ADR-0024 and ADR-0027 remain valid except where their review, remediation or failure-handling rules conflict with the table above.

## Documentation impact

Adds `80-company-workflows/Content Factory Fast-Path Process.md`, root `CLAUDE.md` and `content-factory/RUN_LOG.md`, and pointers in `INDEX.md`. No other standard is amended.

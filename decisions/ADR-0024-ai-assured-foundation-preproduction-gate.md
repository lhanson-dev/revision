# ADR-0024 — AI-Assured Foundation Pre-Production Gate

**Status:** Proposed
**Date:** 2026-09-17
**Decision owner:** Founder

## Context

The Foundation-first Content Factory originally prohibited learner-asset generation until qualified-human Foundation approval. The AQA 7132 proof programme has since established a substantial machine/AI assurance chain: deterministic assurance, fresh-context independent review/remediation and a genuinely fresh external-source challenge, all bound to an exact Foundation fingerprint.

Keeping qualified-human review as a prerequisite to any downstream asset generation makes the human gate a serial development dependency even where the Candidate has no unresolved blocking or material AI-assurance finding. Treating AI PASS as final Foundation approval would create the opposite problem: it would erase the deliberate distinction between machine assurance and qualified-human educational approval.

## Decision

Introduce `ai_assured` as an intermediate Foundation lifecycle state.

An exact Candidate may enter `ai_assured` only after the complete governed deterministic, independent-review and external-source-challenge chain passes with no unresolved blocking/material finding.

`ai_assured` permits controlled internal/pre-production Learn, Practice and Exam Prep derivation and their internal assurance. It does not create an Approved Course Foundation and does not permit learner publication.

Qualified-human subject/assessment approval remains required for `foundation_approved`. Assets produced from an AI-assured Candidate are fingerprint-bound and release-ineligible until that exact fingerprint is approved.

If human review causes a material Foundation change, the new fingerprint invalidates affected pre-production assets. They must be regenerated/re-derived and re-assured. If human review approves the exact fingerprint unchanged, otherwise-valid asset assurance does not need to be repeated solely because the human gate completed.

`fail_hold` is reserved for blocking/material defects or unresolved uncertainty that makes progression unsafe. Human review being pending is a lifecycle condition, not a defect.

## Consequences

The system can develop and assure downstream course assets before the qualified-human batch review completes, reducing serial lead time while preserving the human trust boundary before learner publication.

Runtime lifecycle/schema/orchestration and tests must distinguish `ai_assured`, `expert_review` and `foundation_approved`. Asset records must carry exact Foundation fingerprints and publication eligibility must fail closed unless the dependency is `foundation_approved`.

Historical proof and review records are not rewritten.

## Alternatives rejected

**Keep human approval before all asset generation.** Safe but unnecessarily serial once the full AI assurance chain has passed.

**Treat AI PASS as Approved Course Foundation.** Rejected because it would misrepresent the assurance source and weaken the established qualified-human approval semantics.

**Allow learner preview from AI assurance alone.** Rejected. Any learner-facing exposure remains behind the qualified-human Foundation approval and applicable asset release controls.

## Documentation impact

Updates the active Foundation/Asset Production Model and requires corresponding technical lifecycle, schema, orchestration and test changes. The existing expert-review contract remains authoritative for the qualified-human gate but must describe AI assurance as a preceding production-start state rather than a prerequisite that prohibits all asset generation.
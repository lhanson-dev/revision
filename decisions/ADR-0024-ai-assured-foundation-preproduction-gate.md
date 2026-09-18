# ADR-0024 — AI-Assured Foundation Pre-Production Gate

**Status:** Accepted — Founder-approved via PR #343  
**Decision date:** 2026-09-18  
**Decision owner:** Founder

## Context

The Foundation-first Content Factory prohibited learner-asset generation until qualified-human Foundation approval. The AQA 7132 proof programme established a substantial machine/AI assurance chain: deterministic assurance, fresh-context independent review/remediation and a genuinely fresh external-source challenge, all bound to an exact Foundation fingerprint.

Keeping qualified-human review as a prerequisite to any downstream asset generation makes the human gate a serial development dependency even where the Candidate has no unresolved blocking or material AI-assurance finding. Treating AI PASS as final Foundation approval would instead erase the deliberate distinction between machine assurance and qualified-human educational approval.

## Decision

Introduce `ai_assured` as an intermediate Foundation lifecycle state. An exact Candidate may enter it only after the complete governed deterministic, independent-review and external-source-challenge chain passes with no unresolved blocking/material finding.

`ai_assured` permits controlled internal/pre-production Learn, Practice and Exam Prep derivation and internal assurance. It does not create an Approved Course Foundation and does not permit learner publication.

Qualified-human subject/assessment approval remains required for `foundation_approved`. Assets produced from an AI-assured Candidate are fingerprint-bound and release-ineligible until that exact fingerprint is approved.

If human review causes a material Foundation change, the new fingerprint invalidates affected pre-production assets for release; they must be regenerated/re-derived and re-assured. If human review approves the exact fingerprint unchanged, otherwise-valid asset assurance does not need to be repeated solely because the human gate completed.

`fail_hold` is reserved for blocking/material defects or unresolved uncertainty that makes progression unsafe. Human review being pending is a lifecycle condition, not a defect.

## Consequences

The system can develop and assure downstream course assets before qualified-human batch review completes while preserving the human trust boundary before learner publication. Runtime lifecycle/schema/orchestration and tests must distinguish `ai_assured`, `expert_review` and `foundation_approved`; asset records must carry exact Foundation fingerprints; publication eligibility must fail closed unless the dependency is `foundation_approved`.

Historical proof and review records are not rewritten.

## Alternatives rejected

**Keep human approval before all asset generation.** Preserves the previous model but unnecessarily serializes internal development after the complete AI assurance chain passes.

**Treat AI PASS as Approved Course Foundation.** Rejected because it would misrepresent the assurance source and weaken qualified-human approval semantics.

**Allow learner preview from AI assurance alone.** Rejected. Learner-facing exposure remains behind qualified-human Foundation approval and applicable asset release controls.

## Documentation impact

The targeted normative amendment is `80-company-workflows/Content Factory AI-Assured Foundation Gate Amendment.md`. The existing Foundation/Asset Production Model and historical technical records are preserved rather than rewritten. `docs/technical/Content Factory AI-Assured Foundation Gate.md` defines the current implementation contract; runtime/schema/orchestration/test implementation is governed separately from this historical decision record.
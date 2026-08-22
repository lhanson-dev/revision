# ADR-0015 — Second governed release-lineage recovery checkpoint

Status: Proposed — requires Founder approval with this recovery PR
Date: 2026-08-21

## Context

Revision's release verifier requires the exact machine-readable Founder approval marker:

```text
revision-founder-approval:v1
head_sha: <40-character exact PR head SHA>
```

PR #105 had genuine pre-merge Founder approval recorded for exact head `f6aa2d98b136f899b8d15c9424064058ce1f8bf8`, but the executing flow persisted a prose approval-record comment rather than the required marker. Its merge commit `468f4262e14dd3769965a52ac9cd6d4df913d754` therefore cannot be re-proven under the release verifier without rewriting historical evidence.

PR #107 subsequently followed the corrected current merge process itself, but production run `32534598367` failed closed while traversing the PR #105 ancestor. PR #107 merge commit `d2534774344677013777a31a2a82bedb8919a7fe` now has durable `revision/path-to-live = failure` and is the exact current pre-remediation `main` commit.

The previous ADR-0013 checkpoint explicitly prohibited routine bootstrap advancement. It also stated that any future reset requires a new explicit governed recovery decision with recorded rationale and Founder approval. This ADR is that new decision record.

## Decision

Use the existing bootstrap-parent mechanism a second time, explicitly and exceptionally, to re-establish prospective governed release lineage from the exact current pre-remediation `main` commit:

`d2534774344677013777a31a2a82bedb8919a7fe`

The recovery PR itself must still satisfy every current control:

1. exact-head Revision CI must complete successfully;
2. the Founder must explicitly approve the specific recovery PR merge;
3. the executing agent must add the exact two-line `revision-founder-approval:v1` marker for that head;
4. the marker must be re-read and verified before merge;
5. the PR head must remain unchanged;
6. only that exact head may merge;
7. governed release lineage must pass using this ADR's bootstrap parent;
8. backend readiness, production build, Pages deployment and production smoke must pass; and
9. durable `revision/path-to-live = success` must be published before the recovery is considered complete.

## Historical evidence rule

Do not edit, replace or reinterpret PR #105's pre-merge prose comment as though it were the machine-readable marker. Do not add a retrospective marker to make the old merge appear compliant.

PR #105 and PR #107 keep their historical path-to-live evidence. The recovery PR establishes a new prospective trust root; it does not manufacture historical compliance.

## Control hardening

The AI Agent Constitution and AI Coding & Repository Rules are hardened in the same recovery PR to make explicit that:

- the verifier's exact marker format is mandatory;
- equivalent prose is not equivalent machine-readable evidence;
- a prose approval-record comment must not be converted into a compliant marker after merge; and
- the marker must be re-read before merge.

## Guardrail

This checkpoint is not permission to advance the bootstrap parent whenever lineage fails. Any future reset must again be treated as a new governance incident with its own evidence, rationale, decision record and explicit Founder-approved recovery PR.

If repeated malformed-marker incidents continue after this hardening, Revision should prioritise a technically enforced pre-merge approval-status mechanism rather than relying on further procedural wording.

## Consequences

- Revision can restore a truthful production path without rewriting PR #105 history.
- PR #107's B1 interface foundation can reach production only as part of the subsequently governed recovery deployment.
- The recurrence remains visible in the Defect Register and audit history.
- The release process remains fail-closed for future malformed or missing approval evidence.

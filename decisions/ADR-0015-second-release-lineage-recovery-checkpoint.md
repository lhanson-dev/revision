# ADR-0015 — Second governed release-lineage recovery checkpoint

Status: Accepted — Founder approved via PR #109 on 2026-08-22
Date: 2026-08-21

## Context

Revision's release verifier requires the exact machine-readable Founder approval marker:

```text
revision-founder-approval:v1
head_sha: <40-character exact PR head SHA>
```

PR #105 had genuine pre-merge Founder approval recorded for exact head `f6aa2d98b136f899b8d15c9424064058ce1f8bf8`, but the executing flow persisted a prose approval-record comment rather than the required marker. Its merge commit `468f4262e14dd3769965a52ac9cd6d4df913d754` therefore cannot be re-proven under the release verifier without rewriting historical evidence.

PR #107 subsequently followed the corrected current merge process itself, but production run `32534598367` failed closed while traversing the PR #105 ancestor. PR #107 merge commit `d2534774344677013777a31a2a82bedb8919a7fe` received durable `revision/path-to-live = failure` and became the exact pre-remediation `main` commit.

The previous ADR-0013 checkpoint explicitly prohibited routine bootstrap advancement. It also stated that any future reset requires a new explicit governed recovery decision with recorded rationale and Founder approval. This ADR is that new decision record.

## Decision

Use the existing bootstrap-parent mechanism a second time, explicitly and exceptionally, to re-establish prospective governed release lineage from the exact pre-remediation `main` commit:

`d2534774344677013777a31a2a82bedb8919a7fe`

The recovery PR itself had to satisfy every current control:

1. exact-head Revision CI completed successfully;
2. the Founder explicitly approved the specific recovery PR merge;
3. the executing agent added the exact two-line `revision-founder-approval:v1` marker for that head;
4. the marker was re-read and verified before merge;
5. the PR head remained unchanged;
6. only that exact head merged;
7. governed release lineage passed using this ADR's bootstrap parent;
8. backend readiness, production build, Pages deployment and production smoke passed; and
9. durable `revision/path-to-live = success` was published before the recovery was considered complete.

## Historical evidence rule

Do not edit, replace or reinterpret PR #105's pre-merge prose comment as though it were the machine-readable marker. Do not add a retrospective marker to make the old merge appear compliant.

PR #105 and PR #107 keep their historical path-to-live evidence. The recovery PR establishes a new prospective trust root; it does not manufacture historical compliance.

## Control hardening

The AI Agent Constitution and AI Coding & Repository Rules were hardened in the same recovery PR to make explicit that:

- the verifier's exact marker format is mandatory;
- equivalent prose is not equivalent machine-readable evidence;
- a prose approval-record comment must not be converted into a compliant marker after merge; and
- the marker must be re-read before merge.

## Outcome

PR #109 exact head `3c775eafc4a837a7ad2f712176d39816cf11d886` passed Revision CI #634. The Founder then approved PR #109, machine-readable approval comment `5376828120` was persisted and verified, and the exact head merged as `acfaaf59abce40c03a2f8cd1313bfc90e7b93577`.

Production run `32541072920` completed successfully across governed release lineage, production backend readiness, build, GitHub Pages deployment, production smoke and durable `revision/path-to-live = success`. The second recovery checkpoint therefore restored the prospective governed production chain without rewriting PR #105 history.

## Guardrail

This checkpoint is not permission to advance the bootstrap parent whenever lineage fails. Any future reset must again be treated as a new governance incident with its own evidence, rationale, decision record and explicit Founder-approved recovery PR.

If repeated malformed-marker incidents continue after this hardening, Revision should prioritise a technically enforced pre-merge approval-status mechanism rather than relying on further procedural wording.

## Consequences

- Revision restored a truthful production path without rewriting PR #105 history.
- PR #107's B1 interface foundation reached production through the subsequently governed recovery deployment.
- The recurrence remains visible in the Defect Register and audit history, with DEF-2026-005 closed only on production evidence.
- The release process remains fail-closed for future malformed or missing approval evidence.

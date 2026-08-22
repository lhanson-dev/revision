# Path-to-Live Approval Marker Recurrence — 21 August 2026

**Status:** Point-in-time operational evidence  
**Date:** 2026-08-21  
**Scope:** PR #105 approval-evidence handoff, PR #107 production release failure, release-lineage recovery requirement

## Executive finding

Revision's production release verifier failed closed on PR #107 because its first-parent ancestry includes PR #105 merge commit `468f4262e14dd3769965a52ac9cd6d4df913d754`, whose exact-head Founder approval was recorded in GitHub using prose rather than the required machine-readable marker.

PR #107 itself followed the current governed sequence correctly:

- exact head `4aa9e407b3853b84095312c0f6d02f8f0fe1a3ae`;
- Revision CI #630 completed successfully;
- explicit Founder approval for PR #107;
- exact machine-readable marker persisted and re-read before merge;
- merge commit `d2534774344677013777a31a2a82bedb8919a7fe`.

Production run `32534598367` then failed at **Governed release lineage** before backend readiness, build, deploy or production smoke.

## PR #105 evidence

PR #105 head was:

`f6aa2d98b136f899b8d15c9424064058ce1f8bf8`

Its merge commit was:

`468f4262e14dd3769965a52ac9cd6d4df913d754`

Before merge, GitHub issue comment `5375594982` was created at `2026-08-21T21:27:09Z`. It records explicit Founder approval for the exact PR/head, but its body is prose beginning:

`Founder approval recorded for merge of PR #105...`

The required release-verifier contract was instead exactly:

```text
revision-founder-approval:v1
head_sha: f6aa2d98b136f899b8d15c9424064058ce1f8bf8
```

The historical PR #105 comment must not be edited or converted retrospectively. Doing so would rewrite historical evidence and create the appearance that the required machine-readable handoff occurred before merge when it did not.

## PR #107 release evidence

PR #107 merged as:

`d2534774344677013777a31a2a82bedb8919a7fe`

Pages run:

`32534598367`

The lineage verifier reported:

`Previous main commit 468f4262e14dd3769965a52ac9cd6d4df913d754 has revision/path-to-live=failure and cannot be proven as a governed merge: PR #105 has no Founder approval marker by lhanson-dev for exact head f6aa2d98b136f899b8d15c9424064058ce1f8bf8.`

As designed:

- governed lineage failed;
- production backend readiness was skipped;
- production build was skipped;
- Pages deployment was skipped;
- production smoke was skipped; and
- durable `revision/path-to-live = failure` was published for PR #107's merge commit.

The older safe production deployment therefore remained in service.

## Classification

This is a **P1 path-to-live / approval-evidence handoff defect**, not an unauthorised Founder merge:

- evidence exists that Founder approval was recorded for PR #105 before merge;
- the approval handoff used the wrong GitHub comment format;
- production failed closed rather than publishing an unverifiable chain; and
- an older safe deployment remained available.

The incident is recorded as `DEF-2026-005` until the recovery PR completes governed lineage, backend readiness, deployment, production smoke and durable path-to-live success.

## Root cause

The repository rules already required the machine-readable marker, but the executing PR #105 flow treated a prose approval-record comment as equivalent evidence. The control was therefore semantically understood but not executed to the verifier's exact contract.

## Recovery decision required

Historical approval evidence will not be edited or backfilled.

A new governed recovery PR will:

1. record this incident and defect;
2. harden the AI merge rules so prose approval records are explicitly non-equivalent to the exact marker;
3. deliberately set the release bootstrap parent to the exact pre-remediation `main` commit `d2534774344677013777a31a2a82bedb8919a7fe`;
4. require its own exact-head Revision CI success;
5. require explicit Founder approval for that recovery PR;
6. persist and verify the exact two-line machine-readable marker before merge; and
7. close the defect only after production deploy, smoke and durable `revision/path-to-live = success` are proven.

## Historical integrity

This review does not modify PR #105's historical comment or PR #107's failed release status. The recovery checkpoint is a prospective trust-root decision, not retrospective evidence manufacture.

# LF-03 #787 — trusted PR #803 Issues and Debates independent A3 reviewer

**Status (3 November 2026): REVIEWER INFRASTRUCTURE DRAFT, not merged, not installed; not an educational pass.**

## Scope and approved source

This narrowly scoped review workflow applies only to [learner-content PR #803](https://github.com/lhanson-dev/revision/pull/803), original AQA Psychology 7182 v1.4 §4.3.1 (Issues and Debates, printed pp21–22), exact Founder-supplied source PDF SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`, **REFERENCE_ONLY**. It reviews the original candidate source `content/psychology/aqa-a-level/shared/issues-debates-mcq-v2.ts`, only `PSY-08-01` and `PSY-08-04`, separately from #787's unreviewed remaining bank. It does not execute code from unmerged branches with secrets.

## Trigger and trusted execution

**Only after this separate infrastructure PR is Founder-approved and merged onto approved `main`**, the Founder-owner may add this exact comment to *open* content PR #803:

```text
revision-run-lf03-pr803-issues-debates-independent-a3:v1
head_sha: <exact 40-character PR803 head SHA>
```

The trigger is **not approval to merge content PR #803**. GitHub authenticates OWNER identity and exact PR number. The workflow checks out approved `main` only and verifies its actual SHA; reads the specific candidate PR and its exact HEAD; downloads and SHA-1-blob-verifies only allowlisted TypeScript question text as inert data; structurally parses exactly two static `multipleChoiceQuestionSchema.parse` literals; rejects dynamic code, changed IDs/targets, out-of-range keys and missing feedback before provider spend. Two independent provider requests use separate fresh contexts: blinded answer/key and distractor/source challenge first, *then* critique of authored feedback without revising the blind choice. Material errors, incorrect keys, reviewer omissions and source ambiguity fail closed. `store=false`, bounded $0.50 estimated reserve and 30-day retained per-head receipt.

## Limitations, approvals and documentation

A future A3 pass is **AI** independent review for two one-mark decisions only; not an approved examiner moderation, verified learner performance, written AO3 assessment, optional-topic acceptance, course syllabus completeness or release evidence. Content PR #803 still requires exact-head CI, authenticated learner Practice scoring/persistence, fresh main integration, its own explicit Founder merge approval, then production verification. This reviewer infrastructure has no student-facing UI, scoring, saved data, new practice system or database effect. No normative authority amendment; this technical note and INDEX update accompany the reviewer. The original LF-03 dated audit is unchanged.

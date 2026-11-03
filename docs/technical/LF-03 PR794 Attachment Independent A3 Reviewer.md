# LF-03 / #787 — trusted independent Attachment A3 reviewer for PR #794

**Status (3 November 2026): DRAFT reviewer infrastructure — not merged, not installed, not an educational PASS.**

## Exact scope and reference
This approved-main-only reviewer is hard-bound to original Psychology Attachment candidate [PR #794](https://github.com/lhanson-dev/revision/pull/794), exact `PSY-03-04/05` V2 questions in `content/psychology/aqa-a-level/shared/attachment-mcq-v2.ts`, and the official Founder-supplied AQA Psychology 7182 v1.4 (1 September 2025) §4.1.3 printed p18 (SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`). AQA is **REFERENCE_ONLY**. The reviewer sees an independently authored bounded syllabus summary, not protected PDF prose.

## Trigger, isolation and decision
The separately Founder-approved reviewer PR must merge before an independent model call can occur. The configured GitHub Founder OWNER can trigger the trusted reviewer with this exact PR #794 comment:

```text
revision-run-lf03-pr794-attachment-independent-a3:v1
head_sha: <exact 40-character PR794 head SHA>
```

This is **not approval to merge #794**. The trusted `main` workflow checks owner identity, PR number, exact open candidate head, main runner SHA, allowlisted static TypeScript question source and its independently verified Git blob; no unmerged PR code runs with the provider key. A first isolated fresh model context blindly chooses two answers without authored keys/explanations and challenges four-option ambiguity, scope, clueing and distractors. A separate fresh context inspects the authored explanations and frozen independent answers. Any key mismatch or material educational finding fails closed. `store=false` provider requests, a conservative USD $0.50 preflight spending cap and a 30-day exact-head GitHub Actions review receipt apply.

## Limits / documentation impact
A positive A3 receipt would establish only bounded **AI** educational challenge of two one-mark selected decisions. It cannot prove Attachment syllabus completeness, the remaining three repeated-question quality, written AO2/AO3, qualified psychology examiner sign-off, authentic learner usefulness or production release. #794 still needs its own current-main CI, browser/restart and evidence-preservation tests and separate Founder merge approval. This reviewer PR changes no student-facing feature, grading, schema, real learner data or normative governance. Original historical LF-03 audits and previous Memory/Social Influence reviews are preserved; track #698 and #787.

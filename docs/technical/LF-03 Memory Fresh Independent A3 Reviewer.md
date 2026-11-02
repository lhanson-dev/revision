# LF-03 #787 — trusted independent A3 reviewer for draft PR #788 Memory questions

**Status:** Review infrastructure candidate, **not merged, not executed, not educational A3 approval**. This workflow is independent from Memory content PR #788 and applies only to that PR's four exact `psy-psy0201-check-v2` … `psy-psy0204-check-v2` items.

## Governing boundary and implementation

- Implements the active Content Accuracy Assurance Gate's A3 checks for the official Founder-supplied **AQA Psychology 7182 v1.4 §4.1.2 Memory** (printed p17; original PDF SHA `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`), `REFERENCE_ONLY`. It does not copy or transmit protected AQA PDF prose or mark schemes. Reviewer receives bounded curriculum-scope summaries and independently original candidate questions only.
- A reviewer script on **approved `main`** checks an owner-authenticated issue comment on **PR #788** with exactly:
  
  ```text
  revision-run-lf03-pr788-memory-independent-a3:v1
  head_sha: <exact 40-character open PR #788 head>
  ```
  
  This trigger is an **assessment request, never merge approval**.
- Runner validates open same-repo PR target, head SHA, exact trusted main SHA, allowlisted source path `content/psychology/aqa-a-level/shared/memory-mcq-v2.ts`, Git blob SHA and exactly four literal original question bodies. No code is checked out from or executed from the unmerged candidate under the provider key.
- First isolated fresh-context model gets ONLY each question ID, original stem, four options, and parent syllabus requirement—not authored key or explanation. It selects one independent 0–3 answer and adversarially challenges distractors, ambiguities, misalignments and answer patterns. Any key disagreement/material risk rejects A3. Second separate fresh context inspects the full authored key/feedback and the already locked independent answers for misleading explanations, alternative keys or misconception errors. All four must pass both contexts.
- Provider call uses `store=false`; trusted operator workflow only, a conservative **USD $0.50** preflight reserve, read-only GitHub scope and 30-day retained receipt artifact containing runner/head/file SHA, each blind answer and feedback judgement. Prompt/content is inert untrusted data; never instructions.
- Contract tests assert Founder identity, PR number, literal allowed source, fail-close on wrong answer/material fault or missing critique. CI must pass on this infrastructure PR prior to its **separate Founder-approved merge**.
- The A3 review cannot run until this reviewer workflow is approved and merged. If candidate Memory questions change afterward, rerun fresh A3 against the exact new file/head.

## Honest limits

An independent AI A3 PASS is not examiner moderation, direct model review of Founder PDF, proof that all §4.1.2 skills are covered, live browser or genuine student acceptance. Those remain separate from correct-answer validity and must not be reported as complete. The original V1 Memory questions are kept as immutable saved evidence and checkpoint-only compatibility; the source correction is on PR #788, not this reviewer tooling PR.

## Documentation impact

This is governed, read-only assurance infrastructure with no learner, evidence-schema, auth or normative change. The operating proof and exact trigger contract are indexed here; no historical source audit is rewritten. Follow up with #787, #698, #765, and content PR #788 after the independent receipt exists.

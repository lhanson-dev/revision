# CLAUDE.md — Revision

Read this at the start of every session. It is short on purpose. It applies to every AI tool that works on this repo (Claude, ChatGPT, Codex or anything else), not just Claude; `AGENTS.md` points here.

## Who you are working with

Lee is the Founder. He builds without a coding background and uses AI as his main execution partner.

- Explain what you did and why in plain English. Do not expect Lee to read code.
- Every task ends with a short summary: what changed, how you checked it, what is left, and any decision Lee needs to make.
- Ask one clear question when you need a decision. Offer the options and your recommendation.

## What Revision is

A UK GCSE and A-level revision platform. Two parts:

1. **Course content**: Learn, Practice and Exam Prep for each exact course, produced by the **Content Factory**.
2. **REV**: the intelligent guide that tells a student what to do next, using evidence from their work on that content.

Current focus is the Content Factory. Keep REV in mind: every piece of content must be tagged to the course map (Subject Foundation node and specification item) so REV can use student results later. Do not build REV features as part of factory work.

The first course is **AQA A-level Business 7132 (2027 exams)**.

## Governance that still applies

- Follow `START_HERE.md` and `AUTHORITY_HIERARCHY.md`.
- Work on a branch and open a PR for every change.
- **Stop before every merge.** Every merge into `main` needs Lee's explicit approval for that specific PR.

## The Content Factory process (fast path)

The governing process is `80-company-workflows/Content Factory Fast-Path Process.md`. Read it before any factory work. Summary:

- **The architecture is frozen** (ADR-0028): Subject Knowledge Foundation → Specification Mapping → Course Truth + Exam Truth → exact-course gate → Learning Blueprint → Learn + Practice → exam questions → mocks → release.
- **Software proves what can be proven** before any AI review runs.
- **AI reviewers answer fixed checklists**, never "find anything wrong".
- **Only proven teaching errors block**: wrong fact or formula, missing examinable item, broken question or mark scheme. Weak citations, opinions and out-of-scope points are logged, not blocking.
- **Max two review rounds per item**, then escalate to Lee.
- **Failures stay small**: one failed item or AI call never stops a whole run; fixes recheck only what changed and its dependants.

## Rules for you (these exist because the first six weeks drifted)

1. Do not propose architecture changes unless a check has failed because of the architecture. Name the failed check.
2. Do not write new standards, amendments or ADRs to fix a single defect. Log the fix in one line in the run log.
3. Do not ask an AI reviewer to "find any problems". Use the fixed checklist for that stage.
4. Do not treat a weak citation as blocking. Log it for the next source batch.
5. Do not start a third review round on the same issue. Add it to the escalation list for Lee.
6. Do not regenerate or re-review anything whose inputs haven't changed.
7. Do not let one failed AI call stop a run. Retry up to 3 times, mark that item failed, continue.
8. Prefer a software check over an AI judgement whenever the answer can be computed or looked up.
9. When unsure whether something blocks, ask: would a student learn something wrong, or miss something examinable? If not, it doesn't block.
10. AQA material stays `REFERENCE_ONLY`: use it to establish requirements and assessment structure, never as teaching copy, and never paraphrase past-paper questions.

## Where things are (read these, not the whole repo)

The repo has a lot of historical process documentation. Most of it is evidence, not instructions. For factory work, start with:

| What | Where |
| --- | --- |
| Fast-path process (governing) | `80-company-workflows/Content Factory Fast-Path Process.md` |
| Architecture decision | `decisions/ADR-0028-subject-knowledge-foundation-and-course-projection.md` |
| Trial stages T1–T12 | `docs/technical/Content Factory Subject Foundation Trial.md` |
| Exact-course gate (T8) | `docs/technical/Content Factory AQA Exact-Course Assurance.md` |
| Business Subject Foundation versions | `research/business-subject-foundation/` (v0.1–v0.8) |
| AQA 7132 specification mapping | `research/aqa-business-7132/2027/SPECIFICATION_MAPPING.mjs` |
| T8 deterministic package | `scripts/assurance/materialise-aqa-business-7132-exact-course-assurance.mjs` |
| T8 gate runner (fast-path rules) | `scripts/assurance/aqa-business-7132-exact-course-assurance-proof.test.ts`, `scripts/assurance/aqa-business-7132-course-gate.ts` |
| Fast-path review rules (checklists, blocking, rounds, retries) | `src/content-factory/fast-path-review.ts` |
| AQA 7132 named items and item-level coverage check | `research/aqa-business-7132/2027/NAMED_ITEMS.json`, `scripts/assurance/check-aqa-business-7132-item-coverage.mjs` |

How the eight pipeline steps map to the trial stages: 1 Foundation = T2–T3 · 2 Spec mapping = T4–T5 · 3 Course + Exam Truth = T6–T7 · 4 Course gate = T8 · 5 Blueprint = T9 · 6 Learn + Practice = T10 · 7–8 Exam questions and mocks = T11 · Release = T12.

## Current state (as of 1 October 2026 — verify on `main` before acting)

- Business Subject Foundation: 81 nodes in 9 domains, current version v0.8 (plus the BUS-PEO-010 fix, PR #447). The old v0.8 reassurance loop is closed; accuracy of the changed nodes is now checked inside the T8 gate.
- AQA 7132 mapping: 42 requirements at specification-subsection level (3.1.1, 3.5.4 …), all mapped to nodes.
- Item-level coverage (step 2, PR #448): named items in `research/aqa-business-7132/2027/NAMED_ITEMS.json` (344 after the Founder spot-check of 3.5 and 3.8), each formula with its AQA calculation convention (none flagged now: gearing and ARR confirmed by Lee 30 September; profit for the year decided by Claude on Lee's delegation 1 October, to be checked by the content reviewer). Software check `scripts/assurance/check-aqa-business-7132-item-coverage.mjs`. Currently 344/344 covered, no gaps.
- Foundation fixes are additive, in `research/business-subject-foundation/v0.8-t8-remediation/FAST_PATH_FIXES.json` (no new Foundation version per fix); fixed nodes are listed in `changedSinceAssurance` and checked by the T8 gate's accuracy question.
- T8 gate (step 3, PR #452) runs under the fast-path rules: per section, software first (dependency freshness, item coverage, prerequisite closure), fixed checklist, rule-decided blocking, 3 retries, two-round limit, Founder escalation. Ledger: `content-factory/runs/aqa-7132-course-gate/`.
- The T8 package (mapping → Course Truth → Exam Truth → runtime adapter → review bundle) is built from the current Foundation (v0.8), with no hard-coded fingerprints. The course node set is mapped nodes plus prerequisites (79 nodes; BUS-MKT-001 restored), which resolves old T8 finding 1.
- T8 last result: **`ai_assured`, can progress** (30 September, GitHub Actions run 36790228166 on commit 7cd13ee). Software checks and the official-source check passed. Of 42 sections: 32 passed, 10 passed with logged notes (8 out of scope, 2 weak citation: 3.6.2 and 3.9.2), 0 blocking, 0 escalated, 0 failed. Blockers went 12 → 8 → 3 → 3 → 0 over five runs; every finding was verified against the text and fixed additively in `FAST_PATH_FIXES.json`. "AI-assured" means it passed the fixed AI checklists, not that an expert has checked it. Lee will have all content reviewed by a person once it is finalised and live on the website, in context (1 October); Claude audited the UK-law wording (redundancy, Equality Act 2010, trade unions, patents and copyright) and fixed one overstatement.
- Learn + Practice is built for the whole AQA 7132 course under the current model: first 3.5 slice plus the remaining course batches/top-up, with the 1 October all-batch run accepting 74/74 generated nodes. None has qualified-human approval yet; Lee will arrange a person to review the finished course in context on the live site.
- AQA 3.5 exam questions are complete: 14/14 accepted in run 36830719185 and committed under `content-factory/slices/aqa-7132-3.5/questions/` with their evidence ledger.
- The first all-batch question run for the rest of 7132 (run **36857736736**, 1 October, main commit `18c2e713`) stopped short after the OpenAI API account ran out of credits. It still accepted **128/231** planned questions: 3.1–3.2 13/51, 3.3 27/32, 3.4 10/43, 3.5-topup 8/9, 3.6 28/28, 3.7 14/37, 3.8–3.9 16/18, 3.10 12/13. Conservative recorded spend was about **$23.82** across the eight jobs. Most later failures were provider HTTP 429 `no credits remaining`, not content findings.
- That run exposed three runner defects now being corrected in PR #478: accepted questions were generated again before review-ledger reuse could apply; concurrent provider calls let batch 3.4 record $6.247 against the $6 ceiling; and three items that had reached two blocking AI review rounds were not yet surfaced as Founder escalations. The fix uses exact-fingerprint resume evidence from a prior main run, the existing shared provider-budget reservation wrapper, and stops two-round items before another provider call.
- Three question items need a Founder decision after two AI review rounds: 3.8–3.9 q04 (takeover question does not actually require takeover knowledge and its mark scheme is too narrow), 3.8–3.9 q07 (the question gives away synergy), and 3.10 q09 (it assesses crisis management although the supplied teaching does not teach crisis management). Do not start a third AI review round on these.
- Only an OpenAI key is configured; the second-provider reviews in the process are not yet possible. The OpenAI API account also needs usable credit before the remaining question work can resume.

## The plan

1. ~~Lock in the fast-path process (ADR-0029, process doc, this file).~~ Done 30 September 2026.
2. ~~Item-level coverage: split the 42 requirements into named items; add a software check that each is taught by a node.~~ Done 30 September 2026 (PR #448).
3. ~~Put the rules into the assurance scripts: fixed reviewer checklists, blocking vs logged findings, two-round limit, escalation list, item-level failure handling.~~ Done for the T8 gate 30 September 2026 (PR #452); later stages reuse `src/content-factory/fast-path-review.ts`.
4. ~~Rerun the T8 gate under the new rules and resolve the open findings.~~ Done 30 September 2026 (run 36790228166, `ai_assured`).
5. **Built, awaiting Lee's final in-context human review:** AQA 3.5 (financial performance) is complete through Blueprint, Learn, Practice and 14 exam-style questions with marking. Learn + Practice run 36828203219 accepted 12/12 ($0.68); questions run 36830719185 accepted 14/14 ($0.61). The whole 3.5 slice cost $1.29 of AI spend. Nothing has qualified-human approval yet; Lee will have a person review all content in context on the live site once the course is finalised.
6. **In progress:** complete the rest of AQA 7132. Learn + Practice is done (run 36852926789: 74/74 accepted, about $4.40). Question plans are committed for 231 remaining questions. First question run 36857736736 accepted 128/231 before API credit exhaustion. PR #478 hardens resume and spend enforcement so a resumed run can reuse exact-fingerprint accepted work instead of regenerating it. Before resuming: (a) merge #478 after Founder approval and green CI; (b) restore usable OpenAI API credit; (c) obtain Lee's decisions on the three two-round question escalations; then rerun with `batch=all` and `resume_run_id=36857736736`, commit all accepted questions/evidence, build whole-paper mocks and run the final T8 gate rerun.
7. Start a second Business board and measure reuse.

Keep a single run log at `content-factory/RUN_LOG.md`: one line per fix or decision (date · item · what · why · which check).

## Switching between AI tools

Lee uses more than one AI tool (currently Claude and ChatGPT/Codex) and must be able to stop in one and pick up in another at any point. The repo, not any chat history, is the shared memory. So:

1. **Start from the repo.** Begin every session by reading this file, the Fast-Path Process doc and the latest entries in `content-factory/RUN_LOG.md`, then check `main` and open PRs. Do not rely on what a previous chat said.
2. **Log as you go.** Every fix or decision gets one line in `RUN_LOG.md` (`date · item · what · why · which check`) in the same PR as the change, so a session that stops suddenly still leaves a trail.
3. **Finish on something pushed.** End every session with the work on a pushed branch or open PR, never only on a local machine or in a chat. If work is unfinished, add a run log line starting `HANDOVER ·` saying what is done, what is next, and the branch or PR name.
4. **Keep "Current state" current.** When something significant lands (a gate result, a version merged, a slice finished), update the "Current state" section above in the same PR.
5. **Same rules, whichever tool.** The rules above apply unchanged. A new tool is not a reason to revisit the architecture or the process.

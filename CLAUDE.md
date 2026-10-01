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

- Business Subject Foundation: 81 nodes in 9 domains, current version v0.8 (plus the BUS-PEO-010 fix, PR #447). The old v0.8 reassurance loop is closed; accuracy of changed nodes is checked inside the T8 gate.
- AQA 7132 mapping: 42 requirements at specification-subsection level (3.1.1, 3.5.4 …), all mapped to nodes. Item-level coverage is 344/344 with no gaps.
- PR #478 is merged. It added the Founder-decided question fixes: takeover-specific teaching in BUS-FND-007, explicit synergy teaching in BUS-FND-008, and crisis-management teaching in BUS-STR-009; it also made the question runner resumable from exact-fingerprint prior-run evidence, enforced the $6 batch ceiling under concurrency, and preserved the two-review-round escalation rule.
- Fresh T8 exact-course assurance after those Foundation fixes **passed** on approved main `d7b08d2d62ecba886f72bee6a42a7acb21dc6ca8`, GitHub Actions run **36870063233**. Result: `ai_assured`, 31 sections passed, 11 passed with logged non-blocking notes, 0 blocking, 0 escalated, 0 failed; official AQA source check passed; conservative provider spend about **$1.04** of the $12 cap. Exact-course Foundation fingerprint: `adebfcea045279cf82dd9b99a7e0ef1cbd03403d31ea09535d160be45f89a07d`; Subject Foundation fingerprint: `f5477c3abeca4ddfa145d89a849ae479adcb90e7fbfa1d9dcc64eda2f8bb7a94`.
- That T8 run re-reviewed all 42 sections (`reused_unchanged = 0`) because no previous course-gate ledger had been retained in the repo. PR #479 retains the fresh ledger plus a proof receipt so future exact-fingerprint T8 reuse has durable evidence.
- Learn + Practice is built for the whole AQA 7132 course: 74/74 generated nodes accepted in run 36852926789 (about $4.40), plus the original 3.5 slice. The three Foundation changes make only BUS-FND-007, BUS-FND-008 and BUS-STR-009 dependency-stale. PR #479 changes the Learn + Practice runner to reuse a committed accepted asset **before generation** when the exact current fingerprint still matches; therefore the required refresh is only batches **3.8-3.9** and **3.10**, with unchanged sibling nodes reused. No content has qualified-human approval yet; Lee will arrange a person to review the finished course in context on the live site.
- AQA 3.5 exam questions are complete: 14/14 accepted in run 36830719185 and committed under `content-factory/slices/aqa-7132-3.5/questions/` with their evidence ledger.
- The first all-batch question run for the rest of 7132, run **36857736736**, accepted **128/231** planned questions before API credit exhaustion. Per batch accepted/planned: 3.1–3.2 13/51, 3.3 27/32, 3.4 10/43, 3.5-topup 8/9, 3.6 28/28, 3.7 14/37, 3.8–3.9 16/18, 3.10 12/13. Recorded spend was about $23.82. OpenAI API credit is restored.
- The three two-round question escalations are decided `fix` by Lee and implemented upstream. After the affected Learn + Practice refresh is accepted and committed, resume Questions with `batch=all` and `resume_run_id=36857736736`; unchanged accepted questions should be reused, while stale/unresolved ones are regenerated and reviewed.
- Only an OpenAI key is configured; the second-provider reviews in the process are not yet possible.

## The plan

1. ~~Lock in the fast-path process (ADR-0029, process doc, this file).~~ Done 30 September 2026.
2. ~~Item-level coverage: split the 42 requirements into named items; add a software check that each is taught by a node.~~ Done 30 September 2026 (PR #448).
3. ~~Put the rules into the assurance scripts: fixed reviewer checklists, blocking vs logged findings, two-round limit, escalation list, item-level failure handling.~~ Done for the T8 gate 30 September 2026 (PR #452); later stages reuse `src/content-factory/fast-path-review.ts`.
4. ~~Freshly assure the exact course after the takeover/synergy/crisis Foundation fixes.~~ Done 1 October 2026 (run 36870063233, `ai_assured`).
5. **Built, awaiting final in-context human review:** AQA 3.5 is complete through Blueprint, Learn, Practice and 14 exam-style questions with marking. Learn + Practice run 36828203219 accepted 12/12 ($0.68); questions run 36830719185 accepted 14/14 ($0.61).
6. **In progress:** finish AQA 7132. Get PR #479 green and Founder-approved; after merge run Learn + Practice only for `3.8-3.9` and `3.10`, confirm exact-fingerprint reuse of unchanged nodes and commit the refreshed BUS-FND-007/BUS-FND-008/BUS-STR-009 assets/evidence. Then resume Questions with `batch=all`, `resume_run_id=36857736736`, commit the final accepted questions/evidence, build whole-paper mocks, and run the final release assurance needed by the fast path.
7. Start a second Business board and measure reuse.

Keep a single run log at `content-factory/RUN_LOG.md`: one line per fix or decision (date · item · what · why · which check).

## Switching between AI tools

Lee uses more than one AI tool (currently Claude and ChatGPT/Codex) and must be able to stop in one and pick up in another at any point. The repo, not any chat history, is the shared memory. So:

1. **Start from the repo.** Begin every session by reading this file, the Fast-Path Process doc and the latest entries in `content-factory/RUN_LOG.md`, then check `main` and open PRs. Do not rely on what a previous chat said.
2. **Log as you go.** Every fix or decision gets one line in `RUN_LOG.md` (`date · item · what · why · which check`) in the same PR as the change, so a session that stops suddenly still leaves a trail.
3. **Finish on something pushed.** End every session with the work on a pushed branch or open PR, never only on a local machine or in a chat. If work is unfinished, add a run log line starting `HANDOVER ·` saying what is done, what is next, and the branch or PR name.
4. **Keep "Current state" current.** When something significant lands (a gate result, a version merged, a slice finished), update the "Current state" section above in the same PR.
5. **Same rules, whichever tool.** The rules above apply unchanged. A new tool is not a reason to revisit the architecture or the process.

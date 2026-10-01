# CLAUDE.md — Revision

Read this at the start of every session. It applies to every AI tool that works on this repo (Claude, ChatGPT, Codex or anything else); `AGENTS.md` points here.

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

- Follow `START_HERE.md`, `INDEX.md`, `AUTHORITY_HIERARCHY.md`, `KNOWLEDGE_ARCHITECTURE.md` and `70-ai-operating-system/AI Agent Constitution.md`.
- Work on a branch and open a PR for every governed change.
- **Stop before every merge.** Every merge into `main` needs Lee's explicit approval for that specific PR.

## The Content Factory process (fast path)

The governing process is `80-company-workflows/Content Factory Fast-Path Process.md`. Read it before any factory work. Summary:

- **The architecture is frozen** (ADR-0028): Subject Knowledge Foundation → Specification Mapping → Course Truth + Exam Truth → exact-course gate → Learning Blueprint → Learn + Practice → exam questions → mocks → release.
- **Software proves what can be proven** before any AI review runs.
- **AI reviewers answer fixed checklists**, never "find anything wrong".
- **Only proven teaching errors block**: wrong fact or formula, missing examinable item, broken question or mark scheme. Weak citations, opinions and out-of-scope points are logged, not blocking.
- **Max two review rounds per item**, then escalate to Lee.
- **Failures stay small**: one failed item or AI call never stops a whole run; fixes recheck only what changed and its dependants.

## Rules for you

1. Do not propose architecture changes unless a check has failed because of the architecture. Name the failed check.
2. Do not write new standards, amendments or ADRs to fix a single defect. Log the fix in one line in the run log.
3. Do not ask an AI reviewer to "find any problems". Use the fixed checklist for that stage.
4. Do not treat a weak citation as blocking. Log it for the next source batch.
5. Do not start a third review round on the same issue. Add it to the escalation list for Lee.
6. Do not regenerate or re-review anything whose inputs have not changed.
7. Do not let one failed AI call stop a run. Retry up to 3 times, mark that item failed, continue.
8. Prefer a software check over an AI judgement whenever the answer can be computed or looked up.
9. When unsure whether something blocks, ask: would a student learn something wrong, or miss something examinable? If not, it does not block.
10. AQA material stays `REFERENCE_ONLY`: use it to establish requirements and assessment structure, never as teaching copy, and never paraphrase past-paper questions.

## Where things are

| What | Where |
| --- | --- |
| Fast-path process (governing) | `80-company-workflows/Content Factory Fast-Path Process.md` |
| Architecture decision | `decisions/ADR-0028-subject-knowledge-foundation-and-course-projection.md` |
| Trial stages T1–T12 | `docs/technical/Content Factory Subject Foundation Trial.md` |
| Exact-course gate (T8) | `docs/technical/Content Factory AQA Exact-Course Assurance.md` |
| Durable resume and spend implementation | `docs/technical/Content Factory Durable Resume and Spend.md` |
| Business Subject Foundation versions | `research/business-subject-foundation/` |
| AQA 7132 specification mapping | `research/aqa-business-7132/2027/SPECIFICATION_MAPPING.mjs` |
| T8 deterministic package | `scripts/assurance/materialise-aqa-business-7132-exact-course-assurance.mjs` |
| T8 gate runner | `scripts/assurance/aqa-business-7132-exact-course-assurance-proof.test.ts`, `scripts/assurance/aqa-business-7132-course-gate.ts` |
| Fast-path review rules | `src/content-factory/fast-path-review.ts` |
| AQA 7132 named items / coverage | `research/aqa-business-7132/2027/NAMED_ITEMS.json`, `scripts/assurance/check-aqa-business-7132-item-coverage.mjs` |
| Run log | `content-factory/RUN_LOG.md` |

How the eight pipeline steps map to the trial stages: 1 Foundation = T2–T3 · 2 Spec mapping = T4–T5 · 3 Course + Exam Truth = T6–T7 · 4 Course gate = T8 · 5 Blueprint = T9 · 6 Learn + Practice = T10 · 7–8 Exam questions and mocks = T11 · Release = T12.

## Current state (as of 1 October 2026 — verify on `main` before acting)

- **Approved main:** PR #485 is merged at `8cec0445adaeddef72cdd0504cd32bb8b7ce7052`. It retains the targeted Learn + Practice refresh outputs/evidence after integrating the newer learner-design work. Always inspect the current head before integration.
- **Business Subject Foundation:** 81 nodes in 9 domains, v0.8 plus additive fast-path overlays. `QUESTION_ESCALATION_FIXES.json` deepens BUS-FND-007 (takeover-specific failure mechanisms), BUS-FND-008 (synergy definition/mechanisms) and BUS-STR-009 (crisis management). Current Subject Foundation fingerprint is `f5477c3abeca4ddfa145d89a849ae479adcb90e7fbfa1d9dcc64eda2f8bb7a94`.
- **AQA 7132 mapping:** 42 specification subsections; item-level coverage remains 344/344 with no gaps.
- **Fresh T8 proof:** run 36870063233 on `d7b08d2` is `ai_assured`, `can_progress=true`: 31 passed, 11 logged, 0 blocking, 0 escalated, 0 failed; official AQA source check passed; conservative spend $1.041614. PR #481 persists its ledger/receipt for future exact-fingerprint reuse.
- **Learn + Practice original whole-course build:** run 36852926789 accepted 74/74 nodes for about $4.40.
- **Learn + Practice targeted refresh:** runs **36886805167** (batch 3.8-3.9) and **36886951118** (batch 3.10) ran on `c60fac84`. The live resume path behaved exactly as designed: **7 unchanged nodes were reused without re-review and only 3 stale nodes were regenerated/reviewed**. BUS-FND-007, BUS-FND-008 and BUS-STR-009 all passed; across both batches 10/10 nodes are accepted with 0 blocking, 0 escalated and 0 failed. Conservative spend was **$0.152482 + $0.06866 = $0.221142**. PR #485 committed the refreshed assets, ledgers and proof receipts to `main`.
- **AQA 3.5 questions:** complete, 14/14 accepted in run 36830719185 and committed.
- **Remaining course questions:** first all-batch run **36857736736** on old main `18c2e713` accepted **128/231** before provider credit exhaustion. Conservative recorded spend was about **$23.82**. PR #478 added exact-fingerprint artifact resume, concurrency-safe $6 batch reservations, correct two-round escalation handling and the three Founder-approved fixes. OpenAI API credit has been restored.
- **3.5-topup q04 deterministic defect:** run 36857736736 generated a correct market-capitalisation MCQ (18,000,000 × £3.40 = £61,200,000; option C `£61.20 million`) but the numeric checker read `61.20 million` as `61.20`, creating a false software blocker before any AI review. PR #488 fixes magnitude-word normalisation and allows an exact-fingerprint prior latest candidate blocked only by obsolete software to skip regeneration/blind answering while still receiving a fresh AI review. Do not repurchase q04 generation if that recovery proof holds.
- **Question escalations are resolved:** 3.8-3.9 q04 (takeover), q07 (synergy) and 3.10 q09 (crisis management) are Founder-decided `fix`, recorded against their exact prior fingerprints. Changed inputs may receive a fresh review; do not reopen the same dispute on unchanged inputs.
- **Human review:** no course content has qualified-human approval yet. Lee will arrange a person to review the finished course in context on the live site.
- **Second provider:** only OpenAI is configured; second-provider checks in the process cannot yet run.

## The plan

1. ~~Lock in the fast-path process.~~ Done.
2. ~~Split the AQA course into named items and prove item-level coverage.~~ Done: 344/344.
3. ~~Implement fixed-checklist fast-path assurance.~~ Done.
4. ~~Pass the exact-course T8 gate.~~ Fresh proof after PR #478: run 36870063233, `ai_assured`.
5. ~~Build the complete AQA 3.5 proof slice.~~ Done: Learn + Practice + 14 AQA-style practice questions.
6. **In progress — finish AQA 7132:**
   - ~~make Learn + Practice refresh incremental and merge PR #481;~~ done;
   - ~~run targeted Learn + Practice refresh for 3.8-3.9 and 3.10;~~ done: seven reused, three refreshed, 10/10 accepted;
   - ~~commit and merge the three refreshed Learn + Practice assets plus their new ledgers/proofs;~~ done: PR #485;
   - fix and merge PR #488 so the known 3.5-topup q04 magnitude-format false blocker is cleared without repurchasing unchanged generation/blind-answer work;
   - resume Questions with `batch=all` and `resume_run_id=36857736736`; unchanged accepted questions must be reused, while stale/unresolved work is generated/reviewed;
   - commit the final accepted question set and evidence;
   - build whole-paper mocks and prove the course-wide quantitative/exam-structure constraints;
   - run the final release assurance required by the pipeline.
7. Start a second Business board and measure Foundation reuse.

Keep a single run log at `content-factory/RUN_LOG.md`: one line per fix or decision (`date · item · what · why · which check`).

## Design system (learner app)

All UI must follow `20-brand-and-experience/` and `docs/design-system/`. Use tokens and `src/app/ui/` components only. Colour roles never mix: teal = brand, REV and actions; teal/yellow/coral/neutral = status (always icon + text); subjects = the subject palette + letter mark. Progress = Topics covered · Understanding · Exam readiness, never one %. Scroll down, never sideways.

Decisions and behaviour rules for the learner app are in `docs/design/decisions/2026-10-01-learner-redesign-v2.md`. Follow them, and ask Lee before changing them.

- The design package and build tracker are in `docs/design/learner-redesign-v2/` (start at `00-START-HERE.md`; progress in `STATUS.md`). Update `STATUS.md` in every redesign PR.
- Honest data only: never hard-code numbers, names, dates or topics from mockups. If the data does not exist yet, show the honest empty state. Never fake REV: no canned replies and no made-up suggestions.
- No raw hex colours outside `src/app/brand-tokens.css` (checked by `scripts/design-guardrails/`). No learner page may scroll sideways (checked by `tests/e2e/horizontal-scroll.spec.ts`).
- Design decisions are logged in `STATUS.md`. `content-factory/RUN_LOG.md` is for Content Factory work.

## Switching between AI tools

Lee uses more than one AI tool and must be able to stop in one and pick up in another at any point. The repo, not chat history, is the shared memory.

1. **Start from the repo.** Read this file, the Fast-Path Process and the latest `content-factory/RUN_LOG.md` entries, then check `main` and open PRs.
2. **Log as you go.** Every fix or decision gets one run-log line in the same PR.
3. **Finish on something pushed.** End with work on a pushed branch or open PR. If unfinished, add a `HANDOVER ·` run-log entry.
4. **Keep Current state current.** When a significant gate result, version or slice lands, update this section in the same PR.
5. **Same rules, whichever tool.** Changing AI tools is not a reason to revisit the architecture or process.

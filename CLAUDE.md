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

## How approval and merging work (Founder process, 1 October 2026)

The AI does all the development and GitHub work. Lee only reviews and approves. The steps, in order:

1. **You do the work.** Build it on a branch, open a PR (as a draft), run the checks, and fix anything that fails. Do not ask Lee to do GitHub tasks.
2. **You get the PR ready.** Bring the branch up to date with `main`, wait for CI to go green on the final commit, and take the PR out of draft only at the approval step below.
3. **You ask for approval.** Tell Lee, in plain English, exactly what changed (what a student or the business will notice), with before/after screenshots where the screen changed, how you checked it, what is left, and any decision needed. Give the PR link and the exact commit.
4. **Lee reviews and replies "approved" in the chat**, naming the PR (or answering your approval question for that PR). Nothing else counts: a reply about something else, silence, "continue", passing tests or a green check is not approval.
5. **You register it and merge.** Post the `revision-founder-approval:v1` comment (with `head_sha: <full 40-character commit>`) on the PR for that exact commit, confirm the `revision/founder-approval` check passes, take the PR out of draft and merge.

Limits that always apply:

- **Approval is per PR and per commit.** If you push anything after Lee approves (including merging `main` in), CI runs again on a new commit. If the change is only `main` coming in and touches nothing Lee reviewed, you may register his approval on the new commit and must say so in your report. Anything else needs a new approval.
- **Never approve your own work.** You relay Lee's approval; you do not give it. Never post the approval comment before Lee has said "approved" in the chat for that PR.
- **Visual baselines** are updated only after Lee says OK to the before/after screenshots, with a dated comment noting his approval, using digests from CI's browser.
- **Governance changes** (this section, `AUTHORITY_HIERARCHY.md`, standards) go in their own PR and are approved the same way.
- **Lee can revoke this at any time** by saying so in the chat. From then on, he posts the approval comment himself.

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
| Latest AQA 7132 question remediation | `docs/technical/Content Factory AQA 7132 Question Run 369256 Remediation.md` |
| Business Subject Foundation versions | `research/business-subject-foundation/` |
| AQA 7132 specification mapping | `research/aqa-business-7132/2027/SPECIFICATION_MAPPING.mjs` |
| T8 deterministic package | `scripts/assurance/materialise-aqa-business-7132-exact-course-assurance.mjs` |
| T8 gate runner | `scripts/assurance/aqa-business-7132-exact-course-assurance-proof.test.ts`, `scripts/assurance/aqa-business-7132-course-gate.ts` |
| Fast-path review rules | `src/content-factory/fast-path-review.ts` |
| AQA 7132 named items / coverage | `research/aqa-business-7132/2027/NAMED_ITEMS.json`, `scripts/assurance/check-aqa-business-7132-item-coverage.mjs` |
| Run log | `content-factory/RUN_LOG.md` |

How the eight pipeline steps map to the trial stages: 1 Foundation = T2–T3 · 2 Spec mapping = T4–T5 · 3 Course + Exam Truth = T6–T7 · 4 Course gate = T8 · 5 Blueprint = T9 · 6 Learn + Practice = T10 · 7–8 Exam questions and mocks = T11 · Release = T12.

## Current state (as of 1 October 2026 — verify on `main` before acting)

- **Approved main at the start of the current remediation:** `f284141017a897509da6a6dfe345bd844155e03b` (PR #487, learner redesign Home). Main has since advanced independently; always inspect the current head and reconcile before integration.
- **PR #488 is merged:** magnitude-word number normalisation and exact-fingerprint recovery for a prior software-only blocked question are on main. Live run 36925676050 proved the 3.5-topup q04 recovery path: retained generation/blind-answer evidence was reused and q04 received its required fresh review rather than being regenerated.
- **Business Subject Foundation before the current branch:** 81 nodes in 9 domains, v0.8 plus additive fast-path overlays. The last assured Foundation fingerprint was `f5477c3abeca4ddfa145d89a849ae479adcb90e7fbfa1d9dcc64eda2f8bb7a94`.
- **AQA 7132 mapping:** 42 specification subsections; item-level coverage remains 344/344 with no gaps.
- **Fresh T8 proof before the current four Foundation changes:** run 36870063233 on `d7b08d2` is `ai_assured`, `can_progress=true`: 31 passed, 11 logged, 0 blocking, 0 escalated, 0 failed; official AQA source check passed; conservative spend $1.041614. PR #481 persists its ledger/receipt for exact-fingerprint reuse.
- **Learn + Practice original whole-course build:** run 36852926789 accepted 74/74 nodes for about $4.40.
- **Learn + Practice targeted refresh after the first question escalations:** runs 36886805167 (3.8-3.9) and 36886951118 (3.10) reused seven unchanged nodes and regenerated/reviewed only BUS-FND-007, BUS-FND-008 and BUS-STR-009; 10/10 accepted; spend $0.221142. PR #485 persisted the refreshed assets/evidence.
- **AQA 3.5 questions:** complete, 14/14 accepted in run 36830719185 and committed.
- **Latest remaining-course question run:** run **36925676050** on main `f284141` resumed from run 36857736736 and accepted **219/231**. It reused **116** unchanged accepted questions without re-review. Fully complete batches: 3.6 (28/28), 3.8-3.9 (18/18) and 3.5-topup (9/9). Conservative spend was about **$4.49**.
- **Twelve unresolved questions from run 36925676050:** two are deterministic checker defects (3.1-3.2 q03 signed currency; 3.3 q02 explicit million-unit input matching). Ten reached the two-review limit. On 1 October Lee chose **fix all ten**. Exact source fingerprints and notes are recorded in `content-factory/runs/aqa-7132-question-founder-decisions.json`.
- **Current governed remediation:** PR #491 / branch `fix/aqa-7132-question-run-369256-remediation`. It adds four source-bound Foundation fixes (BUS-FND-001, BUS-FND-009, BUS-OPS-001, BUS-STR-009), six question-only Founder correction constraints, the two deterministic checker repairs, regressions, run-log evidence and technical documentation. The four Foundation changes require fresh T8 assurance and targeted Learn/Practice refresh before dependent questions resume.
- **Human review:** no course content has qualified-human approval yet. Lee will arrange a person to review the finished course in context on the live site.
- **Second provider:** only OpenAI is configured; second-provider checks in the process cannot yet run.

## The plan

1. ~~Lock in the fast-path process.~~ Done.
2. ~~Split the AQA course into named items and prove item-level coverage.~~ Done: 344/344.
3. ~~Implement fixed-checklist fast-path assurance.~~ Done.
4. ~~Pass the exact-course T8 gate.~~ Last fresh proof before current changes: run 36870063233, `ai_assured`.
5. ~~Build the complete AQA 3.5 proof slice.~~ Done: Learn + Practice + 14 AQA-style practice questions.
6. **In progress — finish AQA 7132:**
   - ~~make Learn + Practice refresh incremental and persist the first targeted refresh;~~ done;
   - ~~merge PR #488 and prove the 3.5-topup q04 software-only recovery live;~~ done;
   - ~~resume Questions from run 36857736736;~~ done: run 36925676050 reached 219/231 accepted;
   - **current:** get PR #491 current with main, green and Founder-approved/merged;
   - after that merge, run fresh T8 assurance for the four changed Foundation nodes/affected sections;
   - refresh Learn + Practice only for BUS-FND-001 and BUS-FND-009 (3.1-3.2), BUS-OPS-001 (3.4) and BUS-STR-009 (3.10), preserving exact-fingerprint reuse elsewhere;
   - commit/merge the refreshed Learn + Practice assets and evidence;
   - resume Questions with `batch=all` and **`resume_run_id=36925676050`** so the 219 accepted questions are preserved and only changed/unresolved work is purchased;
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

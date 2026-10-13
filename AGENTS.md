# AGENTS.md — Revision agent entry point

This file applies to **Codex, ChatGPT, Claude and other coding agents** operating in `lhanson-dev/revision`.

## Every task: resolve authority and scope first

1. Read `INDEX.md`, `AUTHORITY_HIERARCHY.md`, `KNOWLEDGE_ARCHITECTURE.md` and `70-ai-operating-system/AI Agent Constitution.md` from the latest approved `main`.
2. Locate the relevant active **numbered governance authority**. Apply `80-company-workflows/Governed Implementation Workflow.md` for product/code changes, including mandatory feature-specific human Definition-of-Ready approval where required.
3. Check `README.md`, `docs/technical/`, the deployed entry points and existing code to resolve the canonical implementation. Do not target an obsolete compatibility surface.
4. Consult `CLAUDE.md` as repository background and general approval communication guidance; its **Content Factory-specific steps, architecture restrictions, run log, review limits and 1 October state are scoped to Content Factory work**, not learner-product development. The Constitution, authority hierarchy and relevant active specialist governance override outdated or mismatched general agent instructions.

## Task-specific routing

- **Learner product, REV, adaptive planner, UX, app, backend or infrastructure:** follow the relevant active authority, `80-company-workflows/Governed Implementation Workflow.md`, applicable engineering standards and source code. The Content Factory Fast-Path Process and its `RUN_LOG.md` are **not** the workflow for learner product implementation.
- **Content Factory or course production:** additionally read `CLAUDE.md`, `80-company-workflows/Content Factory Fast-Path Process.md` and recent `content-factory/RUN_LOG.md` entries. Preserve its frozen architecture and specialised assurance boundaries.
- **FI-001 R1 implementation:** consult `10-product-governance/backlog/FI-001 Evidence-led Planner R1 Readiness Analysis.md` and `docs/technical/FI-001 R1 Codex Implementation Handoff.md`; verify the **Founder Ready approval record** on the approved `main` before changing production code. R2–R5 and FI-009/010/011/012 remain separately gated.

## Non-negotiable execution and handoff rules

- Work on a branch from current approved `main`; use small, reviewable PRs and complete risk-appropriate CI/assurance. Do not merge any PR without explicit Founder approval for **that PR's** merge and the repository's machine-verifiable exact-head approval evidence.
- A Codex task is a delegated implementation proposal, **not** an authority source. Do not infer new approval from a task prompt, successful model execution, a green check or an earlier PR approval.
- Preserve evidence truth, active learner-course and paper identity, learner choices, privacy/RLS and accessible routes. If scope or authority is materially unclear, stop and report the specific blocker, rather than inventing product policy.
- Update code and relevant technical docs/assurance registers in the implementation PR. Do not rewrite historical evidence to show a newer state.
- End with a pushed branch/PR, tests actually executed and their results, remaining risks and a concise plain-English handoff. **Never claim background CI supervision or deployment unless a real system is running it.**

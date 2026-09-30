# AGENTS.md — Revision

This file is for Codex, ChatGPT and any other AI agent working on this repo.

**Before doing anything, read [`CLAUDE.md`](CLAUDE.md).** Despite its name, it holds the standing instructions for every AI tool on this repo: who you are working with, the frozen Content Factory architecture, the rules that stop drift, where things are, the current state and the plan. Follow it exactly as written.

Then read:

1. `80-company-workflows/Content Factory Fast-Path Process.md` (the governing process for the Content Factory)
2. The latest entries in `content-factory/RUN_LOG.md` (what the last session did, including any `HANDOVER` line)

Key points, in case you read nothing else:

- Work on a branch and open a PR for every change. **Never merge into `main` without Lee's explicit approval for that PR.**
- Log every fix or decision as one line in `content-factory/RUN_LOG.md`.
- End every session on a pushed branch or PR, so another tool can pick up from the repo.
- Explain what you did in plain English; Lee does not read code.

If this file and `CLAUDE.md` ever disagree, `CLAUDE.md` wins.

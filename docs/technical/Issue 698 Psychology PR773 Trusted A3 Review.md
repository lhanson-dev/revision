# Issue #698 — Trusted independent Psychology Social Influence Practice A3 reviewer

**Status:** Proposed infrastructure on governed branch; NOT available on approved main until this separate reviewer PR passes CI and receives specific Founder approval.

## Why a separate reviewer is needed

[Draft content PR #773](https://github.com/lhanson-dev/revision/pull/773) adds eight original single-option scored scenario questions and four self-check written drills for AQA Psychology 7182 v1.4, §4.1.1 printed p17. An A2 pass for PR #768 reviewed teaching only; the existing PR #759 and #768 trusted reviewers are hard-bound to other content and cannot certify these A3 questions, keys or model answers.

## Exact-head and security contract

Approved-main-only workflow `.github/workflows/psychology-pr773-a3-review.yml` executes `scripts/assurance/psychology-pr773-a3-review.mjs`, with offline validation in `scripts/assurance/psychology-pr773-a3-review.node-check.mjs`.

After this reviewer is approved and merged, the executing agent can post **only on PR #773**, using the authenticated GitHub Founder account:

```text
revision-run-psychology-social-influence-practice-a3:v1
head_sha: <exact 40-character PR773 head SHA>
```

That comment is a **review trigger**, not merge approval. The workflow requires issue PR number 773, Founder OWNER association, exact two-line marker, same-repository open PR targeting main, matching exact PR head, and trusted workflow `GITHUB_SHA` equal to approved `main`. Unmerged source is fetched through read-only GitHub API by six fixed allowlisted paths, each Git blob SHA independently verified. The workflow **never checks out or executes PR #773 code under the secret**.

A fresh isolated `gpt-5.6-terra` Responses review (`store=false`) independently checks all **12 assets**, with **eight required dimensions**, schema-checked issue register and explicit `pass` vs `fail_hold`; material/blocking findings stop the review. The protected provider API key is restricted to the approved-main reviewer job; a conservative preflight cost budget caps model spend at **USD $0.50**; artifacts are retained for 30 days. Missing keys, invalid claims, stale head, incorrect item IDs/paths, malformed JSON or provider errors fail closed.

## Scope and nonclaims

**Exact AQA source:** Founder-supplied 38-page A-level Psychology 7182 version 1.4, 1 September 2025, SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`; Section 4.1.1 p17, **REFERENCE_ONLY**. Protected original PDF text is not transmitted to the model. Review must challenge all eight original scenario/options/keys/wrong-choice reasons, source-target mapping and all four self-checked writing prompts/models, including no fabricated written marks. A correctly selected MCQ option does not establish complete AO2/AO3 constructed responses, skill mastery, or all 21 Social Influence provisional atoms.

An AI A3 pass **does not** establish that the reviewer independently opened the original AQA PDF, provide qualified examiner signoff, verify authentic signed-in learner results or complete the full #698 audit. Any changed learner Practice candidate needs a fresh exact-head educational review. PR #773 separately requires full current-main CI and explicit Founder merge approval.

## Documentation impact

This indexed note, exact-head reviewer runner, offline tests and workflow are the entire reviewer PR. **No learner-facing changes, database/schema, evidence engine or normative authority changes**; historical PR #768 reviews are not rewritten. The tooling PR must be merged before the independently reviewed student-content PR can be eligible for a separate merge decision.

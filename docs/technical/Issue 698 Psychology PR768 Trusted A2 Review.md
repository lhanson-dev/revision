# Issue #698 — Restricted Psychology PR #768 independent A2 educational review

**State:** proposed trusted infrastructure only. It is not on approved `main` until this separate governed PR receives Founder-specific approval and merges. It cannot itself approve learner content.

## Why

The learner correction [PR #768](https://github.com/lhanson-dev/revision/pull/768) adds original A2 teaching to all four existing Social Influence Learn pages. Correct source crosswalks and build/tests cannot replace the independently challenging A2 review required by `80-company-workflows/Content Accuracy Assurance Gate.md`. Current trusted Psychology PR #759 reviewer is hard-scoped to other Research Methods practice, and must not be misused as evidence.

## Execution and security

The trusted default-branch workflow `.github/workflows/psychology-pr768-a2-review.yml` calls `scripts/assurance/psychology-pr768-a2-review.mjs` with unit contract `scripts/assurance/psychology-pr768-a2-review.node-check.mjs`.

After this infrastructure is approved/merged, the executing agent posts on **PR #768** an exact Founder-account comment:

```text
revision-run-psychology-social-influence-a2:v1
head_sha: <exact current 40-char PR768 commit SHA>
```

This is a **review trigger, not a merge approval**. Only Founder `lhanson-dev` as `OWNER`, issue number 768, exact two-line marker and same-repository open PR to `main` are accepted. The runner checks its own GitHub SHA matches currently approved main. Every source file is fetched from the exact PR SHA using a read-only GitHub token, blob SHA independently checked, treated as **inert data only** (never checked out or executed under the model secret). The protected `OPENAI_API_KEY` is available only to the approved-main reviewer job. All inputs are allowlisted: the original Social Influence Learn addition; shared publishing Learn generator; original previously published Social Influence subject prototype; and the 21-atom provisional audit. No protected AQA PDF prose is provided to the model.

The reviewer is a **separate fresh-context** OpenAI `gpt-5.6-terra` model call with `store=false`, four exact reviewed IDs and eight mandatory dimensions, structured machine-validated issue register, model spend cap **USD $0.50**, bounded output, 30-day retained receipt. Missing key, moved head, wrong scope, bad blob, missing dimensions, invalid receipt, provider failure, overspend, or any material/blocking findings fail closed.

## Review scope and limits

AQA Psychology **7182 version 1.4, 1 September 2025**, Section **4.1.1 p17** (Founder-supplied PDF SHA256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`), rights **REFERENCE_ONLY**. It reviews all four `PSY-01-01..04` generated pages and checks: alignment/rights; Asch; Milgram variations; Authoritarian Personality; resistance; minority influence; A-level educational depth/accuracy; readability and non-overclaiming.

A successful AI A2 review **does not** independently open the protected original specification, prove full AO/skill coverage, verify qualified human expert or learner competence, or turn four topic MCQs into individually scored 21-subskill performance. It only supplies an adversarial fresh-context review of four scoped authoring corrections. If the exact PR head moves, rerun the A2 evidence and full engineering CI before Founder approval.

## Documentation impact

This technical note and INDEX pointer accompany the trusted reviewer. No site UI/content, score, schema, student data, database or normative authority changes; no release migration. Prior PR #759 independent review evidence and historical source audits remain unchanged. The reviewer PR itself must receive separate approval to merge; PR #768 then also requires separate Founder approval after educational assurance.

# LF-04 #810 — trusted independent A3 review for five Psychology case warm-ups

**Status (3 November 2026): reviewer-infrastructure candidate, unmerged, not installed, and NOT an A3 pass.** Content [PR #810](https://github.com/lhanson-dev/revision/pull/810) remains independent-educational-review HOLD. Original Workstream 3 feedback #765, curriculum/source assurance #698 and learner acceptance Workstream 5 remain open.

## Precise scope and source rights

The review covers the five **original, unscored** Psychology 7182 Case study warm-ups and all ten original prompts/author-guidance responses in `content/psychology/aqa-a-level/shared/cases.ts` on the *exact unmerged PR #810 head*. The reference authority is the Founder-supplied AQA A-level Psychology 7182 **v1.4 (1 September 2025, first A-level exams 2027)**, SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`, **REFERENCE_ONLY**. Its protected PDF prose is not transmitted to the reviewer. The worker receives short original topic/assessment requirement summaries under §§4.1.1–4.1.4 and 4.2.3.1, printed pp17–20.

This is an educational A2/A3 challenge for **unscored application contexts and guided explanations**, not a formal AQA exam marking pack, official AQA item, externally qualified educator approval, diagnostic evidence or a claim that all syllabus requirements have case practice.

## Trusted invocation (only after this infrastructure PR is approved and merged)

The Founder-owner may comment on the still-open content PR **#810** with exactly:

```text
revision-run-lf04-pr810-psychology-case-a3:v1
head_sha: <exact 40-character current PR #810 head SHA>
```

This comment is **review authorisation only**, not approval to merge PR #810. The trusted workflow listens for an OWNER-authenticated GitHub comment on exactly PR #810; it checks out approved `main` only and verifies that the event's main SHA remains current. It downloads *one exact-head original TypeScript file as inert text*, checks its Git blob SHA, parses the five `caseStudySchema.parse` literals via TypeScript AST without executing PR code, and rejects dynamic expressions, changed IDs/topics, unexpected extra fields or missing two-question guidance before spending provider tokens. Forks, stale or changed heads and malformed triggers fail closed.

After the provider-free contract tests, it uses two independent fresh model requests (no shared model conversation; `store=false`):
1. **Case and prompt challenge without authored guidance**, assessing five case narratives and ten original question demands, alternative accurate answers, syllabus fit, unobserved assumptions, and causal/diagnostic overclaims.
2. **Independent critique of the actual authored guidance**, assessing all ten model explanations, mistakes, fair alternate reasoning and instructional risk.

Both stages must return strict machine-readable individual `pass`/`minor`/`material`/`blocking` verdicts with substantive reasoning for five cases and ten questions. Any material/blocking issue, missing review, changed identity, provider failure or malformed receipt returns `FAIL/HOLD`; minor comments are retained for editorial disposition. The original source, prompt and explanations are never replaced automatically. A conservative **US$0.75 reviewer capacity reserve ceiling** is enforced before calls; it is not a claim of exact external billing. Only original Revision teaching cases are sent, no child/student account data, stored answers, API token or private course file.

The exact PR head, blob SHA, approved trusted runner SHA, source version/rights, two reviewer outputs, issue register and final `pass`/`fail_hold` are retained under `.artifacts/lf04-pr810-psychology-case-a3/` for 30 days. A green workflow without that matching PASS receipt is insufficient.

## Explicit release boundary and documentation impact

This infrastructure PR makes **no learner-facing, scoring, evidence, published content, account, Supabase, planner or schema change**. It does not consume provider budget merely by being reviewed in CI. Existing A3 authority is implemented, not amended; this technical note and INDEX pointer accompany the code/contract tests. Historical A1 findings and passed previous PR CI remain unchanged.

After the infrastructure PR passes review/CI and receives **specific Founder merge approval**, its trusted run may challenge the latest #810 content. If A3 passes and there are no unresolved material findings, #810 still needs fresh exact-head current-main CI, substantive review and its *own* specific Founder merge approval. If A3 fails or is not run, **#810 remains DRAFT/HOLD**. After any future approved production release, original learner acceptance and complete LF-04 question relevance remain separately open with Workstream 5 and #698.

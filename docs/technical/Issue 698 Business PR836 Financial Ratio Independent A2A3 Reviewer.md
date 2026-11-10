# #698 — trusted independent A2/A3 challenge for Business §3.7.2 PR #836

**8 November 2026. Reviewer-infrastructure candidate only; do not invoke against an unmerged reviewer workflow.**

## Scope, source and actual learner surface

The canonical learner application is `/revision/app/` → enrolled AQA A-level Business 7132 → Learn / Practice. Draft content PR [#836](https://github.com/lhanson-dev/revision/pull/836) adds one original six-ratio Learn method page and 12 originally authored, single-target, **one-mark typed final-number** Practice candidates in the existing shared course pack. It is not an alternate engine.

Source: Founder-uploaded original **AQA Business 7132 v2.0, 14 June 2023**, 42 pages; SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`, printed page **25**, **§3.7.2**. The section requires assessment of financial performance using balance sheets, income statements and the six named ratios: ROCE, current ratio, gearing, payables days, receivables days and inventory turnover; it includes the value of ratios, including over-time and business-to-business comparisons. The section names ratios but does not provide mandatory numerical formula wording, full marking tariffs or evidence that one correct final number establishes ratio understanding. **REFERENCE_ONLY** source: do not transfer protected PDF bytes or reproduce substantial official text to the review model.

## Why extend the trusted reviewer instead of treating tests as educational assurance

The existing approved-main Business A2/A3 reviewer is scope-allowlisted for PRs #777, #784, #805, #809 and #820. PR #836 has technical CI on its old head but lacks a fresh-context educational review, and its draft branch must be integrated with newer main and rerun. The Content Accuracy Assurance Gate requires independent A2 explanation and A3 original-assessment challenge; original author self-check is not independent educational approval. A complete course audit and qualified human examiner calibration remain separate.

This infrastructure-only change adds **only PR #836** to the existing OWNER-comment workflow and source/asset configuration, without weakening all existing guards, rights protections, cost ceilings, model context isolation or Git blob identity checks. It retains `store:false`, fixed seven review dimensions, `fail_hold` on material findings, exact source blob verification, independent 9/9 CI reading, trusted-main execution and 30-day machine-readable receipt. It never executes PR code with provider secrets.

The reviewer must independently inspect and recalculate **all 12** original final values and both worked examples, prompt clarity, formula denominators, decimals and formatting; compare two truly different prompts per exact source skill; verify the real three published paper-pack integrations, existing questionnaire context `3.7:q15–q20,q37`, and old scores and ID stability; and explicitly distinguish evidence of final-number correctness from financial-statement extraction, written working, ratio interpretation, longitudinal/peer evaluation and AO3/AO4. Every reviewed item and existing seven review dimensions must be returned with evidence or `fail_hold`. No false blanket section-level `adequate` claim is permitted.

## Trigger and release sequencing

1. Independently complete code review and CI of **this separate trusted infrastructure PR**; secure explicit **Founder approval for this PR's own merge**, then verify installation on `main`. Triggering before infrastructure merge will not work.
2. Complete #836 integration with then-current approved `main`; preserve content and historical student IDs, pass its full exact-head CI, and keep #836 draft while educational review is pending.
3. **Only after (1) and (2)**, repository owner `lhanson-dev` may request the review by posting an exact PR #836 Conversation comment:

```text
revision-run-business-marketing-a2a3:v1
head_sha: <current exact 40-character PR #836 head commit>
```

This is a *review request*, **not** merge approval. GitHub OWNER identity, current exact-head, main checkout, Git hash, source paths, published bank subset, CI and latest verified paper pack sources are required; otherwise the review fails closed. Fresh context/model cost cap is conservatively at most USD $0.85, without representing guaranteed provider billing. Return receipt is preserved and assessed, including any FAIL/HOLD; do not rewrite previous reviewer failures.

4. Resolve any material educational defects in **#836**, rerun exact-head CI and independent review. Obtain **separate explicit Founder approval for #836** only after its review and integration pass, then confirm production. WS4/WS5 must still authenticate a real learner's saved attempt, different independent recheck, feedback and Progress/Plan evidence before declaring learner readiness.

## Documentation impact

This candidate updates only the pre-existing trusted reviewer workflow, trusted reviewer script and its contract tests, plus this technical contract and INDEX pointer. No normative authority, learner content, source-licence status, historic review receipt or release approval is changed. Issue #698 remains open; #706/#813 continue to own authentic extended-writing requirements and A4 calibration.
